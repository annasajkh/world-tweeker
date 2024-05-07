import { spawn } from 'child_process'
import os from 'os'

export function runOneshot(): void {
  switch (os.platform()) {
    case 'win32':
      spawn('explorer', ['steam://rungameid/420530'])
      break
    case 'linux':
      spawn('xdg-open', ['steam://rungameid/420530'])
      break
    case 'darwin':
        spawn('open', ['steam://rungameid/420530'])
      break
    default:
      throw new Error('Unsupported platform')
  }
}
