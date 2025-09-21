import { FleetMetrics, RobotPerformanceData, FleetTrendData, ErrorDistribution } from '../hooks/useAnalytics'

export interface ExportData {
  fleetMetrics: FleetMetrics
  robotPerformance: RobotPerformanceData[]
  fleetTrends: FleetTrendData[]
  errorDistribution: ErrorDistribution[]
  generatedAt: string
  timeRange: string
  reportType: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: string[]
  format: 'csv' | 'json' | 'pdf'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    recipients: string[]
  }
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'fleet-overview',
    name: 'Fleet Overview Report',
    description: 'Comprehensive fleet performance and status overview',
    sections: ['fleet-metrics', 'robot-performance', 'error-distribution'],
    format: 'pdf'
  },
  {
    id: 'performance-analysis',
    name: 'Performance Analysis',
    description: 'Detailed robot efficiency and cycle analysis',
    sections: ['robot-performance', 'fleet-trends', 'recommendations'],
    format: 'csv'
  },
  {
    id: 'maintenance-report',
    name: 'Maintenance Report',
    description: 'Maintenance insights and predictive analytics',
    sections: ['health-scores', 'maintenance-alerts', 'recommendations'],
    format: 'pdf'
  },
  {
    id: 'power-consumption',
    name: 'Power Consumption Analysis',
    description: 'Energy usage patterns and optimization opportunities',
    sections: ['power-trends', 'fleet-metrics', 'recommendations'],
    format: 'csv'
  }
]

export function exportToCSV(data: ExportData): string {
  const sections: string[] = []

  // Fleet Metrics Section
  sections.push('Fleet Metrics')
  sections.push('Metric,Value,Unit')
  sections.push(`Total Cycles,${data.fleetMetrics.totalCycles},cycles`)
  sections.push(`Average Efficiency,${data.fleetMetrics.avgEfficiency.toFixed(2)},%`)
  sections.push(`Fleet Uptime,${data.fleetMetrics.avgUptime.toFixed(2)},%`)
  sections.push(`Error Rate,${data.fleetMetrics.errorRate.toFixed(2)},%`)
  sections.push(`Total Robots,${data.fleetMetrics.totalRobots},robots`)
  sections.push(`Online Robots,${data.fleetMetrics.onlineRobots},robots`)
  sections.push(`Total Power Consumption,${data.fleetMetrics.totalPowerConsumption.toFixed(2)},W`)
  sections.push(`Total Operating Hours,${data.fleetMetrics.totalOperatingHours.toFixed(2)},hours`)
  sections.push('')

  // Robot Performance Section
  sections.push('Robot Performance')
  sections.push('Robot ID,Robot Name,Cycles,Efficiency (%),Uptime (%),Status,Power Consumption (W),Operating Hours')
  data.robotPerformance.forEach(robot => {
    sections.push(`${robot.robotId},${robot.robotName},${robot.cycles},${robot.efficiency},${robot.uptime},${robot.status},${robot.powerConsumption},${robot.operatingHours}`)
  })
  sections.push('')

  // Fleet Trends Section
  sections.push('Fleet Trends')
  sections.push('Date,Utilization (%),Efficiency (%),Downtime (hours),Power Consumption (W),Cycle Count')
  data.fleetTrends.forEach(trend => {
    sections.push(`${trend.date},${trend.utilization},${trend.efficiency},${trend.downtime},${trend.powerConsumption},${trend.cycleCount}`)
  })
  sections.push('')

  // Error Distribution Section
  sections.push('Error Distribution')
  sections.push('Error Type,Count,Color')
  data.errorDistribution.forEach(error => {
    sections.push(`${error.type},${error.count},${error.color}`)
  })

  return sections.join('\n')
}

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2)
}

export async function exportToPDF(data: ExportData, templateId?: string): Promise<Blob> {
  // HTML-based PDF export (can be enhanced with proper PDF library later)
  const template = templateId ? REPORT_TEMPLATES.find(t => t.id === templateId) : null

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>URFMP Analytics Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .metric { background-color: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3b82f6; }
        .section { margin: 30px 0; }
        .footer { margin-top: 50px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
    </head>
    <body>
      <h1>URFMP Analytics Report</h1>
      <div class="metric">
        <strong>Generated:</strong> ${new Date(data.generatedAt).toLocaleString()}<br>
        <strong>Time Range:</strong> ${data.timeRange}<br>
        <strong>Report Type:</strong> ${data.reportType}
      </div>
  `

  if (template) {
    htmlContent += generateTemplateHTML(data, template)
  } else {
    // Generate all sections
    for (const t of REPORT_TEMPLATES) {
      if (t.id === 'custom') continue
      htmlContent += generateTemplateHTML(data, t)
    }
  }

  htmlContent += `
      <div class="footer">
        Generated by URFMP - Universal Robot Fleet Management Platform
      </div>
    </body>
    </html>
  `

  // Return as HTML blob that can be printed to PDF by browser
  return new Blob([htmlContent], { type: 'text/html' })
}

function generateTemplateHTML(data: ExportData, template: ReportTemplate): string {
  let htmlContent = `<div class="section"><h2>${template.name}</h2>`

  for (const section of template.sections) {
    switch (section) {
      case 'fleet-metrics':
        htmlContent += generateFleetMetricsHTML(data)
        break
      case 'robot-performance':
        htmlContent += generateRobotPerformanceHTML(data)
        break
      case 'fleet-trends':
        htmlContent += generateFleetTrendsHTML(data)
        break
      case 'error-distribution':
        htmlContent += generateErrorDistributionHTML(data)
        break
      case 'power-trends':
        htmlContent += generatePowerTrendsHTML(data)
        break
      case 'health-scores':
        htmlContent += generateHealthScoresHTML(data)
        break
      case 'maintenance-alerts':
        htmlContent += generateMaintenanceAlertsHTML(data)
        break
      case 'recommendations':
        htmlContent += generateRecommendationsHTML(data)
        break
    }
  }

  htmlContent += '</div>'
  return htmlContent
}

function generateFleetMetricsHTML(data: ExportData): string {
  return `
    <div class="section">
      <h3>Fleet Metrics Overview</h3>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Cycles</td><td>${data.fleetMetrics.totalCycles.toLocaleString()}</td></tr>
        <tr><td>Average Efficiency</td><td>${data.fleetMetrics.avgEfficiency.toFixed(1)}%</td></tr>
        <tr><td>Fleet Uptime</td><td>${data.fleetMetrics.avgUptime.toFixed(1)}%</td></tr>
        <tr><td>Error Rate</td><td>${data.fleetMetrics.errorRate.toFixed(1)}%</td></tr>
        <tr><td>Total Robots</td><td>${data.fleetMetrics.totalRobots}</td></tr>
        <tr><td>Online Robots</td><td>${data.fleetMetrics.onlineRobots}</td></tr>
        <tr><td>Power Consumption</td><td>${(data.fleetMetrics.totalPowerConsumption / 1000).toFixed(1)}kW</td></tr>
        <tr><td>Operating Hours</td><td>${data.fleetMetrics.totalOperatingHours.toFixed(1)}h</td></tr>
      </table>
    </div>
  `
}

function generateRobotPerformanceHTML(data: ExportData): string {
  return `
    <div class="section">
      <h3>Robot Performance</h3>
      <table>
        <tr><th>Robot</th><th>Cycles</th><th>Efficiency</th><th>Uptime</th><th>Power</th><th>Hours</th><th>Status</th></tr>
        ${data.robotPerformance.map(robot => `
          <tr>
            <td>${robot.robotName}</td>
            <td>${robot.cycles.toLocaleString()}</td>
            <td>${robot.efficiency}%</td>
            <td>${robot.uptime}%</td>
            <td>${robot.powerConsumption}W</td>
            <td>${robot.operatingHours}h</td>
            <td>${robot.status}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `
}

function generateFleetTrendsHTML(data: ExportData): string {
  return `<div class="section"><h3>Fleet Trends</h3><p>Trend data visualization would be displayed here in a full implementation.</p></div>`
}

function generateErrorDistributionHTML(data: ExportData): string {
  return `
    <div class="section">
      <h3>Error Distribution</h3>
      <table>
        <tr><th>Error Type</th><th>Count</th><th>Percentage</th></tr>
        ${data.errorDistribution.map(error => `
          <tr>
            <td>${error.errorType}</td>
            <td>${error.count}</td>
            <td>${error.percentage.toFixed(1)}%</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `
}

function generatePowerTrendsHTML(data: ExportData): string {
  return `<div class="section"><h3>Power Trends</h3><p>Power consumption trends would be displayed here.</p></div>`
}

function generateHealthScoresHTML(data: ExportData): string {
  return `<div class="section"><h3>Health Scores</h3><p>Robot health scoring data would be displayed here.</p></div>`
}

function generateMaintenanceAlertsHTML(data: ExportData): string {
  return `<div class="section"><h3>Maintenance Alerts</h3><p>Active maintenance alerts and recommendations would be displayed here.</p></div>`
}

function generateRecommendationsHTML(data: ExportData): string {
  return `<div class="section"><h3>AI Recommendations</h3><p>AI-generated fleet optimization recommendations would be displayed here.</p></div>`
}

// Utility functions for file export
export function downloadFile(content: string | Blob, filename: string, type: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateFilename(reportType: string, format: string, timeRange: string): string {
  const timestamp = new Date().toISOString().split('T')[0]
  return `urfmp-${reportType}-${timeRange}-${timestamp}.${format}`
}