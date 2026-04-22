/**
 * Example Plugin: Webhook
 *
 * Sends an HTTP POST to a configurable URL whenever a lead is captured.
 * URL is read from the PLUGIN_WEBHOOK_URL environment variable.
 * If the variable is not set, the plugin registers but does nothing.
 *
 * To enable: set PLUGIN_WEBHOOK_URL=https://your-endpoint.example.com/leads
 * in your .env.local (dev) or platform environment variables (production).
 *
 * Payload sent (JSON):
 *   {
 *     event: "onLeadCaptured",
 *     timestamp: "<ISO string>",
 *     lead: { id, name, email, phone, message, source_module, created_at, ... },
 *     siteId?: string
 *   }
 */

import type { OrionPlugin } from '../types'

export const webhookPlugin: OrionPlugin = {
  name: 'orion:webhook',
  version: '1.0.0',
  description: 'POSTs lead data to a configurable webhook URL on capture.',
  hooks: {
    async onLeadCaptured(context) {
      const webhookUrl = process.env.PLUGIN_WEBHOOK_URL
      if (!webhookUrl) return

      const payload = {
        event: 'onLeadCaptured' as const,
        timestamp: new Date().toISOString(),
        lead: context.lead,
        ...(context.siteId !== undefined ? { siteId: context.siteId } : {}),
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Reasonable timeout: 5 s. fetch does not natively support timeout,
        // so we use AbortSignal.timeout (available in Node 18+).
        signal: AbortSignal.timeout(5_000),
      })

      if (!response.ok) {
        // Throw so the registry logs it as an error. The caller (API route)
        // is unaffected because the registry catches all plugin errors.
        throw new Error(`Webhook responded with HTTP ${response.status}`)
      }
    },
  },
}
