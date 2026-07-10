// 报平安 / 寻人 数据层（对标 Google Person Finder；台风离散家庭高频刚需）
// 隐私：公开只显示脱敏电话；姓名/最后位置为可搜索字段（寻人的意义所在）。
// 与 aid.ts 同样的"后端未配置自动降级本地"模式。

import { supabase, isSupabaseConfigured } from './supabase'
import { maskPhone } from './aid'

export const FINDER_KINDS = ['报平安', '寻人'] as const
export const SAFE_STATUS = ['安全', '已安置', '安全但需帮助'] as const
export const FIND_STATUS = ['寻找中', '已找到'] as const

export { maskPhone }

export interface PersonRecord {
  id: string
  created_at: string
  kind: string // 报平安 | 寻人
  name: string // 报平安=本人称呼 / 寻人=被寻者
  location?: string | null // 所在地 / 最后出现地
  status: string
  phone?: string | null // 联系人/报料人电话
  feature?: string | null // 寻人：年龄/外貌/衣着特征
  note?: string | null
}

const demo: PersonRecord[] = [
  {
    id: 'pf-demo-1',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    kind: '报平安',
    name: '示例·陈家三口',
    location: '南宁横州·马岭镇安置点',
    status: '已安置',
    phone: '137****8888',
    note: '【示例】已转移到安置点，一切安好，勿念。',
  },
  {
    id: 'pf-demo-2',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    kind: '寻人',
    name: '示例·黄伯',
    location: '防城港·那良镇',
    status: '寻找中',
    phone: '138****6666',
    feature: '约 70 岁，高约 1.65m，蓝色上衣，行动缓慢',
    note: '【示例】台风后失联，家人寻找，有线索请联系。',
  },
]

let local: PersonRecord[] = [...demo]

export async function listPersonRecords(): Promise<{ data: PersonRecord[]; demo: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('person_records_public')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
        .abortSignal(AbortSignal.timeout(8000))
      if (error) throw error
      return { data: (data as PersonRecord[]) ?? [], demo: false }
    } catch {
      return { data: local, demo: true }
    }
  }
  return { data: local, demo: true }
}

export async function addPersonRecord(
  input: Omit<PersonRecord, 'id' | 'created_at'>,
): Promise<{ demo: boolean }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('person_records').insert([input])
    if (error) throw error
    return { demo: false }
  }
  local = [
    { ...input, id: `pf-local-${local.length + 1}`, created_at: new Date().toISOString() },
    ...local,
  ]
  return { demo: true }
}

/** 寻人闭环：标记已找到 */
export async function markFound(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('person_records').update({ status: '已找到' }).eq('id', id)
      if (error) throw error
      return
    } catch {
      /* fall through to local */
    }
  }
  local = local.map((r) => (r.id === id ? { ...r, status: '已找到' } : r))
}
