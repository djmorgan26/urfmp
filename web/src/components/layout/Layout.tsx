import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Activity,
  Bot,
  BarChart3,
  Wrench,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Zap,
  Sun,
  Moon,
} from 'lucide-react'
import { useURFMP } from '@/hooks/useURFMP'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/utils/cn'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Activity },
  { name: 'Robots', href: '/robots', icon: Bot },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Layout({ children }: LayoutProps) {
  const { isConnected, robots, error } = useURFMP()
  const { theme, setTheme, isDark } = useTheme()
  const location = useLocation()

  const activeRobots = robots.filter((r) => r.status === 'running' || r.status === 'online').length
  const totalRobots = robots.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">URFMP</h1>
                <p className="text-xs text-muted-foreground">The Stripe of Robotics</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Search robots, alerts, maintenance..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  isConnected ? 'bg-green-500 pulse-dot' : 'bg-red-500'
                )}
              />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Fleet Status */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Fleet:</span>
              <span className="font-medium">
                {activeRobots}/{totalRobots} active
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-md hover:bg-accent">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                2
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-accent"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            <button className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                DM
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 border-r border-border bg-card/50 h-[calc(100vh-4rem)]">
          <div className="p-6">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </NavLink>
                )
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 space-y-4">
              <div className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Robots</span>
                    <span className="font-medium">{activeRobots}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Offline</span>
                    <span className="font-medium">{totalRobots - activeRobots}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Alerts</span>
                    <span className="font-medium text-red-600">2</span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-1">Connection Error</h3>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
