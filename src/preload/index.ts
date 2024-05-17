/* eslint-disable prettier/prettier */
import { OpenDialogReturnValue, contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ModData } from "../renderer/src/utils/interfaces"

// Custom APIs for renderer
const api = {
    runOneshot: async() : Promise<void> => await ipcRenderer.invoke("runOneshot"),
    openOneshotFolderSelector: async (): Promise<OpenDialogReturnValue> => await ipcRenderer.invoke("openOneshotFolderSelector"),
    isSettingsFileExist: async (): Promise<boolean> => await ipcRenderer.invoke("isSettingsFileExist"),
    isFolderOneshotDir: async (dirPath: string): Promise<boolean> => await ipcRenderer.invoke("isFolderOneshotDir", dirPath),
    writeSettingsFile: async (settingsJson: string): Promise<void> => await ipcRenderer.invoke("writeSettingsFile", settingsJson),
    readSettingsFile: async (): Promise<string | null> => await ipcRenderer.invoke("readSettingsFile"),
    getOneshotFolder: async(): Promise<string> => await ipcRenderer.invoke("getOneshotFolder"),
    getModConfigs: async(): Promise<Map<string, ModData>> => await ipcRenderer.invoke("getModConfigs"),
    setupModConfigs: async() : Promise<void> => await ipcRenderer.invoke("setupModConfigs"),
    getModConfig: async(key: string): Promise<ModData> => await ipcRenderer.invoke("getModConfig", key),
    setModConfig: async(key: string, config: ModData): Promise<void> => await ipcRenderer.invoke("setModConfig", key, config),
    setModEnabled: async(key: string, enabled: boolean): Promise<void> => await ipcRenderer.invoke("setModEnabled", key, enabled),
    openFolderInFileManager: async(folderPath: string) : Promise<void> => await ipcRenderer.invoke("openFolderInFileManager", folderPath),
    deleteMod: async(modPath: string) : Promise<void> => await ipcRenderer.invoke("deleteMod", modPath),
    importMod: async() : Promise<void> => await ipcRenderer.invoke("importMod"),
    updateEvery100ms: async() : Promise<void> => await ipcRenderer.invoke("updateEvery100ms"),
    setupOneshotFilesPaths: async() : Promise<void> => await ipcRenderer.invoke("setupOneshotFilesPaths"),
    isOneshotFilesPathsEmpty: async() : Promise<boolean> => await ipcRenderer.invoke("isOneshotFilesPathsEmpty"),
    isFolderOneshotMod: async(dirPath: string) : Promise<boolean> => await ipcRenderer.invoke("isFolderOneshotMod", dirPath)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}