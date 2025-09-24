import { query } from '../config/database'
import { cache } from '../config/redis'
import { logger } from '../config/logger'
import { getWebSocketService } from './websocket.service'
import { Robot, PaginationOptions, PaginationResult } from '@urfmp/types'
import { ValidationError, NotFoundError } from '../middleware/error.middleware'

export interface CreateRobotRequest {
  name: string
  model: string
  vendor: string
  serialNumber: string
  firmwareVersion?: string
  location?: Record<string, any>
  configuration?: Record<string, any>
}

export interface UpdateRobotRequest {
  name?: string
  model?: string
  vendor?: string
  serialNumber?: string
  firmwareVersion?: string
  status?: string
  location?: Record<string, any>
  configuration?: Record<string, any>
}

export interface RobotFilters {
  status?: string
  vendor?: string
  model?: string
  search?: string
}

export class RobotService {
  /**
   * Get all robots for an organization
   */
  async getRobots(
    organizationId: string,
    filters: RobotFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<PaginationResult<Robot>> {
    const { page = 1, limit = 20 } = pagination
    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = ['organization_id = $1']
    const params: any[] = [organizationId]
    let paramIndex = 2

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }

    if (filters.vendor) {
      conditions.push(`vendor = $${paramIndex}`)
      params.push(filters.vendor)
      paramIndex++
    }

    if (filters.model) {
      conditions.push(`model ILIKE $${paramIndex}`)
      params.push(`%${filters.model}%`)
      paramIndex++
    }

    if (filters.search) {
      conditions.push(`(name ILIKE $${paramIndex} OR serial_number ILIKE $${paramIndex + 1})`)
      params.push(`%${filters.search}%`, `%${filters.search}%`)
      paramIndex += 2
    }

    const whereClause = conditions.join(' AND ')

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM robots WHERE ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].total)

    // Get robots
    const robotsResult = await query(
      `SELECT id, organization_id, name, model, vendor, serial_number,
              firmware_version, status, location, configuration,
              last_seen, created_at, updated_at
       FROM robots
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    )

    const robots: Robot[] = robotsResult.rows.map((row: any) => ({
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      model: row.model,
      vendor: row.vendor,
      serialNumber: row.serial_number,
      firmwareVersion: row.firmware_version,
      status: row.status,
      location: row.location || {},
      configuration: row.configuration || {},
      lastSeen: row.last_seen,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    const totalPages = Math.ceil(total / limit)

    return {
      data: robots,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  /**
   * Get a single robot by ID
   */
  async getRobotById(robotId: string, organizationId: string): Promise<Robot | null> {
    const cacheKey = `robot:${robotId}`

    // Try cache first
    let robot = await cache.get(cacheKey)
    if (robot) {
      return robot
    }

    const result = await query(
      `SELECT id, organization_id, name, model, vendor, serial_number,
              firmware_version, status, location, configuration,
              last_seen, created_at, updated_at
       FROM robots
       WHERE id = $1 AND organization_id = $2`,
      [robotId, organizationId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    robot = {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      model: row.model,
      vendor: row.vendor,
      serialNumber: row.serial_number,
      firmwareVersion: row.firmware_version,
      status: row.status,
      location: row.location || {},
      configuration: row.configuration || {},
      lastSeen: row.last_seen,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, robot, 300)

    return robot
  }

  /**
   * Create a new robot
   */
  async createRobot(organizationId: string, robotData: CreateRobotRequest): Promise<Robot> {
    // Validate input
    if (!robotData.name || !robotData.model || !robotData.vendor || !robotData.serialNumber) {
      throw new ValidationError('Name, model, vendor, and serial number are required')
    }

    // Check if serial number is unique within organization
    const existingRobot = await query(
      'SELECT id FROM robots WHERE organization_id = $1 AND serial_number = $2',
      [organizationId, robotData.serialNumber]
    )

    if (existingRobot.rows.length > 0) {
      throw new ValidationError(
        'A robot with this serial number already exists in your organization'
      )
    }

    try {
      const result = await query(
        `INSERT INTO robots (
          organization_id, name, model, vendor, serial_number,
          firmware_version, location, configuration
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, organization_id, name, model, vendor, serial_number,
                  firmware_version, status, location, configuration,
                  last_seen, created_at, updated_at`,
        [
          organizationId,
          robotData.name,
          robotData.model,
          robotData.vendor,
          robotData.serialNumber,
          robotData.firmwareVersion,
          robotData.location ? JSON.stringify(robotData.location) : '{}',
          robotData.configuration ? JSON.stringify(robotData.configuration) : '{}',
        ]
      )

      const row = result.rows[0]
      const robot: Robot = {
        id: row.id,
        organizationId: row.organization_id,
        name: row.name,
        model: row.model,
        vendor: row.vendor,
        serialNumber: row.serial_number,
        firmwareVersion: row.firmware_version,
        status: row.status,
        location: row.location || {},
        configuration: row.configuration || {},
        lastSeen: row.last_seen,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }

      logger.info('Robot created', {
        robotId: robot.id,
        organizationId,
        name: robot.name,
        vendor: robot.vendor,
      })

      return robot
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ValidationError('A robot with this serial number already exists')
      }
      logger.error('Failed to create robot', {
        organizationId,
        robotData,
        error: (error as Error).message,
      })
      throw error
    }
  }

  /**
   * Update a robot
   */
  async updateRobot(
    robotId: string,
    organizationId: string,
    updateData: UpdateRobotRequest
  ): Promise<Robot> {
    // Check if robot exists
    const existingRobot = await this.getRobotById(robotId, organizationId)
    if (!existingRobot) {
      throw new NotFoundError('Robot not found')
    }

    // Build update query
    const updateFields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (updateData.name !== undefined) {
      updateFields.push(`name = $${paramIndex}`)
      params.push(updateData.name)
      paramIndex++
    }

    if (updateData.model !== undefined) {
      updateFields.push(`model = $${paramIndex}`)
      params.push(updateData.model)
      paramIndex++
    }

    if (updateData.vendor !== undefined) {
      updateFields.push(`vendor = $${paramIndex}`)
      params.push(updateData.vendor)
      paramIndex++
    }

    if (updateData.serialNumber !== undefined) {
      // Check if new serial number is unique
      const existingSerial = await query(
        'SELECT id FROM robots WHERE organization_id = $1 AND serial_number = $2 AND id != $3',
        [organizationId, updateData.serialNumber, robotId]
      )

      if (existingSerial.rows.length > 0) {
        throw new ValidationError('A robot with this serial number already exists')
      }

      updateFields.push(`serial_number = $${paramIndex}`)
      params.push(updateData.serialNumber)
      paramIndex++
    }

    if (updateData.firmwareVersion !== undefined) {
      updateFields.push(`firmware_version = $${paramIndex}`)
      params.push(updateData.firmwareVersion)
      paramIndex++
    }

    if (updateData.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      params.push(updateData.status)
      paramIndex++
    }

    if (updateData.location !== undefined) {
      updateFields.push(`location = $${paramIndex}`)
      params.push(JSON.stringify(updateData.location))
      paramIndex++
    }

    if (updateData.configuration !== undefined) {
      updateFields.push(`configuration = $${paramIndex}`)
      params.push(JSON.stringify(updateData.configuration))
      paramIndex++
    }

    if (updateFields.length === 0) {
      return existingRobot
    }

    // Always update last_seen when status changes
    if (updateData.status !== undefined) {
      updateFields.push(`last_seen = NOW()`)
    }

    params.push(robotId, organizationId)

    const result = await query(
      `UPDATE robots
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex} AND organization_id = $${paramIndex + 1}
       RETURNING id, organization_id, name, model, vendor, serial_number,
                 firmware_version, status, location, configuration,
                 last_seen, created_at, updated_at`,
      params
    )

    const row = result.rows[0]
    const robot: Robot = {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      model: row.model,
      vendor: row.vendor,
      serialNumber: row.serial_number,
      firmwareVersion: row.firmware_version,
      status: row.status,
      location: row.location || {},
      configuration: row.configuration || {},
      lastSeen: row.last_seen,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }

    // Invalidate cache
    await cache.del(`robot:${robotId}`)

    // Broadcast robot update via WebSocket if status changed
    if (updateData.status && updateData.status !== existingRobot.status) {
      try {
        const wsService = getWebSocketService()
        wsService.broadcastToChannel(`robot:${robotId}`, {
          event: 'robot:status_changed',
          robotId,
          organizationId,
          oldStatus: existingRobot.status,
          newStatus: updateData.status,
          robot,
          timestamp: new Date(),
        })
      } catch (error) {
        logger.warn('Failed to broadcast robot status change', {
          robotId,
          error: (error as Error).message,
        })
      }
    }

    logger.info('Robot updated', {
      robotId,
      organizationId,
      updateData,
    })

    return robot
  }

  /**
   * Delete a robot
   */
  async deleteRobot(robotId: string, organizationId: string): Promise<void> {
    const result = await query('DELETE FROM robots WHERE id = $1 AND organization_id = $2', [
      robotId,
      organizationId,
    ])

    if (result.rowCount === 0) {
      throw new NotFoundError('Robot not found')
    }

    // Invalidate cache
    await cache.del(`robot:${robotId}`)

    logger.info('Robot deleted', {
      robotId,
      organizationId,
    })
  }

  /**
   * Get robot statistics for organization
   */
  async getRobotStats(organizationId: string): Promise<{
    total: number
    online: number
    offline: number
    error: number
    byVendor: Record<string, number>
    byStatus: Record<string, number>
  }> {
    const statsResult = await query(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE status = 'online') as online,
         COUNT(*) FILTER (WHERE status = 'offline') as offline,
         COUNT(*) FILTER (WHERE status = 'error') as error,
         vendor,
         status
       FROM robots
       WHERE organization_id = $1
       GROUP BY vendor, status`,
      [organizationId]
    )

    const byVendor: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    let total = 0
    let online = 0
    let offline = 0
    let error = 0

    for (const row of statsResult.rows) {
      const vendor = row.vendor
      const status = row.status
      const count = parseInt(row.total)

      byVendor[vendor] = (byVendor[vendor] || 0) + count
      byStatus[status] = (byStatus[status] || 0) + count

      total += count
      if (status === 'online') online += count
      if (status === 'offline') offline += count
      if (status === 'error') error += count
    }

    return {
      total,
      online,
      offline,
      error,
      byVendor,
      byStatus,
    }
  }
}

export const robotService = new RobotService()
