/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import IconButton from "./IconButton";
import MenuItem from "./MenuItem";
import "./ModItem.css"
import * as Popover from "@radix-ui/react-popover";
import { EnableData, SettingsData } from "@renderer/utils/interfaces";
import Modal from "./Modal";
import TextButton from "./TextButton";

interface Prop {
    name: string;
    modPath: string,
    iconBase64: string | null;
    author: string | null;
}

export default function ModItem({ name, modPath, iconBase64, author }: Prop): JSX.Element {
    const [enabled, setEnabled] = useState(true);
    const [openDeleteModConfirm, setOpenDeleteModConfirm] = useState(false);

    useEffect(() => {
        async function setup(): Promise<void> {
            const settings: SettingsData = JSON.parse(await window.api.readSettingsFile());
            const modEnabledConfigs: EnableData[] = settings.modEnabledConfigs;

            const result = modEnabledConfigs.filter(modEnabledConfig => {
                return modEnabledConfig.key === modPath
            })

            if (result.length != 0) {
                setEnabled(result[0].enabled);
                await window.api.setModEnabled(modPath, result[0].enabled);
            }
        }

        setup();
    }, [])

    async function enableMod(): Promise<void> {
        setEnabled(!enabled);
        await window.api.setModEnabled(modPath, !enabled);

        const settings: SettingsData = JSON.parse(await window.api.readSettingsFile());

        let modEnabledConfigs: EnableData[] = settings.modEnabledConfigs;

        if (modEnabledConfigs == undefined || modEnabledConfigs == null) {
            modEnabledConfigs = [];
        } else {
            const result = modEnabledConfigs.filter(modEnabledConfig => {
                return modEnabledConfig.key === modPath
            })

            if (result.length == 0) {
                modEnabledConfigs.push({
                    key: modPath,
                    enabled: !enabled
                });
            } else {
                result[0].enabled = !enabled;
            }
        }

        const settingsJson = {
            oneshotPath: settings.oneshotPath,
            modEnabledConfigs: modEnabledConfigs
        }

        await window.api.writeSettingsFile(JSON.stringify(settingsJson));
    }

    async function openModFolderInFileManager(): Promise<void> {
        await window.api.openFolderInFileManager(modPath);
    }

    function deleteModConfirmation(): void {
        setOpenDeleteModConfirm(true);
    }
    
    async function deleteMod(): Promise<void> {
        await window.api.deleteMod(modPath);

        const settings: SettingsData = JSON.parse(await window.api.readSettingsFile());

        let modEnabledConfigs: EnableData[] = settings.modEnabledConfigs;

        modEnabledConfigs = modEnabledConfigs.filter((object) => {
            return object.key !== modPath;
        });

        const settingsJson = {
            oneshotPath: settings.oneshotPath,
            modEnabledConfigs: modEnabledConfigs
        }

        await window.api.writeSettingsFile(JSON.stringify(settingsJson));
    }

    return (
        <div className={"mod-item"}>
            {iconBase64 != null ? <img className={`mod-item-image ${enabled ? "" : "mod-disabled-style-image"}`} src={iconBase64} /> : <img className={`mod-item-image ${enabled ? "" : "mod-disabled-style-image"}`} src="data:image/png;base64,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Aa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHAAa6O0NiBBjTQsYHA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" />}
            <p className={`mod-item-name ${enabled ? "" : "mod-disabled-style-text"}`}>{name}</p>
            {author != null ? <p className={`mod-item-author ${enabled ? "" : "mod-disabled-style-text"}`}>by {author}</p> : <p className="mod-item-author">by ????????</p>}
            <Popover.Root>
                <Popover.Trigger asChild>
                    <IconButton className="mod-item-menu-button" onClick={() => { }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAv0lEQVR4nO3ZQQrCMBRF0T+xrsG6Q6vuUqug0q1InV8JyVSazl7kHcgCPr9tuDTCrB3AFjgBN+BTzggcgS5aAOyBid9eQB8NbGJi2VN6M8CZekOoAu4rBhlDFTCvGGSOPxnkHarIn9ta11BFvidqHUIV0JV7YskD2IQyoF8YJg2xixaQNzOk96B8ANK5pMdJfhNmVs89osI9ogb3iBjcI2JwjwjCPWJmzcH/R0S4R9TgHhGDe0QM7hFBuEfMQtEXjYHvPAR3/K0AAAAASUVORK5CYII=" />
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content className="PopoverContent" sideOffset={4} align={"start"}>
                        <div className="mod-item-menu-popup-items">
                            <MenuItem text={enabled ? "Disable" : "Enable"} onClick={enableMod} />
                            <Popover.Close asChild>
                                <MenuItem text="Open Mod Folder" onClick={openModFolderInFileManager} />
                            </Popover.Close>
                            <MenuItem text="Delete" onClick={deleteModConfirmation} />
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

            <Modal haveCloseButton={false} canClose={false} className="mod-item-delete-warning" openModal={openDeleteModConfirm} closeModal={() => setOpenDeleteModConfirm(false)}>
                <p className="mod-item-delete-warning-text">Do you want to delete the mod folder at {modPath.trim() ? `"${modPath.trim()}"` : '""'}?</p>
                <div className="mod-item-delete-confirm-button-container">
                    <TextButton text="Yes" className="mod-item-delete-confirm-button" onClick={deleteMod} />
                    <TextButton text="No" className="mod-item-delete-confirm-button" onClick={() => setOpenDeleteModConfirm(false)} />
                </div>
            </Modal>
        </div>
    )
}