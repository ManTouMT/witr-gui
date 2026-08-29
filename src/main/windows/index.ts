import { Tray } from 'electron'
import { TrayWindowManager } from './tray-window'
import { MainWindowManager } from './main-window'

export class WindowManager {
  public trayManager = new TrayWindowManager()
  public mainManager = new MainWindowManager()
  private tray: Tray | null = null

  setTray(tray: Tray): void {
    this.tray = tray
  }

  showTrayWindow(): void {
    if (this.tray) {
      this.trayManager.show(this.tray)
    }
  }

  hideTrayWindow(): void {
    this.trayManager.hide()
  }

  toggleTrayWindow(): void {
    if (this.tray) {
      this.trayManager.toggle(this.tray)
    }
  }

  resizeTrayWindow(width: number, height: number): void {
    this.trayManager.resize(width, height)
  }

  showWorkbenchWindow(): void {
    this.mainManager.show()
  }

  toggleWorkbenchWindow(): void {
    this.mainManager.toggle()
  }
}

export const windowManager = new WindowManager()
