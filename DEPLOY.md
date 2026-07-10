# 部署指南 · 中国大陆免翻墙上线

本项目构建产物是**纯静态文件**（`npm run build` → `dist/`），用 HashRouter（无需服务器重写），可部署到任意静态主机。互助后端与 AI 分析为**可选增强**，不配置也能作为完整只读站上线。

> 核心约束：**大陆免翻墙可访问**。下面按"免翻墙优先级 + 上手速度"给三条路。

---

## 一、前端静态站部署（三选一）

### 方案 A · 腾讯云 CloudBase 静态托管（大陆原生，推荐）
大陆访问快、可与后端云函数同厂打通。
1. 开通[腾讯云 CloudBase](https://tcb.cloud.tencent.com/)，创建环境。
2. 本地 `npm run build` 生成 `dist/`。
3. 用 CloudBase CLI：`npm i -g @cloudbase/cli` → `tcb login` → `tcb hosting deploy dist -e <环境ID>`。
4. 绑定自有**已备案**域名（CloudBase 默认域名也可直接访问）。

### 方案 B · 自有已备案域名 + 阿里云 OSS / 腾讯云 COS（大陆最快最稳）
1. 域名完成 **ICP 备案**（依托国内云厂商，约 1–2 周）。
2. OSS/COS 开启**静态网站托管**，上传 `dist/` 全部文件，首页/404 都设为 `index.html`。
3. 挂 CDN + 绑定备案域名 + 开 HTTPS。
> 备案与地图 key 无关；备案只取决于服务器/CDN 在境内。

### 方案 C · Cloudflare Pages（零备案起步最快，大陆多数可达）
1. Cloudflare 控制台 → Pages → 连接本 GitHub 仓库。
2. 构建命令 `npm run build`，输出目录 `dist`。
3. 环境变量按需填 `VITE_*`（见下）。推送即自动部署。
> `*.pages.dev` 大陆访问偶有波动；追求最稳仍建议方案 A/B + 备案域名。

**不推荐**：Vercel / GitHub Pages（`vercel.app` / `github.io` 大陆常需翻墙）。

---

## 二、互助后端（可选，让求助/报名多人实时共享）

### 大陆首选：腾讯云 CloudBase 数据库 + 云函数
- 免翻墙、低延迟、可与静态托管同环境。把 `src/lib/aid.ts` 的数据访问替换为 CloudBase SDK（结构对应 `supabase/schema.sql` 的表与脱敏视图思路）。

### 备选：Supabase（改动最小，但 `*.supabase.co` 大陆可能不稳）
1. 建项目 → SQL Editor 执行 [`supabase/schema.sql`](supabase/schema.sql)（已内置**安全默认**：匿名不可读原表，公开只走脱敏视图 `help_requests_public`）。
2. 在部署平台环境变量填 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`。
3. 代码已做降级：后端不可达时自动回退本地演示，不阻塞其余页面。

> ⚠️ 隐私红线（已在 schema 与前端落地）：完整电话/精确坐标/病历仅救援方(service_role)可读，公开墙只显示脱敏。生产务必再加**内容审核、频率限制、认领鉴权、汛后自动销毁个人信息**。

---

## 三、AI 拍照分析代理（可选，PRD 核心）

前端零密钥，必须经服务端代理调模型。代码见 [`functions/analyze-sos/`](functions/analyze-sos/)。

### 部署（Supabase Edge Function 版）
```bash
supabase functions deploy analyze-sos --no-verify-jwt
supabase secrets set DASHSCOPE_API_KEY=sk-你的通义千问Key   # 阿里云百炼控制台申请
# 可选：supabase secrets set AI_MODEL=qwen-vl-max
```
把函数 URL 填到部署平台环境变量 `VITE_AI_ENDPOINT`。

### 大陆首选：腾讯云 SCF / 阿里云 FC
逻辑与 `functions/analyze-sos/index.ts` 一致（读环境变量密钥 → 组多模态消息 → 调通义千问 VL OpenAI 兼容端点 → 返回 JSON）。把入口改成对应云的 handler 签名即可；密钥存函数环境变量，配 HTTP 触发器，URL 填 `VITE_AI_ENDPOINT`。

- 模型推荐：**阿里通义千问 Qwen-VL**（OCR 强，读药盒/病历/门牌好），OpenAI 兼容模式；备选智谱 GLM-4V、阶跃 Step-1V。
- 未配置 `VITE_AI_ENDPOINT` 时，拍照求助自动用**引导式表单**（永不失效）。

---

## 四、环境变量一览（部署平台填写）

| 变量 | 必填 | 说明 |
|---|---|---|
| `VITE_LAST_UPDATED` | 否 | 页脚显示的更新日期 |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | 否 | 互助后端（Supabase）。不填=本地演示/只读 |
| `VITE_AI_ENDPOINT` | 否 | AI 分析代理 URL。不填=引导式表单降级 |

---

## 五、本地验证

```bash
npm install
npm run build      # 类型检查 + 构建；产物在 dist/
npm run preview    # 本地预览 dist/
```

只读模块（预报 / 电话 / 指南 / 物资 / 罕见病）零后端即完整可用。
