import { test, expect } from '@playwright/test'

test.describe('Admin Login', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    // Should have an email input
    await expect(page.locator('input[type="email"]')).toBeVisible()
    // Should have a password input
    await expect(page.locator('input[type="password"]')).toBeVisible()
    // Should have a submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('admin redirects unauthenticated users', async ({ page }) => {
    await page.goto('/admin')
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})
