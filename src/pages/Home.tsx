import { Link } from 'react-router-dom'
import { Wind, Phone, HeartHandshake, BookOpen, Camera, Siren, Megaphone, MapPin, ChevronRight, LifeBuoy, ShieldCheck, type LucideIcon } from 'lucide-react'
import { typhoon } from '../data/typhoon'
import { emergencyLines } from '../data/phones'
import { LAST_UPDATED } from '../lib/time'

const levelStyle: Record<string, string> = {
  none: 'bg-safe-600',
  watch: 'bg-warn-600',
  active: 'bg-danger-600',
}

const modules: { to: string; icon: LucideIcon; title: string; desc: string; tint: string }[] = [
  { to: '/forecast', icon: Wind, title: '台风预报', desc: '实时路径 · 预警 · 官方源', tint: 'bg-brand-50 text-brand-600' },
  { to: '/phones', icon: Phone, title: '救援电话', desc: '全国 · 广西各市 · 民间', tint: 'bg-danger-50 text-danger-600' },
  { to: '/aid', icon: HeartHandshake, title: '求助互助', desc: '发布求助 · 志愿报名', tint: 'bg-warn-50 text-warn-600' },
  { to: '/guide', icon: BookOpen, title: '灾后指南', desc: '安全隐患 · 重建理赔', tint: 'bg-safe-50 text-safe-600' },
]

export default function Home() {
  return (
    <div>
      {/* 顶部品牌区 */}
      <header className="pt-safe bg-gradient-to-b from-brand-800 via-brand-700 to-brand-700 text-white px-4 pt-4 pb-6 rounded-b-[1.35rem] shadow-header">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-white/12 ring-1 ring-white/15 shrink-0">
              <Wind className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-brand-100/90">广西应急信息服务</div>
              <h1 className="text-xl font-bold tracking-tight leading-tight mt-0.5">广西台风救援平台</h1>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold text-brand-50 ring-1 ring-white/15">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.25} />
            公益聚合
          </span>
        </div>
        <p className="text-xs text-brand-100 mt-3 leading-relaxed">
          整合官方预报 · 救援电话 · 民间互助 · 灾后重建 · 更新于 {LAST_UPDATED}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] font-semibold">
          <span className="rounded-lg bg-white/10 px-2.5 py-2 text-center ring-1 ring-white/10">官方源优先</span>
          <span className="rounded-lg bg-white/10 px-2.5 py-2 text-center ring-1 ring-white/10">一键拨号</span>
          <span className="rounded-lg bg-white/10 px-2.5 py-2 text-center ring-1 ring-white/10">移动端优先</span>
        </div>
      </header>

      <div className="px-4 -mt-3 space-y-4">
        {/* 台风状态横幅 */}
        <Link to="/forecast" className="block card interactive-card overflow-hidden">
          <div className={`${levelStyle[typhoon.guangxiLevel]} text-white px-4 py-2 text-sm font-semibold flex items-center justify-between`}>
            <span className="flex items-center gap-1.5">
              <Megaphone className="h-4 w-4" strokeWidth={2.25} />
              广西台风态势
            </span>
            <span className="flex items-center gap-0.5 text-xs opacity-95">查看详情<ChevronRight className="h-3.5 w-3.5" /></span>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-sm font-medium text-slate-800 leading-relaxed">{typhoon.guangxiHeadline}</p>
            <p className="text-xs text-slate-500 mt-2">
              当前活跃：{typhoon.current.name}（{typhoon.current.intlId}）· {typhoon.current.category} —— {typhoon.current.affects}
            </p>
          </div>
        </Link>

        {/* 两种情况分流：正在受灾 / 灾后救助（按你的处境直达对应功能） */}
        <section className="space-y-3">
          <h2 className="section-title">你现在是哪种情况？按处境直达</h2>

          {/* A. 正在受灾 · 紧急求救 */}
          <div className="card p-4 border-l-4 border-danger-600">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center h-10 w-10 rounded-lg bg-danger-50 text-danger-600 shrink-0">
                <Siren className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 leading-tight">正在受灾 · 紧急求救</h3>
                <p className="text-xs text-slate-500 mt-0.5">被困 / 受伤 / 断药 / 危房，需要立即救援</p>
              </div>
            </div>
            <Link to="/aid?tab=sos" className="btn-danger w-full mt-3">
              <Camera className="h-4 w-4" strokeWidth={2.25} />
              拍照求助 / 方言也行
            </Link>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <a href="tel:110" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-danger-100 text-danger-700 bg-danger-50 active:bg-danger-100 transition">拨 110 报警</a>
              <Link to="/aid?tab=safe" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-white active:bg-slate-50 transition">报平安 / 寻人</Link>
              <Link to="/aid?tab=rare" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-white active:bg-slate-50 transition">断药 / 断透析 / 断氧</Link>
            </div>
          </div>

          {/* B. 已脱险 · 灾后救助与重建 */}
          <div className="card p-4 border-l-4 border-brand-600">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center h-10 w-10 rounded-lg bg-brand-50 text-brand-600 shrink-0">
                <LifeBuoy className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 leading-tight">已脱险 · 灾后救助与重建</h3>
                <p className="text-xs text-slate-500 mt-0.5">找安置/物资 · 报平安 · 罕见病用药/特食 · 重建理赔</p>
              </div>
            </div>
            <Link to="/aid?tab=stations" className="btn-brand w-full mt-3">
              <MapPin className="h-4 w-4" strokeWidth={2.25} />
              找安置点 / 物资点
            </Link>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <Link to="/guide" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-white active:bg-slate-50 transition">灾后安全指南</Link>
              <Link to="/aid?tab=rare" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-white active:bg-slate-50 transition">罕见病 / 特食</Link>
              <Link to="/aid?tab=donate" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-white active:bg-slate-50 transition">我要捐赠</Link>
            </div>
          </div>
        </section>

        {/* 紧急拨号 */}
        <section>
          <h2 className="section-title mb-2">
            <Siren className="h-4 w-4 text-danger-600" strokeWidth={2.25} />
            紧急拨号
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {emergencyLines.slice(0, 3).map((e) => (
              <a
                key={e.number}
                href={`tel:${e.number}`}
                className="card interactive-card flex flex-col items-center py-3.5"
              >
                <span className="text-2xl font-bold text-danger-600 tracking-tight">{e.number}</span>
                <span className="text-xs text-slate-500 mt-1">{e.name}</span>
              </a>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            不确定打哪个时，优先拨 110。更多专线见「救援电话」
          </p>
        </section>

        {/* 功能模块 */}
        <section>
          <h2 className="section-title mb-2">功能模块</h2>
          <div className="grid grid-cols-2 gap-3">
            {modules.map((m) => {
              const Icon = m.icon
              return (
                <Link key={m.to} to={m.to} className="card interactive-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`grid place-items-center w-10 h-10 rounded-lg ${m.tint}`}>
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 mt-1" strokeWidth={2.25} />
                  </div>
                  <h3 className="font-bold text-slate-900 mt-3">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{m.desc}</p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* 近期灾情速览 */}
        <section>
          <h2 className="section-title mb-2">
            <MapPin className="h-4 w-4 text-slate-500" strokeWidth={2.25} />
            近期灾情速览
          </h2>
          <Link to="/forecast" className="block card interactive-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">
                台风"{typhoon.recentImpact.name}"（{typhoon.recentImpact.intlId}）
              </span>
              <span className="text-xs text-slate-400">{typhoon.recentImpact.period}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {typhoon.recentImpact.stats.slice(0, 4).map((s) => (
                <div key={s.label} className="official-band rounded-lg px-3 py-2">
                  <div className="text-[11px] text-slate-500">{s.label}</div>
                  <div className="text-sm font-semibold text-slate-900">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {typhoon.recentImpact.hitAreas.map((a) => (
                <span key={a} className="badge bg-danger-50 text-danger-700">重灾 · {a}</span>
              ))}
            </div>
          </Link>
        </section>

        {/* 免责声明 */}
        <footer className="text-[11px] text-slate-400 leading-relaxed pb-4 pt-2">
          <p>
            本平台为公益信息聚合，灾情/伤亡数据以广西应急管理厅等官方通报为准；电话号码标注核实等级，
            拨打前建议以当地官方公示复核。紧急情况请直接拨打 110 / 119 / 120。
          </p>
        </footer>
      </div>
    </div>
  )
}
