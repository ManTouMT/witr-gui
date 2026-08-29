import { app, Menu, nativeImage, Tray } from 'electron'
import { join } from 'path'
import { windowManager } from './windows'

export function setupTray(): Tray {
  // Create a default monochrome template icon for macOS status bar (18x18 / 36x36 retina)
  // Transparent base64 16x16 PNG with a distinct 'w' logo
  const iconBase64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFPSURBVHgB7ZaxTgJBEIaxF1gQaXz5BDbGwt/GSq7xAbaWxsLH8AEM9hYGBzV3sTK2VlYmtjYGBh4ACxT3T7LJm2Uv2Zubf8lkM1nu3/12drNJ8h+1jK8B3AB3oI8e7rA57k6V+eQ4B+aAOvAfbIuV5nKcB/zAE9BG5h7YFCvd5SgCvoE6Yp5oA8tS5bg85wEXQBuxO8y1bZ6rc5wH/EAHsZ8whbYp1/Gch8I7e4v9hCm01XvB5XF25kH5E/sJ05Y/2h3O45wFzg53gJ03bH8dE6jPqH3lDnc4j3MWODfcA3besP0bE6jPt/j5e8E8zlng7HAHGILn63Y7D7h9yXG9O/v2Z2Q/8y3z0P/W85/Z5xL1ZgJ9gHk35fX86d/gUe/Qd/r1eG/mZ32tP7a55F0O9P4G9Zg3l/f4a5tP/qP+A04v4vG0eB5RAAAAAElFTkSuQmCC'

  const icon = nativeImage.createFromDataURL(iconBase64)
  icon.setTemplateImage(true) // Automatically matches macOS Dark/Light menu bar

  const tray = new Tray(icon)
  tray.setToolTip('Witr - Visual Process Inspector')

  tray.on('click', () => {
    windowManager.toggleTrayWindow()
  })

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '打开全景工作台 (Workbench)',
        click: () => windowManager.showWorkbenchWindow()
      },
      { type: 'separator' },
      {
        label: '关于 Witr GUI',
        click: () => {
          windowManager.showWorkbenchWindow()
        }
      },
      {
        label: '退出',
        role: 'quit'
      }
    ])
    tray.popUpContextMenu(contextMenu)
  })

  windowManager.setTray(tray)
  return tray
}
