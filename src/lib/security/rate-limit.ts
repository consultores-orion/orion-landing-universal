/**
 * Simple in-memory rate limiter.
 *
 * Works for single-instance deployments (Docker/VPS).
 * On Vercel (serverless), each function instance has its own memory space, so
 * this only limits requests within the same instance — still useful as a first
 * line of defense. For multi-instance production: use Redis via Upstash or
 * Supabase counters.
 *
 * State resets on cold start (process restart / new deployment).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum requests allowed within the window */
  max: number
}

export interface RateLimitResult {
  /** Whether the request is within the allowed limit */
  success: boolean
  /** The configured maximum for this window */
  limit: number
  /** Remaining requests for the current window */
  remaining: number
  /** Unix timestamp (seconds) when the window resets */
  reset: number
}

/**
 * Check rate limit for a given key.
 *
 * @param key  Unique identifier — typically `"prefix:ip"` (e.g. `"leads:1.2.3.4"`)
 * @param options  windowMs + max
 */
export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs
    store.set(key, { count: 1, resetAt })
    return {
      success: true,
      limit: options.max,
      remaining: options.max - 1,
      reset: Math.ceil(resetAt / 1000),
    }
  }

  entry.count++
  store.set(key, entry)

  const remaining = Math.max(0, options.max - entry.count)
  return {
    success: entry.count <= options.max,
    limit: options.max,
    remaining,
    reset: Math.ceil(entry.resetAt / 1000),
  }
}

/**
 * Extract the client IP from incoming request headers.
 * Handles Vercel, Cloudflare, and nginx reverse-proxy setups.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

/**
 * Build the standard rate-limit response headers.
 * These should be included on both 429 responses and successful responses
 * so clients can track their quota.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
    ...(result.success
      ? {}
      : { 'Retry-After': String(result.reset - Math.floor(Date.now() / 1000)) }),
  }
}
