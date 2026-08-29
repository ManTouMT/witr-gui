import fs from 'fs'
import path from 'path'
import { WorkspaceInfo } from '@shared/types'

export const detectWorkspace = (dirPath?: string): WorkspaceInfo => {
  if (!dirPath || dirPath === 'unknown' || dirPath === '/' || dirPath === '/Applications') {
    return {
      isProject: false,
      projectType: 'system',
      projectLabel: '系统根目录'
    }
  }

  // Detect macOS Sandboxed App Storage
  if (dirPath.includes('/Library/Containers/') || dirPath.includes('/Library/Application Support/')) {
    return {
      isProject: false,
      projectType: 'app_sandbox',
      projectLabel: '应用沙盒数据'
    }
  }

  try {
    if (!fs.existsSync(dirPath)) {
      return { isProject: false, projectType: 'unknown' }
    }

    const stat = fs.statSync(dirPath)
    if (!stat.isDirectory()) {
      return { isProject: false, projectType: 'unknown' }
    }

    // Check for Git repository
    const hasGit = fs.existsSync(path.join(dirPath, '.git'))

    // 1. Node.js & Web Frameworks
    const packageJsonPath = path.join(dirPath, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkgContent = fs.readFileSync(packageJsonPath, 'utf-8')
        const pkg = JSON.parse(pkgContent)
        const deps = { ...pkg.dependencies, ...pkg.devDependencies }

        if (deps['next']) {
          return { isProject: true, projectType: 'next', projectLabel: 'Next.js 项目', frameworkName: 'Next.js', hasGit }
        }
        if (deps['vite']) {
          return { isProject: true, projectType: 'vite', projectLabel: 'Vite 项目', frameworkName: 'Vite', hasGit }
        }
        if (deps['nuxt']) {
          return { isProject: true, projectType: 'node', projectLabel: 'Nuxt 项目', frameworkName: 'Nuxt', hasGit }
        }
        if (deps['react']) {
          return { isProject: true, projectType: 'node', projectLabel: 'React 项目', frameworkName: 'React', hasGit }
        }
        if (deps['vue']) {
          return { isProject: true, projectType: 'node', projectLabel: 'Vue 项目', frameworkName: 'Vue', hasGit }
        }
        return { isProject: true, projectType: 'node', projectLabel: 'Node.js 项目', frameworkName: 'Node.js', hasGit }
      } catch {
        return { isProject: true, projectType: 'node', projectLabel: 'Node.js 项目', hasGit }
      }
    }

    // 2. Go Project
    if (fs.existsSync(path.join(dirPath, 'go.mod'))) {
      return { isProject: true, projectType: 'go', projectLabel: 'Go 工程', frameworkName: 'Golang', hasGit }
    }

    // 3. Rust Project
    if (fs.existsSync(path.join(dirPath, 'Cargo.toml'))) {
      return { isProject: true, projectType: 'rust', projectLabel: 'Rust 工程', frameworkName: 'Cargo/Rust', hasGit }
    }

    // 4. Python Project
    if (
      fs.existsSync(path.join(dirPath, 'pyproject.toml')) ||
      fs.existsSync(path.join(dirPath, 'requirements.txt')) ||
      fs.existsSync(path.join(dirPath, 'Pipfile')) ||
      fs.existsSync(path.join(dirPath, 'setup.py'))
    ) {
      return { isProject: true, projectType: 'python', projectLabel: 'Python 工程', frameworkName: 'Python', hasGit }
    }

    // 5. Java / Kotlin Project
    if (
      fs.existsSync(path.join(dirPath, 'pom.xml')) ||
      fs.existsSync(path.join(dirPath, 'build.gradle')) ||
      fs.existsSync(path.join(dirPath, 'build.gradle.kts'))
    ) {
      return { isProject: true, projectType: 'java', projectLabel: 'Java/Gradle 工程', frameworkName: 'Java', hasGit }
    }

    // 6. Generic Git or Makefile Repo
    if (hasGit || fs.existsSync(path.join(dirPath, 'Makefile'))) {
      return { isProject: true, projectType: 'git', projectLabel: 'Git 代码仓库', hasGit: true }
    }

    return {
      isProject: false,
      projectType: 'unknown',
      projectLabel: '普通文件夹'
    }
  } catch (err) {
    return {
      isProject: false,
      projectType: 'unknown'
    }
  }
}
