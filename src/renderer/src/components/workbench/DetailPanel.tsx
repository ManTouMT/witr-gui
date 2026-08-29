import React, { useState } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { isCodeProject } from '../../utils/formatters'
import { DetailOverviewTab } from './detail/DetailOverviewTab'
import { DetailEnvTab } from './detail/DetailEnvTab'
import { DetailSocketsTab } from './detail/DetailSocketsTab'
import { DetailRawJsonTab } from './detail/DetailRawJsonTab'
import {
  Info,
  Key,
  Network,
  Code,
  FolderOpen,
  PowerOff,
  ShieldAlert
} from 'lucide-react'

export const DetailPanel: React.FC = () => {
  const {
    witrResult,
    selectedPort,
    selectedProcess,
    appMode,
    fetchPorts,
    fetchProcesses,
    openPath,
    showToast
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'overview' | 'env' | 'sockets' | 'json'>('overview')

  const processInfo = witrResult?.Process
  const isSystemProcess = selectedPort?.isSystem || selectedProcess?.isSystem

  const handleKill = async (force: boolean) => {
    const pid = processInfo?.PID || selectedPort?.pid || selectedProcess?.pid
    const procName = processInfo?.Command || selectedPort?.processName || selectedProcess?.command
    if (!pid) return

    try {
      const res = await window.api.killProcess({ pid, force, actionType: 'process' }, procName)
      if (res.success) {
        showToast(`已${force ? '强制终止' : '释放'} ${procName} (PID: ${pid})`, 'success')
        if (appMode === 'ports') fetchPorts(true)
        else fetchProcesses(true)
      } else {
        showToast(`终止失败: ${res.message}`, 'error')
      }
    } catch (err: any) {
      showToast(`操作异常: ${err?.message || err}`, 'error')
    }
  }

  const envCount = Object.keys(processInfo?.Env || {}).length
  const socketCount = processInfo?.Sockets?.length || 0

  return (
    <div className="h-full flex flex-col min-h-0 select-none">
      {/* Detail Panel Subtab Toolbar */}
      <div className="h-10 border-b border-white/[0.06] px-4 flex items-center justify-between shrink-0 bg-neutral-950/60 backdrop-blur-xl">
        {/* Left: Linear-style Capsule Subtabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-95 ${
              activeTab === 'overview'
                ? 'bg-neutral-800 text-white shadow-sm border border-white/[0.08]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>进程概览</span>
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-95 ${
              activeTab === 'env'
                ? 'bg-neutral-800 text-white shadow-sm border border-white/[0.08]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>环境变量</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-neutral-400 font-mono">
              {envCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sockets')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-95 ${
              activeTab === 'sockets'
                ? 'bg-neutral-800 text-white shadow-sm border border-white/[0.08]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <span>网络连接</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-neutral-400 font-mono">
              {socketCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-95 ${
              activeTab === 'json'
                ? 'bg-neutral-800 text-white shadow-sm border border-white/[0.08]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span>原始 JSON</span>
          </button>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {processInfo?.WorkingDir && processInfo.WorkingDir !== 'unknown' && (
            isCodeProject(processInfo.Workspace, processInfo.WorkingDir) ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openPath(processInfo.WorkingDir!, 'vscode')}
                  className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 text-xs font-medium transition cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>VS Code</span>
                </button>
                <button
                  onClick={() => openPath(processInfo.WorkingDir!, 'finder')}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 text-xs font-medium border border-white/[0.04] transition cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Finder</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => openPath(processInfo.WorkingDir!, 'finder')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 hover:text-white text-xs font-medium border border-white/[0.04] transition cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{processInfo.Workspace?.projectType === 'app_sandbox' ? '定位沙盒' : 'Finder'}</span>
              </button>
            )
          )}

          {/* Kill / Release Actions */}
          {isSystemProcess ? (
            <span
              className="px-3 py-1 rounded-lg bg-amber-950/50 text-amber-400 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5"
              title="受保护的核心系统进程，已禁用强制终止"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>受保护系统进程</span>
            </span>
          ) : (
            <button
              onClick={() => handleKill(false)}
              className="px-3 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-xs font-medium transition shadow-md shadow-rose-950/40 cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>释放端口 / 终止进程</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents View */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-[#09090c]/60">
        {activeTab === 'overview' && <DetailOverviewTab />}
        {activeTab === 'env' && <DetailEnvTab />}
        {activeTab === 'sockets' && <DetailSocketsTab />}
        {activeTab === 'json' && <DetailRawJsonTab />}
      </div>
    </div>
  )
}
