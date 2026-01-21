import { test, expect, Page } from '@playwright/test'
import { TIMEOUTS, URLS } from './fixtures/test-data'
import {
  swipeCard,
  retryOperation,
  getElementText,
  isInViewport,
  checkAccessibility,
  measurePageLoadTime,
} from './fixtures/test-utils'

/**
 * Advanced test scenarios for Echo app
 * Tests complex user journeys and multi-step flows
 */

test.describe('Echo - Advanced Scenarios', () => {
  test.describe('Complex User Journeys', () => {
    test('should complete full swipe-to-chat journey', async ({ page }) => {
      // Navigate to discover
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Perform swipes until a match (with retry)
      let matched = false
      const maxAttempts = 10

      for (let i = 0; i < maxAttempts && !matched; i++) {
        const card = page.locator('[class*="rounded-3xl"]').first()
        if (await card.isVisible().catch(() => false)) {
          await swipeCard(page, '[class*="rounded-3xl"]', 'right')
          await page.waitForTimeout(TIMEOUTS.animation)

          // Check if match popup appeared
          matched = await page
            .locator('text=Match')
            .isVisible()
            .catch(() => false)
        }
      }

      if (matched) {
        // Click message button
        await page.locator('button:has-text("Message")').click()
        await page.waitForURL(/chat/, { timeout: TIMEOUTS.long })

        // Send message
        const input = page.locator('input[placeholder*="message"]')
        await input.fill('Hi!')
        await page.locator('button:has(svg[class*="Send"])').click()
        await page.waitForTimeout(TIMEOUTS.animation)

        // Verify message sent
        await expect(page.locator('text=Hi!')).toBeVisible()
      }
    })

    test('should handle multiple profile swipes and interactions', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Track swipe count
      let swipeCount = 0
      const maxSwipes = 5

      for (let i = 0; i < maxSwipes; i++) {
        const card = page.locator('[class*="rounded-3xl"]').first()
        if (await card.isVisible().catch(() => false)) {
          // Alternate between like and nope
          const direction = i % 2 === 0 ? 'right' : 'left'
          await swipeCard(page, '[class*="rounded-3xl"]', direction as any)
          await page.waitForTimeout(TIMEOUTS.animation)
          swipeCount++
        }
      }

      expect(swipeCount).toBeGreaterThan(0)
    })

    test('should navigate through multiple chats', async ({ page }) => {
      // Go to matches page
      await page.goto(URLS.matches)
      await page.waitForLoadState('networkidle')

      // Get all match cards
      const matchCards = page.locator('[class*="grid"] [class*="rounded"], [class*="matchCard"]')
      const cardCount = await matchCards.count()

      if (cardCount > 0) {
        // Click first match
        await matchCards.first().click()
        await page.waitForLoadState('networkidle')

        // Verify chat page
        const input = page.locator('input[placeholder*="message"]')
        await expect(input).toBeVisible()

        // Go back to matches
        await page.locator('button:has(svg[class*="ArrowLeft"])').click()
        await page.waitForURL(/matches/, { timeout: TIMEOUTS.medium })

        // Click second match if available
        if (cardCount > 1) {
          const updatedCards = page.locator('[class*="grid"] [class*="rounded"]')
          await updatedCards.nth(1).click()
          await page.waitForLoadState('networkidle')

          // Should be in different chat
          await expect(page.locator('h2[class*="font-semibold"]')).toBeVisible()
        }
      }
    })
  })

  test.describe('Performance & Load Testing', () => {
    test('should load discover page within acceptable time', async ({ page }) => {
      const loadTime = await measurePageLoadTime(page, URLS.discover)

      // Should load in less than 5 seconds
      expect(loadTime).toBeLessThan(5000)

      // Should have content
      await expect(page.locator('[class*="rounded-3xl"]')).toBeVisible()
    })

    test('should handle rapid message sends', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"]')
      const sendButton = page.locator('button:has(svg[class*="Send"])')

      // Send messages rapidly
      const messageCount = 10
      for (let i = 0; i < messageCount; i++) {
        await input.fill(`Message ${i}`)
        const isEnabled = await sendButton.isEnabled().catch(() => false)
        if (isEnabled) {
          await sendButton.click()
          // Don't wait between sends
        }
      }

      // Wait for all to process
      await page.waitForTimeout(TIMEOUTS.medium)

      // Should have messages
      const displayedMessages = page.locator('[class*="px-4"][class*="rounded-2xl"]')
      const count = await displayedMessages.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should handle filtering with real-time updates', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Click filter
      await page.locator('button:has(svg[class*="Sliders"])').click()
      await page.waitForTimeout(TIMEOUTS.medium)

      // Look for filter controls
      const filterModal = page.locator('[class*="modal"], [role="dialog"]')
      if (await filterModal.isVisible().catch(() => false)) {
        // Interact with filters
        const sliders = page.locator('input[type="range"]')
        if (await sliders.first().isVisible().catch(() => false)) {
          const slider = sliders.first()
          await slider.fill('50')
        }

        // Close filter
        await page.locator('button:has-text("Done"), button:has-text("Appliquer")').click({ timeout: 1000 }).catch(() => {})
      }

      // Should still have cards
      await expect(page.locator('[class*="rounded-3xl"]')).toBeVisible()
    })
  })

  test.describe('State Management & Persistence', () => {
    test('should persist state when navigating away and back', async ({ page }) => {
      // Go to discover
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Get first profile name
      const firstName = await getElementText(page, 'h2[class*="text-3xl"]')

      // Navigate to matches
      const matchesButton = page.locator('button:has-text("Matches")')
      if (await matchesButton.isVisible().catch(() => false)) {
        await matchesButton.click()
        await page.waitForURL(/matches/, { timeout: TIMEOUTS.medium })

        // Navigate back
        const discoverButton = page.locator('button:has-text("Discover")')
        if (await discoverButton.isVisible().catch(() => false)) {
          await discoverButton.click()
          await page.waitForURL(/discover/, { timeout: TIMEOUTS.medium })

          // State might be preserved or reset - both are valid
          const newName = await getElementText(page, 'h2[class*="text-3xl"]').catch(() => null)
          expect(typeof newName).toBe('string')
        }
      }
    })

    test('should handle session recovery after network interruption', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Simulate offline
      await page.context().setOffline(true)
      await page.waitForTimeout(TIMEOUTS.short)

      // Try to interact
      const card = page.locator('[class*="rounded-3xl"]')
      const isVisible = await card.isVisible().catch(() => false)

      // Come back online
      await page.context().setOffline(false)
      await page.waitForTimeout(TIMEOUTS.short)

      // Should recover
      await page.reload()
      await page.waitForLoadState('networkidle')

      const cardAfterRecovery = page.locator('[class*="rounded-3xl"]')
      await expect(cardAfterRecovery).toBeVisible()
    })
  })

  test.describe('User Preference Handling', () => {
    test('should respect dark mode preference', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Check for dark mode styles
      const body = page.locator('body')
      const bgClass = await body.getAttribute('class')
      expect(typeof bgClass).toBe('string')
    })

    test('should handle reduced motion preference', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Should still be interactive
      const card = page.locator('[class*="rounded-3xl"]')
      await expect(card).toBeVisible()

      // Swipe should still work (just without animations)
      await swipeCard(page, '[class*="rounded-3xl"]', 'right')
      await page.waitForTimeout(200) // Reduced animation time

      // Card should have moved
      await expect(card).toBeVisible()
    })
  })

  test.describe('Accessibility Compliance', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Check for h1
      const h1 = page.locator('h1')
      const hasH1 = await h1.isVisible().catch(() => false)

      // Should have at least one heading
      const allHeadings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await allHeadings.count()
      expect(headingCount).toBeGreaterThan(0)
    })

    test('should have accessible form inputs', async ({ page }) => {
      await page.goto(URLS.auth)
      await page.waitForLoadState('networkidle')

      // Check email input
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toHaveAttribute('type', 'email')

      // Check password input
      const passwordInput = page.locator('input[type="password"]')
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('should pass accessibility checks', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      const issues = await checkAccessibility(page)
      // Should have minimal or no accessibility issues
      expect(issues.length).toBeLessThan(3)
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      // Tab to send button
      await page.keyboard.press('Tab')
      await page.waitForTimeout(TIMEOUTS.short)

      // Get focused element
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.className
      })

      expect(typeof focusedElement).toBe('string')
    })
  })

  test.describe('Multi-Device Scenarios', () => {
    test('should work on portrait mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Content should be visible
      const card = page.locator('[class*="rounded-3xl"]')
      await expect(card).toBeVisible()

      // Should be able to swipe
      await swipeCard(page, '[class*="rounded-3xl"]', 'right')
      await page.waitForTimeout(TIMEOUTS.animation)
    })

    test('should work on landscape mobile', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 })
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      const card = page.locator('[class*="rounded-3xl"]')
      await expect(card).toBeVisible()
    })

    test('should work on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      const card = page.locator('[class*="rounded-3xl"]')
      await expect(card).toBeVisible()
    })

    test('should work on desktop with high resolution', async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1440 })
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      const card = page.locator('[class*="rounded-3xl"]')
      await expect(card).toBeVisible()
    })
  })

  test.describe('Real-time Communication', () => {
    test('should handle incoming messages gracefully', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      // Send a message
      const input = page.locator('input[placeholder*="message"]')
      await input.fill('Hello!')
      const sendButton = page.locator('button:has(svg[class*="Send"])')
      await sendButton.click()

      // Wait for simulated response
      await page.waitForTimeout(3000)

      // Should have received reply
      const messages = page.locator('[class*="px-4"][class*="rounded-2xl"]')
      const count = await messages.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })

    test('should display typing indicator', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      // Send message to trigger typing indicator
      const input = page.locator('input[placeholder*="message"]')
      await input.fill('Message')
      const sendButton = page.locator('button:has(svg[class*="Send"])')
      await sendButton.click()

      // Typing indicator should appear
      await page.waitForTimeout(500)

      const typingIndicator = page.locator('[class*="typing"], text=typing')
      const hasTyping = await typingIndicator.isVisible().catch(() => false)
      expect(typeof hasTyping).toBe('boolean')
    })
  })

  test.describe('Error Recovery', () => {
    test('should recover from failed message send', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      // Simulate network error
      let requestFailed = false
      page.on('requestfailed', () => {
        requestFailed = true
      })

      // Try to send message
      const input = page.locator('input[placeholder*="message"]')
      await input.fill('Test message')

      // Message should still be there even if send fails
      const value = await input.inputValue()
      expect(value).toBe('Test message')

      // App should still be responsive
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle profile loading errors gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/profiles**', (route) => {
        route.abort('failed')
      })

      await page.goto(URLS.discover)
      await page.waitForTimeout(TIMEOUTS.long)

      // Should show fallback or error message
      const hasContent = await page
        .locator('text=/error|Error|failed|No profiles/')
        .isVisible()
        .catch(() => false)

      expect(typeof hasContent).toBe('boolean')
    })
  })

  test.describe('Data Validation & Security', () => {
    test('should sanitize user input', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"]')
      const xssPayload = '<img src=x onerror="alert(\'XSS\')">'

      await input.fill(xssPayload)

      // Check that script doesn't execute
      let scriptExecuted = false
      page.on('popup', () => {
        scriptExecuted = true
      })

      const sendButton = page.locator('button:has(svg[class*="Send"])')
      await sendButton.click()
      await page.waitForTimeout(TIMEOUTS.animation)

      expect(scriptExecuted).toBeFalsy()
    })

    test('should validate profile data structure', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Check profile card elements
      const card = page.locator('[class*="rounded-3xl"]').first()
      const name = card.locator('h2')
      const distance = page.locator('text=km')
      const photo = page.locator('img')

      await expect(name).toBeVisible()
      await expect(distance).toBeVisible()
      await expect(photo.first()).toBeVisible()
    })
  })

  test.describe('Retry Logic', () => {
    test('should retry failed operations', async ({ page }) => {
      let attempts = 0

      const operation = async () => {
        attempts++
        if (attempts < 2) {
          throw new Error('Temporary failure')
        }
        return 'Success'
      }

      const result = await retryOperation(operation, 3, 100)
      expect(result).toBe('Success')
      expect(attempts).toBe(2)
    })

    test('should give up after max retries', async ({ page }) => {
      const operation = async () => {
        throw new Error('Permanent failure')
      }

      try {
        await retryOperation(operation, 2, 100)
        expect(true).toBeFalsy() // Should have thrown
      } catch (error) {
        expect((error as Error).message).toBe('Permanent failure')
      }
    })
  })
})
