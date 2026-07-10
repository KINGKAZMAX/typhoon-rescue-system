import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  icon?: LucideIcon
}

export default function PageHeader({ title, subtitle, icon: Icon }: Props) {
  return (
    <header className="pt-safe bg-brand-700 text-white px-4 pb-3.5 shadow-header">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="grid place-items-center h-8 w-8 rounded-xl bg-white/15 shrink-0">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-brand-100 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}
