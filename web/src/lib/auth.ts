/**
 * Authentication utility functions
 * Handles token storage, retrieval, and validation
 */

import { AuthToken, AuthUser, AuthOrganization } from '@urfmp/types'

const ACCESS_TOKEN_KEY = 'urfmp_access_token'
const REFRESH_TOKEN_KEY = 'urfmp_refresh_token'
const USER_KEY = 'urfmp_user'
const ORG_KEY = 'urfmp_organization'

export interface StoredAuthData {
  user: AuthUser
  organization: AuthOrganization
  tokens: AuthToken
}

/**
 * Store authentication data in localStorage
 */
export function storeAuthData(data: StoredAuthData): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.tokens.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    localStorage.setItem(ORG_KEY, JSON.stringify(data.organization))
  } catch (error) {
    console.error('Failed to store auth data:', error)
  }
}

/**
 * Retrieve authentication data from localStorage
 */
export function getAuthData(): StoredAuthData | null {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const userStr = localStorage.getItem(USER_KEY)
    const orgStr = localStorage.getItem(ORG_KEY)

    if (!accessToken || !refreshToken || !userStr || !orgStr) {
      return null
    }

    const user = JSON.parse(userStr) as AuthUser
    const organization = JSON.parse(orgStr) as AuthOrganization

    return {
      user,
      organization,
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        scope: user.permissions,
      },
    }
  } catch (error) {
    console.error('Failed to retrieve auth data:', error)
    return null
  }
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthData(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(ORG_KEY)
    sessionStorage.clear()
  } catch (error) {
    console.error('Failed to clear auth data:', error)
  }
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Update access token (after refresh)
 */
export function updateAccessToken(accessToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

/**
 * Check if user is authenticated (has valid tokens)
 */
export function isAuthenticated(): boolean {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  return !!(accessToken && refreshToken)
}

/**
 * Decode JWT token (without verification - only for reading payload)
 */
export function decodeToken(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = atob(payload)
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) {
      return true
    }

    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

/**
 * Check if token needs refresh (expires in < 5 minutes)
 */
export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) {
      return true
    }

    const currentTime = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = decoded.exp - currentTime
    const fiveMinutes = 5 * 60

    return timeUntilExpiry < fiveMinutes
  } catch (error) {
    return true
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  errors: string[]
} {
  const errors: string[] = []
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(
    Boolean
  ).length

  if (password.length >= 8 && criteriaCount >= 2) {
    strength = 'medium'
  }
  if (password.length >= 12 && criteriaCount >= 3) {
    strength = 'strong'
  }

  if (!hasLowerCase && !hasUpperCase) {
    errors.push('Include both uppercase and lowercase letters')
  }
  if (!hasNumber) {
    errors.push('Include at least one number')
  }
  if (!hasSpecialChar && password.length < 12) {
    errors.push('Consider adding special characters for stronger security')
  }

  return {
    isValid: errors.length === 0 && password.length >= 8,
    strength,
    errors,
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
