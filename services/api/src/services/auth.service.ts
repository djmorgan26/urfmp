import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import {
  AuthPayload,
  AuthToken,
  LoginRequest,
  LoginResponse,
  AuthUser,
  AuthOrganization,
} from '@urfmp/types'
import { query } from '../config/database'
import { cache } from '../config/redis'
import { logger } from '../config/logger'
import { UnauthorizedError, ValidationError } from '../middleware/error.middleware'

export class AuthService {
  private readonly jwtSecret: string
  private readonly jwtRefreshSecret: string
  private readonly accessTokenExpiry = '1h'
  private readonly refreshTokenExpiry = '7d'

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'development-secret-key'
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-key'

    if (
      process.env.NODE_ENV === 'production' &&
      (this.jwtSecret === 'development-secret-key' ||
        this.jwtRefreshSecret === 'development-refresh-secret-key')
    ) {
      throw new Error('JWT secrets must be set in production environment')
    }
  }

  /**
   * Generate JWT access and refresh tokens
   */
  generateTokens(user: AuthUser, organization: AuthOrganization): AuthToken {
    const payload: Omit<AuthPayload, 'iat' | 'exp'> = {
      sub: user.id,
      org: organization.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      scope: user.permissions,
      aud: 'urfmp-api',
      iss: 'urfmp',
    }

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    })

    const refreshToken = jwt.sign(
      { sub: user.id, org: organization.id, type: 'refresh' },
      this.jwtRefreshSecret,
      { expiresIn: this.refreshTokenExpiry }
    )

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour in seconds
      scope: user.permissions,
    }
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthPayload
    } catch (error) {
      if ((error as any).name === 'TokenExpiredError') {
        throw new UnauthorizedError('Access token expired')
      } else if ((error as any).name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid access token')
      }
      throw error
    }
  }

  /**
   * Verify JWT refresh token
   */
  verifyRefreshToken(token: string): { sub: string; org: string; type: string } {
    try {
      return jwt.verify(token, this.jwtRefreshSecret) as { sub: string; org: string; type: string }
    } catch (error) {
      if ((error as any).name === 'TokenExpiredError') {
        throw new UnauthorizedError('Refresh token expired')
      } else if ((error as any).name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid refresh token')
      }
      throw error
    }
  }

  /**
   * Login user with email and password
   */
  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const { email, password, organizationSlug } = loginRequest

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required')
    }

    // Find user by email and organization
    let userQuery = `
      SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.role,
             u.permissions, u.organization_id,
             o.id as org_id, o.name as org_name, o.slug as org_slug, o.plan as org_plan
      FROM users u
      JOIN organizations o ON u.organization_id = o.id
      WHERE u.email = $1
    `
    const params = [email.toLowerCase()]

    if (organizationSlug) {
      userQuery += ' AND o.slug = $2'
      params.push(organizationSlug)
    }

    const result = await query(userQuery, params)

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const userRow = result.rows[0]

    // Verify password (temporary simple check for testing)
    const isValidPassword =
      password === userRow.password_hash || (await bcrypt.compare(password, userRow.password_hash))
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password')
    }

    // Email verification check disabled for existing schema
    // if (!userRow.email_verified) {
    //   throw new UnauthorizedError('Email not verified. Please check your email for verification link.')
    // }

    // Create user and organization objects
    const user: AuthUser = {
      id: userRow.id,
      email: userRow.email,
      firstName: userRow.first_name,
      lastName: userRow.last_name,
      role: userRow.role,
      permissions: userRow.permissions || [],
    }

    const organization: AuthOrganization = {
      id: userRow.org_id,
      name: userRow.org_name,
      slug: userRow.org_slug,
      plan: userRow.org_plan,
    }

    // Generate tokens
    const tokens = this.generateTokens(user, organization)

    // Update last login timestamp
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id])

    // Store refresh token in cache (for logout functionality)
    await cache.set(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 60 * 60) // 7 days

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      organizationId: organization.id,
    })

    return {
      user,
      organization,
      tokens,
    }
  }

  /**
   * Logout user by invalidating tokens
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      // Remove refresh token from cache
      await cache.del(`refresh_token:${userId}`)

      // Optionally, add token to blacklist for additional security
      if (refreshToken) {
        this.verifyRefreshToken(refreshToken) // Validate token before blacklisting
        await cache.set(`blacklisted_token:${refreshToken}`, 'true', 7 * 24 * 60 * 60) // 7 days
      }

      logger.info('User logged out successfully', { userId })
    } catch (error) {
      logger.error('Error during logout', { userId, error: (error as Error).message })
      throw error
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthToken> {
    // Verify refresh token
    const decoded = this.verifyRefreshToken(refreshToken)

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type')
    }

    // Check if token is blacklisted
    const isBlacklisted = await cache.get(`blacklisted_token:${refreshToken}`)
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked')
    }

    // Check if stored refresh token matches
    const storedToken = await cache.get(`refresh_token:${decoded.sub}`)
    if (storedToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token')
    }

    // Get user details
    const user = await this.getUserById(decoded.sub)
    if (!user) {
      throw new UnauthorizedError('User not found or inactive')
    }

    // Get organization details
    const organization = await this.getOrganizationById(decoded.org)
    if (!organization) {
      throw new UnauthorizedError('Organization not found or inactive')
    }

    // Generate new tokens
    const newTokens = this.generateTokens(user, organization)

    // Update stored refresh token
    await cache.set(`refresh_token:${decoded.sub}`, newTokens.refreshToken, 7 * 24 * 60 * 60)

    // Blacklist old refresh token
    await cache.set(`blacklisted_token:${refreshToken}`, 'true', 7 * 24 * 60 * 60)

    return newTokens
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Get user by ID with caching
   */
  private async getUserById(userId: string): Promise<AuthUser | null> {
    const cacheKey = `user:${userId}`

    // Try cache first
    let user = await cache.get(cacheKey)
    if (user) {
      return user
    }

    // Query database
    const result = await query(
      `SELECT id, email, first_name, last_name, role, permissions
       FROM users WHERE id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const userRow = result.rows[0]
    user = {
      id: userRow.id,
      email: userRow.email,
      firstName: userRow.first_name,
      lastName: userRow.last_name,
      role: userRow.role,
      permissions: userRow.permissions || [],
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, user, 300)

    return user
  }

  /**
   * Register a new user and organization
   */
  async register(registrationData: {
    email: string
    password: string
    firstName: string
    lastName: string
    organizationName: string
  }): Promise<LoginResponse> {
    const { email, password, firstName, lastName, organizationName } = registrationData

    // Validate input
    if (!email || !password || !firstName || !lastName || !organizationName) {
      throw new ValidationError('All fields are required')
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format')
    }

    const normalizedEmail = email.toLowerCase()

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])

    if (existingUser.rows.length > 0) {
      throw new ValidationError('User with this email already exists')
    }

    // Create organization slug
    const organizationSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50)

    // Check if organization slug already exists
    const existingOrg = await query('SELECT id FROM organizations WHERE slug = $1', [
      organizationSlug,
    ])

    let finalSlug = organizationSlug
    if (existingOrg.rows.length > 0) {
      finalSlug = `${organizationSlug}-${Date.now()}`
    }

    // Begin transaction
    await query('BEGIN')

    try {
      // Create organization
      const orgResult = await query(
        `INSERT INTO organizations (name, slug, description, plan, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, name, slug, plan`,
        [organizationName, finalSlug, `Organization for ${organizationName}`, 'free']
      )

      const organization = orgResult.rows[0]

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user
      const userResult = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, organization_id, is_active, email_verified, permissions)
         VALUES ($1, $2, $3, $4, $5, $6, true, true, $7)
         RETURNING id, email, first_name, last_name, role, permissions`,
        [
          normalizedEmail,
          hashedPassword,
          firstName,
          lastName,
          'admin', // First user in organization is admin
          organization.id,
          [
            'robot.view',
            'robot.create',
            'robot.update',
            'robot.delete',
            'telemetry.view',
            'telemetry.write',
            'maintenance.view',
            'maintenance.create',
            'maintenance.update',
            'user.view',
            'user.create',
            'organization.view',
            'organization.update',
          ],
        ]
      )

      const user = userResult.rows[0]

      // Commit transaction
      await query('COMMIT')

      // Create user and organization objects
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        permissions: user.permissions,
      }

      const authOrganization: AuthOrganization = {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        plan: organization.plan,
      }

      // Generate tokens
      const tokens = this.generateTokens(authUser, authOrganization)

      // Store refresh token in cache
      await cache.set(`refresh_token:${authUser.id}`, tokens.refreshToken, 7 * 24 * 60 * 60)

      logger.info('User registered successfully', {
        userId: authUser.id,
        email: authUser.email,
        organizationId: authOrganization.id,
        organizationName: authOrganization.name,
      })

      return {
        user: authUser,
        organization: authOrganization,
        tokens,
      }
    } catch (error) {
      // Rollback transaction
      await query('ROLLBACK')
      logger.error('User registration failed', {
        email: normalizedEmail,
        error: (error as Error).message,
      })
      throw error
    }
  }

  /**
   * Get organization by ID with caching
   */
  private async getOrganizationById(organizationId: string): Promise<AuthOrganization | null> {
    const cacheKey = `organization:${organizationId}`

    // Try cache first
    let organization = await cache.get(cacheKey)
    if (organization) {
      return organization
    }

    // Query database
    const result = await query(
      `SELECT id, name, slug, plan
       FROM organizations WHERE id = $1`,
      [organizationId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const orgRow = result.rows[0]
    organization = {
      id: orgRow.id,
      name: orgRow.name,
      slug: orgRow.slug,
      plan: orgRow.plan,
    }

    // Cache for 10 minutes
    await cache.set(cacheKey, organization, 600)

    return organization
  }
}

export const authService = new AuthService()
