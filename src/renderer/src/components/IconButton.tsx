/* eslint-disable prettier/prettier */

import './IconButton.css'

interface Props {
    className: string
    src: string
    onClick: () => void
}

export default function IconButton({ className, src, onClick }: Props): JSX.Element {
    return (
        <div className={`icon-button ${className}`} onClick={onClick}>
            <img src={src} className="icon-button-image" />
        </div>
    )
}
