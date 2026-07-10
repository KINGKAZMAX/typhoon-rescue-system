import type { PhoneEntry } from '../data/phones'
import VerifyBadge from './VerifyBadge'

/** 单条电话，右侧一键拨号 */
export default function CallRow({ entry }: { entry: PhoneEntry }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">{entry.name}</span>
          <VerifyBadge level={entry.verify} />
        </div>
        {entry.scenario && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{entry.scenario}</p>}
        {entry.note && <p className="text-[11px] text-gray-400 mt-0.5">{entry.note}</p>}
      </div>
      <a
        href={`tel:${entry.number.replace(/\s/g, '')}`}
        className="btn-danger !px-3 !py-2 shrink-0 text-sm"
        aria-label={`拨打 ${entry.name} ${entry.number}`}
      >
        📞 {entry.number}
      </a>
    </div>
  )
}
