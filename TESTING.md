# Testing Echo - Quick Start

Fast reference for running and debugging tests.

## Installation

```bash
npm install
```

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Interactive Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

This opens a UI where you can:
- Run tests one by one
- Step through test steps
- Inspect DOM elements
- Replay failed tests

### Debug Mode
```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for detailed debugging.

### With Visible Browser
```bash
npm run test:e2e:headed
```

### Specific Test File
```bash
# Critical flows only
npm run test:e2e:critical

# Edge cases only
npm run test:e2e:edge
```

### Specific Browser
```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
npm run test:e2e:mobile
```

### Specific Test
```bash
npx playwright test -g "should send message"
```

### View Results
```bash
npm run test:e2e:report
```

## Before Running Tests

Make sure the Echo app is running:
```bash
npm run dev
```

App should be accessible at `http://localhost:5173`

## Common Issues

### Tests Can't Connect
- Make sure `npm run dev` is running in another terminal
- Check if port 5173 is in use: `netstat -ano | findstr :5173`

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Or pass timeout to specific test:
  ```bash
  npx playwright test --timeout=60000
  ```

### Selector Not Found
1. Open UI mode: `npm run test:e2e:ui`
2. Click "Pause" on the failing test
3. Use Inspector to find the correct selector
4. Update the test

### Flaky Tests
- Check for race conditions
- Add explicit waits before assertions
- Use `.waitFor({ state: 'visible' })`

## File Structure

```
e2e/
├── critical-flow.spec.ts       # 50+ core functionality tests
├── edge-cases.spec.ts          # 35+ edge case tests
├── advanced-scenarios.spec.ts  # 30+ complex journey tests
├── fixtures/
│   ├── test-data.ts           # Test data & constants
│   ├── page-objects.ts        # Page Object Model
│   └── test-utils.ts          # Utility functions
└── README.md                   # Full documentation

playwright.config.ts            # Configuration
E2E_TEST_SUMMARY.md            # Implementation details
```

## Test Categories

| Category | Command | Tests |
|----------|---------|-------|
| All | `npm run test:e2e` | 115+ |
| Critical Flows | `npm run test:e2e:critical` | 50 |
| Edge Cases | `npm run test:e2e:edge` | 35 |
| Advanced | Included in all | 30 |

## Key Commands

| Task | Command |
|------|---------|
| Run all tests | `npm run test:e2e` |
| Interactive UI | `npm run test:e2e:ui` |
| Debug mode | `npm run test:e2e:debug` |
| View report | `npm run test:e2e:report` |
| Single browser | `npm run test:e2e:chromium` |
| Mobile only | `npm run test:e2e:mobile` |

## CI/CD

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests
- Results posted as PR comment

## Documentation

- **README.md** - Getting started guide
- **TESTING_GUIDE.md** - Advanced concepts
- **e2e/README.md** - Complete documentation
- **E2E_TEST_SUMMARY.md** - Implementation overview

## Test Features

✅ Multi-browser (Chrome, Firefox, Safari, Mobile)
✅ Multiple viewports (Mobile, Tablet, Desktop)
✅ Page Object Model
✅ Reusable utilities
✅ Error handling
✅ Accessibility testing
✅ Performance measurement
✅ Screenshot on failure
✅ Video recording
✅ Trace collection

## Example Tests

### Send Message
```typescript
test('should send message', async ({ page }) => {
  const chat = new ChatPage(page)
  await chat.goto('1')
  await chat.sendMessage('Hello!')
  await expect(page.locator('text=Hello!')).toBeVisible()
})
```

### Swipe Card
```typescript
test('should swipe right', async ({ page }) => {
  await page.goto('/discover')
  await swipeCard(page, '[class*="card"]', 'right')
  // Next card appears
})
```

### Check Accessibility
```typescript
test('should be responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/discover')
  // Content should still be visible
})
```

## Performance Tips

1. **Run specific tests instead of all**
   ```bash
   npx playwright test -g "critical"
   ```

2. **Use single browser**
   ```bash
   npm run test:e2e:chromium
   ```

3. **Reduce workers for slower machines**
   ```bash
   npx playwright test --workers=1
   ```

4. **Skip headed mode in CI**
   - Configured automatically in CI

## Next Steps

1. Read **TESTING_GUIDE.md** for best practices
2. Check **e2e/README.md** for detailed info
3. Run tests in UI mode to explore
4. Add new tests following examples

## Support

- Check e2e/README.md for troubleshooting
- Review test examples in e2e/critical-flow.spec.ts
- Use `npm run test:e2e:debug` for investigation
- Check Playwright docs: https://playwright.dev
