import { create } from 'zustand'
import { KillRequest, PortInfo, WitrResult } from '@shared/types'

export type PortCategory = 'all' | 'dev' | 'system'
export type ViewMode = 'tree' | 'graph'
export type DetailTab = 'overview' | 'env' | 'sockets' | 'raw'

export interface ToastInfo {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppState {
  ports: PortInfo[]
  loadingPorts: boolean
  searchQuery: string
  selectedPort: PortInfo | null
  witrResult: WitrResult | null
  inspecting: boolean
  activeCategory: PortCategory
  activeView: ViewMode
  detailSubTab: DetailTab
  toasts: ToastInfo[]

  // Actions
  fetchPorts: (force?: boolean) => Promise<void>
  selectPort: (port: PortInfo) => Promise<void>
  inspectPort: (port: number) => Promise<void>
  inspectPid: (pid: number) => Promise<void>
  killCurrentProcess: (force?: boolean, actionType?: 'process' | 'docker' | 'pm2', targetId?: string) => Promise<boolean>
  openPath: (path: string, app?: 'vscode' | 'cursor' | 'finder' | 'terminal') => Promise<void>
  copyText: (text: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: PortCategory) => void
  setActiveView: (view: ViewMode) => void
  setDetailSubTab: (tab: DetailTab) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  ports: [],
  loadingPorts: false,
  searchQuery: '',
  selectedPort: null,
  witrResult: null,
  inspecting: false,
  activeCategory: 'all',
  activeView: 'tree',
  detailSubTab: 'overview',
  toasts: [],

  fetchPorts: async (force = false) => {
    try {
      set({ loadingPorts: true })
      const ports = force ? await window.api.scanPorts() : await window.api.getActivePorts()
      set({ ports, loadingPorts: false })

      // Auto-select the first port if none selected
      const currentSelected = get().selectedPort
      if (ports.length > 0) {
        if (!currentSelected || !ports.some((p: PortInfo) => p.port === currentSelected.port && p.pid === currentSelected.pid)) {
          get().selectPort(ports[0])
        }
      }
    } catch (err: any) {
      console.error('[Store] Failed to fetch ports:', err)
      set({ loadingPorts: false })
      get().showToast(`扫描端口失败: ${err?.message || err}`, 'error')
    }
  },

  selectPort: async (port: PortInfo) => {
    set({ selectedPort: port, inspecting: true, witrResult: null })
    try {
      const result = await window.api.inspectPort(port.port)
      // Check if selectedPort is still this port (prevent race condition)
      if (get().selectedPort?.port === port.port) {
        set({ witrResult: result, inspecting: false })
      }
    } catch (err: any) {
      console.error('[Store] Failed to inspect port:', err)
      set({ inspecting: false })
      get().showToast(`进程深度溯源失败: ${err?.message || err}`, 'error')
    }
  },

  inspectPort: async (portNumber: number) => {
    set({ inspecting: true })
    try {
      const result = await window.api.inspectPort(portNumber)
      set({ witrResult: result, inspecting: false })
    } catch (err: any) {
      set({ inspecting: false })
      get().showToast(`查询端口失败: ${err?.message || err}`, 'error')
    }
  },

  inspectPid: async (pid: number) => {
    set({ inspecting: true })
    try {
      const result = await window.api.inspectPid(pid)
      set({ witrResult: result, inspecting: false })
    } catch (err: any) {
      set({ inspecting: false })
      get().showToast(`查询 PID 失败: ${err?.message || err}`, 'error')
    }
  },

  killCurrentProcess: async (force = false, actionType = 'process', targetId?: string) => {
    const { selectedPort, witrResult } = get()
    if (!selectedPort) return false

    const pid = witrResult?.Process?.PID || selectedPort.pid
    const processName = witrResult?.Process?.Command || selectedPort.processName

    try {
      const req: KillRequest = {
        pid,
        force,
        actionType,
        targetId
      }
      const res = await window.api.killProcess(req, processName)
      if (res.success) {
        get().showToast(res.message, 'success')
        // Refresh port list
        await get().fetchPorts(true)
        return true
      } else {
        get().showToast(res.message, 'error')
        return false
      }
    } catch (err: any) {
      get().showToast(`操作失败: ${err?.message || err}`, 'error')
      return false
    }
  },

  openPath: async (targetPath: string, app = 'finder') => {
    try {
      const res = await window.api.openPath({ path: targetPath, app })
      if (res.success) {
        get().showToast(res.message, 'success')
      } else {
        get().showToast(res.message, 'error')
      }
    } catch (err: any) {
      get().showToast(`打开失败: ${err?.message || err}`, 'error')
    }
  },

  copyText: async (text: string) => {
    try {
      await window.api.copyText(text)
      get().showToast('已复制到剪贴板', 'info')
    } catch (err: any) {
      get().showToast('复制失败', 'error')
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setActiveCategory: (category: PortCategory) => set({ activeCategory: category }),
  setActiveView: (view: ViewMode) => set({ activeView: view }),
  setDetailSubTab: (tab: DetailTab) => set({ detailSubTab: tab }),

  showToast: (message: string, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastInfo = { id, message, type }
    set((state) => ({ toasts: [...state.toasts, newToast] }))
    setTimeout(() => {
      get().removeToast(id)
    }, 3500)
  },

  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  }
}))
