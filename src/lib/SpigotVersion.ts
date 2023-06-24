import axios from 'axios';
import cheerio from 'cheerio';

export interface SpigotVersion {
    label: string;
    value: string | "latest";
}

export async function getSpigotVersions(): Promise<SpigotVersion[]> {
    /* const url = 'https://www.spigotmc.org/wiki/spigot-installation/#latest-versions';
     const response = await axios.get(url);
     const $ = cheerio.load(response.data);

     const spigotVersions: SpigotVersion[] = [];

     $('table tbody tr').each((_index, element) => {
         const label = $(element).children('td:nth-child(1)').text().trim();
         const value = $(element).children('td:nth-child(2)').text().trim();

         spigotVersions.push({ label, value });
     });*/

    const spigotVersions: SpigotVersion[] = [
        { label: "Latest", value: "latest" },
        { label: "1.19.4", value: "1.19.4" },
        { label: "1.19.3", value: "1.19.3" },
        { label: "1.19.2", value: "1.19.2" },
        { label: "1.18.1", value: "1.18.1" },
        { label: "1.18", value: "1.18" },
        { label: "1.17.1", value: "1.17.1" },
        { label: "1.17", value: "1.17" },
        { label: "1.16.5", value: "1.16.5" },
        { label: "1.16.4", value: "1.16.4" },
        { label: "1.16.3", value: "1.16.3" },
        { label: "1.16.2", value: "1.16.2" },
        { label: "1.16.1", value: "1.16.1" },
        { label: "1.16", value: "1.16" },
        { label: "1.15.2", value: "1.15.2" },
        { label: "1.15.1", value: "1.15.1" },
        { label: "1.15", value: "1.15" },
        { label: "1.14.4", value: "1.14.4" },
        { label: "1.14.3", value: "1.14.3" },
        { label: "1.14.2", value: "1.14.2" },
        { label: "1.14.1", value: "1.14.1" },
        { label: "1.14", value: "1.14" },
        { label: "1.13.2", value: "1.13.2" },
        { label: "1.13.1", value: "1.13.1" },
        { label: "1.13", value: "1.13" },
        { label: "1.12.2", value: "1.12.2" },
        { label: "1.12.1", value: "1.12.1" },
        { label: "1.12", value: "1.12" },
        { label: "1.11.2", value: "1.11.2" },
        { label: "1.11.1", value: "1.11.1" },
        { label: "1.11", value: "1.11" },
        { label: "1.10.2", value: "1.10.2" },
        { label: "1.10.1", value: "1.10.1" },
        { label: "1.10", value: "1.10" },
        { label: "1.9.4", value: "1.9.4" },
        { label: "1.9.3", value: "1.9.3" },
        { label: "1.9.2", value: "1.9.2" },
        { label: "1.9.1", value: "1.9.1" },
        { label: "1.9", value: "1.9" },
        { label: "1.8.8", value: "1.8.8" },
    ];
    return spigotVersions;
}
