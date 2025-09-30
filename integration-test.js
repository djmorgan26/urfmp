#!/usr/bin/env node

/**
 * URFMP Integration Test Suite
 *
 * Tests the complete system end-to-end including:
 * - Local Docker stack functionality
 * - Railway deployment health
 * - Database migrations
 * - API authentication and endpoints
 * - Core business logic
 */

const https = require('https');
const http = require('http');

// Test configuration
const LOCAL_API = 'http://localhost:3000';
const RAILWAY_API = 'https://urfmpapi-production.up.railway.app';
const API_KEY = 'urfmp_railway_production_secure_api_key';

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`${icon} ${name}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }

  testResults.tests.push({ name, status, details });
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.skipped++;
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'URFMP-Integration-Test/1.0',
        ...options.headers
      },
      timeout: 10000,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
            raw: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test suites
async function testLocalDockerStack() {
  log('\n🐳 Testing Local Docker Stack', 'bold');
  log('=' .repeat(50), 'blue');

  try {
    // Test API health
    const health = await makeRequest(`${LOCAL_API}/health`);
    if (health.status === 200 && health.data.success) {
      const checks = health.data.data.checks;
      const dbCheck = checks.find(c => c.name === 'database');
      const redisCheck = checks.find(c => c.name === 'redis');
      const rabbitCheck = checks.find(c => c.name === 'rabbitmq');

      logTest('Local API Health Check', 'PASS', `${checks.length} services checked`);
      logTest('Local Database Connection', dbCheck?.status === 'healthy' ? 'PASS' : 'FAIL',
        `Response time: ${dbCheck?.responseTime || 'N/A'}ms`);
      logTest('Local Redis Connection', redisCheck?.status === 'healthy' ? 'PASS' : 'FAIL',
        `Connected: ${redisCheck?.details?.connected || 'unknown'}`);
      logTest('Local RabbitMQ Connection', rabbitCheck?.status === 'healthy' ? 'PASS' : 'FAIL',
        `Connected: ${rabbitCheck?.details?.connected || 'unknown'}`);
    } else {
      logTest('Local API Health Check', 'FAIL', `Status: ${health.status}`);
    }

    // Test API authentication
    const robotsResponse = await makeRequest(`${LOCAL_API}/api/v1/robots`, {
      headers: { 'X-API-Key': 'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678' }
    });

    if (robotsResponse.status === 200 && robotsResponse.data.success) {
      logTest('Local API Authentication', 'PASS',
        `Found ${robotsResponse.data.data.robots.length} robots`);
    } else {
      logTest('Local API Authentication', 'FAIL',
        `Status: ${robotsResponse.status}, Error: ${robotsResponse.data?.error?.message || 'Unknown'}`);
    }

  } catch (error) {
    logTest('Local Docker Stack', 'FAIL', `Connection error: ${error.message}`);
  }
}

async function testRailwayDeployment() {
  log('\n🚂 Testing Railway Deployment', 'bold');
  log('=' .repeat(50), 'blue');

  try {
    // Test Railway API health
    const health = await makeRequest(`${RAILWAY_API}/health`);
    if (health.status === 200 && health.data.success) {
      const checks = health.data.data.checks;
      const dbCheck = checks.find(c => c.name === 'database');
      const redisCheck = checks.find(c => c.name === 'redis');
      const rabbitCheck = checks.find(c => c.name === 'rabbitmq');

      logTest('Railway API Health Check', 'PASS', `${checks.length} services checked`);
      logTest('Railway Database Connection', dbCheck?.status === 'healthy' ? 'PASS' : 'FAIL',
        `Version: ${dbCheck?.details?.version?.split(' ')[1] || 'Unknown'}`);
      logTest('Railway Redis Status', redisCheck?.status === 'healthy' ? 'PASS' : 'FAIL',
        redisCheck?.details?.message || 'Connected');
      logTest('Railway RabbitMQ Status', rabbitCheck?.status === 'healthy' ? 'PASS' : 'FAIL',
        rabbitCheck?.details?.message || 'Connected');
    } else {
      logTest('Railway API Health Check', 'FAIL', `Status: ${health.status}`);
    }

    // Test migration status
    const migrations = await makeRequest(`${RAILWAY_API}/admin/migrations/status`);
    if (migrations.status === 200 && migrations.data.success) {
      const { total, executed, pending } = migrations.data.data;
      logTest('Railway Migration Status', pending === 0 ? 'PASS' : 'FAIL',
        `${executed}/${total} executed, ${pending} pending`);
    } else {
      logTest('Railway Migration Status', 'FAIL', `Status: ${migrations.status}`);
    }

    // Test database tables
    const tables = await makeRequest(`${RAILWAY_API}/admin/database/tables`);
    if (tables.status === 200 && tables.data.success) {
      const tableCount = tables.data.data.count;
      const expectedTables = ['organizations', 'users', 'robots', 'migrations'];
      const hasRequired = expectedTables.every(table =>
        tables.data.data.tables.some(t => t.table_name === table)
      );
      logTest('Railway Database Schema', hasRequired ? 'PASS' : 'FAIL',
        `${tableCount} tables found`);
    } else {
      logTest('Railway Database Schema', 'FAIL', `Status: ${tables.status}`);
    }

  } catch (error) {
    logTest('Railway Deployment', 'FAIL', `Connection error: ${error.message}`);
  }
}

async function testApiAuthentication() {
  log('\n🔐 Testing API Authentication', 'bold');
  log('=' .repeat(50), 'blue');

  try {
    // Test API key authentication (local)
    const localAuth = await makeRequest(`${LOCAL_API}/api/v1/robots`, {
      headers: { 'X-API-Key': 'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678' }
    });

    if (localAuth.status === 200) {
      logTest('Local API Key Authentication', 'PASS', 'Valid API key accepted');
    } else {
      logTest('Local API Key Authentication', 'FAIL', `Status: ${localAuth.status}`);
    }

    // Test invalid API key (local)
    const localInvalidAuth = await makeRequest(`${LOCAL_API}/api/v1/robots`, {
      headers: { 'X-API-Key': 'invalid-key' }
    });

    if (localInvalidAuth.status === 401) {
      logTest('Local Invalid API Key Rejection', 'PASS', 'Invalid API key properly rejected');
    } else {
      logTest('Local Invalid API Key Rejection', 'FAIL', `Expected 401, got ${localInvalidAuth.status}`);
    }

    // Test JWT authentication with admin login (local)
    const loginResponse = await makeRequest(`${LOCAL_API}/api/v1/auth/login`, {
      method: 'POST',
      body: { email: 'admin@urfmp.com', password: 'admin123' }
    });

    if (loginResponse.status === 200 && loginResponse.data.success) {
      const token = loginResponse.data.data.accessToken;
      logTest('Local JWT Login', 'PASS', 'Admin login successful');

      // Test authenticated request with JWT
      const jwtRequest = await makeRequest(`${LOCAL_API}/api/v1/robots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (jwtRequest.status === 200) {
        logTest('Local JWT Authentication', 'PASS', 'JWT token accepted');
      } else {
        logTest('Local JWT Authentication', 'FAIL',
          `Status: ${jwtRequest.status}, Error: ${jwtRequest.data?.error?.message || 'Token rejected'}`);
      }
    } else {
      logTest('Local JWT Login', 'FAIL', `Status: ${loginResponse.status}`);
    }

  } catch (error) {
    logTest('API Authentication', 'FAIL', `Error: ${error.message}`);
  }
}

async function testCoreBusinessLogic() {
  log('\n🤖 Testing Core Business Logic', 'bold');
  log('=' .repeat(50), 'blue');

  try {
    // Test robots endpoint (local)
    const robots = await makeRequest(`${LOCAL_API}/api/v1/robots`, {
      headers: { 'X-API-Key': 'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678' }
    });

    if (robots.status === 200 && robots.data.success) {
      const robotCount = robots.data.data.robots.length;
      const hasValidStructure = robots.data.data.robots.every(robot =>
        robot.id && robot.name && robot.status && robot.vendor
      );
      logTest('Robots API Structure', hasValidStructure ? 'PASS' : 'FAIL',
        `${robotCount} robots with valid structure`);
    } else {
      logTest('Robots API', 'FAIL', `Status: ${robots.status}`);
    }

    // Test robot creation (local)
    const newRobot = {
      name: `Test Robot ${Date.now()}`,
      model: 'UR5e',
      vendor: 'universal_robots',
      serialNumber: `TEST-${Date.now()}`,
      firmwareVersion: '5.15.0',
      location: { facility: 'Test Lab', cell: 'Cell 1' },
      configuration: { reach: 850, joints: 6, maxPayload: 5 }
    };

    const createResponse = await makeRequest(`${LOCAL_API}/api/v1/robots`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678',
        'Content-Type': 'application/json'
      },
      body: newRobot
    });

    if (createResponse.status === 201 && createResponse.data.success) {
      const createdRobot = createResponse.data.data?.robot || createResponse.data.data;
      logTest('Robot Creation', 'PASS', `Created robot: ${createdRobot?.name || createdRobot?.id || 'Unknown'}`);

      // Test robot retrieval (if robot has ID)
      if (createdRobot?.id) {
        const getResponse = await makeRequest(`${LOCAL_API}/api/v1/robots/${createdRobot.id}`, {
          headers: { 'X-API-Key': 'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678' }
        });

        if (getResponse.status === 200 && getResponse.data.success) {
          const retrievedRobot = getResponse.data.data?.robot || getResponse.data.data;
          logTest('Robot Retrieval', 'PASS', `Retrieved robot: ${retrievedRobot?.name || retrievedRobot?.id || 'Unknown'}`);
        } else {
          logTest('Robot Retrieval', 'FAIL', `Status: ${getResponse.status}`);
        }
      } else {
        logTest('Robot Retrieval', 'SKIP', 'No robot ID available for retrieval test');
      }

    } else {
      logTest('Robot Creation', 'FAIL',
        `Status: ${createResponse.status}, Error: ${createResponse.data?.error?.message || 'Creation failed'}`);
    }

    // Test telemetry endpoint
    const telemetryResponse = await makeRequest(`${LOCAL_API}/api/v1/telemetry/aggregated`, {
      headers: { 'X-API-Key': 'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678' }
    });

    if (telemetryResponse.status === 200) {
      logTest('Telemetry API', 'PASS', 'Telemetry endpoint accessible');
    } else {
      logTest('Telemetry API', 'FAIL', `Status: ${telemetryResponse.status}`);
    }

  } catch (error) {
    logTest('Core Business Logic', 'FAIL', `Error: ${error.message}`);
  }
}

async function testWebSocketConnection() {
  log('\n🔌 Testing WebSocket Connection', 'bold');
  log('=' .repeat(50), 'blue');

  // Note: This is a basic WebSocket test
  // In a real integration test, you'd use a WebSocket client library
  logTest('WebSocket Connection', 'SKIP', 'WebSocket testing requires ws library (skipped in basic test)');
}

async function testPerformanceBasics() {
  log('\n⚡ Testing Performance Basics', 'bold');
  log('=' .repeat(50), 'blue');

  try {
    // Test API response time
    const start = Date.now();
    const healthCheck = await makeRequest(`${LOCAL_API}/health`);
    const responseTime = Date.now() - start;

    if (healthCheck.status === 200 && responseTime < 1000) {
      logTest('API Response Time', 'PASS', `${responseTime}ms (< 1000ms)`);
    } else if (healthCheck.status === 200) {
      logTest('API Response Time', 'FAIL', `${responseTime}ms (> 1000ms)`);
    } else {
      logTest('API Response Time', 'FAIL', `Status: ${healthCheck.status}`);
    }

    // Test concurrent requests
    const concurrentPromises = Array.from({ length: 5 }, () =>
      makeRequest(`${LOCAL_API}/health`)
    );

    const concurrentStart = Date.now();
    const concurrentResults = await Promise.all(concurrentPromises);
    const concurrentTime = Date.now() - concurrentStart;

    const allSuccessful = concurrentResults.every(r => r.status === 200);
    if (allSuccessful && concurrentTime < 2000) {
      logTest('Concurrent Requests', 'PASS', `5 requests in ${concurrentTime}ms`);
    } else {
      logTest('Concurrent Requests', 'FAIL',
        `${concurrentResults.filter(r => r.status === 200).length}/5 successful in ${concurrentTime}ms`);
    }

  } catch (error) {
    logTest('Performance Basics', 'FAIL', `Error: ${error.message}`);
  }
}

// Main test runner
async function runIntegrationTests() {
  log('\n🧪 URFMP Integration Test Suite', 'bold');
  log('🤖 Testing complete system functionality\n', 'cyan');

  const startTime = Date.now();

  // Run all test suites
  await testLocalDockerStack();
  await testRailwayDeployment();
  await testApiAuthentication();
  await testCoreBusinessLogic();
  await testWebSocketConnection();
  await testPerformanceBasics();

  // Summary
  const totalTime = Date.now() - startTime;
  const total = testResults.passed + testResults.failed + testResults.skipped;

  log('\n📊 Test Results Summary', 'bold');
  log('=' .repeat(50), 'blue');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`⏭️  Skipped: ${testResults.skipped}`, 'yellow');
  log(`📈 Total: ${total} tests in ${totalTime}ms`, 'cyan');

  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => log(`   • ${t.name}: ${t.details}`, 'red'));
  }

  // Exit code
  const success = testResults.failed === 0;
  log(`\n🎯 Integration Test Suite: ${success ? 'PASSED' : 'FAILED'}`, success ? 'green' : 'red');

  process.exit(success ? 0 : 1);
}

// Error handling
process.on('unhandledRejection', (error) => {
  log(`\n💥 Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runIntegrationTests().catch(error => {
    log(`\n💥 Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runIntegrationTests,
  makeRequest,
  testResults
};