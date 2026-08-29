import { BrowserWindow, screen, Tray } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'

export class TrayWindowManager {
  private window: BrowserWindow | null = null

  createWindow(): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      return this.window
    }

    this.window = new BrowserWindow({
      width: 420,
      height: 560,
      show: false,
      frame: false,
      resizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      vibrancy: 'popover',
      visualEffectState: 'active',
      transparent: true,
      hasShadow: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true
      }
    })

    // Hide when clicking outside / losing focus
    this.window.on('blur', () => {
      this.hide()
    })

    const modeQuery = 'mode=tray'
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?${modeQuery}`)
    } else {
      this.window.loadFile(join(__dirname, '../renderer/index.html'), {
        query: { mode: 'tray' }
      })
    }

    return this.window
  }

  show(tray: Tray): void {
    if (!this.window || this.window.isDestroyed()) {
      this.createWindow()
    }

    if (!this.window) return

    const trayBounds = tray.getBounds()
    const windowBounds = this.window.getBounds()
    const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y })
    const { x: displayX, width: displayWidth } = display.workArea

    // Center horizontally below tray icon relative to current display workArea
    let x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
    // Constrain within current display bounds
    if (x + windowBounds.width > displayX + displayWidth - 10) {
      x = displayX + displayWidth - windowBounds.width - 10
    }
    if (x < displayX + 10) {
      x = displayX + 10
    }

    const y = Math.round(trayBounds.y + trayBounds.height + 4)

    this.window.setPosition(x, y, false)
    this.window.show()
    this.window.focus()
  }

  hide(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.hide()
    }
  }

  toggle(tray: Tray): void {
    if (!this.window || this.window.isDestroyed() || !this.window.isVisible()) {
      this.show(tray)
    } else {
      this.hide()
    }
  }

  resize(width: number, height: number): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.setSize(width, height)
    }
  }

  getWindow(): BrowserWindow | null {
    return this.window
  }
}
