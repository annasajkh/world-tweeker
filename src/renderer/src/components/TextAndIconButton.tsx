/* eslint-disable prettier/prettier */

import './TextAndIconButton.css'

type Props = {
    className: string,
    iconBase64: string,
    text: string,
    onClick: () => void
}

export default function TextAndIconButton(props: Props): JSX.Element {
    return (
        <div className={`run-button ${props.className}`} onClick={props.onClick}>
            <img className="run-button-image" src={props.iconBase64} />
            <p className="run-button-text">{props.text}</p>
        </div>
    )
}
