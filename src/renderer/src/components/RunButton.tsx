import './RunButton.css'
import runButtonPath from '../assets/icons/run.png'

interface Props {
  onClick: () => void
}

export default function RunButton({ onClick }: Props): JSX.Element {
  return (
    <div className="run-button" onClick={onClick}>
      <img className="run-button-image" src={runButtonPath} />
      <p className="run-button-text">Run Oneshot</p>
    </div>
  )
}