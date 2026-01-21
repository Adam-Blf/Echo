# Echo E2E Test Suite

Comprehensive end-to-end testing suite for the Echo dating app using Playwright.

## Overview

This test suite covers all critical user flows and edge cases:
- **Authentication Flow**: Login, signup, OAuth
- **Discover/Swipe Flow**: Card display, swiping mechanics, match triggers
- **Match Confirmation**: Match popups, navigation to chat
- **Chat Flow**: Message sending, display, timestamps, countdown timers
- **Block User Flow**: User blocking and unblocking
- **Navigation**: Page transitions, state persistence
- **Error Handling**: Network failures, rate limiting
- **Accessibility**: Mobile, tablet, desktop viewports
- **Security**: XSS prevention, data validation, rate limiting

## Project Structure

```
e2e/
├── critical-flow.spec.ts      # Main user flow tests
├── edge-cases.spec.ts         # Edge cases and error scenarios
├── fixtures/
│   ├── test-data.ts          # Test data and constants
│   └── page-objects.ts       # Page Object Model classes
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Echo app running on `http://localhost:5173`

### Installation

```bash
# Install dependencies (already done)
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests with visible browser
npm run test:e2e:headed

# Run specific test file
npm run test:e2e:critical      # Critical flow tests
npm run test:e2e:edge          # Edge case tests

# Run tests on specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
npm run test:e2e:mobile        # Mobile Chrome

# View test report
npm run test:e2e:report
```

## Test Architecture

### Page Object Model

Tests use the Page Object Model pattern for maintainability:

```typescript
const authPage = new AuthPage(page)
await authPage.goto()
await authPage.login('test@example.com', 'password')
await authPage.verifyLoaded()
```

**Available Page Objects:**
- `AuthPage`: Authentication page interactions
- `DiscoverPage`: Swipe card and discover page
- `ChatPage`: Message sending and chat interactions
- `MatchesPage`: Match list display
- `SettingsPage`: User settings and blocking
- `Navigation`: Bottom navigation utilities
- `Assertions`: Common assertion helpers

### Test Data

All test data is centralized in `fixtures/test-data.ts`:
- User credentials
- Mock profiles
- Chat messages
- Timeout constants
- URL paths

## Key Features

### 1. Critical Flow Tests (`critical-flow.spec.ts`)

**Auth Flow**
- Form display and validation
- Password visibility toggle
- OAuth button handling
- Navigation to signup

**Discover Flow**
- Card display with profile info
- Swipe mechanics (left, right, up)
- Action button clicks
- Filter opening
- Swipe limits display

**Match Flow**
- Match popup display
- Navigation from match to chat
- Match confirmation

**Chat Flow**
- Message sending via input
- Message display with timestamps
- Keyboard enter to send
- Message scrolling
- Countdown timer display
- Resonance status indicator

**Block Flow**
- Navigation to settings
- Block button access
- User blocking confirmation
- Blocked users list

**Navigation & State**
- Page transitions
- State persistence during navigation
- Bottom nav interaction

**Error & Loading**
- Loading state handling
- Network error handling
- Slow connection handling

**Accessibility**
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Desktop viewport (1920x1080)

**Security**
- URL credential exposure
- XSS attempt handling
- Message length validation
- Rate limit prevention

### 2. Edge Case Tests (`edge-cases.spec.ts`)

**Swipe Edge Cases**
- Rapid consecutive swipes
- Partial swipe gestures
- Edge of viewport swipes
- No more profiles state

**Chat Edge Cases**
- Empty message submission
- Whitespace-only messages
- Very long messages
- Special characters
- Emoji handling
- Rapid message sends
- Typing indicator timeout

**Navigation Edge Cases**
- Rapid navigation changes
- Back/forward navigation
- Invalid routes

**Viewport Changes**
- Viewport resize handling
- Zoom level changes

**Performance**
- Memory efficiency with many messages
- Handling many swipe cards

**Data Consistency**
- Message order preservation

## Configuration

### `playwright.config.ts`

```typescript
{
  testDir: './e2e',
  fullyParallel: true,
  retries: 2,
  reporters: ['html', 'json', 'junit', 'list'],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'Mobile Chrome' },
  ],
}
```

## Debugging

### Interactive Testing (UI Mode)

```bash
npm run test:e2e:ui
```

The UI mode allows you to:
- Step through tests
- Set breakpoints
- Inspect elements
- Replay test steps

### Debug Mode

```bash
npm run test:e2e:debug
```

Opens the Playwright Inspector for step-by-step debugging.

### Headed Mode

```bash
npm run test:e2e:headed
```

Run tests with visible browser windows for observation.

### Trace Viewer

After test failure:

```bash
npx playwright show-trace path/to/trace.zip
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### Writing New Tests

1. **Use Page Objects**: Encapsulate interactions in page objects
2. **Clear Test Names**: Describe what the test does
3. **AAA Pattern**: Arrange-Act-Assert
4. **Isolation**: Each test should be independent
5. **Timeouts**: Use appropriate waits and timeouts

Example:

```typescript
test('should send and display message', async ({ page }) => {
  // Arrange
  const chat = new ChatPage(page)
  await chat.goto('1')

  // Act
  await chat.sendMessage('Hello!')

  // Assert
  await expect(page.locator('text=Hello!')).toBeVisible()
})
```

### Selector Strategy

1. **Prefer accessible selectors**: `[data-testid]`, `[aria-label]`
2. **Use text matchers**: `text=`, `:has-text()`
3. **Fallback to class/attribute**: Last resort
4. **Avoid brittle selectors**: Don't rely on DOM structure

### Timeouts

- **Short**: 3000ms - Quick interactions
- **Medium**: 5000ms - Page loads
- **Long**: 10000ms - Network requests
- **Animation**: 500ms - UI transitions

## Test Metrics

### Coverage Goals

- **Critical flows**: 100% coverage
- **Edge cases**: 80% coverage
- **Error scenarios**: 95% coverage
- **Accessibility**: All viewports
- **Browser compatibility**: Chrome, Firefox, Safari
- **Mobile**: Pixel 5 (375x667)

### Performance Targets

- **Test execution**: < 2 minutes total
- **Single test**: < 30 seconds
- **Test flakiness**: < 1%

## Troubleshooting

### Test Fails with Timeout

1. Check app is running: `npm run dev`
2. Increase timeout in config or specific test
3. Check selectors with Inspector

### Flaky Tests

1. Add explicit waits before assertions
2. Use `waitForLoadState('networkidle')`
3. Check for race conditions
4. Review animation timings

### Selector Not Found

1. Open Playwright Inspector
2. Use `page.pause()` to stop at breakpoint
3. Inspect element with Inspector
4. Verify selector in browser console

### Performance Issues

1. Run with `--workers=1`
2. Check for memory leaks
3. Review test parallelization
4. Profile with trace viewer

## Maintenance

### Regular Updates

1. Update Playwright: `npm update @playwright/test`
2. Review browser updates
3. Check for deprecations
4. Refactor flaky tests

### Test Review

- Review failed tests immediately
- Update selectors on UI changes
- Add new tests for new features
- Remove obsolete tests

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## Contributing

When adding new tests:

1. Follow existing patterns
2. Use Page Objects
3. Add clear test descriptions
4. Update this README
5. Run full suite before committing

## Support

For issues or questions:
1. Check existing tests for examples
2. Consult Playwright docs
3. Review CI logs
4. Run in debug mode to investigate
