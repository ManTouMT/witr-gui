import React, { useState } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import {
  Code,
  FolderOpen,
  Terminal,
  PowerOff,
  Search,
  Copy,
  Info,
  Server,
  Network,
  FileCode,
  ShieldAlert,
  Clock,
  GitBranch
} from 'lucide-react'

export const DetailPanel: React.FC = () => {
  const {
    witrResult,
    selectedPort,
    detailSubTab,
    setDetailSubTab,
    openPath,
    copyText,
    killCurrentProcess
  } = useAppStore()

  const [envFilter, setEnvFilter] = useState('')
  const [confirmKill, setConfirmKill] = useState(false)
  const [killing, setKilling] = useState(false)

  const processInfo = witrResult?.Process
  const isProtected = selectedPort?.isSystem
  const workingDir = processInfo?.WorkingDir || ''

  const isProjectDir = workingDir && workingDir !== 'unknown' && workingDir !== '/' && workingDir !== '/Applications'

  const handleKill = async (force: boolean) => {
    setKilling(true)
    await killCurrentProcess(force)
    setKilling(false)
    setConfirmKill(false)
  }

  const envList = processInfo?.Env || []
  const filteredEnv = envList.filter((e) => {
    if (!envFilter) return true
    return e.toLowerCase().includes(envFilter.toLowerCase())
  })

  return (
    <div className="h-72 border-t border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md flex flex-col">
      {/* Top Action & Sub-Tab Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800/60 bg-neutral-900/40">
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
            <span>环境变量 ({envList.length})</span>
          </button>

          <button
            onClick={() => setDetailSubTab('sockets')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              detailSubTab === 'sockets'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>网络连接 ({processInfo?.Sockets?.length || 0})</span>
          </button>

          <button
            onClick={() => setDetailSubTab('raw')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              detailSubTab === 'raw'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>原始 JSON</span>
          </button>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-2">
          {workingDir && workingDir !== 'unknown' && (
            <div className="flex items-center gap-1 mr-2 border-r border-neutral-800 pr-2">
              {isProjectDir && (
                <>
                  <button
                    onClick={() => openPath(workingDir, 'vscode')}
                    className="px-2.5 py-1 rounded-md bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 text-xs font-medium border border-blue-800/50 flex items-center gap-1 transition"
                    title="在 VS Code 中打开项目根目录"
                  >
                    <Code className="w-3 h-3" />
                    <span>VS Code</span>
                  </button>
                  <button
                    onClick={() => openPath(workingDir, 'cursor')}
                    className="px-2.5 py-1 rounded-md bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 text-xs font-medium border border-purple-800/50 flex items-center gap-1 transition"
                    title="在 Cursor 中打开项目根目录"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>Cursor</span>
                  </button>
                </>
              )}
              <button
                onClick={() => openPath(workingDir, 'finder')}
                className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1 transition"
                title="在 Finder 中定位"
              >
                <FolderOpen className="w-3 h-3" />
                <span>Finder</span>
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
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold text-xs transition"
              >
                优雅退出 (SIGTERM)
              </button>
              <button
                disabled={killing}
                onClick={() => handleKill(true)}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition"
              >
                强制杀死 (-9)
              </button>
              <button
                onClick={() => setConfirmKill(false)}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmKill(true)}
              className="px-3 py-1 rounded-md bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>释放端口 / 终止进程</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4">
        {detailSubTab === 'overview' && (
          <div className="grid grid-cols-3 gap-4 text-xs">
            {/* Meta Grid Card 1 */}
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                运行生命周期
              </span>
              <div className="space-y-1 text-neutral-400 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">启动时间:</span>
                  <span className="text-neutral-200">
                    {processInfo?.StartedAt ? new Date(processInfo.StartedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">运行用户:</span>
                  <span className="text-neutral-200">{processInfo?.User || selectedPort?.user || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">重启计数:</span>
                  <span className="text-neutral-200">{witrResult?.RestartCount ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Meta Grid Card 2 */}
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                守护源与服务
              </span>
              <div className="space-y-1 text-neutral-400 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">来源类型:</span>
                  <span className="text-purple-300 font-semibold">{witrResult?.Source?.Type || 'direct process'}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-neutral-500 shrink-0">服务名:</span>
                  <span
                    className="text-neutral-200 truncate max-w-[170px] select-text font-mono text-[10px]"
                    title={witrResult?.Source?.Name || 'N/A'}
                  >
                    {witrResult?.Source?.Name || 'N/A'}
                  </span>
                </div>
                {processInfo?.Container && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Docker 容器:</span>
                    <span className="text-cyan-400 font-bold">{processInfo.Container}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Meta Grid Card 3 */}
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                代码仓库与路径
              </span>
              <div className="space-y-1 text-neutral-400 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Git 分支:</span>
                  <span className="text-emerald-400">{processInfo?.GitBranch || '无'}</span>
                </div>
                <div className="truncate">
                  <span className="text-neutral-500 block mb-0.5">工作目录:</span>
                  <span className="text-neutral-300 truncate block select-text font-mono text-[10px]" title={workingDir}>
                    {workingDir || 'unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {detailSubTab === 'env' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="relative flex items-center w-72">
                <Search className="w-3 h-3 absolute left-2.5 text-neutral-500" />
                <input
                  type="text"
                  value={envFilter}
                  onChange={(e) => setEnvFilter(e.target.value)}
                  placeholder="搜索环境变量..."
                  className="w-full pl-7 pr-2 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                匹配项: {filteredEnv.length} / {envList.length}
              </span>
            </div>

            <div className="border border-neutral-800 rounded-lg overflow-hidden max-h-44 overflow-y-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800 sticky top-0">
                  <tr>
                    <th className="p-2 w-1/3">Variable (Key)</th>
                    <th className="p-2">Value</th>
                    <th className="p-2 w-12 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {filteredEnv.map((line, idx) => {
                    const eqIndex = line.indexOf('=')
                    const key = eqIndex !== -1 ? line.substring(0, eqIndex) : line
                    const val = eqIndex !== -1 ? line.substring(eqIndex + 1) : ''

                    return (
                      <tr key={idx} className="hover:bg-neutral-900/50">
                        <td className="p-2 text-blue-300 font-semibold select-text">{key}</td>
                        <td className="p-2 text-neutral-300 select-text break-all">{val}</td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() => copyText(line)}
                            title="复制"
                            className="p-1 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {detailSubTab === 'sockets' && (
          <div className="border border-neutral-800 rounded-lg overflow-hidden max-h-48 overflow-y-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800 sticky top-0">
                <tr>
                  <th className="p-2">端口</th>
                  <th className="p-2">协议</th>
                  <th className="p-2">状态</th>
                  <th className="p-2">绑定地址</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {(processInfo?.Sockets || []).map((s, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/50">
                    <td className="p-2 font-bold text-blue-400">:{s.Port}</td>
                    <td className="p-2 text-neutral-300">{s.Protocol}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          s.State === 'LISTEN'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {s.State}
                      </span>
                    </td>
                    <td className="p-2 text-neutral-400">{s.Address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {detailSubTab === 'raw' && (
          <div className="relative">
            <button
              onClick={() => copyText(JSON.stringify(witrResult, null, 2))}
              className="absolute top-2 right-2 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-1 z-10"
            >
              <Copy className="w-3 h-3" />
              复制 JSON
            </button>
            <pre className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-lg text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-48 select-text">
              {JSON.stringify(witrResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
