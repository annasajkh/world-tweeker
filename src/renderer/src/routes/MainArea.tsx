/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import Topbar from '@renderer/components/Topbar'
import './MainArea.css'
import { useEffect, useState } from "react";
import Modal from "@renderer/components/Modal";
import FolderSelector from "@renderer/components/FolderSelector";
import { SettingsData } from "@renderer/utils/interfaces";
import TextButton from "@renderer/components/TextButton";

export default function MainArea(): JSX.Element {
    const [openModal, setOpenModal] = useState(false);
    const [oneshotFolder, setOneshotFolder] = useState<string>('')

    useEffect(() => {
        async function isSettingsFileExist(): Promise<void> {
            const isFileExist = await window.api.isSettingsFileExist();
            setOpenModal(!isFileExist);
        }

        isSettingsFileExist();
    }, [])

    async function oneshotFolderPathSelector(): Promise<void> {
        const result: any = await window.api.openOneshotFolder()
        const path: string = result.filePaths[0];

        if (path !== undefined) {
            setOneshotFolder(path)
        }
    }

    async function oneshotFolderPathConfirmClicked(): Promise<void> {
        const settingsJson: SettingsData = {
            oneshotPath: oneshotFolder
        }

        await window.api.writeSettingsFile(JSON.stringify(settingsJson));
        
        setOpenModal(false);
    }

    return (
        <div className="main-area">
            <Topbar />

            <Modal className="oneshot-folder-not-selected-modal" openModal={openModal} closeModal={() => setOpenModal(false)}>
                <p className="oneshot-folder-not-selected-warning">Please select Oneshot folder that is located in SteamLibrary\steamapps\common</p>
                <FolderSelector getFolderPath={(): string => oneshotFolder} setFolderPath={(folderPath: string) => setOneshotFolder(folderPath)} openFolderPathSelector={oneshotFolderPathSelector} />
                <TextButton text="Confirm" className="oneshot-folder-path-confirm-button" onClick={oneshotFolderPathConfirmClicked} />
            </Modal>
        </div>
    )
}