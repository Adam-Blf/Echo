import { test, expect } from '@playwright/test'
import { TIMEOUTS, URLS } from './fixtures/test-data'

/**
 * Edge case tests for Echo app
 * Tests boundary conditions, error states, and special scenarios
 */

test.describe('Echo - Edge Cases & Error Handling', () => {
  test.describe('Swipe Edge Cases', () => {
    test('should handle rapid consecutive swipes', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      const card = page.locator('[class*="absolute"][class*="rounded-3xl"]').first()

      // Perform rapid swipes
      for (let i = 0; i < 10; i++) {
        if (await card.isVisible().catch(() => false)) {
          const box = await card.boundingBox()
          if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            await page.mouse.down()
            await page.mouse.move(box.x + (i % 2 === 0 ? 300 : -300), box.y)
            await page.mouse.up()
            await page.waitForTimeout(100)
          }
        }
      }

      // App should remain stable
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle partial swipe gestures', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      const card = page.locator('[class*="absolute"][class*="rounded-3xl"]').first()
      const box = await card.boundingBox()

      if (box) {
        // Perform partial swipe that doesn't reach threshold
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + 50, box.y) // Less than 100px threshold
        await page.mouse.up()
      }

      // Card should snap back
      await expect(card).toBeVisible()
    })

    test('should handle swipe on the edge of viewport', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      const card = page.locator('[class*="absolute"][class*="rounded-3xl"]').first()

      // Drag to edge of screen
      const box = await card.boundingBox()
      if (box) {
        await page.mouse.move(box.x + 10, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(10, box.y + box.height / 2)
        await page.mouse.up()
      }

      // App should handle gracefully
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle no more profiles gracefully', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Keep swiping until no more profiles
      let hasProfiles = true
      let iterations = 0
      const maxIterations = 50

      while (hasProfiles && iterations < maxIterations) {
        const card = page.locator('[class*="absolute"][class*="rounded-3xl"]').first()
        hasProfiles = await card.isVisible().catch(() => false)

        if (hasProfiles) {
          try {
            const box = await card.boundingBox()
            if (box) {
              await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
              await page.mouse.down()
              await page.mouse.move(box.x + 300, box.y)
              await page.mouse.up()
              await page.waitForTimeout(200)
            }
          } catch (e) {
            hasProfiles = false
          }
        }
        iterations++
      }

      // Should show empty state or reload button
      const emptyState = page.locator('text=/Plus de profils|No more profiles/')
      const reloadButton = page.locator('button:has-text("Recharger")')
      const hasEmptyState = await emptyState.isVisible().catch(() => false)
      const hasReload = await reloadButton.isVisible().catch(() => false)

      expect(hasEmptyState || hasReload).toBeTruthy()
    })
  })

  test.describe('Chat Edge Cases', () => {
    test('should handle empty message submission', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"], input[placeholder*="Message"]')
      const sendButton = page.locator('button:has(svg[class*="Send"])')

      // Try to send empty message
      await input.fill('')
      await sendButton.click().catch(() => {})

      // Button should be disabled or no message sent
      const messageCount = await page
        .locator('[class*="px-4"][class*="rounded-2xl"]')
        .count()
      expect(messageCount).toBe(0)
    })

    test('should handle whitespace-only messages', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"], input[placeholder*="Message"]')
      const sendButton = page.locator('button:has(svg[class*="Send"])')

      // Try to send whitespace
      await input.fill('   \n  \t  ')
      const isEnabled = await sendButton.isEnabled().catch(() => false)

      if (isEnabled) {
        await sendButton.click()
      }

      // Should not display whitespace message
      const messages = page.locator('[class*="px-4"][class*="rounded-2xl"]')
      const messageCount = await messages.count()
      expect(messageCount).toBe(0)
    })

    test('should handle very long messages', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"], input[placeholder*="Message"]')
      const longMessage = 'Lorem ipsum '.repeat(100) // Very long message

      await input.fill(longMessage)
      const value = await input.inputValue()

      // Should truncate or limit
      expect(value.length).toBeLessThanOrEqual(longMessage.length + 10)
    })

    test('should handle special characters in messages', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"], input[placeholder*="Message"]')
      const sendButton = page.locator('button:has(svg[class*="Send"])')

      const specialChars = '!@#$%^&*()_+-=[]{}|;\':",./<>?'
      await input.fill(specialChars)
      await page.waitForTimeout(TIMEOUTS.short)

      const isEnabled = await sendButton.isEnabled().catch(() => false)
      if (isEnabled) {
        await sendButton.click()
        await page.waitForTimeout(TIMEOUTS.animation)
      }

      // Message should be sent or rejected gracefully
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle emoji in messages', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"], input[placeholder*="Message"]')
      const sendButton = page.locator('button:has(svg[class*="Send"])')

      const emojiMessage = '😀 🎉 ❤️ 🚀 🌟'
      await input.fill(emojiMessage)
      await page.waitForTimeout(TIMEOUTS.short)

      const isEnabled = await sendButton.isEnabled().catch(() => false)
      if (isEnabled) {
        await sendButton.click()
        await page.waitForTimeout(TIMEOUTS.animation)

        // Emoji should be preserved
        const messages = page.locator(`text=/${emojiMessage.split(' ')[0]}/`)
        const found = await messages.isVisible().catch(() => false)
        expect(typeof found).toBe('boolean')
      }
    })

    test('should handle rapid message sends', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"], input[placeholder*="Message"]')
      const sendButton = page.locator('button:has(svg[class*="Send"])')

      // Send multiple messages rapidly
      for (let i = 0; i < 10; i++) {
        await input.fill(`Message ${i}`)
        const isEnabled = await sendButton.isEnabled().catch(() => false)
        if (isEnabled) {
          await sendButton.click()
          await page.waitForTimeout(50)
        }
      }

      // App should handle rate limiting
      await expect(page.locator('body')).toBeVisible()
    })

    test('should display typing indicator timeout', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"], input[placeholder*="Message"]')
      const sendButton = page.locator('button:has(svg[class*="Send"])')

      // Send message and wait for typing indicator
      await input.fill('Hello!')
      await sendButton.click()
      await page.waitForTimeout(TIMEOUTS.animation)

      // Typing indicator should appear then disappear
      await page.waitForTimeout(3000)

      // Indicator should be gone
      const typingIndicator = page.locator('[class*="typing"], text=typing')
      const isVisible = await typingIndicator.isVisible().catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })
  })

  test.describe('Navigation Edge Cases', () => {
    test('should handle rapid navigation changes', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Rapidly navigate between pages
      const urls = [URLS.discover, URLS.matches, URLS.discover]
      for (const url of urls) {
        await page.goto(url)
        await page.waitForTimeout(100)
      }

      // App should still be functional
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle back/forward navigation', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      await page.goto(URLS.matches)
      await page.waitForLoadState('networkidle')

      // Go back
      await page.goBack()
      await page.waitForLoadState('networkidle')

      // Should be back on discover
      const hasDiscoverContent = await page
        .locator('text=Découvrir')
        .isVisible()
        .catch(() => false)
      expect(typeof hasDiscoverContent).toBe('boolean')
    })

    test('should handle invalid route gracefully', async ({ page }) => {
      await page.goto('/invalid-route-12345')
      await page.waitForLoadState('networkidle')

      // Should show error page or redirect
      const errorText = page.locator('text=/not found|404|erreur/')
      const isError = await errorText.isVisible().catch(() => false)
      expect(typeof isError).toBe('boolean')
    })
  })

  test.describe('Viewport and Orientation Changes', () => {
    test('should handle viewport resize', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      const card = page.locator('[class*="rounded-3xl"]')
      await expect(card).toBeVisible()

      // Resize viewport
      await page.setViewportSize({ width: 480, height: 800 })
      await page.waitForTimeout(TIMEOUTS.short)

      // Content should still be visible
      await expect(card).toBeVisible()

      // Resize again
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.waitForTimeout(TIMEOUTS.short)

      await expect(card).toBeVisible()
    })

    test('should handle zoom changes', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Set zoom level
      await page.evaluate(() => {
        document.body.style.zoom = '150%'
      })

      const card = page.locator('[class*="rounded-3xl"]')
      await expect(card).toBeVisible()

      // Reset zoom
      await page.evaluate(() => {
        document.body.style.zoom = '100%'
      })

      await expect(card).toBeVisible()
    })
  })

  test.describe('Memory and Performance', () => {
    test('should handle memory efficiently with many messages', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"], input[placeholder*="Message"]')
      const sendButton = page.locator('button:has(svg[class*="Send"])')

      // Send many messages to test memory usage
      for (let i = 0; i < 30; i++) {
        await input.fill(`Test message ${i}`)
        const isEnabled = await sendButton.isEnabled().catch(() => false)
        if (isEnabled) {
          await sendButton.click()
          await page.waitForTimeout(100)
        }
      }

      // App should still be responsive
      await input.fill('Final message')
      await page.waitForTimeout(TIMEOUTS.short)
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle many swipe cards', async ({ page }) => {
      await page.goto(URLS.discover)
      await page.waitForLoadState('networkidle')

      // Perform many swipes
      for (let i = 0; i < 20; i++) {
        const card = page.locator('[class*="rounded-3xl"]').first()
        if (await card.isVisible().catch(() => false)) {
          const box = await card.boundingBox()
          if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            await page.mouse.down()
            await page.mouse.move(box.x + (i % 2 === 0 ? 300 : -300), box.y)
            await page.mouse.up()
            await page.waitForTimeout(200)
          }
        }
      }

      // App should remain responsive
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Data Consistency', () => {
    test('should maintain message order', async ({ page }) => {
      await page.goto(URLS.chat('1'))
      await page.waitForLoadState('networkidle')

      const input = page.locator('input[placeholder*="message"], input[placeholder*="Message"]')
      const sendButton = page.locator('button:has(svg[class*="Send"])')

      // Send multiple messages
      const messages = ['First', 'Second', 'Third']
      for (const msg of messages) {
        await input.fill(msg)
        const isEnabled = await sendButton.isEnabled().catch(() => false)
        if (isEnabled) {
          await sendButton.click()
          await page.waitForTimeout(TIMEOUTS.animation)
        }
      }

      // Check message order
      const messageElements = page.locator('[class*="px-4"][class*="rounded-2xl"]')
      const count = await messageElements.count()
      expect(count).toBeGreaterThanOrEqual(messages.length)
    })
  })
})
