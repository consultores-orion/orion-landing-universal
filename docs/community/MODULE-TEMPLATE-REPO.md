# Creating a Shareable Module Repository

> This guide explains how to package an Orion Landing module as a standalone GitHub repository so other users can install it into their projects.

---

## When to Use a Template Repo

The built-in scaffold tool (`pnpm scaffold:module`) is the right choice when building a module for your own site. A **standalone GitHub repository** is the right choice when you want to:

- Share a complex, reusable module with the community.
- Maintain the module independently from any specific landing page installation.
- Allow users to install your module into their own Orion Landing projects with a simple copy-and-register workflow.

If your module is simple or site-specific, you do not need a separate repo.

---

## Naming Convention

Repositories must follow the naming pattern:

```
orion-module-{name}
```

Use kebab-case for `{name}`. Examples:

| Module                | Repository name                      |
| --------------------- | ------------------------------------ |
| Pricing table         | `orion-module-pricing-table`         |
| Testimonials carousel | `orion-module-testimonials-carousel` |
| Cookie consent banner | `orion-module-cookie-consent`        |
| Interactive map       | `orion-module-map-interactive`       |

This convention makes your module discoverable via GitHub search (`orion-module-`) and signals compatibility with Orion Landing Universal to potential users.

---

## Repository Structure

```
orion-module-{name}/
├── src/
│   └── {ModuleName}/
│       ├── {ModuleName}.tsx          ← Main React component
│       ├── {module-name}.schema.ts   ← Editable field definitions
│       ├── {module-name}.seed.ts     ← Demo/default content
│       ├── {module-name}.types.ts    ← TypeScript interfaces
│       └── index.ts                  ← Re-exports for clean imports
├── README.md                         ← Installation guide (see template below)
├── package.json                      ← Metadata only — no bundled output
└── LICENSE                           ← MIT recommended
```

### Notes on the structure

- The `src/{ModuleName}/` folder mirrors exactly what users will copy into `src/components/modules/{ModuleName}/` in their project.
- The `package.json` is for metadata and convenience scripts only. You are distributing source files, not a compiled package. Do not list Orion Landing, Next.js, React, or Supabase as `dependencies` — users already have them.
- The `LICENSE` file is required. MIT is the recommended license for compatibility with the main project.

---

## package.json Template

```json
{
  "name": "orion-module-{name}",
  "version": "1.0.0",
  "description": "One-sentence description of what this module does.",
  "type": "module",
  "keywords": ["orion-landing", "orion-module", "next.js", "landing-page"],
  "author": "Your Name <your@email.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/orion-module-{name}"
  },
  "peerDependencies": {
    "next": ">=15.0.0",
    "react": ">=19.0.0"
  }
}
```

No `main`, no `exports`, no build step. Users install by copying source files.

---

## README Template

Write a `README.md` for your module that users can follow without needing additional context. Copy and adapt this template:

```markdown
# orion-module-{name}

> One-sentence description of what this module does.

Compatible with **Orion Landing Universal v0.1.0+**.

## Preview

(Include a screenshot or GIF here)

## Installation

### Step 1 — Copy the module files

Copy the `src/{ModuleName}/` folder from this repository into your project:
```

src/components/modules/{ModuleName}/

```

Your project structure should look like:

```

src/components/modules/
{ModuleName}/
{ModuleName}.tsx
{module-name}.schema.ts
{module-name}.seed.ts
{module-name}.types.ts
index.ts

````

### Step 2 — Register the module

Open `src/lib/modules/registry.ts` and add the module entry:

```typescript
import dynamic from 'next/dynamic'
import { moduleName_schema } from '@/components/modules/{ModuleName}/{module-name}.schema'
import { moduleName_seed } from '@/components/modules/{ModuleName}/{module-name}.seed'

// Inside the MODULE_REGISTRY object:
module_name: {
  component: dynamic(() => import('@/components/modules/{ModuleName}'), { ssr: true }),
  schema: moduleName_schema,
  seed: moduleName_seed,
  label: 'Your Module Label',
  icon: 'layout', // Any Lucide icon name
  category: 'content',
}
````

### Step 3 — Add the database row

Run this SQL in your Supabase SQL Editor to register the module:

```sql
INSERT INTO module_schemas (module_type, fields, version)
VALUES (
  'module_name',
  '<paste the JSON output of your schema here>',
  1
)
ON CONFLICT (module_type) DO NOTHING;
```

### Step 4 — Seed demo content (optional)

To see the module with demo content, insert a row into `page_modules`:

```sql
INSERT INTO page_modules (module_type, content, is_enabled, order_index)
VALUES (
  'module_name',
  '<paste the JSON from {module-name}.seed.ts here>',
  true,
  (SELECT COALESCE(MAX(order_index), 0) + 1 FROM page_modules)
);
```

## Configuration

(Describe the fields exposed in the admin panel, what they do, and any constraints.)

## License

MIT — see [LICENSE](LICENSE).

```

---

## Full Module Creation Guide

For complete documentation on how to build the module files themselves (component structure, schema format, seed format, registry conventions), see:

[`docs/guides/CUSTOM-MODULE.md`](../guides/CUSTOM-MODULE.md)

That guide covers every file in detail, including the `scaffold:module` CLI tool you can use to generate the boilerplate.

---

## Publishing Your Module

Once your repository is ready:

1. Push it to GitHub under the `orion-module-{name}` name.
2. Add the topic `orion-landing` to your GitHub repository (under the repository settings → Topics). This makes it discoverable by the community.
3. Open a PR to add your module to the community module index in `docs/community/MODULE-TEMPLATE-REPO.md` (add a row to the Community Modules table below).

---

## Community Modules

Modules published by the community. Submit a PR to add yours.

| Module | Repository | Author | Description |
|--------|-----------|--------|-------------|
| *(submit yours!)* | — | — | — |

---

## Questions?

Open a [GitHub Discussion](https://github.com/orion-ai-society/orion-landing-universal/discussions) or check the [Contributing guide](../governance/CONTRIBUTING.md).
```
