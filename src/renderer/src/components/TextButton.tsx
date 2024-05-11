/* eslint-disable prettier/prettier */
import "./TextButton.css"

interface Props {
    className: string
    text: string
    onClick: () => void
}

export default function TextButton({ className, text, onClick }: Props): JSX.Element {
  return (
    <div className={`text-button ${className}`} onClick={onClick}>
        <p>{text}</p>
    </div>
  )
}
