import React, { useState } from 'react'
import { useAppStore } from '../../../stores/useAppStore'
import { useCopyFeedback } from '../../../hooks/useCopyFeedback'
import { Search, X, Copy, Check } from 'lucide-react'

export const DetailEnvTab: React.FC = () => {
  const { witrResult } = useAppStore()
  const { copyWithFeedback, isCopied } = useCopyFeedback()
  const [envFilter, setEnvFilter] = useState('')

  const envList = witrResult?.Process?.Env || []
  const filteredEnv = envList.filter((e) => {
    if (!envFilter) return true
    return e.toLowerCase().includes(envFilter.toLowerCase())
  })

  return (
    <div className="space-y-3 select-none">
      {/* Top Search & Stats Bar */}
      <div className="flex items-center justify-between">
        <div className="relative flex items-center w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-500" />
          <input
            type="text"
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            placeholder="搜索环境变量名或值 (如 PATH, NODE, USER)..."
            className="w-full pl-8 pr-7 py-1.5 bg-black/50 border border-white/[0.08] rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500/60 font-mono shadow-inner transition"
          />
          {envFilter && (
            <button
              onClick={() => setEnvFilter('')}
              className="absolute right-2 p-0.5 text-neutral-500 hover:text-neutral-200 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono bg-neutral-900/60 px-2.5 py-1 rounded-lg border border-white/[0.06]">
            匹配变量: <strong className="text-blue-400">{filteredEnv.length}</strong> / {envList.length}
          </span>
        </div>
      </div>

      {/* Double-Column Grid with Fixed-Width Key (Value 统一绝对对齐) */}
      {filteredEnv.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          {envList.length === 0 ? '该进程未暴露环境变量' : `未找到包含 "${envFilter}" 的环境变量`}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
          {filteredEnv.map((line, idx) => {
            const eqIndex = line.indexOf('=')
            const key = eqIndex !== -1 ? line.substring(0, eqIndex) : line
            const val = eqIndex !== -1 ? line.substring(eqIndex + 1) : ''
            const itemKey = `env-${key}-${idx}`

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2 rounded-xl bg-neutral-900/40 hover:bg-neutral-900/80 border border-white/[0.06] hover:border-white/[0.12] transition-all group min-w-0 backdrop-blur-md shadow-sm"
              >
                {/* Key & Value with Strict Alignment (w-36 fixed) */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-36 shrink-0">
                    <button
                      onClick={() => copyWithFeedback(`${itemKey}-k`, key)}
                      className="w-full text-left font-mono text-[11px] font-bold text-sky-300 bg-sky-950/80 hover:bg-sky-900/90 px-2 py-1 rounded-lg border border-sky-500/40 truncate block transition cursor-pointer active:scale-95 shadow-sm"
                      title={`点击复制变量名: ${key}`}
                    >
                      {key}
                    </button>
                  </div>

                  <div
                    onClick={() => copyWithFeedback(`${itemKey}-v`, val)}
                    className="flex-1 min-w-0 font-mono text-[11px] text-neutral-300 truncate select-text cursor-pointer hover:text-white transition py-0.5"
                    title={`点击复制变量值: ${val}`}
                  >
                    {val || <span className="text-neutral-600 italic">empty</span>}
                  </div>
                </div>

                {/* 1-Click Copy Entire Line */}
                <button
                  onClick={() => copyWithFeedback(itemKey, line)}
                  title="复制完整变量定义 (KEY=VALUE)"
                  className="p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.08] transition shrink-0 cursor-pointer active:scale-90"
                >
                  {isCopied(itemKey) ? (
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
