import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '首页', icon: '🏠', end: true },
  { to: '/forecast', label: '台风预报', icon: '🌀' },
  { to: '/phones', label: '救援电话', icon: '📞' },
  { to: '/aid', label: '求助互助', icon: '🤝' },
  { to: '/guide', label: '灾后指南', icon: '📖' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-gray-200 safe-bottom z-40">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${
                  isActive ? 'text-brand-600 font-semibold' : 'text-gray-400'
                }`
              }
            >
              <span className="text-xl leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
