import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthUser, AuthOrganization, LoginRequest, AuthToken } from '@urfmp/types'
import { toast } from 'sonner'
import {
  storeAuthData,
  getAuthData,
  clearAuthData,
  isTokenExpired,
  shouldRefreshToken,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from '../lib/auth'

interface AuthContextType {
  user: AuthUser | null
  organization: AuthOrganization | null
  tokens: AuthToken | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  refreshToken: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  organizationName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [organization, setOrganization] = useState<AuthOrganization | null>(null)
  const [tokens, setTokens] = useState<AuthToken | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null)

  const apiUrl = import.meta.env.VITE_URFMP_API_URL || 'http://localhost:3000'

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const authData = getAuthData()

        if (!authData) {
          setIsLoading(false)
          return
        }

        // Check if access token is expired
        if (isTokenExpired(authData.tokens.accessToken)) {
          console.log('Access token expired, attempting refresh...')
          await refreshTokens()
        } else {
          setUser(authData.user)
          setOrganization(authData.organization)
          setTokens(authData.tokens)
          scheduleTokenRefresh(authData.tokens.accessToken)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Cleanup timer on unmount
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer)
      }
    }
  }, [])

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback((accessToken: string) => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }

    // Refresh token 5 minutes before expiry
    const shouldRefresh = shouldRefreshToken(accessToken)
    if (shouldRefresh) {
      const timer = setTimeout(() => {
        refreshTokens()
      }, 2 * 60 * 1000) // Check every 2 minutes
      setRefreshTimer(timer)
    }
  }, [refreshTimer])

  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)

      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Login failed')
      }

      if (!result.success || !result.data) {
        throw new Error('Invalid response from server')
      }

      const { user: userData, organization: orgData, tokens: tokenData } = result.data

      // Store auth data
      storeAuthData({
        user: userData,
        organization: orgData,
        tokens: tokenData,
      })

      setUser(userData)
      setOrganization(orgData)
      setTokens(tokenData)

      scheduleTokenRefresh(tokenData.accessToken)

      toast.success(`Welcome back, ${userData.firstName}!`)
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      const refreshToken = getRefreshToken()
      const accessToken = getAccessToken()

      // Call logout endpoint if we have tokens
      if (accessToken && refreshToken) {
        try {
          await fetch(`${apiUrl}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refreshToken }),
          })
        } catch (error) {
          // Ignore logout endpoint errors, still clear local state
          console.error('Logout endpoint error:', error)
        }
      }

      // Clear local state
      clearAuthData()
      setUser(null)
      setOrganization(null)
      setTokens(null)

      if (refreshTimer) {
        clearTimeout(refreshTimer)
      }

      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  // Register function
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true)

      const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Registration failed')
      }

      if (!result.success || !result.data) {
        throw new Error('Invalid response from server')
      }

      const { user: userData, organization: orgData, tokens: tokenData } = result.data

      // Store auth data
      storeAuthData({
        user: userData,
        organization: orgData,
        tokens: tokenData,
      })

      setUser(userData)
      setOrganization(orgData)
      setTokens(tokenData)

      scheduleTokenRefresh(tokenData.accessToken)

      toast.success(`Welcome to URFMP, ${userData.firstName}!`)
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error instanceof Error ? error.message : 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh token function
  const refreshTokens = async () => {
    try {
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Token refresh failed')
      }

      if (!result.success || !result.data?.tokens) {
        throw new Error('Invalid response from server')
      }

      const newTokens = result.data.tokens

      // Update tokens
      updateAccessToken(newTokens.accessToken)
      setTokens(newTokens)

      scheduleTokenRefresh(newTokens.accessToken)

      console.log('Token refreshed successfully')
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, logout user
      await logout()
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    organization,
    tokens,
    isAuthenticated: !!(user && tokens),
    isLoading,
    login,
    logout,
    register,
    refreshToken: refreshTokens,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
