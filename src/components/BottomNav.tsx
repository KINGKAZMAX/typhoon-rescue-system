import { NavLink } from 'react-router-dom'
import { House, Wind, Phone, HeartHandshake, BookOpen, type LucideIcon } from 'lucide-react'

const tabs: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/', label: '首页', icon: House, end: true },
  { to: '/forecast', label: '台风预报', icon: Wind },
  { to: '/phones', label: '救援电话', icon: Phone },
  { to: '/aid', label: '求助互助', icon: HeartHandshake },
  { to: '/guide', label: '灾后指南', icon: BookOpen },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/92 backdrop-blur-xl border-t border-slate-200/90 safe-bottom z-40 shadow-[0_-10px_28px_rgba(15,23,42,0.06)]">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `relative flex min-h-[58px] flex-col items-center justify-center gap-1 py-2 text-[11px] transition duration-150 ease-out active:scale-[0.97] ${
                    isActive ? 'text-brand-700 font-bold' : 'text-slate-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute top-0 h-[3px] w-8 rounded-b-full transition ${
                        isActive ? 'bg-brand-600 opacity-100' : 'bg-transparent opacity-0'
                      }`}
                    />
                    <span className={`grid h-7 w-7 place-items-center rounded-lg transition ${isActive ? 'bg-brand-50' : ''}`}>
                      <Icon className="h-[20px] w-[20px]" strokeWidth={isActive ? 2.5 : 2} />
                    </span>
                    <span className="leading-none">{t.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
