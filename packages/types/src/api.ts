export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  pagination?: PaginationInfo
  metadata?: ResponseMetadata
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  traceId?: string
  timestamp: Date
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ResponseMetadata {
  requestId: string
  timestamp: Date
  version: string
  executionTime?: number
}

export interface ListRequest {
  page?: number
  limit?: number
  sort?: string
  order?: SortOrder
  filter?: Record<string, any>
  search?: string
}

export interface PaginationOptions {
  page?: number
  limit?: number
  sort?: string
  order?: SortOrder
}

export interface PaginationResult<T = any> {
  data: T[]
  pagination: PaginationInfo
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface BulkOperation<T> {
  operation: BulkOperationType
  items: T[]
  options?: BulkOperationOptions
}

export enum BulkOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  UPSERT = 'upsert',
}

export interface BulkOperationOptions {
  continueOnError?: boolean
  batchSize?: number
  validateBeforeExecution?: boolean
}

export interface BulkOperationResult<T> {
  successful: T[]
  failed: BulkOperationError[]
  summary: BulkOperationSummary
}

export interface BulkOperationError {
  item: any
  error: ApiError
  index: number
}

export interface BulkOperationSummary {
  total: number
  successful: number
  failed: number
  skipped: number
  executionTime: number
}

export interface HealthCheck {
  status: HealthStatus
  checks: ServiceHealth[]
  timestamp: Date
  version: string
  uptime: number
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface ServiceHealth {
  name: string
  status: HealthStatus
  message?: string
  responseTime?: number
  details?: Record<string, any>
}

export interface ApiMetrics {
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
  activeConnections: number
  uptime: number
  memoryUsage: MemoryUsage
  cpuUsage: number
}

export interface MemoryUsage {
  used: number
  total: number
  percentage: number
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date
  retryAfter?: number
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

export interface FileUpload {
  fieldName: string
  originalName: string
  encoding: string
  mimetype: string
  size: number
  destination: string
  filename: string
  path: string
}

export interface ExportRequest {
  format: ExportFormat
  filters?: Record<string, any>
  fields?: string[]
  dateRange?: DateRange
  options?: ExportOptions
}

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx',
  PDF = 'pdf',
  XML = 'xml',
}

export interface DateRange {
  start: Date
  end: Date
}

export interface ExportOptions {
  includeHeaders?: boolean
  delimiter?: string
  encoding?: string
  compression?: boolean
  password?: string
}

export interface ImportRequest {
  file: FileUpload
  format: ImportFormat
  options?: ImportOptions
  mapping?: FieldMapping[]
}

export enum ImportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx',
  XML = 'xml',
}

export interface ImportOptions {
  skipFirstRow?: boolean
  delimiter?: string
  encoding?: string
  validateOnly?: boolean
  updateExisting?: boolean
  batchSize?: number
}

export interface FieldMapping {
  sourceField: string
  targetField: string
  transform?: string
  required?: boolean
  defaultValue?: any
}

export interface ImportResult {
  totalRows: number
  successfulRows: number
  failedRows: number
  errors: ImportError[]
  summary: ImportSummary
}

export interface ImportError {
  row: number
  field?: string
  message: string
  value?: any
}

export interface ImportSummary {
  created: number
  updated: number
  skipped: number
  duplicates: number
  executionTime: number
}
