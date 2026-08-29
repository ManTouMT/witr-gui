import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc'
import { setupTray } from './tray'
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './shortcuts'
import { windowManager } from './windows'

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.witr.gui')

  // Default open or close DevTools by F12 in dev
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 1. Register IPC channels
  registerIpcHandlers()

  // 2. Setup System Tray
  setupTray()

  // 3. Register Global Shortcuts
  registerGlobalShortcuts()

  // 4. Create windows
  windowManager.trayManager.createWindow()
  windowManager.mainManager.createWindow()

  app.on('activate', () => {
    // On macOS dock icon click, open main workbench
    windowManager.showWorkbenchWindow()
  })
})

app.on('will-quit', () => {
  unregisterGlobalShortcuts()
})

app.on('window-all-closed', () => {
  // Do not quit on macOS so tray remains active in menu bar
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
