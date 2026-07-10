import { useState } from 'react'
import { BookOpen, Zap, Compass, Check, AlertTriangle, ChevronDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { guideSections, quickChecklist } from '../data/guide'

export default function Guide() {
  const [open, setOpen] = useState<string | null>(guideSections[0].id)

  return (
    <div>
      <PageHeader icon={BookOpen} title="灾后安全与重建指南" subtitle="返家安全 · 用电燃气 · 防疫清淤 · 重建理赔" />

      <div className="px-4 py-4 space-y-4">
        {/* 一页速查 */}
        <section className="card p-4 bg-brand-50 border-brand-100">
          <h2 className="section-title mb-2"><Zap className="h-4 w-4 text-brand-600" strokeWidth={2.25} />一页速查清单</h2>
          <ul className="space-y-2">
            {quickChecklist.map((q, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-700 leading-snug">
                <q.icon className="h-4 w-4 text-slate-700 shrink-0" strokeWidth={2.25} />
                <span>{q.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 分主题手风琴 */}
        <section className="space-y-2">
          {guideSections.map((s) => {
            const isOpen = open === s.id
            return (
              <div key={s.id} className="card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <s.icon className="h-6 w-6 text-slate-700 shrink-0" strokeWidth={2.25} />
                  <span className="flex-1 font-bold text-slate-900">{s.title}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.25} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="flex gap-1.5 text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2 leading-relaxed">
                      <Compass className="h-4 w-4 shrink-0 mt-px" strokeWidth={2.25} />
                      <span>{s.principle}</span>
                    </p>
                    <ul className="mt-3 space-y-2">
                      {s.items.map((it, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-700 leading-snug">
                          <Check className="h-4 w-4 text-safe-500 shrink-0 mt-0.5" strokeWidth={2.25} />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                    {s.dangers.length > 0 && (
                      <div className="mt-3 bg-danger-50 border border-danger-100 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-danger-700 mb-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />高危提示（可致命）</div>
                        <ul className="space-y-1.5">
                          {s.dangers.map((d, i) => (
                            <li key={i} className="text-xs text-danger-700 leading-snug flex gap-1.5">
                              <span className="shrink-0">•</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </section>

        <footer className="text-[11px] text-slate-400 leading-relaxed pb-2">
          本指南为科普性质，资料源自应急管理部、中国疾控中心、住建/卫健部门及权威媒体。涉及房屋结构、电气、
          燃气的专业判断，务必以属地主管部门及持证专业人员现场意见为准。
        </footer>
      </div>
    </div>
  )
}
