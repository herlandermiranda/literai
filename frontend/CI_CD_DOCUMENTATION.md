# LiterAI - CI/CD Pipeline Documentation

## Overview

This document describes the Continuous Integration/Continuous Deployment (CI/CD) pipeline for LiterAI. The pipeline ensures code quality, prevents regressions, and maintains a high standard of testing across all commits and pull requests.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Actions Workflows                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┬─────────────────────┐
        ↓                     ↓                     ↓
   ┌─────────────┐      ┌──────────────┐    ┌──────────────┐
   │ E2E Tests   │      │ Integration  │    │ Branch       │
   │ (3 browsers)│      │ Tests        │    │ Protection   │
   └─────────────┘      └──────────────┘    └──────────────┘
        ↓                     ↓                     ↓
   ┌─────────────┐      ┌──────────────┐    ┌──────────────┐
   │ Chromium    │      │ API Tests    │    │ Code Quality │
   │ Firefox     │      │ (13 tests)   │    │ Checks       │
   │ WebKit      │      └──────────────┘    └──────────────┘
   └─────────────┘                               ↓
        ↓                                   ┌──────────────┐
   ┌─────────────┐                         │ Performance  │
   │ Regression  │                         │ Checks       │
   │ Detection   │                         └──────────────┘
   └─────────────┘                               ↓
        ↓                                   ┌──────────────┐
   ┌─────────────┐                         │ Security     │
   │ Test Summary│                         │ Checks       │
   └─────────────┘                         └──────────────┘
        ↓                                        ↓
        └────────────────┬──────────────────────┘
                         ↓
                  ┌─────────────────┐
                  │ Merge Readiness │
                  │ Check           │
                  └─────────────────┘
                         ↓
        ┌────────────────┴────────────────┐
        ↓                                 ↓
   ✅ MERGE OK                      ❌ MERGE BLOCKED
```

## Workflows

### 1. E2E Tests Workflow (`e2e-tests.yml`)

**Trigger:** Push to `main` or `develop`, Pull Requests

**Jobs:**
- **E2E Tests** (3 parallel jobs for Chromium, Firefox, WebKit)
  - Installs dependencies
  - Starts dev server
  - Runs auth flow tests
  - Runs main flow tests
  - Uploads test reports and videos

- **Integration Tests**
  - Runs API integration tests
  - Uploads coverage reports

- **Regression Detection**
  - Analyzes test results
  - Detects regressions
  - Comments on PR with summary

- **Test Summary**
  - Final check of all test results
  - Determines if merge is allowed

**Timeout:** 30 minutes

**Artifacts:**
- `playwright-report-{browser}` - Test reports for each browser
- `test-videos-{browser}` - Video recordings of failed tests (7 days retention)
- `coverage-report` - Code coverage reports (30 days retention)

### 2. Branch Protection Workflow (`branch-protection.yml`)

**Trigger:** Pull Requests, Status checks

**Jobs:**
- **Check Required Status Checks**
  - Verifies all required checks have passed
  - Blocks merge if any check failed

- **Code Quality Checks**
  - TypeScript type checking
  - Linting (if configured)
  - Console statement detection
  - TODO/FIXME comment detection

- **Performance Checks**
  - Builds the project
  - Checks bundle size (max 10MB)
  - Verifies build completes in < 10 minutes

- **Security Checks**
  - npm audit for vulnerabilities
  - Secret detection (TruffleHog)
  - Hardcoded credentials detection

- **Merge Readiness Check**
  - Final verification before merge
  - Comments on PR with merge status

**Timeout:** 15 minutes

## Test Coverage

### E2E Tests (65 total)
- **Auth Flows** (13 tests × 5 browsers = 65 tests)
  - Cold start without token
  - Login flow
  - Registration flow
  - Error handling (401, 500, timeout, network)
  - Token management
  - Concurrent requests

- **Main Flows** (12 tests)
  - Complete user journey (register → create project → create document → add tags)
  - Multiple documents creation
  - Tag management and entity creation
  - Document versioning and history
  - Export functionality
  - Error recovery
  - Concurrent operations
  - Performance validation
  - Search and filtering
  - Collaboration features (future)
  - Undo/Redo operations
  - Keyboard shortcuts

- **Accessibility Tests** (3 tests)
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast

- **Mobile Responsiveness** (2 tests)
  - Mobile device testing
  - Orientation change handling

### Integration Tests (13 total)
- Token management
- Error handling (401, 500, timeout, network)
- Login/Registration flows
- Cold start scenarios

### Backend Tests (84 total)
- Unit tests (71% coverage)
- Integration tests
- E2E versioning tests

## Required Checks for Merge

To merge a PR into `main` or `develop`, the following checks must pass:

1. ✅ **E2E Tests - chromium** - All tests must pass
2. ✅ **E2E Tests - firefox** - All tests must pass
3. ✅ **E2E Tests - webkit** - All tests must pass
4. ✅ **Integration Tests** - All tests must pass
5. ✅ **Regression Detection** - No new regressions
6. ✅ **Performance Checks** - Build size < 10MB
7. ⚠️ **Code Quality** - Warnings allowed, but no critical issues
8. ⚠️ **Security** - Warnings allowed, but no critical vulnerabilities

## Running Tests Locally

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- tests/e2e/auth.spec.ts

# Run with UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run on specific browser
npm run test:e2e -- --project=chromium
```

### Integration Tests
```bash
# Run all integration tests
npm run test -- tests/integration/ --run

# Run specific test file
npm run test -- tests/integration/api-auth.test.tsx --run

# Run with UI
npm run test:ui
```

### All Tests
```bash
# Run all tests (unit + integration + E2E)
npm run test:all
```

## Regression Detection

The regression detection system automatically:

1. **Compares** test results between commits
2. **Identifies** tests that were passing but are now failing
3. **Detects** new test failures
4. **Highlights** improvements (tests that were failing but now pass)
5. **Generates** detailed reports

### Regression Report Format

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "totalTests": 150,
  "passedTests": 148,
  "failedTests": 2,
  "skippedTests": 0,
  "regressions": [
    "❌ Auth Flow - Login should succeed - was passing, now failing",
    "🆕 New Test - Tag System - new test, failing"
  ],
  "improvements": [
    "✅ Error Handling - Network Error - was failing, now passing"
  ],
  "newFailures": [...],
  "newPasses": [...]
}
```

## Merge Blocking Criteria

A PR will be **blocked from merging** if:

1. ❌ Any required E2E test fails
2. ❌ Any integration test fails
3. ❌ Build size exceeds 10MB
4. ❌ Critical security vulnerabilities detected
5. ❌ Hardcoded credentials found

A PR **can be merged** if:

1. ✅ All required E2E tests pass
2. ✅ All integration tests pass
3. ✅ Build size is within limits
4. ✅ No critical security issues
5. ✅ No regressions detected

## GitHub Actions Configuration

### Branch Protection Rules

To enable automatic merge blocking, configure the following in GitHub:

1. Go to **Settings** → **Branches** → **Add rule**
2. Apply to branch: `main`
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require code reviews before merging (1 approval)
   - ✅ Require approval from code owners

4. Select required status checks:
   - `E2E Tests - chromium`
   - `E2E Tests - firefox`
   - `E2E Tests - webkit`
   - `Integration Tests`
   - `Regression Detection`
   - `Performance Checks`

## Troubleshooting

### Tests Failing Locally but Passing in CI

**Possible causes:**
- Different Node.js version
- Different environment variables
- Cached dependencies
- Timing issues

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Run tests with specific Node version
nvm use 22
npm run test:all
```

### E2E Tests Timeout

**Possible causes:**
- Slow network
- Server not responding
- Browser not starting

**Solutions:**
```bash
# Increase timeout
npm run test:e2e -- --timeout=60000

# Run with debug output
npm run test:e2e:debug

# Check server is running
curl http://localhost:3000
```

### Regression Detection Not Working

**Possible causes:**
- Report file not found
- Incorrect report format
- Script permissions

**Solutions:**
```bash
# Check if report exists
ls -la playwright-report/

# Run regression detection manually
node scripts/detect-regressions.mjs

# Check script permissions
chmod +x scripts/detect-regressions.mjs
```

## Performance Benchmarks

| Metric | Target | Current |
|--------|--------|---------|
| Page Load Time | < 3s | ~2.5s |
| Build Time | < 10m | ~5m |
| Build Size | < 10MB | ~4.5MB |
| E2E Test Suite | < 30m | ~25m |
| Integration Tests | < 15m | ~8m |

## Future Improvements

1. **Visual Regression Testing** - Add screenshot comparison tests
2. **Performance Monitoring** - Track performance metrics over time
3. **Load Testing** - Add load testing for API endpoints
4. **Accessibility Audit** - Automated accessibility testing
5. **Deployment Pipeline** - Auto-deploy to staging/production
6. **Slack Notifications** - Notify team of test results
7. **Test Parallelization** - Run tests in parallel across multiple machines
8. **Code Coverage Tracking** - Track coverage trends over time

## Contact & Support

For questions about the CI/CD pipeline:
- Check the GitHub Actions logs
- Review test reports in artifacts
- Run tests locally to debug
- Check this documentation

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [LiterAI Test Strategy](./TEST_STRATEGY.md)
- [LiterAI Test Implementation Guide](./TEST_IMPLEMENTATION_GUIDE.md)
