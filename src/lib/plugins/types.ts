/**
 * Orion Plugin System — Type Definitions
 *
 * Lightweight hook-based plugin API. All hooks are server-side only.
 * Plugins run after the primary operation succeeds; errors are caught
 * and logged but never propagate to the caller.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Hook names
// ─────────────────────────────────────────────────────────────────────────────

export type PluginHook =
  /** Fired after a lead is successfully saved in the database. */
  | 'onLeadCaptured'
  /** Fired after an inline-edit content change is saved. */
  | 'onContentSaved'
  /** Fired after the active theme or colour palette is changed. */
  | 'onThemeChanged'
  /** Fired after a module's visibility is toggled. */
  | 'onModuleVisibilityChanged'
  /** Fired after a successful admin authentication. */
  | 'onAdminLogin'
  /**
   * Fired before the public page is rendered.
   * Plugins can add metadata or inject data, but must not throw.
   */
  | 'onBeforeRender'

// ─────────────────────────────────────────────────────────────────────────────
// Per-hook context payloads (typed by hook name)
// ─────────────────────────────────────────────────────────────────────────────

export interface LeadCapturedContext {
  /** The full lead record as saved in the database. */
  lead: {
    id: string
    name: string
    email: string
    phone: string
    message: string
    preferred_date: string | null
    preferred_time: string | null
    source_module: string
    metadata: Record<string, unknown>
    is_read: boolean
    created_at: string
  }
  /** Identifier of the site that captured the lead. */
  siteId?: string
}

export interface ContentSavedContext {
  /** The section_key of the module whose content was updated. */
  moduleId: string
  /** Dot-notation path to the updated field (e.g. "title", "button.label"). */
  fieldPath: string
  /** Language code for multilingual fields, or undefined for non-i18n fields. */
  lang: string | undefined
  /** The new value that was written. */
  newValue: string | number | boolean
}

export interface ThemeChangedContext {
  /** The name/id of the new theme or palette. */
  themeId: string
  /** Optional human-readable label. */
  label?: string
}

export interface ModuleVisibilityChangedContext {
  /** The section_key of the module. */
  moduleId: string
  /** Whether the module is now visible (true) or hidden (false). */
  isVisible: boolean
}

export interface AdminLoginContext {
  /** Supabase auth user ID of the admin that logged in. */
  userId: string
  /** Email address of the admin, if available. */
  email?: string
}

export interface BeforeRenderContext {
  /** Current path being rendered. */
  path: string
  /** Active language code. */
  lang: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapping: hook name → context payload type
// ─────────────────────────────────────────────────────────────────────────────

export interface PluginContextMap {
  onLeadCaptured: LeadCapturedContext
  onContentSaved: ContentSavedContext
  onThemeChanged: ThemeChangedContext
  onModuleVisibilityChanged: ModuleVisibilityChangedContext
  onAdminLogin: AdminLoginContext
  onBeforeRender: BeforeRenderContext
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler + plugin interface
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A plugin handler for a specific hook.
 * Must be async. Return value is ignored.
 * Errors are caught by the registry — do not throw to signal business failures.
 */
export type PluginHandler<T extends PluginHook = PluginHook> = (
  context: PluginContextMap[T],
) => Promise<void>

/**
 * Capabilities a plugin declares it needs.
 * Used for documentation and future enforcement.
 */
export type PluginPermission =
  /** Plugin makes fetch() calls to external services. */
  | 'network'
  /** Plugin writes to console.log/warn/error. */
  | 'console'
  /** Plugin reads process.env values. */
  | 'env_read'

/**
 * Trust level determines the default execution timeout.
 * trusted = 10s, community = 5s, unverified = 3s
 */
export type PluginTrustLevel = 'trusted' | 'community' | 'unverified'

/**
 * An Orion plugin definition.
 * Declare only the hooks your plugin needs; all others are optional.
 */
export interface OrionPlugin {
  /** Unique plugin name. Used in logs and for unregister. */
  name: string
  /** Semver-style version string, e.g. "1.0.0". */
  version: string
  /** Optional one-line description shown in debug output. */
  description?: string
  /**
   * Trust level. Determines default timeout and future permission enforcement.
   * Defaults to 'trusted' (backwards compatible — existing plugins are unaffected).
   */
  trustLevel?: PluginTrustLevel
  /**
   * Maximum execution time in milliseconds for each hook handler.
   * Overrides the trust-level default when set.
   * trusted default: 10_000 | community default: 5_000 | unverified default: 3_000
   */
  timeout?: number
  /**
   * Capabilities this plugin needs. Purely declarative for now.
   * Used for auditing; not yet enforced at runtime.
   */
  permissions?: readonly PluginPermission[]
  /** Map of hook names to handler functions. */
  hooks: Partial<{
    [H in PluginHook]: PluginHandler<H>
  }>
}

/**
 * Public API of the plugin registry.
 */
export interface PluginRegistry {
  /**
   * Register a plugin. If a plugin with the same name already exists,
   * the new registration replaces it.
   */
  registerPlugin(plugin: OrionPlugin): void

  /**
   * Remove a previously registered plugin by name.
   * No-op if the name is not registered.
   */
  unregisterPlugin(name: string): void

  /** Returns a snapshot of all currently registered plugins. */
  getPlugins(): OrionPlugin[]

  /**
   * Emit a hook event.
   * All plugins that declare this hook are invoked in parallel.
   * Individual plugin errors are caught and logged; they never reject this call.
   */
  emit<T extends PluginHook>(hook: T, context: PluginContextMap[T]): Promise<void>

  /** Returns true if at least one registered plugin handles this hook. */
  hasHook(hook: PluginHook): boolean
}
