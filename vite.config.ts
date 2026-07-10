import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base: './' 使用相对路径，构建产物可部署到任意静态主机 / 子路径 / 对象存储，
// 便于在中国大陆免翻墙的托管环境（腾讯云 CloudBase / OSS / Cloudflare Pages 等）之间迁移。
export default defineConfig({
  base: './',
  plugins: [
    react(),
    // PWA：离线可用 + 可添加到主屏。台风常停电断网，只读模块(预报/电话/指南/罕见病)首次打开后离线仍可用。
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: '广西台风救援信息平台',
        short_name: '台风救援',
        description: '台风预报·救援电话·求助互助·灾后重建安全指南（移动端优先，离线可用）',
        theme_color: '#1d4ed8',
        background_color: '#eef1f5',
        display: 'standalone',
        start_url: './',
        scope: './',
        lang: 'zh-CN',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
