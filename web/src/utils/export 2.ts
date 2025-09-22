import {
  FleetMetrics,
  RobotPerformanceData,
  FleetTrendData,
  ErrorDistribution,
} from '../hooks/useAnalytics'

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
    format: 'pdf',
  },
  {
    id: 'performance-analysis',
    name: 'Performance Analysis',
    description: 'Detailed robot efficiency and cycle analysis',
    sections: ['robot-performance', 'fleet-trends', 'recommendations'],
    format: 'csv',
  },
  {
    id: 'maintenance-report',
    name: 'Maintenance Report',
    description: 'Maintenance insights and predictive analytics',
    sections: ['health-scores', 'maintenance-alerts', 'recommendations'],
    format: 'pdf',
  },
  {
    id: 'power-consumption',
    name: 'Power Consumption Analysis',
    description: 'Energy usage patterns and optimization opportunities',
    sections: ['power-trends', 'fleet-metrics', 'recommendations'],
    format: 'csv',
  },
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
  sections.push(
    'Robot ID,Robot Name,Cycles,Efficiency (%),Uptime (%),Status,Power Consumption (W),Operating Hours'
  )
  data.robotPerformance.forEach((robot) => {
    sections.push(
      `${robot.robotId},${robot.robotName},${robot.cycles},${robot.efficiency},${robot.uptime},${robot.status},${robot.powerConsumption},${robot.operatingHours}`
    )
  })
  sections.push('')

  // Fleet Trends Section
  sections.push('Fleet Trends')
  sections.push(
    'Date,Utilization (%),Efficiency (%),Downtime (hours),Power Consumption (W),Cycle Count'
  )
  data.fleetTrends.forEach((trend) => {
    sections.push(
      `${trend.date},${trend.utilization},${trend.efficiency},${trend.downtime},${trend.powerConsumption},${trend.cycleCount}`
    )
  })
  sections.push('')

  // Error Distribution Section
  sections.push('Error Distribution')
  sections.push('Error Type,Count,Color')
  data.errorDistribution.forEach((error) => {
    sections.push(`${error.type},${error.count},${error.color}`)
  })

  return sections.join('\n')
}

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2)
}

export async function exportToPDF(data: ExportData): Promise<Blob> {
  // For now, we'll create a simple HTML-to-PDF conversion
  // In a production environment, you'd use a library like jsPDF or puppeteer
  const html = generatePDFHTML(data)

  // Create a basic PDF using browser's print functionality
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Could not open print window')
  }

  printWindow.document.write(html)
  printWindow.document.close()

  // Return a placeholder blob for now
  return new Blob([html], { type: 'text/html' })
}

function generatePDFHTML(data: ExportData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>URFMP Analytics Report - ${data.reportType}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin: 30px 0; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>URFMP Analytics Report</h1>
        <p><strong>Report Type:</strong> ${data.reportType}</p>
        <p><strong>Time Range:</strong> ${data.timeRange}</p>
        <p><strong>Generated:</strong> ${new Date(data.generatedAt).toLocaleString()}</p>
      </div>

      <div class="section">
        <h2>Fleet Metrics Overview</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">${data.fleetMetrics.totalCycles.toLocaleString()}</div>
            <div>Total Cycles</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.fleetMetrics.avgEfficiency.toFixed(1)}%</div>
            <div>Average Efficiency</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.fleetMetrics.avgUptime.toFixed(1)}%</div>
            <div>Fleet Uptime</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.fleetMetrics.onlineRobots}/${data.fleetMetrics.totalRobots}</div>
            <div>Robots Online</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${(data.fleetMetrics.totalPowerConsumption / 1000).toFixed(1)}kW</div>
            <div>Power Consumption</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.fleetMetrics.errorRate.toFixed(1)}%</div>
            <div>Error Rate</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Robot Performance</h2>
        <table>
          <thead>
            <tr>
              <th>Robot Name</th>
              <th>Cycles</th>
              <th>Efficiency (%)</th>
              <th>Uptime (%)</th>
              <th>Power (W)</th>
              <th>Operating Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.robotPerformance
              .map(
                (robot) => `
              <tr>
                <td>${robot.robotName}</td>
                <td>${robot.cycles.toLocaleString()}</td>
                <td>${robot.efficiency}%</td>
                <td>${robot.uptime}%</td>
                <td>${robot.powerConsumption}W</td>
                <td>${robot.operatingHours}h</td>
                <td>${robot.status}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Error Distribution</h2>
        <table>
          <thead>
            <tr>
              <th>Error Type</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${data.errorDistribution
              .map((error) => {
                const total = data.errorDistribution.reduce((sum, e) => sum + e.count, 0)
                const percentage = total > 0 ? ((error.count / total) * 100).toFixed(1) : '0.0'
                return `
                <tr>
                  <td>${error.type}</td>
                  <td>${error.count}</td>
                  <td>${percentage}%</td>
                </tr>
              `
              })
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Report Summary</h2>
        <p>This report provides a comprehensive overview of your robot fleet's performance for the ${data.timeRange} period.</p>
        <ul>
          <li><strong>Fleet Efficiency:</strong> Your fleet is operating at ${data.fleetMetrics.avgEfficiency.toFixed(1)}% efficiency</li>
          <li><strong>Uptime Performance:</strong> Fleet uptime is ${data.fleetMetrics.avgUptime.toFixed(1)}%</li>
          <li><strong>Robot Status:</strong> ${data.fleetMetrics.onlineRobots} out of ${data.fleetMetrics.totalRobots} robots are currently online</li>
          <li><strong>Power Usage:</strong> Total power consumption is ${(data.fleetMetrics.totalPowerConsumption / 1000).toFixed(1)}kW</li>
        </ul>
      </div>
    </body>
    </html>
  `
}

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
