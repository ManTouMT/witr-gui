import React from 'react'
import { useAppStore } from '../../../stores/useAppStore'
import { useCopyFeedback } from '../../../hooks/useCopyFeedback'
import { Clock, Server, GitBranch, Check, Copy } from 'lucide-react'

export const DetailOverviewTab: React.FC = () => {
  const { witrResult, selectedPort } = useAppStore()
  const { copyWithFeedback, isCopied } = useCopyFeedback()

  const processInfo = witrResult?.Process
  const workingDir = processInfo?.WorkingDir || ''
  const serviceName = witrResult?.Source?.Name || ''

  return (
    <div className="grid grid-cols-3 gap-3.5 text-xs select-none">
      {/* Meta Grid Card 1: 运行生命周期 */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/[0.12] transition-all space-y-2.5 backdrop-blur-md">
        <span className="font-semibold text-neutral-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          运行生命周期
        </span>
        <div className="space-y-1.5 text-neutral-400 font-mono text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">启动时间:</span>
            <span className="text-neutral-200">
              {processInfo?.StartedAt ? new Date(processInfo.StartedAt).toLocaleString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">运行用户:</span>
            <span className="text-neutral-200">{processInfo?.User || selectedPort?.user || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">重启计数:</span>
            <span className="text-neutral-200">{witrResult?.RestartCount ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Meta Grid Card 2: 守护源与服务 */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/[0.12] transition-all space-y-2.5 backdrop-blur-md">
        <span className="font-semibold text-neutral-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
          <Server className="w-3.5 h-3.5 text-purple-400" />
          守护源与服务
        </span>
        <div className="space-y-1.5 text-neutral-400 font-mono text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">来源类型:</span>
            <span className="text-purple-300 font-semibold">{witrResult?.Source?.Type || 'launchd / direct'}</span>
          </div>

          <div className="flex items-center justify-between gap-1 group">
            <span className="text-neutral-500 shrink-0">服务名:</span>
            <div className="flex items-center gap-1 min-w-0">
              <span
                className="text-neutral-200 truncate font-mono text-[11px] select-text font-medium"
                title={serviceName || 'N/A'}
              >
                {serviceName || 'N/A'}
              </span>
              {serviceName && (
                <button
                  onClick={() => copyWithFeedback('service', serviceName)}
                  title="复制完整服务名"
                  className="p-1 rounded text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.08] transition shrink-0 cursor-pointer active:scale-90"
                >
                  {isCopied('service') ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>

          {processInfo?.Container && (
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Docker 容器:</span>
              <span className="text-cyan-400 font-bold">{processInfo.Container}</span>
            </div>
          )}
        </div>
      </div>

      {/* Meta Grid Card 3: 代码仓库与路径 */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/[0.12] transition-all space-y-2.5 backdrop-blur-md">
        <span className="font-semibold text-neutral-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
          代码仓库与路径
        </span>
        <div className="space-y-1.5 text-neutral-400 font-mono text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Git 分支:</span>
            <span className="text-emerald-400 font-bold">{processInfo?.GitBranch || '无'}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-neutral-500">工作目录:</span>
              {workingDir && workingDir !== 'unknown' && (
                <button
                  onClick={() => copyWithFeedback('cwd-detail', workingDir)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-200 flex items-center gap-1 transition cursor-pointer active:scale-90"
                >
                  {isCopied('cwd-detail') ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{isCopied('cwd-detail') ? '已复制' : '复制'}</span>
                </button>
              )}
            </div>
            <div
              className="p-2 rounded-xl bg-black/60 border border-white/[0.06] text-neutral-300 font-mono truncate text-[10px] select-text shadow-inner font-medium"
              title={workingDir}
            >
              {workingDir || 'unknown'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
