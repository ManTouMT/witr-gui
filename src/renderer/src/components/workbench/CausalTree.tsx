import React from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { ProcessInfo } from '@shared/types'
import {
  Layers,
  Terminal,
  FolderOpen,
  GitBranch,
  Cpu,
  HardDrive,
  User,
  Copy,
  AlertTriangle,
  Box,
  Server,
  Activity
} from 'lucide-react'

export const CausalTree: React.FC = () => {
  const { witrResult, inspecting, copyText, openPath } = useAppStore()

  if (inspecting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 gap-3">
        <Activity className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-sm font-medium">正在通过 witr 进行深层因果血缘溯源...</span>
        <span className="text-xs text-neutral-500 font-mono">Analyzing process ancestry & container linkages</span>
      </div>
    )
  }

  const ancestry = witrResult?.Ancestry || []
  const targetProcess = witrResult?.Process

  if (ancestry.length === 0 && !targetProcess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 text-sm gap-2">
        <Layers className="w-8 h-8 text-neutral-600" />
        <span>未检测到因果调用链数据</span>
      </div>
    )
  }

  // Filter out macOS false-positive warnings (e.g. launchd application service naming conventions)
  const rawWarnings = witrResult?.Warnings || []
  const meaningfulWarnings = rawWarnings.filter((w) => {
    const lower = w.toLowerCase()
    // Ignore macOS LaunchServices service name mismatch (e.g. application.com.tencent.qq.xxx)
    if (lower.includes('service name and process name do not match')) return false
    // Ignore root directory on launchd daemons
    if (lower.includes('suspicious working directory: /') && targetProcess?.Service) return false
    return true
  })

  // Format bytes to human readable
  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 MB'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const getNodeRole = (index: number, total: number, node: ProcessInfo) => {
    if (index === total - 1) return { label: '目标进程 (Target Process)', color: 'border-blue-500/80 bg-blue-950/40 text-blue-300' }
    if (index === 0) return { label: '根守护系统 (Root Init)', color: 'border-purple-500/60 bg-purple-950/30 text-purple-300' }
    if (node.Container) return { label: 'Docker 容器', color: 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300' }
    if (node.Service) return { label: '守护服务 (Service / PM2)', color: 'border-amber-500/60 bg-amber-950/30 text-amber-300' }
    return { label: `中间父进程 (Parent L${index})`, color: 'border-neutral-700 bg-neutral-900/60 text-neutral-300' }
  }

  const isValidProjectDir = (dir?: string) => {
    if (!dir || dir === 'unknown' || dir === '/' || dir === '/Applications') return false
    return true
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>因果溯源链路 (Causal Ancestry Hierarchy)</span>
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            追踪进程如何被启动 · Who started whom and why
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtle Warning Badge if any REAL warning exists */}
          {meaningfulWarnings.length > 0 && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/50 flex items-center gap-1 font-medium"
              title={meaningfulWarnings.join('; ')}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              {meaningfulWarnings.length} 项风险提示
            </span>
          )}

          <span className="text-xs px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
            深度: {ancestry.length} 级调用
          </span>
        </div>
      </div>

      {/* Meaningful Warnings Banner (Only when non-trivial warnings occur) */}
      {meaningfulWarnings.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>安全审计与异常提示</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 pl-1 font-mono text-[11px]">
            {meaningfulWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Vertical Timeline Tree */}
      <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-purple-500/80 before:via-blue-500/80 before:to-emerald-500/80">
        {ancestry.map((node, index) => {
          const role = getNodeRole(index, ancestry.length, node)
          const isTarget = index === ancestry.length - 1
          const isProject = isValidProjectDir(node.WorkingDir)

          return (
            <div key={`${node.PID}-${index}`} className="relative group">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-6 top-4 w-3.5 h-3.5 rounded-full border-2 transform -translate-x-1/2 flex items-center justify-center transition ${
                  isTarget
                    ? 'bg-blue-500 border-blue-200 shadow-md shadow-blue-500/40 ring-4 ring-blue-500/20'
                    : 'bg-neutral-900 border-neutral-600 group-hover:border-blue-400'
                }`}
              />

              {/* Node Card */}
              <div
                className={`p-4 rounded-xl border transition-all duration-200 shadow-md backdrop-blur-sm ${
                  isTarget
                    ? 'bg-neutral-900/90 border-blue-500/60 ring-1 ring-blue-500/30'
                    : 'bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-900/70 hover:border-neutral-700'
                }`}
              >
                {/* Top Row: Role, Command Name, PID */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${role.color}`}>
                      {role.label}
                    </span>
                    <span className="font-bold text-sm text-neutral-100 font-mono">
                      {node.Command}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      PID: <strong className="text-neutral-300">{node.PID}</strong>
                    </span>
                    {node.PPID > 0 && (
                      <span className="text-[11px] text-neutral-500 font-mono">
                        (PPID: {node.PPID})
                      </span>
                    )}
                  </div>

                  {/* Resource Badges */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    {node.MemoryRSS && node.MemoryRSS > 0 ? (
                      <span className="flex items-center gap-1 text-neutral-300 px-2 py-0.5 rounded-md bg-neutral-800/80 border border-neutral-700/50">
                        <HardDrive className="w-3 h-3 text-cyan-400" />
                        {formatBytes(node.MemoryRSS)}
                      </span>
                    ) : null}
                    {node.CPUPercent !== undefined && node.CPUPercent > 0 ? (
                      <span className="flex items-center gap-1 text-neutral-300 px-2 py-0.5 rounded-md bg-neutral-800/80 border border-neutral-700/50">
                        <Cpu className="w-3 h-3 text-amber-400" />
                        {node.CPUPercent.toFixed(1)}%
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Command Line with 1-click Copy */}
                <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 font-mono text-xs text-neutral-300 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <Terminal className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                    <span className="break-all select-text font-mono text-[11px] leading-relaxed">
                      {node.Cmdline || node.Command}
                    </span>
                  </div>
                  <button
                    onClick={() => copyText(node.Cmdline || node.Command)}
                    title="复制完整启动命令"
                    className="p-1 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                {/* Metadata Row: User, WorkingDir, Git, Container */}
                <div className="mt-2.5 pt-2 border-t border-neutral-800/60 grid grid-cols-2 gap-2 text-xs text-neutral-400">
                  {node.User && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-neutral-500">用户:</span>
                      <span className="text-neutral-300 font-mono">{node.User}</span>
                    </div>
                  )}

                  {node.StartedAt && (
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-neutral-500">启动时间:</span>
                      <span className="text-neutral-300 font-mono text-[11px]">
                        {new Date(node.StartedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {node.WorkingDir && node.WorkingDir !== 'unknown' && (
                    <div className="col-span-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FolderOpen className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="text-neutral-500 shrink-0">工作区:</span>
                        <span className="text-neutral-300 font-mono truncate text-[11px] select-text">
                          {node.WorkingDir}
                        </span>
                      </div>

                      {/* Only show VS Code / Cursor when it's a real project directory */}
                      {isProject ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openPath(node.WorkingDir!, 'vscode')}
                            className="px-2 py-0.5 rounded bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 text-[10px] font-medium border border-blue-800/50 transition"
                          >
                            VS Code
                          </button>
                          <button
                            onClick={() => openPath(node.WorkingDir!, 'cursor')}
                            className="px-2 py-0.5 rounded bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 text-[10px] font-medium border border-purple-800/50 transition"
                          >
                            Cursor
                          </button>
                          <button
                            onClick={() => openPath(node.WorkingDir!, 'finder')}
                            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-medium transition"
                          >
                            Finder
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openPath(node.WorkingDir!, 'finder')}
                          className="px-2 py-0.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 text-[10px] font-medium transition shrink-0"
                        >
                          Finder
                        </button>
                      )}
                    </div>
                  )}

                  {node.GitBranch && (
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-neutral-500">Git 分支:</span>
                      <span className="text-emerald-400 font-mono text-[11px] font-medium">{node.GitBranch}</span>
                    </div>
                  )}

                  {node.Container && (
                    <div className="flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-neutral-500">容器:</span>
                      <span className="text-cyan-300 font-mono text-[11px] font-medium">{node.Container}</span>
                    </div>
                  )}

                  {node.Service && (
                    <div className="flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-neutral-500">服务:</span>
                      <span className="text-amber-300 font-mono text-[11px]">{node.Service}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
