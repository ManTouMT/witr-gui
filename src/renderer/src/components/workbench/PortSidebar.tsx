import React from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Search, RefreshCw, Cpu, HardDrive, Hash, AlignLeft } from 'lucide-react'

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
    setActiveCategory
  } = useAppStore()

  const devPorts = [3000, 5173, 8080, 8000, 4000, 4200, 8081, 9000, 3001, 8888]

  // Filter Ports
  const filteredPorts = ports.filter((item) => {
    if (activeCategory === 'dev') {
      if (!devPorts.includes(item.port)) return false
    } else if (activeCategory === 'system') {
      if (!item.isSystem) return false
    }

    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      String(item.port).includes(q) ||
      String(item.pid).includes(q) ||
      item.processName.toLowerCase().includes(q) ||
      item.user.toLowerCase().includes(q)
    )
  })

  // Filter and Sort Processes
  const filteredProcesses = processes
    .filter((item) => {
      const q = searchQuery.toLowerCase().trim()
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

  const devCount = ports.filter((p) => devPorts.includes(p.port)).length
  const systemCount = ports.filter((p) => p.isSystem).length

  return (
    <div className="w-80 h-full flex flex-col border-r border-neutral-800/80 bg-neutral-950/60 backdrop-blur-md">
      {/* Top Search & Filter Header */}
      <div className="p-3.5 space-y-2.5 border-b border-neutral-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-neutral-300">
              {appMode === 'ports' ? '活跃端口列表' : '全量系统进程'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800/80 text-neutral-400 font-mono">
              {appMode === 'ports'
                ? `${filteredPorts.length}/${ports.length}`
                : `${filteredProcesses.length}/${processes.length}`}
            </span>
          </div>
          <button
            onClick={() => (appMode === 'ports' ? fetchPorts(true) : fetchProcesses(true))}
            disabled={appMode === 'ports' ? loadingPorts : loadingProcesses}
            title="刷新"
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                (appMode === 'ports' ? loadingPorts : loadingProcesses) ? 'animate-spin text-blue-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              appMode === 'ports'
                ? '按端口、进程名、PID 过滤...'
                : '搜索全部进程 (如 qq, node, vite)...'
            }
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition font-mono"
          />
        </div>

        {/* Sub-Filters: Ports Categories vs Process Sorting */}
        {appMode === 'ports' ? (
          <div className="flex items-center gap-1 p-0.5 bg-neutral-900/80 rounded-lg border border-neutral-800/60 text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition ${
                activeCategory === 'all'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              全部 ({ports.length})
            </button>
            <button
              onClick={() => setActiveCategory('dev')}
              className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition flex items-center justify-center gap-1 ${
                activeCategory === 'dev'
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              开发 ({devCount})
            </button>
            <button
              onClick={() => setActiveCategory('system')}
              className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition flex items-center justify-center gap-1 ${
                activeCategory === 'system'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-800/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              系统 ({systemCount})
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 p-0.5 bg-neutral-900/80 rounded-lg border border-neutral-800/60 text-xs">
            <button
              onClick={() => setProcessSortBy('mem')}
              className={`flex-1 py-1 px-1 rounded-md text-[10px] font-medium transition flex items-center justify-center gap-1 ${
                processSortBy === 'mem'
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-800/50 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <HardDrive className="w-3 h-3" />
              <span>内存</span>
            </button>
            <button
              onClick={() => setProcessSortBy('cpu')}
              className={`flex-1 py-1 px-1 rounded-md text-[10px] font-medium transition flex items-center justify-center gap-1 ${
                processSortBy === 'cpu'
                  ? 'bg-amber-950/80 text-amber-200 border border-amber-800/50 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>CPU</span>
            </button>
            <button
              onClick={() => setProcessSortBy('pid')}
              className={`flex-1 py-1 px-1 rounded-md text-[10px] font-medium transition flex items-center justify-center gap-1 ${
                processSortBy === 'pid'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Hash className="w-3 h-3" />
              <span>PID</span>
            </button>
            <button
              onClick={() => setProcessSortBy('name')}
              className={`flex-1 py-1 px-1 rounded-md text-[10px] font-medium transition flex items-center justify-center gap-1 ${
                processSortBy === 'name'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <AlignLeft className="w-3 h-3" />
              <span>名称</span>
            </button>
          </div>
        )}
      </div>

      {/* Item List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {appMode === 'ports' ? (
          filteredPorts.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              {loadingPorts ? '正在扫描活动端口...' : '无匹配端口'}
            </div>
          ) : (
            filteredPorts.map((item) => {
              const isSelected = selectedPort?.port === item.port && selectedPort?.pid === item.pid
              const isDev = devPorts.includes(item.port)

              return (
                <button
                  key={`${item.port}-${item.pid}`}
                  onClick={() => selectPort(item)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition border ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/60 text-blue-200 shadow-md shadow-blue-950/40'
                      : 'bg-neutral-900/30 border-neutral-800/40 hover:bg-neutral-900/80 hover:border-neutral-700/60 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-12 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isDev
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 shadow-inner'
                          : item.isSystem
                            ? 'bg-amber-950/50 text-amber-300 border border-amber-800/30'
                            : 'bg-neutral-800 text-neutral-200 border border-neutral-700/50'
                      }`}
                    >
                      :{item.port}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs truncate max-w-[110px] text-neutral-200">
                          {item.processName}
                        </span>
                        {item.isSystem && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-900/40 text-amber-400 border border-amber-800/30">
                            sys
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono mt-0.5">
                        <span>PID {item.pid}</span>
                        <span>•</span>
                        <span className="truncate max-w-[70px]">{item.user}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/60 text-neutral-400 font-mono">
                      {item.protocol}
                    </span>
                  </div>
                </button>
              )
            })
          )
        ) : filteredProcesses.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            {loadingProcesses ? '正在扫描系统进程...' : '无匹配系统进程'}
          </div>
        ) : (
          filteredProcesses.map((item) => {
            const isSelected = selectedProcess?.pid === item.pid

            return (
              <button
                key={item.pid}
                onClick={() => selectProcess(item)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition border ${
                  isSelected
                    ? 'bg-purple-600/15 border-purple-500/60 text-purple-200 shadow-md shadow-purple-950/40'
                    : 'bg-neutral-900/30 border-neutral-800/40 hover:bg-neutral-900/80 hover:border-neutral-700/60 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-12 h-8 rounded-lg flex flex-col items-center justify-center bg-neutral-850 border border-neutral-750 text-neutral-300 font-mono shrink-0">
                    <span className="text-[11px] font-bold leading-tight">{item.pid}</span>
                    <span className="text-[8px] text-neutral-500">PID</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs truncate max-w-[120px] text-neutral-200">
                        {item.command}
                      </span>
                      {item.isSystem && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-900/40 text-amber-400 border border-amber-800/30">
                          sys
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono truncate max-w-[130px] mt-0.5">
                      {item.cmdline}
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end shrink-0 text-xs font-mono">
                  {item.memPercent > 0 ? (
                    <span className="text-[11px] text-purple-300 font-semibold">
                      {item.memPercent.toFixed(1)}% <span className="text-[9px] text-neutral-500 font-normal">M</span>
                    </span>
                  ) : null}
                  {item.cpuPercent > 0 ? (
                    <span className="text-[10px] text-amber-400">
                      {item.cpuPercent.toFixed(1)}% <span className="text-[9px] text-neutral-500 font-normal">C</span>
                    </span>
                  ) : null}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
