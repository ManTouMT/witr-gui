import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { getPreloadPath } from '../src/main/windows/utils'

// Script to take real pixel-perfect screenshots of Witr GUI views
app.whenReady().then(async () => {
  const docsImagesDir = join(process.cwd(), 'docs/images')
  if (!fs.existsSync(docsImagesDir)) {
    fs.mkdirSync(docsImagesDir, { recursive: true })
  }

  // 1. Capture Main Workbench View (Ports Mode)
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    frame: false,
    webPreferences: {
      preload: getPreloadPath(),
      sandbox: false,
      contextIsolation: true
    }
  })

  await win.loadFile(join(process.cwd(), 'out/renderer/index.html'), {
    query: { mode: 'workbench' }
  })

  // Wait for React and ports to fetch
  await new Promise((r) => setTimeout(r, 2000))

  const image1 = await win.webContents.capturePage()
  fs.writeFileSync(join(docsImagesDir, 'screenshot-workbench.png'), image1.toPNG())
  console.log('✓ Captured screenshot-workbench.png')

  // 2. Switch to Processes Mode & Capture
  await win.webContents.executeJavaScript(`
    const store = window.__ZUSTAND_STORE__ || null;
    // Click processes button
    const btn = document.querySelectorAll('button');
    for (const b of btn) {
      if (b.innerText.includes('系统进程') || b.innerText.includes('Processes')) {
        b.click();
        break;
      }
    }
  `)
  await new Promise((r) => setTimeout(r, 1500))

  const image2 = await win.webContents.capturePage()
  fs.writeFileSync(join(docsImagesDir, 'screenshot-processes.png'), image2.toPNG())
  console.log('✓ Captured screenshot-processes.png')

  // 3. Switch to Topology Graph Mode & Capture
  await win.webContents.executeJavaScript(`
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.innerText.includes('交互拓扑图') || b.innerText.includes('Graph')) {
        b.click();
        break;
      }
    }
  `)
  await new Promise((r) => setTimeout(r, 1500))

  const image3 = await win.webContents.capturePage()
  fs.writeFileSync(join(docsImagesDir, 'screenshot-topology.png'), image3.toPNG())
  console.log('✓ Captured screenshot-topology.png')

  // 4. Capture Tray Popover View
  const trayWin = new BrowserWindow({
    width: 420,
    height: 560,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: getPreloadPath(),
      sandbox: false,
      contextIsolation: true
    }
  })

  await trayWin.loadFile(join(process.cwd(), 'out/renderer/index.html'), {
    query: { mode: 'tray' }
  })

  await new Promise((r) => setTimeout(r, 1500))
  const image4 = await trayWin.webContents.capturePage()
  fs.writeFileSync(join(docsImagesDir, 'screenshot-tray.png'), image4.toPNG())
  console.log('✓ Captured screenshot-tray.png')

  app.quit()
})
