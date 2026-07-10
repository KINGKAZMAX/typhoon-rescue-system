import { useState } from 'react'
import CallRow from '../../components/CallRow'
import VerifyBadge from '../../components/VerifyBadge'
import Disclaimer from '../../components/Disclaimer'
import { rareHotlines, rareOrgs, emergencyMeds, emergencyKit } from '../../data/rare'

export default function Rare() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Disclaimer>
        🧬 面向<b>罕见病/慢病患者家庭</b>的灾时"找钱/找药/找资源 + 用药/透析/供氧自救"。医疗要点源自 FDA/美CDC/NKF/中CDC，
        <b>剂量与个体化决策一律以主治医生为准</b>；危及生命立即拨 <b>120</b>。
      </Disclaimer>

      {/* 灾时热线 */}
      <section>
        <h3 className="section-title mb-1">☎️ 灾时援助热线</h3>
        <div className="card px-4 divide-y divide-gray-50">
          {rareHotlines.map((h) => (
            <CallRow key={h.number + h.name} entry={h} />
          ))}
        </div>
      </section>

      {/* 基金会/组织 */}
      <section>
        <h3 className="section-title mb-2">🤝 罕见病援助组织</h3>
        <div className="space-y-2">
          {rareOrgs.map((o) => (
            <div key={o.name} className="card p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{o.name}</span>
                <VerifyBadge level={o.verify} />
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-snug">{o.role}</p>
              <p className="text-xs text-gray-600 mt-1">{o.contact}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {o.phone && (
                  <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="btn-danger !py-1.5 !px-3 text-sm">📞 {o.phone}</a>
                )}
                {o.email && (
                  <a href={`mailto:${o.email}`} className="btn-ghost !py-1.5 !px-3 text-sm">✉️ 邮件</a>
                )}
                {o.url && (
                  <a href={o.url} target="_blank" rel="noreferrer" className="btn-ghost !py-1.5 !px-3 text-sm">🔗 官网</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 分病种应急要点 */}
      <section>
        <h3 className="section-title mb-2">🚑 分病种灾时应急要点</h3>
        <div className="space-y-2">
          {emergencyMeds.map((m) => {
            const isOpen = open === m.id
            return (
              <div key={m.id} className="card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : m.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                  <span className="text-2xl">{m.icon}</span>
                  <span className="flex-1 font-semibold text-gray-900 text-sm leading-snug">{m.condition}</span>
                  <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{m.guidance}</p>
                    <div className="mt-2 bg-danger-50 border border-danger-100 rounded-xl px-3 py-2">
                      <p className="text-xs text-danger-700 leading-snug">⚠️ {m.danger}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 我的应急包 */}
      <section>
        <h3 className="section-title mb-2">🎒 我的应急包清单</h3>
        <div className="card p-4">
          <ul className="space-y-2">
            {emergencyKit.map((k, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700 leading-snug">
                <span className="text-safe-500 shrink-0">✓</span>
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
