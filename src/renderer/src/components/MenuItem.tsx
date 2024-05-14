/* eslint-disable prettier/prettier */
import "./MenuItem.css"

interface Props {
    text: string;
    onClick: () => void;
}

export default function MenuItem({ text, onClick }: Props): JSX.Element {
  return (
    <div className="menu-item" onClick={onClick}>
        <p className="menu-item-text">{text}</p>
    </div>
  )
}