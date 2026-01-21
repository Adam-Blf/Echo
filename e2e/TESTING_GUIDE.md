# Echo E2E Testing Guide

Comprehensive guide for understanding, writing, and maintaining E2E tests.

## Table of Contents

1. [Test Structure](#test-structure)
2. [Writing Tests](#writing-tests)
3. [Page Object Model](#page-object-model)
4. [Best Practices](#best-practices)
5. [Common Patterns](#common-patterns)
6. [Debugging](#debugging)
7. [Performance](#performance)

## Test Structure

### File Organization

```
e2e/
├── fixtures/
│   ├── test-data.ts          # Test data, constants
│   ├── page-objects.ts       # Page Object Model classes
│   └── test-utils.ts         # Utility functions
├── critical-flow.spec.ts     # Main user flows
├── edge-cases.spec.ts        # Edge cases and errors
└── README.md
```

### Test Naming Convention

```typescript
test.describe('Feature - Subfature', () => {
  test('should [expected behavior] when [condition]', async ({ page }) => {
    // Test code
  })
})
```

Examples:
- ✅ `should send message when input is not empty`
- ✅ `should display error when email is invalid`
- ❌ `test sends message`
- ❌ `chat test`

## Writing Tests

### Basic Test Structure (AAA Pattern)

```typescript
test('should send message and display it', async ({ page }) => {
  // Arrange: Setup initial state
  const chat = new ChatPage(page)
  await chat.goto('match-1')
  await page.waitForLoadState('networkidle')

  // Act: Perform the action
  const message = 'Hello world'
  await chat.sendMessage(message)

  // Assert: Verify the outcome
  await expect(page.locator(`text=${message}`)).toBeVisible()
})
```

### Test Categories

#### 1. Feature Tests
Test core functionality:

```typescript
test('should display swipe card with profile info', async ({ page }) => {
  await page.goto('/discover')
  await expect(page.locator('h2[class*="text-3xl"]')).toBeVisible()
  await expect(page.locator('text=km')).toBeVisible()
})
```

#### 2. Interaction Tests
Test user interactions:

```typescript
test('should send message on enter key', async ({ page }) => {
  const chat = new ChatPage(page)
  await chat.goto('1')

  const input = page.locator('input[placeholder*="message"]')
  await input.fill('Test')
  await input.press('Enter')

  await expect(page.locator('text=Test')).toBeVisible()
})
```

#### 3. Error Handling Tests
Test error scenarios:

```typescript
test('should show error on invalid email', async ({ page }) => {
  const auth = new AuthPage(page)
  await auth.goto()

  const emailInput = page.locator('input[type="email"]')
  await emailInput.fill('invalid-email')

  const isValid = await emailInput.evaluate(
    (el: HTMLInputElement) => el.validity.valid
  )
  expect(isValid).toBeFalsy()
})
```

#### 4. Navigation Tests
Test page transitions:

```typescript
test('should navigate to chat from match popup', async ({ page }) => {
  await page.goto('/discover')
  // Trigger match...
  await page.locator('button:has-text("Message")').click()

  await expect(page).toHaveURL(/\/chat\//)
})
```

#### 5. Accessibility Tests
Test responsive design and accessibility:

```typescript
test('should be responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/discover')

  const buttons = page.locator('button')
  await expect(buttons.first()).toBeVisible()
})
```

## Page Object Model

### Creating a Page Object

```typescript
export class ChatPage {
  constructor(private page: Page) {}

  async goto(matchId: string) {
    await this.page.goto(`/chat/${matchId}`)
    await this.page.waitForLoadState('networkidle')
  }

  async sendMessage(text: string) {
    const input = this.page.locator('input[placeholder*="message"]')
    await input.fill(text)

    const sendButton = this.page.locator('button:has(svg[class*="Send"])')
    await sendButton.click()
  }

  async getMessages() {
    return this.page.locator('[class*="px-4"][class*="rounded-2xl"]')
  }

  async verifyMessageSent(text: string) {
    return this.getMessages().filter({ hasText: text }).first().isVisible()
  }
}
```

### Using Page Objects in Tests

```typescript
test('should send message', async ({ page }) => {
  const chat = new ChatPage(page)
  await chat.goto('1')

  await chat.sendMessage('Hello!')
  const visible = await chat.verifyMessageSent('Hello!')

  expect(visible).toBeTruthy()
})
```

### Benefits of Page Objects

1. **Maintainability**: Single source of truth for selectors
2. **Readability**: Test code reads like requirements
3. **Reusability**: Share common interactions
4. **Refactoring**: Change implementation without updating tests

## Best Practices

### 1. Selector Strategy

**Prefer (in order):**
1. `data-testid` attributes
2. `aria-label` and accessibility attributes
3. Text content matching
4. Stable class names
5. HTML structure (fragile!)

```typescript
// ✅ Good
await page.locator('[data-testid="send-button"]').click()
await page.locator('[aria-label="Send message"]').click()
await page.locator('button:has-text("Send")').click()

// ❌ Fragile
await page.locator('.container > div > button:nth-child(3)').click()
```

### 2. Wait Strategies

Always wait for the right condition:

```typescript
// ✅ Good - Wait for element visibility
await page.locator('[data-testid="message"]').waitFor({ state: 'visible' })

// ✅ Good - Wait for network idle
await page.waitForLoadState('networkidle')

// ✅ Good - Wait for specific condition
await page.waitForFunction(() => {
  return document.querySelectorAll('.message').length > 0
})

// ❌ Bad - Arbitrary sleep
await page.waitForTimeout(5000)
```

### 3. Test Isolation

Each test should be independent:

```typescript
// ✅ Good - Each test sets up its own state
test('test 1', async ({ page }) => {
  const chat = new ChatPage(page)
  await chat.goto('1')
  // Test...
})

test('test 2', async ({ page }) => {
  const chat = new ChatPage(page)
  await chat.goto('2') // Independent setup
  // Test...
})

// ❌ Bad - Test depends on previous test
let matchId = ''
test('get match id', async ({ page }) => {
  matchId = '1'
})
test('chat with match', async ({ page }) => {
  // Depends on previous test!
})
```

### 4. Error Messages

Provide clear error messages:

```typescript
// ✅ Good
expect(messageCount, `expected ${messageCount} messages to be sent`).toBeGreaterThan(0)

// ❌ Poor
expect(messageCount).toBeGreaterThan(0)
```

### 5. Avoid Brittle Tests

```typescript
// ✅ Robust - Tests observable behavior
test('should display message with timestamp', async ({ page }) => {
  await chat.sendMessage('Test')
  const message = page.locator('text=Test')
  const timestamp = page.locator(`text=/\d{2}:\d{2}/`)
  await expect(message).toBeVisible()
  await expect(timestamp).toBeVisible()
})

// ❌ Brittle - Tests implementation
test('should render MessageBubble with formatTime', async ({ page }) => {
  // Tests internal component details
})
```

## Common Patterns

### Pattern 1: Wait for Element

```typescript
const element = await waitForElement(
  page,
  '[data-testid="message"]',
  10000
)
await expect(element).toBeVisible()
```

### Pattern 2: Form Filling

```typescript
await fillFormField(page, '[name="email"]', 'test@example.com')
await fillFormField(page, '[name="password"]', 'password123')
```

### Pattern 3: Swipe Gesture

```typescript
await swipeCard(page, '[class*="card"]', 'right')
await page.waitForTimeout(500) // Wait for animation
```

### Pattern 4: Conditional Test

```typescript
const element = page.locator('[data-testid="optional"]')
if (await element.isVisible().catch(() => false)) {
  await expect(element).toContainText('expected text')
}
```

### Pattern 5: Retry with Timeout

```typescript
const result = await retryOperation(
  async () => {
    return await page.locator('[data-testid="async-content"]').textContent()
  },
  3, // max retries
  1000 // delay ms
)
```

### Pattern 6: Screenshot on Failure

```typescript
test('visual element test', async ({ page }) => {
  try {
    await page.goto('/discover')
    const card = page.locator('[class*="card"]')
    await expect(card).toBeVisible()
  } catch (error) {
    await takeScreenshotOnFailure(page, 'visual-element-test')
    throw error
  }
})
```

## Debugging

### 1. Inspector Mode

```bash
npm run test:e2e:debug
```

Provides interactive debugging with pause points.

### 2. Page Pause

```typescript
test('debug test', async ({ page }) => {
  await page.goto('/discover')
  await page.pause() // Execution pauses here
  // Inspect DOM, execute commands
})
```

### 3. Console Output

```typescript
page.on('console', (msg) => {
  console.log(`Browser: ${msg.text()}`)
})

page.on('console', (msg) => {
  if (msg.type() === 'error') {
    console.error(`Browser Error: ${msg.text()}`)
  }
})
```

### 4. Network Interception

```typescript
page.on('request', (request) => {
  console.log(`>> ${request.method()} ${request.url()}`)
})

page.on('response', (response) => {
  console.log(`<< ${response.status()} ${response.url()}`)
})
```

### 5. Trace Viewer

```bash
# Run test and save trace
npm run test:e2e -- --trace on

# View trace
npx playwright show-trace path/to/trace.zip
```

### 6. Video Recording

Tests automatically record videos on failure. View in:

```
test-results/*/video.webm
```

## Performance

### Optimize Test Execution

1. **Parallel Execution**
   ```bash
   npm run test:e2e -- --workers=4
   ```

2. **Run Specific Tests**
   ```bash
   npm run test:e2e:critical  # Only critical flow tests
   ```

3. **Skip Unnecessary Browser Projects**
   ```bash
   npm run test:e2e:chromium  # Only Chromium
   ```

### Performance Metrics

Track in CI/CD:

```typescript
test('measure performance', async ({ page }) => {
  const startTime = Date.now()

  await page.goto('/discover')
  await page.waitForLoadState('networkidle')

  const loadTime = Date.now() - startTime
  console.log(`Page load: ${loadTime}ms`)

  // Assert acceptable performance
  expect(loadTime).toBeLessThan(5000)
})
```

### Common Performance Issues

1. **Too many explicit waits** → Use implicit waits
2. **Unnecessary screenshots** → Only on failure
3. **Large trace files** → Use sampling
4. **Serial execution** → Enable parallelization

## Test Maintenance

### Regular Reviews

1. Review failed tests immediately
2. Update selectors on UI changes
3. Remove obsolete tests
4. Refactor flaky tests

### Updating Tests

When UI changes:

```typescript
// ❌ Before - Update selector
await page.locator('.old-class').click()

// ✅ After - Use better selector
await page.locator('[data-testid="submit"]').click()
```

### Removing Technical Debt

1. Consolidate duplicate tests
2. Extract common patterns to utilities
3. Update outdated selectors
4. Improve test documentation

## Resources

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Test Architecture](https://playwright.dev/docs/test-runners)

## Quick Reference

### Common Commands

```bash
# Run all tests
npm run test:e2e

# Interactive UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Specific test file
npx playwright test critical-flow.spec.ts

# Specific test
npx playwright test -g "should send message"

# Headed mode
npm run test:e2e:headed

# Single browser
npm run test:e2e:chromium
```

### Common Assertions

```typescript
// Visibility
await expect(element).toBeVisible()
await expect(element).toBeHidden()

// Content
await expect(element).toContainText('text')
await expect(element).toHaveText('exact text')

// Attributes
await expect(element).toHaveAttribute('disabled')
await expect(element).toHaveClass('active')

// Count
await expect(page.locator('button')).toHaveCount(5)

// State
await expect(element).toBeEnabled()
await expect(element).toBeDisabled()

// URL
await expect(page).toHaveURL('/chat/1')
```

## Support

For issues or questions:
1. Check this guide
2. Review existing tests
3. Run in debug mode
4. Check Playwright docs
