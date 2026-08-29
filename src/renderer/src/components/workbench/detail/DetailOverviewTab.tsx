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
    <div className="grid grid-cols-3 gap-4 text-xs">
      {/* Meta Grid Card 1: 运行生命周期 */}
      <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
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
      <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
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
                  className="p-1 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition shrink-0"
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
      <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
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
                  onClick={() => copyWithFeedback('dir', workingDir)}
                  title="复制工作目录"
                  className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-200 transition"
                >
                  {isCopied('dir') ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 已复制
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      <Copy className="w-3 h-3" /> 复制
                    </span>
                  )}
                </button>
              )}
            </div>
            <span
              className="text-neutral-200 truncate block select-text font-mono text-[10px] bg-neutral-950/70 p-1.5 rounded border border-neutral-800"
              title={workingDir}
            >
              {workingDir || 'unknown'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
