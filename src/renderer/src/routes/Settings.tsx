/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import IconButton from '@renderer/components/IconButton'
import './Settings.css'
import backButtonPath from '../assets/icons/back_button.png'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import threeDotsPath from "../assets/icons/3_dots.png"

export default function Settings(): JSX.Element {
    const [oneshotFolder, setOneshotFolder] = useState<string>(window.api.getOneshotFolder())

    useEffect(() => {
        window.api.setOneshotFolder(oneshotFolder)
    }, [oneshotFolder])


    async function oneshotFolderPathSelector(): Promise<void> {
        const result: any = await window.api.openOneshotFolder()
        const path: string = result.filePaths[0];

        if (path !== undefined) {
            setOneshotFolder(path)
        }
    }

    return (
        <>
            <Link to="/">
                <IconButton iconPath={backButtonPath} onClick={() => { }} className={'back-button'} />
            </Link>

            <div className="settings">
                <div className="settings-items">
                    <div className="settings-items-centered">
                        <p className="oneshot-folder-path-description">Oneshot folder path</p>
                        <div className="oneshot-folder-path-container">
                            <input value={oneshotFolder} onChange={(event) => setOneshotFolder(event.target.value)} className="oneshot-folder-path-input"></input>
                            <IconButton className="oneshot-folder-path-selector" iconPath={threeDotsPath} onClick={oneshotFolderPathSelector} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
