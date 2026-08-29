import React, { useEffect } from 'react'
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
    <div className="flex flex-col w-screen h-screen bg-neutral-950 text-neutral-100 overflow-hidden select-none">
      {/* macOS Frameless Custom Titlebar / Toolbar */}
      <div className="h-12 border-b border-neutral-800/80 bg-neutral-900/80 backdrop-blur-xl flex items-center justify-between px-4 drag-region">
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs ${
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs ${
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs ${
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium text-xs ${
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
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <PortSidebar />

        {/* Center / Right Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-neutral-950/40">
          {/* Visual Canvas Area */}
          <div className="flex-1 flex overflow-hidden">
            {activeView === 'tree' ? <CausalTree /> : <TopologyGraph />}
          </div>

          {/* Bottom Detail & Action Dock */}
          {(selectedPort || selectedProcess) && <DetailPanel />}
        </div>
      </div>
    </div>
  )
}
