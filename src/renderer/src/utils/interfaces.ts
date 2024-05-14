/* eslint-disable prettier/prettier */
export interface SettingsData {
    oneshotPath: string;
}

export interface ModData {
    name: string;
    enabled: boolean;
    iconBase64: string | null;
    author: string | null;
    modPath: string;
}

export interface ModDataJSON {
    enabled: boolean;
    name: string;
    iconPath: string;
    author: string;
}