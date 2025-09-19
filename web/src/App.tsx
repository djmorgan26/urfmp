import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Robots } from '@/pages/Robots'
import { RobotDetail } from '@/pages/RobotDetail'
import { RobotMapPage } from '@/pages/RobotMapPage'
import { Analytics } from '@/pages/Analytics'
import { Maintenance } from '@/pages/Maintenance'
import { Settings } from '@/pages/Settings'
import { URFMPProvider } from '@/hooks/useURFMP'
import { ThemeProvider } from '@/contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <URFMPProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/robots" element={<Robots />} />
            <Route path="/robots/:id" element={<RobotDetail />} />
            <Route path="/map" element={<RobotMapPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </URFMPProvider>
    </ThemeProvider>
  )
}

export default App
