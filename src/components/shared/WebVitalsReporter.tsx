'use client'

/**
 * WebVitalsReporter
 *
 * Captures Core Web Vitals (LCP, INP, CLS, FCP, TTFB) using the web-vitals
 * library and reports them to the console in development mode.
 *
 * - Renders nothing (returns null) — no visual output.
 * - Uses dynamic import so web-vitals is NOT included in the critical bundle.
 * - Safe to include in the public layout: no-ops in environments where the
 *   Performance API is unavailable.
 *
 * Extending to production reporting:
 *   Replace the `if (process.env.NODE_ENV === 'development')` block with
 *   a fetch() call to your analytics endpoint, e.g. /api/vitals.
 */

import { useEffect } from 'react'
import type { Metric } from 'web-vitals'

function reportMetric(metric: Metric): void {
  if (process.env.NODE_ENV === 'development') {
    const display =
      metric.name === 'CLS' ? metric.value.toFixed(4) : `${Math.round(metric.value)}ms`

    console.log(
      `[WebVitals] ${metric.name}: ${display} | rating: ${metric.rating} | id: ${metric.id}`,
    )
  }
  // Production: extend here with fetch('/api/vitals', { method: 'POST', body: JSON.stringify(metric) })
}

export function WebVitalsReporter() {
  useEffect(() => {
    // Dynamic import keeps web-vitals out of the initial JS bundle.
    void import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(reportMetric)
      onFCP(reportMetric)
      onINP(reportMetric)
      onLCP(reportMetric)
      onTTFB(reportMetric)
    })
  }, [])

  return null
}
