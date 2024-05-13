/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { app, shell, BrowserWindow, ipcMain, IpcMainInvokeEvent, OpenDialogReturnValue } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { getModConfigs, getOneshotFolder, isFolderOneshotDir, isSettingsFileExist, openOneshotFolderSelector, readSettingsFile, runOneshot, writeSettingsFile } from "./main"
import { ModData } from "../renderer/src/utils/interfaces"

function createWindow(): void {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        icon:  join(__dirname, '../../resources/icon.ico'),
        minWidth: 16 * 17,
        minHeight: 9 * 17,
        width: 960,
        height: 540,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
        mainWindow.webContents.openDevTools()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow();

    ipcMain.handle('runOneshot', async (_event: IpcMainInvokeEvent): Promise<void> => await runOneshot());
    ipcMain.handle('openOneshotFolderSelector', async (_event: IpcMainInvokeEvent): Promise<OpenDialogReturnValue> => await openOneshotFolderSelector());
    ipcMain.handle('isSettingsFileExist', async (_event: IpcMainInvokeEvent): Promise<boolean> => await isSettingsFileExist());
    ipcMain.handle('isFolderOneshotDir', async (_event: IpcMainInvokeEvent, dirPath: string): Promise<boolean> => await isFolderOneshotDir(dirPath));
    ipcMain.handle('writeSettingsFile', async (_event: IpcMainInvokeEvent, settingsJson: string): Promise<void> => await writeSettingsFile(settingsJson));
    ipcMain.handle('readSettingsFile', async (_event: IpcMainInvokeEvent): Promise<string | null> => await readSettingsFile());
    ipcMain.handle('getOneshotFolder', async (_event: IpcMainInvokeEvent): Promise<string> => await getOneshotFolder());
    ipcMain.handle('getModConfigs', async (_event: IpcMainInvokeEvent): Promise<ModData[]> => await getModConfigs());
    
    app.on('activate', function () {
        // On macOS it"s common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.