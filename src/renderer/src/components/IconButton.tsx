/* eslint-disable prettier/prettier */
import './IconButton.css'

interface Props {
    className: string
    iconPath: string
    onClick: () => void
}

export default function IconButton({ className, iconPath, onClick }: Props): JSX.Element {
    return (
        <div className={`icon-button ${className}`} onClick={onClick}>
            <img src={iconPath} className="icon-button-image" />
        </div>
    )
}
