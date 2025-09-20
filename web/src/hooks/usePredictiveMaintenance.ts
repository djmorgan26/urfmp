import { useState, useEffect } from 'react'
import { useURFMP } from './useURFMP'

export interface MaintenanceAlert {
  id: string
  robotId: string
  robotName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: 'scheduled' | 'predictive' | 'reactive'
  component: string
  description: string
  predictedDate: Date
  daysUntilDue: number
  confidence: number // 0-100%
  recommendation: string
  estimatedDowntime: number // hours
  estimatedCost: number // dollars
  createdAt: Date
}

export interface MaintenanceSchedule {
  id: string
  robotId: string
  robotName: string
  title: string
  description: string
  type: 'preventive' | 'corrective' | 'predictive'
  component: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'hours' | 'cycles'
  interval: number
  lastPerformed?: Date
  nextDue: Date
  estimatedDuration: number // hours
  assignedTo?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  checklist: MaintenanceChecklistItem[]
}

export interface MaintenanceChecklistItem {
  id: string
  description: string
  required: boolean
  completed: boolean
  notes?: string
  completedBy?: string
  completedAt?: Date
}

export interface ComponentHealth {
  robotId: string
  robotName: string
  component: string
  healthScore: number // 0-100%
  trend: 'improving' | 'stable' | 'degrading'
  lastInspection: Date
  nextInspection: Date
  metrics: {
    vibration?: number
    temperature?: number
    currentDraw?: number
    cycleCount?: number
    errorCount?: number
  }
  wearIndicators: {
    name: string
    value: number
    threshold: number
    unit: string
  }[]
  recommendations: string[]
}

export interface MaintenanceInsight {
  type: 'cost_optimization' | 'downtime_reduction' | 'failure_prevention' | 'efficiency_improvement'
  title: string
  description: string
  impact: string
  priority: 'low' | 'medium' | 'high'
  estimatedSavings?: number
  implementationCost?: number
  roi?: number
}

export interface PredictiveMaintenanceData {
  alerts: MaintenanceAlert[]
  schedule: MaintenanceSchedule[]
  componentHealth: ComponentHealth[]
  insights: MaintenanceInsight[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function usePredictiveMaintenance(): PredictiveMaintenanceData {
  const { urfmp, robots } = useURFMP()
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([])
  const [schedule, setSchedule] = useState<MaintenanceSchedule[]>([])
  const [componentHealth, setComponentHealth] = useState<ComponentHealth[]>([])
  const [insights, setInsights] = useState<MaintenanceInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMaintenanceData = async () => {
    if (!urfmp || robots.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      // Generate predictive maintenance alerts based on telemetry data
      const generatedAlerts: MaintenanceAlert[] = []
      const generatedSchedule: MaintenanceSchedule[] = []
      const generatedComponentHealth: ComponentHealth[] = []

      for (const robot of robots) {
        try {
          // Get latest telemetry for health analysis
          const latestTelemetry = await urfmp.getLatestTelemetry(robot.id)

          // Generate predictive alerts based on telemetry patterns
          const robotAlerts = generatePredictiveAlerts(robot, latestTelemetry)
          generatedAlerts.push(...robotAlerts)

          // Generate maintenance schedule
          const robotSchedule = generateMaintenanceSchedule(robot)
          generatedSchedule.push(...robotSchedule)

          // Analyze component health
          const robotComponentHealth = analyzeComponentHealth(robot, latestTelemetry)
          generatedComponentHealth.push(...robotComponentHealth)

        } catch (err) {
          console.warn(`Failed to analyze maintenance data for robot ${robot.id}:`, err)
        }
      }

      // Generate insights based on fleet data
      const generatedInsights = generateMaintenanceInsights(generatedAlerts, generatedComponentHealth)

      setAlerts(generatedAlerts)
      setSchedule(generatedSchedule)
      setComponentHealth(generatedComponentHealth)
      setInsights(generatedInsights)

    } catch (err) {
      console.error('Failed to fetch maintenance data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch maintenance data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMaintenanceData()
  }, [urfmp, robots])

  return {
    alerts,
    schedule,
    componentHealth,
    insights,
    isLoading,
    error,
    refresh: fetchMaintenanceData,
  }
}

function generatePredictiveAlerts(robot: any, telemetry: any): MaintenanceAlert[] {
  const alerts: MaintenanceAlert[] = []
  const now = new Date()

  // Simulate predictive alerts based on robot runtime and status
  const baseDate = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) // Next 30 days

  // High temperature alert
  if (Math.random() > 0.7) {
    alerts.push({
      id: `alert-${robot.id}-temp`,
      robotId: robot.id,
      robotName: robot.name,
      severity: 'medium',
      type: 'predictive',
      component: 'Motor Temperature Control',
      description: 'Elevated operating temperatures detected. Cooling system may need maintenance.',
      predictedDate: new Date(baseDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000),
      daysUntilDue: Math.floor(Math.random() * 14) + 7,
      confidence: Math.floor(Math.random() * 20) + 75,
      recommendation: 'Schedule cooling system inspection and clean air filters.',
      estimatedDowntime: Math.random() * 3 + 1,
      estimatedCost: Math.floor(Math.random() * 500) + 200,
      createdAt: now
    })
  }

  // Joint wear prediction
  if (Math.random() > 0.8) {
    alerts.push({
      id: `alert-${robot.id}-joint`,
      robotId: robot.id,
      robotName: robot.name,
      severity: 'high',
      type: 'predictive',
      component: 'Joint 3 Gearbox',
      description: 'Increased vibration patterns suggest gear wear. Replacement recommended.',
      predictedDate: new Date(baseDate.getTime() + Math.random() * 21 * 24 * 60 * 60 * 1000),
      daysUntilDue: Math.floor(Math.random() * 21) + 14,
      confidence: Math.floor(Math.random() * 15) + 85,
      recommendation: 'Replace gearbox and inspect surrounding components.',
      estimatedDowntime: Math.random() * 6 + 4,
      estimatedCost: Math.floor(Math.random() * 2000) + 1500,
      createdAt: now
    })
  }

  // Scheduled maintenance due
  if (Math.random() > 0.6) {
    alerts.push({
      id: `alert-${robot.id}-scheduled`,
      robotId: robot.id,
      robotName: robot.name,
      severity: 'low',
      type: 'scheduled',
      component: 'General Maintenance',
      description: 'Routine maintenance is due based on operating hours.',
      predictedDate: new Date(baseDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      daysUntilDue: Math.floor(Math.random() * 7) + 1,
      confidence: 100,
      recommendation: 'Perform standard maintenance checklist including lubrication and calibration.',
      estimatedDowntime: Math.random() * 2 + 0.5,
      estimatedCost: Math.floor(Math.random() * 300) + 100,
      createdAt: now
    })
  }

  return alerts
}

function generateMaintenanceSchedule(robot: any): MaintenanceSchedule[] {
  const schedule: MaintenanceSchedule[] = []
  const now = new Date()

  // Weekly inspection
  schedule.push({
    id: `schedule-${robot.id}-weekly`,
    robotId: robot.id,
    robotName: robot.name,
    title: 'Weekly Safety Inspection',
    description: 'Visual inspection and basic safety checks',
    type: 'preventive',
    component: 'General',
    frequency: 'weekly',
    interval: 1,
    nextDue: new Date(now.getTime() + (7 - now.getDay()) * 24 * 60 * 60 * 1000),
    estimatedDuration: 0.5,
    priority: 'medium',
    status: 'scheduled',
    checklist: [
      { id: '1', description: 'Check emergency stop functionality', required: true, completed: false },
      { id: '2', description: 'Inspect cables for damage', required: true, completed: false },
      { id: '3', description: 'Verify joint range of motion', required: true, completed: false },
      { id: '4', description: 'Clean work area', required: false, completed: false }
    ]
  })

  // Monthly lubrication
  schedule.push({
    id: `schedule-${robot.id}-monthly`,
    robotId: robot.id,
    robotName: robot.name,
    title: 'Joint Lubrication Service',
    description: 'Lubricate all joint mechanisms',
    type: 'preventive',
    component: 'Joints',
    frequency: 'monthly',
    interval: 1,
    nextDue: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    estimatedDuration: 2,
    priority: 'high',
    status: 'scheduled',
    checklist: [
      { id: '1', description: 'Apply grease to joint 1-6', required: true, completed: false },
      { id: '2', description: 'Check torque specifications', required: true, completed: false },
      { id: '3', description: 'Test joint movement', required: true, completed: false }
    ]
  })

  return schedule
}

function analyzeComponentHealth(robot: any, telemetry: any): ComponentHealth[] {
  const components: ComponentHealth[] = []
  const now = new Date()

  // Mock component health data based on robot status
  const healthScore = robot.status === 'online' ? Math.floor(Math.random() * 20) + 80 :
                     robot.status === 'error' ? Math.floor(Math.random() * 40) + 20 :
                     Math.floor(Math.random() * 30) + 60

  components.push({
    robotId: robot.id,
    robotName: robot.name,
    component: 'Base Joint Motor',
    healthScore,
    trend: healthScore > 85 ? 'stable' : healthScore > 70 ? 'degrading' : 'degrading',
    lastInspection: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    nextInspection: new Date(now.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000),
    metrics: {
      vibration: Math.random() * 5 + 1,
      temperature: Math.random() * 20 + 30,
      currentDraw: Math.random() * 5 + 2,
      cycleCount: Math.floor(Math.random() * 10000) + 5000,
      errorCount: Math.floor(Math.random() * 10)
    },
    wearIndicators: [
      { name: 'Bearing Wear', value: Math.random() * 100, threshold: 80, unit: '%' },
      { name: 'Gear Backlash', value: Math.random() * 0.5, threshold: 0.3, unit: 'mm' },
      { name: 'Motor Temperature', value: Math.random() * 20 + 35, threshold: 50, unit: '°C' }
    ],
    recommendations: healthScore < 70 ? [
      'Schedule immediate inspection',
      'Consider component replacement',
      'Monitor closely for degradation'
    ] : healthScore < 85 ? [
      'Increase monitoring frequency',
      'Schedule preventive maintenance'
    ] : [
      'Continue normal operation',
      'Maintain current schedule'
    ]
  })

  return components
}

function generateMaintenanceInsights(alerts: MaintenanceAlert[], components: ComponentHealth[]): MaintenanceInsight[] {
  const insights: MaintenanceInsight[] = []

  // Cost optimization insight
  if (alerts.length > 5) {
    insights.push({
      type: 'cost_optimization',
      title: 'Consolidate Maintenance Activities',
      description: 'Multiple maintenance tasks can be grouped to reduce downtime and labor costs.',
      impact: 'Reduce total downtime by 40% and maintenance costs by 25%',
      priority: 'high',
      estimatedSavings: 15000,
      implementationCost: 2000,
      roi: 650
    })
  }

  // Failure prevention insight
  const criticalComponents = components.filter(c => c.healthScore < 70)
  if (criticalComponents.length > 0) {
    insights.push({
      type: 'failure_prevention',
      title: 'Critical Component Alert',
      description: `${criticalComponents.length} components showing signs of critical wear.`,
      impact: 'Prevent unexpected failures and production disruptions',
      priority: 'high',
      estimatedSavings: 50000,
      implementationCost: 10000,
      roi: 400
    })
  }

  // Efficiency improvement insight
  insights.push({
    type: 'efficiency_improvement',
    title: 'Predictive Maintenance Implementation',
    description: 'Implement sensor-based monitoring for real-time component health tracking.',
    impact: 'Increase overall equipment effectiveness by 15-20%',
    priority: 'medium',
    estimatedSavings: 75000,
    implementationCost: 25000,
    roi: 200
  })

  return insights
}