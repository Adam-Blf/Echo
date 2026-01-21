import { Page, expect } from '@playwright/test'
import { TIMEOUTS } from './test-data'

/**
 * Common utility functions for E2E tests
 */

/**
 * Wait for element and verify it's visible
 */
export async function waitForElement(page: Page, selector: string, timeout = TIMEOUTS.long) {
  const element = page.locator(selector)
  await element.waitFor({ state: 'visible', timeout })
  return element
}

/**
 * Perform a drag gesture between two positions
 */
export async function dragBetween(
  page: Page,
  startSelector: string,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
) {
  const element = page.locator(startSelector).first()
  const box = await element.boundingBox()

  if (box) {
    const startX = box.x + fromX
    const startY = box.y + fromY

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(toX, toY)
    await page.mouse.up()
    await page.waitForTimeout(TIMEOUTS.animation)
  }
}

/**
 * Perform a swipe gesture
 */
export async function swipeCard(
  page: Page,
  cardSelector: string,
  direction: 'left' | 'right' | 'up' | 'down'
) {
  const card = page.locator(cardSelector).first()
  const box = await card.boundingBox()

  if (!box) return

  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  const distance = 300

  let targetX = centerX
  let targetY = centerY

  switch (direction) {
    case 'left':
      targetX = centerX - distance
      break
    case 'right':
      targetX = centerX + distance
      break
    case 'up':
      targetY = centerY - distance
      break
    case 'down':
      targetY = centerY + distance
      break
  }

  await page.mouse.move(centerX, centerY)
  await page.mouse.down()
  await page.mouse.move(targetX, targetY)
  await page.mouse.up()
  await page.waitForTimeout(TIMEOUTS.animation)
}

/**
 * Fill form field with validation
 */
export async function fillFormField(page: Page, selector: string, value: string) {
  const field = page.locator(selector)
  await field.waitFor({ state: 'visible' })
  await field.clear()
  await field.fill(value)
  await page.waitForTimeout(TIMEOUTS.short)
}

/**
 * Check if element has class
 */
export async function hasClass(page: Page, selector: string, className: string) {
  const element = page.locator(selector).first()
  const classes = await element.getAttribute('class')
  return classes?.includes(className) ?? false
}

/**
 * Get element text content
 */
export async function getElementText(page: Page, selector: string) {
  return page.locator(selector).first().textContent()
}

/**
 * Verify element is disabled
 */
export async function isElementDisabled(page: Page, selector: string) {
  const element = page.locator(selector).first()
  return element.evaluate((el: HTMLElement) => {
    const input = el as HTMLInputElement | HTMLButtonElement
    return input.disabled || (el as any).getAttribute('disabled') !== null
  })
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(TIMEOUTS.short)
}

/**
 * Take screenshot on failure
 */
export async function takeScreenshotOnFailure(page: Page, testName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `screenshots/${testName}-${timestamp}.png`
  await page.screenshot({ path: filename })
  console.log(`Screenshot saved: ${filename}`)
}

/**
 * Intercept and mock API responses
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string,
  responseData: any,
  status = 200
) {
  await page.route(urlPattern, (route) => {
    route.abort('blockedbyclient')
  })

  await page.route(urlPattern, (route) => {
    route.abort('blockedbyclient')
  })

  await page.route(urlPattern, (route) => {
    route.respond({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    })
  })
}

/**
 * Verify page title
 */
export async function verifyPageTitle(page: Page, expectedTitle: string) {
  const title = await page.title()
  expect(title).toContain(expectedTitle)
}

/**
 * Wait for navigation
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  timeout = TIMEOUTS.long
) {
  await page.waitForURL(urlPattern, { timeout })
}

/**
 * Check console for errors
 */
export async function getConsoleErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return errors
}

/**
 * Simulate network throttling
 */
export async function simulateSlowNetwork(page: Page) {
  await page.route('**/*', (route) => {
    setTimeout(() => route.continue(), 1000)
  })
}

/**
 * Get all visible text on page
 */
export async function getPageText(page: Page) {
  return page.evaluate(() => document.body.innerText)
}

/**
 * Verify animation completion
 */
export async function waitForAnimationComplete(page: Page, selector: string) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel)
      if (!el) return false
      const animations = el.getAnimations()
      return animations.every((anim) => anim.playState === 'finished')
    },
    selector,
    { timeout: TIMEOUTS.long }
  )
}

/**
 * Mock geolocation
 */
export async function setGeolocation(page: Page, latitude: number, longitude: number) {
  await page.context().setGeolocation({ latitude, longitude })
}

/**
 * Grant permissions
 */
export async function grantPermission(page: Page, permission: 'camera' | 'microphone' | 'notifications') {
  await page.context().grantPermissions([permission])
}

/**
 * Deny permissions
 */
export async function denyPermission(page: Page, permission: 'camera' | 'microphone' | 'notifications') {
  await page.context().clearPermissions()
}

/**
 * Test accessibility - check for common issues
 */
export async function checkAccessibility(page: Page) {
  const issues: string[] = []

  // Check for images without alt text
  const images = await page.locator('img:not([alt])').count()
  if (images > 0) {
    issues.push(`Found ${images} images without alt text`)
  }

  // Check for buttons without labels
  const unlabeledButtons = await page
    .locator('button:not(:has-text("*")):not([aria-label]):not([title])')
    .count()
  if (unlabeledButtons > 0) {
    issues.push(`Found ${unlabeledButtons} buttons without labels`)
  }

  return issues
}

/**
 * Performance check - measure page load time
 */
export async function measurePageLoadTime(page: Page, url: string) {
  const startTime = Date.now()
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  const loadTime = Date.now() - startTime
  return loadTime
}

/**
 * Verify form validation
 */
export async function verifyFormValidation(page: Page, formData: Record<string, string>) {
  const errors: string[] = []

  for (const [field, value] of Object.entries(formData)) {
    const input = page.locator(`[name="${field}"]`).first()
    if (await input.isVisible().catch(() => false)) {
      await input.fill(value)

      // Check for validation error
      const error = page.locator(`[role="alert"], .error, [class*="error"]`).first()
      if (await error.isVisible().catch(() => false)) {
        const errorText = await error.textContent()
        errors.push(`${field}: ${errorText}`)
      }
    }
  }

  return errors
}

/**
 * Retry logic for flaky operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }

  throw lastError
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delayMs: number) {
  let timeoutId: NodeJS.Timeout

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delayMs)
  }) as T
}

/**
 * Compare two screenshots for visual regression
 */
export async function compareScreenshots(page: Page, baselinePath: string, currentPath: string) {
  // This would require additional dependencies like pixelmatch
  // For now, just capture the comparison
  await page.screenshot({ path: currentPath })
  console.log(`Screenshots saved for comparison`)
}

/**
 * Get element bounding box
 */
export async function getElementBounds(page: Page, selector: string) {
  return page.locator(selector).first().boundingBox()
}

/**
 * Verify element is in viewport
 */
export async function isInViewport(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  })
}

/**
 * Get computed style
 */
export async function getComputedStyle(page: Page, selector: string, property: string) {
  return page.locator(selector).first().evaluate(
    ([el, prop]) => window.getComputedStyle(el).getPropertyValue(prop),
    [property]
  )
}
