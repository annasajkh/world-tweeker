/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import IconButton from '@renderer/components/IconButton'
import './Settings.css'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import FolderSelector from "@renderer/components/FolderSelector"
import { SettingsData } from "../utils/types"

export default function Settings(): JSX.Element {
    const [oneshotFolder, setOneshotFolder] = useState<string>('');
    const [isFolderOneshotDir, setIsFolderOneshotDir] = useState(true);

    useEffect(() => {
        async function setup(): Promise<void> {
            if (await window.api.isSettingsFileExist()) {
                // load the settings and set the states
                const settings: string = await window.api.readSettingsFile();
                const settingsJson: SettingsData = JSON.parse(settings);

                setOneshotFolder(settingsJson["oneshotPath"]);
                setIsFolderOneshotDir(await window.api.isFolderOneshotDir(settingsJson["oneshotPath"]));
            } else {
                throw new Error("File doesn't exist");
            }
        }

        setup();
    }, [])


    async function oneshotFolderWriteSettingsFile(fileContent: string): Promise<void> {
        // damn this is shitty
        const settings: SettingsData = JSON.parse(await window.api.readSettingsFile());

        const settingsJson: SettingsData = {
            oneshotPath: fileContent,
            modEnabledConfigs: settings.modEnabledConfigs
        }

        await window.api.writeSettingsFile(JSON.stringify(settingsJson));
    }


    async function oneshotFolderPathSelector(): Promise<void> {
        const result: any = await window.api.openOneshotFolderSelector()
        const path: string = result.filePaths[0];

        if (path !== undefined) {
            setOneshotFolder(path);
            await oneshotFolderWriteSettingsFile(path);
            setIsFolderOneshotDir(await window.api.isFolderOneshotDir(path));
        }
    }

    return (
        <>
            <Link to="/">
                <IconButton onClick={() => { }} className={'back-button'} src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAACPElEQVR4nO2ayS4EURSGa0VbEBLTjqUFK73DToiEsDQ8gxBvYVgQErH1CGZvIGJNN1aGFh2sTfHJidtJRa5S0626Jb6kk+p01839c06de4ZynH/+KEADMAYsArtAAXgCXtRHrs/Ub/KfUaDesQGgGpgCDoF3giP37AOTspaTgoAaYA64JT5ugFkgl5SIIeASc1wAg6bdaIXk2BTLxy2iBTgheY6B5rhEtCtzp8W57CGqiCYVRtPmEmgNKyKXkjt5uVnwEA2sYx+rYUKsrQwECbNF7OXC16GpTmzbmfFjDUkVbOfa88FXCWAU7oFuoBfzTHgJkSw2iohOtU4e8+x51RNhUvHvIjrVd9O8AXU6IVIUhaEMdKk1OoA7kmNYJ2QpI5Zws6ATIiVoVixRYUsnRLLMrFiiQkEn5JHsWKJCWSdEOh1+yDuGAXp87uXZdiF9UYSEda0SlrlWMYMP+5mJ8FuyJfwuhlgobcvMm0xRSmmnKPUZSxpftUmj2sRBhtL4HX3w/tqAdMWJKCYf4ByIwvhfKXWrfhSixEhr33amPUW4rGJDm/Qnzn13HGU+gZ18AP2+RLjErGEfy4FEuFxMGse2cPTrA+4hptGisUJLKBHfBj1ByuC4KQJtkUS4xDSn5GZHMmyKRYRmGCqRIwk2jM7eZT5h2NUKgUNsROvMqFQhLq7kxE7rDQgRNKGqS+nFBkXu2ZEEMHRojRupDYARaWMC2+oFmgfXSzVyfSrlqVR2UhQBtbFv5B/HDj4BJ9iuhkOKtFIAAAAASUVORK5CYII="} />
            </Link>

            <div className="settings">
                <div className="settings-items">
                    <div className="settings-items-centered">
                        <p className="oneshot-folder-path-description">Oneshot folder path</p>
                        <FolderSelector folderNotValidWarningMessage="This folder doesn't contain oneshot" isWarningTriggered={!isFolderOneshotDir} getFolderPath={(): string => oneshotFolder} setFolderPath={(folderPath: string) => setOneshotFolder(folderPath)} openFolderPathSelector={oneshotFolderPathSelector} />
                    </div>
                </div>
            </div>
        </>
    )
}