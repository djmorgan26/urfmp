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
  const [lastFetch, setLastFetch] = useState<number>(0)

  const fetchMaintenanceData = async () => {
    if (!urfmp || robots.length === 0) return

    // Aggressive rate limiting: prevent fetches within 5 minutes
    const now = Date.now()
    if (now - lastFetch < 300000 && alerts.length > 0) {
      console.log('Predictive Maintenance: skipping fetch due to rate limiting (5min cooldown)')
      return
    }

    setIsLoading(true)
    setError(null)
    setLastFetch(now)

    try {
      // Generate predictive maintenance alerts based on telemetry data
      const generatedAlerts: MaintenanceAlert[] = []
      const generatedSchedule: MaintenanceSchedule[] = []
      const generatedComponentHealth: ComponentHealth[] = []

      // Only analyze first 2 robots to minimize API load
      const robotsToAnalyze = robots.slice(0, 2)
      console.log(`Predictive Maintenance: analyzing ${robotsToAnalyze.length} of ${robots.length} robots`)

      let rateLimitHit = false

      for (const robot of robotsToAnalyze) {
        if (rateLimitHit) {
          console.log('Rate limit hit, skipping remaining robots')
          break
        }

        try {
          // Add delay between API calls to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 1000))

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

          // Check for rate limiting and stop immediately
          if (err instanceof Error && (err.message.includes('429') || err.message.includes('Too Many Requests'))) {
            console.log('Rate limited detected, stopping all maintenance analysis')
            rateLimitHit = true
            setError('Rate limited - reducing analysis frequency')
            break
          }

          // For non-rate-limit errors, continue with next robot but generate fallback data
          console.log(`Generating fallback data for robot ${robot.id}`)
          const fallbackSchedule = generateMaintenanceSchedule(robot)
          generatedSchedule.push(...fallbackSchedule)

          const fallbackHealth = analyzeComponentHealth(robot, null)
          generatedComponentHealth.push(...fallbackHealth)
        }
      }

      // Generate insights based on fleet data
      const generatedInsights = generateMaintenanceInsights(generatedAlerts, generatedComponentHealth)

      setAlerts(generatedAlerts)
      setSchedule(generatedSchedule)
      setComponentHealth(generatedComponentHealth)
      setInsights(generatedInsights)

      console.log(`Predictive Maintenance: Generated ${generatedAlerts.length} alerts, ${generatedSchedule.length} schedule items`)

    } catch (err) {
      console.error('Failed to fetch maintenance data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch maintenance data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMaintenanceData()

    // Reduce refresh frequency to every 10 minutes to minimize API calls
    const interval = setInterval(fetchMaintenanceData, 600000)
    return () => clearInterval(interval)
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

  if (!telemetry || !telemetry.data) {
    return alerts // No telemetry data available
  }

  // Extract telemetry metrics for analysis
  const {
    temperature = {},
    power = {},
    voltage = {},
    current = {},
    position = {},
    safety = {}
  } = telemetry.data

  // Real temperature-based alerts
  if (temperature.ambient && temperature.ambient > 35) {
    const severity = temperature.ambient > 45 ? 'high' : temperature.ambient > 40 ? 'medium' : 'low'
    const daysUntilDue = temperature.ambient > 45 ? 3 : temperature.ambient > 40 ? 7 : 14
    const confidence = Math.min(95, 60 + (temperature.ambient - 25) * 2)

    alerts.push({
      id: `alert-${robot.id}-temp`,
      robotId: robot.id,
      robotName: robot.name,
      severity,
      type: 'predictive',
      component: 'Thermal Management System',
      description: `Elevated ambient temperature detected: ${temperature.ambient.toFixed(1)}°C. Cooling system inspection recommended.`,
      predictedDate: new Date(now.getTime() + daysUntilDue * 24 * 60 * 60 * 1000),
      daysUntilDue,
      confidence: Math.round(confidence),
      recommendation: `Schedule thermal inspection. Check cooling fans and air filtration. Current temp: ${temperature.ambient.toFixed(1)}°C`,
      estimatedDowntime: severity === 'high' ? 4 : severity === 'medium' ? 2 : 1,
      estimatedCost: severity === 'high' ? 800 : severity === 'medium' ? 400 : 200,
      createdAt: now
    })
  }

  // Real power consumption analysis
  if (power.total && power.total > 150) {
    const severity = power.total > 200 ? 'high' : 'medium'
    const daysUntilDue = power.total > 200 ? 5 : 10
    const confidence = Math.min(90, 50 + (power.total - 100) / 2)

    alerts.push({
      id: `alert-${robot.id}-power`,
      robotId: robot.id,
      robotName: robot.name,
      severity,
      type: 'predictive',
      component: 'Drive System',
      description: `Elevated power consumption detected: ${power.total.toFixed(1)}W. Motor efficiency analysis recommended.`,
      predictedDate: new Date(now.getTime() + daysUntilDue * 24 * 60 * 60 * 1000),
      daysUntilDue,
      confidence: Math.round(confidence),
      recommendation: `Inspect motor drives and gearboxes. Check for increased friction. Current consumption: ${power.total.toFixed(1)}W`,
      estimatedDowntime: severity === 'high' ? 6 : 3,
      estimatedCost: severity === 'high' ? 1500 : 750,
      createdAt: now
    })
  }

  // Real voltage analysis
  if (voltage.supply && (voltage.supply < 46 || voltage.supply > 50)) {
    const severity = (voltage.supply < 44 || voltage.supply > 52) ? 'high' : 'medium'
    const daysUntilDue = severity === 'high' ? 2 : 7

    alerts.push({
      id: `alert-${robot.id}-voltage`,
      robotId: robot.id,
      robotName: robot.name,
      severity,
      type: 'predictive',
      component: 'Power Supply',
      description: `Voltage irregularity detected: ${voltage.supply.toFixed(1)}V. Power supply inspection needed.`,
      predictedDate: new Date(now.getTime() + daysUntilDue * 24 * 60 * 60 * 1000),
      daysUntilDue,
      confidence: 85,
      recommendation: `Check power supply stability and connections. Expected: 48V ±2V, Actual: ${voltage.supply.toFixed(1)}V`,
      estimatedDowntime: severity === 'high' ? 4 : 2,
      estimatedCost: severity === 'high' ? 1200 : 400,
      createdAt: now
    })
  }

  // Safety system alerts
  if (safety.emergencyStop || safety.protectiveStop) {
    alerts.push({
      id: `alert-${robot.id}-safety`,
      robotId: robot.id,
      robotName: robot.name,
      severity: 'critical',
      type: 'reactive',
      component: 'Safety Systems',
      description: `Safety system activation detected. ${safety.emergencyStop ? 'Emergency stop' : 'Protective stop'} triggered.`,
      predictedDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next day
      daysUntilDue: 1,
      confidence: 100,
      recommendation: 'Immediate safety system inspection required. Identify root cause of safety activation.',
      estimatedDowntime: 8,
      estimatedCost: 1000,
      createdAt: now
    })
  }

  // Position drift analysis (joint accuracy)
  if (position.x !== undefined && position.y !== undefined) {
    const positionMagnitude = Math.sqrt(position.x * position.x + position.y * position.y)
    if (positionMagnitude > 500) { // Assuming workspace of ~500mm radius
      alerts.push({
        id: `alert-${robot.id}-calibration`,
        robotId: robot.id,
        robotName: robot.name,
        severity: 'medium',
        type: 'predictive',
        component: 'Joint Calibration',
        description: `Position accuracy drift detected. Current position magnitude: ${positionMagnitude.toFixed(1)}mm`,
        predictedDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        daysUntilDue: 14,
        confidence: 75,
        recommendation: 'Schedule joint calibration and accuracy verification. Check encoder alignment.',
        estimatedDowntime: 3,
        estimatedCost: 500,
        createdAt: now
      })
    }
  }

  return alerts
}

function generateMaintenanceSchedule(robot: any): MaintenanceSchedule[] {
  const schedule: MaintenanceSchedule[] = []
  const now = new Date()

  // Determine maintenance urgency based on robot status
  const isHighPriority = robot.status === 'error' || robot.status === 'warning'

  // Weekly inspection (adjusted based on robot condition)
  const inspectionPriority = isHighPriority ? 'high' : 'medium'
  const inspectionInterval = isHighPriority ? 3 : 7 // Days

  schedule.push({
    id: `schedule-${robot.id}-inspection`,
    robotId: robot.id,
    robotName: robot.name,
    title: `${isHighPriority ? 'Priority' : 'Routine'} Safety Inspection`,
    description: `${isHighPriority ? 'Enhanced inspection due to robot status' : 'Standard visual inspection and safety checks'}`,
    type: 'preventive',
    component: 'General',
    frequency: 'weekly',
    interval: 1,
    nextDue: new Date(now.getTime() + inspectionInterval * 24 * 60 * 60 * 1000),
    estimatedDuration: isHighPriority ? 1 : 0.5,
    priority: inspectionPriority,
    status: 'scheduled',
    checklist: [
      { id: '1', description: 'Check emergency stop functionality', required: true, completed: false },
      { id: '2', description: 'Inspect cables and connections', required: true, completed: false },
      { id: '3', description: 'Verify joint range of motion', required: true, completed: false },
      { id: '4', description: 'Check error logs and diagnostics', required: isHighPriority, completed: false },
      { id: '5', description: 'Clean work area and robot base', required: false, completed: false },
      ...(isHighPriority ? [
        { id: '6', description: 'Detailed status analysis', required: true, completed: false },
        { id: '7', description: 'Performance verification', required: true, completed: false }
      ] : [])
    ]
  })

  // Lubrication schedule (frequency adjusted by robot usage)
  const lubricationFrequency = robot.status === 'online' ? 'monthly' : 'quarterly'
  const lubricationDays = robot.status === 'online' ? 30 : 90

  schedule.push({
    id: `schedule-${robot.id}-lubrication`,
    robotId: robot.id,
    robotName: robot.name,
    title: 'Joint Lubrication Service',
    description: `${lubricationFrequency} lubrication based on usage patterns`,
    type: 'preventive',
    component: 'Joints & Actuators',
    frequency: lubricationFrequency,
    interval: 1,
    nextDue: new Date(now.getTime() + lubricationDays * 24 * 60 * 60 * 1000),
    estimatedDuration: 2,
    priority: robot.status === 'online' ? 'high' : 'medium',
    status: 'scheduled',
    checklist: [
      { id: '1', description: 'Apply grease to joints 1-6', required: true, completed: false },
      { id: '2', description: 'Check torque specifications', required: true, completed: false },
      { id: '3', description: 'Test joint movement and accuracy', required: true, completed: false },
      { id: '4', description: 'Inspect seals and covers', required: true, completed: false },
      { id: '5', description: 'Document lubrication quantities', required: false, completed: false }
    ]
  })

  // Calibration schedule (more frequent for error-prone robots)
  if (robot.status === 'error' || robot.status === 'warning') {
    schedule.push({
      id: `schedule-${robot.id}-calibration`,
      robotId: robot.id,
      robotName: robot.name,
      title: 'Emergency Calibration Check',
      description: 'Position accuracy verification and recalibration due to reported issues',
      type: 'corrective',
      component: 'Position Control',
      frequency: 'weekly',
      interval: 1,
      nextDue: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
      estimatedDuration: 3,
      priority: 'critical',
      status: 'scheduled',
      checklist: [
        { id: '1', description: 'Run position accuracy test', required: true, completed: false },
        { id: '2', description: 'Check encoder alignment', required: true, completed: false },
        { id: '3', description: 'Verify coordinate system', required: true, completed: false },
        { id: '4', description: 'Recalibrate if needed', required: true, completed: false },
        { id: '5', description: 'Test program execution', required: true, completed: false }
      ]
    })
  } else {
    // Regular calibration for healthy robots
    schedule.push({
      id: `schedule-${robot.id}-calibration`,
      robotId: robot.id,
      robotName: robot.name,
      title: 'Quarterly Calibration Check',
      description: 'Routine position accuracy verification',
      type: 'preventive',
      component: 'Position Control',
      frequency: 'quarterly',
      interval: 1,
      nextDue: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
      estimatedDuration: 1.5,
      priority: 'medium',
      status: 'scheduled',
      checklist: [
        { id: '1', description: 'Run position accuracy test', required: true, completed: false },
        { id: '2', description: 'Check coordinate repeatability', required: true, completed: false },
        { id: '3', description: 'Verify tool center point', required: false, completed: false }
      ]
    })
  }

  return schedule
}

function analyzeComponentHealth(robot: any, telemetry: any): ComponentHealth[] {
  const components: ComponentHealth[] = []
  const now = new Date()

  if (!telemetry || !telemetry.data) {
    // Return basic component with unknown health if no telemetry
    components.push({
      robotId: robot.id,
      robotName: robot.name,
      component: 'System Overview',
      healthScore: robot.status === 'online' ? 85 : robot.status === 'error' ? 25 : 60,
      trend: 'stable',
      lastInspection: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      nextInspection: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      metrics: {},
      wearIndicators: [],
      recommendations: ['Connect telemetry data for detailed health analysis']
    })
    return components
  }

  const {
    temperature = {},
    power = {},
    voltage = {},
    current = {},
    position = {},
    safety = {}
  } = telemetry.data

  // Motor System Health Analysis
  let motorHealthScore = 100
  const motorMetrics: any = {}
  const motorWearIndicators: any[] = []
  const motorRecommendations: string[] = []

  // Temperature impact on health
  if (temperature.ambient) {
    motorMetrics.temperature = temperature.ambient
    if (temperature.ambient > 45) {
      motorHealthScore -= 30
      motorRecommendations.push('Address cooling system - high temperature detected')
    } else if (temperature.ambient > 35) {
      motorHealthScore -= 15
      motorRecommendations.push('Monitor temperature trends')
    }

    motorWearIndicators.push({
      name: 'Operating Temperature',
      value: temperature.ambient,
      threshold: 40,
      unit: '°C'
    })
  }

  // Power consumption impact
  if (power.total) {
    motorMetrics.powerConsumption = power.total
    if (power.total > 200) {
      motorHealthScore -= 25
      motorRecommendations.push('High power consumption - check for mechanical issues')
    } else if (power.total > 150) {
      motorHealthScore -= 10
      motorRecommendations.push('Elevated power usage - schedule inspection')
    }

    motorWearIndicators.push({
      name: 'Power Efficiency',
      value: Math.max(0, 100 - (power.total - 100) * 0.5),
      threshold: 85,
      unit: '%'
    })
  }

  // Current draw analysis
  if (current.total) {
    motorMetrics.currentDraw = current.total
    if (current.total > 5) {
      motorHealthScore -= 20
      motorRecommendations.push('High current draw detected - inspect motor windings')
    }

    motorWearIndicators.push({
      name: 'Current Draw',
      value: current.total,
      threshold: 4,
      unit: 'A'
    })
  }

  // Voltage stability impact
  if (voltage.supply) {
    if (voltage.supply < 46 || voltage.supply > 50) {
      motorHealthScore -= 15
      motorRecommendations.push('Voltage instability detected - check power supply')
    }

    motorWearIndicators.push({
      name: 'Supply Voltage',
      value: voltage.supply,
      threshold: 48,
      unit: 'V'
    })
  }

  // Safety system impact
  if (safety.emergencyStop || safety.protectiveStop) {
    motorHealthScore -= 40
    motorRecommendations.push('Safety system activation - requires immediate inspection')
  }

  motorHealthScore = Math.max(0, Math.min(100, motorHealthScore))

  if (motorRecommendations.length === 0) {
    motorRecommendations.push('System operating within normal parameters')
  }

  components.push({
    robotId: robot.id,
    robotName: robot.name,
    component: 'Motor & Drive System',
    healthScore: Math.round(motorHealthScore),
    trend: motorHealthScore > 85 ? 'stable' : motorHealthScore > 70 ? 'degrading' : 'degrading',
    lastInspection: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    nextInspection: new Date(now.getTime() + (motorHealthScore > 80 ? 14 : 7) * 24 * 60 * 60 * 1000),
    metrics: motorMetrics,
    wearIndicators: motorWearIndicators,
    recommendations: motorRecommendations
  })

  // Position System Health Analysis
  let positionHealthScore = 100
  const positionMetrics: any = {}
  const positionWearIndicators: any[] = []
  const positionRecommendations: string[] = []

  if (position.x !== undefined && position.y !== undefined && position.z !== undefined) {
    const positionMagnitude = Math.sqrt(position.x * position.x + position.y * position.y + position.z * position.z)
    positionMetrics.positionAccuracy = positionMagnitude

    if (positionMagnitude > 600) {
      positionHealthScore -= 30
      positionRecommendations.push('Position accuracy degraded - recalibration needed')
    } else if (positionMagnitude > 400) {
      positionHealthScore -= 15
      positionRecommendations.push('Monitor position accuracy trends')
    }

    positionWearIndicators.push({
      name: 'Position Accuracy',
      value: Math.max(0, 100 - (positionMagnitude - 200) * 0.2),
      threshold: 90,
      unit: '%'
    })
  }

  if (position.rx !== undefined || position.ry !== undefined || position.rz !== undefined) {
    const rotationMagnitude = Math.sqrt(
      (position.rx || 0) ** 2 + (position.ry || 0) ** 2 + (position.rz || 0) ** 2
    )

    if (rotationMagnitude > 0.5) {
      positionHealthScore -= 20
      positionRecommendations.push('Rotational drift detected - check joint encoders')
    }
  }

  if (positionRecommendations.length === 0) {
    positionRecommendations.push('Position system operating normally')
  }

  components.push({
    robotId: robot.id,
    robotName: robot.name,
    component: 'Position Control System',
    healthScore: Math.round(positionHealthScore),
    trend: positionHealthScore > 85 ? 'stable' : positionHealthScore > 70 ? 'degrading' : 'degrading',
    lastInspection: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    nextInspection: new Date(now.getTime() + (positionHealthScore > 80 ? 21 : 10) * 24 * 60 * 60 * 1000),
    metrics: positionMetrics,
    wearIndicators: positionWearIndicators,
    recommendations: positionRecommendations
  })

  return components
}

function generateMaintenanceInsights(alerts: MaintenanceAlert[], components: ComponentHealth[]): MaintenanceInsight[] {
  const insights: MaintenanceInsight[] = []

  // Analyze alert patterns for cost optimization
  const predictiveAlerts = alerts.filter(a => a.type === 'predictive')
  const totalEstimatedCost = alerts.reduce((sum, alert) => sum + alert.estimatedCost, 0)
  const totalEstimatedDowntime = alerts.reduce((sum, alert) => sum + alert.estimatedDowntime, 0)

  // Cost optimization insight based on actual alert data
  if (alerts.length >= 3 && totalEstimatedCost > 1500) {
    const savingsPercentage = Math.min(35, alerts.length * 5)
    const estimatedSavings = Math.round(totalEstimatedCost * (savingsPercentage / 100))
    const implementationCost = Math.round(estimatedSavings * 0.2)

    insights.push({
      type: 'cost_optimization',
      title: 'Consolidate Maintenance Activities',
      description: `${alerts.length} maintenance tasks can be grouped to reduce total costs from $${totalEstimatedCost.toLocaleString()} and downtime from ${totalEstimatedDowntime.toFixed(1)} hours.`,
      impact: `Reduce maintenance costs by ${savingsPercentage}% and downtime by ${Math.round(savingsPercentage * 0.8)}%`,
      priority: alerts.length > 5 ? 'high' : 'medium',
      estimatedSavings,
      implementationCost,
      roi: Math.round((estimatedSavings / implementationCost) * 100)
    })
  }

  // Failure prevention insight based on component health analysis
  const criticalComponents = components.filter(c => c.healthScore < 70)
  const degradingComponents = components.filter(c => c.healthScore < 85 && c.trend === 'degrading')

  if (criticalComponents.length > 0) {
    const failureRisk = criticalComponents.length * 15000 + degradingComponents.length * 5000
    const preventionCost = criticalComponents.length * 2000 + degradingComponents.length * 500

    insights.push({
      type: 'failure_prevention',
      title: `${criticalComponents.length} Critical Component${criticalComponents.length > 1 ? 's' : ''} Detected`,
      description: `${criticalComponents.length} components with health scores below 70% and ${degradingComponents.length} showing degradation trends.`,
      impact: `Prevent potential failures costing $${failureRisk.toLocaleString()} in emergency repairs and production loss`,
      priority: criticalComponents.length > 2 ? 'high' : 'medium',
      estimatedSavings: failureRisk,
      implementationCost: preventionCost,
      roi: Math.round((failureRisk / preventionCost) * 100)
    })
  }

  // Downtime reduction insight
  if (totalEstimatedDowntime > 10) {
    const downtimeValue = totalEstimatedDowntime * 2000 // $2000/hour production value
    const reductionPercentage = Math.min(50, predictiveAlerts.length * 8)
    const savings = Math.round(downtimeValue * (reductionPercentage / 100))

    insights.push({
      type: 'downtime_reduction',
      title: 'Predictive Maintenance Optimization',
      description: `Current alerts predict ${totalEstimatedDowntime.toFixed(1)} hours of downtime. Implementing predictive strategies can reduce this significantly.`,
      impact: `Reduce unplanned downtime by ${reductionPercentage}%, saving ${(totalEstimatedDowntime * reductionPercentage / 100).toFixed(1)} hours`,
      priority: totalEstimatedDowntime > 20 ? 'high' : 'medium',
      estimatedSavings: savings,
      implementationCost: Math.round(savings * 0.3),
      roi: Math.round(70 / 0.3 * 100)
    })
  }

  // Efficiency improvement insight based on power and temperature data
  const highTempAlerts = alerts.filter(a => a.component.toLowerCase().includes('temperature') || a.component.toLowerCase().includes('thermal'))
  const powerAlerts = alerts.filter(a => a.component.toLowerCase().includes('power') || a.component.toLowerCase().includes('drive'))

  if (highTempAlerts.length > 0 || powerAlerts.length > 0) {
    insights.push({
      type: 'efficiency_improvement',
      title: 'Energy Efficiency Optimization',
      description: `${highTempAlerts.length} thermal and ${powerAlerts.length} power-related alerts suggest opportunities for efficiency improvements.`,
      impact: 'Optimize energy consumption and reduce operating temperatures for improved efficiency',
      priority: 'medium',
      estimatedSavings: (highTempAlerts.length + powerAlerts.length) * 5000,
      implementationCost: (highTempAlerts.length + powerAlerts.length) * 1500,
      roi: Math.round((5000 / 1500) * 100)
    })
  }

  // If no specific insights generated, provide general recommendation
  if (insights.length === 0) {
    insights.push({
      type: 'efficiency_improvement',
      title: 'Predictive Maintenance Baseline',
      description: 'Fleet operating within normal parameters. Consider implementing advanced monitoring for early issue detection.',
      impact: 'Establish baseline monitoring to detect future degradation trends',
      priority: 'low',
      estimatedSavings: 25000,
      implementationCost: 8000,
      roi: 212
    })
  }

  return insights
}