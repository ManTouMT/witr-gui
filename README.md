# Witr GUI 🖥️⚡

> **Visual Causal Process & Port Inspector** — Powered by [witr](https://github.com/pranshuparmar/witr) (*"Why is this running?"*).

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Electron](https://img.shields.io/badge/Electron-34-47848F)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)
![License](https://img.shields.io/badge/license-MIT-green)

`witr-gui` is a modern desktop efficiency application for macOS and cross-platform environments. It transforms raw process and port troubleshooting into an intuitive, visual experience with instant causal ancestry tracing and safe process resolution.

---

## ✨ Features

- **⚡ Dual-Mode UX (双模架构)**:
  - **MenuBar Popover (`Alt+W`)**: Lightweight system status bar widget for 1-second port inspection, quick search, and instant release.
  - **Visual Workbench (`Cmd+Shift+W`)**: Full-fledged troubleshooting workspace for deep system investigation.
- **🌲 Causal Ancestry Hierarchy (因果阶梯树)**:
  - Answers *"Why is this process running?"* by tracing parent-child execution lineages from `launchd` down to the target process.
- **🕸️ Interactive Topology Graph (React Flow 拓扑图)**:
  - Drag, pan, and zoom through live process dependency trees powered by `@xyflow/react`.
- **🛡️ Intelligent Action & Safeguards**:
  - Built-in macOS system whitelist protection against accidental termination of critical daemons.
  - Context-aware process stopping: `SIGTERM` (graceful), `SIGKILL` (force -9), `docker stop`, and `pm2 stop`.
- **🚀 Project IDE Quick-Jump**:
  - One-click jump to project root in **VS Code**, **Cursor**, or **Finder**.
- **📦 100% Out-of-the-Box**:
  - Bundled with a 6.5MB pre-compiled `witr` single binary, with automatic priority given to system `$PATH` / Homebrew installations.

---

## 🛠️ Tech Stack

- **Host**: Electron 34 + electron-vite
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Visualization**: `@xyflow/react` (React Flow)
- **Icons & UI**: Lucide React + Glassmorphic macOS Design Tokens
- **State Management**: Zustand 5

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Run in development mode (with Hot Module Replacement)
pnpm dev

# 3. Build for production (macOS DMG / App)
pnpm build:mac
```

---

## 📜 Architecture

```text
src/
├── main/             # Electron Main Process (Tray, Multi-Window, IPC)
│   ├── engine/       # Port Sniffer, Witr Bridge, Safeguards, Action Resolver
│   └── windows/      # Tray Popover & Main Workbench Window Managers
├── preload/          # ContextBridge Type-Safe API
├── shared/           # Shared TypeScript Data Schemas & IPC Channels
└── renderer/         # React 19 UI
    ├── components/   # TrayView, WorkbenchView, CausalTree, TopologyGraph, DetailPanel
    └── stores/       # Zustand State Management
```
