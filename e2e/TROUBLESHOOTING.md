# E2E Test Troubleshooting Guide

Solutions for common issues when running Playwright tests.

## Connection Issues

### Tests fail with "Connection Refused"

**Problem**: Tests can't connect to localhost:5173

**Solutions**:
1. Start the dev server in another terminal:
   ```bash
   npm run dev
   ```

2. Check if port is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :5173

   # Mac/Linux
   lsof -i :5173
   ```

3. Kill process on port 5173:
   ```bash
   # Windows
   taskkill /PID <PID> /F

   # Mac/Linux
   kill -9 <PID>
   ```

4. Check if server is responding:
   ```bash
   curl http://localhost:5173
   ```

## Selector Issues

### "Locator Not Found"

**Problem**: Test can't find element with given selector

**Solutions**:

1. **Use UI Mode to inspect**:
   ```bash
   npm run test:e2e:ui
   ```
   - Click "Pause" when test fails
   - Use Inspector tab to find element
   - Try selectors in Inspector console

2. **Check selector is correct**:
   ```typescript
   // Debug: Add pause point
   await page.pause()

   // Then inspect in console
   // document.querySelector('your-selector')
   ```

3. **Update selector strategy**:
   ```typescript
   // ❌ Fragile - DOM structure dependent
   await page.locator('div > button:nth-child(2)').click()

   // ✅ Better - Text based
   await page.locator('button:has-text("Send")').click()

   // ✅ Best - Data attribute
   await page.locator('[data-testid="send-button"]').click()
   ```

4. **Add `data-testid` to UI components**:
   ```tsx
   <button data-testid="send-button">Send</button>
   ```

### Selector works in Inspector but not in test

**Problem**: Console works, test fails

**Solution**: Wait for element before interaction
```typescript
// ❌ Bad - immediate click
await page.locator('selector').click()

// ✅ Good - wait first
await page.locator('selector').waitFor({ state: 'visible' })
await page.locator('selector').click()

// ✅ Better - explicit wait
const element = await waitForElement(page, 'selector', 5000)
await element.click()
```

## Timing Issues

### Tests timeout/hang

**Problem**: Tests are too slow or waiting forever

**Solutions**:

1. **Increase timeout**:
   ```typescript
   // In specific test
   test('slow test', async ({ page }) => {
     await page.goto(url, { waitUntil: 'load', timeout: 60000 })
   }, { timeout: 60000 })
   ```

2. **Or in config**:
   ```typescript
   // playwright.config.ts
   timeout: 60000, // 60 seconds per test
   ```

3. **Check for missing waits**:
   ```typescript
   // ❌ Bad - no wait for navigation
   await page.click('link')
   await page.locator('new-page-element').click()

   // ✅ Good - wait for navigation
   await page.click('link')
   await page.waitForLoadState('networkidle')
   await page.locator('new-page-element').click()
   ```

4. **Reduce global timeout in config** (if tests are flaky):
   ```typescript
   actionTimeout: 5000, // Reduce from 10000
   ```

## Flaky Tests

### Test passes sometimes, fails randomly

**Problem**: Race conditions or timing issues

**Solutions**:

1. **Replace sleep with waits**:
   ```typescript
   // ❌ Flaky - arbitrary wait
   await page.waitForTimeout(2000)

   // ✅ Better - wait for specific condition
   await page.waitForLoadState('networkidle')
   await page.locator('element').waitFor({ state: 'visible' })
   ```

2. **Use retry logic**:
   ```typescript
   const result = await retryOperation(
     async () => page.locator('element').textContent(),
     3, // max retries
     500 // delay ms
   )
   ```

3. **Check for animations**:
   ```typescript
   // Wait for animation to complete
   await page.waitForTimeout(500)
   ```

4. **Verify element state before interaction**:
   ```typescript
   // ❌ Flaky
   await page.locator('button').click()

   // ✅ Better
   await page.locator('button').waitFor({ state: 'enabled' })
   await page.locator('button').click()
   ```

5. **Re-run specific test**:
   ```bash
   npx playwright test -g "flaky test name" --repeat-each=10
   ```

## Browser Issues

### Chrome/Chromium won't start

**Problem**: Browser launch fails

**Solutions**:

1. **Reinstall browsers**:
   ```bash
   npx playwright install --with-deps chromium
   ```

2. **Check Chrome is installed**:
   ```bash
   npx playwright install
   ```

3. **Try different browser**:
   ```bash
   npm run test:e2e:firefox
   ```

### Browser crashes during test

**Problem**: Browser exits unexpectedly

**Solutions**:

1. **Check system resources**:
   - Close other applications
   - Check available disk space
   - Check available memory

2. **Run fewer workers**:
   ```bash
   npx playwright test --workers=1
   ```

3. **Reduce test concurrency**:
   ```bash
   npx playwright test --workers=2
   ```

## Mobile/Responsive Issues

### Mobile tests fail but desktop works

**Problem**: Selectors different on mobile

**Solutions**:

1. **Check viewport-specific selectors**:
   ```typescript
   // Different layout on mobile
   const selector = page.url().includes('mobile')
     ? '[data-mobile-button]'
     : '[data-desktop-button]'
   ```

2. **Use flexible selectors**:
   ```typescript
   // Works on all viewports
   await page.locator('button:has-text("Send")').click()
   ```

3. **Test specific viewport**:
   ```bash
   npx playwright test --project='Mobile Chrome'
   ```

## Network Issues

### Tests fail due to network errors

**Problem**: Network requests failing

**Solutions**:

1. **Check internet connection**:
   ```bash
   ping google.com
   ```

2. **Mock network calls**:
   ```typescript
   await page.route('**/api/**', (route) => {
     route.respond({
       status: 200,
       body: JSON.stringify({ data: 'mocked' })
     })
   })
   ```

3. **Simulate slow network**:
   ```typescript
   import { simulateSlowNetwork } from './fixtures/test-utils'
   await simulateSlowNetwork(page)
   ```

### API calls timeout

**Solutions**:

1. **Increase timeout**:
   ```typescript
   await page.waitForResponse(/api/, { timeout: 30000 })
   ```

2. **Check API is running**:
   ```bash
   curl http://api-url/health
   ```

3. **Use retry logic** (built-in):
   ```typescript
   const result = await retryOperation(
     () => fetch(url),
     3, // retries
     1000 // delay
   )
   ```

## Memory Issues

### Tests use too much memory

**Problem**: Memory leaks or high usage

**Solutions**:

1. **Run tests serially**:
   ```bash
   npx playwright test --workers=1
   ```

2. **Limit test scope**:
   ```bash
   npm run test:e2e:critical  # Smaller subset
   ```

3. **Close resources**:
   ```typescript
   test.afterEach(async ({ page }) => {
     await page.close()
   })
   ```

4. **Check for memory leaks**:
   ```bash
   npm run test:e2e:debug
   # Open DevTools in Inspector
   # Check Memory tab
   ```

## Screenshot/Video Issues

### Screenshots not saving

**Problem**: Screenshot artifacts not created

**Solutions**:

1. **Check directory exists**:
   ```bash
   mkdir -p test-results
   ```

2. **Check permissions**:
   ```bash
   ls -la test-results/
   chmod 755 test-results/
   ```

3. **Enable in config**:
   ```typescript
   screenshot: 'only-on-failure',
   video: 'retain-on-failure'
   ```

## CI/CD Issues

### Tests pass locally but fail in CI

**Problem**: Different environment

**Solutions**:

1. **Check Node version**:
   ```bash
   node --version
   ```

2. **Install dependencies fresh**:
   ```bash
   npm ci
   npx playwright install --with-deps
   ```

3. **Check for environment variables**:
   ```bash
   echo $CI
   echo $CI_BUILD_ID
   ```

4. **Run with CI settings**:
   ```bash
   CI=true npm run test:e2e
   ```

### GitHub Actions workflow fails

**Solutions**:

1. **Check logs**:
   - Go to Actions tab
   - Click failed workflow
   - Expand logs

2. **Common issues**:
   - Node version mismatch
   - Dependencies not installed
   - Port already in use

3. **Test locally first**:
   ```bash
   npm ci
   npm run build
   npm run test:e2e
   ```

## Debug Techniques

### Enable verbose logging

```bash
DEBUG=pw:api npm run test:e2e
```

### Pause execution

```typescript
test('debug test', async ({ page }) => {
  await page.pause() // Stops here
  // Inspect in browser
})
```

### Inspect requests/responses

```typescript
page.on('request', (request) => {
  console.log(`>> ${request.method()} ${request.url()}`)
})

page.on('response', (response) => {
  console.log(`<< ${response.status()} ${response.url()}`)
})
```

### View trace

```bash
npm run test:e2e -- --trace on
npx playwright show-trace path/to/trace.zip
```

### Check console errors

```typescript
const errors = []
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text())
  }
})
```

## Getting Help

### Check documentation
- e2e/README.md - Full guide
- e2e/TESTING_GUIDE.md - Best practices
- Playwright docs - https://playwright.dev

### Enable debug mode
```bash
npm run test:e2e:debug
```

### Try UI mode
```bash
npm run test:e2e:ui
```

### Look at examples
- e2e/critical-flow.spec.ts
- e2e/edge-cases.spec.ts
- e2e/advanced-scenarios.spec.ts

## Reporting Issues

When reporting test issues, include:
1. Error message
2. Test name
3. Browser (if specific)
4. Steps to reproduce
5. Screenshots/videos (if available)
6. Test log output

```bash
# Generate log
npm run test:e2e -- -g "failing test" > test.log 2>&1
```

## Quick Reference

| Issue | Solution |
|-------|----------|
| Connection refused | `npm run dev` |
| Selector not found | Use UI mode inspect |
| Test timeout | Increase timeout or add waits |
| Flaky test | Use explicit waits |
| Browser crash | Run with `--workers=1` |
| Memory issues | Use smaller test subset |
| CI fails | Check Node version |
| Screenshot not saving | Check directory exists |

## Still Having Issues?

1. **Check Playwright docs**: https://playwright.dev/docs/troubleshooting
2. **Search GitHub issues**: https://github.com/microsoft/playwright/issues
3. **Ask on Stack Overflow**: Tag with `playwright` and `testing`
4. **Review test examples** in this repo
