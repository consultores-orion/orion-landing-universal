import { test, expect } from '@playwright/test'

/**
 * admin-content-edit.spec.ts
 *
 * Tests for the Admin Panel content editing flows.
 *
 * Because these tests run without a live Supabase session, all routes
 * under /admin/* are expected to redirect to /login via the Next.js
 * middleware (see src/middleware.ts — "Protect /admin/* — require
 * authenticated user").
 *
 * Tests that require an authenticated session are marked with test.skip.
 */

test.describe('Admin — Unauthenticated redirect behavior', () => {
  test('/admin redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/admin')
    // Middleware redirects to /login when no Supabase session exists
    await expect(page).toHaveURL(/\/login/)
  })

  test('/admin/content redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/admin/content')
    await expect(page).toHaveURL(/\/login/)
  })

  test('/admin/content/hero redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/admin/content/hero')
    await expect(page).toHaveURL(/\/login/)
  })

  test('/admin/design redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/admin/design')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Login page — structure', () => {
  test('login page loads with a title', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/.+/)
  })

  test('login page shows email input', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('login page shows password input', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('login page shows a submit button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('login page does not redirect authenticated users (unauthenticated)', async ({ page }) => {
    await page.goto('/login')
    // Without a session, the login page should stay at /login
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Admin — Authenticated content editing', () => {
  test.skip('content page shows module grid when authenticated', async ({ page }) => {
    // Requires: valid Supabase credentials in env + an admin user session.
    // Steps when enabled:
    //   1. POST /api/auth/sign-in with admin credentials
    //   2. Navigate to /admin/content
    //   3. Expect the "Editor de Contenido" heading to be visible
    //   4. Expect at least one module card to exist
    await page.goto('/admin/content')
    await expect(page.getByRole('heading', { name: /editor de contenido/i })).toBeVisible()
    const cards = page.locator('[data-testid="module-card"], article, .card')
    await expect(cards.first()).toBeVisible()
  })

  test.skip('content page shows "Editar contenido" links per module', async ({ page }) => {
    // Requires authenticated session (see above).
    await page.goto('/admin/content')
    const editLinks = page.getByRole('link', { name: /editar contenido/i })
    const count = await editLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test.skip('navigating to a module editor page shows a form', async ({ page }) => {
    // Requires authenticated session + at least one module in DB.
    await page.goto('/admin/content/hero')
    // The module editor renders a form with save/cancel controls
    await expect(page.locator('form, [role="form"]').first()).toBeVisible()
  })
})
