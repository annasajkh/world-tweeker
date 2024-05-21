/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import { exec, spawn } from 'child_process'
import os from 'os'
import { OpenDialogReturnValue, app, dialog } from "electron"
import fs, { mkdir } from 'fs';
import path from "path";
import { EnableData, ModData, ModDataJSON, SettingsData } from "../renderer/src/utils/interfaces";
import { shell } from 'electron';
import { getAllFiles, getPathSeparator } from "./utils";
const extract = require('extract-zip');

const modConfigs: Map<string, ModData> = new Map<string, ModData>();
const oneshotDirFilter: string[] = ["Audio", "Data", "Fonts", "Graphics", "Languages", "Wallpaper", "steamshim", "oneshot"];
const oneshotModFilter: string[] = ["Audio", "Data", "Fonts", "Graphics", "Languages", "Wallpaper", "oneshot"];

let oneshotIsRunning: boolean = false;
let allOneshotFilesPathTrimmed: string[] = [];


export async function runOneshot(): Promise<void> {
    const pathDestination: string = path.join(app.getPath('userData'), 'OneshotTemp')
    const [pathListFull, pathListRelative] = await getOneshotFilesThatTheModIsTryingToModify();

    
    if (!fs.existsSync(pathDestination)) {
        fs.mkdirSync(pathDestination);
    }

    // copy the oneshot files that the mod is trying to modify
    for (let i = 0; i < pathListFull.length; i++) {
        recursivelyCreateFolderPath(pathDestination, pathListRelative[i])
        fs.copyFileSync(pathListFull[i], path.join(pathDestination, pathListRelative[i]));   
    }

    
    // switch (os.platform()) {
    //     case 'win32': {
    //         spawn('explorer', ['steam://rungameid/420530']);
    //         break;
    //     }
    //     case 'linux': {
    //         spawn('xdg-open', ['steam://rungameid/420530'])
    //         break;
    //     }
    //     default: {
    //         throw new Error('Unsupported platform')
    //     }
    // }
}

function recursivelyCreateFolderPath(startingPath: string, relativePathToCreate: string): void {
    let pathBridge = startingPath;
    const folderNameList: string[] = relativePathToCreate.split(getPathSeparator());

    folderNameList.pop();

    for (const folderName of folderNameList) {
        pathBridge = path.join(pathBridge, folderName);

        if (!fs.existsSync(pathBridge)) {
            fs.mkdirSync(pathBridge);
        }
    }
}


async function getOneshotFilesThatTheModIsTryingToModify(): Promise<[string[], string[]]> {
    const fullPath: string[] = [];
    const relativePath: string[] = [];
    const allModFilesPathTrimmed: string[] = []

    // get all the mod files of the mod that is enable and trim it
    for (const modConfig of modConfigs) {
        if (modConfig[1].enabled) {
            allModFilesPathTrimmed.push(...trimAllPathToBeRelative(getAllFiles(modConfig[1].modPath), modConfig[1].modPath));
        }
    }

    // find what oneshot file the mod is trying to modify and add that to result
    for (const path of allOneshotFilesPathTrimmed) {
        if (allModFilesPathTrimmed.indexOf(path) > -1) {
            fullPath.push(`${await getOneshotFolder()}${getPathSeparator()}${path}`);
            relativePath.push(path);
        }
    }

    return [fullPath, relativePath];
}

function trimAllPathToBeRelative(paths: string[], pathToRemove: string): string[] {
    // keep replacing until the path become relative
    return paths.map((path: string) => path.replace(pathToRemove, "").replace(getPathSeparator(), "").trim());
}

export async function isModHaveConflict(modPath: string): Promise<boolean> {    
    const modRelativeFilePaths = trimAllPathToBeRelative(getAllFiles(modPath), modPath);

    for (const otherModConfig of modConfigs) {
        // check if the otherModConfig it's not the one that is being compared to
        if (otherModConfig[0] !== modPath) {
            const otherModFileRelativePaths = trimAllPathToBeRelative(getAllFiles(otherModConfig[1].modPath), otherModConfig[0]);

            for (let i = 0; i < otherModFileRelativePaths.length; i++) {
                // trim the path to be relative

                // check if otherModFileRelativePaths[i] is in modRelativeFilePaths array
                // and the file name is not .rxdata file
                if (modRelativeFilePaths.indexOf(otherModFileRelativePaths[i]) > -1 && !otherModFileRelativePaths[i].includes(".rxdata")) {
                    return true;
                }
            }
        }
    }

    return false;
}

export async function isOneshotFilesPathsEmpty(): Promise<boolean> {
    return allOneshotFilesPathTrimmed.length == 0;
}

// fill the oneshotFilePaths
export async function setupOneshotFilesPaths(): Promise<void> {
    const oneshotFolder: string | null = await getOneshotFolder();

    if (oneshotFolder == null) {
        return;
    }
    
    allOneshotFilesPathTrimmed = trimAllPathToBeRelative(getAllFiles(oneshotFolder), oneshotFolder);
}

// update every 100 ms called from the renderer process
export async function updateEvery100ms(): Promise<void> {
    if (await isSettingsFileExist()) {            
        await setupModConfigs();
    }

    // check if oneshot is running and set oneshotIsRunning variable accordingly
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

// the os file selector with extension of zip and return the path of the selected file
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
    if (await isSettingsFileExist()) {
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

// open the os folder selector
export async function openOneshotFolderSelector(): Promise<OpenDialogReturnValue> {
    return await dialog.showOpenDialog({ properties: ['openDirectory'] });
}

export async function isFolderOneshotDir(dirPath: string): Promise<boolean> {
    let checkCount: number = 0;

    if (dirPath.trim() == "") {
        return false;
    }

    const foldersAndFilesInDirPath: string[] = fs.readdirSync(dirPath);

    // check all the oneshotDirFilter strings if it's in each of foldersAndFilesInDirPath
    for (const folderOrFileName of oneshotDirFilter) {
        for (const folderOrFileNameInDirPath of foldersAndFilesInDirPath) {
            if (folderOrFileNameInDirPath.includes(folderOrFileName)) {
                checkCount++;
                break;
            }
        }
    }

    // if all of oneshotDirFilter strings is in dirPath then it's oneshot directory
    return checkCount == oneshotDirFilter.length;
}

export async function isFolderOneshotMod(dirPath: string): Promise<boolean> {
    if (dirPath.trim() == "") {
        return false;
    }

    const foldersAndFilesInDirPath: string[] = fs.readdirSync(dirPath);
    
    // check all the oneshotModFilter strings if it's in each of foldersAndFilesInDirPath
    for (const folderOrFileName of oneshotModFilter) {
        for (const folderOrFileNameInDirPath of foldersAndFilesInDirPath) {
            if (folderOrFileNameInDirPath.includes(folderOrFileName)) {
                return true;
            }
        }
    }

    return false;
}

// open the file manager to the directory of the folder
export async function openFolderInFileManager(folderPath: string): Promise<void> {
    shell.openPath(folderPath);
}

export async function getModConfigs(): Promise<Map<string, ModData>> {
    return modConfigs;
}

// set mod "enabled" property
export async function setModEnabled(key: string, enabled: boolean): Promise<void> {
    const modConfig: ModData | undefined = modConfigs.get(key);

    // check if the mod config exist
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
    // fail safe, check if modPath is empty string
    if (modPath.trim() === "") {
        console.error("Error: modPath is empty")
        return;
    }

    const oneshotPath: string | null = await getOneshotFolder();
    
    // fail safe
    if (oneshotPath == null) {
        console.error("Error: Oneshot path is null")
        return;
    }

    // fail safe, check if modPath is in oneshot mod path
    if (!modPath.includes(`${oneshotPath}${getPathSeparator()}Mods`)) {
        console.error("Error: It's not a mod path!")
        return;
    }

    // i'm scared of this
    // should be fine though so many fail safe in place
    fs.rmSync(modPath, { recursive: true }); // >~<
    modConfigs.delete(modPath);
}

// load the mod configurations
export async function setupModConfigs(): Promise<void> {
    const oneshotFolder: string | null = await getOneshotFolder();

    if (oneshotFolder == null) {
        console.error("Error: Oneshot path is null")
        return;
    }

    const modDirectory: string = path.join(`${oneshotFolder}`, "Mods");

    // if the mod directory doesn't exist then create it
    // and just exist knowing that this is the first time the user runs the app 
    // so no need to find the mod configs
    if (!fs.existsSync(modDirectory)) {
        fs.mkdirSync(modDirectory);
        return;
    }

    // read the enable config in the settings
    const settings: SettingsData = JSON.parse(await readSettingsFile());
    const modEnabledConfigs: EnableData[] = settings.modEnabledConfigs;

    fs.readdirSync(modDirectory).forEach(modFolder => {

        // construct the full mod path
        const individualModPath: string = path.join(`${modDirectory}`, `${modFolder}`);

        // ignore files because we are searching for mod directories
        if (!fs.lstatSync(individualModPath).isDirectory()) {
            return;
        }

        let isModConfigExist: boolean = false;

        // filter the mod enable configs for this spesific mod
        const enableData = modEnabledConfigs.filter(modEnabledConfig => {
            return modEnabledConfig.key === individualModPath
        })

        fs.readdirSync(individualModPath).forEach(modContentName => {
            if (modContentName == 'mod_config.json') {
                // read mod_config.json in the mod directory
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

        // if there is no mod configuration in the mod folder then fill the rest of the mod config with null
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