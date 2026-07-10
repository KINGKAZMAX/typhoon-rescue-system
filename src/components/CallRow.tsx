import { Phone } from 'lucide-react'
import type { PhoneEntry } from '../data/phones'
import VerifyBadge from './VerifyBadge'

/** 单条电话，右侧一键拨号 */
export default function CallRow({ entry }: { entry: PhoneEntry }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900">{entry.name}</span>
          <VerifyBadge level={entry.verify} />
        </div>
        {entry.scenario && <p className="text-xs text-slate-500 mt-0.5 leading-snug">{entry.scenario}</p>}
        {entry.note && <p className="text-[11px] text-slate-600 mt-0.5">{entry.note}</p>}
      </div>
      {entry.verify === 'unverified' ? (
        <span className="text-xs text-warn-700 shrink-0 text-right leading-snug">
          待核实<br />请拨 12345
        </span>
      ) : (
        <a
          href={`tel:${entry.number.replace(/\s/g, '')}`}
          className="btn-danger !px-3 !py-2 shrink-0"
          aria-label={`拨打 ${entry.name} ${entry.number}`}
        >
          <Phone className="h-4 w-4" strokeWidth={2.5} />
          {entry.number}
        </a>
      )}
    </div>
  )
}
