import { ipcMain, clipboard } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-events'
import { portSniffer } from '../engine/port-sniffer'
import { witrBridge } from '../engine/witr-bridge'
import { actionResolver } from '../engine/action-resolver'
import { KillRequest, OpenDirectoryRequest } from '../../shared/types'
import { windowManager } from '../windows'

export function registerIpcHandlers(): void {
  // 1. Port Sniffing
  ipcMain.handle(IPC_CHANNELS.GET_ACTIVE_PORTS, async () => {
    return await portSniffer.scanActivePorts(false)
  })

  ipcMain.handle(IPC_CHANNELS.SCAN_PORTS, async () => {
    return await portSniffer.scanActivePorts(true)
  })

  // 2. Deep Witr Inspection
  ipcMain.handle(IPC_CHANNELS.INSPECT_PORT, async (_, port: number) => {
    return await witrBridge.inspectPort(port)
  })

  ipcMain.handle(IPC_CHANNELS.INSPECT_PID, async (_, pid: number) => {
    return await witrBridge.inspectPid(pid)
  })

  ipcMain.handle(IPC_CHANNELS.INSPECT_CONTAINER, async (_, name: string) => {
    return await witrBridge.runWitr(['--container', name])
  })

  // 3. Actions
  ipcMain.handle(IPC_CHANNELS.KILL_PROCESS, async (_, req: KillRequest, processName?: string) => {
    const result = await actionResolver.killProcess(req, processName)
    // Invalidate port scan cache
    await portSniffer.scanActivePorts(true)
    return result
  })

  ipcMain.handle(IPC_CHANNELS.OPEN_PATH, async (_, req: OpenDirectoryRequest) => {
    return await actionResolver.openPath(req)
  })

  ipcMain.handle(IPC_CHANNELS.COPY_TEXT, async (_, text: string) => {
    clipboard.writeText(text)
    return true
  })

  // 4. Window Management
  ipcMain.handle(IPC_CHANNELS.SHOW_WORKBENCH, () => {
    windowManager.showWorkbenchWindow()
    windowManager.hideTrayWindow()
  })

  ipcMain.handle(IPC_CHANNELS.TOGGLE_WORKBENCH, () => {
    windowManager.toggleWorkbenchWindow()
  })

  ipcMain.handle(IPC_CHANNELS.HIDE_TRAY, () => {
    windowManager.hideTrayWindow()
  })

  ipcMain.handle(IPC_CHANNELS.RESIZE_TRAY, (_, width: number, height: number) => {
    windowManager.resizeTrayWindow(width, height)
  })
}
