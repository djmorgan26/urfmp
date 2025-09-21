import { useState } from 'react'
import {
  Save,
  Key,
  Bell,
  Shield,
  Database,
  Globe,
  Users,
  Trash2,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  UserPlus,
  Activity,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTheme } from '@/contexts/ThemeContext'
import { useAlertNotificationSettings } from '@/components/alerts/AlertNotifications'
import { useUserManagement } from '@/hooks/useUserManagement'
import { InviteUserModal } from '@/components/team/InviteUserModal'
import { EditUserModal } from '@/components/team/EditUserModal'
import { UserManagementTable } from '@/components/team/UserManagementTable'

interface ApiKey {
  id: string
  name: string
  key: string
  scopes: string[]
  createdAt: Date
  lastUsed?: Date
  isActive: boolean
}

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production Dashboard',
    key: 'urfmp_live_abc123...',
    scopes: ['read:robots', 'write:robots', 'read:telemetry'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '2',
    name: 'Development Environment',
    key: 'urfmp_test_def456...',
    scopes: ['read:robots', 'read:telemetry'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isActive: true,
  },
]

export function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [showCreateApiKey, setShowCreateApiKey] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const { theme, setTheme } = useTheme()
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useAlertNotificationSettings()
  const { userStats, refreshUsers } = useUserManagement()

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'database', label: 'Database', icon: Database },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your URFMP configuration and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'general' && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">General Settings</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Acme Robotics"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Time Zone</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+1 (Central European Time)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Default Dashboard Refresh Rate
                  </label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>5 seconds</option>
                    <option>10 seconds</option>
                    <option>30 seconds</option>
                    <option>1 minute</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Theme</label>
                    <p className="text-xs text-muted-foreground">
                      Choose your preferred theme or follow system preference
                    </p>
                  </div>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto-refresh" className="rounded" defaultChecked />
                  <label htmlFor="auto-refresh" className="text-sm">
                    Auto-refresh dashboard
                  </label>
                </div>

                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Real-time Alert Notifications */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Real-time Alert Notifications</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Show toast notifications for alerts and events
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={notificationSettings.enabled}
                      onChange={(e) => updateNotificationSettings({ enabled: e.target.checked })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Notification Position</label>
                      <select
                        value={notificationSettings.position}
                        onChange={(e) => updateNotificationSettings({ position: e.target.value as any })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Max Notifications</label>
                      <select
                        value={notificationSettings.maxNotifications}
                        onChange={(e) => updateNotificationSettings({ maxNotifications: parseInt(e.target.value) })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="3">3 notifications</option>
                        <option value="5">5 notifications</option>
                        <option value="10">10 notifications</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Auto-hide Duration</label>
                    <select
                      value={notificationSettings.autoHideDuration}
                      onChange={(e) => updateNotificationSettings({ autoHideDuration: parseInt(e.target.value) })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="5000">5 seconds</option>
                      <option value="8000">8 seconds</option>
                      <option value="10000">10 seconds</option>
                      <option value="15000">15 seconds</option>
                      <option value="0">Never auto-hide</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Critical alerts never auto-hide regardless of this setting
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {notificationSettings.enableSound ? (
                        <Volume2 className="h-4 w-4 text-primary" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">Sound Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Play sound for critical and error alerts
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={notificationSettings.enableSound}
                      onChange={(e) => updateNotificationSettings({ enableSound: e.target.checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Critical Alerts Only</p>
                      <p className="text-sm text-muted-foreground">
                        Only show notifications for critical severity alerts
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={notificationSettings.showOnlyCritical}
                      onChange={(e) => updateNotificationSettings({ showOnlyCritical: e.target.checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Email Notifications */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Mail className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Email Notifications</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Robot Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when robots encounter errors or issues
                      </p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders for scheduled maintenance
                      </p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Performance Reports</p>
                      <p className="text-sm text-muted-foreground">
                        Weekly fleet performance summaries
                      </p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Unauthorized access attempts and security events
                      </p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </div>

              {/* Alert Thresholds */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Alert Thresholds</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Temperature Warning (°C)</label>
                    <input
                      type="number"
                      defaultValue="50"
                      min="0"
                      max="100"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Alert when robot temperature exceeds this value
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Power Consumption Warning (W)</label>
                    <input
                      type="number"
                      defaultValue="200"
                      min="0"
                      max="1000"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Alert when power consumption exceeds this value
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">GPS Accuracy Warning (m)</label>
                    <input
                      type="number"
                      defaultValue="10"
                      min="1"
                      max="100"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Alert when GPS horizontal accuracy exceeds this value
                    </p>
                  </div>
                </div>
              </div>

              <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                <Save className="h-4 w-4" />
                <span>Save Notification Preferences</span>
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Authentication</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button className="px-3 py-1.5 bg-green-600 dark:bg-green-700 text-white text-sm rounded-md hover:bg-green-700 dark:hover:bg-green-600">
                          Enable
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Session Timeout</p>
                          <p className="text-sm text-muted-foreground">
                            Automatically log out after period of inactivity
                          </p>
                        </div>
                        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>4 hours</option>
                          <option>8 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">API Security</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Rate Limiting</p>
                          <p className="text-sm text-muted-foreground">
                            Requests per minute per API key
                          </p>
                        </div>
                        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option>100</option>
                          <option>500</option>
                          <option>1000</option>
                          <option>Unlimited</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">IP Restrictions</p>
                          <p className="text-sm text-muted-foreground">
                            Restrict API access to specific IP addresses
                          </p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">API Keys</h2>
                  <button
                    onClick={() => setShowCreateApiKey(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create API Key</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {mockApiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{apiKey.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created {apiKey.createdAt.toLocaleDateString()}
                            {apiKey.lastUsed &&
                              ` • Last used ${apiKey.lastUsed.toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              apiKey.isActive
                                ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400'
                            )}
                          >
                            {apiKey.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button className="p-1 rounded-md hover:bg-muted text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <div className="font-mono text-sm bg-muted px-3 py-2 rounded flex-1">
                          {showApiKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••'}
                        </div>
                        <button
                          onClick={() => toggleApiKeyVisibility(apiKey.id)}
                          className="p-2 rounded-md border border-border hover:bg-muted"
                        >
                          {showApiKeys[apiKey.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button className="p-2 rounded-md border border-border hover:bg-muted">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {apiKey.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 text-xs rounded-full"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Team Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{userStats.totalUsers}</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-muted-foreground">Active Users</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{userStats.activeUsers}</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-muted-foreground">Pending Invites</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{userStats.pendingInvitations}</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-muted-foreground">Recent Logins</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{userStats.recentLogins}</p>
                </div>
              </div>

              {/* Team Management Header */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Team Management</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your team members, roles, and permissions
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Invite Member</span>
                  </button>
                </div>

                {/* User Management Table */}
                <UserManagementTable
                  onEditUser={(user) => setEditingUser(user)}
                />
              </div>

              {/* Modals */}
              <InviteUserModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onSuccess={() => {
                  refreshUsers()
                  setShowInviteModal(false)
                }}
              />

              <EditUserModal
                isOpen={!!editingUser}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSuccess={() => {
                  refreshUsers()
                  setEditingUser(null)
                }}
              />
            </div>
          )}

          {activeTab === 'database' && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Database Settings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Data Retention</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Telemetry Data</p>
                        <p className="text-sm text-muted-foreground">
                          How long to keep robot telemetry data
                        </p>
                      </div>
                      <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>30 days</option>
                        <option>90 days</option>
                        <option>1 year</option>
                        <option>Forever</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Alert History</p>
                        <p className="text-sm text-muted-foreground">
                          How long to keep alert and event history
                        </p>
                      </div>
                      <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>90 days</option>
                        <option>1 year</option>
                        <option>2 years</option>
                        <option>Forever</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Backup & Export</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Automatic Backups</p>
                        <p className="text-sm text-muted-foreground">Regular database backups</p>
                      </div>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>

                    <button className="px-4 py-2 border border-border rounded-md hover:bg-muted">
                      Export All Data
                    </button>
                  </div>
                </div>

                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
