import PageHeader from '../components/PageHeader'
import { typhoon } from '../data/typhoon'

const borderByLevel: Record<string, string> = {
  none: 'border-safe-500',
  watch: 'border-warn-500',
  active: 'border-danger-600',
}

export default function Forecast() {
  const t = typhoon
  return (
    <div>
      <PageHeader title="🌀 台风预报与预警" subtitle={`更新于 ${t.updatedAt} · 数据整合自中央气象台等官方源`} />

      <div className="px-4 py-4 space-y-4">
        {/* 广西结论 */}
        <div className={`card p-4 border-l-4 ${borderByLevel[t.guangxiLevel] ?? 'border-gray-300'}`}>
          <div className="text-xs text-gray-500 mb-1">对广西的当前结论</div>
          <p className="text-sm font-semibold text-gray-900 leading-relaxed">{t.guangxiHeadline}</p>
        </div>

        {/* 当前活跃台风 */}
        <section className="card p-4">
          <h2 className="section-title">当前活跃台风</h2>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-brand-700">{t.current.name}</span>
            <span className="text-sm text-gray-500">
              {t.current.enName} · {t.current.intlId}
            </span>
          </div>
          <div className="mt-1 badge bg-warn-100 text-warn-700">{t.current.category}</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-gray-500 text-xs">状态</dt>
              <dd className="text-gray-900">{t.current.status}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs">预报</dt>
              <dd className="text-gray-900">{t.current.forecast}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs">影响范围</dt>
              <dd className="text-gray-900 font-medium">{t.current.affects}</dd>
            </div>
          </dl>
        </section>

        {/* 近期重创广西的台风 */}
        <section className="card p-4">
          <h2 className="section-title">
            近期影响广西：台风"{t.recentImpact.name}"
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{t.recentImpact.period}（{t.recentImpact.intlId}）</p>
          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{t.recentImpact.summary}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {t.recentImpact.stats.map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-[11px] text-gray-500">{s.label}</div>
                <div className="text-sm font-bold text-gray-900">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {t.recentImpact.hitAreas.map((a) => (
              <span key={a} className="badge bg-danger-50 text-danger-700">重灾 · {a}</span>
            ))}
          </div>
          <p className="text-[11px] text-warn-700 bg-warn-50 rounded-lg px-3 py-2 mt-3">
            ⚠️ 伤亡与受灾数据各来源不一，请以广西应急管理厅官方通报为准。
          </p>
        </section>

        {/* 预警信号 */}
        <section className="card p-4">
          <h2 className="section-title mb-3">台风预警信号含义</h2>
          <div className="space-y-2">
            {t.warningSignals.map((w) => (
              <div key={w.level} className="flex items-start gap-3">
                <span className={`${w.color} text-white text-xs font-bold rounded px-2 py-1 shrink-0 w-14 text-center`}>
                  {w.level}
                </span>
                <p className="text-xs text-gray-600 leading-snug">{w.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 时间线 */}
        <section className="card p-4">
          <h2 className="section-title mb-3">关键时间线</h2>
          <ol className="relative border-l-2 border-brand-100 ml-2 space-y-4">
            {t.timeline.map((item, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-brand-500 border-2 border-white" />
                <div className="text-xs font-bold text-brand-700">{item.date}</div>
                <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 官方数据源 */}
        <section className="card p-4">
          <h2 className="section-title mb-1">官方权威数据源</h2>
          <p className="text-xs text-gray-400 mb-3">点击跳转官方页面查看实时台风路径与预警</p>
          <div className="space-y-2">
            {t.officialSources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-lg">🔗</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-brand-700">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.desc}</div>
                </div>
                <span className="text-gray-300">›</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
