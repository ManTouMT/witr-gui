import { execFile } from 'child_process'
import { promisify } from 'util'
import { PortInfo } from '../../shared/types'
import { isProtectedProcess } from './safeguards'

const execFileAsync = promisify(execFile)

export class PortSniffer {
  private cache: PortInfo[] = []
  private lastScanTime = 0
  private readonly CACHE_TTL_MS = 2000

  async scanActivePorts(force = false): Promise<PortInfo[]> {
    const now = Date.now()
    if (!force && now - this.lastScanTime < this.CACHE_TTL_MS && this.cache.length > 0) {
      return this.cache
    }

    try {
      // lsof -iTCP -sTCP:LISTEN -P -n
      const { stdout } = await execFileAsync('lsof', ['-iTCP', '-sTCP:LISTEN', '-P', '-n'], {
        timeout: 4000,
        maxBuffer: 10 * 1024 * 1024
      })

      const lines = stdout.split('\n')
      const portMap = new Map<string, PortInfo>()

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        // Format: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
        const parts = line.split(/\s+/)
        if (parts.length < 9) continue

        const command = parts[0]
        const pid = parseInt(parts[1], 10)
        const user = parts[2]
        const nameField = parts[8] || ''

        // Parse :<PORT> from address (e.g., *:3000, 127.0.0.1:8080, [::1]:5173)
        const portMatch = nameField.match(/:(\d+)$/)
        if (!portMatch) continue

        const port = parseInt(portMatch[1], 10)
        const address = nameField.substring(0, nameField.lastIndexOf(':')) || '*'

        const key = `${port}-${pid}`
        if (!portMap.has(key)) {
          portMap.set(key, {
            port,
            pid,
            processName: command,
            protocol: 'TCP',
            address,
            user,
            state: 'LISTEN',
            isSystem: isProtectedProcess(pid, command)
          })
        }
      }

      const results = Array.from(portMap.values()).sort((a, b) => {
        // Put common dev ports first (3000, 5173, 8080, 8000, 4000)
        const isDevA = [3000, 5173, 8080, 8000, 4000, 4200, 8081, 9000].includes(a.port)
        const isDevB = [3000, 5173, 8080, 8000, 4000, 4200, 8081, 9000].includes(b.port)
        if (isDevA && !isDevB) return -1
        if (!isDevA && isDevB) return 1
        return a.port - b.port
      })

      this.cache = results
      this.lastScanTime = now
      return results
    } catch (error: any) {
      console.error('[PortSniffer] Error scanning ports:', error)
      return this.cache
    }
  }
}

export const portSniffer = new PortSniffer()
