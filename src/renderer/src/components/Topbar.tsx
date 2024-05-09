/* eslint-disable prettier/prettier */
import IconButton from "./IconButton"
import RunButton from './RunButton'
import './Topbar.css'
import settingButtonPath from '../assets/icons/settings.png'
import { Link } from "react-router-dom"


export default function Topbar(): JSX.Element {
    async function runButtonClicked(): Promise<void> {
        await window.api.runOneshot();
    }

    return (
        <div className="top-bar">
            <RunButton onClick={runButtonClicked} />
            <Link to="/settings">
                <IconButton iconPath={settingButtonPath} onClick={() => { }} className={""} />
            </Link>
        </div>
    )
}