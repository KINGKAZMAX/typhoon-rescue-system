import { verifyMeta, type VerifyLevel } from '../data/phones'

export default function VerifyBadge({ level }: { level: VerifyLevel }) {
  const m = verifyMeta[level]
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}
