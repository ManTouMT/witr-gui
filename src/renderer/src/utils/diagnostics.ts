// Professional Chinese Translator for Witr Process Security & Heuristic Warnings
export const translateWarning = (warning: string): string => {
  const lower = warning.toLowerCase().trim()
  if (lower.includes('high memory') || lower.includes('>1gb')) {
    return '内存占用较高：物理常驻内存 (RSS) 已超过 1 GB'
  }
  if (lower.includes('public interface') || lower.includes('listening on a public')) {
    return '监听公网接口：服务绑定在 0.0.0.0 或公网 IP，可能存在局域网/外部网络暴露风险'
  }
  if (lower.includes('suspicious working directory') || lower.includes('directory: /')) {
    return '根目录运行：当前进程工作目录直接位于系统根目录 (/)'
  }
  if (lower.includes('service name and process name do not match')) {
    return '服务命名差异：守护服务名称与进程二进制名不一致'
  }
  if (lower.includes('privileged port') || lower.includes('<1024')) {
    return '特权端口监听：该进程占用了小于 1024 的系统特权端口'
  }
  if (lower.includes('deleted from disk') || lower.includes('deleted')) {
    return '文件异常：该进程的二进制执行文件已被从磁盘中删除'
  }
  if (lower.includes('high cpu')) {
    return 'CPU 负载过高：该进程当前占用较多 CPU 计算资源'
  }
  return warning
}
