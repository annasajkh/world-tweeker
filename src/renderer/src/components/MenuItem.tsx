/* eslint-disable prettier/prettier */
import "./MenuItem.css"

type Props = {
    text: string;
    onClick: () => void;
}

export default function MenuItem(props: Props): JSX.Element {
  return (
    <div className="menu-item" onClick={props.onClick}>
        <p className="menu-item-text">{props.text}</p>
    </div>
  )
}