import React from 'react'
import { useAppStore } from '../../stores/useAppStore'
import {
  Search,
  RefreshCw,
  Cpu,
  HardDrive,
  Hash,
  AlignLeft,
  X,
  PowerOff
} from 'lucide-react'

export const PortSidebar: React.FC = () => {
  const {
    appMode,
    ports,
    loadingPorts,
    selectedPort,
    activeCategory,
    fetchPorts,
    selectPort,

    processes,
    loadingProcesses,
    selectedProcess,
    processSortBy,
    fetchProcesses,
    selectProcess,
    setProcessSortBy,

    searchQuery,
    setSearchQuery,
    setActiveCategory,
    showToast
  } = useAppStore()

  const devPorts = [3000, 5173, 8080, 8000, 4000, 4200, 8081, 9000, 3001, 8888]
  const q = searchQuery.toLowerCase().trim()

  // 1. Calculate query-matched ports
  const queryMatchedPorts = ports.filter((item) => {
    if (!q) return true
    return (
      String(item.port).includes(q) ||
      String(item.pid).includes(q) ||
      item.processName.toLowerCase().includes(q) ||
      item.user.toLowerCase().includes(q)
    )
  })

  // Category counts reflecting the current search query
  const allPortsCount = queryMatchedPorts.length
  const devPortsCount = queryMatchedPorts.filter((p) => devPorts.includes(p.port)).length
  const systemPortsCount = queryMatchedPorts.filter((p) => p.isSystem).length

  // Filtered ports for active category
  const filteredPorts = queryMatchedPorts.filter((item) => {
    if (activeCategory === 'dev') return devPorts.includes(item.port)
    if (activeCategory === 'system') return item.isSystem
    return true
  })

  // 2. Filter and Sort Processes
  const filteredProcesses = processes
    .filter((item) => {
      if (!q) return true
      return (
        String(item.pid).includes(q) ||
        String(item.ppid).includes(q) ||
        item.command.toLowerCase().includes(q) ||
        item.cmdline.toLowerCase().includes(q) ||
        item.user.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (processSortBy === 'mem') return b.memPercent - a.memPercent
      if (processSortBy === 'cpu') return b.cpuPercent - a.cpuPercent
      if (processSortBy === 'pid') return a.pid - b.pid
      if (processSortBy === 'name') return a.command.localeCompare(b.command)
      return 0
    })

  const handleQuickKill = async (e: React.MouseEvent, pid: number, force: boolean) => {
    e.stopPropagation()
    try {
      const res = await window.api.killProcess({ pid, force, actionType: 'process' })
      if (res.success) {
        showToast(`已${force ? '强制终止' : '释放'} PID: ${pid}`, 'success')
        if (appMode === 'ports') fetchPorts(true)
        else fetchProcesses(true)
      } else {
        showToast(`终止失败: ${res.message}`, 'error')
      }
    } catch (err: any) {
      showToast(`操作异常: ${err?.message || err}`, 'error')
    }
  }

  return (
    <div className="w-full h-full flex flex-col relative select-none">
      {/* Top Search & Filter Header */}
      <div className="p-3 space-y-2 border-b border-white/[0.06] shrink-0 bg-neutral-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-neutral-200 tracking-tight">
              {appMode === 'ports' ? '活跃端口列表' : '全量系统进程'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-400 font-mono border border-white/[0.04]">
              {appMode === 'ports'
                ? `${filteredPorts.length}/${ports.length}`
                : `${filteredProcesses.length}/${processes.length}`}
            </span>
          </div>
          <button
            onClick={() => (appMode === 'ports' ? fetchPorts(true) : fetchProcesses(true))}
            disabled={appMode === 'ports' ? loadingPorts : loadingProcesses}
            title="刷新"
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.08] transition active:scale-90 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                (appMode === 'ports' ? loadingPorts : loadingProcesses) ? 'animate-spin text-blue-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Search Bar with 1-click Clear */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              appMode === 'ports'
                ? '过滤端口、进程名、PID...'
                : '搜索全部进程 (如 qq, node, vite)...'
            }
            className="w-full pl-8 pr-7 py-1.5 bg-black/50 border border-white/[0.08] focus:border-blue-500/60 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-mono shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-0.5 text-neutral-500 hover:text-neutral-200 transition cursor-pointer"
              title="清空搜索"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sub-Filters: Ports Categories vs Process Sorting */}
        {appMode === 'ports' ? (
          <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-lg border border-white/[0.06] text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-neutral-800/90 text-white shadow-sm border border-white/[0.08]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              全部 ({allPortsCount})
            </button>
            <button
              onClick={() => setActiveCategory('dev')}
              className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition flex items-center justify-center gap-1 cursor-pointer ${
                activeCategory === 'dev'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              开发 ({devPortsCount})
            </button>
            <button
              onClick={() => setActiveCategory('system')}
              className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition flex items-center justify-center gap-1 cursor-pointer ${
                activeCategory === 'system'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              系统 ({systemPortsCount})
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-lg border border-white/[0.06] text-xs">
            <button
              onClick={() => setProcessSortBy('mem')}
              className={`flex-1 py-1 px-1 rounded-md text-[10px] font-medium transition flex items-center justify-center gap-1 cursor-pointer ${
                processSortBy === 'mem'
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-950/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <HardDrive className="w-3 h-3 text-purple-400" />
              <span>内存</span>
            </button>
            <button
              onClick={() => setProcessSortBy('cpu')}
              className={`flex-1 py-1 px-1 rounded-md text-[10px] font-medium transition flex items-center justify-center gap-1 cursor-pointer ${
                processSortBy === 'cpu'
                  ? 'bg-amber-950/80 text-amber-200 border border-amber-500/40 shadow-sm shadow-amber-950/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Cpu className="w-3 h-3 text-amber-400" />
              <span>CPU</span>
            </button>
            <button
              onClick={() => setProcessSortBy('pid')}
              className={`flex-1 py-1 px-1 rounded-md text-[10px] font-medium transition flex items-center justify-center gap-1 cursor-pointer ${
                processSortBy === 'pid'
                  ? 'bg-neutral-800 text-white shadow-sm border border-white/[0.08]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Hash className="w-3 h-3" />
              <span>PID</span>
            </button>
            <button
              onClick={() => setProcessSortBy('name')}
              className={`flex-1 py-1 px-1 rounded-md text-[10px] font-medium transition flex items-center justify-center gap-1 cursor-pointer ${
                processSortBy === 'name'
                  ? 'bg-neutral-800 text-white shadow-sm border border-white/[0.08]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <AlignLeft className="w-3 h-3" />
              <span>名称</span>
            </button>
          </div>
        )}
      </div>

      {/* Item List Scroll Area with Linear-Style Left Indicator and Glowing Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
        {appMode === 'ports' ? (
          filteredPorts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-neutral-500 gap-2">
              <span>{loadingPorts ? '正在扫描活动端口...' : q ? `未找到匹配 "${searchQuery}" 的端口` : '无匹配端口'}</span>
              {q && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] transition cursor-pointer"
                >
                  清空搜索条件
                </button>
              )}
            </div>
          ) : (
            filteredPorts.map((item) => {
              const isSelected = selectedPort?.port === item.port && selectedPort?.pid === item.pid
              const isDev = devPorts.includes(item.port)

              return (
                <div
                  key={`${item.port}-${item.pid}`}
                  onClick={() => selectPort(item)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 border cursor-pointer group relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-950/50 via-blue-900/20 to-neutral-900/60 border-blue-500/60 text-blue-100 shadow-lg shadow-blue-950/50 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-blue-400 before:shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                      : 'bg-neutral-900/30 border-white/[0.04] hover:bg-neutral-900/80 hover:border-white/[0.1] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-12 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isDev
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                          : item.isSystem
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                            : 'bg-neutral-850 text-neutral-200 border border-white/[0.08] shadow-inner'
                      }`}
                    >
                      :{item.port}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs truncate max-w-[105px] text-neutral-100 tracking-tight">
                          {item.processName}
                        </span>
                        {item.isSystem && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-900/40 text-amber-400 border border-amber-800/30">
                            sys
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono mt-0.5">
                        <span>PID {item.pid}</span>
                        <span>•</span>
                        <span className="truncate max-w-[65px] text-neutral-500">{item.user}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Protocol vs Hover Quick Actions */}
                  <div className="text-right flex items-center gap-1">
                    {!item.isSystem && (
                      <button
                        onClick={(e) => handleQuickKill(e, item.pid, false)}
                        title="一键释放该端口 (SIGTERM)"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 transition shadow-sm hover:shadow-rose-950/80 cursor-pointer active:scale-90"
                      >
                        <PowerOff className="w-3 h-3" />
                      </button>
                    )}

                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 font-mono group-hover:hidden border border-white/[0.03]">
                      {item.protocol}
                    </span>
                  </div>
                </div>
              )
            })
          )
        ) : filteredProcesses.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-xs text-neutral-500 gap-2">
            <span>{loadingProcesses ? '正在扫描系统进程...' : q ? `未找到匹配 "${searchQuery}" 的系统进程` : '无匹配系统进程'}</span>
            {q && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] transition cursor-pointer"
              >
                清空搜索条件
              </button>
            )}
          </div>
        ) : (
          filteredProcesses.map((item) => {
            const isSelected = selectedProcess?.pid === item.pid

            return (
              <div
                key={item.pid}
                onClick={() => selectProcess(item)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 border cursor-pointer group relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-950/50 via-purple-900/20 to-neutral-900/60 border-purple-500/60 text-purple-100 shadow-lg shadow-purple-950/50 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-purple-400 before:shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                    : 'bg-neutral-900/30 border-white/[0.04] hover:bg-neutral-900/80 hover:border-white/[0.1] text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-12 h-8 rounded-lg flex flex-col items-center justify-center bg-neutral-850 border border-white/[0.08] text-neutral-200 font-mono shrink-0 shadow-inner">
                    <span className="text-[11px] font-bold leading-tight">{item.pid}</span>
                    <span className="text-[8px] text-neutral-500">PID</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs truncate max-w-[110px] text-neutral-100 tracking-tight">
                        {item.command}
                      </span>
                      {item.isSystem && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-900/40 text-amber-400 border border-amber-800/30">
                          sys
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono truncate max-w-[110px] mt-0.5">
                      {item.cmdline}
                    </p>
                  </div>
                </div>

                {/* Right Metrics & Quick Kill */}
                <div className="text-right flex items-center gap-1 shrink-0 text-xs font-mono">
                  {!item.isSystem && (
                    <button
                      onClick={(e) => handleQuickKill(e, item.pid, false)}
                      title="终止此进程 (SIGTERM)"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 transition shadow-sm hover:shadow-rose-950/80 cursor-pointer active:scale-90"
                    >
                      <PowerOff className="w-3 h-3" />
                    </button>
                  )}

                  <div className="flex flex-col items-end group-hover:hidden">
                    {item.memPercent > 0 ? (
                      <span className="text-[11px] text-purple-300 font-semibold">
                        {item.memPercent.toFixed(1)}% <span className="text-[9px] text-neutral-500 font-normal">M</span>
                      </span>
                    ) : null}
                    {item.cpuPercent > 0 ? (
                      <span className="text-[10px] text-amber-400 font-semibold">
                        {item.cpuPercent.toFixed(1)}% <span className="text-[9px] text-neutral-500 font-normal">C</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
