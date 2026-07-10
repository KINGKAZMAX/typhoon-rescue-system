interface Props {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="pt-safe bg-brand-700 text-white px-4 pb-3 shadow-md">
      <h1 className="text-lg font-bold leading-tight">{title}</h1>
      {subtitle && <p className="text-xs text-brand-100 mt-0.5">{subtitle}</p>}
    </header>
  )
}
