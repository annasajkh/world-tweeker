/* eslint-disable prettier/prettier */

export interface EnableData {
    key: string;
    enabled: boolean;
}

export interface SettingsData {
    oneshotPath: string;
    modEnabledConfigs: EnableData[]
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