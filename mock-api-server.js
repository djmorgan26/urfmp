const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Trace-ID', 'X-Request-ID', 'User-Agent'],
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Brand configuration
const brandConfig = {
  productName: process.env.PRODUCT_NAME || 'URFMP',
  productFullName: process.env.PRODUCT_FULL_NAME || 'Universal Robot Fleet Management Platform',
  tagline: process.env.TAGLINE || 'The Stripe of Robotics'
};

// Mock API endpoints
app.get('/', (req, res) => {
  res.json({
    name: `${brandConfig.productName} API (Mock)`,
    version: '1.0.0',
    description: `${brandConfig.productFullName} - Mock Server`,
    tagline: brandConfig.tagline,
    docs: '/docs',
    health: '/health',
  });
});

app.get('/api/v1/robots', (req, res) => {
  res.json({
    success: true,
    data: {
      robots: [
        {
          id: 'demo-robot-1',
          name: 'Demo Robot 1',
          vendor: 'Universal Robots',
          model: 'UR5e',
          status: 'online',
          lastSeen: new Date().toISOString(),
        }
      ]
    }
  });
});

app.post('/api/v1/robots', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'new-robot-' + Date.now(),
      ...req.body,
      status: 'online',
      createdAt: new Date().toISOString(),
    }
  });
});

// WebSocket server
const wss = new WebSocketServer({
  server,
  path: '/',
});

wss.on('connection', (ws, req) => {
  console.log('🔗 WebSocket client connected');

  // Send welcome message
  ws.send(JSON.stringify({
    id: 'welcome-' + Date.now(),
    type: 'event',
    event: 'connection:established',
    data: { message: 'Connected to URFMP Mock Server' },
    timestamp: new Date().toISOString(),
  }));

  // Send periodic heartbeat
  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        id: 'heartbeat-' + Date.now(),
        type: 'heartbeat',
        event: 'ping',
        data: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      }));
    }
  }, 30000);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received message:', message);

      // Echo subscription confirmations
      if (message.type === 'subscription') {
        ws.send(JSON.stringify({
          id: 'sub-confirm-' + Date.now(),
          type: 'response',
          event: 'subscription:confirmed',
          data: { channel: message.data?.channel },
          timestamp: new Date().toISOString(),
        }));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    clearInterval(heartbeat);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(heartbeat);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Mock URFMP API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 WebSocket server ready`);
});