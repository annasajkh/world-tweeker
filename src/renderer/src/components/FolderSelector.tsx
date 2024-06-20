/* eslint-disable prettier/prettier */

import "./FolderSelector.css"
import IconButton from "./IconButton"

type Props = {
    folderNotValidWarningMessage: string,
    isWarningTriggered: boolean,
    getFolderPath: () => string,
    setFolderPath: (folderPath: string) => void
    openFolderPathSelector: () => void
}


export default function FolderSelector(props: Props): JSX.Element {
    return (
        <div className="folder-selector">
            <div className="folder-selector-content">
                <input className={`folder-selector-input ${props.isWarningTriggered ? "folder-selector-input-invalid" : ""}`} value={props.getFolderPath()} onChange={(event) => props.setFolderPath(event.target.value)}></input>
                <IconButton className="folder-selector-button" onClick={props.openFolderPathSelector} src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAeklEQVR4nO3SQQqAMAxE0R5E155dEbyYinqBLyVdRSsU4m4edJVhKE1TEhGRFkAPzMBVzgIMv2ax4cbTnmcvRTFZ7EY1kyuLy2JPUHO6srgs34Gjoawtiy28ZnRlcVlgKAv3VqBzZbFZ7AdO+e3LGX2R+63hWRERSTU3Nt2uZQFPA68AAAAASUVORK5CYII="} />
            </div>
            {props.isWarningTriggered ? <p className="folder-selector-invalid">{props.folderNotValidWarningMessage}</p>: <></>}
        </div>
    )
}