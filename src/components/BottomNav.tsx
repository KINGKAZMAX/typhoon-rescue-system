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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/95 backdrop-blur border-t border-slate-200 safe-bottom z-40">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${
                    isActive ? 'text-brand-600 font-semibold' : 'text-slate-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.4 : 2} />
                    <span>{t.label}</span>
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
