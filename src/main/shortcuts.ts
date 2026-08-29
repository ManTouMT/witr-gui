import { globalShortcut } from 'electron'
import { windowManager } from './windows'

export function registerGlobalShortcuts(): void {
  // Option + Space or Alt + W to toggle Tray Window
  const shortcut = process.platform === 'darwin' ? 'Alt+W' : 'Alt+W'
  try {
    globalShortcut.register(shortcut, () => {
      windowManager.toggleTrayWindow()
    })

    // Cmd + Shift + W for Workbench
    globalShortcut.register('CommandOrControl+Shift+W', () => {
      windowManager.toggleWorkbenchWindow()
    })
  } catch (err) {
    console.warn('[Shortcuts] Could not register global shortcuts:', err)
  }
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll()
}
