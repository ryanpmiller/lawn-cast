# Testing Workflow & CI/CD Setup

This document outlines the comprehensive testing strategy implemented for the LawnCast application.

## Overview

The project uses a **tiered testing approach** to ensure code quality while maintaining developer productivity:

1. **Precommit**: Fast feedback (linting, formatting, unit tests)
2. **Pre-push**: Integration testing (E2E tests)
3. **CI/CD**: Comprehensive validation (all tests + build verification)

## Local Development Hooks

### Precommit Hook (`.husky/pre-commit`)

**Triggers**: Every `git commit`
**Duration**: ~5 seconds
**Purpose**: Catch common issues before they enter version control

**Checks performed**:

- ✅ Code formatting with Prettier (`npm run format:check`)
- ✅ ESLint code quality checks (`npm run lint`)
- ✅ Unit tests (`npm run test`)

**Escape hatch**: Use `git commit --no-verify` to bypass if needed

### Pre-push Hook (`.husky/pre-push`)

**Triggers**: Every `git push`
**Duration**: ~15 seconds
**Purpose**: Prevent integration issues from reaching the team

**Checks performed**:

- ✅ All E2E tests (`npm run e2e`)
- ✅ Automatic server management (proxy + dev server)
- ✅ Smart detection of already-running servers

**Escape hatch**: Use `git push --no-verify` to bypass if needed

**Features**:

- Detects if proxy server (port 3001) is already running
- Detects if dev server (ports 5173/5174/5175) is already running
- Automatically starts required servers if not running
- Cleans up background processes on exit

## GitHub Actions CI/CD (`.github/workflows/ci.yml`)

**Triggers**: Push to `main`/`develop` branches, Pull Requests
**Duration**: ~3-5 minutes
**Purpose**: Comprehensive validation before merging

### Parallel Job Strategy

The CI runs **4 parallel jobs** for maximum efficiency:

#### 1. **Lint & Format Check**

- ESLint validation
- Prettier formatting verification

#### 2. **Unit Tests**

- All Vitest unit tests
- Component tests
- Logic tests

#### 3. **E2E Tests**

- Full Playwright test suite (22 tests)
- Uses production build (`npm run preview`)
- Uploads test reports on failure

#### 4. **Build Verification**

- Production build (`npm run build`)
- Storybook build (`npm run build-storybook`)

### CI Environment Configuration

**Key differences from local development**:

- Uses `npm run preview` (production build) instead of `npm run dev`
- Installs Playwright browsers with dependencies
- Uses port 4173 for the preview server
- Automatically handled by `playwright.config.ts` environment detection

## Test Coverage

### Unit Tests (60 tests)

- **Components**: All major UI components
- **Logic**: Business logic and calculations
- **API**: Network adapters and error handling
- **Store**: State management

### E2E Tests (22 tests)

- **Smoke tests**: Basic functionality
- **Navigation**: Bottom navigation between pages
- **Homepage**: Loading states, recommendations, responsive design
- **Log page**: CRUD operations, validation
- **Onboarding**: Wizard flow and skip functionality
- **Data persistence**: Settings, entries, theme, data clearing
- **Error handling**: Corrupted data, migrations

## Running Tests Locally

```bash
# Unit tests only
npm run test

# E2E tests only (requires dev server)
npm run e2e

# All tests (unit + E2E)
npm run test && npm run e2e

# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint
```

## Best Practices

### For Developers

1. **Commit frequently** - Precommit hooks are fast
2. **Push regularly** - Pre-push hooks catch integration issues early
3. **Use escape hatches sparingly** - Only when absolutely necessary
4. **Fix formatting automatically** - Run `npm run format` when precommit fails

### For CI/CD

1. **Parallel execution** - All job types run simultaneously
2. **Fail fast** - Any job failure fails the entire workflow
3. **Artifact collection** - Test reports saved on E2E failures
4. **Environment parity** - CI uses production builds like deployment

## Troubleshooting

### Precommit Hook Issues

**Problem**: Formatting check fails
**Solution**: Run `npm run format` to auto-fix

**Problem**: Linting errors
**Solution**: Fix errors manually or run `npm run lint --fix` for auto-fixable issues

**Problem**: Unit tests fail
**Solution**: Fix failing tests or update snapshots if UI changed

### Pre-push Hook Issues

**Problem**: E2E tests timeout
**Solution**: Ensure no other servers are using ports 3001, 5173-5175

**Problem**: Server startup fails
**Solution**: Check if proxy server is running: `curl http://localhost:3001/health`

**Problem**: Hook takes too long
**Solution**: Use `git push --no-verify` as temporary escape hatch

### CI/CD Issues

**Problem**: E2E tests fail in CI but pass locally
**Solution**: Check Playwright report artifacts for detailed failure information

**Problem**: Build fails
**Solution**: Ensure all dependencies are properly declared in `package.json`

## Configuration Files

- **`.husky/pre-commit`**: Precommit hook script
- **`.husky/pre-push`**: Pre-push hook script
- **`.github/workflows/ci.yml`**: GitHub Actions workflow
- **`playwright.config.ts`**: E2E test configuration
- **`vitest.config.ts`**: Unit test configuration
- **`eslint.config.js`**: Linting configuration
- **`.prettierrc`**: Code formatting rules

## Metrics

**Current test success rate**: 100% (82 total tests)

- Unit tests: 60/60 passing
- E2E tests: 22/22 passing

**Performance benchmarks**:

- Precommit: ~5 seconds
- Pre-push: ~15 seconds
- CI pipeline: ~3-5 minutes
