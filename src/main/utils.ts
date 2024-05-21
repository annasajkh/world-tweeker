/* eslint-disable prettier/prettier */
import path from "path";
import fs from 'fs';
import os from 'os'

// get path separator depending on the os this app is running on
export function getPathSeparator(): string {
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

    return separator;
}

// get all the files of a directory recursively
export function getAllFiles(pathDir: string): string[] {
    const result: string[] = [];

    for (const folder of fs.readdirSync(pathDir)) {
        if (fs.lstatSync(path.join(pathDir, folder)).isDirectory() ) {
            result.push(...getAllFiles(path.join(pathDir, folder)));
        } else {
            result.push(path.join(pathDir, folder));
        }
    }
    
    return result;
}