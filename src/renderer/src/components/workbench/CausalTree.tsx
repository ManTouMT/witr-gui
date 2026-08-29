import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { formatBytes, isCodeProject } from '../../utils/formatters'
import { translateWarning } from '../../utils/diagnostics'
import { useCopyFeedback } from '../../hooks/useCopyFeedback'
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
  Activity,
  GitFork,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  Target,
  ExternalLink,
  Check
} from 'lucide-react'

export const CausalTree: React.FC = () => {
  const {
    witrResult,
    selectedPort,
    selectedProcess,
    inspecting,
    openPath,
    inspectPid
  } = useAppStore()

  const { copyWithFeedback, isCopied } = useCopyFeedback()
  const [childrenExpanded, setChildrenExpanded] = useState(true)
  const [ancestorsExpanded, setAncestorsExpanded] = useState(true)
  const [showAllChildren, setShowAllChildren] = useState(false)

  useEffect(() => {
    setChildrenExpanded(true)
    setAncestorsExpanded(true)
    setShowAllChildren(false)
  }, [selectedPort?.port, selectedProcess?.pid, witrResult?.Process?.PID])

  if (inspecting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 gap-3">
        <Activity className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-sm font-medium">正在通过 witr 进行深层因果血缘溯源...</span>
        <span className="text-xs text-neutral-500 font-mono">Analyzing process ancestry & container linkages</span>
      </div>
    )
  }

  const rawAncestry = witrResult?.Ancestry || []
  const targetProcess = witrResult?.Process || (rawAncestry.length > 0 ? rawAncestry[rawAncestry.length - 1] : null)
  const children = witrResult?.Children || []

  // Ancestors above target, ordered from immediate parent down to root launchd
  const parentAncestors = rawAncestry.length > 1 ? rawAncestry.slice(0, -1).reverse() : []

  if (!targetProcess && rawAncestry.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 text-sm gap-2">
        <Layers className="w-8 h-8 text-neutral-600" />
        <span>未检测到因果调用链数据</span>
      </div>
    )
  }

  // Meaningful warnings with Chinese translation
  const rawWarnings = witrResult?.Warnings || []
  const meaningfulWarnings = rawWarnings.filter((w) => {
    const lower = w.toLowerCase()
    if (lower.includes('service name and process name do not match')) return false
    return true
  })

  // Active target identifiers
  const displayCommand = targetProcess?.Command || selectedPort?.processName || selectedProcess?.command || 'Unknown'
  const displayPID = targetProcess?.PID || selectedPort?.pid || selectedProcess?.pid || 0
  const displayPortNum = selectedPort?.port || (targetProcess?.Sockets && targetProcess.Sockets.length > 0 ? targetProcess.Sockets[0].Port : null)

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 space-y-5 relative">
      {/* Sticky Header with 0 gap above it */}
      <div className="sticky top-0 bg-neutral-950 z-20 pt-4 pb-3.5 border-b border-neutral-800/80 flex items-center justify-between -mx-6 px-6 shadow-md shadow-neutral-950/90">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>双向血缘家族树 (Full Process Family Tree)</span>
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              目标进程置顶 · 向上追溯父辈 · 向下展开派生子进程
            </p>
          </div>

          {/* Header Context Badges with PID & Port pills */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 border border-neutral-800 rounded-xl shadow-sm text-xs font-mono">
            {/* Process Name Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-800/80 text-blue-300 font-bold border border-neutral-700/40">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="truncate max-w-[120px]">{displayCommand}</span>
            </div>

            {/* PID Badge with Background & 1-Click Copy */}
            <button
              onClick={() => copyWithFeedback('header-pid', String(displayPID))}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-800/50 transition cursor-pointer group"
              title="点击复制 PID"
            >
              <span className="text-blue-400/80 font-normal">PID:</span>
              <strong className="text-white font-bold">{displayPID}</strong>
              {isCopied('header-pid') ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-blue-400 opacity-60 group-hover:opacity-100" />
              )}
            </button>

            {/* Port Badge with Background & 1-Click Copy */}
            {displayPortNum && (
              <button
                onClick={() => copyWithFeedback('header-port', String(displayPortNum))}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/60 transition cursor-pointer group"
                title="点击复制端口号"
              >
                <span className="text-emerald-400/80 font-normal">Port:</span>
                <strong className="text-emerald-200 font-bold">{displayPortNum}</strong>
                {isCopied('header-port') ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-emerald-400 opacity-60 group-hover:opacity-100" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {meaningfulWarnings.length > 0 && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/50 flex items-center gap-1 font-medium"
              title={meaningfulWarnings.map(translateWarning).join('; ')}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              {meaningfulWarnings.length} 项风险提示
            </span>
          )}

          <span className="text-xs px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
            祖先: {parentAncestors.length} 级
          </span>

          {children.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-800/50 text-purple-300 font-mono">
              子进程: {children.length} 个
            </span>
          )}
        </div>
      </div>

      {/* Meaningful Warnings Banner */}
      {meaningfulWarnings.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>安全审计与异常分析提示</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-200/90 pl-1 text-[11px] leading-relaxed">
            {meaningfulWarnings.map((w, idx) => (
              <li key={idx}>
                <span className="font-medium text-amber-100">{translateWarning(w)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 1. TOPMOST: Target Process Card */}
      {targetProcess && (
        <div id="target-process-card" className="relative pl-6">
          <div className="absolute -left-0 top-4 w-4 h-4 rounded-full border-2 border-blue-200 bg-blue-500 shadow-lg shadow-blue-500/50 ring-4 ring-blue-500/20 transform -translate-x-1/2 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>

          <div className="p-4 rounded-xl border bg-neutral-900/95 border-blue-500/80 ring-1 ring-blue-500/40 shadow-xl backdrop-blur-md transition-all">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-500/80 bg-blue-950/60 text-blue-300 flex items-center gap-1">
                  <Target className="w-3 h-3 text-blue-400" />
                  目标进程 (Target Process)
                </span>
                <span className="font-bold text-base text-neutral-100 font-mono">
                  {targetProcess.Command}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  PID: <strong className="text-white">{targetProcess.PID}</strong>
                </span>
                {targetProcess.PPID > 0 && (
                  <span className="text-[11px] text-neutral-500 font-mono">
                    (PPID: {targetProcess.PPID})
                  </span>
                )}
                {displayPortNum && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono font-bold">
                    Port: {displayPortNum}
                  </span>
                )}
              </div>

              {/* Resource Badges */}
              <div className="flex items-center gap-2 text-xs font-mono">
                {targetProcess.MemoryRSS && targetProcess.MemoryRSS > 0 ? (
                  <span className="flex items-center gap-1 text-neutral-200 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700/60 font-semibold">
                    <HardDrive className="w-3 h-3 text-cyan-400" />
                    {formatBytes(targetProcess.MemoryRSS)}
                  </span>
                ) : null}
                {targetProcess.CPUPercent !== undefined ? (
                  <span className="flex items-center gap-1 text-neutral-200 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700/60 font-semibold">
                    <Cpu className="w-3 h-3 text-amber-400" />
                    {targetProcess.CPUPercent.toFixed(1)}%
                  </span>
                ) : null}
              </div>
            </div>

            {/* Command Line */}
            <div className="p-2 rounded-lg bg-neutral-950/90 border border-neutral-800 font-mono text-xs text-neutral-300 flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5 min-w-0">
                <Terminal className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                <span className="break-all select-text font-mono text-[11px] leading-relaxed">
                  {targetProcess.Cmdline || targetProcess.Command}
                </span>
              </div>
              <button
                onClick={() => copyWithFeedback('target-cmd', targetProcess.Cmdline || targetProcess.Command)}
                title="复制完整启动命令"
                className="p-1 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition shrink-0 cursor-pointer"
              >
                {isCopied('target-cmd') ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Metadata Row */}
            <div className="mt-2.5 pt-2.5 border-t border-neutral-800/70 grid grid-cols-2 gap-2 text-xs text-neutral-400">
              {targetProcess.User && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-neutral-500">运行用户:</span>
                  <span className="text-neutral-200 font-mono font-medium">{targetProcess.User}</span>
                </div>
              )}

              {targetProcess.StartedAt && (
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-neutral-500">启动时间:</span>
                  <span className="text-neutral-300 font-mono text-[11px]">
                    {new Date(targetProcess.StartedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {targetProcess.WorkingDir && targetProcess.WorkingDir !== 'unknown' && (
                <div className="col-span-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FolderOpen className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="text-neutral-500 shrink-0">工作区:</span>
                    <span className="text-neutral-200 font-mono truncate text-[11px] select-text font-medium">
                      {targetProcess.WorkingDir}
                    </span>
                    {targetProcess.Workspace?.projectLabel && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-800/40 shrink-0 font-medium">
                        {targetProcess.Workspace.projectLabel}
                      </span>
                    )}
                    <button
                      onClick={() => copyWithFeedback('target-cwd', targetProcess.WorkingDir!)}
                      title="复制工作区路径"
                      className="p-0.5 text-neutral-500 hover:text-neutral-200 transition cursor-pointer"
                    >
                      {isCopied('target-cwd') ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  {isCodeProject(targetProcess.Workspace, targetProcess.WorkingDir) ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openPath(targetProcess.WorkingDir!, 'vscode')}
                        className="px-2 py-0.5 rounded bg-blue-950/70 hover:bg-blue-900 text-blue-300 text-[10px] font-medium border border-blue-800/50 transition cursor-pointer"
                      >
                        VS Code
                      </button>
                      <button
                        onClick={() => openPath(targetProcess.WorkingDir!, 'finder')}
                        className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-medium transition cursor-pointer"
                      >
                        Finder
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openPath(targetProcess.WorkingDir!, 'finder')}
                      className="px-2 py-0.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[10px] font-medium transition shrink-0 cursor-pointer"
                    >
                      {targetProcess.Workspace?.projectType === 'app_sandbox' ? '访达定位沙盒' : 'Finder'}
                    </button>
                  )}
                </div>
              )}

              {targetProcess.GitBranch && (
                <div className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-neutral-500">Git 分支:</span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">{targetProcess.GitBranch}</span>
                </div>
              )}

              {targetProcess.Container && (
                <div className="flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-neutral-500">容器:</span>
                  <span className="text-cyan-300 font-mono text-[11px] font-bold">{targetProcess.Container}</span>
                </div>
              )}

              {targetProcess.Service && (
                <div className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-neutral-500">守护服务:</span>
                  <span className="text-amber-300 font-mono text-[11px]">{targetProcess.Service}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MIDDLE: Upward Ancestor Chain */}
      {parentAncestors.length > 0 && (
        <div className="pt-2 pl-6">
          <button
            onClick={() => setAncestorsExpanded(!ancestorsExpanded)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800/80 text-neutral-300 transition mb-3 cursor-pointer"
          >
            <div className="flex items-center gap-2 font-semibold text-xs text-neutral-300">
              <ArrowUpRight className="w-4 h-4 text-blue-400" />
              <span>向上启动溯源链条 (Upstream Ancestors: {parentAncestors.length} 级父进程)</span>
            </div>

            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-mono">
              <span>{ancestorsExpanded ? '收起父链' : '展开父链'}</span>
              {ancestorsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>

          {ancestorsExpanded && (
            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500/60 before:to-purple-500/60">
              {parentAncestors.map((node, pIdx) => {
                const isRoot = pIdx === parentAncestors.length - 1
                const nodeKey = `ancestor-${node.PID}-${pIdx}`

                return (
                  <div key={`${node.PID}-${pIdx}`} className="relative group">
                    <div
                      className={`absolute -left-6 top-3 w-2.5 h-2.5 rounded-full border transform -translate-x-1/2 ${
                        isRoot
                          ? 'bg-purple-500 border-purple-300 ring-2 ring-purple-500/30'
                          : 'bg-neutral-800 border-neutral-600 group-hover:border-blue-400'
                      }`}
                    />

                    {/* Clickable Ancestor Card */}
                    <div
                      onClick={() => inspectPid(node.PID)}
                      className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/70 hover:bg-neutral-900/90 hover:border-blue-500/70 transition text-xs space-y-1.5 cursor-pointer shadow-sm hover:shadow-md hover:shadow-blue-950/40 group/card"
                      title="点击聚焦并深层分析此父进程"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              isRoot
                                ? 'bg-purple-950/80 text-purple-300 border-purple-800/50'
                                : 'bg-neutral-800 text-neutral-400 border-neutral-700/50'
                            }`}
                          >
                            {isRoot ? 'ROOT INIT' : `PARENT L${pIdx + 1}`}
                          </span>
                          <span className="font-bold text-neutral-200 font-mono group-hover/card:text-blue-300 transition">
                            {node.Command}
                          </span>
                          <span className="text-neutral-500 font-mono text-[11px]">
                            PID: <strong className="text-neutral-300">{node.PID}</strong>
                          </span>
                          <span className="text-[10px] text-blue-400/80 opacity-0 group-hover/card:opacity-100 transition flex items-center gap-0.5">
                            <ExternalLink className="w-2.5 h-2.5" /> 切换聚焦
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
                          {node.MemoryRSS && node.MemoryRSS > 0 && (
                            <span className="text-cyan-400 flex items-center gap-0.5">
                              <HardDrive className="w-3 h-3" />
                              {formatBytes(node.MemoryRSS)}
                            </span>
                          )}
                          {node.User && <span className="text-neutral-500">{node.User}</span>}
                        </div>
                      </div>

                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded bg-neutral-950/70 border border-neutral-850 font-mono text-[10px] text-neutral-400 flex items-center justify-between gap-2"
                      >
                        <span className="truncate select-text">{node.Cmdline || node.Command}</span>
                        <button
                          onClick={() => copyWithFeedback(nodeKey, node.Cmdline || node.Command)}
                          title="复制启动命令"
                          className="p-0.5 text-neutral-500 hover:text-neutral-200 transition shrink-0 cursor-pointer"
                        >
                          {isCopied(nodeKey) ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. BOTTOM: Downwards Subprocesses */}
      {children.length > 0 && (
        <div className="pt-2 pl-6">
          <button
            onClick={() => setChildrenExpanded(!childrenExpanded)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-purple-900/40 text-purple-200 transition mb-3 cursor-pointer"
          >
            <div className="flex items-center gap-2 font-semibold text-xs text-purple-300">
              <GitFork className="w-4 h-4 text-purple-400" />
              <span>由该目标进程孵化的衍生子进程 (Subprocesses / Helpers: {children.length} 个)</span>
            </div>

            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-mono">
              <span>{childrenExpanded ? '收起子进程' : '展开子进程'}</span>
              {childrenExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>

          {/* Subprocess Indentation + Branch Lines */}
          {childrenExpanded && (
            <div className="relative pl-8 ml-3 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-purple-500/80 before:to-pink-500/80">
              {(showAllChildren || children.length <= 30 ? children : children.slice(0, 30)).map((child, cIdx) => {
                const childKey = `child-cmd-${child.PID}-${cIdx}`

                return (
                  <div key={child.PID} className="relative group/child">
                    <div className="absolute -left-6 top-4 w-4 h-0.5 bg-purple-500/60" />
                    <div className="absolute -left-6.5 top-3.5 w-1.5 h-1.5 rounded-full bg-purple-400" />

                    {/* Clickable Child Card */}
                    <div
                      onClick={() => inspectPid(child.PID)}
                      className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:bg-neutral-900/90 hover:border-purple-500/70 transition text-xs space-y-1.5 cursor-pointer shadow-sm hover:shadow-md hover:shadow-purple-950/40 group/card"
                      title="点击聚焦并深层分析此子进程"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                            CHILD #{cIdx + 1}
                          </span>
                          <span className="font-bold text-neutral-200 font-mono group-hover/card:text-purple-300 transition">
                            {child.Command}
                          </span>
                          <span className="text-neutral-500 font-mono text-[11px]">
                            PID: <strong className="text-neutral-300">{child.PID}</strong>
                          </span>
                          <span className="text-[10px] text-purple-400/80 opacity-0 group-hover/card:opacity-100 transition flex items-center gap-0.5">
                            <ExternalLink className="w-2.5 h-2.5" /> 切换聚焦
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          {child.MemoryPercent !== undefined && child.MemoryPercent > 0 && (
                            <span className="text-purple-300">
                              {child.MemoryPercent.toFixed(1)}% Mem
                            </span>
                          )}
                          {child.CPUPercent !== undefined && child.CPUPercent > 0 && (
                            <span className="text-amber-400">
                              {child.CPUPercent.toFixed(1)}% CPU
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Child Command Line */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded bg-neutral-950/70 border border-neutral-850 font-mono text-[10px] text-neutral-400 flex items-center justify-between gap-2"
                      >
                        <span className="truncate select-text">{child.Cmdline || child.Command}</span>
                        <button
                          onClick={() => copyWithFeedback(childKey, child.Cmdline || child.Command)}
                          title="复制子进程命令"
                          className="p-0.5 text-neutral-500 hover:text-neutral-200 transition shrink-0 cursor-pointer"
                        >
                          {isCopied(childKey) ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {children.length > 30 && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setShowAllChildren(!showAllChildren)}
                    className="px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/50 text-purple-300 text-xs font-mono font-semibold transition shadow-md cursor-pointer"
                  >
                    {showAllChildren
                      ? `收起子进程列表 (仅展示前 30 个)`
                      : `已展示前 30 个，点击加载全部 ${children.length} 个子进程`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
