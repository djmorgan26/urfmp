# URFMP Comprehensive Testing Suite

This directory contains a complete testing framework designed for continuous validation of all URFMP functionality. Perfect for CI/CD integration and ensuring quality across releases.

## 🎯 Overview

The testing suite consists of three main components:

1. **Automated Test Suite** (`comprehensive.test.ts`) - 200+ validation checks
2. **Manual Test Checklist** (`MANUAL_TEST_CHECKLIST.md`) - Step-by-step verification guide
3. **CI/CD Integration** (GitHub Actions workflow + test runner)

## 🚀 Quick Start

### Basic Testing Commands

```bash
# Run all automated tests
npm test

# Run comprehensive test suite only
npm run test:comprehensive

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run complete CI/CD test pipeline
npm run test:ci

# Run all quality checks (TypeScript + ESLint + Tests)
npm run quality
```

### CI/CD Test Runner

```bash
# Full CI/CD pipeline (recommended for production)
node test-runner.js --ci --coverage --bail

# Local development testing
node test-runner.js

# Custom testing with options
node test-runner.js --coverage --bail
```

## 📋 Test Categories

### 1. Core System Functionality
- Environment variable validation
- API endpoint configuration
- Database connectivity
- Health check validation

### 2. Authentication & Security
- JWT token structure validation
- API key format verification
- User credential validation
- Security headers and CORS

### 3. Robot Management
- Robot data structure validation
- CRUD operations testing
- Status management validation
- Telemetry data structure checks

### 4. Geofencing System
- Geofence data validation (circles, polygons, rectangles)
- Waypoint structure validation (all types)
- Path data validation and optimization
- GPS coordinate range validation
- Real-time event processing

### 5. Analytics & Reporting
- Analytics data structure validation
- Export functionality testing
- Date range validation
- Filter system validation

### 6. Predictive Maintenance
- Maintenance task structure validation
- AI insights validation
- Health score calculations
- Cost optimization checks

### 7. Real-time Features
- WebSocket event structure validation
- Alert system validation
- Live telemetry data validation
- Real-time update mechanisms

### 8. Map Integration
- Map component props validation
- GPS trail data validation
- Geofencing visualization validation
- Interactive controls testing

### 9. Performance & Security
- Data sanitization validation
- Rate limiting structure validation
- Pagination parameter validation
- Bundle size monitoring

### 10. API Endpoints
- Endpoint URL validation
- HTTP status code validation
- Request/response structure validation

## 🔧 Setup Instructions

### Install Testing Dependencies

```bash
# Install required testing packages
npm install --save-dev \
  jsdom@^21.1.0 \
  @testing-library/react@^13.4.0 \
  @testing-library/jest-dom@^5.16.5 \
  @testing-library/user-event@^14.4.3 \
  @vitest/coverage-v8@^0.29.8
```

### Configuration Files

The testing suite includes:

- `vitest.config.ts` - Vitest configuration with coverage thresholds
- `setup.ts` - Test environment setup and mocks
- `test-runner.js` - CI/CD test orchestration script

### Environment Variables

Ensure these environment variables are set for testing:

```bash
VITE_COMPANY_NAME=URFMP
VITE_PRODUCT_NAME=URFMP
VITE_URFMP_API_KEY=urfmp_test_key_12345
NODE_ENV=test
DEV_MOCK_ROBOTS=true
```

## 🏗️ CI/CD Integration

### GitHub Actions Workflow

The included `.github/workflows/ci-cd.yml` provides:

- **Automated Testing** - Runs all test suites on push/PR
- **Security Auditing** - Dependency vulnerability scanning
- **Build Validation** - Production build verification
- **Performance Monitoring** - Bundle size and Lighthouse checks
- **Manual Test Notifications** - Creates GitHub issues for manual testing

### Test Thresholds

The system enforces quality gates:

```typescript
// Coverage thresholds
global: {
  branches: 70%,
  functions: 70%,
  lines: 75%,
  statements: 75%
}

// Critical modules (higher thresholds)
hooks: 80-85%
utils: 85-90%
```

### Exit Codes

The test runner uses standardized exit codes for CI/CD:

- `0` - All tests passed
- `1` - Tests failed
- `2` - Build failed
- `3` - Type check failed
- `4` - Lint failed

## 📊 Test Coverage

### Current Coverage Areas

✅ **Fully Covered (200+ tests)**
- Core system validation
- Data structure validation
- Authentication flow validation
- API endpoint validation
- Security validation
- Performance validation

🔄 **Partial Coverage (requires component testing dependencies)**
- Component rendering tests
- User interaction tests
- Integration tests
- E2E workflow tests

### Adding New Tests

To extend the test suite:

1. **Add to comprehensive.test.ts**:
```typescript
describe('New Feature Category', () => {
  it('should validate new feature data structure', () => {
    const mockData = { /* your test data */ }
    expect(mockData).toHaveProperty('requiredField')
    expect(mockData.requiredField).toBeDefined()
  })
})
```

2. **Update manual checklist**:
   - Add new manual test steps to `MANUAL_TEST_CHECKLIST.md`
   - Include in appropriate category
   - Update test count and summary

3. **Update CI/CD workflow**:
   - Add environment variables if needed
   - Update smoke tests for new critical paths
   - Modify deployment validation steps

## 🎯 Best Practices

### Writing Tests

```typescript
// ✅ Good - Specific, isolated test
it('should validate robot GPS coordinates within valid ranges', () => {
  const coordinates = { latitude: 40.7589, longitude: -73.9851 }
  expect(coordinates.latitude).toBeGreaterThanOrEqual(-90)
  expect(coordinates.latitude).toBeLessThanOrEqual(90)
  expect(coordinates.longitude).toBeGreaterThanOrEqual(-180)
  expect(coordinates.longitude).toBeLessThanOrEqual(180)
})

// ❌ Avoid - Too broad, multiple responsibilities
it('should validate all robot data', () => {
  // Testing too many things at once
})
```

### Manual Testing

- Follow the checklist systematically
- Test in both light and dark modes
- Verify on different screen sizes
- Test with real data when possible
- Document any deviations or issues

### CI/CD Integration

- Run tests on every commit
- Block deployments on test failures
- Monitor test performance trends
- Update tests with new features
- Maintain test environment parity

## 📈 Monitoring & Maintenance

### Regular Tasks

**Weekly:**
- Review test coverage reports
- Update test data with realistic scenarios
- Check for flaky tests
- Update manual test checklist

**Monthly:**
- Review and update test thresholds
- Audit test execution times
- Update testing dependencies
- Analyze test failure patterns

**Per Release:**
- Run full manual test checklist
- Validate all smoke tests pass
- Update test documentation
- Review CI/CD pipeline performance

### Troubleshooting

**Common Issues:**

1. **Tests timeout**: Increase timeout in `vitest.config.ts`
2. **Mock issues**: Check `setup.ts` for missing mocks
3. **Coverage too low**: Add more test cases or adjust thresholds
4. **CI/CD failures**: Check environment variables and dependencies

**Debug Commands:**

```bash
# Run tests with verbose output
npx vitest --reporter=verbose

# Run single test file
npx vitest src/tests/comprehensive.test.ts

# Check test configuration
npx vitest --config

# Debug coverage issues
npm run test:coverage -- --reporter=html
```

## 🔄 Future Enhancements

### Planned Additions

- **E2E Testing** - Playwright integration for full user journeys
- **Visual Regression Testing** - Screenshot comparison for UI changes
- **Load Testing** - Performance testing for high traffic scenarios
- **API Contract Testing** - OpenAPI schema validation
- **Database Testing** - Migration and data integrity tests

### Integration Opportunities

- **Monitoring Integration** - Send test results to monitoring systems
- **Slack Notifications** - Real-time test failure notifications
- **Performance Budgets** - Automated performance regression detection
- **Security Scanning** - SAST/DAST integration with test pipeline

---

## 📞 Support & Contributing

### Questions or Issues?

1. Check existing test failures in the GitHub Issues
2. Review test logs in CI/CD pipeline
3. Consult the troubleshooting section above
4. Ask in the development team chat

### Contributing New Tests

1. Follow the existing test patterns
2. Add comprehensive documentation
3. Update the manual checklist if needed
4. Ensure tests are deterministic and fast
5. Include both positive and negative test cases

**Happy Testing! 🧪**

The comprehensive test suite ensures URFMP maintains its high quality standards across all releases and deployments.