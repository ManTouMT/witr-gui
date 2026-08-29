const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')

app.whenReady().then(async () => {
  const docsImagesDir = path.join(process.cwd(), 'docs/images')
  if (!fs.existsSync(docsImagesDir)) {
    fs.mkdirSync(docsImagesDir, { recursive: true })
  }

  const preloadPath = path.join(process.cwd(), 'out/preload/index.mjs')

  // Helper to create and capture
  const captureWindow = async (options, urlQuery, setupFn, filename) => {
    try {
      const win = new BrowserWindow({
        ...options,
        show: false,
        frame: false,
        webPreferences: {
          preload: preloadPath,
          sandbox: false,
          contextIsolation: true
        }
      })

      await win.loadFile(path.join(process.cwd(), 'out/renderer/index.html'), {
        query: urlQuery
      })

      await new Promise((r) => setTimeout(r, 2200))
      if (setupFn) {
        await win.webContents.executeJavaScript(setupFn).catch((e) => console.error(e))
        await new Promise((r) => setTimeout(r, 1500))
      }

      const img = await win.webContents.capturePage()
      fs.writeFileSync(path.join(docsImagesDir, filename), img.toPNG())
      console.log(`✓ Saved docs/images/${filename}`)
      win.close()
    } catch (e) {
      console.error(`Failed capturing ${filename}:`, e)
    }
  }

  // 1. Capture Workbench Ports View
  await captureWindow(
    { width: 1280, height: 800 },
    { mode: 'workbench' },
    null,
    'screenshot-workbench.png'
  )

  // 2. Capture Processes View
  await captureWindow(
    { width: 1280, height: 800 },
    { mode: 'workbench' },
    `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('系统进程'));
      if (btn) btn.click();
    })()`,
    'screenshot-processes.png'
  )

  // 3. Capture Topology Graph View
  await captureWindow(
    { width: 1280, height: 800 },
    { mode: 'workbench' },
    `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('交互拓扑图'));
      if (btn) btn.click();
    })()`,
    'screenshot-topology.png'
  )

  // 4. Capture MenuBar Popover Tray View
  await captureWindow(
    { width: 420, height: 560, transparent: true },
    { mode: 'tray' },
    null,
    'screenshot-tray.png'
  )

  console.log('ALL 4 SCREENSHOTS COMPLETED!')
  app.quit()
  process.exit(0)
})
