import { execFile } from 'child_process'
import { promisify } from 'util'
import { ProcessInfo, ProcessItem } from '../../shared/types'
import { isProtectedProcess } from './safeguards'

const execFileAsync = promisify(execFile)

export class ProcessSniffer {
  private cachedProcesses: ProcessItem[] = []
  private childIndex = new Map<number, ProcessItem[]>()
  private lastScanTime = 0
  private readonly CACHE_TTL_MS = 2000

  async scanAllProcesses(force = false): Promise<ProcessItem[]> {
    const now = Date.now()
    if (!force && now - this.lastScanTime < this.CACHE_TTL_MS && this.cachedProcesses.length > 0) {
      return this.cachedProcesses
    }

    try {
      // ps -axo pid,ppid,user,%cpu,%mem,start,command
      const { stdout } = await execFileAsync('ps', ['-axo', 'pid,ppid,user,%cpu,%mem,start,command'], {
        timeout: 5000,
        maxBuffer: 20 * 1024 * 1024
      })

      const lines = stdout.split('\n')
      const list: ProcessItem[] = []
      const childrenMap = new Map<number, ProcessItem[]>()

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        // Format: PID PPID USER %CPU %MEM START COMMAND...
        const parts = line.split(/\s+/)
        if (parts.length < 7) continue

        const pid = parseInt(parts[0], 10)
        const ppid = parseInt(parts[1], 10)
        const user = parts[2]
        const cpuPercent = parseFloat(parts[3]) || 0
        const memPercent = parseFloat(parts[4]) || 0
        const startedAt = parts[5]
        const cmdline = parts.slice(6).join(' ')

        // Derive friendly command name (e.g. /Applications/QQ.app/Contents/MacOS/QQ -> QQ)
        const execPath = parts[6]
        const command = execPath.split('/').pop() || execPath

        const item: ProcessItem = {
          pid,
          ppid,
          user,
          cpuPercent,
          memPercent,
          command,
          cmdline,
          startedAt,
          isSystem: isProtectedProcess(pid, command)
        }

        list.push(item)

        // Add to child index
        if (!childrenMap.has(ppid)) {
          childrenMap.set(ppid, [])
        }
        childrenMap.get(ppid)!.push(item)
      }

      this.cachedProcesses = list
      this.childIndex = childrenMap
      this.lastScanTime = now
      return list
    } catch (err) {
      console.error('[ProcessSniffer] Failed scanning processes:', err)
      return this.cachedProcesses
    }
  }

  getChildrenOfPid(pid: number): ProcessInfo[] {
    const directChildren = this.childIndex.get(pid) || []
    return directChildren.map((item) => ({
      PID: item.pid,
      PPID: item.ppid,
      Command: item.command,
      Cmdline: item.cmdline,
      User: item.user,
      CPUPercent: item.cpuPercent,
      MemoryPercent: item.memPercent,
      StartedAt: item.startedAt
    }))
  }
}

export const processSniffer = new ProcessSniffer()
