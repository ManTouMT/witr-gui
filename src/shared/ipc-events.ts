export const IPC_CHANNELS = {
  // Ports & Scanning
  GET_ACTIVE_PORTS: 'ports:get-active',
  SCAN_PORTS: 'ports:scan',

  // Full System Processes
  GET_ALL_PROCESSES: 'processes:get-all',
  GET_PROCESS_CHILDREN: 'processes:get-children',

  // Deep Witr Analysis
  INSPECT_PORT: 'witr:inspect-port',
  INSPECT_PID: 'witr:inspect-pid',
  INSPECT_CONTAINER: 'witr:inspect-container',

  // Actions & Execution
  KILL_PROCESS: 'process:kill',
  OPEN_PATH: 'system:open-path',
  COPY_TEXT: 'system:copy-text',

  // Window & Tray Management
  TOGGLE_WORKBENCH: 'window:toggle-workbench',
  SHOW_WORKBENCH: 'window:show-workbench',
  HIDE_TRAY: 'window:hide-tray',
  GET_WINDOW_MODE: 'window:get-mode',
  RESIZE_TRAY: 'window:resize-tray'
} as const
