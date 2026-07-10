import { Link } from 'react-router-dom'
import { Wind, Phone, HeartHandshake, BookOpen, Camera, Siren, Megaphone, MapPin, ChevronRight, type LucideIcon } from 'lucide-react'
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
      <header className="pt-safe bg-gradient-to-b from-brand-700 to-brand-600 text-white px-4 pt-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-white/15">
            <Wind className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">广西台风救援平台</h1>
        </div>
        <p className="text-xs text-brand-100 mt-2">
          整合官方预报 · 救援电话 · 民间互助 · 灾后重建 · 更新于 {LAST_UPDATED}
        </p>
      </header>

      <div className="px-4 -mt-3.5 space-y-4">
        {/* 台风状态横幅 */}
        <Link to="/forecast" className="block card overflow-hidden">
          <div className={`${levelStyle[typhoon.guangxiLevel]} text-white px-4 py-2 text-sm font-medium flex items-center justify-between`}>
            <span className="flex items-center gap-1.5">
              <Megaphone className="h-4 w-4" strokeWidth={2.25} />
              广西台风态势
            </span>
            <span className="flex items-center gap-0.5 text-xs opacity-90">查看详情<ChevronRight className="h-3.5 w-3.5" /></span>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-slate-800 leading-relaxed">{typhoon.guangxiHeadline}</p>
            <p className="text-xs text-slate-500 mt-2">
              当前活跃：{typhoon.current.name}（{typhoon.current.intlId}）· {typhoon.current.category} —— {typhoon.current.affects}
            </p>
          </div>
        </Link>

        {/* 拍照求助大按钮 */}
        <Link
          to="/aid?tab=sos"
          className="flex items-center gap-3 bg-danger-600 active:bg-danger-700 text-white rounded-2xl px-4 py-4 shadow-soft active:scale-[0.99] transition"
        >
          <span className="grid place-items-center h-11 w-11 rounded-xl bg-white/15 shrink-0">
            <Camera className="h-6 w-6" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg leading-tight">拍照求助</div>
            <div className="text-xs text-danger-100 mt-0.5">拍张照 · 说一句 · 方言也行 —— 帮你把求助送到救援方</div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </Link>

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
                className="card flex flex-col items-center py-3.5 active:scale-[0.98] transition"
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
                <Link key={m.to} to={m.to} className="card p-4 active:scale-[0.98] transition">
                  <span className={`grid place-items-center w-11 h-11 rounded-xl ${m.tint}`}>
                    <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
                  </span>
                  <h3 className="font-semibold text-slate-900 mt-2.5">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
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
          <Link to="/forecast" className="block card p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">
                台风"{typhoon.recentImpact.name}"（{typhoon.recentImpact.intlId}）
              </span>
              <span className="text-xs text-slate-400">{typhoon.recentImpact.period}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {typhoon.recentImpact.stats.slice(0, 4).map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-xl px-3 py-2">
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
