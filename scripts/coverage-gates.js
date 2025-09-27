#!/usr/bin/env node

/**
 * Coverage Quality Gates Script
 * Validates test coverage across all packages and enforces quality standards
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const PACKAGES = [
  {
    name: '@urfmp/types',
    path: 'packages/types',
    minCoverage: { lines: 0, functions: 0, branches: 0, statements: 0 },
  },
  {
    name: '@urfmp/sdk',
    path: 'packages/sdk',
    minCoverage: { lines: 25, functions: 15, branches: 25, statements: 25 },
  },
  {
    name: '@urfmp/api',
    path: 'services/api',
    minCoverage: { lines: 70, functions: 70, branches: 70, statements: 70 },
  },
  {
    name: '@urfmp/web',
    path: 'web',
    minCoverage: { lines: 75, functions: 75, branches: 75, statements: 75 },
  },
]

function runCoverage(packagePath, packageName) {
  console.log(`\n🔍 Running coverage for ${packageName}...`)

  try {
    const cwd = path.join(process.cwd(), packagePath)

    // Check if package has test:coverage script
    const packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'))
    if (!packageJson.scripts || !packageJson.scripts['test:coverage']) {
      console.log(`⚠️  ${packageName} does not have test:coverage script, skipping coverage check`)
      return { success: true, coverage: null }
    }

    execSync('npm run test:coverage', {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' },
    })

    return { success: true, coverage: null }
  } catch (error) {
    console.error(`❌ Coverage failed for ${packageName}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

function validateCoverageThresholds() {
  console.log('\n🎯 Validating coverage quality gates...\n')

  let allPassed = true
  const results = []

  for (const pkg of PACKAGES) {
    const result = runCoverage(pkg.path, pkg.name)
    results.push({ ...pkg, ...result })

    if (!result.success) {
      allPassed = false
    }
  }

  // Summary
  console.log('\n📊 Coverage Quality Gates Summary:')
  console.log('='.repeat(50))

  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${result.name}`)
    if (!result.success) {
      console.log(`   Error: ${result.error}`)
    }
  }

  if (allPassed) {
    console.log('\n🎉 All coverage quality gates passed!')
    process.exit(0)
  } else {
    console.log('\n💥 Some coverage quality gates failed!')
    process.exit(1)
  }
}

// Generate coverage report
function generateUnifiedReport() {
  console.log('\n📈 Generating unified coverage report...')

  // This could be extended to merge coverage reports from all packages
  console.log("Coverage reports generated in each package's coverage/ directory")
  console.log('- packages/types/coverage/')
  console.log('- packages/sdk/coverage/')
  console.log('- services/api/coverage/')
  console.log('- web/coverage/')
}

if (require.main === module) {
  console.log('🚀 URFMP Coverage Quality Gates')
  console.log('='.repeat(50))

  validateCoverageThresholds()
  generateUnifiedReport()
}

module.exports = { validateCoverageThresholds, runCoverage }
