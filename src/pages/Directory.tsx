import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import CallRow from '../components/CallRow'
import VerifyBadge from '../components/VerifyBadge'
import Disclaimer from '../components/Disclaimer'
import {
  emergencyLines,
  disasterLines,
  provincialLines,
  cities,
  civilOrgs,
} from '../data/phones'

export default function Directory() {
  const [cityIdx, setCityIdx] = useState(0)
  const city = cities[cityIdx]

  return (
    <div>
      <PageHeader title="📞 救援与求助电话" subtitle="全国主线 · 灾害专线 · 广西各市 · 民间力量" />

      <div className="px-4 py-4 space-y-5">
        <Disclaimer>
          号码标注核实等级：<b>✓已核实</b>=权威来源确认；<b>官方媒体核实</b>=建议拨前再确认；
          <b>待核实</b>的城市号码未收录，请拨 <b>12345</b> 兜底转接。
          生命危急永远优先拨 <b>110 / 119 / 120</b>。
        </Disclaimer>

        {/* 紧急主线 */}
        <section>
          <h2 className="section-title mb-1">🚨 全国紧急主线</h2>
          <div className="card px-4 divide-y divide-gray-50">
            {emergencyLines.map((e) => (
              <CallRow key={e.number} entry={e} />
            ))}
          </div>
        </section>

        {/* 灾害专线 */}
        <section>
          <h2 className="section-title mb-1">🌊 灾害相关专线</h2>
          <div className="card px-4 divide-y divide-gray-50">
            {disasterLines.map((e) => (
              <CallRow key={e.number} entry={e} />
            ))}
          </div>
        </section>

        {/* 广西 & 民间救援主线 */}
        <section>
          <h2 className="section-title mb-1">🛟 广西 & 民间救援</h2>
          <div className="card px-4 divide-y divide-gray-50">
            {provincialLines.map((e) => (
              <CallRow key={e.number} entry={e} />
            ))}
          </div>
        </section>

        {/* 广西各市 */}
        <section>
          <h2 className="section-title mb-2">🏙️ 广西各市电话</h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
            {cities.map((cc, i) => (
              <button
                key={cc.name}
                onClick={() => setCityIdx(i)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm transition ${
                  i === cityIdx
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {cc.name}
              </button>
            ))}
          </div>
          <div className="card px-4 divide-y divide-gray-50 mt-2">
            {city.entries.map((e) => (
              <CallRow key={`${city.name}-${e.number}-${e.name}`} entry={e} />
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {city.name}市其余（燃气/供水/防汛值班等）号码未逐一核实，请拨 {city.areaCode}-12345 转接；
            燃气泄漏并拨 119，触电/停电险情并拨 95598。
          </p>
        </section>

        {/* 民间救援组织 */}
        <section>
          <h2 className="section-title mb-2">🤝 民间 / 公益救援组织</h2>
          <div className="space-y-2">
            {civilOrgs.map((o) => (
              <div key={o.name} className="card p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{o.name}</span>
                  <VerifyBadge level={o.verify} />
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{o.desc}</p>
                <div className="flex items-center gap-2 mt-2">
                  {o.phone && (
                    <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="btn-danger !py-1.5 !px-3 text-sm">
                      📞 {o.phone}
                    </a>
                  )}
                  {o.url && (
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost !py-1.5 !px-3 text-sm"
                    >
                      🔗 官网/入口
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
