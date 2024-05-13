/* eslint-disable prettier/prettier */
export interface SettingsData {
    oneshotPath: string;
}

export interface ModData {
    name: string;
    iconBase64: string | null;
    author: string | null;
    modPath: string;
}

export interface ModDataJSON {
    name: string;
    iconPath: string;
    author: string;
}