#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use std::fs;
use std::fs::File;
use std::io::{copy, Error};
use std::process::Stdio;

use tauri::{command, Manager};
use tokio::io::AsyncBufReadExt;

#[command]
async fn run_process(window: tauri::Window, path: String, version: String) {
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<String>();
    println!("path: {}", path);
    tokio::spawn(async move {
        let mut child = tokio::process::Command::new("java")
            .args(&["-jar", &path, "--rev", &version])
            .current_dir(&path)
            .stdout(Stdio::piped())
            .spawn()
            .expect("failed to spawn process");

        if let Some(stdout) = child.stdout.take() {
            let mut lines = tokio::io::BufReader::new(stdout).lines();

            while let Some(line) = lines.next_line().await.unwrap_or(None) {
                tx.send(line).unwrap();
            }
        }

        child.stderr.expect("failed to wait on child process");
    });

    while let Some(line) = rx.recv().await {
        println!("{}", line);
        window.emit("process-data", Some(line)).unwrap();
    }
}


#[command]
fn download_file(url: String, path: String) -> bool {
    let path_clone = path.clone();
    let result = std::thread::spawn(move || -> Result<(), Error> {
        let response = ureq::get(&url).call().map_err(|e| Error::new(std::io::ErrorKind::Other, e))?;
        let mut file = File::create(&path)?;
        let mut content = response.into_reader();
        copy(&mut content, &mut file)?;
        Ok(())
    }).join();
    println!("Result of downloading: {:?}", result);

    // Renombrar el archivo a "BuildTools.jar"
    if let Ok(Ok(_)) = result {
        let new_path = "BuildTools.jar";
        match fs::rename(&path_clone, new_path) {
            Ok(_) => {
                println!("Archivo renombrado a: {}", new_path);
                true
            }
            Err(e) => {
                println!("Error al renombrar el archivo: {:?}", e);
                false
            }
        }
    } else {
        false
    }
}


fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_upload::init())
        .invoke_handler(tauri::generate_handler![download_file,run_process])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.open_devtools();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
