// 后端 AI 代理：拍照/文字 → 结构化求助草稿
// 部署形态：Supabase Edge Function（Deno）。腾讯云 SCF / 阿里云 FC 版见 DEPLOY.md（逻辑一致，仅入口签名不同）。
//
// 安全：模型密钥仅存服务端环境变量(DASHSCOPE_API_KEY)，前端零密钥。
// 模型：默认阿里通义千问 Qwen-VL（OCR 强，适合读药盒/病历/门牌），OpenAI 兼容模式调用。
// 提示词完整版见 research/07-AI拍照求助设计.md。
//
// 环境变量：
//   DASHSCOPE_API_KEY  通义千问 API Key（https://bailian.console.aliyun.com/）
//   AI_MODEL           可选，默认 qwen-vl-max
//   ALLOW_ORIGIN       可选，CORS 白名单，默认 *
//
// 部署：supabase functions deploy analyze-sos --no-verify-jwt
//       supabase secrets set DASHSCOPE_API_KEY=sk-xxx

const DASHSCOPE_KEY = Deno.env.get('DASHSCOPE_API_KEY') || ''
const MODEL = Deno.env.get('AI_MODEL') || 'qwen-vl-max'
const ALLOW_ORIGIN = Deno.env.get('ALLOW_ORIGIN') || '*'
const ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

const SYSTEM_PROMPT = `你是台风/洪涝灾害「求助信息结构化」助手。输入是受灾群众的一句话/群聊转发文字，可能还有现场照片（可能是方言、口语、零散、不完整）。请把它归纳为一条严格结构化的求助单，只输出 JSON，不要任何解释或 markdown。

最高原则（务必遵守）：
1. 只写能从文字/照片确证的信息，严禁臆造门牌号、病名、人数、地址。看不到/听不清/没提到的字段一律给 null 或空数组 []，绝不猜。
2. 方言/模糊描述做稳健归纳；凡属推测或音译不确定的字段名，放进 uncertain 数组并说明。
3. urgency 就高不就低：涉及生命/被困/断药/婴幼儿/透析供氧中断/临产，默认 critical 或 high；只上调不下调。
4. 不做医疗诊断，只如实记录可见的体征事实。

输出 JSON 结构（字段固定）：
{
  "urgency": "critical|high|medium|low",
  "needTypes": string[],   // 取值：被困待救/医疗急需/物资短缺/断药/需转移/失联寻人/需取水/临时住宿/心理支援/其他
  "supplies": string[],    // 取值：饮用水/食物/药品/婴儿奶粉尿布/被褥/照明充电/卫生用品
  "vuln": string[],        // 取值：老人/小孩/孕产妇/伤病员/残障失能
  "location": string|null, // 原文位置，保留原样，不补全未提及的行政区/门牌
  "people": number|null,
  "canMove": "yes|partial|no|unknown",
  "isRare": boolean,       // 是否涉及罕见病/慢病（透析/胰岛素/供氧/癫痫/化疗等）
  "rare": { "disease": string|null, "vitals": string|null, "meds": string|null, "dialysis": boolean, "oxygen": boolean, "coldChain": boolean } | null,
  "uncertain": string[]    // 推测/不确定的字段名 + 原因
}`

const cors = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors })

  try {
    const { text = '', images = [] } = await req.json()
    if (!DASHSCOPE_KEY) {
      return json({ error: 'AI 未配置：请在服务端设置 DASHSCOPE_API_KEY' }, 500)
    }

    // 组多模态消息：文字 + 最多 4 张照片（防滥用/控成本）
    const content: unknown[] = [
      { type: 'text', text: `求助原文（可能含方言/口语）：${text || '（无文字，仅照片）'}` },
    ]
    for (const img of (images as string[]).slice(0, 4)) {
      if (typeof img === 'string' && img.startsWith('data:image')) {
        content.push({ type: 'image_url', image_url: { url: img } })
      }
    }

    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${DASHSCOPE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(25000),
    })

    if (!upstream.ok) {
      const t = await upstream.text()
      return json({ error: `模型调用失败(${upstream.status})`, detail: t.slice(0, 300) }, 502)
    }
    const data = await upstream.json()
    const raw = data?.choices?.[0]?.message?.content ?? '{}'
    let draft: unknown
    try {
      draft = JSON.parse(raw)
    } catch {
      return json({ error: '模型未返回合法 JSON', raw: String(raw).slice(0, 300) }, 502)
    }
    return json(draft, 200)
  } catch (e) {
    return json({ error: '请求处理失败', detail: String(e).slice(0, 200) }, 400)
  }

  function json(obj: unknown, status: number) {
    return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
