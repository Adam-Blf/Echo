import { Page, expect } from '@playwright/test'
import { TIMEOUTS, URLS } from './test-data'

/**
 * Page Object Model for Auth page
 */
export class AuthPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(URLS.auth)
    await this.page.waitForLoadState('networkidle')
  }

  async fillEmail(email: string) {
    await this.page.fill('input[type="email"]', email)
  }

  async fillPassword(password: string) {
    await this.page.fill('input[type="password"]', password)
  }

  async togglePasswordVisibility() {
    await this.page.click('button[type="button"]:has-text("Eye")')
  }

  async clickSubmitButton() {
    await this.page.click('button[type="submit"]:has-text("Se connecter")')
  }

  async clickSignUpLink() {
    await this.page.click('button:has-text("Créer un compte")')
  }

  async clickGoogleButton() {
    await this.page.click('button:has-text("Continuer avec Google")')
  }

  async clickAppleButton() {
    await this.page.click('button:has-text("Continuer avec Apple")')
  }

  async getErrorMessage() {
    return this.page.locator('text=/[Ee]rreur|Error/').first()
  }

  async isErrorVisible() {
    return this.getErrorMessage().isVisible()
  }

  async login(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.clickSubmitButton()
  }

  async verifyLoaded() {
    await expect(this.page.locator('h1:has-text("Bienvenue")')).toBeVisible({ timeout: TIMEOUTS.long })
  }
}

/**
 * Page Object Model for Discover page
 */
export class DiscoverPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(URLS.discover)
    await this.page.waitForLoadState('networkidle')
  }

  async getSwipeCard() {
    return this.page.locator('[class*="absolute"][class*="rounded-3xl"]').first()
  }

  async swipeLeft() {
    const card = await this.getSwipeCard()
    const box = await card.boundingBox()
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await this.page.mouse.down()
      await this.page.mouse.move(box.x - 300, box.y + box.height / 2)
      await this.page.mouse.up()
      await this.page.waitForTimeout(TIMEOUTS.animation)
    }
  }

  async swipeRight() {
    const card = await this.getSwipeCard()
    const box = await card.boundingBox()
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await this.page.mouse.down()
      await this.page.mouse.move(box.x + 300, box.y + box.height / 2)
      await this.page.mouse.up()
      await this.page.waitForTimeout(TIMEOUTS.animation)
    }
  }

  async swipeUp() {
    const card = await this.getSwipeCard()
    const box = await card.boundingBox()
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await this.page.mouse.down()
      await this.page.mouse.move(box.x + box.width / 2, box.y - 300)
      await this.page.mouse.up()
      await this.page.waitForTimeout(TIMEOUTS.animation)
    }
  }

  async clickNopeButton() {
    await this.page.click('button[aria-label*="Nope"], button:has-text("Nope")')
  }

  async clickLikeButton() {
    await this.page.click('button[aria-label*="Like"], button:has-text("Like")')
  }

  async clickSuperLikeButton() {
    await this.page.click('button[aria-label*="Super"], button:has-text("Super")')
  }

  async clickFilterButton() {
    await this.page.click('button:has(svg[class*="Sliders"])')
  }

  async verifyCardVisible() {
    const card = await this.getSwipeCard()
    await expect(card).toBeVisible({ timeout: TIMEOUTS.long })
  }

  async verifyProfileName(name: string) {
    await expect(this.page.locator(`text=${name}`)).toBeVisible()
  }

  async verifyNoMoreProfiles() {
    await expect(this.page.locator('text=Plus de profils')).toBeVisible()
  }

  async getMatchPopup() {
    return this.page.locator('[class*="MatchPopup"], text=Match')
  }

  async isMatchPopupVisible() {
    return this.getMatchPopup().isVisible()
  }

  async clickMessageButton() {
    await this.page.click('button:has-text("Message")')
  }
}

/**
 * Page Object Model for Chat page
 */
export class ChatPage {
  constructor(private page: Page) {}

  async goto(matchId: string) {
    await this.page.goto(URLS.chat(matchId))
    await this.page.waitForLoadState('networkidle')
  }

  async fillMessageInput(text: string) {
    await this.page.fill('input[placeholder*="message"], input[placeholder*="Message"]', text)
  }

  async clickSendButton() {
    await this.page.click('button[aria-label*="Send"], button:has(svg[class*="Send"])')
  }

  async sendMessage(text: string) {
    await this.fillMessageInput(text)
    await this.clickSendButton()
    await this.page.waitForTimeout(TIMEOUTS.animation)
  }

  async getMessages() {
    return this.page.locator('[class*="px-4"][class*="py-2"][class*="rounded-2xl"]')
  }

  async verifyMessageSent(text: string) {
    const messages = await this.getMessages()
    const found = await messages.filter({ hasText: text }).first().isVisible()
    return found
  }

  async getProfileName() {
    return this.page.locator('h2[class*="font-semibold"]').first()
  }

  async clickBackButton() {
    await this.page.click('button:has(svg[class*="ArrowLeft"])')
  }

  async verifyMessageInputDisabled() {
    const input = this.page.locator('input[placeholder*="message"], input[placeholder*="Message"]').first()
    await expect(input).toBeDisabled()
  }

  async verifyInputEnabled() {
    const input = this.page.locator('input[placeholder*="message"], input[placeholder*="Message"]').first()
    await expect(input).toBeEnabled()
  }
}

/**
 * Page Object Model for Matches page
 */
export class MatchesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(URLS.matches)
    await this.page.waitForLoadState('networkidle')
  }

  async getMatchCards() {
    return this.page.locator('[class*="grid"] [class*="rounded"], [class*="matchCard"]')
  }

  async getFirstMatchCard() {
    const cards = await this.getMatchCards()
    return cards.first()
  }

  async clickFirstMatch() {
    const card = await this.getFirstMatchCard()
    await card.click()
    await this.page.waitForLoadState('networkidle')
  }

  async verifyMatchesLoaded() {
    const cards = await this.getMatchCards()
    await expect(cards.first()).toBeVisible({ timeout: TIMEOUTS.long })
  }

  async verifyNoMatches() {
    await expect(this.page.locator('text=Pas de matchs')).toBeVisible()
  }
}

/**
 * Page Object Model for Settings page
 */
export class SettingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(URLS.settings)
    await this.page.waitForLoadState('networkidle')
  }

  async findBlockSection() {
    return this.page.locator('text=/[Bb]lock|[Bb]loquer/')
  }

  async getBlockedUsers() {
    return this.page.locator('[class*="blockedUser"], [class*="blocked"]')
  }

  async clickBlockUserButton() {
    await this.page.click('button:has-text("Block"), button:has-text("Bloquer")')
  }

  async verifyUserBlocked(userName: string) {
    await expect(this.page.locator(`text=${userName}`)).toBeVisible()
  }

  async clickUnblockButton() {
    await this.page.click('button:has-text("Unblock"), button:has-text("Débloquer")')
  }
}

/**
 * Navigation utilities
 */
export class Navigation {
  constructor(private page: Page) {}

  async clickBottomNavItem(label: string) {
    await this.page.click(`button:has-text("${label}")`)
  }

  async goToDiscover() {
    await this.clickBottomNavItem('Discover')
  }

  async goToMatches() {
    await this.clickBottomNavItem('Matches')
  }

  async goToProfile() {
    await this.clickBottomNavItem('Profile')
  }

  async goToSettings() {
    await this.clickBottomNavItem('Settings')
  }
}

/**
 * Assertion utilities
 */
export class Assertions {
  constructor(private page: Page) {}

  async verifyPageTitle(title: string) {
    const pageTitle = await this.page.title()
    expect(pageTitle).toContain(title)
  }

  async verifyPageUrl(path: string) {
    expect(this.page.url()).toContain(path)
  }

  async verifyElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible()
  }

  async verifyElementNotVisible(selector: string) {
    await expect(this.page.locator(selector)).not.toBeVisible()
  }

  async verifyLoadingComplete() {
    await this.page.waitForLoadState('networkidle')
  }
}
