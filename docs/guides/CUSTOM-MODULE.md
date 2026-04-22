# Guía: Creación de Módulos Personalizados

> **Audiencia**: Desarrolladores que extienden Orion Landing Universal con módulos propios.
> **Versión del sistema**: 0.1.0+ (S8)

---

## Índice

1. [Conceptos previos](#1-conceptos-previos)
2. [Estructura de archivos requerida](#2-estructura-de-archivos-requerida)
3. [Paso 1 — Definir los tipos TypeScript](#paso-1--definir-los-tipos-typescript)
4. [Paso 2 — Definir el schema de campos editables](#paso-2--definir-el-schema-de-campos-editables)
5. [Paso 3 — Crear los seed data](#paso-3--crear-los-seed-data)
6. [Paso 4 — Implementar el componente React](#paso-4--implementar-el-componente-react)
7. [Paso 5 — Registrar el módulo en el Registry](#paso-5--registrar-el-módulo-en-el-registry)
8. [Paso 6 — Agregar la migración SQL](#paso-6--agregar-la-migración-sql)
9. [Paso 7 — Extender el tipo SectionKey](#paso-7--extender-el-tipo-sectionkey)
10. [Ejemplo completo: módulo `testimonial_single`](#ejemplo-completo-módulo-testimonial_single)
11. [Checklist de validación](#checklist-de-validación)

---

## 1. Conceptos previos

### Cómo funciona el sistema de módulos

El sistema usa un **Registry** (mapa de clave → definición) declarado en `src/lib/modules/registry.ts`. El renderer (`src/lib/modules/renderer.tsx`) lee la tabla `page_modules` de Supabase y, para cada fila, busca el componente correspondiente en el Registry y lo renderiza con el `content` y `styles` almacenados en la DB.

Cada módulo es **completamente autónomo**: sus campos editables, datos por defecto, tipos y componente viven juntos en su carpeta. El panel de admin genera el formulario de edición de forma dinámica leyendo el schema — sin tocar código del admin.

### Tipos de campos soportados

| `type`     | Uso                                                   |
| ---------- | ----------------------------------------------------- |
| `text`     | Texto corto (títulos, etiquetas)                      |
| `textarea` | Texto largo sin formato                               |
| `richtext` | Texto con formato HTML limitado                       |
| `image`    | URL de imagen + alt text (objeto `MultilingualImage`) |
| `list`     | Lista de objetos con sub-schema                       |
| `number`   | Valor numérico con validación min/max                 |
| `boolean`  | Toggle verdadero/falso                                |
| `color`    | Color hexadecimal                                     |
| `link`     | URL (string)                                          |
| `date`     | Fecha en ISO string                                   |
| `select`   | Selector con opciones predefinidas                    |

---

## 2. Estructura de archivos requerida

```
src/components/modules/{name}/
  {Name}Module.tsx      ← Componente React (default export)
  {name}.schema.ts      ← Definición de campos editables
  {name}.seed.ts        ← Datos por defecto para el wizard
  {name}.types.ts       ← Interfaces TypeScript del contenido
  index.ts              ← Re-exporta el componente (requerido por el registry)
```

El `{name}` usa **kebab-case** para el nombre de carpeta/archivos y **snake_case** para la clave del módulo (que coincide con `section_key` en la DB).

**Ejemplos de mapeo**:

| `section_key` (DB)   | Carpeta                       | Componente                    |
| -------------------- | ----------------------------- | ----------------------------- |
| `hero`               | `modules/hero/`               | `HeroModule.tsx`              |
| `testimonial_single` | `modules/testimonial-single/` | `TestimonialSingleModule.tsx` |
| `features_grid`      | `modules/features-grid/`      | `FeaturesGridModule.tsx`      |

---

## Paso 1 — Definir los tipos TypeScript

**Archivo**: `src/components/modules/{name}/{name}.types.ts`

Los tipos deben usar `MultilingualText` y `MultilingualImage` del sistema para todo campo internacionalizable.

```typescript
// src/components/modules/testimonial-single/testimonial-single.types.ts
import type { MultilingualText, MultilingualImage } from '@/lib/modules/types'

export interface TestimonialSingleContent {
  quote: MultilingualText // Texto del testimonio
  authorName: MultilingualText // Nombre del autor
  authorRole?: MultilingualText // Cargo/puesto (opcional)
  authorCompany?: MultilingualText // Empresa (opcional)
  authorAvatar?: MultilingualImage // Foto del autor (opcional)
  rating?: number // 1-5 (opcional)
  layout?: 'centered' | 'card' | 'minimal'
}
```

**Tipos base disponibles** (`@/lib/modules/types`):

```typescript
type MultilingualText = Record<string, string>
// Ejemplo: { es: 'Hola', en: 'Hello' }

interface MultilingualImage {
  url: string
  alt: MultilingualText
  width?: number
  height?: number
}
```

---

## Paso 2 — Definir el schema de campos editables

**Archivo**: `src/components/modules/{name}/{name}.schema.ts`

El schema es lo que el panel de admin lee para generar el formulario de edición. Cada campo del schema tiene una correspondencia directa con la clave en el objeto `content` de la DB.

```typescript
// src/components/modules/testimonial-single/testimonial-single.schema.ts
import type { ModuleSchemaDef } from '@/lib/modules/types'

export const testimonialSingleSchema: ModuleSchemaDef = {
  key: 'testimonial_single',
  name: { es: 'Testimonio Destacado', en: 'Featured Testimonial' },
  description: {
    es: 'Un testimonio de cliente individual con foto, cita y valoración.',
    en: 'A single customer testimonial with photo, quote, and rating.',
  },
  version: 1,
  fields: [
    {
      key: 'quote',
      type: 'textarea',
      label: { es: 'Cita del testimonio', en: 'Testimonial quote' },
      description: {
        es: 'La frase exacta que dijo el cliente.',
        en: 'The exact quote from the customer.',
      },
      isMultilingual: true,
      required: true,
      validation: { minLength: 20, maxLength: 500 },
      order: 1,
    },
    {
      key: 'authorName',
      type: 'text',
      label: { es: 'Nombre del autor', en: 'Author name' },
      isMultilingual: true,
      required: true,
      validation: { maxLength: 100 },
      order: 2,
    },
    {
      key: 'authorRole',
      type: 'text',
      label: { es: 'Cargo / Rol', en: 'Role / Title' },
      isMultilingual: true,
      required: false,
      validation: { maxLength: 100 },
      group: 'author',
      order: 3,
    },
    {
      key: 'authorCompany',
      type: 'text',
      label: { es: 'Empresa', en: 'Company' },
      isMultilingual: true,
      required: false,
      validation: { maxLength: 100 },
      group: 'author',
      order: 4,
    },
    {
      key: 'authorAvatar',
      type: 'image',
      label: { es: 'Foto del autor', en: 'Author photo' },
      isMultilingual: false,
      required: false,
      group: 'author',
      order: 5,
    },
    {
      key: 'rating',
      type: 'number',
      label: { es: 'Valoración (1–5)', en: 'Rating (1–5)' },
      isMultilingual: false,
      required: false,
      defaultValue: 5,
      validation: { min: 1, max: 5 },
      order: 6,
    },
    {
      key: 'layout',
      type: 'select',
      label: { es: 'Disposición', en: 'Layout' },
      isMultilingual: false,
      required: false,
      defaultValue: 'centered',
      selectOptions: [
        { value: 'centered', label: { es: 'Centrado', en: 'Centered' } },
        { value: 'card', label: { es: 'Tarjeta', en: 'Card' } },
        { value: 'minimal', label: { es: 'Minimal', en: 'Minimal' } },
      ],
      order: 7,
    },
  ],
}
```

### Propiedades de un campo (`SchemaField`)

| Propiedad        | Tipo               | Requerida     | Descripción                                                        |
| ---------------- | ------------------ | ------------- | ------------------------------------------------------------------ |
| `key`            | `string`           | Sí            | Ruta al campo en `content`. Soporta dot-notation: `"button.label"` |
| `type`           | ver tabla arriba   | Sí            | Tipo de control de edición                                         |
| `label`          | `MultilingualText` | Sí            | Etiqueta visible en el admin                                       |
| `description`    | `MultilingualText` | No            | Texto de ayuda bajo el campo                                       |
| `isMultilingual` | `boolean`          | Sí            | Si `true`, el valor es `Record<lang, string>` en la DB             |
| `required`       | `boolean`          | Sí            | Marca el campo como obligatorio                                    |
| `defaultValue`   | `unknown`          | No            | Valor usado si el campo está vacío                                 |
| `validation`     | objeto             | No            | `minLength`, `maxLength`, `min`, `max`, `pattern`                  |
| `selectOptions`  | array              | Solo `select` | Opciones del selector                                              |
| `listItemSchema` | `SchemaField[]`    | Solo `list`   | Sub-schema para cada ítem de la lista                              |
| `group`          | `string`           | No            | Agrupa campos visualmente en el admin                              |
| `order`          | `number`           | No            | Orden de aparición en el formulario                                |

---

## Paso 3 — Crear los seed data

**Archivo**: `src/components/modules/{name}/{name}.seed.ts`

El seed proporciona el contenido inicial que el wizard de setup inserta en la DB. Debe cubrir todos los campos con valores de ejemplo de calidad.

```typescript
// src/components/modules/testimonial-single/testimonial-single.seed.ts
import type { ModuleSeed } from '@/lib/modules/types'

export const testimonialSingleSeed: ModuleSeed = {
  key: 'testimonial_single',
  defaultOrder: 20, // Posición en la página (1 = primero)
  defaultEnabled: true, // Visible por defecto al hacer setup
  styles: {
    paddingY: 'large',
    paddingX: 'medium',
    maxWidth: 'narrow',
  },
  content: {
    quote: {
      es: 'Implementar esta solución transformó completamente la manera en que gestionamos nuestros proyectos. El equipo de soporte fue excepcional.',
      en: 'Implementing this solution completely transformed the way we manage our projects. The support team was exceptional.',
    },
    authorName: {
      es: 'María González',
      en: 'Maria González',
    },
    authorRole: {
      es: 'Directora de Operaciones',
      en: 'Operations Director',
    },
    authorCompany: {
      es: 'TechCorp Latam',
      en: 'TechCorp Latam',
    },
    authorAvatar: {
      url: '',
      alt: { es: 'María González', en: 'Maria González' },
    },
    rating: 5,
    layout: 'centered',
  },
}
```

### Presets de estilos disponibles

```typescript
interface ModuleStyles {
  paddingY?: 'none' | 'small' | 'medium' | 'large' | 'xlarge'
  paddingX?: 'none' | 'small' | 'medium' | 'large'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  backgroundColor?: string | null // Color hex o CSS variable
  textColor?: string | null
  backgroundImage?: string | null // URL de imagen
  backgroundOverlayOpacity?: number // 0–1
}
```

---

## Paso 4 — Implementar el componente React

**Archivo**: `src/components/modules/{name}/{Name}Module.tsx`

El componente recibe `ModuleProps<TContent>` y debe:

- Ser un Server Component por defecto (sin `'use client'`)
- Envolver su contenido en `<ModuleWrapper>`
- Usar `getContentForLang()` para resolver textos multilingues
- Usar `<EditableText>` y `<EditableImage>` para campos editables inline

```typescript
// src/components/modules/testimonial-single/TestimonialSingleModule.tsx
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import { EditableText } from '@/components/live-edit/EditableText'
import type { TestimonialSingleContent } from './testimonial-single.types'

export default function TestimonialSingleModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: ModuleProps<TestimonialSingleContent>) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const layout = content.layout ?? 'centered'

  const containerClass =
    layout === 'centered'
      ? 'flex flex-col items-center text-center max-w-2xl mx-auto'
      : layout === 'card'
        ? 'bg-[var(--color-surface)] rounded-2xl p-8 shadow-sm max-w-2xl mx-auto'
        : 'flex flex-col gap-4 max-w-xl'

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="testimonial_single" styles={styles}>
      <div className={containerClass}>
        {/* Rating stars */}
        {content.rating !== undefined && content.rating > 0 && (
          <div className="flex gap-1 mb-4" aria-label={`${content.rating} de 5 estrellas`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                style={{ color: i < content.rating! ? 'var(--color-accent)' : 'var(--color-border)' }}
                aria-hidden="true"
              >
                ★
              </span>
            ))}
          </div>
        )}

        {/* Quote */}
        <EditableText
          as="blockquote"
          sectionKey="testimonial_single"
          fieldPath="quote"
          lang={language}
          value={t(content.quote)}
          className="text-xl italic leading-relaxed mb-6"
          style={{ color: 'var(--color-text-primary)' }}
          placeholder="Cita del testimonio"
        />

        {/* Author info */}
        <div className="flex flex-col items-center gap-1">
          {content.authorAvatar?.url && (
            <img
              src={content.authorAvatar.url}
              alt={t(content.authorAvatar.alt)}
              className="w-14 h-14 rounded-full object-cover mb-2"
              width={56}
              height={56}
            />
          )}

          <EditableText
            as="cite"
            sectionKey="testimonial_single"
            fieldPath="authorName"
            lang={language}
            value={t(content.authorName)}
            className="font-semibold not-italic"
            style={{ color: 'var(--color-text-primary)' }}
            placeholder="Nombre del autor"
          />

          {(content.authorRole ?? content.authorCompany) && (
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
              {t(content.authorRole ?? {})}
              {content.authorRole && content.authorCompany && ' · '}
              {t(content.authorCompany ?? {})}
            </p>
          )}
        </div>
      </div>
    </ModuleWrapper>
  )
}
```

### Reglas del componente

- **`ModuleWrapper`** es obligatorio: gestiona el `id` de la sección, los estilos de padding/maxWidth y el modo de edición drag-and-drop.
- **`EditableText`** activa la edición inline cuando el admin está en modo Live Edit. Props requeridas: `sectionKey`, `fieldPath`, `lang`, `value`.
- **`getContentForLang(field, lang, defaultLang)`** aplica el fallback correcto: `lang → defaultLang → primer idioma disponible`.
- Los estilos de color siempre usan **CSS variables** (`var(--color-primary)`, etc.), nunca valores hardcodeados.
- `'use client'` solo se agrega si el módulo necesita interactividad real (contadores, modales, etc.).

### Crear el archivo index.ts

```typescript
// src/components/modules/testimonial-single/index.ts
export { default } from './TestimonialSingleModule'
```

---

## Paso 5 — Registrar el módulo en el Registry

**Archivo**: `src/lib/modules/registry.ts`

Agregar la entrada en el mapa `registry`. El `key` debe coincidir exactamente con el `section_key` de la DB.

```typescript
// En src/lib/modules/registry.ts — agregar al Map:
[
  'testimonial_single',
  {
    key: 'testimonial_single',
    displayName: 'Testimonio Destacado',
    description: 'Un testimonio de cliente individual con foto y valoración',
    component: asModule(() => import('@/components/modules/testimonial-single') as never),
    category: 'social',   // 'header' | 'content' | 'social' | 'conversion' | 'info' | 'footer'
    isSystem: false,      // true solo para módulos que no se pueden ocultar (ej: footer)
    defaultOrder: 20,
  },
],
```

**Categorías disponibles**:

| Categoría    | Uso típico                                      |
| ------------ | ----------------------------------------------- |
| `header`     | Hero, navbar                                    |
| `content`    | Bloques informativos (features, video, galería) |
| `social`     | Testimonios, logos de clientes, equipo          |
| `conversion` | Formularios, precios, CTA, countdown            |
| `info`       | FAQ, mapa, comparativa                          |
| `footer`     | Footer                                          |

---

## Paso 6 — Agregar la migración SQL

El wizard de setup inserta las filas de `page_modules` y `module_schemas` durante la fase de seed. Para módulos personalizados, agregar el INSERT al archivo de seed o crear una migración nueva.

### Archivo de migración

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_testimonial_single_module.sql

-- 1. Insertar el schema del módulo
INSERT INTO module_schemas (section_key, schema_def, version)
VALUES (
  'testimonial_single',
  '{
    "key": "testimonial_single",
    "name": {"es": "Testimonio Destacado", "en": "Featured Testimonial"},
    "description": {
      "es": "Un testimonio de cliente individual con foto, cita y valoración.",
      "en": "A single customer testimonial with photo, quote, and rating."
    },
    "version": 1,
    "fields": [
      {
        "key": "quote",
        "type": "textarea",
        "label": {"es": "Cita del testimonio", "en": "Testimonial quote"},
        "isMultilingual": true,
        "required": true,
        "validation": {"minLength": 20, "maxLength": 500},
        "order": 1
      },
      {
        "key": "authorName",
        "type": "text",
        "label": {"es": "Nombre del autor", "en": "Author name"},
        "isMultilingual": true,
        "required": true,
        "order": 2
      },
      {
        "key": "rating",
        "type": "number",
        "label": {"es": "Valoración (1-5)", "en": "Rating (1-5)"},
        "isMultilingual": false,
        "required": false,
        "defaultValue": 5,
        "validation": {"min": 1, "max": 5},
        "order": 3
      }
    ]
  }'::jsonb,
  1
)
ON CONFLICT (section_key) DO NOTHING;

-- 2. Insertar la fila del módulo en page_modules
INSERT INTO page_modules (
  section_key,
  display_name,
  display_order,
  is_visible,
  is_system,
  content,
  styles
)
VALUES (
  'testimonial_single',
  '{"es": "Testimonio Destacado", "en": "Featured Testimonial"}'::jsonb,
  20,
  true,
  false,
  '{
    "quote": {
      "es": "Implementar esta solución transformó completamente la manera en que gestionamos nuestros proyectos.",
      "en": "Implementing this solution completely transformed the way we manage our projects."
    },
    "authorName": {"es": "María González", "en": "Maria González"},
    "authorRole": {"es": "Directora de Operaciones", "en": "Operations Director"},
    "authorCompany": {"es": "TechCorp Latam", "en": "TechCorp Latam"},
    "authorAvatar": {"url": "", "alt": {"es": "", "en": ""}},
    "rating": 5,
    "layout": "centered"
  }'::jsonb,
  '{
    "paddingY": "large",
    "paddingX": "medium",
    "maxWidth": "narrow"
  }'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;
```

---

## Paso 7 — Extender el tipo SectionKey

**Archivo**: `src/lib/modules/types.ts`

Agregar la nueva clave al tipo union `SectionKey`:

```typescript
// src/lib/modules/types.ts — actualizar el tipo SectionKey
export type SectionKey =
  | 'hero'
  | 'value_prop'
  // ... resto de claves existentes ...
  | 'map_location'
  | 'testimonial_single' // ← nueva clave
```

---

## Ejemplo completo: módulo `testimonial_single`

Los 6 archivos del módulo de ejemplo están documentados arriba. El resultado final en el filesystem:

```
src/components/modules/testimonial-single/
  index.ts
  TestimonialSingleModule.tsx
  testimonial-single.schema.ts
  testimonial-single.seed.ts
  testimonial-single.types.ts
```

Más la entrada en `src/lib/modules/registry.ts` y la migración SQL.

---

## Checklist de validación

Antes de dar por completado el módulo, verificar:

**Archivos**

- [ ] `{name}.types.ts` — interfaces exportadas correctamente
- [ ] `{name}.schema.ts` — `ModuleSchemaDef` exportado como `const`
- [ ] `{name}.seed.ts` — `ModuleSeed` exportado como `const`
- [ ] `{Name}Module.tsx` — `export default function` (no named export)
- [ ] `index.ts` — re-exporta el componente default

**Registry**

- [ ] Entrada agregada en `registry.ts` con `key` idéntico al `section_key` de la DB
- [ ] `category` definida correctamente
- [ ] `asModule()` wrapping el import dinámico

**Tipos**

- [ ] `SectionKey` actualizado en `types.ts`

**Base de datos**

- [ ] Migración SQL crea la fila en `module_schemas`
- [ ] Migración SQL crea la fila en `page_modules` con contenido seed
- [ ] `ON CONFLICT DO NOTHING` presente para ser idempotente

**Componente**

- [ ] Usa `<ModuleWrapper>` como raíz
- [ ] `sectionKey` prop coincide con `section_key` de la DB
- [ ] Textos multilinguales pasan por `getContentForLang()`
- [ ] Campos editables usan `<EditableText>` o `<EditableImage>`
- [ ] Colores usan CSS variables (`var(--color-*)`)
- [ ] No hay `'use client'` innecesario

**Verificación**

- [ ] `pnpm type-check` sin errores
- [ ] El módulo aparece en la landing page pública
- [ ] El módulo aparece en el panel admin con su formulario generado
- [ ] La edición inline funciona al activar Live Edit
