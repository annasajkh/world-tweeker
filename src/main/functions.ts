/* eslint-disable prettier/prettier */
import { spawn } from 'child_process'
import os from 'os'
import { OpenDialogReturnValue, app, dialog } from "electron"
import fs from 'fs';
import path from "path";

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
    fs.writeFile(path.join(app.getPath('userData'), 'settings.json'), settingsJson, err => {
        if (err) {
            console.error(err);
        }
    });
}

export async function readSettingsFile(): Promise<string> {
    try {
        const data = await fs.promises.readFile(path.join(app.getPath('userData'), 'settings.json'), 'utf8');
        return data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function openOneshotFolder(): Promise<OpenDialogReturnValue> {
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

    for(const folderOrFileName of foldersAndFiles) {
        for(const folderOrFileNameInDirPath of foldersAndFilesInDirPath) {
            if (folderOrFileNameInDirPath.includes(folderOrFileName)) {
                checkCount++;
                break;
            }
        }
    }

    return checkCount == foldersAndFiles.length;
}