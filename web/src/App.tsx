import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { URFMPProvider } from './hooks/useURFMP'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Loader2 } from 'lucide-react'

// Lazy load heavy pages to reduce initial bundle size
const Robots = lazy(() => import('./pages/Robots').then((m) => ({ default: m.Robots })))
const RobotDetail = lazy(() =>
  import('./pages/RobotDetail').then((m) => ({ default: m.RobotDetail }))
)
const RobotMapPage = lazy(() =>
  import('./pages/RobotMapPage').then((m) => ({ default: m.RobotMapPage }))
)
const Analytics = lazy(() => import('./pages/Analytics').then((m) => ({ default: m.Analytics })))
const Maintenance = lazy(() =>
  import('./pages/Maintenance').then((m) => ({ default: m.Maintenance }))
)
const Geofencing = lazy(() => import('./pages/Geofencing').then((m) => ({ default: m.Geofencing })))
const VirtualStudioPage = lazy(() =>
  import('./pages/VirtualStudio/VirtualStudioPage').then((m) => ({ default: m.default }))
)
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })))

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <URFMPProvider>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            }
          >
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/robots" element={<Robots />} />
                        <Route path="/robots/:id" element={<RobotDetail />} />
                        <Route path="/map" element={<RobotMapPage />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/maintenance" element={<Maintenance />} />
                        <Route path="/geofencing" element={<Geofencing />} />
                        <Route path="/studio" element={<VirtualStudioPage />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </URFMPProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
