import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads and renders the page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/) // any non-empty title
    // Check that at least one <section> exists (module sections)
    const sections = page.locator('section')
    await expect(sections.first()).toBeVisible()
  })

  test('has proper meta tags', async ({ page }) => {
    await page.goto('/')
    // meta description or og:title should exist
    const metaDesc = page.locator('meta[name="description"], meta[property="og:title"]')
    await expect(metaDesc.first()).toBeAttached()
  })
})
