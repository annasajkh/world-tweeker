/* eslint-disable prettier/prettier */
import { OpenDialogReturnValue, contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { getOneshotFolder, runOneshot, setOneshotFolder } from "../main/oneshot"

// Custom APIs for renderer
const api = {
    runOneshot: runOneshot,
    getOneshotFolder: getOneshotFolder,
    setOneshotFolder: setOneshotFolder,
    openOneshotFolder: async (): Promise<OpenDialogReturnValue> => await ipcRenderer.invoke("openOneshotFolder")
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