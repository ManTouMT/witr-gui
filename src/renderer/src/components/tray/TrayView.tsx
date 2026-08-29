import React, { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import {
  Search,
  RefreshCw,
  Maximize2,
  Zap,
  Layers,
  FolderOpen,
  AlertTriangle,
  PowerOff,
  X
} from 'lucide-react'

export const TrayView: React.FC = () => {
  const {
    ports,
    loadingPorts,
    searchQuery,
    selectedPort,
    witrResult,
    inspecting,
    fetchPorts,
    selectPort,
    setSearchQuery,
    killCurrentProcess,
    openPath
  } = useAppStore()

  const [confirmKill, setConfirmKill] = useState(false)
  const [killing, setKilling] = useState(false)

  useEffect(() => {
    fetchPorts()
    const interval = setInterval(() => {
      fetchPorts(false)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const filteredPorts = ports.filter((p) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      String(p.port).includes(q) ||
      String(p.pid).includes(q) ||
      p.processName.toLowerCase().includes(q)
    )
  })

  const handleOpenWorkbench = () => {
    window.api.showWorkbench()
  }

  const handleKill = async (force: boolean) => {
    setKilling(true)
    await killCurrentProcess(force)
    setKilling(false)
    setConfirmKill(false)
  }

  const processInfo = witrResult?.Process
  const ancestry = witrResult?.Ancestry || []
  const isProtected = selectedPort?.isSystem

  return (
    <div className="w-[420px] h-[560px] flex flex-col bg-[#0c0c10]/95 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl text-neutral-100 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/[0.06] bg-neutral-950/60">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-[11px] text-white shadow-md shadow-blue-500/25 border border-white/20">
            W
          </div>
          <span className="font-semibold text-sm tracking-tight text-neutral-200">
            Witr Quick Inspector
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-400 font-mono border border-white/[0.04]">
            {ports.length} ports
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fetchPorts(true)}
            disabled={loadingPorts}
            title="刷新端口列表"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.08] transition active:scale-90 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingPorts ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={handleOpenWorkbench}
            title="打开全景工作台 (Full Workbench)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/80 transition border border-blue-500/30 cursor-pointer active:scale-95 shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
            <span>工作台</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2.5 border-b border-white/[0.06] bg-black/40">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索端口号 / 进程名 / PID..."
            className="w-full pl-8 pr-7 py-1.5 bg-black/50 border border-white/[0.08] rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500/60 font-mono shadow-inner transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-0.5 text-neutral-500 hover:text-neutral-200 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Split Port List & Active Preview */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Port Chips Scroll Area */}
        <div className="p-2.5 max-h-[190px] overflow-y-auto grid grid-cols-2 gap-1.5 border-b border-white/[0.06]">
          {filteredPorts.length === 0 ? (
            <div className="col-span-2 py-6 text-center text-xs text-neutral-500">
              {loadingPorts ? '正在扫描活动端口...' : '无匹配活动端口'}
            </div>
          ) : (
            filteredPorts.map((item) => {
              const isSelected = selectedPort?.port === item.port && selectedPort?.pid === item.pid
              const isDev = [3000, 5173, 8080, 8000, 4000, 4200, 8081, 9000, 3001, 8888].includes(item.port)

              return (
                <button
                  key={`${item.port}-${item.pid}`}
                  onClick={() => selectPort(item)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-950/60 via-blue-900/30 to-neutral-900/60 border-blue-500/60 text-blue-100 shadow-md shadow-blue-950/40'
                      : 'bg-neutral-900/40 border-white/[0.04] hover:bg-neutral-900/80 hover:border-white/[0.1] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`font-mono text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                        isDev
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-neutral-850 text-neutral-300 border border-white/[0.06]'
                      }`}
                    >
                      :{item.port}
                    </span>
                    <span className="text-xs truncate max-w-[90px] font-medium text-neutral-200">
                      {item.processName}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {item.pid}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {/* Selected Port Inspection Card */}
        <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto bg-neutral-950/30">
          {selectedPort ? (
            <div className="space-y-3">
              {/* Header Badge & Title */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-blue-400">
                      :{selectedPort.port}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-850 text-neutral-200 border border-white/[0.08]">
                      {selectedPort.processName}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      PID: {selectedPort.pid}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1 font-mono">
                    {processInfo?.Cmdline || selectedPort.address}
                  </p>
                </div>

                {isProtected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    系统关键
                  </span>
                )}
              </div>

              {/* Ancestry Chain Snippet */}
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/[0.06] text-xs shadow-inner backdrop-blur-md">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium mb-2">
                  <span className="flex items-center gap-1 text-neutral-300">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    因果血缘链路 (Why is this running?)
                  </span>
                  {inspecting && <span className="text-[10px] text-blue-400 animate-pulse font-mono">解析中...</span>}
                </div>

                {ancestry.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-neutral-300 pt-0.5">
                    {ancestry.map((node, idx) => (
                      <React.Fragment key={node.PID}>
                        <span
                          className={`px-1.5 py-0.5 rounded-md ${
                            idx === ancestry.length - 1
                              ? 'bg-blue-950/80 text-blue-300 font-semibold border border-blue-500/40 shadow-sm'
                              : 'bg-neutral-850 text-neutral-400 border border-white/[0.04]'
                          }`}
                          title={`PID: ${node.PID} | ${node.Cmdline || node.Command}`}
                        >
                          {node.Command}
                        </span>
                        {idx < ancestry.length - 1 && (
                          <span className="text-blue-500/60 font-bold">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500 italic">
                    {inspecting ? '正在通过 witr 深度解析父子进程因果链...' : '未检测到完整祖先调用链'}
                  </p>
                )}

                {/* Working Directory Quick Link */}
                {processInfo?.WorkingDir && processInfo.WorkingDir !== 'unknown' && (
                  <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 truncate max-w-[240px] font-mono">
                      {processInfo.WorkingDir}
                    </span>
                    <button
                      onClick={() => openPath(processInfo.WorkingDir!, 'finder')}
                      className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <FolderOpen className="w-3 h-3" />
                      Finder
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-xs gap-2">
              <Zap className="w-6 h-6 text-neutral-600" />
              <span>请在上方选择一个端口查看详情</span>
            </div>
          )}

          {/* Bottom Action Section */}
          {selectedPort && (
            <div className="pt-2.5 border-t border-white/[0.06]">
              {isProtected ? (
                <div className="w-full py-1.5 px-3 rounded-xl bg-neutral-900/60 border border-white/[0.06] text-center text-xs text-neutral-400">
                  受白名单保护：此为系统关键进程，不可释放
                </div>
              ) : confirmKill ? (
                <div className="flex items-center gap-2">
                  <button
                    disabled={killing}
                    onClick={() => handleKill(false)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-medium text-xs transition cursor-pointer active:scale-95 shadow-md"
                  >
                    优雅退出 (SIGTERM)
                  </button>
                  <button
                    disabled={killing}
                    onClick={() => handleKill(true)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition cursor-pointer active:scale-95 shadow-md shadow-rose-900/40"
                  >
                    强制杀死 (-9)
                  </button>
                  <button
                    onClick={() => setConfirmKill(false)}
                    className="py-1.5 px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 text-xs cursor-pointer active:scale-95"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmKill(true)}
                  className="w-full py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-lg shadow-rose-950/50 cursor-pointer active:scale-95"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>一键释放端口 :{selectedPort.port}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
