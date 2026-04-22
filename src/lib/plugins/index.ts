/**
 * Orion Plugin System — Public API
 *
 * Import the singleton registry and all types from this barrel.
 *
 * Usage in API routes (server-side only):
 *   import { pluginRegistry } from '@/lib/plugins'
 *
 * Usage in plugin definitions:
 *   import type { OrionPlugin, PluginHook } from '@/lib/plugins'
 */

export { pluginRegistry } from './registry'
export { SandboxTimeoutError } from './sandbox'
export type {
  OrionPlugin,
  PluginHook,
  PluginHandler,
  PluginContextMap,
  PluginRegistry,
  LeadCapturedContext,
  ContentSavedContext,
  ThemeChangedContext,
  ModuleVisibilityChangedContext,
  AdminLoginContext,
  BeforeRenderContext,
  PluginPermission,
  PluginTrustLevel,
} from './types'
