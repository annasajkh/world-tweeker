/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import Topbar from '@renderer/components/Topbar'
import './MainArea.css'
import { useEffect, useState } from "react";
import Modal from "@renderer/components/Modal";
import FolderSelector from "@renderer/components/FolderSelector";
import { ModData, SettingsData } from "@renderer/utils/interfaces";
import TextButton from "@renderer/components/TextButton";
import ModItem from "@renderer/components/ModItem";

export default function MainArea(): JSX.Element {
    const [openModal, setOpenModal] = useState(false);
    const [oneshotFolder, setOneshotFolder] = useState('')
    const [isFolderOneshotDir, setIsFolderOneshotDir] = useState(false);
    const [modConfigs, setModConfigs] = useState<Map<string, ModData>>(new Map());
    const [updateDelay, setUpdateDelay] = useState(0);

    async function runButtonClicked(): Promise<void> {
        await window.api.runOneshot();
    }

    async function importModClicked(): Promise<void> {
        await window.api.importMod();
    }

    async function updateEvery100ms(): Promise<void> {
        if (await window.api.isSettingsFileExist()) {            
            await window.api.setupModConfigs();
            setModConfigs(await window.api.getModConfigs());
        }

        window.api.updateEvery100ms();
    }
 
    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateDelay(updateDelay + 1);

            updateEvery100ms();
        }, 100);

        return () => clearInterval(interval);
    }, [updateDelay]);

    useEffect(() => {
        async function isSettingsFileExist(): Promise<void> {
            const isFileExist = await window.api.isSettingsFileExist();

            if (isFileExist) {
                const settings: string = await window.api.readSettingsFile();
                const settingsJson: SettingsData = JSON.parse(settings);

                setOneshotFolder(settingsJson["oneshotPath"]);

                const isOneshotFolder: boolean = await window.api.isFolderOneshotDir(settingsJson["oneshotPath"]);

                if (isOneshotFolder) {
                    setOpenModal(false);
                } else {
                    setOpenModal(true);
                }

            } else {
                setOpenModal(true);
            }
        }

        isSettingsFileExist();
    }, [])

    async function oneshotFolderPathSelector(): Promise<void> {
        const result: any = await window.api.openOneshotFolderSelector();
        const path: string = result.filePaths[0];

        if (path !== undefined) {
            setOneshotFolder(path);
            setIsFolderOneshotDir(await window.api.isFolderOneshotDir(path));
        }
    }

    async function oneshotFolderPathConfirmClicked(): Promise<void> {
        if (await window.api.isFolderOneshotDir(oneshotFolder)) {
            if (await window.api.isSettingsFileExist()) {
                const settings: SettingsData = JSON.parse(await window.api.readSettingsFile());

                const settingsJson: SettingsData = {
                    oneshotPath: oneshotFolder,
                    modEnabledConfigs: settings.modEnabledConfigs
                }
    
                await window.api.writeSettingsFile(JSON.stringify(settingsJson));
            } else {
                const settingsJson: SettingsData = {
                    oneshotPath: oneshotFolder,
                    modEnabledConfigs: []
                }
    
                await window.api.writeSettingsFile(JSON.stringify(settingsJson));
            }

            setOpenModal(false);
        }
    }

    return (
        <div className="main-area">
            <Topbar runButtonClicked={runButtonClicked} importModClicked={importModClicked} />

            <div className="mod-list-container">
                <div className="mod-list">
                    {Array.from(modConfigs.values()).map((modConfig: ModData) => (
                        <ModItem key={modConfig.modPath} modPath={modConfig.modPath} iconBase64={modConfig.iconBase64 != null ? modConfig.iconBase64 : null} name={modConfig.name} author={modConfig.author != null ? modConfig.author : null} />
                    ))}
                </div>
            </div>

            <Modal haveCloseButton={false} canClose={isFolderOneshotDir} className="" openModal={openModal} closeModal={() => setOpenModal(false)}>
                <p className="oneshot-folder-not-selected-warning">Please select Oneshot folder located in steamapps/common</p>
                <FolderSelector folderNotValidWarningMessage="This folder doesn't contain oneshot" isWarningTriggered={!isFolderOneshotDir} getFolderPath={(): string => oneshotFolder} setFolderPath={(folderPath: string) => setOneshotFolder(folderPath)} openFolderPathSelector={oneshotFolderPathSelector} />
                <TextButton text="Confirm" className="oneshot-folder-path-confirm-button" onClick={oneshotFolderPathConfirmClicked} />
            </Modal>
        </div>
    )
}