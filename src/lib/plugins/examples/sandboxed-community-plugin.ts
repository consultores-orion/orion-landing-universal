/**
 * Example Plugin: Community (Sandboxed)
 *
 * Demonstrates how a community or third-party plugin should declare its
 * trust level, timeout, and permissions. These declarations allow site
 * maintainers to audit what a plugin does before enabling it.
 *
 * This plugin sends a lightweight analytics ping on lead capture.
 * URL is read from PLUGIN_ANALYTICS_URL. If unset, the plugin is a no-op.
 *
 * Usage:
 *   import { communityPlugin } from '@/lib/plugins/examples/sandboxed-community-plugin'
 *   pluginRegistry.registerPlugin(communityPlugin)
 */

import type { OrionPlugin } from '../types'

export const communityPlugin: OrionPlugin = {
  name: 'community:analytics-ping',
  version: '1.0.0',
  description: 'Sends a lightweight lead analytics ping to a configurable endpoint.',

  // ── Sandbox declarations ──────────────────────────────────────────────────
  trustLevel: 'community', // Default timeout: 5_000 ms
  timeout: 4_000, // Override: be explicit when known
  permissions: ['network', 'env_read'],

  hooks: {
    async onLeadCaptured(context) {
      const analyticsUrl = process.env.PLUGIN_ANALYTICS_URL
      if (!analyticsUrl) return

      await fetch(analyticsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'lead_captured',
          source: context.lead.source_module,
          ts: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(3_500),
      })
    },
  },
}
