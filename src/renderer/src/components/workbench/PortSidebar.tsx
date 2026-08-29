import React from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Search, RefreshCw } from 'lucide-react'

export const PortSidebar: React.FC = () => {
  const {
    ports,
    loadingPorts,
    searchQuery,
    selectedPort,
    activeCategory,
    fetchPorts,
    selectPort,
    setSearchQuery,
    setActiveCategory
  } = useAppStore()

  const devPorts = [3000, 5173, 8080, 8000, 4000, 4200, 8081, 9000, 3001, 8888]

  const filteredPorts = ports.filter((item) => {
    // Category filter
    if (activeCategory === 'dev') {
      if (!devPorts.includes(item.port)) return false
    } else if (activeCategory === 'system') {
      if (!item.isSystem) return false
    }

    // Search filter
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      String(item.port).includes(q) ||
      String(item.pid).includes(q) ||
      item.processName.toLowerCase().includes(q) ||
      item.user.toLowerCase().includes(q)
    )
  })

  const devCount = ports.filter((p) => devPorts.includes(p.port)).length
  const systemCount = ports.filter((p) => p.isSystem).length

  return (
    <div className="w-80 h-full flex flex-col border-r border-neutral-800/80 bg-neutral-950/60 backdrop-blur-md">
      {/* Top Search & Filter Header */}
      <div className="p-3.5 space-y-2.5 border-b border-neutral-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-neutral-300">活跃端口列表</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800/80 text-neutral-400 font-mono">
              {filteredPorts.length}/{ports.length}
            </span>
          </div>
          <button
            onClick={() => fetchPorts(true)}
            disabled={loadingPorts}
            title="刷新"
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingPorts ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按端口、进程名、PID 过滤..."
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition font-mono"
          />
        </div>

        {/* Categories / Tags */}
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
      </div>

      {/* Port Item List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredPorts.length === 0 ? (
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
        )}
      </div>
    </div>
  )
}
