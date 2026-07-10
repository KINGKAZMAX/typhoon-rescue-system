import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Forecast from './pages/Forecast'
import Directory from './pages/Directory'
import MutualAid from './pages/MutualAid'
import Guide from './pages/Guide'
import OverviewPoster from './pages/OverviewPoster'

export default function App() {
  const location = useLocation()

  if (location.pathname === '/overview' || location.pathname === '/mobile-preview') {
    return <OverviewPoster />
  }

  return (
    <div className="app-shell">
      <main className="pb-20 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/phones" element={<Directory />} />
          <Route path="/aid" element={<MutualAid />} />
          <Route path="/guide" element={<Guide />} />
        </Routes>
        {/* 开发者联系方式（很小字体，全站常驻在内容最底部） */}
        <footer className="px-4 pt-1 pb-3 text-center text-[10px] leading-relaxed text-slate-400">
          开发者 小智 · 微信 KING_KAZMAX ·{' '}
          <a href="mailto:xinlise@gmail.com" className="underline decoration-slate-300">xinlise@gmail.com</a>
        </footer>
      </main>
      <BottomNav />
    </div>
  )
}
