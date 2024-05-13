/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import { spawn } from 'child_process'
import os from 'os'
import { OpenDialogReturnValue, app, dialog } from "electron"
import fs from 'fs';
import path from "path";
import { ModData, ModDataJSON, SettingsData } from "../renderer/src/utils/interfaces";


export async function runOneshot(): Promise<void> {
    switch (os.platform()) {
        case 'win32': {
            spawn('explorer', ['steam://rungameid/420530']);
            break;
        }
        case 'linux': {
            spawn('xdg-open', ['steam://rungameid/420530'])
            break;
        }
        default: {
            throw new Error('Unsupported platform')
        }
    }
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

export async function getModConfigs(): Promise<ModData[]> {
    const modConfigs: ModData[] = [];

    const modDirectory: string = path.join(`${await getOneshotFolder()}`, "Mods");

    if (!fs.existsSync(modDirectory)) {
        fs.mkdirSync(modDirectory);
    }

    fs.readdirSync(modDirectory).forEach(modFolder => {
        const individualModPath: string = path.join(`${modDirectory}`,`${modFolder}`);

        if (!fs.lstatSync(individualModPath).isDirectory()) {
            return;
        }

        for (const modData of modConfigs) {
            if (modData.modPath === individualModPath) {
                return;
            }
        }

        let isModConfigExist: boolean = false;

        fs.readdirSync(individualModPath).forEach(modContentName => {

            if (modContentName === 'mod_config.json') {
                const modConfigJSON: ModDataJSON = JSON.parse(fs.readFileSync(path.join(`${individualModPath}`, "mod_config.json"), 'utf8'));
                const modIcon = fs.readFileSync(path.join(`${individualModPath}`,`${modConfigJSON.iconPath}`));

                modConfigs.push({
                    modPath: individualModPath,
                    name: modConfigJSON.name,
                    iconBase64:`data:image/jpeg;base64,${modIcon.toString('base64')}` ,
                    author: modConfigJSON.author,
                })

                isModConfigExist = true;
            }
        });

        if (!isModConfigExist) {
            modConfigs.push({
                modPath: individualModPath,
                name: modFolder,
                iconBase64: null,
                author: null,
            })
        }
    });

    return modConfigs;
}