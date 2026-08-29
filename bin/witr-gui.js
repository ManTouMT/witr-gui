#!/usr/bin/env node

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec, execFile } from 'child_process'
import { promisify } from 'util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const execFileAsync = promisify(execFile)

// Common MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

// 1. Lightweight Server Helpers
const parseJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1e6) {
        req.destroy()
        reject(new Error('Payload too large'))
      }
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (err) {
        reject(err)
      }
    })
  })
}

const sendJson = (res, data, status = 200) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  })
  res.end(JSON.stringify(data))
}

const sendError = (res, message, status = 500) => {
  sendJson(res, { error: true, message }, status)
}

// 2. Binary and Port/Process Resolvers
const resolveWitrBinary = () => {
  const candidates = [
    '/opt/homebrew/bin/witr',
    '/usr/local/bin/witr',
    '/usr/bin/witr',
    path.join(__dirname, '../resources/bin/witr')
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return 'witr'
}

const runWitr = async (args) => {
  const bin = resolveWitrBinary()
  try {
    const { stdout } = await execFileAsync(bin, [...args, '--json'])
    return JSON.parse(stdout)
  } catch (err) {
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout)
      } catch {}
    }
    throw new Error(`witr 执行失败: ${err.message}`)
  }
}

// Port sniffer using lsof & ps
const scanActivePorts = async () => {
  try {
    const { stdout: lsofOut } = await execFileAsync('lsof', [
      '-iTCP',
      '-sTCP:LISTEN',
      '-P',
      '-n',
      '-F',
      'pPcn'
    ])
    const lines = lsofOut.split('\n')
    let currentPid = 0
    let currentCommand = ''
    let currentPort = 0
    const portMap = new Map()

    for (const line of lines) {
      if (!line) continue
      const tag = line[0]
      const val = line.slice(1)
      if (tag === 'p') {
        currentPid = parseInt(val, 10)
      } else if (tag === 'c') {
        currentCommand = val
      } else if (tag === 'n') {
        const parts = val.split(':')
        const portStr = parts[parts.length - 1]
        const port = parseInt(portStr, 10)
        if (!isNaN(port) && currentPid > 0) {
          currentPort = port
          const key = `${currentPid}-${currentPort}`
          if (!portMap.has(key)) {
            portMap.set(key, {
              port: currentPort,
              pid: currentPid,
              command: currentCommand,
              protocol: 'TCP'
            })
          }
        }
      }
    }

    const ports = Array.from(portMap.values())
    if (ports.length === 0) return []

    // Fetch memory, cpu, user for pids
    const pids = Array.from(new Set(ports.map((p) => p.pid)))
    try {
      const { stdout: psOut } = await execFileAsync('ps', [
        '-o',
        'pid,ppid,%cpu,%mem,user,command',
        '-p',
        pids.join(',')
      ])
      const psLines = psOut.trim().split('\n').slice(1)
      const procInfoMap = new Map()

      for (const pl of psLines) {
        const cols = pl.trim().split(/\s+/)
        if (cols.length >= 5) {
          const pid = parseInt(cols[0], 10)
          const ppid = parseInt(cols[1], 10)
          const cpu = parseFloat(cols[2]) || 0
          const memory = parseFloat(cols[3]) || 0
          const user = cols[4]
          const cmd = cols.slice(5).join(' ')
          procInfoMap.set(pid, { ppid, cpu, memory, user, cmd })
        }
      }

      return ports.map((p) => {
        const info = procInfoMap.get(p.pid)
        return {
          ...p,
          ppid: info ? info.ppid : 0,
          cpu: info ? info.cpu : 0,
          memory: info ? info.memory : 0,
          user: info ? info.user : '',
          fullCommand: info ? info.cmd : p.command
        }
      })
    } catch {
      return ports
    }
  } catch (err) {
    console.error('scanActivePorts error:', err)
    return []
  }
}

// Process sniffer using ps
const scanAllProcesses = async () => {
  try {
    const { stdout } = await execFileAsync('ps', [
      '-eo',
      'pid,ppid,%cpu,%mem,rss,user,comm,command'
    ])
    const lines = stdout.trim().split('\n').slice(1)
    const procs = []

    for (const l of lines) {
      const parts = l.trim().split(/\s+/)
      if (parts.length >= 8) {
        const pid = parseInt(parts[0], 10)
        const ppid = parseInt(parts[1], 10)
        const cpu = parseFloat(parts[2]) || 0
        const mem = parseFloat(parts[3]) || 0
        const rss = parseInt(parts[4], 10) || 0
        const user = parts[5]
        const comm = parts[6]
        const cmd = parts.slice(7).join(' ')

        if (pid > 0) {
          procs.push({
            pid,
            ppid,
            cpu,
            mem,
            rss,
            user,
            name: path.basename(comm),
            command: cmd
          })
        }
      }
    }
    return procs
  } catch (err) {
    console.error('scanAllProcesses error:', err)
    return []
  }
}

// 3. Start HTTP Server
const rendererDir = path.join(__dirname, '../out/renderer')

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const pathname = parsedUrl.pathname

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // --- API Endpoints ---
  if (pathname === '/api/ports') {
    try {
      const ports = await scanActivePorts()
      return sendJson(res, ports)
    } catch (err) {
      return sendError(res, err.message)
    }
  }

  if (pathname === '/api/processes') {
    try {
      const procs = await scanAllProcesses()
      return sendJson(res, procs)
    } catch (err) {
      return sendError(res, err.message)
    }
  }

  if (pathname.startsWith('/api/inspect/port/')) {
    const port = parseInt(pathname.replace('/api/inspect/port/', ''), 10)
    try {
      const data = await runWitr(['--port', String(port)])
      return sendJson(res, data)
    } catch (err) {
      return sendError(res, err.message)
    }
  }

  if (pathname.startsWith('/api/inspect/pid/')) {
    const pid = parseInt(pathname.replace('/api/inspect/pid/', ''), 10)
    try {
      const data = await runWitr(['--pid', String(pid)])
      return sendJson(res, data)
    } catch (err) {
      return sendError(res, err.message)
    }
  }

  if (pathname.startsWith('/api/inspect/container/')) {
    const name = decodeURIComponent(pathname.replace('/api/inspect/container/', ''))
    try {
      const data = await runWitr(['--container', name])
      return sendJson(res, data)
    } catch (err) {
      return sendError(res, err.message)
    }
  }

  if (pathname === '/api/kill' && req.method === 'POST') {
    try {
      const { req: killReq } = await parseJsonBody(req)
      const pid = killReq.pid
      const force = killReq.force
      const signal = force ? 'SIGKILL' : 'SIGTERM'
      try {
        process.kill(pid, signal)
      } catch {
        await execFileAsync('kill', [force ? '-9' : '-15', String(pid)])
      }
      return sendJson(res, { success: true, message: `已成功终止进程 PID ${pid}` })
    } catch (err) {
      return sendError(res, `终止失败: ${err.message}`)
    }
  }

  if (pathname === '/api/open-path' && req.method === 'POST') {
    try {
      const { path: targetPath, app = 'finder' } = await parseJsonBody(req)
      if (app === 'vscode') {
        await execFileAsync('code', [targetPath])
      } else if (app === 'cursor') {
        await execFileAsync('cursor', [targetPath])
      } else {
        await execFileAsync('open', [targetPath])
      }
      return sendJson(res, { success: true, message: `已打开: ${targetPath}` })
    } catch (err) {
      return sendError(res, `打开失败: ${err.message}`)
    }
  }

  // --- Static Files Serving ---
  let filePath = path.join(rendererDir, pathname === '/' ? 'index.html' : pathname)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(rendererDir, 'index.html')
  }

  try {
    const ext = path.extname(filePath)
    const mime = MIME_TYPES[ext] || 'application/octet-stream'
    const content = fs.readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': mime })
    res.end(content)
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 Not Found')
  }
})

const DEFAULT_PORT = process.env.PORT || 4999
server.listen(DEFAULT_PORT, () => {
  const url = `http://localhost:${DEFAULT_PORT}`
  console.log(`\n⚡ Witr GUI Web 控制台已就绪: \x1b[36m${url}\x1b[0m`)
  console.log(`✨ 0 安装、0 磁盘占用，随时按 Ctrl+C 退出。\n`)
  
  if (process.env.NO_OPEN !== '1') {
    exec(`open "${url}"`)
  }
})
