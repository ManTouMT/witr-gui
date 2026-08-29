import { WorkspaceInfo } from '@shared/types'

export const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 MB'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

export const isCodeProject = (ws?: WorkspaceInfo, dir?: string): boolean => {
  if (ws !== undefined) return ws.isProject
  if (!dir || dir === 'unknown' || dir === '/' || dir === '/Applications') return false
  if (dir.includes('/Library/Containers/') || dir.includes('/Library/Application Support/')) return false
  return true
}

export const isValidProjectDir = (dir?: string): boolean => {
  if (!dir || dir === 'unknown' || dir === '/' || dir === '/Applications') return false
  if (dir.includes('/Library/Containers/') || dir.includes('/Library/Application Support/')) return false
  return true
}
