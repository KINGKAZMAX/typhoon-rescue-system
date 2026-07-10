import { supabase, isSupabaseConfigured } from './supabase'

// ── 类型 ──
export const HELP_TYPES = ['被困待救', '医疗急需', '物资短缺', '临时住宿', '道路/失联', '其他'] as const
export const VOL_ROLES = ['个人志愿者', '救援队', '车辆/船只', '物资捐赠方', '医疗/心理'] as const

export const URGENCY_META: Record<string, { label: string; cls: string }> = {
  critical: { label: '危急', cls: 'bg-danger-600 text-white' },
  high: { label: '紧急', cls: 'bg-warn-600 text-white' },
  medium: { label: '一般', cls: 'bg-warn-100 text-warn-700' },
  low: { label: '普通', cls: 'bg-safe-100 text-safe-700' },
}
const URGENCY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

// 工单状态机：待对接 → 对接中 → 已解决（对标 Crisis Cleanup / 卓明 / 郑州救命文档）
export const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: '待对接', cls: 'bg-warn-100 text-warn-700' },
  claimed: { label: '对接中', cls: 'bg-brand-100 text-brand-700' },
  rescued: { label: '已解决', cls: 'bg-safe-100 text-safe-700' },
}
const STATUS_ORDER: Record<string, number> = { pending: 0, claimed: 1, rescued: 2 }

export interface HelpRequest {
  id: string
  created_at: string
  type: string
  name?: string | null
  phone: string
  city?: string | null
  people?: number | null
  detail: string
  urgency?: string | null
  needs?: string[] | null
  rareDisease?: boolean | null
  status?: string | null
  claimedBy?: string | null
  // 私有字段：精确定位/病历/坐标 —— 仅救援方(service_role)可见，不进公开求助墙
  privateDetail?: string | null
  lat?: number | null
  lng?: number | null
}

/** 公开展示脱敏手机号（隐私：郑州"救命文档"教训 → 公开只显示脱敏，完整联系方式认领后可见） */
export function maskPhone(p?: string | null): string {
  if (!p) return ''
  if (p.includes('*')) return p
  const d = p.replace(/\D/g, '')
  if (d.length >= 7) return `${d.slice(0, 3)}****${d.slice(-2)}`
  return p
}

/** 工单排序：未解决优先 → 紧急度降序 → 时间新→旧（脆弱度×紧急度理念的简化实现） */
export function sortRequests(list: HelpRequest[]): HelpRequest[] {
  return [...list].sort((a, b) => {
    const sa = STATUS_ORDER[a.status ?? 'pending'] ?? 0
    const sb = STATUS_ORDER[b.status ?? 'pending'] ?? 0
    if (sa !== sb) return sa - sb
    const ua = URGENCY_ORDER[a.urgency ?? 'medium'] ?? 2
    const ub = URGENCY_ORDER[b.urgency ?? 'medium'] ?? 2
    if (ua !== ub) return ua - ub
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export interface VolunteerSignup {
  name: string
  phone: string
  city?: string
  role: string
  skills?: string
  detail?: string
}

// ── 演示数据（后端未配置时展示，示意用途）──
const demoRequests: HelpRequest[] = [
  {
    id: 'demo-1',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    type: '物资短缺',
    name: '示例·李',
    phone: '138****0000',
    city: '钦州',
    people: 4,
    detail: '【示例数据】久隆镇一家四口被困二楼，饮用水和婴儿奶粉短缺，一楼进水，老人需慢性病药。',
    status: 'pending',
  },
  {
    id: 'demo-2',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    type: '道路/失联',
    name: '示例·黄',
    phone: '139****1111',
    city: '防城港',
    people: 1,
    detail: '【示例数据】那良镇通往村里的桥被冲断，与家中老人失联一天，请求协助确认安全。',
    status: 'pending',
  },
]

// 本地内存态（降级模式下"提交"后可见）
let localRequests: HelpRequest[] = [...demoRequests]

// ── 读取求助列表 ──
export async function listHelpRequests(): Promise<{ data: HelpRequest[]; demo: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      // 只从脱敏公开视图读取（不含完整电话/精确定位/病历），并设超时防大陆弱网长时间挂起
      const { data, error } = await supabase
        .from('help_requests_public')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
        .abortSignal(AbortSignal.timeout(8000))
      if (error) throw error
      return { data: (data as HelpRequest[]) ?? [], demo: false }
    } catch {
      // 后端不可达（*.supabase.co 被墙/超时）→ 回退本地演示，避免空白误导
      return { data: localRequests, demo: true }
    }
  }
  return { data: localRequests, demo: true }
}

// ── 提交求助 ──
export async function addHelpRequest(
  input: Omit<HelpRequest, 'id' | 'created_at' | 'status'>,
): Promise<{ demo: boolean }> {
  if (isSupabaseConfigured && supabase) {
    // 公开列 detail 只存脱敏摘要；精确定位/病历/坐标存私有列（仅 service_role 可读）
    const row = {
      type: input.type,
      name: input.name,
      phone: input.phone,
      city: input.city,
      people: input.people,
      detail: input.detail,
      detail_private: input.privateDetail ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      urgency: input.urgency ?? null,
      needs: input.needs ?? null,
      rare_disease: input.rareDisease ?? null,
      status: 'pending',
    }
    const { error } = await supabase.from('help_requests').insert([row])
    if (error) throw error
    return { demo: false }
  }
  localRequests = [
    { ...input, id: `local-${localRequests.length + 1}`, created_at: new Date().toISOString(), status: 'pending' },
    ...localRequests,
  ]
  return { demo: true }
}

// ── 更新工单状态（认领 / 已解决）──
export async function updateHelpStatus(id: string, status: string, claimedBy?: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('help_requests')
        .update({ status, claimed_by: claimedBy ?? null })
        .eq('id', id)
      if (error) throw error
      return
    } catch {
      // 后端不可达时退回本地更新，保证演示可用
    }
  }
  localRequests = localRequests.map((r) => (r.id === id ? { ...r, status, claimedBy: claimedBy ?? r.claimedBy } : r))
}

// ── 提交志愿者报名（隐私：不公开展示，仅入库供组织方联系）──
export async function addVolunteer(input: VolunteerSignup): Promise<{ demo: boolean }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('volunteer_signups').insert([input])
    if (error) throw error
    return { demo: false }
  }
  return { demo: true }
}
