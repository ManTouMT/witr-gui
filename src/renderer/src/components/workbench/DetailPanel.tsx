import React, { useState } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { isCodeProject } from '../../utils/formatters'
import { DetailOverviewTab } from './detail/DetailOverviewTab'
import { DetailEnvTab } from './detail/DetailEnvTab'
import { DetailSocketsTab } from './detail/DetailSocketsTab'
import { DetailRawJsonTab } from './detail/DetailRawJsonTab'
import {
  Code,
  FolderOpen,
  PowerOff,
  Info,
  Network,
  FileCode,
  ShieldAlert
} from 'lucide-react'

export const DetailPanel: React.FC = () => {
  const {
    witrResult,
    selectedPort,
    selectedProcess,
    detailSubTab,
    setDetailSubTab,
    openPath,
    killCurrentProcess
  } = useAppStore()

  const [confirmKill, setConfirmKill] = useState(false)
  const [killing, setKilling] = useState(false)

  const processInfo = witrResult?.Process
  const isProtected = selectedPort?.isSystem || selectedProcess?.isSystem
  const workingDir = processInfo?.WorkingDir || ''
  const isProjectDir = isCodeProject(processInfo?.Workspace, workingDir)
  const isSandbox = processInfo?.Workspace?.projectType === 'app_sandbox' || workingDir.includes('/Library/Containers/')

  const handleKill = async (force: boolean) => {
    setKilling(true)
    await killCurrentProcess(force)
    setKilling(false)
    setConfirmKill(false)
  }

  const envCount = processInfo?.Env?.length || 0
  const socketCount = processInfo?.Sockets?.length || 0

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-950/90 backdrop-blur-md">
      {/* Top Action & Sub-Tab Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800/60 bg-neutral-900/40 shrink-0">
        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDetailSubTab('overview')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              detailSubTab === 'overview'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>进程概览</span>
          </button>

          <button
            onClick={() => setDetailSubTab('env')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              detailSubTab === 'env'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>环境变量 ({envCount})</span>
          </button>

          <button
            onClick={() => setDetailSubTab('sockets')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              detailSubTab === 'sockets'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-blue-400" />
            <span>网络连接 ({socketCount})</span>
          </button>

          <button
            onClick={() => setDetailSubTab('raw')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              detailSubTab === 'raw'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-sky-400" />
            <span>原始 JSON</span>
          </button>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-2">
          {workingDir && workingDir !== 'unknown' && (
            <div className="flex items-center gap-1 mr-2 border-r border-neutral-800 pr-2">
              {isProjectDir ? (
                <button
                  onClick={() => openPath(workingDir, 'vscode')}
                  className="px-2.5 py-1 rounded-md bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 text-xs font-medium border border-blue-800/50 flex items-center gap-1 transition cursor-pointer"
                  title="在 VS Code 中打开项目根目录"
                >
                  <Code className="w-3 h-3" />
                  <span>VS Code</span>
                </button>
              ) : null}
              <button
                onClick={() => openPath(workingDir, 'finder')}
                className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                title={isSandbox ? '在访达中查看应用沙盒数据' : '在访达中定位工作目录'}
              >
                <FolderOpen className="w-3 h-3" />
                <span>{isSandbox ? '定位沙盒' : 'Finder'}</span>
              </button>
            </div>
          )}

          {/* Kill Actions */}
          {isProtected ? (
            <span className="text-xs px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              受保护系统进程
            </span>
          ) : confirmKill ? (
            <div className="flex items-center gap-1.5 animate-in fade-in">
              <button
                disabled={killing}
                onClick={() => handleKill(false)}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold text-xs transition cursor-pointer"
              >
                优雅退出 (SIGTERM)
              </button>
              <button
                disabled={killing}
                onClick={() => handleKill(true)}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                强制杀死 (-9)
              </button>
              <button
                onClick={() => setConfirmKill(false)}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs cursor-pointer"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmKill(true)}
              className="px-3 py-1 rounded-md bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 text-xs font-medium flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>释放端口 / 终止进程</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents: Clean Modular Orchestrator */}
      <div className="flex-1 overflow-y-auto p-4">
        {detailSubTab === 'overview' && <DetailOverviewTab />}
        {detailSubTab === 'env' && <DetailEnvTab />}
        {detailSubTab === 'sockets' && <DetailSocketsTab />}
        {detailSubTab === 'raw' && <DetailRawJsonTab />}
      </div>
    </div>
  )
}
