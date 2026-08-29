import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS } from '../shared/ipc-events'
import {
  ActionResult,
  KillRequest,
  OpenDirectoryRequest,
  PortInfo,
  WitrResult
} from '../shared/types'

export const api = {
  getActivePorts: (): Promise<PortInfo[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_ACTIVE_PORTS),

  scanPorts: (): Promise<PortInfo[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.SCAN_PORTS),

  inspectPort: (port: number): Promise<WitrResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.INSPECT_PORT, port),

  inspectPid: (pid: number): Promise<WitrResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.INSPECT_PID, pid),

  inspectContainer: (name: string): Promise<WitrResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.INSPECT_CONTAINER, name),

  killProcess: (req: KillRequest, processName?: string): Promise<ActionResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.KILL_PROCESS, req, processName),

  openPath: (req: OpenDirectoryRequest): Promise<ActionResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_PATH, req),

  copyText: (text: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.COPY_TEXT, text),

  showWorkbench: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHOW_WORKBENCH),

  toggleWorkbench: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_WORKBENCH),

  hideTray: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.HIDE_TRAY),

  resizeTray: (width: number, height: number): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.RESIZE_TRAY, width, height)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
