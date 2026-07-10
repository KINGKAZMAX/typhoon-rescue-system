import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Disclaimer from '../components/Disclaimer'
import VerifyBadge from '../components/VerifyBadge'
import { timeAgo } from '../lib/time'
import { cities, volunteerChannels, donationChannels, antiFraudTips } from '../data/phones'
import {
  HELP_TYPES,
  VOL_ROLES,
  URGENCY_META,
  STATUS_META,
  maskPhone,
  sortRequests,
  listHelpRequests,
  addHelpRequest,
  updateHelpStatus,
  addVolunteer,
  type HelpRequest,
} from '../lib/aid'
import Sos from './aid/Sos'
import Stations from './aid/Stations'
import Rare from './aid/Rare'

const cityNames = cities.map((c) => c.name)
type Tab = 'help' | 'sos' | 'stations' | 'rare' | 'volunteer' | 'donate'
const TABS: [Tab, string][] = [
  ['sos', '🆘 拍照求助'],
  ['help', '求助墙'],
  ['stations', '物资/安置'],
  ['rare', '罕见病'],
  ['volunteer', '我要报名'],
  ['donate', '物资捐赠'],
]

export default function MutualAid() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') as Tab | null
  const tab: Tab = TABS.some(([k]) => k === raw) ? (raw as Tab) : 'sos'
  const setTab = (k: Tab) => setParams({ tab: k }, { replace: true })

  return (
    <div>
      {/* header 与二级 Tab 作为一个整体吸顶，避免硬编码偏移导致遮挡 */}
      <div className="sticky top-0 z-30">
        <PageHeader title="🤝 求助与互助" subtitle="拍照求助 · 物资安置 · 罕见病 · 志愿报名 · 捐赠" />
        {/* 二级 Tab（横向可滚动） */}
        <div className="bg-white border-b border-gray-100 flex overflow-x-auto no-scrollbar">
          {TABS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`shrink-0 whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition ${
                tab === k ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {tab === 'sos' && <Sos onSubmitted={() => setTab('help')} />}
        {tab === 'help' && <HelpWall />}
        {tab === 'stations' && <Stations />}
        {tab === 'rare' && <Rare />}
        {tab === 'volunteer' && <VolunteerForm />}
        {tab === 'donate' && <Donate />}
      </div>
    </div>
  )
}

/* ── 求助墙 ── */
function HelpWall() {
  const [list, setList] = useState<HelpRequest[]>([])
  const [demo, setDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data, demo } = await listHelpRequests()
      setList(sortRequests(data))
      setDemo(demo)
    } catch {
      setDemo(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function setStatus(id: string, status: string) {
    await updateHelpStatus(id, status)
    await load()
  }

  return (
    <div className="space-y-3">
      {demo && (
        <Disclaimer>
          🧪 <b>演示模式</b>：后端（Supabase）未配置，下列为示例数据，提交仅本机可见。配置后端后可多人实时共享求助信息。
        </Disclaimer>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{loading ? '加载中…' : `共 ${list.length} 条求助`}</span>
        <button onClick={() => setShowForm((v) => !v)} className="btn-brand !py-2 !px-3 text-sm">
          {showForm ? '收起' : '＋ 发布求助'}
        </button>
      </div>

      {showForm && <HelpForm onDone={() => { setShowForm(false); load() }} />}

      <div className="space-y-2">
        {list.map((r) => {
          const status = r.status ?? 'pending'
          const claimed = status === 'claimed'
          const rescued = status === 'rescued'
          return (
            <div key={r.id} className={`card p-3 ${rescued ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STATUS_META[status] && (
                    <span className={`badge font-semibold ${STATUS_META[status].cls}`}>{STATUS_META[status].label}</span>
                  )}
                  {r.urgency && URGENCY_META[r.urgency] && (
                    <span className={`badge font-semibold ${URGENCY_META[r.urgency].cls}`}>{URGENCY_META[r.urgency].label}</span>
                  )}
                  <span className="badge bg-danger-50 text-danger-700 font-semibold">{r.type}</span>
                  {r.rareDisease && <span className="badge bg-brand-100 text-brand-700">🧬 罕见病</span>}
                </div>
                <span className="text-[11px] text-gray-400">{timeAgo(r.created_at)}</span>
              </div>
              <p className="text-sm text-gray-800 mt-2 leading-relaxed whitespace-pre-line">{r.detail}</p>
              <div className="flex items-center justify-between mt-2 gap-2">
                <span className="text-xs text-gray-500 min-w-0 truncate">
                  {r.city ? `📍${r.city}` : ''}{r.people ? ` · ${r.people}人` : ''}{r.name ? ` · ${r.name}` : ''}
                  {` · 📞${maskPhone(r.phone)}`}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!rescued && !claimed && (
                    <button onClick={() => setStatus(r.id, 'claimed')} className="btn-brand !py-1 !px-2.5 text-xs">
                      我来跟进
                    </button>
                  )}
                  {claimed && r.phone && (
                    <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="btn-danger !py-1 !px-2.5 text-xs">
                      📞 拨打
                    </a>
                  )}
                  {claimed && (
                    <button onClick={() => setStatus(r.id, 'rescued')} className="btn-ghost !py-1 !px-2.5 text-xs">
                      ✅ 已解决
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
        工单流程：待对接 → 对接中 → 已解决。认领后方可拨打完整电话（抑制重复救援、防隐私裸奔）。生命危急请第一时间拨 110/119/120，请勿在求助内容里填写过多敏感个人信息。
      </p>
    </div>
  )
}

/* ── 发布求助表单 ── */
function HelpForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ type: HELP_TYPES[0] as string, name: '', phone: '', city: '', people: '', detail: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    setErr('')
    if (!f.phone.trim() || !f.detail.trim()) {
      setErr('请填写联系电话和求助内容')
      return
    }
    setBusy(true)
    try {
      await addHelpRequest({
        type: f.type,
        name: f.name.trim() || null,
        phone: f.phone.trim(),
        city: f.city || null,
        people: f.people ? Number(f.people) : null,
        detail: f.detail.trim(),
      })
      onDone()
    } catch {
      setErr('提交失败，请稍后重试或直接拨打救援电话')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <Field label="求助类型">
        <select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          {HELP_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="所在城市">
          <select className={inputCls} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>
            <option value="">选择</option>
            {cityNames.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="涉及人数">
          <input
            className={inputCls}
            type="number"
            inputMode="numeric"
            value={f.people}
            onChange={(e) => setF({ ...f, people: e.target.value })}
            placeholder="如 3"
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="称呼（选填）">
          <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="如 李先生" />
        </Field>
        <Field label="联系电话 *">
          <input
            className={inputCls}
            type="tel"
            inputMode="tel"
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
            placeholder="救援人员回拨用"
          />
        </Field>
      </div>
      <Field label="求助内容 *">
        <textarea
          className={inputCls}
          rows={3}
          value={f.detail}
          onChange={(e) => setF({ ...f, detail: e.target.value })}
          placeholder="具体位置、被困情况、急需物资、老人/儿童/伤病等"
        />
      </Field>
      {err && <p className="text-xs text-danger-600">{err}</p>}
      <button onClick={submit} disabled={busy} className="btn-brand w-full disabled:opacity-60">
        {busy ? '提交中…' : '提交求助'}
      </button>
    </div>
  )
}

/* ── 志愿者/救援队报名 ── */
function VolunteerForm() {
  const [f, setF] = useState({ name: '', phone: '', city: '', role: VOL_ROLES[0] as string, skills: '', detail: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [demo, setDemo] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    setErr('')
    if (!f.name.trim() || !f.phone.trim()) {
      setErr('请填写姓名和联系电话')
      return
    }
    setBusy(true)
    try {
      const { demo } = await addVolunteer({
        name: f.name.trim(),
        phone: f.phone.trim(),
        city: f.city,
        role: f.role,
        skills: f.skills.trim(),
        detail: f.detail.trim(),
      })
      setDemo(demo)
      setDone(true)
    } catch {
      setErr('提交失败，请稍后重试或直接联系下方官方渠道')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <section>
        <h2 className="section-title mb-2">官方报名渠道（推荐）</h2>
        <div className="space-y-2">
          {volunteerChannels.map((o) => (
            <a key={o.name} href={o.url} target="_blank" rel="noreferrer" className="card p-3 flex items-center gap-3">
              <span className="text-xl">🔗</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{o.name}</span>
                  <VerifyBadge level={o.verify} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{o.desc}</p>
              </div>
              <span className="text-gray-300">›</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-2">在本平台登记（供组织方联系）</h2>
        {done ? (
          <div className="card p-4 text-center">
            <div className="text-3xl">✅</div>
            <p className="font-semibold text-gray-900 mt-2">报名信息已提交，感谢你！</p>
            <p className="text-xs text-gray-500 mt-1">
              {demo ? '（演示模式：后端未配置，信息未真正入库。）' : '组织方将根据需要与你联系。'}
            </p>
            <p className="text-xs text-gray-500 mt-2">建议同时在上方官方渠道注册，覆盖更全。</p>
          </div>
        ) : (
          <div className="card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="姓名 *">
                <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </Field>
              <Field label="联系电话 *">
                <input className={inputCls} type="tel" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="所在城市">
                <select className={inputCls} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>
                  <option value="">选择</option>
                  {cityNames.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="参与方式">
                <select className={inputCls} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
                  {VOL_ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="技能/资源（选填）">
              <input className={inputCls} value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="如 持急救证 / 冲锋舟 / 越野车 / 无人机" />
            </Field>
            <Field label="补充说明（选填）">
              <textarea className={inputCls} rows={2} value={f.detail} onChange={(e) => setF({ ...f, detail: e.target.value })} placeholder="可服务时间、区域等" />
            </Field>
            {err && <p className="text-xs text-danger-600">{err}</p>}
            <button onClick={submit} disabled={busy} className="btn-brand w-full disabled:opacity-60">
              {busy ? '提交中…' : '提交报名'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

/* ── 物资捐赠 ── */
function Donate() {
  return (
    <div className="space-y-4">
      <Disclaimer>
        ⚠️ 捐款前用民政部「慈善中国」核验募捐主体资质与备案编号。只在群聊/短信/陌生链接出现的收款码、个人账号一律不要转账。
      </Disclaimer>
      <section>
        <h2 className="section-title mb-2">合规捐赠渠道</h2>
        <div className="space-y-2">
          {donationChannels.map((o) => (
            <a key={o.name} href={o.url} target="_blank" rel="noreferrer" className="card p-3 flex items-center gap-3">
              <span className="text-xl">❤️</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{o.name}</span>
                  <VerifyBadge level={o.verify} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{o.desc}</p>
              </div>
              <span className="text-gray-300">›</span>
            </a>
          ))}
        </div>
      </section>
      <section>
        <h2 className="section-title mb-2">🛡️ 防骗捐要点</h2>
        <div className="card p-4">
          <ul className="space-y-2">
            {antiFraudTips.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-brand-500 font-bold">{i + 1}.</span>
                <span className="leading-snug">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

/* ── 小组件 ── */
const inputCls =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 mb-1 block">{label}</span>
      {children}
    </label>
  )
}
