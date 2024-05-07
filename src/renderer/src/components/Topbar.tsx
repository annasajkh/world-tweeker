import RunButton from './RunButton'
import './Topbar.css'

export default function Topbar(): JSX.Element {
  function runButtonClicked(): void {
    window.electron.ipcRenderer.send('runOneshot')
  }

  return (
    <div className="top-bar">
      <RunButton onClick={runButtonClicked} />
    </div>
  )
}
