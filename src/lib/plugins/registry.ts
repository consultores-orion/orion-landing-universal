/**
 * Orion Plugin Registry — Singleton
 *
 * Manages plugin registration and hook emission.
 *
 * Design decisions:
 * - Module-level singleton: created once per Node.js process (stable across
 *   Next.js hot-reloads via module cache).
 * - Promise.allSettled for parallel emission: one plugin failure never
 *   prevents other plugins from running.
 * - Errors logged with plugin name; never re-thrown.
 * - Server-side only. Do not import in client components.
 */

import type {
  OrionPlugin,
  PluginContextMap,
  PluginHook,
  PluginRegistry as IPluginRegistry,
} from './types'
import { withTimeout, resolveTimeout, SandboxTimeoutError } from './sandbox'

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

class PluginRegistryImpl implements IPluginRegistry {
  /** Internal map: plugin name → plugin definition */
  private readonly plugins = new Map<string, OrionPlugin>()

  registerPlugin(plugin: OrionPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(
        `[PluginRegistry] Plugin "${plugin.name}" is already registered — replacing with new version ${plugin.version}.`,
      )
    }
    this.plugins.set(plugin.name, plugin)
    console.log(
      `[PluginRegistry] Registered plugin "${plugin.name}" v${plugin.version}${plugin.description ? ` — ${plugin.description}` : ''}.`,
    )
  }

  unregisterPlugin(name: string): void {
    const removed = this.plugins.delete(name)
    if (removed) {
      console.log(`[PluginRegistry] Unregistered plugin "${name}".`)
    }
  }

  getPlugins(): OrionPlugin[] {
    return Array.from(this.plugins.values())
  }

  async emit<T extends PluginHook>(hook: T, context: PluginContextMap[T]): Promise<void> {
    const candidates = Array.from(this.plugins.values()).filter(
      (plugin) => hook in plugin.hooks && typeof plugin.hooks[hook] === 'function',
    )

    if (candidates.length === 0) return

    const results = await Promise.allSettled(
      candidates.map((plugin) => {
        // The cast is safe: we confirmed above that plugin.hooks[hook] exists
        const handler = plugin.hooks[hook] as (ctx: PluginContextMap[T]) => Promise<void>
        return withTimeout(handler(context), resolveTimeout(plugin), plugin.name, String(hook))
      }),
    )

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const pluginName = candidates[index]?.name ?? 'unknown'
        if (result.reason instanceof SandboxTimeoutError) {
          console.warn(
            `[PluginRegistry] Plugin "${pluginName}" timed out on hook "${hook}" — it may be performing slow I/O. ` +
              `Increase plugin.timeout or use a faster implementation.`,
          )
        } else {
          console.error(
            `[PluginRegistry] Plugin "${pluginName}" threw on hook "${hook}":`,
            result.reason,
          )
        }
      }
    })
  }

  hasHook(hook: PluginHook): boolean {
    return Array.from(this.plugins.values()).some(
      (plugin) => hook in plugin.hooks && typeof plugin.hooks[hook] === 'function',
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton export
// ─────────────────────────────────────────────────────────────────────────────

export const pluginRegistry = new PluginRegistryImpl()
