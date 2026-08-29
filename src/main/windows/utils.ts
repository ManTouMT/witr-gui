import { join } from 'path'
import * as fs from 'fs'

export function getPreloadPath(): string {
  const mjsPath = join(__dirname, '../preload/index.mjs')
  if (fs.existsSync(mjsPath)) {
    return mjsPath
  }
  const jsPath = join(__dirname, '../preload/index.js')
  if (fs.existsSync(jsPath)) {
    return jsPath
  }
  const cjsPath = join(__dirname, '../preload/index.cjs')
  if (fs.existsSync(cjsPath)) {
    return cjsPath
  }
  return mjsPath
}
