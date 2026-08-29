import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { portSniffer } from '../src/main/engine/port-sniffer.js'
import { processSniffer } from '../src/main/engine/process-sniffer.js'
import { witrBridge } from '../src/main/engine/witr-bridge.js'
import { actionResolver } from '../src/main/engine/action-resolver.js'
import { IPC_CHANNELS } from '../src/shared/ipc-events.js'

function registerAllIpc() {
  ipcMain.handle(IPC_CHANNELS.GET_ACTIVE_PORTS, async () => {
    return await portSniffer.scanActivePorts(false)
  })
  ipcMain.handle(IPC_CHANNELS.SCAN_PORTS, async () => {
    return await portSniffer.scanActivePorts(true)
  })
  ipcMain.handle(IPC_CHANNELS.GET_ALL_PROCESSES, async () => {
    return await processSniffer.scanAllProcesses(false)
  })
  ipcMain.handle(IPC_CHANNELS.GET_PROCESS_CHILDREN, (_, pid) => {
    return processSniffer.getChildrenOfPid(pid)
  })
  ipcMain.handle(IPC_CHANNELS.INSPECT_PORT, async (_, port) => {
    return await witrBridge.inspectPort(port)
  })
  ipcMain.handle(IPC_CHANNELS.INSPECT_PID, async (_, pid) => {
    return await witrBridge.inspectPid(pid)
  })
  ipcMain.handle(IPC_CHANNELS.INSPECT_CONTAINER, async (_, name) => {
    return await witrBridge.runWitr(['--container', name])
  })
  ipcMain.handle(IPC_CHANNELS.KILL_PROCESS, async (_, req, procName) => {
    return await actionResolver.killProcess(req, procName)
  })
  ipcMain.handle(IPC_CHANNELS.OPEN_PATH, async (_, req) => {
    return await actionResolver.openPath(req)
  })
  ipcMain.handle(IPC_CHANNELS.COPY_TEXT, async (_, text) => {
    return true
  })
}

app.whenReady().then(async () => {
  registerAllIpc()

  const docsImagesDir = join(process.cwd(), 'docs/images')
  if (!fs.existsSync(docsImagesDir)) {
    fs.mkdirSync(docsImagesDir, { recursive: true })
  }

  const preloadPath = join(process.cwd(), 'out/preload/index.mjs')

  // 1. Capture Workbench View (Ports Mode)
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    frame: false,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true
    }
  })

  await win.loadFile(join(process.cwd(), 'out/renderer/index.html'), {
    query: { mode: 'workbench' }
  })

  // Wait for React to fetch ports and render target causal tree
  await new Promise((r) => setTimeout(r, 3000))

  const img1 = await win.webContents.capturePage()
  fs.writeFileSync(join(docsImagesDir, 'screenshot-workbench.png'), img1.toPNG())
  console.log('✓ 1/4 Captured docs/images/screenshot-workbench.png')

  // 2. Switch to Processes Mode & Capture
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('系统进程'));
      if (btn) btn.click();
    })()
  `)
  await new Promise((r) => setTimeout(r, 2500))

  const img2 = await win.webContents.capturePage()
  fs.writeFileSync(join(docsImagesDir, 'screenshot-processes.png'), img2.toPNG())
  console.log('✓ 2/4 Captured docs/images/screenshot-processes.png')

  // 3. Switch to Topology Graph Mode & Capture
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('交互拓扑图'));
      if (btn) btn.click();
    })()
  `)
  await new Promise((r) => setTimeout(r, 2500))

  const img3 = await win.webContents.capturePage()
  fs.writeFileSync(join(docsImagesDir, 'screenshot-topology.png'), img3.toPNG())
  console.log('✓ 3/4 Captured docs/images/screenshot-topology.png')

  win.close()

  // 4. Capture MenuBar Popover Tray View
  const trayWin = new BrowserWindow({
    width: 420,
    height: 560,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true
    }
  })

  await trayWin.loadFile(join(process.cwd(), 'out/renderer/index.html'), {
    query: { mode: 'tray' }
  })

  await new Promise((r) => setTimeout(r, 2000))

  const img4 = await trayWin.webContents.capturePage()
  fs.writeFileSync(join(docsImagesDir, 'screenshot-tray.png'), img4.toPNG())
  console.log('✓ 4/4 Captured docs/images/screenshot-tray.png')

  trayWin.close()

  console.log('🎉 ALL 4 SCREENSHOTS SUCCESSFULLY CAPTURED!')
  app.quit()
  process.exit(0)
})
