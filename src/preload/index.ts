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
    getOneshotFolder: async() : Promise<string> => await ipcRenderer.invoke("getOneshotFolder"),
    getModConfigs: async() : Promise<ModData[]> => await ipcRenderer.invoke("getModConfigs")
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