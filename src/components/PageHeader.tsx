import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  icon?: LucideIcon
}

export default function PageHeader({ title, subtitle, icon: Icon }: Props) {
  return (
    <header className="pt-safe px-4 pb-4 bg-gradient-to-b from-brand-800 via-brand-700 to-brand-700 text-white shadow-header">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid place-items-center h-9 w-9 rounded-lg bg-white/12 ring-1 ring-white/15 shrink-0">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </span>
        )}
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-brand-100/90">广西应急信息服务</div>
          <h1 className="text-lg font-bold leading-tight tracking-tight mt-0.5">{title}</h1>
          {subtitle && <p className="text-xs text-brand-100 mt-1 leading-snug">{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}
