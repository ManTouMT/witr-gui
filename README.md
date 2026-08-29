# Witr GUI 🖥️⚡

<p align="center">
  <img src="docs/images/hero-banner.svg" alt="Witr GUI Banner" width="100%">
</p>

<p align="center">
  <strong>Visual Causal Process & Port Inspector</strong> — Powered by <a href="https://github.com/pranshuparmar/witr">witr</a> (<em>"Why is this running?"</em>)
</p>

<p align="center">
  <a href="https://github.com/ManTouMT/witr-gui/releases/tag/v0.1.0"><img src="https://img.shields.io/badge/Release-v0.1.0-blue.svg" alt="Release"></a>
  <img src="https://img.shields.io/badge/Platform-macOS%20(Apple%20Silicon%20%7C%20Intel)-black.svg" alt="Platform">
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Electron-34-47848F.svg" alt="Electron">
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg" alt="React 19">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
</p>

<p align="center">
  <a href="README.md"><b>English</b></a> • <a href="README_zh.md"><b>🇨🇳 简体中文</b></a>
</p>

---

`witr-gui` is a modern desktop troubleshooting workbench for macOS and POSIX systems. It transforms cryptic PID lookups and `lsof` commands into an intuitive, visual experience with instant **causal ancestry tracing**, **sub-process hierarchy exploration**, and **safe process resolution**.

---

## 📥 Direct Download & Installation

You **do not need** to build the application from source. Pre-compiled, fully self-contained packages are ready to download:

| Architecture | Installer Format | Direct Download |
| :--- | :--- | :--- |
| 🍏 **Apple Silicon (M1 / M2 / M3 / M4)** | **DMG Installer** | [**`Witr.GUI-0.1.0-arm64.dmg`**](https://github.com/ManTouMT/witr-gui/releases/download/v0.1.0/Witr.GUI-0.1.0-arm64.dmg) |
| 🍏 **Apple Silicon (M1 / M2 / M3 / M4)** | **Portable Zip** | [**`Witr.GUI-0.1.0-arm64-mac.zip`**](https://github.com/ManTouMT/witr-gui/releases/download/v0.1.0/Witr.GUI-0.1.0-arm64-mac.zip) |
| 🖥️ **Intel Mac (x64)** | **DMG Installer** | [**`Witr.GUI-0.1.0.dmg`**](https://github.com/ManTouMT/witr-gui/releases/download/v0.1.0/Witr.GUI-0.1.0.dmg) |
| 🖥️ **Intel Mac (x64)** | **Portable Zip** | [**`Witr.GUI-0.1.0-mac.zip`**](https://github.com/ManTouMT/witr-gui/releases/download/v0.1.0/Witr.GUI-0.1.0-mac.zip) |

> [!NOTE]
> **100% Out-of-the-Box**: `witr-gui` includes a bundled, standalone `witr` binary. You do not need to install Homebrew, Go, or Node.js to use it.
>
> **macOS Gatekeeper Tip**: For open-source builds without Apple Developer ID signing, if macOS shows *"cannot be opened because it is from an unidentified developer"*, simply go to **System Settings $\to$ Privacy & Security** and click **"Open Anyway"** (or right-click the app in Finder and choose **Open**).

---

## ✨ Key Features & Real-World Scenarios

### 1. ⚡ Dual-Mode UX Architecture

<p align="center">
  <img src="docs/images/feature-dual-mode.svg" alt="Dual-Mode UX" width="100%">
</p>

* **MenuBar Popover (`Alt+W`)**:
  - *Scenario*: During daily development, port `5173` or `3000` is blocked by an unknown zombie service. Press `Alt+W` to open a lightweight 1-second popover, search for the port, and click **"Release Port"** instantly without breaking your workflow.
* **Visual Workbench (`Cmd+Shift+W`)**:
  - *Scenario*: Deep diagnostic sessions requiring full inspection of process environments, open network sockets, parent execution chains, and interactive topology graphs.

---

### 2. 🌲 Bidirectional Causal Family Tree

<p align="center">
  <img src="docs/images/feature-family-tree.svg" alt="Bidirectional Family Tree" width="100%">
</p>

* **⬆️ Ancestry Upward Tracing (Who started this?)**:
  - Answers *"Why is this process running?"* by tracing parent execution lineages: `launchd (PID 1) → IDE / Terminal → Target Process`.
* **⬇️ Subprocesses Downward Branching (What did it spawn?)**:
  - Automatically unfolds all child worker, renderer, and helper subprocesses (e.g. Chrome / QQ / Electron multiple helper processes) with per-process CPU%, memory metrics, and CLI arguments.

---

### 3. 🕸️ Interactive React Flow Topology Graph

<p align="center">
  <img src="docs/images/feature-topology.svg" alt="React Flow Topology" width="100%">
</p>

* **Interactive Visual Network**:
  - Pan, zoom, and inspect process hierarchies and multi-container topologies on a high-performance vector canvas powered by `@xyflow/react`.
* *Scenario*: Visualizing complex microservices clusters, Vite compiler daemon workers, or multi-process Electron applications.

---

### 4. 🛡️ Intelligent Safeguards & 1-Click IDE Jump

<p align="center">
  <img src="docs/images/feature-actions.svg" alt="Safeguards & IDE Jump" width="100%">
</p>

* **System Whitelist Protection**:
  - Prevents accidental termination of macOS core system daemons (`launchd`, `WindowServer`, `kernel_task`, etc.).
* **Context-Aware Termination**:
  - Graceful `SIGTERM` with fallback to force `SIGKILL (-9)`, automatic `docker stop <id>`, and `pm2 stop <name>`.
* **1-Click IDE Navigation**:
  - Jump directly to the source code repository in **VS Code**, **Cursor**, or **Finder** with smart project root detection.

---

## 🛠️ Developer Guide (Local Development & Build)

If you are a developer and want to contribute or build `witr-gui` locally from source:

### Prerequisites
- Node.js 18+
- pnpm 9+
- macOS (recommended for native vibrancy tests)

### Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/ManTouMT/witr-gui.git
cd witr-gui

# 2. Install dependencies
pnpm install

# 3. Start local development server (with React 19 Fast HMR)
pnpm dev

# 4. Compile and package native macOS DMG & Zip binaries
pnpm build:mac
```

---

## 🏛️ Project Architecture

```text
src/
├── main/             # Electron Main Process
│   ├── engine/       # Port Sniffer (lsof), Process Sniffer (ps), Witr Bridge, Safeguards
│   └── windows/      # MenuBar Popover & Main Workbench Window Managers
├── preload/          # ContextBridge Type-Safe IPC APIs
├── shared/           # Cross-Process Data Types & IPC Channel Constants
└── renderer/         # React 19 UI
    ├── components/   # TrayView, WorkbenchView, CausalTree, TopologyGraph, DetailPanel
    └── stores/       # Zustand 5 Reactive State Store
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
