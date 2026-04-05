import { test, expect } from '@playwright/test'

test.describe('Setup Wizard', () => {
  test('setup page is accessible', async ({ page }) => {
    const response = await page.goto('/setup')
    // Either shows setup or redirects (if already setup)
    expect([200, 302, 307, 308]).toContain(response?.status())
  })
})
