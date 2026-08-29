export type AppMode = 'ports' | 'processes'
export type ProcessSortBy = 'cpu' | 'mem' | 'pid' | 'name'

export interface PortInfo {
  port: number
  pid: number
  processName: string
  protocol: 'TCP' | 'UDP'
  address: string
  user: string
  state?: string
  isSystem?: boolean
}

export interface ProcessItem {
  pid: number
  ppid: number
  user: string
  cpuPercent: number
  memPercent: number
  command: string
  cmdline: string
  startedAt?: string
  isSystem?: boolean
}

export interface SocketItem {
  Inode?: string
  Port: number
  Address: string
  State: string
  Protocol: string
}

export interface ProcessMemory {
  VMS?: number
  RSS?: number
  VMSMB?: number
  RSSMB?: number
  Shared?: number
  Text?: number
  Lib?: number
  Data?: number
  Dirty?: number
}

export interface ProcessIO {
  ReadBytes?: number
  WriteBytes?: number
  ReadOps?: number
  WriteOps?: number
}

export interface ProcessInfo {
  PID: number
  PPID: number
  Command: string
  Cmdline: string
  Exe?: string
  StartedAt?: string
  User?: string
  CPUPercent?: number
  MemoryRSS?: number
  MemoryPercent?: number
  WorkingDir?: string
  GitRepo?: string
  GitBranch?: string
  Container?: string
  Service?: string
  Sockets?: SocketItem[] | null
  Health?: string
  Forked?: string
  Env?: string[] | null
  ExeDeleted?: boolean
  Memory?: ProcessMemory
  IO?: ProcessIO
  Workspace?: WorkspaceInfo
}

export interface WorkspaceInfo {
  isProject: boolean
  projectType?: 'node' | 'next' | 'vite' | 'go' | 'rust' | 'python' | 'java' | 'git' | 'app_sandbox' | 'system' | 'unknown'
  projectLabel?: string
  frameworkName?: string
  hasGit?: boolean
}

export interface WitrSource {
  Type: string
  Name: string
  Description?: string
  UnitFile?: string
  Details?: Record<string, any>
}

export interface WitrSocketInfo {
  Port: number
  State: string
  LocalAddr: string
  RemoteAddr: string
  Explanation: string
  Workaround?: string
}

export interface WitrResult {
  Target?: {
    Type: string
    Value: string
  }
  ResolvedTarget?: string
  Process?: ProcessInfo
  RestartCount?: number
  Ancestry?: ProcessInfo[]
  Children?: ProcessInfo[] // Subprocesses / Helpers spawned by target process
  Source?: WitrSource
  Warnings?: string[] | null
  SocketInfo?: WitrSocketInfo | null
  ResourceContext?: any
  FileContext?: any
  rawOutput?: string
}

export interface KillRequest {
  pid: number
  force?: boolean
  actionType?: 'process' | 'docker' | 'pm2'
  targetId?: string
}

export interface ActionResult {
  success: boolean
  message: string
  error?: string
}

export interface OpenDirectoryRequest {
  path: string
  app?: 'vscode' | 'cursor' | 'finder' | 'terminal'
}

export type WindowMode = 'tray' | 'workbench'
