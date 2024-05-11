/* eslint-disable prettier/prettier */

import "./FolderSelector.css"
import IconButton from "./IconButton"

interface Props {
    folderNotValidWarningMessage: string,
    isWarningTriggered: boolean,
    getFolderPath: () => string,
    setFolderPath: (folderPath: string) => void
    openFolderPathSelector: () => void
}


export default function FolderSelector({ folderNotValidWarningMessage, isWarningTriggered, getFolderPath, setFolderPath, openFolderPathSelector }: Props): JSX.Element {
    return (
        <div className="folder-selector">
            <div className="folder-selector-content">
                <input className={`folder-selector-input ${isWarningTriggered ? "folder-selector-input-not-valid-warning" : ""}`} value={getFolderPath()} onChange={(event) => setFolderPath(event.target.value)}></input>
                <IconButton className="folder-selector-button" onClick={openFolderPathSelector} src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAeklEQVR4nO3SQQqAMAxE0R5E155dEbyYinqBLyVdRSsU4m4edJVhKE1TEhGRFkAPzMBVzgIMv2ax4cbTnmcvRTFZ7EY1kyuLy2JPUHO6srgs34Gjoawtiy28ZnRlcVlgKAv3VqBzZbFZ7AdO+e3LGX2R+63hWRERSTU3Nt2uZQFPA68AAAAASUVORK5CYII="} />
            </div>
            {isWarningTriggered ? <p className="folder-selector-not-valid-warning">{folderNotValidWarningMessage}</p>: <></>}
        </div>
    )
}