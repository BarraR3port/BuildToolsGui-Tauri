import { useEffect, useRef, useState } from "react";
import { getSpigotVersions, SpigotVersion } from "@/lib/SpigotVersion";
import { Alert, Button, Card, createStyles, Group, Progress, Select, Text, Textarea } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconAlertCircle, IconX } from "@tabler/icons-react";

import { open } from "@tauri-apps/api/shell";

export default function Home() {
    const [versionList, setVersionList] = useState<SpigotVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string>();
    const [building, setBuilding] = useState<boolean>(false);
    const [downloading, setDownloading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [output, setOutput] = useState<string>("");
    const { classes } = getMainStyles();
    const [foundJavaVersions, setFoundJavaVersions] = useState<number[]>([]);

    const textArea = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const fetchVersions = async () => {
            const versions = await getSpigotVersions();
            setVersionList(versions);
            setSelectedVersion(versions[0].value);
        };
        fetchVersions();
    }, []);

    function isTauriApp() {
        return typeof window !== "undefined" && typeof window.__TAURI_IPC__ !== "undefined";
    }

    function getJavaVersion(versionNumber: number): string | undefined {
        const javaVersions: { [key: number]: string } = {
            45: "1.0",
            46: "1.1",
            47: "1.2",
            48: "1.3",
            49: "1.4",
            50: "5",
            51: "6",
            52: "7",
            53: "8",
            54: "9",
            55: "10",
            56: "11",
            57: "12",
            58: "13",
            59: "14",
            60: "15",
            61: "16",
            62: "17",
            63: "18",
            64: "19",
            65: "20"
            // Agregar más versiones si es necesario
        };

        return javaVersions[versionNumber];
    }


    async function build() {
        console.log("Build started!");
        if (isTauriApp() && selectedVersion !== undefined) {
            const { invoke } = await import("@tauri-apps/api/tauri");
            const { listen } = await import("@tauri-apps/api/event");
            const { download } = await import ("tauri-plugin-upload-api");

            const { join } = await import("@tauri-apps/api/path" );
            const { appDataDir } = await import("@tauri-apps/api/path");
            const { createDir, exists, BaseDirectory } = await import("@tauri-apps/api/fs");

            const downloadPath = await join(await appDataDir(), "BuildTools");
            console.log("Download path: " + downloadPath);
            await exists(downloadPath).then(async (exists) => {
                if (!exists) {
                    await createDir(downloadPath, {
                        recursive: true,
                        dir: BaseDirectory.AppData
                    });
                }
            });

            setBuilding(true);
            setDownloading(true);
            setOutput("");
            /*const url = "https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar";
            download(url, downloadPath,
                (progress, total) => {
                    console.log(progress);
                    setProgress(progress);
                }).then(async () => {*/
            setDownloading(false);
            const buildToolsJarPath = await join(downloadPath, "BuildTools.jar");

            const { Command } = await import ("@tauri-apps/api/shell");
            console.log("java", "-jar", buildToolsJarPath, "--rev", selectedVersion, "--output-dir", downloadPath);
            const command = new Command("java", ["-jar", buildToolsJarPath, "--rev", selectedVersion, "--output-dir", downloadPath]);

            command.on("close", data => {
                console.log(`command finished with code ${data.code} and signal ${data.signal}, data:`, data);
                setBuilding(false);
                setProgress(0);
                if (foundJavaVersions.length > 0) {
                    const javaMinVersion = getJavaVersion(foundJavaVersions[0]);
                    const javaMaxVersion = getJavaVersion(foundJavaVersions[foundJavaVersions.length - 1]);

                    showNotification({
                            title: "Java Version Error",
                            message: "Please install Java " + javaMinVersion + " or " + javaMaxVersion + " to build this version of Spigot.",
                            color: "red",
                            icon: <IconX size="1.1rem" />
                        }
                    );
                }
            });
            command.on("error", error => {
                console.log(`command failed with error ${error}`);
                showNotification({
                        title: error,
                        message: "An error occurred while building the Spigot File.",
                        color: "red",
                        icon: <IconX size="1.1rem" />
                    }
                );
            });
            command.stdout.on("data", line => {

                if (line.includes("Success! Everything completed")) {
                    setOutput((output) => output + "\n🎉 " + line);
                    setProgress(100);
                } else {
                    setOutput((output) => output + line + "\n");
                }

                if (line.includes("javaVersions")) {
                    const jsonString = "{" + line.trim() + "}";
                    const regex = /"javaVersions": (\[[\d, ]+\])/;
                    const match = jsonString.match(regex);

                    if (match && match[1]) {
                        const javaVersionsArray: number[] = JSON.parse(match[1]);
                        setFoundJavaVersions(javaVersionsArray)
                    }


                }

                if (line.includes("Loading BuildTools version:")) setProgress(5);
                if (line.includes("git version")) setProgress(10);

                if (line.includes("Patching with Block.patch")) setProgress(25);
                if (line.includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\DragonControllerHover.class")) setProgress(25);

                if (line.includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\EnchantmentSweeping.class")) setProgress(35);
                if (line.includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\TileEntityCommand$1.class")) setProgress(40);

                if (line.includes("Patching with PathfinderGoalNearestAttackableTarget.patch")) setProgress(50);
                if (line.includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\ArgumentVectorPosition.class")) setProgress(50);

                if (line.includes("Applying patches to Spigot-API")) setProgress(60);
                if (line.includes("Decompiling class net/minecraft/server/WorldMap")) setProgress(60);

                if (line.includes("Applying: Plug WorldMap Memory Leak")) setProgress(75);
                if (line.includes("INFO:  Decompiling class net/minecraft/server/TagsItem")) setProgress(75);


                if (line.includes("*** Spigot patches applied!")) setProgress(80);
                if (line.includes("INFO:  Decompiling class net/minecraft/server/PacketPlayInVehicleMove")) setProgress(85);

                if (line.includes("Success! Everything completed")) setProgress(100);
                textArea.current?.scrollTo(textArea.current.scrollWidth, textArea.current.scrollHeight);

            });

            const child = await command.spawn();

            console.log("pid:", child.pid);
        } else {
            console.error("No download path set!");
        }
    }

    return (
        <div className={classes.main}>
            <Card className={classes.card} withBorder radius="lg">
                <Group position="center">
                    <Text fz="lg" fw={700} mt="md">
                        Spigot Build Tools Gui
                    </Text>
                </Group>

                <Text fz="lg" fw={500} mt="md">
                    Select a Minecraft Version to build it corresponding Spigot File.
                </Text>
                <Select
                    label="Select a Minecraft Version"
                    data={versionList}
                    placeholder="Minecraft Spigot Version"
                    nothingFound="Nothing found"
                    searchable
                    creatable
                    getCreateLabel={(query) => `+ Create ${query}`}
                    onCreate={(query) => {
                        const item = { value: query, label: query };
                        setVersionList((current) => [...current, item]);
                        return item;
                    }}
                    value={selectedVersion}
                    onChange={(item) => {
                        if (item === null) return;
                        setSelectedVersion(item);
                    }}
                />

                <Group mt={"md"} position="center" display={"grid"}>

                    <Button size={"md"} fullWidth color="primary" onClick={build} disabled={building}>
                        Build
                    </Button>

                </Group>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Java Versions" color="yellow" withCloseButton>
                    <div>
                        Java - Below Minecraft 1.17: - Download JRE 8 from <text className={classes.link}
                                                                                 onClick={async () => await open("http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html")}> here </text>
                    </div>
                    <div>
                        Java - Minecraft 1.17[.1]: - Download OpenJDK 16 from <text className={classes.link}
                                                                                    onClick={async () => await open("https://adoptium.net/temurin/releases?version=16")}> here </text>
                    </div>
                    <div>
                        Java - Above Minecraft 1.17.1: - Download OpenJDK 17 from <text className={classes.link}
                                                                                        onClick={async () => await open("https://adoptium.net/temurin/releases?version=17")}> here </text>
                    </div>
                </Alert>

                <Group className={classes.textAreaBox}>
                    <Textarea
                        label="Output"
                        placeholder="Output"
                        autosize
                        minRows={2}
                        maxRows={10}
                        value={output}
                        ref={textArea}
                        className={classes.textArea} />

                    <Progress value={progress} mt={5} label={"Build Process"} size={"xl"} />

                </Group>


            </Card>
        </div>
    );
}

const getMainStyles = createStyles((theme) => ({
    main: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh"
    },
    box: {
        marginTop: "30dvh"
    },
    card: {
        display: "grid",
        minWidth: "650px",
        gridTemplateColumns: "1fr",
        minHeight: "500px",
        alignItems: "stretch",
        justifyContent: "center",
        alignContent: "space-between",
        justifyItems: "center"
    },
    textAreaBox: {
        width: "auto",
        display: "grid"
    },
    textArea: {
        width: "100dvh"
    },
    link: {
        color: "blue",
        cursor: "pointer",
        "&:hover": {
            textDecoration: "underline"

        }

    }
}));