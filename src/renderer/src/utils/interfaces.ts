/* eslint-disable prettier/prettier */

export type EnableData = {
    key: string;
    enabled: boolean;
}

export type SettingsData = {
    oneshotPath: string;
    modEnabledConfigs: EnableData[]
}

export type ModData = {
    name: string;
    dirName: string;
    enabled: boolean;
    iconBase64: string | null;
    author: string | null;
    modPath: string;
}

export type ModDataJSON = {
    enabled: boolean;
    name: string;
    iconPath: string;
    author: string;
}

export type ReplaceRestoreData = {
    oneshotFilePath: string;
    tempFilePath: string;
}