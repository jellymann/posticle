const path = require('path')
const { Application } = require('spectron')

const appPath = () => {
  switch (process.platform) {
    case 'darwin':
      return path.join(__dirname, '..', '.tmp', 'mac', 'Posticle.app', 'Contents', 'MacOS', 'Posticle')
    case 'linux':
      return path.join(__dirname, '..', '.tmp', 'linux', 'Posticle')
    case 'win32':
      return path.join(__dirname, '..', '.tmp', 'win-unpacked', 'Posticle.exe')
    default:
      throw Error(`Unsupported platform ${process.platform}`)
  }
}
global.app = new Application({ path: appPath() })
