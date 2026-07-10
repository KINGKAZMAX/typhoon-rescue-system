import { Link } from 'react-router-dom'
import { typhoon } from '../data/typhoon'
import { emergencyLines } from '../data/phones'
import { LAST_UPDATED } from '../lib/time'

const levelStyle: Record<string, string> = {
  none: 'bg-safe-600',
  watch: 'bg-warn-600',
  active: 'bg-danger-600',
}

const modules = [
  { to: '/forecast', icon: '🌀', title: '台风预报', desc: '实时路径·预警·官方源', color: 'bg-brand-50 text-brand-700' },
  { to: '/phones', icon: '📞', title: '救援电话', desc: '全国·广西各市·民间', color: 'bg-danger-50 text-danger-700' },
  { to: '/aid', icon: '🤝', title: '求助互助', desc: '发布求助·志愿报名', color: 'bg-warn-50 text-warn-700' },
  { to: '/guide', icon: '📖', title: '灾后指南', desc: '安全隐患·重建理赔', color: 'bg-safe-50 text-safe-700' },
]

export default function Home() {
  return (
    <div>
      {/* 顶部品牌区 */}
      <header className="pt-safe bg-gradient-to-b from-brand-700 to-brand-600 text-white px-4 pt-5 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌀</span>
          <h1 className="text-xl font-bold">广西台风救援平台</h1>
        </div>
        <p className="text-xs text-brand-100 mt-1">
          整合官方预报 · 救援电话 · 民间互助 · 灾后重建 · 更新于 {LAST_UPDATED}
        </p>
      </header>

      <div className="px-4 -mt-3 space-y-4">
        {/* 台风状态横幅 */}
        <Link to="/forecast" className="block card overflow-hidden">
          <div className={`${levelStyle[typhoon.guangxiLevel]} text-white px-4 py-2 text-sm font-semibold flex items-center justify-between`}>
            <span>📢 广西台风态势</span>
            <span className="text-xs opacity-90">点击查看详情 ›</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-gray-800 leading-relaxed">{typhoon.guangxiHeadline}</p>
            <p className="text-xs text-gray-500 mt-2">
              当前活跃：{typhoon.current.name}（{typhoon.current.intlId}）· {typhoon.current.category} —— {typhoon.current.affects}
            </p>
          </div>
        </Link>

        {/* 拍照求助大按钮 */}
        <Link
          to="/aid?tab=sos"
          className="block bg-danger-600 active:bg-danger-700 text-white rounded-2xl px-4 py-4 shadow-sm active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🆘</span>
            <div className="flex-1">
              <div className="font-bold text-lg leading-tight">拍照求助</div>
              <div className="text-xs text-danger-100 mt-0.5">拍张照 · 说一句 · 方言也行 —— 帮你把求助送到救援方</div>
            </div>
            <span className="text-xl">›</span>
          </div>
        </Link>

        {/* 紧急拨号 */}
        <section>
          <h2 className="section-title mb-2">🚨 紧急拨号</h2>
          <div className="grid grid-cols-3 gap-2">
            {emergencyLines.slice(0, 3).map((e) => (
              <a
                key={e.number}
                href={`tel:${e.number}`}
                className="card flex flex-col items-center py-3 active:scale-[0.98] transition"
              >
                <span className="text-2xl font-extrabold text-danger-600">{e.number}</span>
                <span className="text-xs text-gray-600 mt-0.5">{e.name}</span>
              </a>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 text-center">
            不确定打哪个时，优先拨 110。更多专线见「救援电话」
          </p>
        </section>

        {/* 功能模块 */}
        <section>
          <h2 className="section-title mb-2">功能模块</h2>
          <div className="grid grid-cols-2 gap-3">
            {modules.map((m) => (
              <Link key={m.to} to={m.to} className="card p-4 active:scale-[0.98] transition">
                <div className={`w-11 h-11 rounded-xl ${m.color} flex items-center justify-center text-2xl`}>
                  {m.icon}
                </div>
                <h3 className="font-bold text-gray-900 mt-2">{m.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 近期灾情速览 */}
        <section>
          <h2 className="section-title mb-2">📍 近期灾情速览</h2>
          <Link to="/forecast" className="block card p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">
                台风"{typhoon.recentImpact.name}"（{typhoon.recentImpact.intlId}）
              </span>
              <span className="text-xs text-gray-400">{typhoon.recentImpact.period}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {typhoon.recentImpact.stats.slice(0, 4).map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-[11px] text-gray-500">{s.label}</div>
                  <div className="text-sm font-bold text-gray-900">{s.value}</div>
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
        <footer className="text-[11px] text-gray-400 leading-relaxed pb-4 pt-2">
          <p>
            本平台为公益信息聚合，灾情/伤亡数据以广西应急管理厅等官方通报为准；电话号码标注核实等级，
            拨打前建议以当地官方公示复核。紧急情况请直接拨打 110 / 119 / 120。
          </p>
        </footer>
      </div>
    </div>
  )
}
