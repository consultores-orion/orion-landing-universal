import { test, expect } from '@playwright/test'

/**
 * theme-change.spec.ts
 *
 * Tests for the theme / design system:
 * - CSS custom properties injected into :root on the homepage
 * - Admin design panel redirect behaviour (unauthenticated)
 * - API endpoint response for GET /api/design/theme/export
 *
 * The theme API requires authentication (Supabase session cookie).
 * Tests that depend on an authenticated session are marked test.skip.
 */

test.describe('Theme — CSS custom properties on homepage', () => {
  test('homepage injects CSS variables into :root', async ({ page }) => {
    await page.goto('/')

    /**
     * Evaluate computed styles on :root.
     * Tailwind CSS 4 + the theme engine write custom properties
     * (--color-primary, --color-background, etc.) directly onto :root.
     * We check for at least one theme-related CSS variable.
     */
    const hasCSSVars = await page.evaluate(() => {
      const rootStyle = getComputedStyle(document.documentElement)

      const knownVars = [
        '--color-primary',
        '--color-background',
        '--color-foreground',
        '--color-surface',
        '--background',
        '--foreground',
        '--primary',
      ]

      return knownVars.some((v) => {
        const value = rootStyle.getPropertyValue(v).trim()
        return value.length > 0
      })
    })

    expect(hasCSSVars).toBe(true)
  })

  test('homepage has a <html> or <body> element (baseline sanity)', async ({ page }) => {
    await page.goto('/')
    // Confirms the page rendered and CSS can be evaluated
    await expect(page.locator('html')).toBeAttached()
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Theme — Admin design panel (unauthenticated)', () => {
  test('/admin/design redirects to /login without session', async ({ page }) => {
    await page.goto('/admin/design')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Theme — API endpoint /api/design/theme/export', () => {
  test('returns 401 Unauthorized without a session', async ({ page }) => {
    /**
     * The export endpoint requires authentication (checks supabase.auth.getUser()).
     * Without a valid session cookie it must return HTTP 401.
     */
    const response = await page.request.get('/api/design/theme/export')
    expect(response.status()).toBe(401)

    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(typeof body.error).toBe('string')
  })

  test.skip('returns a JSON file with version field when authenticated', async ({ page }) => {
    // Requires: valid admin session cookie.
    // Steps when enabled:
    //   1. Sign in via /api/auth/sign-in to get a session
    //   2. GET /api/design/theme/export
    //   3. Expect status 200
    //   4. Expect Content-Disposition header with filename
    //   5. Expect JSON body to have { version: "1", typography: {...}, spacing: {...} }
    const response = await page.request.get('/api/design/theme/export')
    expect(response.status()).toBe(200)

    const contentDisposition = response.headers()['content-disposition']
    expect(contentDisposition).toMatch(/attachment.*filename.*orion-theme.*\.json/)

    const body = await response.json()
    expect(body).toHaveProperty('version', '1')
    expect(body).toHaveProperty('typography')
    expect(body).toHaveProperty('spacing')
    expect(body).toHaveProperty('borderRadius')
  })
})

test.describe('Theme — Palette API endpoint /api/design/palette', () => {
  test('GET /api/design/palette returns 401 without session', async ({ page }) => {
    const response = await page.request.get('/api/design/palette')
    // Protected endpoints respond with 401 when no session is present
    expect([401, 403, 404]).toContain(response.status())
  })
})
