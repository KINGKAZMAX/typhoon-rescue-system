import { copyFile, mkdir, stat } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const port = process.env.OVERVIEW_PORT || '4177'
const url = `http://127.0.0.1:${port}/#/overview`
const topLevelPng = path.join(root, '广西台风救援平台-交互界面总览.png')
const docsPng = path.join(root, 'docs', 'overview.png')

const chromeCandidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
].filter(Boolean)

async function fileExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function findChrome() {
  for (const candidate of chromeCandidates) {
    if (await fileExists(candidate)) return candidate
  }
  throw new Error('找不到 Chrome/Chromium。可通过 CHROME_PATH=/path/to/chrome npm run export:overview 指定。')
}

async function waitForServer(targetUrl, timeoutMs = 20_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(targetUrl)
      if (response.ok) return
    } catch {
      // Vite 还没起来，继续等。
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`本地预览服务未在 ${timeoutMs}ms 内启动：${targetUrl}`)
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: options.stdio || 'inherit',
      env: { ...process.env, ...options.env },
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

async function main() {
  const chrome = await findChrome()
  const viteBin = path.join(root, 'node_modules', '.bin', 'vite')
  const server = spawn(viteBin, ['--host', '127.0.0.1', '--port', port, '--strictPort'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  })

  server.stdout.on('data', (chunk) => process.stdout.write(chunk))
  server.stderr.on('data', (chunk) => process.stderr.write(chunk))

  try {
    await waitForServer(`http://127.0.0.1:${port}/`)
    await mkdir(path.dirname(docsPng), { recursive: true })
    await run(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-features=Translate,BackForwardCache',
      '--run-all-compositor-stages-before-draw',
      `--force-device-scale-factor=${process.env.OVERVIEW_SCALE || '2'}`,
      '--window-size=3600,5600',
      '--virtual-time-budget=16000',
      `--screenshot=${topLevelPng}`,
      url,
    ])
    await copyFile(topLevelPng, docsPng)
    console.log(`导出完成：${topLevelPng}`)
    console.log(`同步完成：${docsPng}`)
  } finally {
    server.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
