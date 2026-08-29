import { create } from 'zustand'
import { AppMode, KillRequest, PortInfo, ProcessItem, ProcessSortBy, WitrResult } from '@shared/types'

export type PortCategory = 'all' | 'dev' | 'system'
export type ViewMode = 'tree' | 'graph'
export type DetailTab = 'overview' | 'env' | 'sockets' | 'raw'

export interface ToastInfo {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppState {
  // Navigation
  appMode: AppMode
  activeView: ViewMode
  detailSubTab: DetailTab
  searchQuery: string
  toasts: ToastInfo[]

  // Ports Mode State
  ports: PortInfo[]
  loadingPorts: boolean
  selectedPort: PortInfo | null
  activeCategory: PortCategory

  // Processes Mode State
  processes: ProcessItem[]
  loadingProcesses: boolean
  selectedProcess: ProcessItem | null
  processSortBy: ProcessSortBy

  // Shared Inspection State
  witrResult: WitrResult | null
  inspecting: boolean

  // Actions
  setAppMode: (mode: AppMode) => void
  setActiveView: (view: ViewMode) => void
  setDetailSubTab: (tab: DetailTab) => void
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: PortCategory) => void
  setProcessSortBy: (sort: ProcessSortBy) => void

  fetchPorts: (force?: boolean) => Promise<void>
  selectPort: (port: PortInfo) => Promise<void>

  fetchProcesses: (force?: boolean) => Promise<void>
  selectProcess: (proc: ProcessItem) => Promise<void>

  inspectPort: (port: number) => Promise<void>
  inspectPid: (pid: number) => Promise<void>
  killCurrentProcess: (force?: boolean, actionType?: 'process' | 'docker' | 'pm2', targetId?: string) => Promise<boolean>
  openPath: (path: string, app?: 'vscode' | 'cursor' | 'finder' | 'terminal') => Promise<void>
  copyText: (text: string) => Promise<void>

  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  appMode: 'ports',
  activeView: 'tree',
  detailSubTab: 'overview',
  searchQuery: '',
  toasts: [],

  ports: [],
  loadingPorts: false,
  selectedPort: null,
  activeCategory: 'all',

  processes: [],
  loadingProcesses: false,
  selectedProcess: null,
  processSortBy: 'mem',

  witrResult: null,
  inspecting: false,

  setAppMode: (mode) => {
    set({ appMode: mode, searchQuery: '' })
    if (mode === 'processes') {
      get().fetchProcesses(false)
    } else {
      get().fetchPorts(false)
    }
  },

  setActiveView: (view) => set({ activeView: view }),
  setDetailSubTab: (tab) => set({ detailSubTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setProcessSortBy: (sort) => set({ processSortBy: sort }),

  fetchPorts: async (force = false) => {
    try {
      set({ loadingPorts: true })
      const ports = force ? await window.api.scanPorts() : await window.api.getActivePorts()
      set({ ports, loadingPorts: false })

      // Auto-select first port if none selected in ports mode
      if (get().appMode === 'ports') {
        const currentSelected = get().selectedPort
        if (ports.length > 0) {
          if (!currentSelected || !ports.some((p: PortInfo) => p.port === currentSelected.port && p.pid === currentSelected.pid)) {
            get().selectPort(ports[0])
          }
        }
      }
    } catch (err: any) {
      console.error('[Store] Failed to fetch ports:', err)
      set({ loadingPorts: false })
      get().showToast(`扫描端口失败: ${err?.message || err}`, 'error')
    }
  },

  selectPort: async (port: PortInfo) => {
    set({ selectedPort: port, selectedProcess: null, inspecting: true, witrResult: null })
    try {
      const result = await window.api.inspectPort(port.port)
      if (get().selectedPort?.port === port.port) {
        set({ witrResult: result, inspecting: false })
      }
    } catch (err: any) {
      console.error('[Store] Failed to inspect port:', err)
      set({ inspecting: false })
      get().showToast(`进程深度溯源失败: ${err?.message || err}`, 'error')
    }
  },

  fetchProcesses: async (_force = false) => {
    try {
      set({ loadingProcesses: true })
      const procs = await window.api.getAllProcesses()
      set({ processes: procs, loadingProcesses: false })

      // Auto-select first process if none selected in processes mode
      if (get().appMode === 'processes') {
        const currentSelected = get().selectedProcess
        if (procs.length > 0) {
          if (!currentSelected || !procs.some((p) => p.pid === currentSelected.pid)) {
            get().selectProcess(procs[0])
          }
        }
      }
    } catch (err: any) {
      console.error('[Store] Failed to fetch processes:', err)
      set({ loadingProcesses: false })
      get().showToast(`获取系统进程失败: ${err?.message || err}`, 'error')
    }
  },

  selectProcess: async (proc: ProcessItem) => {
    set({ selectedProcess: proc, selectedPort: null, inspecting: true, witrResult: null })
    try {
      const result = await window.api.inspectPid(proc.pid)
      if (get().selectedProcess?.pid === proc.pid) {
        set({ witrResult: result, inspecting: false })
      }
    } catch (err: any) {
      console.error('[Store] Failed to inspect process:', err)
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
    const matchingProc = get().processes.find((p) => p.pid === pid)
    const matchingPort = get().ports.find((p) => p.pid === pid)

    if (matchingProc) {
      set({ selectedProcess: matchingProc, selectedPort: matchingPort || null, inspecting: true })
    } else if (matchingPort) {
      set({ selectedPort: matchingPort, selectedProcess: null, inspecting: true })
    } else {
      set({ inspecting: true })
    }

    try {
      const result = await window.api.inspectPid(pid)
      set({ witrResult: result, inspecting: false })
    } catch (err: any) {
      set({ inspecting: false })
      get().showToast(`查询 PID 失败: ${err?.message || err}`, 'error')
    }
  },

  killCurrentProcess: async (force = false, actionType = 'process', targetId?: string) => {
    const { selectedPort, selectedProcess, witrResult } = get()
    const targetPid = witrResult?.Process?.PID || selectedPort?.pid || selectedProcess?.pid
    const processName = witrResult?.Process?.Command || selectedPort?.processName || selectedProcess?.command || ''

    if (!targetPid) return false

    try {
      const req: KillRequest = {
        pid: targetPid,
        force,
        actionType,
        targetId
      }
      const res = await window.api.killProcess(req, processName)
      if (res.success) {
        get().showToast(res.message, 'success')
        // Refresh active list
        if (get().appMode === 'ports') {
          await get().fetchPorts(true)
        } else {
          await get().fetchProcesses(true)
        }
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
