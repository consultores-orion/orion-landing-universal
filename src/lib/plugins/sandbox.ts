/**
 * Orion Plugin Sandbox
 *
 * Provides timeout-based execution protection for plugin handlers.
 * Prevents a single runaway plugin from blocking the server indefinitely.
 *
 * Design: Node.js has no built-in "kill this async function after N ms" primitive.
 * We use Promise.race with a rejection timer. If the handler resolves before the
 * timer fires, the timer is cleared with no side effects. If the timer fires first,
 * the handler's promise is abandoned (it may still run to completion in the
 * background, but its result is discarded and the error is logged).
 *
 * For true memory/CPU isolation, use Worker Threads or isolated-vm.
 * That level of isolation is intentionally out of scope for this release.
 */

import type { OrionPlugin } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Timeout defaults by trust level
// ─────────────────────────────────────────────────────────────────────────────

const TRUST_TIMEOUT_MS: Record<NonNullable<OrionPlugin['trustLevel']>, number> = {
  trusted: 10_000,
  community: 5_000,
  unverified: 3_000,
}

// ─────────────────────────────────────────────────────────────────────────────
// Error class
// ─────────────────────────────────────────────────────────────────────────────

export class SandboxTimeoutError extends Error {
  readonly pluginName: string
  readonly hook: string
  readonly timeoutMs: number

  constructor(pluginName: string, hook: string, timeoutMs: number) {
    super(
      `[PluginSandbox] Plugin "${pluginName}" timed out on hook "${hook}" after ${timeoutMs}ms.`,
    )
    this.name = 'SandboxTimeoutError'
    this.pluginName = pluginName
    this.hook = hook
    this.timeoutMs = timeoutMs
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core utility
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Race `promise` against a timeout. If the timeout fires first, the returned
 * promise rejects with a `SandboxTimeoutError`; the original promise is left
 * to settle on its own (its result is ignored).
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  pluginName: string,
  hook: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new SandboxTimeoutError(pluginName, hook, timeoutMs))
    }, timeoutMs)

    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err: unknown) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the effective timeout for a plugin.
 * Explicit `plugin.timeout` takes precedence; falls back to trust-level default.
 */
export function resolveTimeout(plugin: OrionPlugin): number {
  if (plugin.timeout !== undefined) return plugin.timeout
  return TRUST_TIMEOUT_MS[plugin.trustLevel ?? 'trusted']
}
