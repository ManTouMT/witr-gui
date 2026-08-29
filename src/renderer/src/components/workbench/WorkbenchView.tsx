import React, { useEffect, useState, useRef } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { PortSidebar } from './PortSidebar'
import { CausalTree } from './CausalTree'
import { TopologyGraph } from './TopologyGraph'
import { DetailPanel } from './DetailPanel'
import {
  Layers,
  Network,
  RefreshCw,
  Globe,
  Cpu
} from 'lucide-react'

export const WorkbenchView: React.FC = () => {
  const {
    appMode,
    setAppMode,
    fetchPorts,
    fetchProcesses,
    selectedPort,
    selectedProcess,
    witrResult,
    activeView,
    setActiveView,
    loadingPorts,
    loadingProcesses
  } = useAppStore()

  // Persistent Resizable Splitter State
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('witr_sidebar_width')
    return saved ? parseInt(saved, 10) : 320
  })
  const [detailHeight, setDetailHeight] = useState(() => {
    const saved = localStorage.getItem('witr_detail_height')
    return saved ? parseInt(saved, 10) : 280
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingSidebar = useRef(false)
  const isDraggingDetail = useRef(false)
  const currentSidebarWidth = useRef(sidebarWidth)
  const currentDetailHeight = useRef(detailHeight)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    if (appMode === 'ports') {
      fetchPorts()
    } else {
      fetchProcesses()
    }

    const interval = setInterval(() => {
      if (appMode === 'ports') {
        fetchPorts(false)
      } else {
        fetchProcesses(false)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [appMode])

  // GPU-Accelerated 120Hz Smooth CSS Variable Resizing (Zero React re-render during drag)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSidebar.current && !isDraggingDetail.current) return

      if (rafId.current) cancelAnimationFrame(rafId.current)

      rafId.current = requestAnimationFrame(() => {
        if (!containerRef.current) return

        if (isDraggingSidebar.current) {
          const newWidth = Math.min(Math.max(e.clientX, 220), 540)
          currentSidebarWidth.current = newWidth
          containerRef.current.style.setProperty('--sidebar-w', `${newWidth}px`)
        }

        if (isDraggingDetail.current) {
          const newHeight = Math.min(Math.max(window.innerHeight - e.clientY, 140), 480)
          currentDetailHeight.current = newHeight
          containerRef.current.style.setProperty('--detail-h', `${newHeight}px`)
        }
      })
    }

    const handleMouseUp = () => {
      if (isDraggingSidebar.current) {
        isDraggingSidebar.current = false
        setSidebarWidth(currentSidebarWidth.current)
        localStorage.setItem('witr_sidebar_width', String(currentSidebarWidth.current))
      }

      if (isDraggingDetail.current) {
        isDraggingDetail.current = false
        setDetailHeight(currentDetailHeight.current)
        localStorage.setItem('witr_detail_height', String(currentDetailHeight.current))
      }

      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  const startSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingSidebar.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const startDetailResize = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingDetail.current = true
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }

  const processInfo = witrResult?.Process
  const isRefreshing = appMode === 'ports' ? loadingPorts : loadingProcesses

  const handleRefresh = () => {
    if (appMode === 'ports') {
      fetchPorts(true)
    } else {
      fetchProcesses(true)
    }
  }

  return (
    <div
      ref={containerRef}
      style={
        {
          '--sidebar-w': `${sidebarWidth}px`,
          '--detail-h': `${detailHeight}px`
        } as React.CSSProperties
      }
      className="flex flex-col w-screen h-screen bg-neutral-950 text-neutral-100 overflow-hidden select-none"
    >
      {/* macOS Frameless Custom Titlebar / Toolbar */}
      <div className="h-12 border-b border-neutral-800/80 bg-neutral-900/80 backdrop-blur-xl flex items-center justify-between px-4 drag-region shrink-0">
        {/* Left: macOS Traffic light area offset (pl-20) + App Name + Active Target Badge */}
        <div className="flex items-center gap-3 pl-20 no-drag">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-sm shadow-blue-500/40">
              W
            </div>
            <span className="font-semibold text-xs text-neutral-200 tracking-tight">
              Witr Visual Workbench
            </span>
          </div>

          {selectedPort && (
            <div className="flex items-center gap-2 pl-3 border-l border-neutral-800 text-xs">
              <span className="font-mono font-bold text-blue-400">
                :{selectedPort.port}
              </span>
              <span className="text-neutral-400 font-medium truncate max-w-[140px]">
                {processInfo?.Command || selectedPort.processName}
              </span>
              <span className="text-neutral-500 font-mono text-[11px]">
                (PID: {selectedPort.pid})
              </span>
            </div>
          )}

          {selectedProcess && !selectedPort && (
            <div className="flex items-center gap-2 pl-3 border-l border-neutral-800 text-xs">
              <span className="font-mono font-bold text-purple-400">
                {selectedProcess.command}
              </span>
              <span className="text-neutral-500 font-mono text-[11px]">
                (PID: {selectedProcess.pid})
              </span>
              <span className="text-neutral-400 text-[11px] font-mono">
                {selectedProcess.memPercent.toFixed(1)}% Mem
              </span>
            </div>
          )}
        </div>

        {/* Center: Primary Mode Switcher (Ports vs Processes) */}
        <div className="flex items-center no-drag">
          <div className="flex items-center p-0.5 bg-neutral-950/90 border border-neutral-800 rounded-lg text-xs shadow-inner">
            <button
              onClick={() => setAppMode('ports')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs cursor-pointer ${
                appMode === 'ports'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>端口监听 (Ports)</span>
            </button>
            <button
              onClick={() => setAppMode('processes')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs cursor-pointer ${
                appMode === 'processes'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>系统进程 (Processes)</span>
            </button>
          </div>
        </div>

        {/* Right: View Switcher (Tree vs Graph) & Reload */}
        <div className="flex items-center gap-2 no-drag">
          {/* Tree vs Graph Toggle */}
          <div className="flex items-center p-0.5 bg-neutral-950/80 border border-neutral-800/80 rounded-lg text-xs">
            <button
              onClick={() => setActiveView('tree')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs cursor-pointer ${
                activeView === 'tree'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>因果阶梯树</span>
            </button>
            <button
              onClick={() => setActiveView('graph')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs cursor-pointer ${
                activeView === 'graph'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-purple-400" />
              <span>交互拓扑图</span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="刷新系统数据"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Workspace Body with 120Hz Ultra-Smooth Resizable Splitters */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar (Controlled by CSS variable --sidebar-w) */}
        <div
          style={{ width: 'var(--sidebar-w)' }}
          className="h-full shrink-0 flex flex-col min-w-0 will-change-[width]"
        >
          <PortSidebar />
        </div>

        {/* Vertical Resize Splitter Bar */}
        <div
          onMouseDown={startSidebarResize}
          className="w-1.5 hover:w-2 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-all duration-100 relative z-20 flex items-center justify-center group -mx-0.5 select-none"
          title="拖拽调整侧边栏宽度"
        >
          <div className="w-0.5 h-8 bg-neutral-700 group-hover:bg-blue-400 rounded-full transition" />
        </div>

        {/* Center / Right Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-neutral-950/40 overflow-hidden">
          {/* Visual Canvas Area */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {activeView === 'tree' ? <CausalTree /> : <TopologyGraph />}
          </div>

          {/* Bottom Detail Panel & Horizontal Resize Splitter */}
          {(selectedPort || selectedProcess) && (
            <>
              {/* Horizontal Resize Splitter Bar */}
              <div
                onMouseDown={startDetailResize}
                className="h-1.5 hover:h-2 bg-neutral-800/40 hover:bg-blue-500/50 cursor-row-resize transition-all duration-100 relative z-20 flex items-center justify-center group shrink-0 select-none"
                title="拖拽调整底部面板高度"
              >
                <div className="w-12 h-0.5 bg-neutral-600 group-hover:bg-blue-400 rounded-full transition" />
              </div>

              {/* Bottom Detail Panel (Controlled by CSS variable --detail-h) */}
              <div
                style={{ height: 'var(--detail-h)' }}
                className="shrink-0 flex flex-col min-h-0 overflow-hidden will-change-[height]"
              >
                <DetailPanel />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
