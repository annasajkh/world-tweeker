/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import { exec, spawn } from 'child_process'
import os from 'os'
import { OpenDialogReturnValue, app, dialog } from "electron"
import fs, { mkdir } from 'fs';
import path from "path";
import { EnableData, ModData, ModDataJSON, ReplaceRestoreData, SettingsData } from "../renderer/src/utils/interfaces";
import { shell } from 'electron';
import { getAllFiles, getPathSeparator } from "./utils";
import { Marshal, MarshalObject } from "ts-marshal";
import pako from 'pako';
import extend from 'just-extend';
import extract from 'extract-zip';
import { readdirSync, rmdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const modConfigs: Map<string, ModData> = new Map<string, ModData>();
const oneshotDirFilter: string[] = ["Audio", "Data", "Fonts", "Graphics", "Languages", "Wallpaper", "steamshim", "oneshot"];
const oneshotModFilter: string[] = ["Audio", "Data", "Fonts", "Graphics", "Languages", "Wallpaper", "oneshot"];

let filePathListToRemoveToRestoreOneshot: string[] = [];
let filePathListToReplaceToRestoreOneshot: ReplaceRestoreData[] = [];
let oneshotIsRunning: boolean = false;
let allOneshotFilesPathTrimmed: string[] = [];
let oneshotRunningChanged: boolean = false;


export async function runOneshot(): Promise<void> {
    filePathListToRemoveToRestoreOneshot = [];
    filePathListToReplaceToRestoreOneshot = [];

    const [pathListFull, pathListRelative] = await getOneshotFilesThatTheModIsTryingToModify();
    const allModPathList: string[] = []
    const pathDestination = path.join(app.getPath('userData'), 'OneshotTemp');

    for (const modConfig of modConfigs) {
        if (modConfig[1].enabled) {
            allModPathList.push(...getAllFiles(modConfig[0]));
        }
    }

    // remove mod_config.json
    allModPathList.filter((value) => {
        !value.includes("mod_config.json")
    })

    if (!fs.existsSync(pathDestination)) {
        console.log(`Making OneshotTemp ${pathDestination}`)
        fs.mkdirSync(pathDestination);
    } else {
        if (pathDestination !== "") {
            console.log(`Deleting OneshotTemp ${pathDestination}`)
            fs.rmSync(pathDestination, { recursive: true }); // >~<
            console.log(`Making OneshotTemp ${pathDestination}`)
            fs.mkdirSync(pathDestination);
        }
    }

    // copy the oneshot files that the mod is trying to modify so it can be restored later
    for (let i = 0; i < pathListFull.length; i++) {
        const oneshotFilePath: string = pathListFull[i];
        const tempFilePath: string = path.join(pathDestination, pathListRelative[i]);

        fs.cpSync(oneshotFilePath, tempFilePath, { recursive: true });

        filePathListToReplaceToRestoreOneshot.push({
            oneshotFilePath: oneshotFilePath,
            tempFilePath: tempFilePath
        })
    }


    // time to do funny thing to twm
    for (let i = 0; i < allModPathList.length; i++) {
        //split the mod path into array ex ["M:", "SteamLibrary", "steamapps", "common","Oneshot", "Mods", "mod name", "Data", "Map091.rxdata"]
        const modPathRelativeSplitted: string[] = allModPathList[i].split(getPathSeparator());

        // continously chop the front until we get the relative path ex ["Mods", "mod name", "Data", "Map091.rxdata"]
        while (modPathRelativeSplitted[0] != "Mods") {
            modPathRelativeSplitted.shift();
        }

        const oneshotFilePath: string = path.join((await getOneshotFolder())!, ...modPathRelativeSplitted.slice(2));
        const modFilePath: string = path.join((await getOneshotFolder())!, ...modPathRelativeSplitted);
        let modifiedRXData: MarshalObject | null = null;

        if (allModPathList[i].includes(".rxdata")) {
            try {
                if (!allModPathList[i].includes("Scripts.rxdata")) {
                    // modifiedRXData = applyModificationRXDataExcludeScripts(oneshotFilePath, modFilePath);

                    // fs.writeFileSync(oneshotFilePath, Marshal.dump(modifiedRXData));
                    // console.log(`Modifiying ${oneshotFilePath} with ${modFilePath}`);

                    fs.copyFileSync(modFilePath, oneshotFilePath)
                } else {
                    fs.copyFileSync(modFilePath, oneshotFilePath)

                    // modifyRXDataScripts(oneshotFilePath, modFilePath)
                    // break;
                };


            } catch (error) {
                // fs.copyFileSync(modFilePath, oneshotFilePath)
                // console.log(`Failed to modify ${oneshotFilePath}`);
                // console.error(error);
            }

        } else {
            if (fs.existsSync(oneshotFilePath)) {
                console.log(`Replacing ${oneshotFilePath} with ${modFilePath}`);
                fs.cpSync(modFilePath, os.platform() == "win32" ? oneshotFilePath : path.join(getPathSeparator(), oneshotFilePath), { recursive: true });
            } else {
                const oneshotTargetPath: string[] = oneshotFilePath.split(getPathSeparator())

                filePathListToRemoveToRestoreOneshot.push(oneshotFilePath);

                console.log(`Copying ${modFilePath} to ${path.join(...oneshotTargetPath)}`);
                fs.cpSync(modFilePath, os.platform() == "win32" ? path.join(...oneshotTargetPath) : path.join(getPathSeparator(), ...oneshotTargetPath), { recursive: true });
            }
        }
    }

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

    if (oneshotRunningChanged != oneshotIsRunning) {
        if (!oneshotIsRunning) {
            console.log("Oneshot is closed");
            for (const filePathToReplaceToRestoreOneshot of filePathListToReplaceToRestoreOneshot) {
                console.log(`Replacing ${filePathToReplaceToRestoreOneshot.oneshotFilePath} with ${filePathToReplaceToRestoreOneshot.tempFilePath}`);
                fs.copyFileSync(filePathToReplaceToRestoreOneshot.tempFilePath, filePathToReplaceToRestoreOneshot.oneshotFilePath)
            }

            const tempOneshotPathToDelete = path.join(app.getPath('userData'), 'OneshotTemp');

            if (tempOneshotPathToDelete !== "") {
                console.log(`Deleting OneshotTemp ${tempOneshotPathToDelete}`)
                fs.rmSync(tempOneshotPathToDelete, { recursive: true }); // >~<
            }

            for (const filePathToRemoveToRestoreOneshot of filePathListToRemoveToRestoreOneshot) {
                console.log(`Deleting ${filePathToRemoveToRestoreOneshot}`)
                fs.unlinkSync(filePathToRemoveToRestoreOneshot);
            }

            const oneshotFolder = await getOneshotFolder();

            if (oneshotFolder !== null && oneshotFolder !== "") {
                cleanupEmptyFolders(oneshotFolder);
            }


        } else {
            console.log("Oneshot is running");
        }

        oneshotRunningChanged = oneshotIsRunning;
    }
}

function cleanupEmptyFolders(folderPath: string): void {
    if (!statSync(folderPath).isDirectory()) {
        return
    }

    let files = readdirSync(folderPath)

    if (files.length > 0) {
        files.forEach((file) => cleanupEmptyFolders(join(folderPath, file)))
        // Re-evaluate files; after deleting subfolders we may have an empty parent
        // folder now.
        files = readdirSync(folderPath)
    }

    if (files.length == 0) {
        console.log('Deleting: ', folderPath)
        rmdirSync(folderPath)
    }
}

function applyModificationRXDataExcludeScripts(fileToModifyPath: string, fileThatModifyItPath: string): MarshalObject {
    const fileToModify: any = Marshal.load(fs.readFileSync(fileToModifyPath));
    const fileThatModifyIt: any = Marshal.load(fs.readFileSync(fileThatModifyItPath));

    if (fileToModify == null) {
        throw new Error("Error: fileToModify is null");
    } else if (fileThatModifyIt == null) {
        throw new Error("Error: fileThatModifyIt is null");
    }

    extend(fileToModify, fileThatModifyIt);

    return fileToModify;
}

function modifyRXDataScripts(fileToModifyPath: string, fileThatModifyItPath: string) {
    const fileToModify: any = Marshal.load(fs.readFileSync(fileToModifyPath));
    const fileThatModifyIt: any = Marshal.load(fs.readFileSync(fileThatModifyItPath));

    if (fileToModify == null) {
        throw new Error("Error: fileToModify is null");
    } else if (fileThatModifyIt == null) {
        throw new Error("Error: fileThatModifyIt is null");
    }

    // decompress the scripts that is compressed using zlib
    for (let i = 0; i < fileToModify.length; i++) {
        // fileToModify[i][2] = textDecoder.decode(pako.deflate(textEncoder.encode(fileToModify[i][2])))

        console.log(fileToModify[i][2])

        break
    }

    console.log(fileToModify);

    console.log(diff(fileToModify, fileThatModifyIt));
}


// function recursivelyCreateFolderPath(startingPath: string, relativePathToCreate: string): void {
//     let pathBridge = startingPath;
//     const folderNameList: string[] = relativePathToCreate.split(getPathSeparator());

//     folderNameList.pop();

//     for (const folderName of folderNameList) {
//         pathBridge = path.join(pathBridge, folderName);

//         if (!fs.existsSync(pathBridge)) {
//             fs.mkdirSync(pathBridge);
//         }
//     }
// }


async function getOneshotFilesThatTheModIsTryingToModify(): Promise<[string[], string[]]> {
    const fullPathList: string[] = [];
    const relativePathList: string[] = [];
    const allModFilesPathTrimmed: string[] = [];

    // get all the mod files of the mod that is enable and trim it
    for (const modConfig of modConfigs) {
        if (modConfig[1].enabled) {
            const allModFiles = getAllFiles(modConfig[1].modPath);

            allModFilesPathTrimmed.push(...trimAllPathToBeRelative(allModFiles, modConfig[1].modPath));
        }
    }

    // find what oneshot file the mod is trying to modify and add that to result
    for (let i = 0; i < allOneshotFilesPathTrimmed.length; i++) {
        if (allModFilesPathTrimmed.indexOf(allOneshotFilesPathTrimmed[i]) > -1) {
            fullPathList.push(`${await getOneshotFolder()}${getPathSeparator()}${allOneshotFilesPathTrimmed[i]}`);
            relativePathList.push(allOneshotFilesPathTrimmed[i]);
        }
    }

    // find mod rxdata that is in oneshot rxdata
    // for (let i = 0; i < allModPathList.length; i++) {
    //     if (allModFilesPathTrimmed.indexOf(allOneshotFilesPathTrimmed[i]) > -1) {
    //         modPathListFiltered.push(allModPathList[i])
    //     }
    // }

    return [fullPathList, relativePathList];
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
    const extractDestination: string = path.join(`${await getOneshotFolder()}`, "Mods", modFilePath.split(getPathSeparator()).at(-1)!.split(".")[0]);

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