# Plugin System Guide

> **Audience**: Developers extending Orion Landing Universal without modifying core files.
> **Version**: 0.1.0+ (S9)

---

## Concept

The plugin system is a **server-side hook registry**. You define a plugin as a plain
TypeScript object that declares handler functions for one or more lifecycle events. When
those events occur (e.g. a lead is saved, a field is edited inline), the registry invokes
all registered handlers in parallel.

Key properties:

- **Server-side only** — plugins run inside Next.js API routes and Server Components; they
  are never bundled into the browser.
- **Non-blocking** — plugin errors are caught and logged; they never affect the HTTP
  response returned to the end user.
- **No persistence** — plugins are registered at server boot time (process start). State
  must be kept in external services (databases, queues, etc.).
- **No sandbox** — plugins run in the same Node.js process as the application. Only deploy
  trusted plugins.

---

## Available Hooks

| Hook                        | When it fires                                              | Payload type                     |
| --------------------------- | ---------------------------------------------------------- | -------------------------------- |
| `onLeadCaptured`            | After a lead is saved in the DB (POST /api/leads)          | `LeadCapturedContext`            |
| `onContentSaved`            | After an inline-edit field is saved (PUT /api/inline-edit) | `ContentSavedContext`            |
| `onThemeChanged`            | After the active theme or palette changes                  | `ThemeChangedContext`            |
| `onModuleVisibilityChanged` | After a module is shown or hidden                          | `ModuleVisibilityChangedContext` |
| `onAdminLogin`              | After a successful admin authentication                    | `AdminLoginContext`              |
| `onBeforeRender`            | Before the public page is rendered                         | `BeforeRenderContext`            |

### Payload shapes

```typescript
interface LeadCapturedContext {
  lead: {
    id: string
    name: string
    email: string
    phone: string
    message: string
    source_module: string
    metadata: Record<string, unknown>
    is_read: boolean
    created_at: string
    preferred_date: string | null
    preferred_time: string | null
  }
  siteId?: string
}

interface ContentSavedContext {
  moduleId: string // section_key, e.g. "hero"
  fieldPath: string // e.g. "title"
  lang: string | undefined // e.g. "es" — undefined for non-multilingual fields
  newValue: string | number | boolean
}

interface ThemeChangedContext {
  themeId: string
  label?: string
}
interface ModuleVisibilityChangedContext {
  moduleId: string
  isVisible: boolean
}
interface AdminLoginContext {
  userId: string
  email?: string
}
interface BeforeRenderContext {
  path: string
  lang: string
}
```

---

## Creating a Plugin

A plugin is a plain object that satisfies the `OrionPlugin` interface.

```typescript
// src/plugins/my-plugin.ts
import type { OrionPlugin } from '@/lib/plugins'

export const myPlugin: OrionPlugin = {
  name: 'my-company:notify', // Must be unique across all registered plugins
  version: '1.0.0',
  description: 'Sends Slack notifications on lead capture.',
  hooks: {
    async onLeadCaptured({ lead }) {
      await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `New lead: ${lead.email}` }),
      })
    },
  },
}
```

Rules:

- Handlers are `async` and return `void`. Any returned value is ignored.
- Do not `throw` for "soft" failures (e.g. an optional service is down). Throw only for
  unexpected errors you want logged; the registry handles them safely.
- Do not perform synchronous blocking work (heavy CPU loops, `fs.readFileSync` on large
  files, etc.) — you share the event loop with the web server.

---

## Registering a Plugin

Create `src/plugins.config.ts` at the project root and import it once from the server
entry point. The simplest integration is via the root layout:

```typescript
// src/plugins.config.ts
import { pluginRegistry } from '@/lib/plugins'
import { myPlugin } from './plugins/my-plugin'

// Register once — idempotent; re-registration replaces the previous entry.
pluginRegistry.registerPlugin(myPlugin)
```

```typescript
// src/app/layout.tsx (add at the top, before the component)
import '@/plugins.config'
// ... rest of layout
```

Because Next.js caches modules, `plugins.config.ts` runs once per server process start.

### Using environment variables

```typescript
// src/plugins/webhook-plugin.ts (included as an example in src/lib/plugins/examples/)
// Set PLUGIN_WEBHOOK_URL in .env.local or your hosting platform.
```

---

## Built-in Example Plugins

Two ready-to-use plugins are provided in `src/lib/plugins/examples/`:

| File                | What it does                                                          |
| ------------------- | --------------------------------------------------------------------- |
| `webhook-plugin.ts` | POSTs lead data as JSON to `PLUGIN_WEBHOOK_URL` on `onLeadCaptured`   |
| `log-plugin.ts`     | `console.log`s every hook event with timestamp — useful for debugging |

To enable the log plugin during development:

```typescript
// src/plugins.config.ts
import { pluginRegistry } from '@/lib/plugins'
import { logPlugin } from '@/lib/plugins/examples/log-plugin'

if (process.env.NODE_ENV !== 'production') {
  pluginRegistry.registerPlugin(logPlugin)
}
```

---

## Sandbox and Trust Levels

### Trust Levels

Every plugin can declare a `trustLevel` that controls its default execution timeout:

| Level          | Default Timeout | Use For                                       |
| -------------- | --------------- | --------------------------------------------- |
| `'trusted'`    | 10 000 ms       | Core plugins shipped with the project         |
| `'community'`  | 5 000 ms        | Third-party plugins reviewed by the community |
| `'unverified'` | 3 000 ms        | New or untested plugins                       |

`trustLevel` defaults to `'trusted'` if omitted (backwards compatible with existing plugins).

### Custom Timeout

Override the default with an explicit `timeout` (milliseconds):

```typescript
export const myPlugin: OrionPlugin = {
  name: 'my:plugin',
  version: '1.0.0',
  trustLevel: 'community',
  timeout: 2_000,  // 2 s — overrides the 5 s community default
  hooks: { ... },
}
```

### Permission Declarations

Plugins should declare `permissions` to help maintainers audit what they do:

| Permission   | Meaning                            |
| ------------ | ---------------------------------- |
| `'network'`  | Makes outbound `fetch()` calls     |
| `'console'`  | Writes to `console.log/warn/error` |
| `'env_read'` | Reads `process.env` values         |

```typescript
export const myPlugin: OrionPlugin = {
  name: 'my:plugin',
  version: '1.0.0',
  trustLevel: 'community',
  permissions: ['network', 'env_read'],
  hooks: { ... },
}
```

Permissions are **declarative** in this release — they document intent and aid audits.
Runtime enforcement (blocking undeclared permissions) is planned for a future release.

### Timeout Behavior

If a plugin handler takes longer than its timeout, the registry:

1. Logs a `console.warn` with guidance (the handler is slow, not crashing).
2. Discards the handler's result (the HTTP response is unaffected).
3. Continues with all other registered plugins.

The handler's underlying promise may still complete in the background; its result is
simply ignored. This is inherent to JavaScript's single-event-loop model.

---

## Current Limitations

- **Partial sandbox (timeout-based)** — since S16, all plugin handlers are wrapped in a
  per-plugin execution timeout. Runaway or slow plugins are terminated with a
  `SandboxTimeoutError` that is logged but never propagates to the caller.
  Full memory/CPU isolation (Worker Threads, `isolated-vm`) is intentionally out of scope
  for this release. Only deploy trusted, reviewed plugins.
- **Server-side only** — no client-side (browser) hooks exist in this version.
- **No persistent state between requests** — serverless deployments (Vercel) spin up a
  fresh process per function invocation. Store state in an external service.
- **Rate limiting** — plugins called from API routes (leads, inline-edit) are subject to
  the same per-IP rate limits as the route itself; they do not add extra throttling.
- **No hook for `onModuleVisibilityChanged` / `onThemeChanged` yet** — the emit calls for
  these hooks will be added when the corresponding admin API routes are extended.
