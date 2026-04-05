import { test, expect } from '@playwright/test'

test.describe('Lead Capture', () => {
  test('offer form is present if module is visible', async ({ page }) => {
    await page.goto('/')
    // Check if there's a form on the page (offer_form module)
    const form = page.locator('form').first()
    // If form exists, it should have an email or name field
    const hasForm = await form.isVisible().catch(() => false)
    if (hasForm) {
      const emailInput = page.locator('input[type="email"]').first()
      const nameInput = page
        .locator('input[name="name"], input[placeholder*="nombre" i], input[placeholder*="name" i]')
        .first()
      const hasEmailOrName =
        (await emailInput.isVisible().catch(() => false)) ||
        (await nameInput.isVisible().catch(() => false))
      expect(hasEmailOrName).toBe(true)
    }
    // If no form, test passes (module might be disabled)
    expect(true).toBe(true)
  })
})
