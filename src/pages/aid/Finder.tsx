import { useEffect, useState } from 'react'
import { BellRing, UserCheck, Search, MapPin, Phone, CheckCircle2, FlaskConical } from 'lucide-react'
import Disclaimer from '../../components/Disclaimer'
import { timeAgo } from '../../lib/time'
import {
  SAFE_STATUS,
  listPersonRecords,
  addPersonRecord,
  markFound,
  maskPhone,
  type PersonRecord,
} from '../../lib/finder'

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white'

export default function Finder() {
  const [list, setList] = useState<PersonRecord[]>([])
  const [demo, setDemo] = useState(false)
  const [filter, setFilter] = useState<'全部' | '报平安' | '寻人'>('全部')
  const [q, setQ] = useState('')
  const [formKind, setFormKind] = useState<string | null>(null)

  async function load() {
    try {
      const { data, demo } = await listPersonRecords()
      setList(data)
      setDemo(demo)
    } catch {
      setDemo(true)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function handleFound(id: string) {
    await markFound(id)
    await load()
  }

  const shown = list.filter((r) => {
    if (filter !== '全部' && r.kind !== filter) return false
    if (q.trim()) {
      const s = `${r.name} ${r.location ?? ''} ${r.feature ?? ''}`.toLowerCase()
      if (!s.includes(q.trim().toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="space-y-3">
      <Disclaimer>
        <BellRing className="inline h-3.5 w-3.5 align-[-0.15em] mr-0.5 text-brand-600" strokeWidth={2.25} /> 台风离散家庭可在此<b>报平安</b>或<b>寻人</b>。姓名与最后位置会公开以便家人查找；电话已脱敏。危急或涉及人身安全，请同时拨 <b>110</b>。
      </Disclaimer>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setFormKind(formKind === '报平安' ? null : '报平安')} className="btn-brand">
          <UserCheck className="h-4 w-4" strokeWidth={2.25} /> 我报平安
        </button>
        <button onClick={() => setFormKind(formKind === '寻人' ? null : '寻人')} className="btn-danger">
          <Search className="h-4 w-4" strokeWidth={2.25} /> 我要寻人
        </button>
      </div>

      {formKind && <PersonForm kind={formKind} onDone={() => { setFormKind(null); load() }} />}

      {demo && (
        <Disclaimer><FlaskConical className="inline h-3.5 w-3.5 align-[-0.15em] mr-0.5 text-slate-500" strokeWidth={2.25} /> 演示模式：后端未配置，下列为示例数据，提交仅本机可见。</Disclaimer>
      )}

      {/* 搜索 + 筛选 */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={2.25} />
        <input className={`${inputCls} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="按姓名 / 地点搜索" />
      </div>
      <div className="flex gap-2">
        {(['全部', '报平安', '寻人'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === f ? 'bg-brand-600 text-white font-semibold' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {shown.map((r) => {
          const isFind = r.kind === '寻人'
          const found = r.status === '已找到'
          return (
            <div key={r.id} className={`card p-3 ${found ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`badge font-semibold ${isFind ? 'bg-danger-50 text-danger-700' : 'bg-safe-100 text-safe-700'}`}>
                    {isFind ? (
                      <><Search className="h-3.5 w-3.5" strokeWidth={2.25} /> 寻人</>
                    ) : (
                      <><UserCheck className="h-3.5 w-3.5" strokeWidth={2.25} /> 报平安</>
                    )}
                  </span>
                  <span className={`badge ${found ? 'bg-safe-100 text-safe-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                </div>
                <span className="text-[11px] text-slate-400">{timeAgo(r.created_at)}</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-1.5">{r.name}</p>
              {r.location && <p className="flex items-center gap-1 text-xs text-slate-600 mt-0.5"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" strokeWidth={2.25} />{r.location}</p>}
              {r.feature && <p className="text-xs text-slate-600 mt-0.5">特征：{r.feature}</p>}
              {r.note && <p className="text-sm text-slate-700 mt-1 leading-relaxed">{r.note}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className="flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" strokeWidth={2.25} />{maskPhone(r.phone)}</span>
                {isFind && !found && (
                  <button onClick={() => void handleFound(r.id)} className="btn-ghost !py-1 !px-2.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} /> 已找到
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {shown.length === 0 && <p className="text-sm text-slate-400 text-center py-6">没有匹配的记录</p>}
      </div>
    </div>
  )
}

function PersonForm({ kind, onDone }: { kind: string; onDone: () => void }) {
  const isFind = kind === '寻人'
  const [f, setF] = useState({ name: '', location: '', status: isFind ? '寻找中' : SAFE_STATUS[0], phone: '', feature: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    setErr('')
    if (!f.name.trim()) {
      setErr(isFind ? '请填写被寻找者的称呼' : '请填写你的称呼')
      return
    }
    setBusy(true)
    try {
      await addPersonRecord({
        kind,
        name: f.name.trim(),
        location: f.location.trim() || null,
        status: f.status,
        phone: f.phone.trim() || null,
        feature: isFind ? f.feature.trim() || null : null,
        note: f.note.trim() || null,
      })
      onDone()
    } catch {
      setErr('提交失败，请重试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card p-4 space-y-2">
      <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={isFind ? '被寻找者称呼 *' : '你的称呼 *'} />
      <input className={inputCls} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder={isFind ? '最后出现地点' : '当前所在地/安置点'} />
      {isFind && (
        <input className={inputCls} value={f.feature} onChange={(e) => setF({ ...f, feature: e.target.value })} placeholder="特征：年龄/外貌/衣着" />
      )}
      {!isFind && (
        <select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          {SAFE_STATUS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      )}
      <input className={inputCls} type="tel" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="联系电话（公开时脱敏）" />
      <textarea className={inputCls} rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="补充说明" />
      {err && <p className="text-xs text-danger-600">{err}</p>}
      <button onClick={submit} disabled={busy} className="btn-brand w-full disabled:opacity-60">
        {busy ? '提交中…' : isFind ? '发布寻人' : '发布平安'}
      </button>
    </div>
  )
}
