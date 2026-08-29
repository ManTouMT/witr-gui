import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc'
import { setupTray } from './tray'
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './shortcuts'
import { windowManager } from './windows'
import { join } from 'path'
import * as fs from 'fs'

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.witr.gui')

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
  const trayWin = windowManager.trayManager.createWindow()
  const mainWin = windowManager.mainManager.createWindow()

  // Automated Real Screenshot Capture Mode
  if (process.env.CAPTURE_SCREENSHOTS === '1') {
    const docsImagesDir = join(process.cwd(), 'docs/images')
    if (!fs.existsSync(docsImagesDir)) {
      fs.mkdirSync(docsImagesDir, { recursive: true })
    }

    console.log('[Capture] Waiting for initial data load...')
    mainWin.show()
    mainWin.setSize(1280, 800)
    await new Promise((r) => setTimeout(r, 3000))

    // 1. Capture Workbench Ports Mode
    const img1 = await mainWin.webContents.capturePage()
    fs.writeFileSync(join(docsImagesDir, 'screenshot-workbench.png'), img1.toPNG())
    console.log('✓ Captured docs/images/screenshot-workbench.png')

    // 2. Switch to Processes Mode & Search QQ
    await mainWin.webContents.executeJavaScript(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('系统进程'));
        if (btn) btn.click();
      })()
    `)
    await new Promise((r) => setTimeout(r, 2500))

    const img2 = await mainWin.webContents.capturePage()
    fs.writeFileSync(join(docsImagesDir, 'screenshot-processes.png'), img2.toPNG())
    console.log('✓ Captured docs/images/screenshot-processes.png')

    // 3. Switch to Interactive Topology Graph View
    await mainWin.webContents.executeJavaScript(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('交互拓扑图'));
        if (btn) btn.click();
      })()
    `)
    await new Promise((r) => setTimeout(r, 2500))

    const img3 = await mainWin.webContents.capturePage()
    fs.writeFileSync(join(docsImagesDir, 'screenshot-topology.png'), img3.toPNG())
    console.log('✓ Captured docs/images/screenshot-topology.png')

    // 4. Capture Tray Popover View
    trayWin.show()
    trayWin.setSize(420, 560)
    await new Promise((r) => setTimeout(r, 2000))

    const img4 = await trayWin.webContents.capturePage()
    fs.writeFileSync(join(docsImagesDir, 'screenshot-tray.png'), img4.toPNG())
    console.log('✓ Captured docs/images/screenshot-tray.png')

    console.log('ALL 4 REAL SCREENSHOTS CAPTURED!')
    app.quit()
    process.exit(0)
    return
  }

  app.on('activate', () => {
    windowManager.showWorkbenchWindow()
  })
})

app.on('will-quit', () => {
  unregisterGlobalShortcuts()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
