import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' 使用相对路径，构建产物可部署到任意静态主机 / 子路径 / 对象存储，
// 便于在中国大陆免翻墙的托管环境（腾讯云 CloudBase / OSS / Cloudflare Pages 等）之间迁移。
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
