// Minimal SDK stub for production build
export class URFMP {
  constructor(config: { apiKey?: string; baseUrl?: string; websocketUrl?: string }) {
    // Demo mode stub
  }

  async connectWebSocket() {
    // Demo mode stub
  }

  async getRobots() {
    return []
  }

  async sendCommand(robotId: string, command: any) {
    return { success: true }
  }

  async getLatestTelemetry(robotId: string) {
    // Return mock telemetry data
    return {
      robotId,
      timestamp: new Date(),
      data: {
        position: { x: 125.5, y: 245.8, z: 300.2 },
        temperature: { ambient: 25.3, controller: 35.7 },
        voltage: { supply: 48.2 },
        current: { total: 2.15 },
        power: { total: 103.5 },
        safety: { emergencyStop: false, protectiveStop: false },
      },
    }
  }

  async getTelemetryHistory(robotId: string, options: any) {
    // Return mock historical data
    const history = []
    for (let i = 0; i < 24; i++) {
      history.push({
        robotId,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        data: {
          position: {
            x: 125 + Math.random() * 10,
            y: 245 + Math.random() * 10,
            z: 300 + Math.random() * 5,
          },
          temperature: { ambient: 20 + Math.random() * 10, controller: 30 + Math.random() * 15 },
          power: { total: 80 + Math.random() * 40 },
        },
      })
    }
    return history
  }

  async getTelemetryMetrics(robotId: string) {
    // Return available metrics
    return ['position', 'temperature', 'voltage', 'current', 'power', 'safety']
  }

  async getAggregatedTelemetry(options: any) {
    // Return mock aggregated data
    return [
      { timestamp: new Date(), value: 100 + Math.random() * 50 },
      { timestamp: new Date(Date.now() - 3600000), value: 95 + Math.random() * 50 },
    ]
  }

  async createRobot(robotData: any) {
    return { success: true, id: 'demo-' + Date.now() }
  }

  async updateRobot(robotId: string, robotData: any) {
    return { success: true }
  }

  async acknowledgeAlert(alertId: string) {
    return { success: true }
  }

  on(event: string, handler: (data: any) => void) {
    // Demo mode stub
  }
}
