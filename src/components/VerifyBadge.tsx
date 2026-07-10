import { ShieldCheck, BadgeCheck, CircleAlert, type LucideIcon } from 'lucide-react'
import { verifyMeta, type VerifyLevel } from '../data/phones'

const icons: Record<VerifyLevel, LucideIcon> = {
  verified: ShieldCheck,
  structural: ShieldCheck,
  media: BadgeCheck,
  unverified: CircleAlert,
}

export default function VerifyBadge({ level }: { level: VerifyLevel }) {
  const m = verifyMeta[level]
  const Icon = icons[level]
  return (
    <span className={`badge ${m.cls}`}>
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {m.label}
    </span>
  )
}
