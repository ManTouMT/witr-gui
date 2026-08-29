// Critical system processes on macOS that should never be terminated by a user tool
export const PROTECTED_SYSTEM_PROCESSES = new Set([
  'launchd',
  'kernel_task',
  'WindowServer',
  'loginwindow',
  'mdnsresponder',
  'syslogd',
  'securityd',
  'diskarbitrationd',
  'opendirectoryd',
  'trustd',
  'hidd',
  'coreauthd',
  'powerd',
  'cfprefsd',
  'distnoted',
  'containermanagerd',
  'systemsoundserverd',
  'coreservicesd',
  'fseventsd',
  'logd',
  'airportd',
  'bluetoothd',
  'controlcenter',
  'dock',
  'finder'
])

export function isProtectedProcess(pid: number, processName: string): boolean {
  if (pid <= 1) return true
  const normalized = processName.trim().toLowerCase()
  return PROTECTED_SYSTEM_PROCESSES.has(normalized)
}
