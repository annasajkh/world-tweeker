/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import { exec, spawn } from 'child_process'
import os from 'os'
import { OpenDialogReturnValue, app, dialog } from "electron"
import fs from 'fs';
import path from "path";
import { EnableData, ModData, ModDataJSON, SettingsData } from "../renderer/src/utils/interfaces";
import { shell } from 'electron';
import { getAllFiles, getPathSeparator } from "./utils";
const extract = require('extract-zip');

const modConfigs: Map<string, ModData> = new Map<string, ModData>();
const oneshotDirFilter: string[] = ["Audio", "Data", "Fonts", "Graphics", "Languages", "Wallpaper", "steamshim", "oneshot"];
const oneshotModFilter: string[] = ["Audio", "Data", "Fonts", "Graphics", "Languages", "Wallpaper", "oneshot"];

let oneshotIsRunning: boolean = false;
let oneshotFilePaths: string[] = [];

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

export async function isModHaveConflict(modPath: string): Promise<boolean> {    
    const modRelativeFilePaths = getAllFiles(modPath);

    for (let i = 0; i < modRelativeFilePaths.length; i++) {
        modRelativeFilePaths[i] = modRelativeFilePaths[i].split(modPath)[1].replace(getPathSeparator(), "").trim();
    }

    for (const otherModConfig of modConfigs) {
        if (otherModConfig[0] !== modPath) {
            const otherModFileRelativePaths = getAllFiles(otherModConfig[1].modPath);

            for (let i = 0; i < otherModFileRelativePaths.length; i++) {
                otherModFileRelativePaths[i] = otherModFileRelativePaths[i].split(otherModConfig[0])[1].replace(getPathSeparator(), "").trim();

                if (modRelativeFilePaths.indexOf(otherModFileRelativePaths[i]) > -1) {
                    return true;
                }
            }
        }
    }

    return false;
}

export async function isOneshotFilesPathsEmpty(): Promise<boolean> {
    return oneshotFilePaths.length == 0;
}

export async function setupOneshotFilesPaths(): Promise<void> {
    const oneshotFolder: string | null = await getOneshotFolder();
    if (oneshotFolder == null) {
        return;
    }
    
    oneshotFilePaths = getAllFiles(oneshotFolder);
}

export async function updateEvery100ms(): Promise<void> {
    if (await isSettingsFileExist()) {            
        await setupModConfigs();
    }

    switch (os.platform()) {
        case 'win32': {
            exec("tasklist | findstr oneshot", (error, stdout) => {
                if (error) {
                    oneshotIsRunning = false;
                    return;
                }

                oneshotIsRunning = stdout.includes("oneshot");
            });
            break;
        }
        case 'linux': {
            exec("pgrep -fl 'oneshot'", (error, stdout, stderr) => {
                if (error) {
                    console.log(stderr);
                    console.error('Error executing ps command:', error);
                }

                oneshotIsRunning = stdout.includes("oneshot");
            });
            break;
        }
        default: {
            throw new Error('Unsupported platform')
        }
    }
}

export async function importMod(): Promise<string | null> {
    const modFile = await dialog.showOpenDialog({
        filters: [
            { name: "Zip", extensions: ["zip"] }
        ],
        properties: ['openFile', 'multiSelections']
    });

    if (modFile.canceled) {
        return null;
    }

    return modFile.filePaths[0];
}

export async function extractMod(modFilePath: string): Promise<string> {
    const extractDestination: string = path.join(`${await getOneshotFolder()}`, "Mods",  modFilePath.split(getPathSeparator()).at(-1)!.split(".")[0]);

    await extract(modFilePath, { dir: extractDestination }, (error): void => {
        console.error(error);
    });

    return extractDestination;
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

export async function getOneshotFolder(): Promise<string | null> {
    const isFileExist = await isSettingsFileExist();

    if (isFileExist) {
        const settings: string = await readSettingsFile();
        const settingsJson: SettingsData = JSON.parse(settings);

        const isOneshotFolder: boolean = await isFolderOneshotDir(settingsJson["oneshotPath"]);

        if (isOneshotFolder) {
            return settingsJson["oneshotPath"];
        } else {
            console.error("Error: Folder is not oneshot folder")
            return null;
        }

    } else {
        console.error("Error: Folder doesn't exist");
        return null;
    }
}

export async function openOneshotFolderSelector(): Promise<OpenDialogReturnValue> {
    return await dialog.showOpenDialog({ properties: ['openDirectory'] });
}

export async function isFolderOneshotDir(dirPath: string): Promise<boolean> {
    const foldersAndFilesInDirPath: string[] = [];

    let checkCount: number = 0;

    if (dirPath.trim() == "") {
        return false;
    }

    fs.readdirSync(dirPath).forEach(file => {
        foldersAndFilesInDirPath.push(file);
    });

    for (const folderOrFileName of oneshotDirFilter) {
        for (const folderOrFileNameInDirPath of foldersAndFilesInDirPath) {
            if (folderOrFileNameInDirPath.includes(folderOrFileName)) {
                checkCount++;
                break;
            }
        }
    }

    return checkCount == oneshotDirFilter.length;
}

export async function isFolderOneshotMod(dirPath: string): Promise<boolean> {
    let checkCount: number = 0;

    if (dirPath.trim() == "") {
        return false;
    }

    const foldersAndFilesInDirPath: string[] = fs.readdirSync(dirPath);
    
    for (const folderOrFileName of oneshotModFilter) {
        for (const folderOrFileNameInDirPath of foldersAndFilesInDirPath) {
            
            if (folderOrFileNameInDirPath.includes(folderOrFileName)) {
                checkCount++;
                break;
            }
        }
    }

    return checkCount != 0;
}

export async function openFolderInFileManager(folderPath: string): Promise<void> {
    shell.openPath(folderPath);
}

export async function getModConfigs(): Promise<Map<string, ModData>> {
    return modConfigs;
}

export async function setModEnabled(key: string, enabled: boolean): Promise<void> {
    const modConfig: ModData | undefined = modConfigs.get(key);

    if (modConfig) {
        modConfig.enabled = enabled;
        modConfigs.set(key, modConfig);
    } else {
        console.error(`Mod config with key "${key}" not found.`);
    }
}

export async function getModConfig(key: string): Promise<ModData> {
    return modConfigs[key];
}

export async function setModConfig(key: string, config: ModData): Promise<void> {
    modConfigs[key] = config;
}

export async function deleteMod(modPath: string): Promise<void> {
    if (modPath.trim() === "") {
        return;
    }
    
    fs.rmSync(modPath, { recursive: true, force: true });
    modConfigs.delete(modPath);
}

export async function setupModConfigs(): Promise<void> {
    const oneshotFolder: string | null = await getOneshotFolder();
    if (oneshotFolder == null) {
        return;
    }

    const modDirectory: string = path.join(`${oneshotFolder}`, "Mods");

    if (!fs.existsSync(modDirectory)) {
        fs.mkdirSync(modDirectory);
    }

    const settings: SettingsData = JSON.parse(await readSettingsFile());

    const modEnabledConfigs: EnableData[] = settings.modEnabledConfigs;

    fs.readdirSync(modDirectory).forEach(modFolder => {
        const individualModPath: string = path.join(`${modDirectory}`, `${modFolder}`);

        if (!fs.lstatSync(individualModPath).isDirectory()) {
            return;
        }

        let isModConfigExist: boolean = false;

        const enableData = modEnabledConfigs.filter(modEnabledConfig => {
            return modEnabledConfig.key === individualModPath
        })

        fs.readdirSync(individualModPath).forEach(modContentName => {
            if (modContentName == 'mod_config.json') {
                const modConfigJSON: ModDataJSON = JSON.parse(fs.readFileSync(path.join(`${individualModPath}`, "mod_config.json"), 'utf8'));
                const modIcon = fs.readFileSync(path.join(`${individualModPath}`, `${modConfigJSON.iconPath}`));
                
                modConfigs.set(individualModPath, {
                    modPath: individualModPath,
                    dirName: modFolder,
                    enabled: enableData.length !== 0 ? enableData[0].enabled : true,
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
                dirName: modFolder,
                enabled: enableData.length !== 0 ? enableData[0].enabled : true,
                name: modFolder,
                iconBase64: null,
                author: null,
            })
        }
    });
}