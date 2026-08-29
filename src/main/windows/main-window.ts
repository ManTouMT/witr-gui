import { BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { getPreloadPath } from './utils'

export class MainWindowManager {
  private window: BrowserWindow | null = null

  createWindow(): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      return this.window
    }

    this.window = new BrowserWindow({
      width: 1180,
      height: 780,
      minWidth: 960,
      minHeight: 600,
      show: false,
      title: 'Witr Visual Process Workbench',
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 16, y: 16 },
      vibrancy: 'sidebar',
      visualEffectState: 'active',
      autoHideMenuBar: true,
      webPreferences: {
        preload: getPreloadPath(),
        sandbox: false,
        contextIsolation: true
      }
    })

    this.window.on('ready-to-show', () => {
      this.window?.show()
    })

    const modeQuery = 'mode=workbench'
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?${modeQuery}`)
    } else {
      this.window.loadFile(join(__dirname, '../renderer/index.html'), {
        query: { mode: 'workbench' }
      })
    }

    return this.window
  }

  show(): void {
    if (!this.window || this.window.isDestroyed()) {
      this.createWindow()
    } else {
      this.window.show()
      this.window.focus()
    }
  }

  hide(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.hide()
    }
  }

  toggle(): void {
    if (!this.window || this.window.isDestroyed() || !this.window.isVisible()) {
      this.show()
    } else {
      this.hide()
    }
  }

  getWindow(): BrowserWindow | null {
    return this.window
  }
}
