import { useRef, useState } from 'react'
import Disclaimer from '../../components/Disclaimer'
import { addHelpRequest } from '../../lib/aid'

const NEED_TYPES = ['被困待救', '医疗急需', '物资短缺', '断药', '需转移', '失联寻人', '需取水', '临时住宿', '心理支援', '其他']
const SUPPLY_TAGS = ['饮用水', '食物', '药品', '婴儿奶粉/尿布', '被褥', '照明/充电', '卫生用品']
const VULN_TAGS = ['老人', '小孩', '孕产妇', '伤病员', '残障/失能']
const URGENCY = [
  { key: 'critical', label: '危急', desc: '被困/断药/无法呼吸，命悬一线', cls: 'bg-danger-600 text-white' },
  { key: 'high', label: '紧急', desc: '需尽快救助/就医/转移', cls: 'bg-warn-600 text-white' },
  { key: 'medium', label: '一般', desc: '当日内需要帮助', cls: 'bg-warn-100 text-warn-700' },
  { key: 'low', label: '普通', desc: '物资补充/咨询', cls: 'bg-safe-100 text-safe-700' },
]

const inputCls =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white'

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
}

export default function Sos({ onSubmitted }: { onSubmitted?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [rawText, setRawText] = useState('')
  const [urgency, setUrgency] = useState('high')
  const [needTypes, setNeedTypes] = useState<string[]>([])
  const [supplies, setSupplies] = useState<string[]>([])
  const [vuln, setVuln] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [people, setPeople] = useState('')
  const [canMove, setCanMove] = useState('unknown')
  const [isRare, setIsRare] = useState(false)
  const [rare, setRare] = useState({ disease: '', vitals: '', meds: '', dialysis: false, oxygen: false, coldChain: false })
  const [contact, setContact] = useState({ name: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  function onPickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setPhotos((p) => [...p, ...files.map((f) => URL.createObjectURL(f))].slice(0, 6))
  }

  function locate() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      () => setLocation((l) => (l ? l : '') + '（已获取手机定位，请补充文字位置）'),
      () => setErr('定位失败，请手动填写位置'),
    )
  }

  async function submit() {
    setErr('')
    if (!contact.phone.trim()) {
      setErr('请填写联系电话，救援人员需要回拨')
      return
    }
    if (!rawText.trim() && needTypes.length === 0 && photos.length === 0) {
      setErr('请至少拍一张照片、或描述一下情况、或选择需求类型')
      return
    }
    setBusy(true)
    // 组织成人类可读的求助详情
    const parts: string[] = []
    if (rawText.trim()) parts.push(rawText.trim())
    if (location.trim()) parts.push(`📍位置：${location.trim()}`)
    if (vuln.length) parts.push(`特殊人群：${vuln.join('、')}`)
    if (canMove !== 'unknown') parts.push(`能否行动：${canMove === 'yes' ? '能' : canMove === 'partial' ? '部分' : '不能'}`)
    if (supplies.length) parts.push(`需要物资：${supplies.join('、')}`)
    if (photos.length) parts.push(`（附 ${photos.length} 张照片，配置存储后上传）`)
    if (isRare) {
      const r: string[] = ['【罕见病/慢病】']
      if (rare.disease) r.push(`病种：${rare.disease}`)
      if (rare.vitals) r.push(`当前状态：${rare.vitals}`)
      if (rare.meds) r.push(`所需药物及剩余量：${rare.meds}`)
      const dep = [rare.dialysis && '需透析', rare.oxygen && '需供氧', rare.coldChain && '有冷藏药'].filter(Boolean)
      if (dep.length) r.push(dep.join('、'))
      parts.push(r.join('；'))
    }
    try {
      await addHelpRequest({
        type: needTypes[0] || '综合求助',
        name: contact.name.trim() || null,
        phone: contact.phone.trim(),
        city: null,
        people: people ? Number(people) : null,
        detail: parts.join('\n'),
        urgency,
        needs: [...needTypes, ...supplies],
        rareDisease: isRare,
      })
      setDone(true)
      onSubmitted?.()
    } catch {
      setErr('提交失败，请重试；情况危急请直接拨打 110/119/120')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="card p-5 text-center">
        <div className="text-4xl">✅</div>
        <p className="font-bold text-gray-900 mt-2">求助已提交</p>
        <p className="text-sm text-gray-500 mt-1">你的求助已进入求助墙等待对接。若情况危急，请同时拨打 110 / 119 / 120。</p>
        <button
          className="btn-ghost mt-4"
          onClick={() => {
            setDone(false)
            setPhotos([]); setRawText(''); setNeedTypes([]); setSupplies([]); setVuln([]); setLocation(''); setPeople(''); setIsRare(false); setContact({ name: '', phone: '' })
          }}
        >
          再发一条
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Disclaimer>
        🆘 <b>一步步告诉我们你的情况</b>：能拍照就拍照、能说一句是一句、说方言也没关系。命悬一线请<b>先拨 110/119/120</b>，再来这里登记。
      </Disclaimer>

      {/* 拍照 */}
      <section className="card p-4">
        <h3 className="section-title mb-2">① 拍照 / 上传现场照片</h3>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={onPickPhotos} />
        <div className="flex flex-wrap gap-2">
          {photos.map((src, i) => (
            <img key={i} src={src} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
          ))}
          {photos.length < 6 && (
            <button onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 text-3xl">
              ＋
            </button>
          )}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">拍下被困位置、水位、伤病、药盒等。照片将在配置存储后由救援方查看。</p>
      </section>

      {/* 一句话/粘贴 */}
      <section className="card p-4">
        <h3 className="section-title mb-2">② 说一句话 / 粘贴群消息</h3>
        <textarea
          className={inputCls}
          rows={3}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="例：我家在钦州久隆镇，一家四口被困二楼，水到一楼窗，老人没药了。也可直接粘贴微信群里的求助消息。"
        />
        <p className="text-[11px] text-gray-400 mt-1">接入 AI 后，这段话和照片会被自动整理成结构化求助（当前为人工对接）。</p>
      </section>

      {/* 紧急程度 */}
      <section className="card p-4">
        <h3 className="section-title mb-2">③ 有多紧急</h3>
        <div className="grid grid-cols-2 gap-2">
          {URGENCY.map((u) => (
            <button
              key={u.key}
              onClick={() => setUrgency(u.key)}
              className={`rounded-xl px-3 py-2 text-left border-2 transition ${urgency === u.key ? 'border-brand-500' : 'border-transparent'} ${u.cls}`}
            >
              <div className="font-bold text-sm">{u.label}</div>
              <div className="text-[11px] opacity-90">{u.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 需求类型 */}
      <section className="card p-4">
        <h3 className="section-title mb-2">④ 你最需要什么（可多选）</h3>
        <div className="flex flex-wrap gap-2">
          {NEED_TYPES.map((t) => (
            <button key={t} onClick={() => setNeedTypes((a) => toggle(a, t))}
              className={`px-3 py-1.5 rounded-full text-sm border ${needTypes.includes(t) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1.5">需要哪些物资</div>
          <div className="flex flex-wrap gap-2">
            {SUPPLY_TAGS.map((t) => (
              <button key={t} onClick={() => setSupplies((a) => toggle(a, t))}
                className={`px-3 py-1.5 rounded-full text-sm border ${supplies.includes(t) ? 'bg-warn-500 text-white border-warn-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 位置 & 人员 */}
      <section className="card p-4 space-y-3">
        <h3 className="section-title">⑤ 你在哪里 · 都有谁</h3>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">所在位置</span>
            <button onClick={locate} className="text-xs text-brand-600">📍 获取定位</button>
          </div>
          <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="市/县/乡镇/村/小区/楼层，越具体越好" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">人数</span>
          <input className={`${inputCls} w-24`} type="number" inputMode="numeric" value={people} onChange={(e) => setPeople(e.target.value)} placeholder="如 4" />
          <span className="text-xs text-gray-500 ml-2">能否行动</span>
          <select className={`${inputCls} flex-1`} value={canMove} onChange={(e) => setCanMove(e.target.value)}>
            <option value="unknown">不确定</option>
            <option value="yes">能</option>
            <option value="partial">部分</option>
            <option value="no">不能</option>
          </select>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1.5">特殊人群（可多选）</div>
          <div className="flex flex-wrap gap-2">
            {VULN_TAGS.map((t) => (
              <button key={t} onClick={() => setVuln((a) => toggle(a, t))}
                className={`px-3 py-1.5 rounded-full text-sm border ${vuln.includes(t) ? 'bg-danger-500 text-white border-danger-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 罕见病分支 */}
      <section className="card p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isRare} onChange={(e) => setIsRare(e.target.checked)} className="w-4 h-4 accent-brand-600" />
          <span className="section-title">⑥ 涉及罕见病 / 慢病患者（透析/胰岛素/供氧等）</span>
        </label>
        {isRare && (
          <div className="mt-3 space-y-2">
            <input className={inputCls} value={rare.disease} onChange={(e) => setRare({ ...rare, disease: e.target.value })} placeholder="病种（可拍药盒/病历代替打字）" />
            <input className={inputCls} value={rare.vitals} onChange={(e) => setRare({ ...rare, vitals: e.target.value })} placeholder="当前状态（意识/进食/抽搐/出血/呼吸/血糖等）" />
            <input className={inputCls} value={rare.meds} onChange={(e) => setRare({ ...rare, meds: e.target.value })} placeholder="所需药物及剩余量 / 还能撑几天（最关键）" />
            <div className="flex flex-wrap gap-2">
              {([['dialysis', '需透析'], ['oxygen', '需供氧'], ['coldChain', '有冷藏药']] as const).map(([k, label]) => (
                <button key={k} onClick={() => setRare({ ...rare, [k]: !rare[k] })}
                  className={`px-3 py-1.5 rounded-full text-sm border ${rare[k] ? 'bg-danger-600 text-white border-danger-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-warn-700 bg-warn-50 rounded-lg px-3 py-2">
              断药/断透析/断氧可能危及生命，请同时拨 120，并见「罕见病」页应急要点与援助热线。
            </p>
          </div>
        )}
      </section>

      {/* 联系方式 */}
      <section className="card p-4 space-y-2">
        <h3 className="section-title">⑦ 联系方式（救援回拨用）</h3>
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="称呼（选填）" />
          <input className={inputCls} type="tel" inputMode="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="联系电话 *" />
        </div>
      </section>

      {err && <p className="text-sm text-danger-600">{err}</p>}
      <button onClick={submit} disabled={busy} className="btn-danger w-full text-base disabled:opacity-60">
        {busy ? '提交中…' : '🆘 提交求助'}
      </button>
      <p className="text-[11px] text-gray-400 text-center pb-2">
        提交即进入求助墙等待对接。请勿泄露过多敏感信息；病历、精确定位等仅供救援方，不公开展示。
      </p>
    </div>
  )
}
