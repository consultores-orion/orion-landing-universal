/**
 * Example Plugin: Logger
 *
 * Logs every lifecycle hook event to the server console with a timestamp.
 * Useful as a starting point for custom plugins and as a debugging tool
 * during development.
 *
 * To register in your project, add to src/plugins.config.ts (or layout.tsx):
 *
 *   import { pluginRegistry } from '@/lib/plugins'
 *   import { logPlugin } from '@/lib/plugins/examples/log-plugin'
 *   pluginRegistry.registerPlugin(logPlugin)
 */

import type { OrionPlugin, PluginContextMap, PluginHook } from '../types'

function log(hook: PluginHook, context: PluginContextMap[PluginHook]): void {
  const timestamp = new Date().toISOString()
  console.log(`[LogPlugin] ${timestamp} | ${hook}`, JSON.stringify(context, null, 2))
}

export const logPlugin: OrionPlugin = {
  name: 'orion:log',
  version: '1.0.0',
  description: 'Logs all hook events to the server console with ISO timestamps.',
  hooks: {
    async onLeadCaptured(context) {
      log('onLeadCaptured', context)
    },
    async onContentSaved(context) {
      log('onContentSaved', context)
    },
    async onThemeChanged(context) {
      log('onThemeChanged', context)
    },
    async onModuleVisibilityChanged(context) {
      log('onModuleVisibilityChanged', context)
    },
    async onAdminLogin(context) {
      log('onAdminLogin', context)
    },
    async onBeforeRender(context) {
      log('onBeforeRender', context)
    },
  },
}
