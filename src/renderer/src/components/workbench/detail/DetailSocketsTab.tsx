import React, { useState } from 'react'
import { useAppStore } from '../../../stores/useAppStore'
import { useCopyFeedback } from '../../../hooks/useCopyFeedback'
import { Search, X, Radio, Globe, Copy, Check } from 'lucide-react'

export const DetailSocketsTab: React.FC = () => {
  const { witrResult } = useAppStore()
  const { copyWithFeedback, isCopied } = useCopyFeedback()
  const [socketFilter, setSocketFilter] = useState('')

  const socketList = witrResult?.Process?.Sockets || []
  const filteredSockets = socketList.filter((s) => {
    if (!socketFilter) return true
    const q = socketFilter.toLowerCase()
    return (
      String(s.Port).includes(q) ||
      s.Protocol.toLowerCase().includes(q) ||
      s.State.toLowerCase().includes(q) ||
      s.Address.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-3 select-none">
      {/* Top Search & Stats */}
      <div className="flex items-center justify-between">
        <div className="relative flex items-center w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-500" />
          <input
            type="text"
            value={socketFilter}
            onChange={(e) => setSocketFilter(e.target.value)}
            placeholder="搜索监听端口、协议或绑定 IP (如 3000, 127.0.0.1)..."
            className="w-full pl-8 pr-7 py-1.5 bg-black/50 border border-white/[0.08] rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500/60 font-mono shadow-inner transition"
          />
          {socketFilter && (
            <button
              onClick={() => setSocketFilter('')}
              className="absolute right-2 p-0.5 text-neutral-500 hover:text-neutral-200 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-neutral-400 font-mono bg-neutral-900/60 px-2.5 py-1 rounded-lg border border-white/[0.06]">
          活跃连接: <strong className="text-blue-400">{filteredSockets.length}</strong> / {socketList.length}
        </span>
      </div>

      {/* Sockets Modern Grid: Protocol First + Fixed-Width Port & State Alignment */}
      {filteredSockets.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          {socketList.length === 0 ? '该进程当前未建立任何开放套接字' : `未找到匹配 "${socketFilter}" 的网络连接`}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
          {filteredSockets.map((s, idx) => {
            const socketKey = `sock-${s.Port}-${idx}`
            const isListen = s.State.toUpperCase() === 'LISTEN'

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-900/40 hover:bg-neutral-900/80 border border-white/[0.06] hover:border-white/[0.12] transition-all group min-w-0 backdrop-blur-md shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* 1. 协议 (Protocol) 放在最前面 (固定宽度 w-12) */}
                  <div className="w-12 shrink-0 flex items-center justify-center">
                    <span className="w-full text-center text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-white/[0.06] uppercase shadow-inner">
                      {s.Protocol}
                    </span>
                  </div>

                  {/* 2. 端口 (Port) 固定宽度 w-20 绝对对齐 (点击复制端口) */}
                  <div className="w-20 shrink-0">
                    <button
                      onClick={() => copyWithFeedback(`${socketKey}-port`, String(s.Port))}
                      className="w-full text-center font-mono text-xs font-bold text-blue-300 bg-blue-950/80 hover:bg-blue-900/90 border border-blue-500/40 px-1 py-1 rounded-lg transition cursor-pointer truncate block shadow-sm active:scale-95"
                      title={`点击复制端口号: ${s.Port}`}
                    >
                      :{s.Port}
                    </button>
                  </div>

                  {/* 3. 状态 (State) 固定宽度 w-28 绝对对齐 */}
                  <div className="w-28 shrink-0 flex items-center justify-center">
                    <span
                      className={`w-full justify-center text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                        isListen
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/50'
                          : 'bg-neutral-800 text-neutral-400 border border-white/[0.06]'
                      }`}
                    >
                      <Radio className={`w-2.5 h-2.5 ${isListen ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
                      <span className="truncate">{s.State}</span>
                    </span>
                  </div>

                  {/* 4. 绑定地址 (Address) 从相同水平起点展开 */}
                  <div className="min-w-0 flex-1 flex items-center gap-1.5 text-neutral-300 font-mono text-xs">
                    <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="truncate select-text" title={s.Address}>
                      {s.Address || '0.0.0.0'}
                    </span>
                  </div>
                </div>

                {/* 5. 复制整行按钮 */}
                <button
                  onClick={() => copyWithFeedback(socketKey, `${s.Protocol} ${s.Port} ${s.State} ${s.Address}`)}
                  title="复制此连接信息"
                  className="p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.08] transition shrink-0 cursor-pointer active:scale-90"
                >
                  {isCopied(socketKey) ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
