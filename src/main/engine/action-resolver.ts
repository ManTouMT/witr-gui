import { execFile } from 'child_process'
import { promisify } from 'util'
import { ActionResult, KillRequest, OpenDirectoryRequest } from '../../shared/types'
import { isProtectedProcess } from './safeguards'

let electronShell: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  electronShell = require('electron')?.shell
} catch {
  // Running in pure Node.js CLI mode
}

const execFileAsync = promisify(execFile)

export class ActionResolver {
  async killProcess(req: KillRequest, processName = ''): Promise<ActionResult> {
    const { pid, force = false, actionType = 'process', targetId } = req

    if (isProtectedProcess(pid, processName)) {
      return {
        success: false,
        message: `拒绝操作：PID ${pid} (${processName}) 为关键系统进程，受白名单保护。`,
        error: 'PROTECTED_SYSTEM_PROCESS'
      }
    }

    try {
      if (actionType === 'docker' && targetId) {
        await execFileAsync('docker', ['stop', targetId])
        return {
          success: true,
          message: `已成功停止 Docker 容器 [${targetId}]`
        }
      }

      if (actionType === 'pm2' && targetId) {
        await execFileAsync('pm2', ['stop', targetId])
        return {
          success: true,
          message: `已成功通过 PM2 停止应用 [${targetId}]`
        }
      }

      // Default process kill
      const signal = force ? 'SIGKILL' : 'SIGTERM'
      try {
        process.kill(pid, signal)
      } catch (err: any) {
        if (err.code === 'ESRCH') {
          return {
            success: true,
            message: `进程 ${pid} 已经退出。`
          }
        }
        // If SIGTERM permission denied or failed, try kill CLI
        if (force) {
          await execFileAsync('kill', ['-9', String(pid)])
        } else {
          await execFileAsync('kill', [String(pid)])
        }
      }

      return {
        success: true,
        message: `已成功发送 ${signal} 终止进程 PID ${pid}`
      }
    } catch (error: any) {
      console.error(`[ActionResolver] Failed to kill pid ${pid}:`, error)
      return {
        success: false,
        message: `终止进程失败: ${error?.message || error}`,
        error: error?.code || 'KILL_FAILED'
      }
    }
  }

  async openPath(req: OpenDirectoryRequest): Promise<ActionResult> {
    const { path: targetPath, app = 'finder' } = req
    if (!targetPath || targetPath === 'unknown') {
      return {
        success: false,
        message: '无效的工作目录路径',
        error: 'INVALID_PATH'
      }
    }

    try {
      if (app === 'finder') {
        if (electronShell && electronShell.openPath) {
          const opened = await electronShell.openPath(targetPath)
          if (opened) {
            return { success: false, message: opened, error: opened }
          }
        } else {
          await execFileAsync('open', [targetPath])
        }
        return { success: true, message: `已在 Finder 中打开: ${targetPath}` }
      }

      if (app === 'vscode') {
        await execFileAsync('code', [targetPath])
        return { success: true, message: `已在 VS Code 中打开: ${targetPath}` }
      }

      if (app === 'cursor') {
        await execFileAsync('cursor', [targetPath])
        return { success: true, message: `已在 Cursor 中打开: ${targetPath}` }
      }

      if (app === 'terminal') {
        await execFileAsync('open', ['-a', 'Terminal', targetPath])
        return { success: true, message: `已在终端中打开: ${targetPath}` }
      }

      if (electronShell && electronShell.openPath) {
        await electronShell.openPath(targetPath)
      } else {
        await execFileAsync('open', [targetPath])
      }
      return { success: true, message: `已打开: ${targetPath}` }
    } catch (error: any) {
      console.error(`[ActionResolver] Failed to open path ${targetPath} with ${app}:`, error)
      return {
        success: false,
        message: `打开失败（可能未安装对应命令行指令）: ${error?.message || error}`,
        error: error?.code || 'OPEN_FAILED'
      }
    }
  }
}

export const actionResolver = new ActionResolver()
