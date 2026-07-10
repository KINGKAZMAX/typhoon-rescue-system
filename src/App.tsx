import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Forecast from './pages/Forecast'
import Directory from './pages/Directory'
import MutualAid from './pages/MutualAid'
import Guide from './pages/Guide'

export default function App() {
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
      </main>
      <BottomNav />
    </div>
  )
}
