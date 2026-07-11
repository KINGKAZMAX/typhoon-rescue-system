import { useRef, useState } from 'react'
import { LifeBuoy, Camera, Sparkles, CheckCircle2, MessageSquareText, AlertTriangle, ListChecks, MapPin, Dna, Phone, Plus } from 'lucide-react'
import Disclaimer from '../../components/Disclaimer'
import { addHelpRequest } from '../../lib/aid'
import { isAiConfigured, analyzeSos, fileToDataUrl } from '../../lib/ai'

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
  'field'

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
}

export default function Sos({ onSubmitted }: { onSubmitted?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [aiBusy, setAiBusy] = useState(false)
  const [aiNote, setAiNote] = useState('')
  const [rawText, setRawText] = useState('')
  const [urgency, setUrgency] = useState('high')
  const [needTypes, setNeedTypes] = useState<string[]>([])
  const [supplies, setSupplies] = useState<string[]>([])
  const [vuln, setVuln] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [people, setPeople] = useState('')
  const [canMove, setCanMove] = useState('unknown')
  const [isRare, setIsRare] = useState(false)
  const [rare, setRare] = useState({ disease: '', vitals: '', meds: '', dialysis: false, oxygen: false, coldChain: false, specialFood: false })
  const [contact, setContact] = useState({ name: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  function onPickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setPhotos((p) => [...p, ...files.map((f) => URL.createObjectURL(f))].slice(0, 6))
    setPhotoFiles((p) => [...p, ...files].slice(0, 6))
  }

  async function runAi() {
    setErr('')
    setAiNote('')
    setAiBusy(true)
    try {
      const images = await Promise.all(photoFiles.slice(0, 4).map(fileToDataUrl))
      const d = await analyzeSos({ text: rawText, images })
      if (d.urgency) setUrgency(d.urgency)
      if (d.needTypes?.length) setNeedTypes(d.needTypes)
      if (d.supplies?.length) setSupplies(d.supplies)
      if (d.vuln?.length) setVuln(d.vuln)
      if (d.location) setLocation((l) => l || d.location!)
      if (d.people != null) setPeople(String(d.people))
      if (d.canMove) setCanMove(d.canMove)
      if (d.isRare) {
        setIsRare(true)
        if (d.rare) {
          setRare((r) => ({
            disease: d.rare!.disease || r.disease,
            vitals: d.rare!.vitals || r.vitals,
            meds: d.rare!.meds || r.meds,
            dialysis: d.rare!.dialysis ?? r.dialysis,
            oxygen: d.rare!.oxygen ?? r.oxygen,
            coldChain: d.rare!.coldChain ?? r.coldChain,
            specialFood: d.rare!.specialFood ?? r.specialFood,
          }))
        }
      }
      setAiNote(
        d.uncertain?.length
          ? `AI 已预填。不确定项请核对：${d.uncertain.join('、')}`
          : 'AI 已预填各项，请核对后提交。',
      )
    } catch (e) {
      setErr('AI 整理失败，请手动填写；' + (e instanceof Error ? e.message : ''))
    } finally {
      setAiBusy(false)
    }
  }

  function locate() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocation((l) => (l.includes('手机定位') ? l : `${l ? l + ' ' : ''}（已获取手机定位坐标，请补充文字位置）`))
      },
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
    // 公开摘要（脱敏，进公开求助墙）——只含需求/人群/物资等非敏感结构化信息
    const pub: string[] = []
    if (needTypes.length) pub.push(`需求：${needTypes.join('、')}`)
    if (vuln.length) pub.push(`特殊人群：${vuln.join('、')}`)
    if (canMove !== 'unknown') pub.push(`能否行动：${canMove === 'yes' ? '能' : canMove === 'partial' ? '部分' : '不能'}`)
    if (supplies.length) pub.push(`需要物资：${supplies.join('、')}`)
    if (isRare) pub.push('涉及罕见病/慢病患者')
    if (photos.length) pub.push(`附 ${photos.length} 张照片`)
    pub.push('（精确位置/病历/完整电话仅救援方可见）')

    // 私有详情（仅救援方 service_role 可见，不进公开墙）——含原话、精确位置、坐标、病历
    const priv: string[] = []
    if (rawText.trim()) priv.push(`原始描述：${rawText.trim()}`)
    if (location.trim()) priv.push(`精确位置：${location.trim()}`)
    if (coords) priv.push(`定位坐标：${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`)
    if (isRare) {
      const r: string[] = ['【罕见病/慢病】']
      if (rare.disease) r.push(`病种：${rare.disease}`)
      if (rare.vitals) r.push(`当前状态：${rare.vitals}`)
      if (rare.meds) r.push(`所需药物及剩余量：${rare.meds}`)
      const dep = [rare.dialysis && '需透析', rare.oxygen && '需供氧', rare.specialFood && '需特殊医学配方食品(特食)', rare.coldChain && '有冷藏药'].filter(Boolean)
      if (dep.length) r.push(dep.join('、'))
      priv.push(r.join('；'))
    }
    try {
      await addHelpRequest({
        type: needTypes[0] || '综合求助',
        name: contact.name.trim() || null,
        phone: contact.phone.trim(),
        city: null,
        people: people ? Number(people) : null,
        detail: pub.join('\n'),
        privateDetail: priv.length ? priv.join('\n') : null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
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
        <CheckCircle2 className="h-11 w-11 text-safe-600 mx-auto" strokeWidth={2.25} />
        <p className="font-bold text-slate-900 mt-2">求助已提交</p>
        <p className="text-sm text-slate-500 mt-1">你的求助已进入求助墙等待对接。若情况危急，请同时拨打 110 / 119 / 120。</p>
        <button
          className="btn-ghost mt-4"
          onClick={() => {
            setDone(false)
            setPhotos([]); setPhotoFiles([]); setAiNote(''); setRawText(''); setNeedTypes([]); setSupplies([]); setVuln([]); setLocation(''); setCoords(null); setPeople(''); setIsRare(false); setContact({ name: '', phone: '' })
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
        <LifeBuoy className="inline h-3.5 w-3.5 -mt-0.5 mr-1 text-danger-600" strokeWidth={2.25} />
        <b>一步步告诉我们你的情况</b>：能拍照就拍照、能说一句是一句、说方言也没关系。命悬一线请<b>先拨 110/119/120</b>，再来这里登记。
      </Disclaimer>

      {/* 拍照 */}
      <section className="card p-4">
        <h3 className="section-title mb-2">
          <span className="grid place-items-center h-5 w-5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold shrink-0">1</span>
          <Camera className="h-4 w-4 text-brand-600" strokeWidth={2.25} />拍照 / 上传现场照片
        </h3>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={onPickPhotos} />
        <div className="flex flex-wrap gap-2">
          {photos.map((src, i) => (
            <img key={i} src={src} className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
          ))}
          {photos.length < 6 && (
            <button onClick={() => fileRef.current?.click()} className="grid place-items-center w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition active:bg-slate-100">
              <Plus className="h-7 w-7" strokeWidth={2.25} />
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">拍下被困位置、水位、伤病、药盒等。照片将在配置存储后由救援方查看。</p>
      </section>

      {/* 一句话/粘贴 */}
      <section className="card p-4">
        <h3 className="section-title mb-2">
          <span className="grid place-items-center h-5 w-5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold shrink-0">2</span>
          <MessageSquareText className="h-4 w-4 text-brand-600" strokeWidth={2.25} />说一句话 / 粘贴群消息
        </h3>
        <textarea
          className={inputCls}
          rows={3}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="例：我家在钦州久隆镇，一家四口被困二楼，水到一楼窗，老人没药了。也可直接粘贴微信群里的求助消息。"
        />
        {isAiConfigured ? (
          <button onClick={runAi} disabled={aiBusy} className="btn-brand w-full mt-2 disabled:opacity-60">
            <Sparkles className="h-4 w-4" strokeWidth={2.25} />
            {aiBusy ? 'AI 整理中…' : '用 AI 整理照片和描述'}
          </button>
        ) : (
          <p className="text-[11px] text-slate-500 mt-1">照片和这段话会由救援方查看（接入 AI 后可一键自动整理成结构化求助）。</p>
        )}
        {aiNote && (
          <p className="flex items-start gap-1.5 text-xs text-safe-700 bg-safe-50 rounded-lg px-3 py-2 mt-2">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" strokeWidth={2.25} />
            <span>{aiNote}</span>
          </p>
        )}
      </section>

      {/* 紧急程度 */}
      <section className="card p-4">
        <h3 className="section-title mb-2">
          <span className="grid place-items-center h-5 w-5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold shrink-0">3</span>
          <AlertTriangle className="h-4 w-4 text-warn-600" strokeWidth={2.25} />有多紧急
        </h3>
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
        <h3 className="section-title mb-2">
          <span className="grid place-items-center h-5 w-5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold shrink-0">4</span>
          <ListChecks className="h-4 w-4 text-brand-600" strokeWidth={2.25} />你最需要什么（可多选）
        </h3>
        <div className="flex flex-wrap gap-2">
          {NEED_TYPES.map((t) => (
            <button key={t} onClick={() => setNeedTypes((a) => toggle(a, t))}
              className={`px-3 py-1.5 rounded-full text-sm border ${needTypes.includes(t) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <div className="text-xs text-slate-500 mb-1.5">需要哪些物资</div>
          <div className="flex flex-wrap gap-2">
            {SUPPLY_TAGS.map((t) => (
              <button key={t} onClick={() => setSupplies((a) => toggle(a, t))}
                className={`px-3 py-1.5 rounded-full text-sm border ${supplies.includes(t) ? 'bg-warn-500 text-white border-warn-500' : 'bg-white text-slate-600 border-slate-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 位置 & 人员 */}
      <section className="card p-4 space-y-3">
        <h3 className="section-title">
          <span className="grid place-items-center h-5 w-5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold shrink-0">5</span>
          <MapPin className="h-4 w-4 text-brand-600" strokeWidth={2.25} />你在哪里 · 都有谁
        </h3>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">所在位置</span>
            <button onClick={locate} className="flex items-center gap-1 text-xs text-brand-600">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2.25} />获取定位
            </button>
          </div>
          <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="市/县/乡镇/村/小区/楼层，越具体越好" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">人数</span>
          <input className={`${inputCls} w-24`} type="number" inputMode="numeric" value={people} onChange={(e) => setPeople(e.target.value)} placeholder="如 4" />
          <span className="text-xs text-slate-500 ml-2">能否行动</span>
          <select className={`${inputCls} flex-1`} value={canMove} onChange={(e) => setCanMove(e.target.value)}>
            <option value="unknown">不确定</option>
            <option value="yes">能</option>
            <option value="partial">部分</option>
            <option value="no">不能</option>
          </select>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1.5">特殊人群（可多选）</div>
          <div className="flex flex-wrap gap-2">
            {VULN_TAGS.map((t) => (
              <button key={t} onClick={() => setVuln((a) => toggle(a, t))}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition active:scale-[0.98] ${vuln.includes(t) ? 'bg-danger-500 text-white border-danger-500' : 'bg-white text-slate-600 border-slate-200'}`}>
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
          <span className="section-title">
            <span className="grid place-items-center h-5 w-5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold shrink-0">6</span>
            <Dna className="h-4 w-4 text-brand-600" strokeWidth={2.25} />涉及罕见病 / 慢病患者（药物/透析/供氧/特食等）
          </span>
        </label>
        {isRare && (
          <div className="mt-3 space-y-2">
            <input className={inputCls} value={rare.disease} onChange={(e) => setRare({ ...rare, disease: e.target.value })} placeholder="病种（可拍药盒/病历代替打字）" />
            <input className={inputCls} value={rare.vitals} onChange={(e) => setRare({ ...rare, vitals: e.target.value })} placeholder="当前状态（意识/进食/抽搐/出血/呼吸/血糖等）" />
            <input className={inputCls} value={rare.meds} onChange={(e) => setRare({ ...rare, meds: e.target.value })} placeholder="需要什么疾病相关支持：药物/特食名称及剩余量、还能撑几天（最关键）" />
            <div className="flex flex-wrap gap-2">
              {([['dialysis', '需透析'], ['oxygen', '需供氧'], ['specialFood', '需特食'], ['coldChain', '有冷藏药']] as const).map(([k, label]) => (
                <button key={k} onClick={() => setRare({ ...rare, [k]: !rare[k] })}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition active:scale-[0.98] ${rare[k] ? 'bg-danger-600 text-white border-danger-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="flex items-start gap-1.5 text-sm text-warn-700 bg-warn-50 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={2.25} />
              <span><b>断药 / 断透析 / 断氧可能危及生命</b>，请同时拨 120，并见「罕见病」页应急要点与援助热线。</span>
            </p>
          </div>
        )}
      </section>

      {/* 联系方式 */}
      <section className="card p-4 space-y-2">
        <h3 className="section-title">
          <span className="grid place-items-center h-5 w-5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold shrink-0">7</span>
          <Phone className="h-4 w-4 text-brand-600" strokeWidth={2.25} />联系方式（救援回拨用）
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="称呼（选填）" />
          <input className={inputCls} type="tel" inputMode="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="联系电话 *" />
        </div>
      </section>

      {err && <p className="text-sm text-danger-600">{err}</p>}
      <button onClick={submit} disabled={busy} className="btn-danger w-full text-base disabled:opacity-60">
        {busy ? '提交中…' : (<><LifeBuoy className="h-4 w-4" strokeWidth={2.25} />提交求助</>)}
      </button>
      <p className="text-[11px] text-slate-500 text-center pb-2">
        提交即进入求助墙等待对接。公开求助墙只显示脱敏摘要；你的原始描述、精确位置、病历与完整电话仅救援方（认领后）可见，不公开展示。
      </p>
    </div>
  )
}
