// Minimal types for production build without full packages
export type RobotStatus =
  | 'online'
  | 'offline'
  | 'error'
  | 'maintenance'
  | 'running'
  | 'idle'
  | 'stopped'
  | 'emergency_stop'

export interface Robot {
  id: string
  organizationId?: string
  name: string
  model?: string
  type: string
  vendor?: string
  status: RobotStatus
  batteryLevel?: number
  location?: {
    facility?: string
    cell?: string
    coordinates?: { x: number; y: number; z?: number }
  }
  configuration?: {
    payload?: number
    reach?: number
    repeatability?: number
    joints?: number
  }
  lastSeen?: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
  firmwareVersion?: string
  capabilities?: string[]
  ipAddress?: string
}

export interface RobotTelemetry {
  robotId: string
  timestamp: Date | string
  data: Record<string, any>
}

export interface BrandConfig {
  companyName: string
  productName: string
  productFullName: string
  tagline: string
  description: string
}

export const getBrandConfig = (): BrandConfig => ({
  companyName: import.meta.env.VITE_COMPANY_NAME || 'URFMP',
  productName: import.meta.env.VITE_PRODUCT_NAME || 'URFMP',
  productFullName:
    import.meta.env.VITE_PRODUCT_FULL_NAME || 'Universal Robot Fleet Management Platform',
  tagline: import.meta.env.VITE_TAGLINE || 'The Stripe of Robotics',
  description: import.meta.env.VITE_DESCRIPTION || 'Monitor any robot in 7 lines of code',
})
