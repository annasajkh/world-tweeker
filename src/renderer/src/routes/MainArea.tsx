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

import loadingImgPath from "../assets/animations/loading.gif"

export default function MainArea(): JSX.Element {
    const [openOneShotFolderInvalidModal, setOpenOneShotFolderInvalidModal] = useState(false);
    const [isFolderOneshotDir, setIsFolderOneshotDir] = useState(false);
    const [modImportCounter, setModImportCounter] = useState(0);

    const [oneshotFolder, setOneshotFolder] = useState('')
    const [modConfigs, setModConfigs] = useState<Map<string, ModData>>(new Map());
    const [updateDelay, setUpdateDelay] = useState(0);
    
    const [openNotOneshotMod, setOpenNotOneshotMod] = useState(false);
    const [openModConflict, setOpenModConflict] = useState(false);
    const [openModLoading, setOpenModLoading] = useState(false);

    // eslint-disable-next-line prefer-const
    let [modImportDestinationPath, setModImportDestinationPath] = useState("");

    // run when the component first run
    useEffect(() => {
        async function isSettingsFileExist(): Promise<void> {
            const isFileExist = await window.api.isSettingsFileExist();

            if (isFileExist) { 
                // load the settings and set the states
                const settings: string = await window.api.readSettingsFile();
                const settingsJson: SettingsData = JSON.parse(settings);

                setOneshotFolder(settingsJson["oneshotPath"]);

                const isOneshotFolder: boolean = await window.api.isFolderOneshotDir(settingsJson["oneshotPath"]);

                if (isOneshotFolder) {
                    setOpenOneShotFolderInvalidModal(false);
                } else {
                    setOpenOneShotFolderInvalidModal(true);
                }

            } else {
                setOpenOneShotFolderInvalidModal(true);
            }
        }

        async function main(): Promise<void> {
            await isSettingsFileExist();

            if (window.api.isOneshotFilesPathsEmpty()) {
                window.api.setupOneshotFilesPaths();   
            }
        }

        main();
    }, [])

    async function runButtonClicked(): Promise<void> {
        await window.api.runOneshot();
    }

    async function importModClicked(): Promise<void> {
        const modFilePath: string | null =  await window.api.importMod();

        if (modFilePath == null) {
            return;
        }

        setOpenModLoading(true);

        const extractDestination: string = await window.api.extractMod(modFilePath);

        setModImportDestinationPath(extractDestination);
        setModImportCounter(counter => counter + 1);
    }

    useEffect(() => {
        async function importMod(): Promise<void> {
            if (modImportDestinationPath == "") {
                return;
            }
    
            if (!await window.api.isFolderOneshotMod(modImportDestinationPath)) {
                setOpenModLoading(false);
                setOpenNotOneshotMod(true);    
            } else {
                setOpenModLoading(false);
                await modIsOneshotMod();   
            }
        }

        importMod();
    }, [modImportDestinationPath, modImportCounter])

    async function modIsOneshotMod(): Promise<void> {
        setOpenNotOneshotMod(false);
        
        if (await window.api.isModHaveConflict(modImportDestinationPath)) {
            setOpenModConflict(true);
        }
    }

    async function modIsFine(): Promise<void> {
        setOpenModConflict(false);
    }

    async function updateEvery100ms(): Promise<void> {
        window.api.updateEvery100ms();
        setModConfigs(await window.api.getModConfigs());
    }

    // the 100 ms interval clock
    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateDelay(updateDelay + 1);

            updateEvery100ms();
        }, 100);

        return () => clearInterval(interval);
    }, [updateDelay]);

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
                // this is shitty but it work
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

            setOpenOneShotFolderInvalidModal(false);
        }
    }

    async function fileIsNotOneshotMod(): Promise<void> {
        window.api.deleteMod(modImportDestinationPath);
        setOpenNotOneshotMod(false);
    }

    async function modIsConflictWithOtherMod(): Promise<void> {
        window.api.deleteMod(modImportDestinationPath);
        setOpenModConflict(false);
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

            <Modal haveCloseButton={false} canClose={isFolderOneshotDir} className="" openModal={openOneShotFolderInvalidModal} closeModal={() => setOpenOneShotFolderInvalidModal(false)}>
                <p className="oneshot-folder-not-selected-warning">Please select oneshot folder located in steamapps/common</p>
                <FolderSelector folderNotValidWarningMessage="This folder doesn't contain oneshot" isWarningTriggered={!isFolderOneshotDir} getFolderPath={(): string => oneshotFolder} setFolderPath={(folderPath: string) => setOneshotFolder(folderPath)} openFolderPathSelector={oneshotFolderPathSelector} />
                <TextButton text="Confirm" className="oneshot-folder-path-confirm-button" onClick={oneshotFolderPathConfirmClicked} />
            </Modal>

            <Modal haveCloseButton={false} canClose={false} className="not-oneshot-modal" openModal={openNotOneshotMod} closeModal={() => setOpenNotOneshotMod(false)}>
                <p className="not-oneshot-mod-text">It seems that this file is not a oneshot mod</p>
                <div className="not-oneshot-mod-button-container">
                    <TextButton text="Load it anyways" className="not-oneshot-mod-modal-button" onClick={modIsOneshotMod} />
                    <TextButton text="Exit" className="not-oneshot-mod-modal-button" onClick={fileIsNotOneshotMod} />
                </div>
            </Modal>

            <Modal haveCloseButton={false} canClose={false} className="not-oneshot-modal" openModal={openModConflict} closeModal={() => setOpenModConflict(false)}>
                <p className="not-oneshot-mod-text">This mod have conflict with other mod and loading it will cause weird thing to happen</p>
                <div className="not-oneshot-mod-button-container">
                    <TextButton text="Load it anyways" className="not-oneshot-mod-modal-button" onClick={modIsFine} />
                    <TextButton text="Exit" className="not-oneshot-mod-modal-button" onClick={modIsConflictWithOtherMod} />
                </div>
            </Modal>

            <Modal haveCloseButton={false} canClose={false} className="" openModal={openModLoading} closeModal={() => setOpenModLoading(false)}>
                <div className="loading-mod-container">
                    <p className="loading-mod-text">Importing mod...</p>
                    <img src={loadingImgPath} width="64" height="64" />
                </div>
            </Modal>
        </div>
    )
}