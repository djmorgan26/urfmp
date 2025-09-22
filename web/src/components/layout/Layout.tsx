import { ReactNode, useState, useEffect, useRef } from 'react'
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
  MapPin,
  Shield,
} from 'lucide-react'
import { useURFMP } from '../../hooks/useURFMP'
import { useRealTimeAlerts } from '../../hooks/useRealTimeAlerts'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../lib/utils'
import { AlertNotifications } from '../alerts/AlertNotifications'
import { RealTimeAlertPanel } from '../alerts/RealTimeAlertPanel'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Activity },
  { name: 'Robots', href: '/robots', icon: Bot },
  { name: 'GPS Map', href: '/map', icon: MapPin },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Geofencing', href: '/geofencing', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Layout({ children }: LayoutProps) {
  const { isConnected, robots, error } = useURFMP()
  const { alertStats } = useRealTimeAlerts()
  const { setTheme, isDark } = useTheme()
  const location = useLocation()
  const [showAlertPanel, setShowAlertPanel] = useState(false)

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const activeRobots = robots.filter((r) => r.status === 'running' || r.status === 'online').length
  const totalRobots = robots.length

  // Search function with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const timeoutId = setTimeout(() => {
      setIsSearching(true)
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, robots])

  // Click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const performSearch = (query: string) => {
    const results = []
    const lowerQuery = query.toLowerCase()

    // Search robots
    const robotResults = robots.filter(robot =>
      robot.name.toLowerCase().includes(lowerQuery) ||
      robot.model.toLowerCase().includes(lowerQuery) ||
      robot.vendor.toLowerCase().includes(lowerQuery) ||
      robot.status.toLowerCase().includes(lowerQuery)
    ).map(robot => ({
      type: 'robot',
      id: robot.id,
      title: robot.name,
      subtitle: `${robot.vendor} ${robot.model}`,
      status: robot.status,
      href: `/robots/${robot.id}`
    }))

    results.push(...robotResults)

    // Add navigation results
    const navResults = navigation.filter(nav =>
      nav.name.toLowerCase().includes(lowerQuery)
    ).map(nav => ({
      type: 'navigation',
      id: nav.href,
      title: nav.name,
      subtitle: 'Navigate to page',
      href: nav.href,
      icon: nav.icon
    }))

    results.push(...navResults)

    setSearchResults(results)
    setShowSearchResults(true)
    setIsSearching(false)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSearchResults(false)
      searchInputRef.current?.blur()
    }
  }

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
            <div className="w-full max-w-lg" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Search robots, alerts, maintenance..."
                />

                {/* Search Results Dropdown */}
                {showSearchResults && (searchResults.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
                        Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No results found for "{searchQuery}"
                      </div>
                    ) : (
                      <div className="py-2">
                        {searchResults.map((result, index) => (
                          <a
                            key={`${result.type}-${result.id}`}
                            href={result.href}
                            className="flex items-center px-4 py-2 hover:bg-muted transition-colors"
                            onClick={() => setShowSearchResults(false)}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {result.type === 'robot' ? (
                                <Bot className="h-4 w-4 text-muted-foreground" />
                              ) : result.icon ? (
                                <result.icon className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Search className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-sm">{result.title}</div>
                                <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                              </div>
                              {result.status && (
                                <div className={cn(
                                  'px-2 py-1 rounded-full text-xs font-medium',
                                  result.status === 'online' || result.status === 'running'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : result.status === 'error'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                )}>
                                  {result.status}
                                </div>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
            <div className="relative">
              <button
                onClick={() => setShowAlertPanel(!showAlertPanel)}
                className={cn(
                  'relative p-2 rounded-md transition-colors',
                  showAlertPanel ? 'bg-accent' : 'hover:bg-accent'
                )}
                title="View real-time alerts"
              >
                <Bell className="h-5 w-5" />
                {alertStats.unacknowledged > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 dark:bg-red-600 text-xs text-white flex items-center justify-center">
                    {alertStats.unacknowledged > 9 ? '9+' : alertStats.unacknowledged}
                  </span>
                )}
              </button>

              {/* Alert Panel Dropdown */}
              {showAlertPanel && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <RealTimeAlertPanel
                    className="w-96 max-h-[70vh] shadow-lg"
                    showFilters={true}
                  />
                </div>
              )}
            </div>

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
                    <span className={cn(
                      'font-medium',
                      alertStats.critical > 0 ? 'text-red-600 dark:text-red-400' :
                      alertStats.error > 0 ? 'text-orange-600 dark:text-orange-400' :
                      alertStats.warning > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
                    )}>
                      {alertStats.total}
                    </span>
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

      {/* Global Alert Notifications */}
      <AlertNotifications />
    </div>
  )
}
