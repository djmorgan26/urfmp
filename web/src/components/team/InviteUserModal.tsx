import { useState } from 'react'
import { X, Mail, UserPlus, Shield, AlertCircle, Check } from 'lucide-react'
import { useUserManagement } from '@/hooks/useUserManagement'
import { cn } from '@/utils/cn'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const permissionGroups = [
  {
    name: 'Robot Management',
    permissions: [
      { id: 'robot.view', name: 'View robots', description: 'See robot list and status' },
      { id: 'robot.create', name: 'Add robots', description: 'Register new robots' },
      { id: 'robot.update', name: 'Edit robots', description: 'Modify robot settings' },
      { id: 'robot.delete', name: 'Delete robots', description: 'Remove robots from system' },
      { id: 'commands.send', name: 'Send commands', description: 'Control robot operations' },
    ],
  },
  {
    name: 'Telemetry & Monitoring',
    permissions: [
      {
        id: 'telemetry.view',
        name: 'View telemetry',
        description: 'Access sensor data and analytics',
      },
      { id: 'telemetry.write', name: 'Write telemetry', description: 'Submit telemetry data' },
      {
        id: 'alerts.acknowledge',
        name: 'Manage alerts',
        description: 'Acknowledge and dismiss alerts',
      },
    ],
  },
  {
    name: 'Maintenance',
    permissions: [
      {
        id: 'maintenance.view',
        name: 'View maintenance',
        description: 'See maintenance schedules and history',
      },
      {
        id: 'maintenance.create',
        name: 'Schedule maintenance',
        description: 'Create maintenance tasks',
      },
      {
        id: 'maintenance.update',
        name: 'Update maintenance',
        description: 'Modify maintenance records',
      },
    ],
  },
  {
    name: 'System Administration',
    permissions: [
      { id: 'user.view', name: 'View users', description: 'See team members and permissions' },
      { id: 'user.create', name: 'Invite users', description: 'Send team invitations' },
      { id: 'user.update', name: 'Manage users', description: 'Edit user roles and permissions' },
      { id: 'user.delete', name: 'Remove users', description: 'Deactivate team members' },
      {
        id: 'organization.view',
        name: 'View settings',
        description: 'Access organization settings',
      },
      {
        id: 'organization.update',
        name: 'Manage settings',
        description: 'Modify system configuration',
      },
    ],
  },
]

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const { roles, inviteUser } = useUserManagement()
  const [formData, setFormData] = useState({
    email: '',
    role: 'operator',
    customPermissions: [] as string[],
  })
  const [useCustomPermissions, setUseCustomPermissions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const selectedRole = roles.find((r) => r.id === formData.role)
  const effectivePermissions = useCustomPermissions
    ? formData.customPermissions
    : selectedRole?.permissions || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!formData.email.trim()) {
        throw new Error('Email is required')
      }

      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      await inviteUser(
        formData.email.trim(),
        formData.role,
        useCustomPermissions ? formData.customPermissions : undefined
      )

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        handleClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ email: '', role: 'operator', customPermissions: [] })
    setUseCustomPermissions(false)
    setError(null)
    setSuccess(false)
    onClose()
  }

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      customPermissions: prev.customPermissions.includes(permissionId)
        ? prev.customPermissions.filter((p) => p !== permissionId)
        : [...prev.customPermissions, permissionId],
    }))
  }

  const handleRoleChange = (roleId: string) => {
    setFormData((prev) => ({ ...prev, role: roleId }))
    setUseCustomPermissions(false)
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Invitation Sent!</h3>
            <p className="text-muted-foreground mb-4">
              We've sent an invitation to {formData.email}. They'll receive an email with
              instructions to join your team.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Invite Team Member</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-md transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="colleague@company.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Shield className="h-4 w-4 inline mr-2" />
                Role
              </label>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-colors',
                      formData.role === role.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    )}
                    onClick={() => handleRoleChange(role.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={formData.role === role.id}
                        onChange={() => handleRoleChange(role.id)}
                        className="text-primary"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{role.name}</h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 bg-muted text-xs rounded-full"
                            >
                              {permission.replace(/\./g, ' ')}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="px-2 py-1 bg-muted text-xs rounded-full">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Permissions Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="custom-permissions"
                checked={useCustomPermissions}
                onChange={(e) => setUseCustomPermissions(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="custom-permissions" className="text-sm font-medium">
                Customize permissions for this user
              </label>
            </div>

            {/* Custom Permissions */}
            {useCustomPermissions && (
              <div className="space-y-4">
                <h4 className="font-medium">Select Permissions</h4>
                {permissionGroups.map((group) => (
                  <div key={group.name} className="border border-border rounded-lg p-4">
                    <h5 className="font-medium mb-3">{group.name}</h5>
                    <div className="space-y-2">
                      {group.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.customPermissions.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              className="rounded"
                            />
                            <div>
                              <p className="text-sm font-medium">{permission.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Permission Summary */}
            {effectivePermissions.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">Permissions Summary</h4>
                <p className="text-sm text-muted-foreground mb-2">This user will have access to:</p>
                <div className="flex flex-wrap gap-1">
                  {effectivePermissions.map((permission) => (
                    <span
                      key={permission}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {permission.replace(/\./g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/30">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.email.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
