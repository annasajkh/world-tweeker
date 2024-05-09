/* eslint-disable prettier/prettier */
import { spawn } from 'child_process'
import os from 'os'
import { OpenDialogReturnValue, dialog } from "electron"


let oneshotFolder: string = 'C:\\Program Files (x86)\\Steam\\SteamLibrary\\steamapps\\common\\OneShot'


export function runOneshot(): void {
    switch (os.platform()) {
        case 'win32':
            spawn('explorer', ['steam://'])
            break
        case 'linux':
            spawn('xdg-open', ['steam://'])
            break
        case 'darwin':
            spawn('open', ['steam://'])
            break
        default:
            throw new Error('Unsupported platform')
    }
}

export function getOneshotFolder(): string {
    return oneshotFolder
}

export function setOneshotFolder(path: string): void {
    oneshotFolder = path
}

export async function openOneshotFolder(): Promise<OpenDialogReturnValue> {
    return await dialog.showOpenDialog({ properties: ['openDirectory'] });
}