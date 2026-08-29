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
    <div className="space-y-3">
      {/* Top Search & Stats */}
      <div className="flex items-center justify-between">
        <div className="relative flex items-center w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-500" />
          <input
            type="text"
            value={socketFilter}
            onChange={(e) => setSocketFilter(e.target.value)}
            placeholder="搜索监听端口、协议或绑定 IP (如 3000, 127.0.0.1)..."
            className="w-full pl-8 pr-7 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500/60 font-mono"
          />
          {socketFilter && (
            <button
              onClick={() => setSocketFilter('')}
              className="absolute right-2 p-0.5 text-neutral-500 hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-neutral-400 font-mono bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
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
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition group min-w-0"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* 1. 协议 (Protocol) 放在最前面 (固定宽度 w-12) */}
                  <div className="w-12 shrink-0 flex items-center justify-center">
                    <span className="w-full text-center text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/50 uppercase">
                      {s.Protocol}
                    </span>
                  </div>

                  {/* 2. 端口 (Port) 固定宽度 w-20 绝对对齐 (点击复制端口) */}
                  <div className="w-20 shrink-0">
                    <button
                      onClick={() => copyWithFeedback(`${socketKey}-port`, String(s.Port))}
                      className="w-full text-center font-mono text-xs font-bold text-blue-300 bg-blue-950/80 hover:bg-blue-900/90 border border-blue-800/60 px-1 py-1 rounded-lg transition cursor-pointer truncate block"
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
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 shadow-sm shadow-emerald-950/50'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700/40'
                      }`}
                    >
                      <Radio className={`w-2.5 h-2.5 ${isListen ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
                      <span className="truncate">{s.State}</span>
                    </span>
                  </div>

                  {/* 4. 绑定地址 (Address) 从相同水平起点展开 */}
                  <div
                    onClick={() => copyWithFeedback(`${socketKey}-addr`, s.Address)}
                    className="flex items-center gap-1 font-mono text-[11px] text-neutral-400 hover:text-neutral-200 truncate cursor-pointer transition min-w-0 flex-1"
                    title={`点击复制绑定地址: ${s.Address}`}
                  >
                    <Globe className="w-3 h-3 text-neutral-500 shrink-0" />
                    <span className="truncate">{s.Address}</span>
                  </div>
                </div>

                {/* Right 1-Click Copy Entire Socket */}
                <button
                  onClick={() => copyWithFeedback(socketKey, `${s.Protocol} ${s.Address}:${s.Port} [${s.State}]`)}
                  title="复制套接字完整信息"
                  className="p-1 rounded-md text-neutral-500 group-hover:text-neutral-200 hover:bg-neutral-800 transition shrink-0"
                >
                  {isCopied(socketKey) ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
