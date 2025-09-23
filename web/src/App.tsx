import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { URFMPProvider } from './hooks/useURFMP'
import { ThemeProvider } from './contexts/ThemeContext'

// Lazy load heavy pages to reduce initial bundle size
const Robots = lazy(() => import('./pages/Robots').then(m => ({ default: m.Robots })))
const RobotDetail = lazy(() => import('./pages/RobotDetail').then(m => ({ default: m.RobotDetail })))
const RobotMapPage = lazy(() => import('./pages/RobotMapPage').then(m => ({ default: m.RobotMapPage })))
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })))
const Maintenance = lazy(() => import('./pages/Maintenance').then(m => ({ default: m.Maintenance })))
const Geofencing = lazy(() => import('./pages/Geofencing').then(m => ({ default: m.Geofencing })))
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))

function App() {
  return (
    <ThemeProvider>
      <URFMPProvider>
        <Layout>
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/robots" element={<Robots />} />
              <Route path="/robots/:id" element={<RobotDetail />} />
              <Route path="/map" element={<RobotMapPage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/geofencing" element={<Geofencing />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </Layout>
      </URFMPProvider>
    </ThemeProvider>
  )
}

export default App
