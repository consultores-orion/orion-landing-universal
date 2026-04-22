#!/usr/bin/env node
/**
 * Orion Landing Universal — Module Scaffold CLI
 *
 * Usage:
 *   npx create-orion-module
 *   npx create-orion-module my-module
 *
 * Generates all 5 required files for a new module:
 *   src/components/modules/{name}/
 *     {Name}Module.tsx
 *     {name}.schema.ts
 *     {name}.seed.ts
 *     {name}.types.ts
 *     index.ts
 *
 * Then prints the registry entry snippet to add manually.
 */

'use strict'

const VERSION = '0.1.0'

const readline = require('readline')
const fs = require('fs')
const path = require('path')

// ─── Name conversion helpers ──────────────────────────────────────────────────

/** "my-module" | "myModule" | "My Module" → "my-module" */
function toKebab(str) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/^-+/, '')
    .replace(/-+/g, '-')
    .replace(/-+$/, '')
}

/** "my-module" → "MyModule" */
function toPascal(kebab) {
  return kebab.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')
}

/** "my-module" → "my_module" */
function toSnake(kebab) {
  return kebab.replace(/-/g, '_')
}

/** "my-module" → "myModule" */
function toCamel(kebab) {
  const pascal = toPascal(kebab)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

// ─── File templates ───────────────────────────────────────────────────────────

function componentTemplate(name, pascal, snake) {
  return `import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { ${pascal}Content } from './${name}.types'

type ${pascal}ModuleProps = ModuleProps<${pascal}Content>

export default function ${pascal}Module({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: ${pascal}ModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="${snake}" styles={styles}>
      {/* TODO: Add your module JSX here */}
      <div className="mx-auto max-w-4xl text-center">
        {content.title && (
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: 'var(--color-foreground)' }}
          >
            {t(content.title)}
          </h2>
        )}
        {content.description && (
          <p
            className="mt-4 text-lg"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {t(content.description)}
          </p>
        )}
      </div>
    </ModuleWrapper>
  )
}
`
}

function schemaTemplate(name, pascal, snake, displayName, description) {
  const camel = toCamel(name)
  return `import type { ModuleSchemaDef } from '@/lib/modules/types'

export const ${camel}Schema: ModuleSchemaDef = {
  key: '${snake}',
  name: { es: '${displayName}', en: '${displayName}' },
  description: { es: '${description}', en: '${description}' },
  version: 1,
  fields: [
    {
      key: 'title',
      type: 'text',
      label: { es: 'Título', en: 'Title' },
      isMultilingual: true,
      required: true,
      order: 1,
    },
    {
      key: 'description',
      type: 'textarea',
      label: { es: 'Descripción', en: 'Description' },
      isMultilingual: true,
      required: false,
      order: 2,
    },
    // TODO: Add more fields. Available types:
    //   text | textarea | richtext | image | list | number | boolean | color | link | date | select
  ],
}
`
}

function seedTemplate(name, pascal, snake, displayName) {
  const camel = toCamel(name)
  return `import type { ModuleSeed } from '@/lib/modules/types'
import type { ${pascal}Content } from './${name}.types'

export const ${camel}Seed: ModuleSeed = {
  key: '${snake}',
  defaultOrder: 20,
  defaultEnabled: true,
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'wide',
  },
  content: {
    title: {
      es: '${displayName}',
      en: '${displayName}',
    },
    description: {
      es: 'Agrega aquí tu descripción.',
      en: 'Add your description here.',
    },
    // TODO: Add default values for all required fields
  } satisfies ${pascal}Content,
}
`
}

function typesTemplate(name, pascal) {
  return `import type { MultilingualText } from '@/lib/modules/types'

export interface ${pascal}Content {
  title?: MultilingualText
  description?: MultilingualText
  // TODO: Add more fields matching your schema.
  // Use MultilingualText for translatable strings.
  // Use MultilingualImage for images (has url, alt, width?, height?).
  // Use string unions for select fields: layout?: 'centered' | 'card'
}
`
}

function indexTemplate(name, pascal) {
  const camel = toCamel(name)
  return `export { default } from './${pascal}Module'
export type { ${pascal}Content } from './${name}.types'
export { ${camel}Schema } from './${name}.schema'
export { ${camel}Seed } from './${name}.seed'
`
}

// ─── Registry snippet (printed, not written) ─────────────────────────────────

function registrySnippet(name, pascal, snake, displayName, description, category) {
  const camel = toCamel(name)
  return `  // Add to the registry Map in src/lib/modules/registry.ts:
  [
    '${snake}',
    {
      key: '${snake}',
      displayName: '${displayName}',
      description: '${description}',
      component: asModule(() => import('@/components/modules/${name}') as never),
      category: '${category}',
      isSystem: false,
      defaultOrder: 20,
    },
  ],`
}

// ─── Interactive prompt helper ────────────────────────────────────────────────

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const CATEGORIES = ['header', 'content', 'social', 'conversion', 'info', 'footer']

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  console.log(`create-orion-module v${VERSION}`)
  console.log('\nOrion Landing Universal — Module Scaffold\n')

  // Determine paths — resolve from CWD (project root where the user runs the command)
  const projectRoot = process.cwd()
  const modulesDir = path.join(projectRoot, 'src', 'components', 'modules')

  if (!fs.existsSync(modulesDir)) {
    console.error(`\nERROR: modules directory not found: ${modulesDir}`)
    console.error('Run this command from the root of an Orion Landing Universal project.\n')
    rl.close()
    process.exit(1)
  }

  // ── Step 1: Module name ──────────────────────────────────────────────────────
  let rawName = (process.argv[2] || '').trim()
  if (!rawName) {
    rawName = (await ask(rl, 'Module name (kebab-case, e.g. "testimonial-slider"): ')).trim()
  }

  const moduleName = toKebab(rawName)

  if (!moduleName || !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(moduleName)) {
    console.error('\nERROR: Invalid module name. Use kebab-case, e.g. "testimonial-slider"\n')
    rl.close()
    process.exit(1)
  }

  const targetDir = path.join(modulesDir, moduleName)
  if (fs.existsSync(targetDir)) {
    console.error(`\nERROR: Module "${moduleName}" already exists:\n  ${targetDir}\n`)
    rl.close()
    process.exit(1)
  }

  const pascal = toPascal(moduleName)
  const snake = toSnake(moduleName)

  // ── Step 2: Display name ─────────────────────────────────────────────────────
  const rawDisplayName = (await ask(rl, `Display name (e.g. "Testimonial Slider") [${pascal}]: `)).trim()
  const displayName = rawDisplayName || pascal

  // ── Step 3: Description ──────────────────────────────────────────────────────
  const rawDesc = (await ask(rl, `Short description [${displayName} module]: `)).trim()
  const description = rawDesc || `${displayName} module`

  // ── Step 4: Category ─────────────────────────────────────────────────────────
  console.log(`\nCategories: ${CATEGORIES.join(' | ')}`)
  const rawCategory = (await ask(rl, 'Category [content]: ')).trim().toLowerCase()
  const category = CATEGORIES.includes(rawCategory) ? rawCategory : 'content'

  rl.close()

  // ── Generate files ────────────────────────────────────────────────────────────
  console.log(`\nCreating module "${moduleName}" in:\n  ${targetDir}\n`)

  fs.mkdirSync(targetDir, { recursive: true })

  const files = {
    [`${pascal}Module.tsx`]: componentTemplate(moduleName, pascal, snake),
    [`${moduleName}.schema.ts`]: schemaTemplate(moduleName, pascal, snake, displayName, description),
    [`${moduleName}.seed.ts`]: seedTemplate(moduleName, pascal, snake, displayName),
    [`${moduleName}.types.ts`]: typesTemplate(moduleName, pascal),
    ['index.ts']: indexTemplate(moduleName, pascal),
  }

  for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(targetDir, filename), content, 'utf-8')
    console.log(`  Created  ${filename}`)
  }

  // ── Registry snippet ──────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────────────')
  console.log('REGISTRY — Add this entry to src/lib/modules/registry.ts:\n')
  console.log(registrySnippet(moduleName, pascal, snake, displayName, description, category))
  console.log('\n─────────────────────────────────────────────────────────────────')
  console.log('\nModule scaffold complete!\n')
  console.log('Next steps:')
  console.log(`  1. Add the registry entry above to src/lib/modules/registry.ts`)
  console.log(`  2. Edit ${pascal}Module.tsx         — implement your JSX`)
  console.log(`  3. Edit ${moduleName}.types.ts      — define content shape`)
  console.log(`  4. Edit ${moduleName}.schema.ts     — match types (admin fields)`)
  console.log(`  5. Edit ${moduleName}.seed.ts       — realistic demo content`)
  console.log(`  6. Run: pnpm type-check\n`)
}

main().catch((err) => {
  console.error('\nUnexpected error:', err.message)
  process.exit(1)
})
