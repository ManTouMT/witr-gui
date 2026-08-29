import {
  ActionResult,
  KillRequest,
  OpenDirectoryRequest,
  PortInfo,
  ProcessInfo,
  ProcessItem,
  WitrResult
} from '@shared/types'

export interface WitrApi {
  getActivePorts: () => Promise<PortInfo[]>
  scanPorts: () => Promise<PortInfo[]>
  getAllProcesses: () => Promise<ProcessItem[]>
  getProcessChildren: (pid: number) => Promise<ProcessInfo[]>
  inspectPort: (port: number) => Promise<WitrResult>
  inspectPid: (pid: number) => Promise<WitrResult>
  inspectContainer: (name: string) => Promise<WitrResult>
  killProcess: (req: KillRequest, processName?: string) => Promise<ActionResult>
  openPath: (req: OpenDirectoryRequest) => Promise<ActionResult>
  copyText: (text: string) => Promise<boolean>
  showWorkbench: () => Promise<void>
  toggleWorkbench: () => Promise<void>
  hideTray: () => Promise<void>
  resizeTray: (width: number, height: number) => Promise<void>
}

// 1. Browser HTTP Web Adapter (for npx witr-gui / web mode)
const createWebApiAdapter = (): WitrApi => {
  const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      ...options
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.message || `HTTP ${res.status}: ${res.statusText}`)
    }
    return res.json()
  }

  return {
    getActivePorts: () => request<PortInfo[]>('/api/ports'),
    scanPorts: () => request<PortInfo[]>('/api/ports?force=true'),
    getAllProcesses: () => request<ProcessItem[]>('/api/processes'),
    getProcessChildren: (pid: number) => request<ProcessInfo[]>(`/api/processes/${pid}/children`),
    inspectPort: (port: number) => request<WitrResult>(`/api/inspect/port/${port}`),
    inspectPid: (pid: number) => request<WitrResult>(`/api/inspect/pid/${pid}`),
    inspectContainer: (name: string) => request<WitrResult>(`/api/inspect/container/${encodeURIComponent(name)}`),
    killProcess: (req: KillRequest, processName?: string) =>
      request<ActionResult>('/api/kill', {
        method: 'POST',
        body: JSON.stringify({ req, processName })
      }),
    openPath: (req: OpenDirectoryRequest) =>
      request<ActionResult>('/api/open-path', {
        method: 'POST',
        body: JSON.stringify(req)
      }),
    copyText: async (text: string) => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
          return true
        }
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        return true
      } catch (err) {
        console.error('Failed to copy text:', err)
        return false
      }
    },
    showWorkbench: async () => {},
    toggleWorkbench: async () => {},
    hideTray: async () => {},
    resizeTray: async () => {}
  }
}

// 2. Isomorphic API Selector
const isElectron = typeof window !== 'undefined' && Boolean((window as any).api)

export const api: WitrApi = isElectron ? (window as any).api : createWebApiAdapter()

// Polyfill window.api for any component calls in browser mode
if (typeof window !== 'undefined' && !(window as any).api) {
  ;(window as any).api = api
}
