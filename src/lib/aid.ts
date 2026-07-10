import { supabase, isSupabaseConfigured } from './supabase'

// ── 类型 ──
export const HELP_TYPES = ['被困待救', '医疗急需', '物资短缺', '临时住宿', '道路/失联', '其他'] as const
export const VOL_ROLES = ['个人志愿者', '救援队', '车辆/船只', '物资捐赠方', '医疗/心理'] as const

export interface HelpRequest {
  id: string
  created_at: string
  type: string
  name?: string | null
  phone: string
  city?: string | null
  people?: number | null
  detail: string
  status?: string | null
}

export interface VolunteerSignup {
  name: string
  phone: string
  city?: string
  role: string
  skills?: string
  detail?: string
}

export { isSupabaseConfigured }

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
    status: 'open',
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
    status: 'open',
  },
]

// 本地内存态（降级模式下"提交"后可见）
let localRequests: HelpRequest[] = [...demoRequests]

// ── 读取求助列表 ──
export async function listHelpRequests(): Promise<{ data: HelpRequest[]; demo: boolean }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    return { data: (data as HelpRequest[]) ?? [], demo: false }
  }
  return { data: localRequests, demo: true }
}

// ── 提交求助 ──
export async function addHelpRequest(
  input: Omit<HelpRequest, 'id' | 'created_at' | 'status'>,
): Promise<{ demo: boolean }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('help_requests').insert([{ ...input, status: 'open' }])
    if (error) throw error
    return { demo: false }
  }
  localRequests = [
    { ...input, id: `local-${localRequests.length + 1}`, created_at: new Date().toISOString(), status: 'open' },
    ...localRequests,
  ]
  return { demo: true }
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
