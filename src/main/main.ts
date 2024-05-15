/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import os from 'os'
import { OpenDialogReturnValue, app, dialog } from "electron"
import fs from 'fs';
import path from "path";
import { ModData, ModDataJSON, SettingsData } from "../renderer/src/utils/interfaces";
import { shell } from 'electron';
const extract = require('extract-zip');
import regedit from 'regedit';

let modConfigs: Map<string, ModData> = new Map<string, ModData>();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let steamAndOneshot: ChildProcessWithoutNullStreams | null = null

export async function runOneshot(): Promise<void> {
    switch (os.platform()) {
        case 'win32': {
            steamAndOneshot = spawn('explorer', ['steam://rungameid/420530']);

            break;
        }
        case 'linux': {
            steamAndOneshot = spawn('xdg-open', ['steam://rungameid/420530'])
            break;
        }
        default: {
            throw new Error('Unsupported platform')
        }
    }

}

export async function updateEvery100ms(): Promise<void> {

    switch (os.platform()) {
        case 'win32': {
            regedit.list(['HKCU\\SOFTWARE\\Valve\\Steam\\Apps\\420530'], (error, result) => {
                console.log(result['HKCU\\SOFTWARE\\Valve\\Steam\\Apps\\420530'].values["Running"]);
            });
            break;
        }
        case 'linux': {
            const filePath = path.join(process.env.HOME!, '~/.steam/registry.vdf');
            fs.readFile(filePath, 'utf8', (error, data) => {
                if (error) {
                    console.error(error);
                    return;
                }
                console.log(data)
                // const isRunning = data.includes('"Running"		"1"');
                // console.log(isRunning);
            });
            break;
        }
        default: {
            throw new Error('Unsupported platform')
        }
    }
}

export async function importMod(): Promise<void> {
    const modFile = await dialog.showOpenDialog({
        filters: [
            { name: "Zip", extensions: ["zip"] }
        ],
        properties: ['openFile', 'multiSelections']
    });

    if (modFile.canceled) {
        return;
    }

    let separator: string = "";

    switch (os.platform()) {
        case 'win32': {
            separator = path.win32.sep;
            break;
        }
        case 'linux': {
            separator = path.posix.sep;
            break;
        }
        default: {
            throw new Error('Unsupported platform')
        }
    }

    extract(modFile.filePaths[0], { dir: path.join(`${await getOneshotFolder()}`, "Mods", modFile.filePaths[0].split(separator).at(-1)!.split(".")[0]) }, (error): void => {
        console.error(error);
    });
}

export async function isSettingsFileExist(): Promise<boolean> {
    return fs.existsSync(path.join(app.getPath('userData'), 'settings.json'));
}

export async function writeSettingsFile(settingsJson: string): Promise<void> {
    fs.writeFile(path.join(app.getPath('userData'), 'settings.json'), settingsJson, error => {
        if (error) {
            console.error(error);
        }
    });
}

export async function readSettingsFile(): Promise<string> {
    try {
        const data = await fs.promises.readFile(path.join(app.getPath('userData'), 'settings.json'), 'utf8');
        return data;
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function getOneshotFolder(): Promise<string> {
    const isFileExist = await isSettingsFileExist();

    if (isFileExist) {
        const settings: string = await readSettingsFile();
        const settingsJson: SettingsData = JSON.parse(settings);

        const isOneshotFolder: boolean = await isFolderOneshotDir(settingsJson["oneshotPath"]);

        if (isOneshotFolder) {
            return settingsJson["oneshotPath"];
        } else {
            throw new Error("Error: Folder is not oneshot folder")
        }

    } else {
        throw new Error("Error: Folder doesn't exist");
    }
}

export async function openOneshotFolderSelector(): Promise<OpenDialogReturnValue> {
    return await dialog.showOpenDialog({ properties: ['openDirectory'] });
}

export async function isFolderOneshotDir(dirPath: string): Promise<boolean> {
    const foldersAndFiles: string[] = ["Audio", "Data", "Fonts", "Graphics", "Languages", "Wallpaper", "steamshim", "oneshot"];
    const foldersAndFilesInDirPath: string[] = [];

    let checkCount: number = 0;

    if (dirPath.trim() == "") {
        return false;
    }

    fs.readdirSync(dirPath).forEach(file => {
        foldersAndFilesInDirPath.push(file);
    });

    for (const folderOrFileName of foldersAndFiles) {
        for (const folderOrFileNameInDirPath of foldersAndFilesInDirPath) {
            if (folderOrFileNameInDirPath.includes(folderOrFileName)) {
                checkCount++;
                break;
            }
        }
    }

    return checkCount == foldersAndFiles.length;
}

export async function openFolderInFileManager(folderPath: string): Promise<void> {
    shell.openPath(folderPath);
}

export async function getModConfigs(): Promise<Map<string, ModData>> {
    return modConfigs;
}

export async function setModEnabled(key: string, enabled: boolean): Promise<void> {
    const modConfig: ModData = modConfigs.get(key)!;
    modConfig.enabled = enabled;
}

export async function getModConfig(key: string): Promise<ModData> {
    return modConfigs[key];
}

export async function setModConfig(key: string, config: ModData): Promise<void> {
    modConfigs[key] = config;
}

export async function deleteMod(modPath: string): Promise<void> {
    fs.rmSync(modPath, { recursive: true, force: true });
}

export async function setupModConfigs(): Promise<void> {
    modConfigs = new Map();

    const modDirectory: string = path.join(`${await getOneshotFolder()}`, "Mods");

    if (!fs.existsSync(modDirectory)) {
        fs.mkdirSync(modDirectory);
    }

    fs.readdirSync(modDirectory).forEach(modFolder => {
        const individualModPath: string = path.join(`${modDirectory}`, `${modFolder}`);

        if (!fs.lstatSync(individualModPath).isDirectory()) {
            return;
        }

        for (const modData of modConfigs) {
            if (modData[1].modPath === individualModPath) {
                return;
            }
        }

        let isModConfigExist: boolean = false;

        fs.readdirSync(individualModPath).forEach(modContentName => {
            if (modContentName === 'mod_config.json') {
                const modConfigJSON: ModDataJSON = JSON.parse(fs.readFileSync(path.join(`${individualModPath}`, "mod_config.json"), 'utf8'));
                const modIcon = fs.readFileSync(path.join(`${individualModPath}`, `${modConfigJSON.iconPath}`));

                modConfigs.set(individualModPath, {
                    modPath: individualModPath,
                    enabled: true,
                    name: modConfigJSON.name,
                    iconBase64: `data:image/jpeg;base64,${modIcon.toString('base64')}`,
                    author: modConfigJSON.author,
                })

                isModConfigExist = true;
            }
        });

        if (!isModConfigExist) {
            modConfigs.set(individualModPath, {
                modPath: individualModPath,
                enabled: true,
                name: modFolder,
                iconBase64: null,
                author: null,
            })
        }
    });
}