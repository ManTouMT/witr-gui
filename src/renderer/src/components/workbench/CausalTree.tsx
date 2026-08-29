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
  Check,
  Code
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 gap-3 select-none">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          <Activity className="w-5 h-5 text-blue-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <span className="text-sm font-medium text-neutral-200">正在通过 witr 进行深层因果血缘溯源...</span>
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 text-sm gap-2 select-none">
        <Layers className="w-8 h-8 text-neutral-700" />
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
      {/* Sticky Header with 0 gap above it & Edge-to-Edge Frosted Glass Finish */}
      <div className="sticky top-0 bg-[#09090c]/95 backdrop-blur-2xl z-20 pt-4 pb-3.5 border-b border-white/[0.06] flex items-center justify-between -mx-6 px-6 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3.5">
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2 tracking-tight">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>双向血缘家族树 (Full Process Family Tree)</span>
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              目标进程置顶 · 向上追溯父辈 · 向下展开派生子进程
            </p>
          </div>

          {/* Header Context Badges with Specular Highlight */}
          <div className="flex items-center gap-1.5 p-1 bg-black/60 border border-white/[0.08] rounded-xl shadow-inner text-xs font-mono">
            {/* Process Name Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-850 text-blue-300 font-bold border border-white/[0.06]">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="truncate max-w-[130px]">{displayCommand}</span>
            </div>

            {/* PID Badge */}
            <button
              onClick={() => copyWithFeedback('header-pid', String(displayPID))}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 shadow-sm transition active:scale-95 cursor-pointer group"
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

            {/* Port Badge */}
            {displayPortNum && (
              <button
                onClick={() => copyWithFeedback('header-port', String(displayPortNum))}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 shadow-sm transition active:scale-95 cursor-pointer group"
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
              className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 font-medium shadow-sm shadow-amber-950/40"
              title={meaningfulWarnings.map(translateWarning).join('; ')}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              {meaningfulWarnings.length} 项风险提示
            </span>
          )}

          <span className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-neutral-300 font-mono">
            祖先: {parentAncestors.length} 级
          </span>

          {children.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-500/40 text-purple-300 font-mono shadow-sm shadow-purple-950/40">
              子进程: {children.length} 个
            </span>
          )}
        </div>
      </div>

      {/* Meaningful Warnings Banner */}
      {meaningfulWarnings.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1.5 shadow-lg shadow-amber-950/20 backdrop-blur-md">
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

      {/* 1. TOPMOST: Target Process Premium Glass Card */}
      {targetProcess && (
        <div id="target-process-card" className="relative pl-6">
          {/* Pulsing Radar Dot Anchor */}
          <div className="absolute -left-0 top-5 transform -translate-x-1/2 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-white shadow-md shadow-blue-500" />
          </div>

          <div className="p-5 rounded-2xl border border-blue-500/50 bg-gradient-to-b from-blue-950/40 via-[#11131a] to-[#0c0d12] shadow-2xl shadow-blue-950/60 backdrop-blur-xl transition-all relative overflow-hidden">
            {/* Top Ambient Glow Highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

            {/* Top Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-500/60 bg-blue-950/80 text-blue-300 flex items-center gap-1 shadow-sm">
                  <Target className="w-3 h-3 text-blue-400" />
                  目标进程 (Target)
                </span>
                <span className="font-bold text-base text-white font-mono tracking-tight">
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
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-mono font-bold shadow-sm">
                    Port: {displayPortNum}
                  </span>
                )}
              </div>

              {/* Resource Badges */}
              <div className="flex items-center gap-2 text-xs font-mono">
                {targetProcess.MemoryRSS && targetProcess.MemoryRSS > 0 ? (
                  <span className="flex items-center gap-1.5 text-neutral-100 px-2.5 py-1 rounded-lg bg-black/60 border border-white/[0.08] shadow-inner font-semibold">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                    {formatBytes(targetProcess.MemoryRSS)}
                  </span>
                ) : null}
                {targetProcess.CPUPercent !== undefined ? (
                  <span className="flex items-center gap-1.5 text-neutral-100 px-2.5 py-1 rounded-lg bg-black/60 border border-white/[0.08] shadow-inner font-semibold">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    {targetProcess.CPUPercent.toFixed(1)}%
                  </span>
                ) : null}
              </div>
            </div>

            {/* Command Line Box */}
            <div className="p-2.5 rounded-xl bg-black/70 border border-white/[0.07] font-mono text-xs text-neutral-300 flex items-start justify-between gap-2 shadow-inner">
              <div className="flex items-start gap-1.5 min-w-0">
                <Terminal className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                <span className="break-all select-text font-mono text-[11px] leading-relaxed text-neutral-200">
                  {targetProcess.Cmdline || targetProcess.Command}
                </span>
              </div>
              <button
                onClick={() => copyWithFeedback('target-cmd', targetProcess.Cmdline || targetProcess.Command)}
                title="复制完整启动命令"
                className="p-1 rounded-md text-neutral-500 hover:text-white hover:bg-white/[0.08] transition shrink-0 cursor-pointer active:scale-90"
              >
                {isCopied('target-cmd') ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Metadata Row */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2.5 text-xs text-neutral-400">
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
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-sky-950/80 text-sky-300 border border-sky-500/40 shrink-0 font-medium">
                        {targetProcess.Workspace.projectLabel}
                      </span>
                    )}
                    <button
                      onClick={() => copyWithFeedback('target-cwd', targetProcess.WorkingDir!)}
                      title="复制工作区路径"
                      className="p-0.5 text-neutral-500 hover:text-neutral-200 transition cursor-pointer active:scale-90"
                    >
                      {isCopied('target-cwd') ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  {isCodeProject(targetProcess.Workspace, targetProcess.WorkingDir) ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openPath(targetProcess.WorkingDir!, 'vscode')}
                        className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 text-[10px] font-medium border border-blue-500/40 transition shadow-sm cursor-pointer active:scale-95 flex items-center gap-1"
                      >
                        <Code className="w-3 h-3" />
                        <span>VS Code</span>
                      </button>
                      <button
                        onClick={() => openPath(targetProcess.WorkingDir!, 'finder')}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 text-[10px] font-medium border border-white/[0.04] transition cursor-pointer active:scale-95 flex items-center gap-1"
                      >
                        <FolderOpen className="w-3 h-3" />
                        <span>Finder</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openPath(targetProcess.WorkingDir!, 'finder')}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 hover:text-white text-[10px] font-medium border border-white/[0.04] transition shrink-0 cursor-pointer active:scale-95 flex items-center gap-1"
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>{targetProcess.Workspace?.projectType === 'app_sandbox' ? '访达定位沙盒' : 'Finder'}</span>
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

      {/* 2. MIDDLE: Upward Ancestor Chain with Glowing Conduit Line */}
      {parentAncestors.length > 0 && (
        <div className="pt-2 pl-6">
          <button
            onClick={() => setAncestorsExpanded(!ancestorsExpanded)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/40 hover:bg-neutral-900/80 border border-white/[0.06] text-neutral-300 transition mb-3 cursor-pointer group"
          >
            <div className="flex items-center gap-2 font-semibold text-xs text-neutral-300 group-hover:text-blue-300 transition">
              <ArrowUpRight className="w-4 h-4 text-blue-400" />
              <span>向上启动溯源链条 (Upstream Ancestors: {parentAncestors.length} 级父进程)</span>
            </div>

            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-mono">
              <span>{ancestorsExpanded ? '收起父链' : '展开父链'}</span>
              {ancestorsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>

          {ancestorsExpanded && (
            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500/80 before:via-indigo-500/60 before:to-purple-500/80">
              {parentAncestors.map((node, pIdx) => {
                const isRoot = pIdx === parentAncestors.length - 1
                const nodeKey = `ancestor-${node.PID}-${pIdx}`

                return (
                  <div key={`${node.PID}-${pIdx}`} className="relative group">
                    <div
                      className={`absolute -left-6 top-3 w-2.5 h-2.5 rounded-full border transform -translate-x-1/2 transition ${
                        isRoot
                          ? 'bg-purple-500 border-purple-300 ring-4 ring-purple-500/20'
                          : 'bg-neutral-800 border-neutral-600 group-hover:border-blue-400 group-hover:bg-blue-500'
                      }`}
                    />

                    {/* Clickable Ancestor Card */}
                    <div
                      onClick={() => inspectPid(node.PID)}
                      className="p-3.5 rounded-2xl bg-neutral-900/40 border border-white/[0.05] hover:bg-neutral-900/90 hover:border-blue-500/50 transition-all text-xs space-y-2 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-950/40 group/card backdrop-blur-md"
                      title="点击聚焦并深层分析此父进程"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                              isRoot
                                ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                                : 'bg-neutral-800 text-neutral-400 border-white/[0.06]'
                            }`}
                          >
                            {isRoot ? 'ROOT INIT' : `PARENT L${pIdx + 1}`}
                          </span>
                          <span className="font-bold text-neutral-100 font-mono group-hover/card:text-blue-300 transition">
                            {node.Command}
                          </span>
                          <span className="text-neutral-500 font-mono text-[11px]">
                            PID: <strong className="text-neutral-300">{node.PID}</strong>
                          </span>
                          <span className="text-[10px] text-blue-400 opacity-0 group-hover/card:opacity-100 transition flex items-center gap-0.5 font-medium">
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
                        className="p-2 rounded-lg bg-black/60 border border-white/[0.05] font-mono text-[10px] text-neutral-300 flex items-center justify-between gap-2 shadow-inner"
                      >
                        <span className="truncate select-text">{node.Cmdline || node.Command}</span>
                        <button
                          onClick={() => copyWithFeedback(nodeKey, node.Cmdline || node.Command)}
                          title="复制启动命令"
                          className="p-0.5 text-neutral-500 hover:text-white transition shrink-0 cursor-pointer active:scale-90"
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

      {/* 3. BOTTOM: Downwards Subprocesses with Conduit Branch Lines */}
      {children.length > 0 && (
        <div className="pt-2 pl-6">
          <button
            onClick={() => setChildrenExpanded(!childrenExpanded)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/30 text-purple-200 transition mb-3 cursor-pointer group"
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
            <div className="relative pl-8 ml-3 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-purple-500/80 before:via-pink-500/60 before:to-purple-500/80">
              {(showAllChildren || children.length <= 30 ? children : children.slice(0, 30)).map((child, cIdx) => {
                const childKey = `child-cmd-${child.PID}-${cIdx}`

                return (
                  <div key={child.PID} className="relative group/child">
                    <div className="absolute -left-6 top-4 w-4 h-0.5 bg-purple-500/60" />
                    <div className="absolute -left-6.5 top-3.5 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-500" />

                    {/* Clickable Child Card */}
                    <div
                      onClick={() => inspectPid(child.PID)}
                      className="p-3.5 rounded-2xl bg-neutral-900/40 border border-white/[0.05] hover:bg-neutral-900/90 hover:border-purple-500/50 transition-all text-xs space-y-2 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-purple-950/40 group/card backdrop-blur-md"
                      title="点击聚焦并深层分析此子进程"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-sm">
                            CHILD #{cIdx + 1}
                          </span>
                          <span className="font-bold text-neutral-100 font-mono group-hover/card:text-purple-300 transition">
                            {child.Command}
                          </span>
                          <span className="text-neutral-500 font-mono text-[11px]">
                            PID: <strong className="text-neutral-300">{child.PID}</strong>
                          </span>
                          <span className="text-[10px] text-purple-400 opacity-0 group-hover/card:opacity-100 transition flex items-center gap-0.5 font-medium">
                            <ExternalLink className="w-2.5 h-2.5" /> 切换聚焦
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          {child.MemoryPercent !== undefined && child.MemoryPercent > 0 && (
                            <span className="text-purple-300 font-semibold">
                              {child.MemoryPercent.toFixed(1)}% Mem
                            </span>
                          )}
                          {child.CPUPercent !== undefined && child.CPUPercent > 0 && (
                            <span className="text-amber-400 font-semibold">
                              {child.CPUPercent.toFixed(1)}% CPU
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Child Command Line */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg bg-black/60 border border-white/[0.05] font-mono text-[10px] text-neutral-300 flex items-center justify-between gap-2 shadow-inner"
                      >
                        <span className="truncate select-text">{child.Cmdline || child.Command}</span>
                        <button
                          onClick={() => copyWithFeedback(childKey, child.Cmdline || child.Command)}
                          title="复制子进程命令"
                          className="p-0.5 text-neutral-500 hover:text-white transition shrink-0 cursor-pointer active:scale-90"
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
                    className="px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold transition shadow-lg shadow-purple-950/40 cursor-pointer active:scale-95"
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
