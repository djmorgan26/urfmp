import { useState, useEffect } from 'react'
import { useURFMP } from './useURFMP'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'operator' | 'viewer' | 'maintainer'
  permissions: string[]
  avatar?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  invitedBy?: string
  organizationId: string
}

export interface UserInvitation {
  id: string
  email: string
  role: 'admin' | 'operator' | 'viewer' | 'maintainer'
  permissions: string[]
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  inviteToken: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
  canEdit: boolean
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  pendingInvitations: number
  recentLogins: number
}

const systemRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with user management capabilities',
    permissions: [
      'user.view', 'user.create', 'user.update', 'user.delete',
      'robot.view', 'robot.create', 'robot.update', 'robot.delete',
      'telemetry.view', 'telemetry.write',
      'maintenance.view', 'maintenance.create', 'maintenance.update',
      'organization.view', 'organization.update',
      'settings.view', 'settings.update'
    ],
    isSystem: true,
    canEdit: false
  },
  {
    id: 'operator',
    name: 'Robot Operator',
    description: 'Can control robots and view telemetry data',
    permissions: [
      'robot.view', 'robot.update',
      'telemetry.view',
      'maintenance.view',
      'commands.send'
    ],
    isSystem: true,
    canEdit: false
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to robots and telemetry',
    permissions: [
      'robot.view',
      'telemetry.view',
      'maintenance.view'
    ],
    isSystem: true,
    canEdit: false
  },
  {
    id: 'maintainer',
    name: 'Maintenance Technician',
    description: 'Focused on maintenance tasks and robot health',
    permissions: [
      'robot.view',
      'telemetry.view',
      'maintenance.view', 'maintenance.create', 'maintenance.update',
      'alerts.acknowledge'
    ],
    isSystem: true,
    canEdit: false
  }
]

export interface UseUserManagementReturn {
  users: User[]
  invitations: UserInvitation[]
  roles: Role[]
  userStats: UserStats
  isLoading: boolean
  error: string | null

  // User operations
  inviteUser: (email: string, role: string, permissions?: string[]) => Promise<void>
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>
  deactivateUser: (userId: string) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
  resendInvitation: (invitationId: string) => Promise<void>
  revokeInvitation: (invitationId: string) => Promise<void>

  // Role operations
  createRole: (role: Omit<Role, 'id' | 'isSystem'>) => Promise<void>
  updateRole: (roleId: string, updates: Partial<Role>) => Promise<void>
  deleteRole: (roleId: string) => Promise<void>

  // Utility functions
  getUserByEmail: (email: string) => User | undefined
  hasPermission: (userId: string, permission: string) => boolean
  refreshUsers: () => Promise<void>
}

export function useUserManagement(): UseUserManagementReturn {
  const { urfmp } = useURFMP()
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<UserInvitation[]>([])
  const [customRoles, setCustomRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize with mock data for demonstration
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, these would be API calls
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay

      // Mock users data
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@urfmp.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'admin',
          permissions: systemRoles.find(r => r.id === 'admin')?.permissions || [],
          isActive: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          organizationId: 'org-1'
        },
        {
          id: '2',
          email: 'operator@urfmp.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'operator',
          permissions: systemRoles.find(r => r.id === 'operator')?.permissions || [],
          isActive: true,
          lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          organizationId: 'org-1',
          invitedBy: '1'
        },
        {
          id: '3',
          email: 'maintainer@urfmp.com',
          firstName: 'Mike',
          lastName: 'Wilson',
          role: 'maintainer',
          permissions: systemRoles.find(r => r.id === 'maintainer')?.permissions || [],
          isActive: true,
          lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          organizationId: 'org-1',
          invitedBy: '1'
        },
        {
          id: '4',
          email: 'viewer@urfmp.com',
          firstName: 'Lisa',
          lastName: 'Chen',
          role: 'viewer',
          permissions: systemRoles.find(r => r.id === 'viewer')?.permissions || [],
          isActive: false,
          lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
          organizationId: 'org-1',
          invitedBy: '1'
        }
      ]

      // Mock invitations
      const mockInvitations: UserInvitation[] = [
        {
          id: 'inv-1',
          email: 'newuser@example.com',
          role: 'operator',
          permissions: systemRoles.find(r => r.id === 'operator')?.permissions || [],
          invitedBy: '1',
          invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          status: 'pending',
          inviteToken: 'token-123'
        }
      ]

      setUsers(mockUsers)
      setInvitations(mockInvitations)
      setError(null)
    } catch (err) {
      console.error('Failed to load user management data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const inviteUser = async (email: string, role: string, permissions?: string[]) => {
    try {
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        throw new Error('User with this email already exists')
      }

      // Check if invitation already exists
      if (invitations.find(i => i.email === email && i.status === 'pending')) {
        throw new Error('Invitation already sent to this email')
      }

      const selectedRole = systemRoles.find(r => r.id === role)
      if (!selectedRole) {
        throw new Error('Invalid role selected')
      }

      const newInvitation: UserInvitation = {
        id: `inv-${Date.now()}`,
        email,
        role: role as any,
        permissions: permissions || selectedRole.permissions,
        invitedBy: '1', // Current user ID
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
        inviteToken: `token-${Math.random().toString(36).substring(2)}`
      }

      setInvitations(prev => [...prev, newInvitation])

      // In real implementation, send email invitation
      console.log(`Invitation sent to ${email} for role ${role}`)
    } catch (err) {
      console.error('Failed to invite user:', err)
      throw err
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, ...updates } : user
      ))

      // In real implementation, make API call
      console.log(`User ${userId} updated:`, updates)
    } catch (err) {
      console.error('Failed to update user:', err)
      throw err
    }
  }

  const deactivateUser = async (userId: string) => {
    await updateUser(userId, { isActive: false })
  }

  const deleteUser = async (userId: string) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== userId))
      console.log(`User ${userId} deleted`)
    } catch (err) {
      console.error('Failed to delete user:', err)
      throw err
    }
  }

  const resendInvitation = async (invitationId: string) => {
    try {
      setInvitations(prev => prev.map(inv =>
        inv.id === invitationId
          ? { ...inv, invitedAt: new Date(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
          : inv
      ))
      console.log(`Invitation ${invitationId} resent`)
    } catch (err) {
      console.error('Failed to resend invitation:', err)
      throw err
    }
  }

  const revokeInvitation = async (invitationId: string) => {
    try {
      setInvitations(prev => prev.map(inv =>
        inv.id === invitationId ? { ...inv, status: 'revoked' } : inv
      ))
      console.log(`Invitation ${invitationId} revoked`)
    } catch (err) {
      console.error('Failed to revoke invitation:', err)
      throw err
    }
  }

  const createRole = async (role: Omit<Role, 'id' | 'isSystem'>) => {
    try {
      const newRole: Role = {
        ...role,
        id: `role-${Date.now()}`,
        isSystem: false,
        canEdit: true
      }
      setCustomRoles(prev => [...prev, newRole])
      console.log('Custom role created:', newRole)
    } catch (err) {
      console.error('Failed to create role:', err)
      throw err
    }
  }

  const updateRole = async (roleId: string, updates: Partial<Role>) => {
    try {
      setCustomRoles(prev => prev.map(role =>
        role.id === roleId ? { ...role, ...updates } : role
      ))
      console.log(`Role ${roleId} updated:`, updates)
    } catch (err) {
      console.error('Failed to update role:', err)
      throw err
    }
  }

  const deleteRole = async (roleId: string) => {
    try {
      const role = customRoles.find(r => r.id === roleId)
      if (role?.isSystem) {
        throw new Error('Cannot delete system roles')
      }

      setCustomRoles(prev => prev.filter(role => role.id !== roleId))
      console.log(`Role ${roleId} deleted`)
    } catch (err) {
      console.error('Failed to delete role:', err)
      throw err
    }
  }

  const getUserByEmail = (email: string): User | undefined => {
    return users.find(user => user.email === email)
  }

  const hasPermission = (userId: string, permission: string): boolean => {
    const user = users.find(u => u.id === userId)
    return user?.permissions.includes(permission) || false
  }

  const refreshUsers = async () => {
    await loadInitialData()
  }

  // Calculate user statistics
  const userStats: UserStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    pendingInvitations: invitations.filter(i => i.status === 'pending').length,
    recentLogins: users.filter(u => u.lastLogin && u.lastLogin > new Date(Date.now() - 24 * 60 * 60 * 1000)).length
  }

  // Combine system and custom roles
  const allRoles = [...systemRoles, ...customRoles]

  return {
    users,
    invitations,
    roles: allRoles,
    userStats,
    isLoading,
    error,
    inviteUser,
    updateUser,
    deactivateUser,
    deleteUser,
    resendInvitation,
    revokeInvitation,
    createRole,
    updateRole,
    deleteRole,
    getUserByEmail,
    hasPermission,
    refreshUsers
  }
}