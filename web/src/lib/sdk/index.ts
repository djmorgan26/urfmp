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

  on(event: string, handler: (data: any) => void) {
    // Demo mode stub
  }
}