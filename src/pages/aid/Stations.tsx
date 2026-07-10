import { useState } from 'react'
import VerifyBadge from '../../components/VerifyBadge'
import NavButtons from '../../components/NavButtons'
import Disclaimer from '../../components/Disclaimer'
import { stations, officialStationLinks, stationTypeMeta } from '../../data/stations'

export default function Stations() {
  const cityList = ['全部', ...Array.from(new Set(stations.map((s) => s.city)))]
  const [city, setCity] = useState('全部')
  const list = city === '全部' ? stations : stations.filter((s) => s.city === city)

  return (
    <div className="space-y-4">
      <Disclaimer>
        ⚠️ 安置点随水位与转移进度变化极快，<b>任何名单都会过期</b>。请优先用下方官方查询入口，或拨 <b>12345</b> 核实是否开放；下列条目均标注核实等级与更新时间。
      </Disclaimer>

      {/* 官方查询入口（优先） */}
      <section>
        <h3 className="section-title mb-2">🔎 官方查询入口（最新最权威）</h3>
        <div className="space-y-2">
          {officialStationLinks.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="card p-3 flex items-center gap-3">
              <span className="text-xl">🏛️</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-brand-700">{l.name}</div>
                <div className="text-xs text-gray-500">{l.desc}</div>
              </div>
              <span className="text-gray-300">›</span>
            </a>
          ))}
        </div>
      </section>

      {/* 本轮已披露安置点 */}
      <section>
        <h3 className="section-title mb-2">📍 本轮"美莎克"已披露安置点</h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
          {cityList.map((cc) => (
            <button key={cc} onClick={() => setCity(cc)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm ${city === cc ? 'bg-brand-600 text-white font-semibold' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {cc}
            </button>
          ))}
        </div>

        <div className="space-y-3 mt-2">
          {list.map((s) => (
            <div key={s.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-gray-900 leading-snug">{s.name}</h4>
                <VerifyBadge level={s.verify} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="badge bg-gray-100 text-gray-600">📍{s.city}{s.district ? ` · ${s.district}` : ''}</span>
                {s.type.map((t) => (
                  <span key={t} className="badge bg-brand-50 text-brand-700">{stationTypeMeta[t].icon}{stationTypeMeta[t].label}</span>
                ))}
                {s.capacity && <span className="badge bg-gray-100 text-gray-600">约 {s.capacity} 人</span>}
              </div>
              {s.serviceScope && <p className="text-xs text-gray-600 mt-2">对象：{s.serviceScope}</p>}
              {s.supplies && s.supplies.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">物资：{s.supplies.join(' · ')}</p>
              )}
              {s.accessNote && <p className="text-[11px] text-warn-700 bg-warn-50 rounded-lg px-2.5 py-1.5 mt-2">ℹ️ {s.accessNote}</p>}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {s.contact?.phone && (
                    <a href={`tel:${s.contact.phone.replace(/\s/g, '')}`} className="btn-danger !py-1.5 !px-3 text-xs">
                      📞 {s.contact.is12345Fallback ? '拨12345确认' : s.contact.phone}
                    </a>
                  )}
                  {s.verify !== 'unverified' && (
                    <NavButtons name={s.name} city={s.city} lat={s.lat} lng={s.lng} hasCoords={s.geoStatus === 'official'} />
                  )}
                </div>
                <span className="text-[11px] text-gray-400">更新 {s.updatedAt}</span>
              </div>
              {s.sourceUrl && (
                <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="text-[11px] text-brand-500 mt-2 inline-block">
                  来源：{s.sourceLabel} ›
                </a>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
          说明：官方通稿多只公布场所名、未给门牌/坐标/电话，故地址留空、无坐标条目仅提供"按名称搜索"。请以官方现场公示与 12345 为准。
        </p>
      </section>
    </div>
  )
}
