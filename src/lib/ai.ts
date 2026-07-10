// AI 拍照/文字求助分析能力层（客户端）
// 前端零密钥：只调用你部署的后端代理(VITE_AI_ENDPOINT)，密钥留在服务端。
// 未配置时 analyzeSos 抛错，Sos 页自动回退为引导式表单（永不失效）。
// 后端代理与提示词见 functions/analyze-sos/ 与 research/07-AI拍照求助设计.md。

export const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || ''
export const isAiConfigured = Boolean(AI_ENDPOINT)

/** AI 从照片+文字归纳出的结构化草稿（字段与 Sos 表单一致，供预填后人工核对） */
export interface NeedDraft {
  urgency?: 'critical' | 'high' | 'medium' | 'low'
  needTypes?: string[]
  supplies?: string[]
  vuln?: string[]
  location?: string
  people?: number | null
  canMove?: 'yes' | 'partial' | 'no' | 'unknown'
  isRare?: boolean
  rare?: {
    disease?: string
    vitals?: string
    meds?: string
    dialysis?: boolean
    oxygen?: boolean
    coldChain?: boolean
  }
  uncertain?: string[] // AI 不确定/推测的字段，供前端高亮提示人工核对
}

/** 把照片+一句话/群消息交给后端代理，返回结构化草稿 */
export async function analyzeSos(input: { text: string; images: string[] }): Promise<NeedDraft> {
  if (!isAiConfigured) throw new Error('AI 未接入')
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`AI 分析失败(${res.status})`)
  return (await res.json()) as NeedDraft
}

/** File → dataURL（用于把照片传给后端多模态模型） */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = reject
    r.readAsDataURL(file)
  })
}
