import { execFile } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { WitrResult } from '../../shared/types'
import { processSniffer } from './process-sniffer'
import { detectWorkspace } from './workspace-detector'

const execFileAsync = promisify(execFile)

export class WitrBridge {
  private witrBinPath: string | null = null
  private resultCache = new Map<string, { data: WitrResult; timestamp: number }>()
  private readonly CACHE_TTL_MS = 3000

  constructor() {
    this.resolveBinaryPath()
  }

  private resolveBinaryPath(): string {
    if (this.witrBinPath && fs.existsSync(this.witrBinPath)) {
      return this.witrBinPath
    }

    // 1. Check common system paths
    const systemCandidatePaths = [
      '/opt/homebrew/bin/witr',
      '/usr/local/bin/witr',
      '/usr/bin/witr'
    ]

    for (const p of systemCandidatePaths) {
      if (fs.existsSync(p)) {
        this.witrBinPath = p
        return p
      }
    }

    // 2. Check bundled binary in resources
    const isPackaged = app ? app.isPackaged : false
    const bundledCandidate = isPackaged
      ? path.join(process.resourcesPath, 'bin', 'witr')
      : path.join(__dirname, '../../resources/bin/witr')

    if (fs.existsSync(bundledCandidate)) {
      this.witrBinPath = bundledCandidate
      return bundledCandidate
    }

    // Default fallback to PATH lookup
    this.witrBinPath = 'witr'
    return 'witr'
  }

  private getCached(key: string): WitrResult | null {
    const entry = this.resultCache.get(key)
    if (entry && Date.now() - entry.timestamp < this.CACHE_TTL_MS) {
      return entry.data
    }
    return null
  }

  private setCached(key: string, data: WitrResult) {
    this.resultCache.set(key, { data, timestamp: Date.now() })
  }

  async runWitr(args: string[]): Promise<WitrResult> {
    const bin = this.resolveBinaryPath()
    const fullArgs = [...args, '--json']

    try {
      const { stdout } = await execFileAsync(bin, fullArgs, {
        timeout: 6000,
        maxBuffer: 10 * 1024 * 1024
      })

      const parsed: WitrResult = JSON.parse(stdout)
      return parsed
    } catch (error: any) {
      // witr sometimes outputs JSON to stdout even when exit code is 1 (e.g. warnings present)
      if (error && error.stdout) {
        try {
          const parsed: WitrResult = JSON.parse(error.stdout)
          return parsed
        } catch {
          // Ignore JSON parse error
        }
      }

      console.error(`[WitrBridge] Failed executing witr ${args.join(' ')}:`, error?.message || error)
      return {
        rawOutput: error?.stdout || error?.message || 'Failed to inspect process',
        Warnings: [error?.message || 'Process inspection failed']
      }
    }
  }

  async inspectPort(port: number): Promise<WitrResult> {
    const key = `port:${port}`
    const cached = this.getCached(key)
    if (cached) return cached

    // Make sure process sniffer table is up-to-date
    await processSniffer.scanAllProcesses(false)

    const res = await this.runWitr(['--port', String(port)])
    if (res.Process) {
      if (res.Process.PID) {
        res.Children = processSniffer.getChildrenOfPid(res.Process.PID)
      }
      res.Process.Workspace = detectWorkspace(res.Process.WorkingDir)
    }

    this.setCached(key, res)
    return res
  }

  async inspectPid(pid: number): Promise<WitrResult> {
    const key = `pid:${pid}`
    const cached = this.getCached(key)
    if (cached) return cached

    // Make sure process sniffer table is up-to-date
    await processSniffer.scanAllProcesses(false)

    const res = await this.runWitr(['--pid', String(pid)])
    const targetPid = res.Process?.PID || pid
    res.Children = processSniffer.getChildrenOfPid(targetPid)
    if (res.Process) {
      res.Process.Workspace = detectWorkspace(res.Process.WorkingDir)
    }

    this.setCached(key, res)
    return res
  }

  async inspectProcess(name: string): Promise<WitrResult> {
    const key = `name:${name}`
    const cached = this.getCached(key)
    if (cached) return cached

    const res = await this.runWitr([name])
    if (res.Process) {
      if (res.Process.PID) {
        res.Children = processSniffer.getChildrenOfPid(res.Process.PID)
      }
      res.Process.Workspace = detectWorkspace(res.Process.WorkingDir)
    }

    this.setCached(key, res)
    return res
  }
}

export const witrBridge = new WitrBridge()
