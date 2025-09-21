import { useState } from 'react'
import {
  MoreHorizontal,
  Edit,
  UserX,
  Trash2,
  Shield,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { useUserManagement, User, UserInvitation } from '@/hooks/useUserManagement'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'

interface UserManagementTableProps {
  onEditUser?: (user: User) => void
}

const roleColors = {
  admin: 'bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-400',
  operator: 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400',
  viewer: 'bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-400',
  maintainer: 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400'
}

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400',
  accepted: 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400',
  expired: 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400',
  revoked: 'bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-400'
}

export function UserManagementTable({ onEditUser }: UserManagementTableProps) {
  const {
    users,
    invitations,
    roles,
    updateUser,
    deactivateUser,
    deleteUser,
    resendInvitation,
    revokeInvitation,
    refreshUsers
  } = useUserManagement()

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshUsers()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      await updateUser(user.id, { isActive: !user.isActive })
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      try {
        await deleteUser(user.id)
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  const handleResendInvitation = async (invitation: UserInvitation) => {
    try {
      await resendInvitation(invitation.id)
    } catch (error) {
      console.error('Failed to resend invitation:', error)
    }
  }

  const handleRevokeInvitation = async (invitation: UserInvitation) => {
    if (window.confirm(`Are you sure you want to revoke the invitation to ${invitation.email}?`)) {
      try {
        await revokeInvitation(invitation.id)
      } catch (error) {
        console.error('Failed to revoke invitation:', error)
      }
    }
  }

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || roleId
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their access levels
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Active Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h4 className="font-medium">Active Users ({users.filter(u => u.isActive).length})</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Last Login</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-400'
                    )}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {user.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm">Inactive</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {user.lastLogin
                          ? formatDistanceToNow(user.lastLogin, { addSuffix: true })
                          : 'Never'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">
                    {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end">
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {activeDropdown === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onEditUser?.(user)
                                  setActiveDropdown(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center space-x-2"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit User</span>
                              </button>

                              <button
                                onClick={() => {
                                  handleToggleActive(user)
                                  setActiveDropdown(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center space-x-2"
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX className="h-4 w-4" />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  handleDeleteUser(user)
                                  setActiveDropdown(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-red-600 flex items-center space-x-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete User</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members found</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.filter(i => i.status === 'pending').length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h4 className="font-medium">Pending Invitations ({invitations.filter(i => i.status === 'pending').length})</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Invited</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Expires</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invitations
                  .filter(i => i.status === 'pending')
                  .map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-muted/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{invitation.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          roleColors[invitation.role as keyof typeof roleColors] || 'bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-400'
                        )}>
                          <Shield className="h-3 w-3 mr-1" />
                          {getRoleName(invitation.role)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          statusColors[invitation.status as keyof typeof statusColors]
                        )}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {formatDistanceToNow(invitation.invitedAt, { addSuffix: true })}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {formatDistanceToNow(invitation.expiresAt, { addSuffix: true })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleResendInvitation(invitation)}
                            className="px-3 py-1 text-xs border border-border rounded hover:bg-muted transition-colors"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => handleRevokeInvitation(invitation)}
                            className="px-3 py-1 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}