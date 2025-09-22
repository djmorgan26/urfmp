import { useState } from 'react'
import { toast } from 'sonner'
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
  X,
  Check,
  Ban,
  Settings as SettingsIcon,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTheme } from '@/contexts/ThemeContext'
import { useAlertNotificationSettings } from '@/components/alerts/AlertNotifications'
import { useUserManagement } from '@/hooks/useUserManagement'
import { InviteUserModal } from '@/components/team/InviteUserModal'
import { EditUserModal } from '@/components/team/EditUserModal'
import { UserManagementTable } from '@/components/team/UserManagementTable'
import { CreateApiKeyModal } from '@/components/api/CreateApiKeyModal'

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

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    organizationName: 'Acme Robotics',
    timeZone: 'UTC-8 (Pacific Time)',
    refreshRate: '5 seconds',
    autoRefresh: true
  })

  // Database settings state
  const [retentionDays, setRetentionDays] = useState(90)
  const [enableBackups, setEnableBackups] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState('daily')

  // 2FA settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState('app')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)

  // IP restrictions state
  const [ipRestrictionsEnabled, setIpRestrictionsEnabled] = useState(false)
  const [ipAllowlist, setIpAllowlist] = useState<string[]>(['192.168.1.0/24', '10.0.0.0/8'])
  const [ipBlocklist, setIpBlocklist] = useState<string[]>(['1.2.3.4', '5.6.7.8'])
  const [newIpAddress, setNewIpAddress] = useState('')
  const [ipListType, setIpListType] = useState<'allow' | 'block'>('allow')

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/\s+/g, ''))
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Save functions
  const saveGeneralSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('General settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save general settings. Please try again.')
    }
  }

  const saveNotificationSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notification preferences saved successfully!')
    } catch (error) {
      toast.error('Failed to save notification settings. Please try again.')
    }
  }

  const saveDatabaseSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Database settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save database settings. Please try again.')
    }
  }

  const enableTwoFactor = async () => {
    try {
      // Validate inputs based on method
      if (twoFactorMethod === 'sms') {
        if (!phoneNumber.trim()) {
          toast.error('Please enter a phone number for SMS verification')
          return
        }
        if (!validatePhoneNumber(phoneNumber)) {
          toast.error('Please enter a valid phone number with country code (e.g., +1234567890)')
          return
        }
      }
      if (twoFactorMethod === 'email') {
        if (!emailAddress.trim()) {
          toast.error('Please enter an email address for email verification')
          return
        }
        if (!validateEmail(emailAddress)) {
          toast.error('Please enter a valid email address')
          return
        }
      }

      if (twoFactorMethod === 'app') {
        setShowQRCode(true)
        // Simulate API call to generate QR code
        await new Promise(resolve => setTimeout(resolve, 1000))
        setShowQRCode(false)
        setPendingVerification(true)
        toast.success('Scan the QR code with your authenticator app, then enter the verification code')
      } else if (twoFactorMethod === 'sms') {
        // Simulate sending SMS verification code
        await new Promise(resolve => setTimeout(resolve, 1000))
        setPendingVerification(true)
        toast.success(`Verification code sent to ${phoneNumber}`)
      } else if (twoFactorMethod === 'email') {
        // Simulate sending email verification code
        await new Promise(resolve => setTimeout(resolve, 1000))
        setPendingVerification(true)
        toast.success(`Verification code sent to ${emailAddress}`)
      }
    } catch (error) {
      setShowQRCode(false)
      toast.error('Failed to enable two-factor authentication. Please try again.')
    }
  }

  const verifyTwoFactorCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code')
      return
    }

    try {
      setIsVerifyingCode(true)
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate successful verification
      setTwoFactorEnabled(true)
      setPendingVerification(false)
      setVerificationCode('')
      setIsVerifyingCode(false)
      toast.success('Two-factor authentication enabled successfully!')
    } catch (error) {
      setIsVerifyingCode(false)
      toast.error('Invalid verification code. Please try again.')
    }
  }

  const disableTwoFactor = async () => {
    if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        setTwoFactorEnabled(false)
        setPendingVerification(false)
        setVerificationCode('')
        setPhoneNumber('')
        setEmailAddress('')
        toast.success('Two-factor authentication disabled.')
      } catch (error) {
        toast.error('Failed to disable two-factor authentication. Please try again.')
      }
    }
  }

  const addIpAddress = () => {
    if (!newIpAddress.trim()) {
      toast.error('Please enter an IP address or CIDR range')
      return
    }

    // Basic IP/CIDR validation
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/[0-9]{1,2})?$/
    if (!ipPattern.test(newIpAddress.trim())) {
      toast.error('Please enter a valid IP address or CIDR range (e.g., 192.168.1.1 or 192.168.1.0/24)')
      return
    }

    const ip = newIpAddress.trim()
    if (ipListType === 'allow') {
      if (ipAllowlist.includes(ip)) {
        toast.error('IP address already in allowlist')
        return
      }
      setIpAllowlist(prev => [...prev, ip])
      toast.success('IP address added to allowlist')
    } else {
      if (ipBlocklist.includes(ip)) {
        toast.error('IP address already in blocklist')
        return
      }
      setIpBlocklist(prev => [...prev, ip])
      toast.success('IP address added to blocklist')
    }
    setNewIpAddress('')
  }

  const removeIpAddress = (ip: string, type: 'allow' | 'block') => {
    if (type === 'allow') {
      setIpAllowlist(prev => prev.filter(addr => addr !== ip))
      toast.success('IP address removed from allowlist')
    } else {
      setIpBlocklist(prev => prev.filter(addr => addr !== ip))
      toast.success('IP address removed from blocklist')
    }
  }

  const saveSecuritySettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Security settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save security settings. Please try again.')
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log(`Deleting API key: ${keyId}`)
        toast.success('API key deleted successfully!')
        // In real implementation, refresh the API keys list
      } catch (error) {
        toast.error('Failed to delete API key. Please try again.')
      }
    }
  }

  const copyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      toast.success('API key copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy API key to clipboard.')
    }
  }

  const exportAllData = async () => {
    try {
      toast.info('Preparing data export... This may take a few minutes.')
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Create a mock export file
      const exportData = {
        robots: [],
        telemetry: [],
        settings: generalSettings,
        users: [],
        exportDate: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `urfmp-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data export completed successfully!')
    } catch (error) {
      toast.error('Failed to export data. Please try again.')
    }
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
                    value={generalSettings.organizationName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Time Zone</label>
                  <select
                    value={generalSettings.timeZone}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, timeZone: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
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
                  <select
                    value={generalSettings.refreshRate}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, refreshRate: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
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
                  <input
                    type="checkbox"
                    id="auto-refresh"
                    className="rounded"
                    checked={generalSettings.autoRefresh}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                  />
                  <label htmlFor="auto-refresh" className="text-sm">
                    Auto-refresh dashboard
                  </label>
                </div>

                <button
                  onClick={saveGeneralSettings}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
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

              <button
                onClick={saveNotificationSettings}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                <span>Save Notification Preferences</span>
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
                </div>

                <div className="space-y-6">
                  {/* 2FA Status */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium">Status</p>
                        <span className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          twoFactorEnabled
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        )}>
                          {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {twoFactorEnabled
                          ? 'Your account is protected with two-factor authentication'
                          : 'Add an extra layer of security to your account'
                        }
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      {!twoFactorEnabled ? (
                        <button
                          onClick={enableTwoFactor}
                          disabled={showQRCode}
                          className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white text-sm rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
                        >
                          {showQRCode ? 'Setting up...' : 'Enable 2FA'}
                        </button>
                      ) : (
                        <button
                          onClick={disableTwoFactor}
                          className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white text-sm rounded-md hover:bg-red-700 dark:hover:bg-red-600"
                        >
                          Disable 2FA
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2FA Method Selection */}
                  {twoFactorEnabled && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Authentication Method</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition-colors',
                            twoFactorMethod === 'app'
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-muted'
                          )}
                          onClick={() => setTwoFactorMethod('app')}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              checked={twoFactorMethod === 'app'}
                              onChange={() => setTwoFactorMethod('app')}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium">Authenticator App</p>
                              <p className="text-sm text-muted-foreground">Use Google Authenticator, Authy, or similar apps</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition-colors',
                            twoFactorMethod === 'sms'
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-muted'
                          )}
                          onClick={() => setTwoFactorMethod('sms')}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              checked={twoFactorMethod === 'sms'}
                              onChange={() => setTwoFactorMethod('sms')}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium">SMS</p>
                              <p className="text-sm text-muted-foreground">Receive codes via text message</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition-colors',
                            twoFactorMethod === 'email'
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-muted'
                          )}
                          onClick={() => setTwoFactorMethod('email')}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              checked={twoFactorMethod === 'email'}
                              onChange={() => setTwoFactorMethod('email')}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium">Email</p>
                              <p className="text-sm text-muted-foreground">Receive codes via email</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition-colors',
                            twoFactorMethod === 'hardware'
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-muted'
                          )}
                          onClick={() => setTwoFactorMethod('hardware')}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              checked={twoFactorMethod === 'hardware'}
                              onChange={() => setTwoFactorMethod('hardware')}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium">Hardware Key</p>
                              <p className="text-sm text-muted-foreground">YubiKey, FIDO2, or WebAuthn devices</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information Inputs */}
                      {!twoFactorEnabled && (
                        <div className="space-y-4 mt-6">
                          {twoFactorMethod === 'sms' && (
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Include country code (e.g., +1 for US)
                              </p>
                            </div>
                          )}

                          {twoFactorMethod === 'email' && (
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                placeholder="your-email@example.com"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                This can be different from your account email
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Verification Code Flow */}
                      {pendingVerification && (
                        <div className="space-y-4 mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">
                            Enter Verification Code
                          </h4>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              6-Digit Code
                            </label>
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="123456"
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-center text-lg tracking-widest"
                              maxLength={6}
                            />
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={verifyTwoFactorCode}
                              disabled={isVerifyingCode || verificationCode.length !== 6}
                              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white text-sm rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
                            >
                              {isVerifyingCode ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <button
                              onClick={() => {
                                setPendingVerification(false)
                                setVerificationCode('')
                              }}
                              className="px-4 py-2 border border-border text-sm rounded-md hover:bg-muted"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* IP Restrictions */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Ban className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">IP Restrictions</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ip-restrictions"
                      checked={ipRestrictionsEnabled}
                      onChange={(e) => setIpRestrictionsEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="ip-restrictions" className="text-sm font-medium">
                      Enable IP Restrictions
                    </label>
                  </div>
                </div>

                {ipRestrictionsEnabled && (
                  <div className="space-y-6">
                    {/* Add IP Address */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Add IP Address or Range</h3>
                      <div className="flex space-x-2">
                        <select
                          value={ipListType}
                          onChange={(e) => setIpListType(e.target.value as 'allow' | 'block')}
                          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="allow">Allowlist</option>
                          <option value="block">Blocklist</option>
                        </select>
                        <input
                          type="text"
                          value={newIpAddress}
                          onChange={(e) => setNewIpAddress(e.target.value)}
                          placeholder="192.168.1.1 or 192.168.1.0/24"
                          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && addIpAddress()}
                        />
                        <button
                          onClick={addIpAddress}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* IP Allowlist */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Allowed IP Addresses</h3>
                      <div className="space-y-2">
                        {ipAllowlist.length === 0 ? (
                          <p className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg">
                            No IP addresses in allowlist. Add some to restrict access.
                          </p>
                        ) : (
                          ipAllowlist.map((ip, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="font-mono text-sm">{ip}</span>
                              </div>
                              <button
                                onClick={() => removeIpAddress(ip, 'allow')}
                                className="p-1 rounded-md hover:bg-green-100 dark:hover:bg-green-800 text-green-600 dark:text-green-400"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* IP Blocklist */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Blocked IP Addresses</h3>
                      <div className="space-y-2">
                        {ipBlocklist.length === 0 ? (
                          <p className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg">
                            No IP addresses in blocklist.
                          </p>
                        ) : (
                          ipBlocklist.map((ip, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Ban className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span className="font-mono text-sm">{ip}</span>
                              </div>
                              <button
                                onClick={() => removeIpAddress(ip, 'block')}
                                className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-400"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Session & API Security */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <SettingsIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Session & API Security</h2>
                </div>

                <div className="space-y-4">
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

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API Rate Limiting</p>
                      <p className="text-sm text-muted-foreground">
                        Maximum requests per minute per API key
                      </p>
                    </div>
                    <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>100</option>
                      <option>500</option>
                      <option>1000</option>
                      <option>Unlimited</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={saveSecuritySettings}
                  className="mt-6 flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Security Settings</span>
                </button>
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
                          <button
                            onClick={() => deleteApiKey(apiKey.id)}
                            className="p-1 rounded-md hover:bg-muted text-red-600"
                          >
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
                        <button
                          onClick={() => copyApiKey(apiKey.key)}
                          className="p-2 rounded-md border border-border hover:bg-muted"
                        >
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

                    <button
                      onClick={exportAllData}
                      className="px-4 py-2 border border-border rounded-md hover:bg-muted"
                    >
                      Export All Data
                    </button>
                  </div>
                </div>

                <button
                  onClick={saveDatabaseSettings}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateApiKeyModal
        isOpen={showCreateApiKey}
        onClose={() => setShowCreateApiKey(false)}
      />

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  )
}
