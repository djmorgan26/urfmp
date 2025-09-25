import { ApiResponse, ApiError, PaginationInfo, SortOrder, HealthStatus } from '../api'

describe('API Types', () => {
  describe('ApiResponse interface', () => {
    it('should accept successful response with data', () => {
      const successResponse: ApiResponse<{ name: string }> = {
        success: true,
        data: { name: 'Test Data' }
      }

      expect(successResponse.success).toBe(true)
      expect(successResponse.data?.name).toBe('Test Data')
      expect(successResponse.error).toBeUndefined()
    })

    it('should accept error response', () => {
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: { field: 'name is required' },
          traceId: 'trace-123',
          timestamp: new Date()
        }
      }

      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error?.code).toBe('VALIDATION_ERROR')
      expect(errorResponse.error?.message).toBe('Invalid input data')
      expect(errorResponse.data).toBeUndefined()
    })

    it('should accept response with pagination info', () => {
      const paginatedResponse: ApiResponse<any[]> = {
        success: true,
        data: [1, 2, 3],
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10,
          hasNext: true,
          hasPrev: false
        }
      }

      expect(paginatedResponse.pagination?.page).toBe(1)
      expect(paginatedResponse.pagination?.total).toBe(100)
      expect(paginatedResponse.pagination?.hasNext).toBe(true)
      expect(paginatedResponse.pagination?.hasPrev).toBe(false)
    })
  })

  describe('ApiError interface', () => {
    it('should require code, message, and timestamp', () => {
      const minimalError: ApiError = {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        timestamp: new Date()
      }

      expect(minimalError.code).toBe('INTERNAL_ERROR')
      expect(minimalError.message).toBe('Something went wrong')
      expect(minimalError.timestamp).toBeInstanceOf(Date)
      expect(minimalError.details).toBeUndefined()
      expect(minimalError.traceId).toBeUndefined()
    })

    it('should accept optional details and traceId', () => {
      const detailedError: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Multiple validation errors',
        details: {
          name: 'Name is required',
          email: 'Invalid email format'
        },
        traceId: 'trace-abc-123',
        timestamp: new Date()
      }

      expect(detailedError.details?.name).toBe('Name is required')
      expect(detailedError.traceId).toBe('trace-abc-123')
    })
  })

  describe('PaginationInfo interface', () => {
    it('should validate pagination calculations', () => {
      const pagination: PaginationInfo = {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true
      }

      expect(pagination.page).toBe(2)
      expect(pagination.limit).toBe(10)
      expect(pagination.total).toBe(25)
      expect(Math.ceil(pagination.total / pagination.limit)).toBe(pagination.totalPages)
      expect(pagination.hasNext).toBe(true) // page 2 of 3
      expect(pagination.hasPrev).toBe(true) // page 2 has previous
    })

    it('should handle first page pagination', () => {
      const firstPage: PaginationInfo = {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false
      }

      expect(firstPage.page).toBe(1)
      expect(firstPage.hasPrev).toBe(false)
      expect(firstPage.hasNext).toBe(true)
    })

    it('should handle last page pagination', () => {
      const lastPage: PaginationInfo = {
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: false,
        hasPrev: true
      }

      expect(lastPage.page).toBe(3)
      expect(lastPage.hasNext).toBe(false)
      expect(lastPage.hasPrev).toBe(true)
    })
  })

  describe('SortOrder enum', () => {
    it('should have correct sort order values', () => {
      expect(SortOrder.ASC).toBe('asc')
      expect(SortOrder.DESC).toBe('desc')
    })

    it('should contain all defined values', () => {
      const sortValues = Object.values(SortOrder)
      expect(sortValues).toHaveLength(2)
      expect(sortValues).toContain('asc')
      expect(sortValues).toContain('desc')
    })
  })

  describe('HealthStatus enum', () => {
    it('should have all expected health status values', () => {
      expect(HealthStatus.HEALTHY).toBe('healthy')
      expect(HealthStatus.DEGRADED).toBe('degraded')
      expect(HealthStatus.UNHEALTHY).toBe('unhealthy')
    })

    it('should contain all defined values', () => {
      const healthValues = Object.values(HealthStatus)
      expect(healthValues).toHaveLength(3)
      expect(healthValues).toContain('healthy')
      expect(healthValues).toContain('degraded')
      expect(healthValues).toContain('unhealthy')
    })
  })
})