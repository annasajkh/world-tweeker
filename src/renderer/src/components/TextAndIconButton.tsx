/* eslint-disable prettier/prettier */

import './TextAndIconButton.css'

interface Props {
    className: string,
    iconBase64: string,
    text: string,
    onClick: () => void
}

export default function TextAndIconButton({ className, iconBase64, text, onClick }: Props): JSX.Element {
    return (
        <div className={`run-button ${className}`} onClick={onClick}>
            <img className="run-button-image" src={iconBase64} />
            <p className="run-button-text">{text}</p>
        </div>
    )
}
