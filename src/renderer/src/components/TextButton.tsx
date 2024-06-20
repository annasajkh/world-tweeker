/* eslint-disable prettier/prettier */

import "./TextButton.css"

type Props = {
    className: string
    text: string
    onClick: () => void
}

export default function TextButton(props: Props): JSX.Element {
  return (
    <div className={`text-button ${props.className}`} onClick={props.onClick}>
        <p>{props.text}</p>
    </div>
  )
}