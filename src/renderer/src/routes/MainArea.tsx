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
    const [modConfigs, setModConfigs] = useState<ModData[]>([]);

    async function runButtonClicked(): Promise<void> {
        await window.api.runOneshot();
    }


    async function constructListUI(): Promise<void> {
        setModConfigs(await window.api.getModConfigs());
    }

    useEffect(() => {
        async function isSettingsFileExist(): Promise<void> {
            const isFileExist = await window.api.isSettingsFileExist();

            if (isFileExist) {
                const settings: string = await window.api.readSettingsFile();
                const settingsJson: SettingsData = JSON.parse(settings);

                setOneshotFolder(settingsJson["oneshotPath"]);

                const isOneshotFolder: boolean = await window.api.isFolderOneshotDir(settingsJson["oneshotPath"]);

                if (isOneshotFolder) {
                    setOpenModal(!isOneshotFolder);
                    await constructListUI();
                }

            } else {
                setOpenModal(!isFileExist);
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
            const settingsJson: SettingsData = {
                oneshotPath: oneshotFolder
            }

            await window.api.writeSettingsFile(JSON.stringify(settingsJson));
            setOpenModal(false);
            await constructListUI();
        }
    }

    return (
        <div className="main-area">
            <Topbar runButtonClicked={runButtonClicked} />

            <div className="mod-list-container">
                <div className="mod-list">
                    {modConfigs.map((modConfig: ModData) => (
                        <ModItem key={modConfig.modPath} iconBase64={modConfig.iconBase64 != null ? modConfig.iconBase64 : null} name={modConfig.name} author={modConfig.author != null ? modConfig.author : null} />
                    ))}
                </div>
            </div>

            <Modal haveCloseButton={false} canClose={isFolderOneshotDir} className="oneshot-folder-not-selected-modal" openModal={openModal} closeModal={() => setOpenModal(false)}>
                <p className="oneshot-folder-not-selected-warning">Please select Oneshot folder located in steamapps/common</p>
                <FolderSelector folderNotValidWarningMessage="This folder doesn't contain oneshot" isWarningTriggered={!isFolderOneshotDir} getFolderPath={(): string => oneshotFolder} setFolderPath={(folderPath: string) => setOneshotFolder(folderPath)} openFolderPathSelector={oneshotFolderPathSelector} />
                <TextButton text="Confirm" className="oneshot-folder-path-confirm-button" onClick={oneshotFolderPathConfirmClicked} />
            </Modal>
        </div>
    )
}