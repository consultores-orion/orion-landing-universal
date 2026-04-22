# MODULE-SYSTEM.md — Sistema de Modulos de Orion Landing Universal

> **Version**: 1.0.0  
> **Fecha**: 2026-04-04  
> **Estado**: Especificacion definitiva  
> **Audiencia**: Desarrolladores, Claude Code, contribuidores open-source

---

## 1. Vision General

El sistema de modulos es el nucleo arquitectonico de Orion Landing Universal. Cada seccion visible de la landing page (hero, pricing, FAQ, etc.) es un **modulo independiente** que:

- Se registra en un registry central
- Expone un esquema declarativo de sus campos editables
- Recibe su contenido como props desde la base de datos
- Soporta edicion inline y desde el panel admin
- Es activable/desactivable y reordenable sin tocar codigo

### Principios de Diseno

| Principio       | Descripcion                                                                   |
| --------------- | ----------------------------------------------------------------------------- |
| **Autonomia**   | Cada modulo es autocontenido: componente, esquema, seed, tipos                |
| **Declarativo** | El esquema define la interfaz del admin editor automaticamente                |
| **Extensible**  | Agregar un modulo nuevo requiere solo crear una carpeta y registrarlo         |
| **Resiliente**  | El renderer maneja graciosamente modulos faltantes o con errores              |
| **Multilingue** | Todo contenido textual usa la estructura JSONB `{ "es": "...", "en": "..." }` |
| **Tematizable** | Cada modulo respeta las CSS variables del tema activo y acepta overrides      |

---

## 2. Arquitectura del Registry

### 2.1 Estructura de Archivos

```
src/
  components/
    modules/
      hero/
        HeroModule.tsx           # Componente React del modulo
        hero.schema.ts           # Definicion de campos para el editor admin
        hero.seed.ts             # Contenido por defecto multilingue
        hero.types.ts            # Interfaces TypeScript del modulo
        index.ts                 # Exportaciones publicas
      value-prop/
        ValuePropModule.tsx
        value-prop.schema.ts
        value-prop.seed.ts
        value-prop.types.ts
        index.ts
      how-it-works/
        HowItWorksModule.tsx
        how-it-works.schema.ts
        how-it-works.seed.ts
        how-it-works.types.ts
        index.ts
      social-proof/
        SocialProofModule.tsx
        social-proof.schema.ts
        social-proof.seed.ts
        social-proof.types.ts
        index.ts
      client-logos/
        ClientLogosModule.tsx
        client-logos.schema.ts
        client-logos.seed.ts
        client-logos.types.ts
        index.ts
      offer-form/
        OfferFormModule.tsx
        offer-form.schema.ts
        offer-form.seed.ts
        offer-form.types.ts
        index.ts
      faq/
        FaqModule.tsx
        faq.schema.ts
        faq.seed.ts
        faq.types.ts
        index.ts
      final-cta/
        FinalCtaModule.tsx
        final-cta.schema.ts
        final-cta.seed.ts
        final-cta.types.ts
        index.ts
      footer/
        FooterModule.tsx
        footer.schema.ts
        footer.seed.ts
        footer.types.ts
        index.ts
      stats/
        StatsModule.tsx
        stats.schema.ts
        stats.seed.ts
        stats.types.ts
        index.ts
      pricing/
        PricingModule.tsx
        pricing.schema.ts
        pricing.seed.ts
        pricing.types.ts
        index.ts
      video/
        VideoModule.tsx
        video.schema.ts
        video.seed.ts
        video.types.ts
        index.ts
      team/
        TeamModule.tsx
        team.schema.ts
        team.seed.ts
        team.types.ts
        index.ts
      gallery/
        GalleryModule.tsx
        gallery.schema.ts
        gallery.seed.ts
        gallery.types.ts
        index.ts
      features-grid/
        FeaturesGridModule.tsx
        features-grid.schema.ts
        features-grid.seed.ts
        features-grid.types.ts
        index.ts
      countdown/
        CountdownModule.tsx
        countdown.schema.ts
        countdown.seed.ts
        countdown.types.ts
        index.ts
      comparison/
        ComparisonModule.tsx
        comparison.schema.ts
        comparison.seed.ts
        comparison.types.ts
        index.ts
      newsletter/
        NewsletterModule.tsx
        newsletter.schema.ts
        newsletter.seed.ts
        newsletter.types.ts
        index.ts
      map-location/
        MapLocationModule.tsx
        map-location.schema.ts
        map-location.seed.ts
        map-location.types.ts
        index.ts
  lib/
    modules/
      registry.ts              # Registry central: section_key -> modulo
      renderer.tsx             # Motor de renderizado de modulos
      types.ts                 # Tipos compartidos del sistema de modulos
```

### 2.2 Registry Central (`src/lib/modules/registry.ts`)

El registry es un mapa estatico que asocia cada `section_key` (string) con la metadata del modulo correspondiente.

> **OBLIGATORIO: Lazy Loading con `next/dynamic`**
>
> Todos los modulos en el registry DEBEN usar `next/dynamic` con `ssr: true` para su carga. Esto es un requisito de rendimiento **no negociable**:
>
> - **`next/dynamic`** (no `React.lazy`) porque integra correctamente con el bundler de Next.js, soporta SSR y permite code-splitting a nivel de ruta.
> - **`ssr: true`** es obligatorio porque los modulos se renderizan en Server Components y deben incluirse en el HTML inicial para SEO y performance. Sin SSR, el contenido no apareceria en el HTML inicial.
> - Usar `React.lazy` en su lugar causaria errores en Server Components y no soporta SSR nativo de Next.js.
>
> **Prohibido**: `React.lazy()`, imports directos sin dynamic, `ssr: false` (salvo modulos que explicitamente requieran APIs del DOM sin fallback SSR como `map_location`).

```typescript
import dynamic from 'next/dynamic'
import type { ModuleRegistryEntry, ModuleProps } from './types'

// OBLIGATORIO: next/dynamic con ssr: true para todos los modulos
const moduleRegistry: Record<string, ModuleRegistryEntry> = {
  hero: {
    key: 'hero',
    displayName: 'Hero',
    description: 'Seccion principal con titulo, subtitulo, imagen y CTA',
    component: dynamic(() => import('@/components/modules/hero'), { ssr: true }),
    category: 'header',
    isSystem: true,
    defaultOrder: 1,
  },
  value_prop: {
    key: 'value_prop',
    displayName: 'Propuesta de Valor',
    description: 'Destaca los beneficios principales del producto o servicio',
    component: dynamic(() => import('@/components/modules/value-prop'), { ssr: true }),
    category: 'content',
    isSystem: false,
    defaultOrder: 2,
  },
  // ... (los demas 17 modulos siguen el mismo patron — TODOS con dynamic + ssr: true)
}

// NOTA: Los schemas y seeds NO viven en el registry. Cada modulo los define
// en su propia carpeta: hero.schema.ts, hero.seed.ts, etc.
// Ver seccion "Estructura de Archivos por Modulo" para mas detalle.

export function getModule(key: string): ModuleRegistryEntry | undefined {
  return moduleRegistry[key]
}

export function getAllModules(): ModuleRegistryEntry[] {
  return Object.values(moduleRegistry)
}

export function getModulesByCategory(category: string): ModuleRegistryEntry[] {
  return Object.values(moduleRegistry).filter((m) => m.category === category)
}

export { moduleRegistry }
```

### 2.3 Categorias de Modulos

| Categoria    | Modulos                                                                          | Descripcion                       |
| ------------ | -------------------------------------------------------------------------------- | --------------------------------- |
| `header`     | hero                                                                             | Secciones de cabecera/hero        |
| `content`    | value_prop, how_it_works, features_grid, stats, video, team, gallery, comparison | Secciones de contenido principal  |
| `social`     | social_proof, client_logos                                                       | Prueba social y credibilidad      |
| `conversion` | offer_form, pricing, final_cta, countdown, newsletter                            | Secciones orientadas a conversion |
| `info`       | faq, map_location                                                                | Informacion complementaria        |
| `footer`     | footer                                                                           | Pie de pagina                     |

---

## 3. Interfaz de Modulo

### 3.1 Tipos Compartidos (`src/lib/modules/types.ts`)

```typescript
import { type ComponentType } from 'react'

// ============================================================
// TIPOS BASE
// ============================================================

/** Contenido multilingue: claves son codigos ISO 639-1 */
export type MultilingualText = Record<string, string>

/** Contenido multilingue para rich text (HTML) */
export type MultilingualRichText = Record<string, string>

/** URL de imagen con alt text multilingue */
export interface MultilingualImage {
  url: string
  alt: MultilingualText
  width?: number
  height?: number
}

// ============================================================
// MODULE PROPS — Interfaz que todo componente de modulo recibe
// ============================================================

export interface ModuleProps<T = Record<string, unknown>> {
  /** Contenido del modulo, tipado segun el modulo especifico */
  content: T

  /** Estilos personalizados del modulo (overrides de tema) */
  styles: ModuleStyles

  /** ID unico de la instancia del modulo en page_modules */
  moduleId: string

  /** Si true, el modulo esta en modo edicion inline */
  isEditing: boolean

  /** Codigo del idioma actual (ISO 639-1) */
  language: string

  /** Idioma por defecto del sitio */
  defaultLanguage: string

  /** Callback para notificar cambios en el contenido (edicion inline) */
  onContentChange?: (path: string, value: unknown) => void

  /** Callback para notificar cambios en estilos */
  onStyleChange?: (path: string, value: unknown) => void
}

// ============================================================
// MODULE STYLES — Estilos configurables por modulo
// ============================================================

export interface ModuleStyles {
  /** Color de fondo override (hex). Si null, usa el del tema */
  backgroundColor?: string | null

  /** Color de texto override (hex). Si null, usa el del tema */
  textColor?: string | null

  /** URL de imagen de fondo */
  backgroundImage?: string | null

  /** Opacidad del overlay sobre imagen de fondo (0-1) */
  backgroundOverlayOpacity?: number

  /** Padding vertical personalizado */
  paddingY?: 'none' | 'small' | 'medium' | 'large' | 'xlarge'

  /** Padding horizontal personalizado */
  paddingX?: 'none' | 'small' | 'medium' | 'large'

  /** Ancho maximo del contenido */
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'

  /** Estilos adicionales como JSON libre */
  custom?: Record<string, unknown>
}

// ============================================================
// MODULE SCHEMA — Definicion de campos editables
// ============================================================

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'image'
  | 'list'
  | 'number'
  | 'boolean'
  | 'color'
  | 'link'
  | 'date'
  | 'select'

export interface SchemaField {
  /** Clave unica del campo dentro del modulo */
  key: string

  /** Tipo de campo */
  type: FieldType

  /** Etiqueta visible en el editor admin (multilingue) */
  label: MultilingualText

  /** Descripcion/ayuda para el editor (multilingue) */
  description?: MultilingualText

  /** Si true, el campo contiene texto multilingue */
  isMultilingual: boolean

  /** Si true, el campo es obligatorio */
  required: boolean

  /** Valor por defecto */
  defaultValue?: unknown

  /** Validacion adicional */
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }

  /** Para campos tipo 'list': esquema de cada item */
  listItemSchema?: SchemaField[]

  /** Para campos tipo 'select': opciones disponibles */
  selectOptions?: Array<{
    value: string
    label: MultilingualText
  }>

  /** Grupo visual en el editor (para agrupar campos relacionados) */
  group?: string

  /** Orden de aparicion en el editor */
  order?: number
}

export interface ModuleSchema {
  /** section_key del modulo */
  key: string

  /** Nombre legible del modulo */
  name: MultilingualText

  /** Descripcion del modulo */
  description: MultilingualText

  /** Definicion de campos de contenido */
  fields: SchemaField[]

  /** Definicion de campos de estilo adicionales (ademas de los base) */
  styleFields?: SchemaField[]

  /** Version del esquema (para migraciones futuras) */
  version: number
}

// ============================================================
// MODULE SEED — Contenido por defecto
// ============================================================

export interface ModuleSeed {
  /** section_key del modulo */
  key: string

  /** Contenido por defecto (multilingue) */
  content: Record<string, unknown>

  /** Estilos por defecto */
  styles: ModuleStyles

  /** Orden por defecto */
  defaultOrder: number

  /** Si el modulo esta activo por defecto */
  defaultEnabled: boolean
}

// ============================================================
// MODULE REGISTRY ENTRY — Entrada del registry
// ============================================================

export interface ModuleRegistryEntry {
  /** Clave unica del modulo (coincide con section_key en BD) */
  key: string

  /** Nombre legible para mostrar en el admin */
  displayName: string

  /** Descripcion breve */
  description: string

  /**
   * Componente React cargado via next/dynamic con ssr: true.
   * OBLIGATORIO: usar dynamic() de 'next/dynamic', NO React.lazy().
   */
  component: ComponentType<ModuleProps<Record<string, unknown>>>

  /** Categoria del modulo */
  category: ModuleCategory // 'header' | 'content' | 'social' | 'conversion' | 'info' | 'footer'

  /** Si true, no se puede eliminar (pero si desactivar) */
  isSystem: boolean

  /** Orden por defecto al crear una nueva instalacion */
  defaultOrder: number
}

// NOTA: schema y seed NO son parte del registry. Cada modulo los define
// en archivos separados dentro de su carpeta:
//   - components/modules/{name}/{name}.schema.ts  (ModuleSchemaDef)
//   - components/modules/{name}/{name}.seed.ts    (ModuleSeed)
// Esto mantiene el registry liviano y permite lazy loading independiente.
```

### 3.2 Contrato del Componente de Modulo

Todo componente de modulo **DEBE**:

1. Exportar como `default` un componente React que acepte `ModuleProps<T>` donde `T` es su tipo de contenido especifico
2. Ser completamente responsive (mobile-first)
3. Usar CSS variables del tema (nunca hardcodear colores)
4. Respetar los overrides de `styles` (backgroundColor, textColor, backgroundImage)
5. Implementar modo edicion cuando `isEditing === true`:
   - Campos de texto: agregar `contentEditable` o mostrar inputs inline
   - Imagenes: mostrar overlay con boton "Cambiar imagen"
   - Listas: permitir agregar/eliminar/reordenar items
6. Llamar a `onContentChange(path, value)` al modificar contenido en modo edicion
7. Resolver contenido multilingue usando el `language` prop con fallback a `defaultLanguage`
8. Envolver todo en un `<section>` con `id={moduleId}` y `data-module={key}`

**Ejemplo minimo de componente**:

```typescript
// src/components/modules/hero/HeroModule.tsx
'use client';

import { type FC } from 'react';
import type { ModuleProps } from '@/lib/modules/types';
import type { HeroContent } from './hero.types';
import { useModuleText } from '@/lib/modules/hooks';

const HeroModule: FC<ModuleProps<HeroContent>> = ({
  content,
  styles,
  moduleId,
  isEditing,
  language,
  defaultLanguage,
  onContentChange,
}) => {
  const t = useModuleText(content, language, defaultLanguage);

  return (
    <section
      id={moduleId}
      data-module="hero"
      className="relative min-h-[80vh] flex items-center"
      style={{
        backgroundColor: styles.backgroundColor ?? undefined,
        color: styles.textColor ?? undefined,
      }}
    >
      {styles.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${styles.backgroundImage})` }}
        >
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: styles.backgroundOverlayOpacity ?? 0.5 }}
          />
        </div>
      )}
      <div className="container mx-auto px-6 relative z-10">
        <h1
          className="text-4xl md:text-6xl font-bold mb-6 font-heading"
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onContentChange?.('title', {
            ...content.title,
            [language]: e.currentTarget.textContent,
          })}
        >
          {t('title')}
        </h1>
        {/* ... resto del componente */}
      </div>
    </section>
  );
};

export default HeroModule;
```

### 3.3 Server vs Client Component Boundaries

> **Nota S17**: Patrones establecidos durante la integracion y auditoria de modulos.

Los modulos siguen la regla de Next.js: **Server Components por defecto**, `'use client'` solo cuando es necesario (estado, hooks, browser APIs).

**Regla critica para props entre Server → Client Components:**

- **NUNCA** pasar componentes React (funciones) como props de Server a Client Components
- Para iconos: usar string keys con un `iconMap` interno en el Client Component
- Para links con estilo de boton: usar `<Link className={buttonVariants(...)}>` en lugar de `<Button render={<Link>}>`
- **`buttonVariants()` NO se puede usar en Server Components** porque `button.tsx` tiene `'use client'`. Usar clases Tailwind inline equivalentes para links con estilo de botón en Server Components.

Ejemplo de patron correcto para iconos:

```tsx
// Server Component
;<StatsCard icon="users" title="Total" value={42} />

// Client Component (StatsCard)
const iconMap: Record<string, LucideIcon> = { users: Users, puzzle: Puzzle }
const Icon = iconMap[icon] ?? Minus
```

---

## 4. Catalogo de Modulos (19)

### 4.1 Hero (`hero`)

**Proposito**: Seccion principal que capta la atencion inmediata del visitante. Presenta el titulo principal, subtitulo, imagen/video de fondo y un CTA prominente.

**Campos de Contenido**:

| Campo              | Tipo     | Multilingue | Requerido | Descripcion                                            |
| ------------------ | -------- | :---------: | :-------: | ------------------------------------------------------ |
| `title`            | text     |     Si      |    Si     | Titulo principal (H1)                                  |
| `subtitle`         | textarea |     Si      |    No     | Subtitulo o descripcion breve                          |
| `ctaText`          | text     |     Si      |    Si     | Texto del boton CTA principal                          |
| `ctaLink`          | link     |     No      |    Si     | URL destino del CTA (puede ser ancla `#seccion`)       |
| `secondaryCtaText` | text     |     Si      |    No     | Texto del boton CTA secundario                         |
| `secondaryCtaLink` | link     |     No      |    No     | URL destino del CTA secundario                         |
| `backgroundImage`  | image    |     No      |    No     | Imagen de fondo del hero                               |
| `heroImage`        | image    |     No      |    No     | Imagen lateral/ilustrativa                             |
| `badge`            | text     |     Si      |    No     | Texto de badge sobre el titulo (ej: "Nuevo", "Oferta") |

**Opciones de Estilo**:

| Opcion           | Tipo   | Default       | Descripcion                                                           |
| ---------------- | ------ | ------------- | --------------------------------------------------------------------- |
| `layout`         | select | `image-right` | Disposicion: `image-right`, `image-left`, `centered`, `fullscreen-bg` |
| `overlayOpacity` | number | 0.5           | Opacidad del overlay sobre fondo (0-1)                                |
| `minHeight`      | select | `80vh`        | Altura minima: `60vh`, `80vh`, `100vh`                                |
| `textAlign`      | select | `left`        | Alineacion de texto: `left`, `center`, `right`                        |

**Comportamiento Responsive**:

- Desktop (1024px+): Layout segun configuracion (dos columnas si hay heroImage)
- Tablet (768px-1023px): Imagen apilada debajo del texto
- Mobile (<768px): Contenido centrado, imagen oculta o como fondo, CTA full-width

**Contenido por Defecto (Seed)**:

```json
{
  "key": "hero",
  "content": {
    "title": {
      "es": "Transforma tu Presencia Digital",
      "en": "Transform Your Digital Presence"
    },
    "subtitle": {
      "es": "La solucion todo-en-uno para crear landing pages profesionales sin escribir una sola linea de codigo.",
      "en": "The all-in-one solution to create professional landing pages without writing a single line of code."
    },
    "ctaText": {
      "es": "Comenzar Ahora",
      "en": "Get Started Now"
    },
    "ctaLink": "#offer_form",
    "secondaryCtaText": {
      "es": "Ver Demo",
      "en": "View Demo"
    },
    "secondaryCtaLink": "#how_it_works",
    "backgroundImage": null,
    "heroImage": {
      "url": "/images/defaults/hero-illustration.svg",
      "alt": { "es": "Ilustracion de landing page", "en": "Landing page illustration" }
    },
    "badge": {
      "es": "Open Source y Gratuito",
      "en": "Open Source & Free"
    }
  },
  "styles": {
    "backgroundColor": null,
    "textColor": null,
    "backgroundImage": null,
    "backgroundOverlayOpacity": 0.5,
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 1,
  "defaultEnabled": true
}
```

---

### 4.2 Propuesta de Valor (`value_prop`)

**Proposito**: Presenta los beneficios clave del producto/servicio en formato de tarjetas con iconos, destacando por que el visitante deberia elegir esta oferta.

**Campos de Contenido**:

| Campo                 | Tipo     | Multilingue | Requerido | Descripcion                    |
| --------------------- | -------- | :---------: | :-------: | ------------------------------ |
| `title`               | text     |     Si      |    Si     | Titulo de la seccion           |
| `subtitle`            | textarea |     Si      |    No     | Subtitulo descriptivo          |
| `items`               | list     |      -      |    Si     | Lista de beneficios/propuestas |
| `items[].icon`        | text     |     No      |    Si     | Nombre del icono Lucide        |
| `items[].title`       | text     |     Si      |    Si     | Titulo del beneficio           |
| `items[].description` | textarea |     Si      |    Si     | Descripcion del beneficio      |

**Opciones de Estilo**:

| Opcion      | Tipo   | Default            | Descripcion                                                |
| ----------- | ------ | ------------------ | ---------------------------------------------------------- |
| `columns`   | select | `3`                | Columnas en desktop: `2`, `3`, `4`                         |
| `cardStyle` | select | `elevated`         | Estilo de tarjeta: `elevated`, `bordered`, `flat`, `glass` |
| `iconColor` | color  | null (usa primary) | Color de los iconos                                        |

**Comportamiento Responsive**:

- Desktop: Grid de N columnas segun configuracion
- Tablet: 2 columnas
- Mobile: 1 columna, tarjetas apiladas

**Contenido por Defecto (Seed)**:

```json
{
  "key": "value_prop",
  "content": {
    "title": {
      "es": "Por Que Elegirnos",
      "en": "Why Choose Us"
    },
    "subtitle": {
      "es": "Todo lo que necesitas para crear una presencia digital profesional",
      "en": "Everything you need to create a professional digital presence"
    },
    "items": [
      {
        "icon": "Zap",
        "title": { "es": "Rapido y Facil", "en": "Fast & Easy" },
        "description": {
          "es": "Configura tu landing page en minutos, sin necesidad de conocimientos tecnicos.",
          "en": "Set up your landing page in minutes, no technical knowledge required."
        }
      },
      {
        "icon": "Palette",
        "title": { "es": "Totalmente Personalizable", "en": "Fully Customizable" },
        "description": {
          "es": "20 paletas de colores predefinidas y personalizacion completa desde el panel admin.",
          "en": "20 predefined color palettes and full customization from the admin panel."
        }
      },
      {
        "icon": "Globe",
        "title": { "es": "Multilingue", "en": "Multilingual" },
        "description": {
          "es": "Soporte nativo para multiples idiomas, gestionado completamente desde el navegador.",
          "en": "Native support for multiple languages, fully managed from the browser."
        }
      }
    ]
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 2,
  "defaultEnabled": true
}
```

---

### 4.3 Como Funciona (`how_it_works`)

**Proposito**: Explica el proceso o metodologia en pasos numerados, guiando al visitante a entender como funciona el producto/servicio.

**Campos de Contenido**:

| Campo                 | Tipo     | Multilingue | Requerido | Descripcion                     |
| --------------------- | -------- | :---------: | :-------: | ------------------------------- |
| `title`               | text     |     Si      |    Si     | Titulo de la seccion            |
| `subtitle`            | textarea |     Si      |    No     | Subtitulo descriptivo           |
| `steps`               | list     |      -      |    Si     | Lista de pasos                  |
| `steps[].number`      | number   |     No      |    Si     | Numero del paso (auto-generado) |
| `steps[].title`       | text     |     Si      |    Si     | Titulo del paso                 |
| `steps[].description` | textarea |     Si      |    Si     | Descripcion del paso            |
| `steps[].image`       | image    |     No      |    No     | Imagen ilustrativa del paso     |
| `steps[].icon`        | text     |     No      |    No     | Icono alternativo a la imagen   |

**Opciones de Estilo**:

| Opcion           | Tipo    | Default      | Descripcion                                            |
| ---------------- | ------- | ------------ | ------------------------------------------------------ |
| `layout`         | select  | `horizontal` | Disposicion: `horizontal`, `vertical`, `alternating`   |
| `showConnectors` | boolean | true         | Mostrar lineas/flechas conectoras entre pasos          |
| `numberStyle`    | select  | `circle`     | Estilo del numero: `circle`, `square`, `badge`, `none` |

**Comportamiento Responsive**:

- Desktop: Layout segun configuracion
- Tablet: Vertical siempre
- Mobile: Vertical con pasos apilados

**Contenido por Defecto (Seed)**:

```json
{
  "key": "how_it_works",
  "content": {
    "title": {
      "es": "Como Funciona",
      "en": "How It Works"
    },
    "subtitle": {
      "es": "Tres simples pasos para tener tu landing page profesional",
      "en": "Three simple steps to have your professional landing page"
    },
    "steps": [
      {
        "number": 1,
        "title": { "es": "Conecta Supabase", "en": "Connect Supabase" },
        "description": {
          "es": "Ingresa las credenciales de tu proyecto Supabase y el wizard configurara todo automaticamente.",
          "en": "Enter your Supabase project credentials and the wizard will set up everything automatically."
        },
        "image": null,
        "icon": "Database"
      },
      {
        "number": 2,
        "title": { "es": "Personaliza tu Contenido", "en": "Customize Your Content" },
        "description": {
          "es": "Usa el panel admin para editar textos, imagenes, colores y configurar tus modulos.",
          "en": "Use the admin panel to edit text, images, colors and configure your modules."
        },
        "image": null,
        "icon": "PenTool"
      },
      {
        "number": 3,
        "title": { "es": "Publica y Comparte", "en": "Publish & Share" },
        "description": {
          "es": "Tu landing page esta lista. Desplegala en Vercel, Docker o Netlify con un clic.",
          "en": "Your landing page is ready. Deploy it on Vercel, Docker or Netlify with one click."
        },
        "image": null,
        "icon": "Rocket"
      }
    ]
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 3,
  "defaultEnabled": true
}
```

---

### 4.4 Prueba Social (`social_proof`)

**Proposito**: Muestra testimonios de clientes satisfechos para generar confianza y credibilidad.

**Campos de Contenido**:

| Campo                          | Tipo     | Multilingue | Requerido | Descripcion                  |
| ------------------------------ | -------- | :---------: | :-------: | ---------------------------- |
| `title`                        | text     |     Si      |    Si     | Titulo de la seccion         |
| `subtitle`                     | textarea |     Si      |    No     | Subtitulo descriptivo        |
| `testimonials`                 | list     |      -      |    Si     | Lista de testimonios         |
| `testimonials[].quote`         | textarea |     Si      |    Si     | Texto del testimonio         |
| `testimonials[].authorName`    | text     |     No      |    Si     | Nombre del autor             |
| `testimonials[].authorRole`    | text     |     Si      |    No     | Cargo o rol                  |
| `testimonials[].authorCompany` | text     |     No      |    No     | Empresa del autor            |
| `testimonials[].authorImage`   | image    |     No      |    No     | Foto del autor               |
| `testimonials[].rating`        | number   |     No      |    No     | Calificacion (1-5 estrellas) |

**Opciones de Estilo**:

| Opcion          | Tipo    | Default    | Descripcion                                |
| --------------- | ------- | ---------- | ------------------------------------------ |
| `layout`        | select  | `carousel` | Disposicion: `carousel`, `grid`, `masonry` |
| `showRating`    | boolean | true       | Mostrar estrellas de calificacion          |
| `autoplay`      | boolean | true       | Autoplay del carrusel                      |
| `autoplaySpeed` | number  | 5000       | Velocidad del autoplay en ms               |

**Comportamiento Responsive**:

- Desktop: Segun layout (carousel con 3 visibles, grid 3 columnas, masonry 3 columnas)
- Tablet: Carousel 2 visibles o grid 2 columnas
- Mobile: 1 testimonio visible, swipe

**Contenido por Defecto (Seed)**:

```json
{
  "key": "social_proof",
  "content": {
    "title": {
      "es": "Lo Que Dicen Nuestros Clientes",
      "en": "What Our Clients Say"
    },
    "subtitle": {
      "es": "Historias reales de usuarios que transformaron su presencia digital",
      "en": "Real stories from users who transformed their digital presence"
    },
    "testimonials": [
      {
        "quote": {
          "es": "Increible lo facil que fue crear mi landing page. En menos de una hora tenia todo configurado.",
          "en": "Incredible how easy it was to create my landing page. In less than an hour I had everything set up."
        },
        "authorName": "Maria Garcia",
        "authorRole": { "es": "Directora de Marketing", "en": "Marketing Director" },
        "authorCompany": "TechStart",
        "authorImage": null,
        "rating": 5
      },
      {
        "quote": {
          "es": "El panel de administracion es muy intuitivo. Puedo actualizar el contenido sin depender de nadie.",
          "en": "The admin panel is very intuitive. I can update the content without depending on anyone."
        },
        "authorName": "Carlos Rodriguez",
        "authorRole": { "es": "CEO", "en": "CEO" },
        "authorCompany": "Innova Solutions",
        "authorImage": null,
        "rating": 5
      },
      {
        "quote": {
          "es": "El soporte multilingue es fantastico. Ahora atendemos clientes en tres idiomas diferentes.",
          "en": "The multilingual support is fantastic. We now serve clients in three different languages."
        },
        "authorName": "Ana Martinez",
        "authorRole": { "es": "Gerente de Operaciones", "en": "Operations Manager" },
        "authorCompany": "Global Connect",
        "authorImage": null,
        "rating": 5
      }
    ]
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 4,
  "defaultEnabled": true
}
```

---

### 4.5 Logos de Clientes (`client_logos`)

**Proposito**: Muestra un marquee/carrusel de logos de clientes o partners para reforzar la confianza.

**Campos de Contenido**:

| Campo           | Tipo  | Multilingue | Requerido | Descripcion                                     |
| --------------- | ----- | :---------: | :-------: | ----------------------------------------------- |
| `title`         | text  |     Si      |    No     | Titulo opcional sobre los logos                 |
| `logos`         | list  |      -      |    Si     | Lista de logos                                  |
| `logos[].image` | image |     No      |    Si     | Imagen del logo                                 |
| `logos[].name`  | text  |     No      |    Si     | Nombre de la empresa (para alt y accesibilidad) |
| `logos[].url`   | link  |     No      |    No     | URL del sitio de la empresa                     |

**Opciones de Estilo**:

| Opcion          | Tipo    | Default   | Descripcion                                  |
| --------------- | ------- | --------- | -------------------------------------------- |
| `layout`        | select  | `marquee` | Disposicion: `marquee`, `grid`, `single-row` |
| `speed`         | number  | 40        | Velocidad del marquee en segundos            |
| `pauseOnHover`  | boolean | true      | Pausar marquee al pasar el mouse             |
| `grayscale`     | boolean | true      | Logos en escala de grises (color al hover)   |
| `logoMaxHeight` | number  | 48        | Altura maxima de cada logo en px             |

**Comportamiento Responsive**:

- Desktop: Marquee con N logos visibles segun ancho
- Tablet: Misma animacion, menos logos visibles
- Mobile: Marquee mas lento, logos mas pequenos

**Contenido por Defecto (Seed)**:

```json
{
  "key": "client_logos",
  "content": {
    "title": {
      "es": "Confian en Nosotros",
      "en": "They Trust Us"
    },
    "logos": [
      {
        "image": {
          "url": "/images/defaults/logo-placeholder-1.svg",
          "alt": { "es": "Logo empresa 1", "en": "Company logo 1" }
        },
        "name": "TechCorp",
        "url": null
      },
      {
        "image": {
          "url": "/images/defaults/logo-placeholder-2.svg",
          "alt": { "es": "Logo empresa 2", "en": "Company logo 2" }
        },
        "name": "InnovateCo",
        "url": null
      },
      {
        "image": {
          "url": "/images/defaults/logo-placeholder-3.svg",
          "alt": { "es": "Logo empresa 3", "en": "Company logo 3" }
        },
        "name": "DesignHub",
        "url": null
      },
      {
        "image": {
          "url": "/images/defaults/logo-placeholder-4.svg",
          "alt": { "es": "Logo empresa 4", "en": "Company logo 4" }
        },
        "name": "CloudBase",
        "url": null
      },
      {
        "image": {
          "url": "/images/defaults/logo-placeholder-5.svg",
          "alt": { "es": "Logo empresa 5", "en": "Company logo 5" }
        },
        "name": "DataFlow",
        "url": null
      }
    ]
  },
  "styles": {
    "paddingY": "medium",
    "maxWidth": "wide"
  },
  "defaultOrder": 5,
  "defaultEnabled": true
}
```

---

### 4.6 Formulario de Oferta / Contacto (`offer_form`)

**Proposito**: Formulario de captura de leads. Seccion critica de conversion que recopila datos del visitante.

**Campos de Contenido**:

| Campo                      | Tipo     | Multilingue | Requerido | Descripcion                                                          |
| -------------------------- | -------- | :---------: | :-------: | -------------------------------------------------------------------- |
| `title`                    | text     |     Si      |    Si     | Titulo del formulario                                                |
| `subtitle`                 | textarea |     Si      |    No     | Subtitulo o descripcion                                              |
| `submitButtonText`         | text     |     Si      |    Si     | Texto del boton enviar                                               |
| `successMessage`           | textarea |     Si      |    Si     | Mensaje tras envio exitoso                                           |
| `errorMessage`             | textarea |     Si      |    Si     | Mensaje si hay error                                                 |
| `fields`                   | list     |      -      |    Si     | Campos del formulario                                                |
| `fields[].type`            | select   |     No      |    Si     | Tipo: `text`, `email`, `phone`, `textarea`, `select`, `date`, `time` |
| `fields[].label`           | text     |     Si      |    Si     | Etiqueta del campo                                                   |
| `fields[].placeholder`     | text     |     Si      |    No     | Placeholder del campo                                                |
| `fields[].required`        | boolean  |     No      |    Si     | Si es obligatorio                                                    |
| `fields[].options`         | list     |      -      |    No     | Opciones para campos select                                          |
| `fields[].options[].label` | text     |     Si      |    Si     | Texto de la opcion                                                   |
| `fields[].options[].value` | text     |     No      |    Si     | Valor de la opcion                                                   |
| `consentText`              | richtext |     Si      |    No     | Texto de consentimiento GDPR                                         |
| `showConsent`              | boolean  |     No      |    No     | Mostrar checkbox de consentimiento                                   |

**Opciones de Estilo**:

| Opcion           | Tipo   | Default   | Descripcion                                                  |
| ---------------- | ------ | --------- | ------------------------------------------------------------ |
| `layout`         | select | `split`   | Disposicion: `split` (texto + form), `centered`, `fullwidth` |
| `formBackground` | color  | null      | Color de fondo del area del formulario                       |
| `buttonStyle`    | select | `primary` | Estilo del boton: `primary`, `gradient`, `outline`           |

**Comportamiento Responsive**:

- Desktop: Layout segun configuracion
- Tablet: Formulario centrado
- Mobile: Campos full-width, apilados

**Logica de Backend**:

- Al enviar, crear registro en tabla `leads` con todos los campos
- Disparar notificacion por email si SMTP esta configurado
- Disparar evento para Meta Pixel y GA4 si estan configurados
- Rate limiting: maximo 5 envios por IP por hora

**Contenido por Defecto (Seed)**:

```json
{
  "key": "offer_form",
  "content": {
    "title": {
      "es": "Solicita tu Consulta Gratuita",
      "en": "Request Your Free Consultation"
    },
    "subtitle": {
      "es": "Completa el formulario y te contactaremos en menos de 24 horas",
      "en": "Fill out the form and we will contact you within 24 hours"
    },
    "submitButtonText": {
      "es": "Enviar Solicitud",
      "en": "Send Request"
    },
    "successMessage": {
      "es": "Gracias por tu interes. Te contactaremos pronto.",
      "en": "Thank you for your interest. We will contact you soon."
    },
    "errorMessage": {
      "es": "Hubo un error al enviar. Por favor intenta de nuevo.",
      "en": "There was an error sending. Please try again."
    },
    "fields": [
      {
        "type": "text",
        "label": { "es": "Nombre completo", "en": "Full name" },
        "placeholder": { "es": "Tu nombre", "en": "Your name" },
        "required": true
      },
      {
        "type": "email",
        "label": { "es": "Correo electronico", "en": "Email address" },
        "placeholder": { "es": "tu@email.com", "en": "you@email.com" },
        "required": true
      },
      {
        "type": "phone",
        "label": { "es": "Telefono", "en": "Phone" },
        "placeholder": { "es": "+34 600 000 000", "en": "+1 555 000 0000" },
        "required": false
      },
      {
        "type": "textarea",
        "label": { "es": "Mensaje", "en": "Message" },
        "placeholder": {
          "es": "Cuentanos sobre tu proyecto...",
          "en": "Tell us about your project..."
        },
        "required": false
      }
    ],
    "consentText": {
      "es": "Acepto la <a href='/privacy'>politica de privacidad</a> y el tratamiento de mis datos.",
      "en": "I accept the <a href='/privacy'>privacy policy</a> and the processing of my data."
    },
    "showConsent": true
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 6,
  "defaultEnabled": true
}
```

---

### 4.7 Preguntas Frecuentes (`faq`)

**Proposito**: Seccion de preguntas y respuestas frecuentes en formato acordeon. Reduce objeciones y consultas repetitivas.

**Campos de Contenido**:

| Campo              | Tipo     | Multilingue | Requerido | Descripcion                    |
| ------------------ | -------- | :---------: | :-------: | ------------------------------ |
| `title`            | text     |     Si      |    Si     | Titulo de la seccion           |
| `subtitle`         | textarea |     Si      |    No     | Subtitulo descriptivo          |
| `items`            | list     |      -      |    Si     | Lista de preguntas/respuestas  |
| `items[].question` | text     |     Si      |    Si     | Pregunta                       |
| `items[].answer`   | richtext |     Si      |    Si     | Respuesta (acepta HTML basico) |

**Opciones de Estilo**:

| Opcion           | Tipo   | Default         | Descripcion                                                                   |
| ---------------- | ------ | --------------- | ----------------------------------------------------------------------------- |
| `layout`         | select | `single-column` | Disposicion: `single-column`, `two-columns`                                   |
| `expandBehavior` | select | `single`        | Comportamiento: `single` (una abierta a la vez), `multiple` (varias abiertas) |
| `defaultOpen`    | number | 0               | Indice del item abierto por defecto (-1 para ninguno)                         |

**Comportamiento Responsive**:

- Desktop: Segun layout
- Tablet: Siempre una columna
- Mobile: Una columna, items con padding reducido

**Contenido por Defecto (Seed)**:

```json
{
  "key": "faq",
  "content": {
    "title": {
      "es": "Preguntas Frecuentes",
      "en": "Frequently Asked Questions"
    },
    "subtitle": {
      "es": "Encuentra respuestas a las preguntas mas comunes",
      "en": "Find answers to the most common questions"
    },
    "items": [
      {
        "question": { "es": "Es realmente gratuito?", "en": "Is it really free?" },
        "answer": {
          "es": "Si, Orion Landing Universal es 100% open-source y gratuito bajo licencia MIT. Solo necesitas un proyecto Supabase (que tiene un tier gratuito generoso) y un hosting.",
          "en": "Yes, Orion Landing Universal is 100% open-source and free under MIT license. You only need a Supabase project (which has a generous free tier) and hosting."
        }
      },
      {
        "question": { "es": "Necesito saber programar?", "en": "Do I need to know how to code?" },
        "answer": {
          "es": "No. Todo se configura desde el navegador: contenido, colores, modulos, idiomas, SEO e integraciones. El wizard te guia paso a paso.",
          "en": "No. Everything is configured from the browser: content, colors, modules, languages, SEO and integrations. The wizard guides you step by step."
        }
      },
      {
        "question": { "es": "Puedo usar mi propio dominio?", "en": "Can I use my own domain?" },
        "answer": {
          "es": "Por supuesto. Despliega en Vercel, Netlify o Docker y conecta tu dominio personalizado segun las instrucciones de tu hosting.",
          "en": "Of course. Deploy on Vercel, Netlify or Docker and connect your custom domain following your hosting provider's instructions."
        }
      },
      {
        "question": { "es": "Que pasa con mis datos?", "en": "What happens with my data?" },
        "answer": {
          "es": "Tus datos estan en tu propio proyecto Supabase. Tu tienes el control total. Nadie mas tiene acceso a tu base de datos.",
          "en": "Your data is in your own Supabase project. You have full control. Nobody else has access to your database."
        }
      }
    ]
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "narrow"
  },
  "defaultOrder": 7,
  "defaultEnabled": true
}
```

---

### 4.8 CTA Final (`final_cta`)

**Proposito**: Llamada a la accion final antes del footer. Seccion de cierre que refuerza el mensaje principal y empuja a la conversion.

**Campos de Contenido**:

| Campo             | Tipo     | Multilingue | Requerido | Descripcion                     |
| ----------------- | -------- | :---------: | :-------: | ------------------------------- |
| `title`           | text     |     Si      |    Si     | Titulo del CTA                  |
| `subtitle`        | textarea |     Si      |    No     | Subtitulo o mensaje de urgencia |
| `ctaText`         | text     |     Si      |    Si     | Texto del boton                 |
| `ctaLink`         | link     |     No      |    Si     | URL destino del CTA             |
| `backgroundImage` | image    |     No      |    No     | Imagen de fondo                 |

**Opciones de Estilo**:

| Opcion      | Tipo   | Default    | Descripcion                                               |
| ----------- | ------ | ---------- | --------------------------------------------------------- |
| `style`     | select | `gradient` | Estilo visual: `gradient`, `solid`, `image-bg`, `minimal` |
| `textAlign` | select | `center`   | Alineacion: `center`, `left`                              |

**Comportamiento Responsive**:

- Todos los breakpoints: Contenido centrado, boton prominente

**Contenido por Defecto (Seed)**:

```json
{
  "key": "final_cta",
  "content": {
    "title": {
      "es": "Listo para Empezar?",
      "en": "Ready to Get Started?"
    },
    "subtitle": {
      "es": "Crea tu landing page profesional en minutos. Gratis y sin compromisos.",
      "en": "Create your professional landing page in minutes. Free and no strings attached."
    },
    "ctaText": {
      "es": "Comenzar Ahora",
      "en": "Get Started Now"
    },
    "ctaLink": "#offer_form",
    "backgroundImage": null
  },
  "styles": {
    "paddingY": "xlarge",
    "maxWidth": "narrow"
  },
  "defaultOrder": 8,
  "defaultEnabled": true
}
```

---

### 4.9 Footer (`footer`)

**Proposito**: Pie de pagina con informacion de contacto, links de navegacion, redes sociales y copyright.

**Campos de Contenido**:

| Campo                     | Tipo     | Multilingue | Requerido | Descripcion                                                                               |
| ------------------------- | -------- | :---------: | :-------: | ----------------------------------------------------------------------------------------- |
| `companyName`             | text     |     No      |    Si     | Nombre de la empresa                                                                      |
| `description`             | textarea |     Si      |    No     | Descripcion breve de la empresa                                                           |
| `contactEmail`            | text     |     No      |    No     | Email de contacto                                                                         |
| `contactPhone`            | text     |     No      |    No     | Telefono de contacto                                                                      |
| `contactAddress`          | text     |     Si      |    No     | Direccion fisica                                                                          |
| `socialLinks`             | list     |      -      |    No     | Redes sociales                                                                            |
| `socialLinks[].platform`  | select   |     No      |    Si     | Plataforma: `facebook`, `instagram`, `twitter`, `linkedin`, `youtube`, `tiktok`, `github` |
| `socialLinks[].url`       | link     |     No      |    Si     | URL del perfil                                                                            |
| `navigationLinks`         | list     |      -      |    No     | Links de navegacion adicionales                                                           |
| `navigationLinks[].label` | text     |     Si      |    Si     | Texto del link                                                                            |
| `navigationLinks[].url`   | link     |     No      |    Si     | URL destino                                                                               |
| `copyrightText`           | text     |     Si      |    No     | Texto de copyright personalizado                                                          |
| `logo`                    | image    |     No      |    No     | Logo del footer (puede ser diferente al header)                                           |

**Opciones de Estilo**:

| Opcion        | Tipo    | Default        | Descripcion                                   |
| ------------- | ------- | -------------- | --------------------------------------------- |
| `layout`      | select  | `multi-column` | Layout: `multi-column`, `centered`, `minimal` |
| `showDivider` | boolean | true           | Linea divisoria sobre el footer               |

**Comportamiento Responsive**:

- Desktop: Multi-columna (logo+desc, links, contacto, redes)
- Tablet: 2 columnas
- Mobile: Una columna, todo centrado

**Contenido por Defecto (Seed)**:

```json
{
  "key": "footer",
  "content": {
    "companyName": "Orion Landing",
    "description": {
      "es": "Plataforma open-source para crear landing pages profesionales autogestionables.",
      "en": "Open-source platform to create self-managed professional landing pages."
    },
    "contactEmail": "contacto@ejemplo.com",
    "contactPhone": "+34 600 000 000",
    "contactAddress": {
      "es": "Calle Ejemplo 123, Madrid, Espana",
      "en": "123 Example Street, Madrid, Spain"
    },
    "socialLinks": [
      { "platform": "github", "url": "https://github.com/orion-landing" },
      { "platform": "twitter", "url": "https://twitter.com/orion_landing" },
      { "platform": "linkedin", "url": "https://linkedin.com/company/orion-landing" }
    ],
    "navigationLinks": [
      { "label": { "es": "Politica de Privacidad", "en": "Privacy Policy" }, "url": "/privacy" },
      { "label": { "es": "Terminos de Uso", "en": "Terms of Use" }, "url": "/terms" }
    ],
    "copyrightText": {
      "es": "Todos los derechos reservados.",
      "en": "All rights reserved."
    },
    "logo": null
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 19,
  "defaultEnabled": true
}
```

---

### 4.10 Estadisticas (`stats`)

**Proposito**: Muestra numeros impactantes y metricas clave en formato de contadores animados para generar credibilidad.

**Campos de Contenido**:

| Campo            | Tipo   | Multilingue | Requerido | Descripcion                     |
| ---------------- | ------ | :---------: | :-------: | ------------------------------- |
| `title`          | text   |     Si      |    No     | Titulo de la seccion (opcional) |
| `items`          | list   |      -      |    Si     | Lista de estadisticas           |
| `items[].value`  | number |     No      |    Si     | Valor numerico                  |
| `items[].prefix` | text   |     No      |    No     | Prefijo (ej: "$", "+")          |
| `items[].suffix` | text   |     No      |    No     | Sufijo (ej: "%", "K", "+")      |
| `items[].label`  | text   |     Si      |    Si     | Etiqueta descriptiva            |
| `items[].icon`   | text   |     No      |    No     | Icono Lucide opcional           |

**Opciones de Estilo**:

| Opcion              | Tipo    | Default | Descripcion                               |
| ------------------- | ------- | ------- | ----------------------------------------- |
| `columns`           | select  | `4`     | Columnas: `2`, `3`, `4`                   |
| `animated`          | boolean | true    | Animacion de conteo al entrar en viewport |
| `animationDuration` | number  | 2000    | Duracion de la animacion en ms            |
| `dividers`          | boolean | true    | Divisores entre items                     |

**Comportamiento Responsive**:

- Desktop: Grid de N columnas
- Tablet: 2 columnas
- Mobile: 2 columnas (compact) o 1 columna

**Contenido por Defecto (Seed)**:

```json
{
  "key": "stats",
  "content": {
    "title": {
      "es": "Numeros que Hablan",
      "en": "Numbers That Speak"
    },
    "items": [
      {
        "value": 500,
        "prefix": "+",
        "suffix": "",
        "label": { "es": "Proyectos Creados", "en": "Projects Created" },
        "icon": "Layers"
      },
      {
        "value": 98,
        "prefix": "",
        "suffix": "%",
        "label": { "es": "Satisfaccion", "en": "Satisfaction" },
        "icon": "Heart"
      },
      {
        "value": 50,
        "prefix": "+",
        "suffix": "",
        "label": { "es": "Paises", "en": "Countries" },
        "icon": "Globe"
      },
      {
        "value": 24,
        "prefix": "",
        "suffix": "/7",
        "label": { "es": "Soporte Disponible", "en": "Support Available" },
        "icon": "Headphones"
      }
    ]
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 10,
  "defaultEnabled": false
}
```

---

### 4.11 Precios (`pricing`)

**Proposito**: Tabla comparativa de planes o precios. Permite al visitante seleccionar el plan que mejor se adapte a sus necesidades.

**Campos de Contenido**:

| Campo                         | Tipo     | Multilingue | Requerido | Descripcion                                         |
| ----------------------------- | -------- | :---------: | :-------: | --------------------------------------------------- |
| `title`                       | text     |     Si      |    Si     | Titulo de la seccion                                |
| `subtitle`                    | textarea |     Si      |    No     | Subtitulo descriptivo                               |
| `plans`                       | list     |      -      |    Si     | Lista de planes                                     |
| `plans[].name`                | text     |     Si      |    Si     | Nombre del plan                                     |
| `plans[].price`               | text     |     Si      |    Si     | Precio (texto libre para "Gratis", "$29/mes", etc.) |
| `plans[].period`              | text     |     Si      |    No     | Periodo (ej: "/mes", "/ano")                        |
| `plans[].description`         | textarea |     Si      |    No     | Descripcion del plan                                |
| `plans[].features`            | list     |      -      |    Si     | Lista de caracteristicas                            |
| `plans[].features[].text`     | text     |     Si      |    Si     | Texto de la caracteristica                          |
| `plans[].features[].included` | boolean  |     No      |    Si     | Si esta incluida o no                               |
| `plans[].ctaText`             | text     |     Si      |    Si     | Texto del boton                                     |
| `plans[].ctaLink`             | link     |     No      |    Si     | URL del boton                                       |
| `plans[].isHighlighted`       | boolean  |     No      |    No     | Plan destacado (recomendado)                        |
| `plans[].badge`               | text     |     Si      |    No     | Badge (ej: "Mas popular", "Mejor valor")            |
| `showToggle`                  | boolean  |     No      |    No     | Mostrar toggle mensual/anual                        |
| `annualDiscount`              | text     |     Si      |    No     | Texto del descuento anual                           |

**Opciones de Estilo**:

| Opcion           | Tipo   | Default    | Descripcion                                                          |
| ---------------- | ------ | ---------- | -------------------------------------------------------------------- |
| `columns`        | select | `3`        | Columnas: `2`, `3`, `4`                                              |
| `highlightStyle` | select | `border`   | Estilo del plan destacado: `border`, `elevated`, `gradient`, `scale` |
| `cardStyle`      | select | `bordered` | Estilo de tarjeta: `bordered`, `elevated`, `flat`                    |

**Comportamiento Responsive**:

- Desktop: Grid de N columnas, plan destacado escalado
- Tablet: 2 columnas o scroll horizontal
- Mobile: 1 columna, cards apiladas, plan destacado primero

**Contenido por Defecto (Seed)**:

```json
{
  "key": "pricing",
  "content": {
    "title": {
      "es": "Planes y Precios",
      "en": "Plans & Pricing"
    },
    "subtitle": {
      "es": "Elige el plan que mejor se adapte a tus necesidades",
      "en": "Choose the plan that best fits your needs"
    },
    "plans": [
      {
        "name": { "es": "Basico", "en": "Basic" },
        "price": { "es": "Gratis", "en": "Free" },
        "period": null,
        "description": {
          "es": "Perfecto para proyectos personales",
          "en": "Perfect for personal projects"
        },
        "features": [
          { "text": { "es": "1 landing page", "en": "1 landing page" }, "included": true },
          { "text": { "es": "9 modulos basicos", "en": "9 basic modules" }, "included": true },
          { "text": { "es": "2 idiomas", "en": "2 languages" }, "included": true },
          { "text": { "es": "Soporte comunitario", "en": "Community support" }, "included": true },
          { "text": { "es": "Modulos premium", "en": "Premium modules" }, "included": false }
        ],
        "ctaText": { "es": "Comenzar Gratis", "en": "Start Free" },
        "ctaLink": "#offer_form",
        "isHighlighted": false,
        "badge": null
      },
      {
        "name": { "es": "Profesional", "en": "Professional" },
        "price": { "es": "$29", "en": "$29" },
        "period": { "es": "/mes", "en": "/month" },
        "description": { "es": "Para negocios en crecimiento", "en": "For growing businesses" },
        "features": [
          { "text": { "es": "1 landing page", "en": "1 landing page" }, "included": true },
          {
            "text": { "es": "19 modulos completos", "en": "19 complete modules" },
            "included": true
          },
          { "text": { "es": "Idiomas ilimitados", "en": "Unlimited languages" }, "included": true },
          { "text": { "es": "Soporte prioritario", "en": "Priority support" }, "included": true },
          {
            "text": { "es": "Integraciones avanzadas", "en": "Advanced integrations" },
            "included": true
          }
        ],
        "ctaText": { "es": "Elegir Plan", "en": "Choose Plan" },
        "ctaLink": "#offer_form",
        "isHighlighted": true,
        "badge": { "es": "Mas Popular", "en": "Most Popular" }
      },
      {
        "name": { "es": "Empresarial", "en": "Enterprise" },
        "price": { "es": "$99", "en": "$99" },
        "period": { "es": "/mes", "en": "/month" },
        "description": {
          "es": "Soluciones a medida para grandes equipos",
          "en": "Custom solutions for large teams"
        },
        "features": [
          {
            "text": { "es": "Todo lo del plan Pro", "en": "Everything in Pro plan" },
            "included": true
          },
          { "text": { "es": "White-label", "en": "White-label" }, "included": true },
          { "text": { "es": "SLA garantizado", "en": "Guaranteed SLA" }, "included": true },
          { "text": { "es": "Soporte dedicado", "en": "Dedicated support" }, "included": true },
          {
            "text": { "es": "Personalizacion avanzada", "en": "Advanced customization" },
            "included": true
          }
        ],
        "ctaText": { "es": "Contactar Ventas", "en": "Contact Sales" },
        "ctaLink": "#offer_form",
        "isHighlighted": false,
        "badge": null
      }
    ],
    "showToggle": false,
    "annualDiscount": null
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 11,
  "defaultEnabled": false
}
```

---

### 4.12 Video (`video`)

**Proposito**: Seccion dedicada a mostrar un video explicativo, demo, o presentacion. Soporta YouTube, Vimeo y video propio.

**Campos de Contenido**:

| Campo            | Tipo     | Multilingue | Requerido | Descripcion                                       |
| ---------------- | -------- | :---------: | :-------: | ------------------------------------------------- |
| `title`          | text     |     Si      |    No     | Titulo de la seccion                              |
| `subtitle`       | textarea |     Si      |    No     | Subtitulo descriptivo                             |
| `videoUrl`       | link     |     No      |    Si     | URL del video (YouTube, Vimeo, o archivo directo) |
| `thumbnailImage` | image    |     No      |    No     | Imagen de portada antes de reproducir             |
| `caption`        | textarea |     Si      |    No     | Texto descriptivo debajo del video                |

**Opciones de Estilo**:

| Opcion         | Tipo    | Default   | Descripcion                               |
| -------------- | ------- | --------- | ----------------------------------------- |
| `aspectRatio`  | select  | `16:9`    | Aspecto: `16:9`, `4:3`, `1:1`, `21:9`     |
| `maxWidth`     | select  | `default` | Ancho maximo: `narrow`, `default`, `wide` |
| `autoplay`     | boolean | false     | Autoplay (muteado para compliance)        |
| `showControls` | boolean | true      | Mostrar controles del reproductor         |

**Comportamiento Responsive**:

- Todos los breakpoints: Video responsive que mantiene aspect ratio
- Mobile: Ancho completo del viewport

**Contenido por Defecto (Seed)**:

```json
{
  "key": "video",
  "content": {
    "title": {
      "es": "Mira Como Funciona",
      "en": "See How It Works"
    },
    "subtitle": {
      "es": "Un recorrido rapido por todas las funcionalidades",
      "en": "A quick tour of all the features"
    },
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "thumbnailImage": null,
    "caption": {
      "es": "Video demostrativo de Orion Landing Universal",
      "en": "Orion Landing Universal demo video"
    }
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 12,
  "defaultEnabled": false
}
```

---

### 4.13 Equipo (`team`)

**Proposito**: Presenta a los miembros del equipo con foto, nombre, cargo y redes sociales.

**Campos de Contenido**:

| Campo                              | Tipo     | Multilingue | Requerido | Descripcion           |
| ---------------------------------- | -------- | :---------: | :-------: | --------------------- |
| `title`                            | text     |     Si      |    Si     | Titulo de la seccion  |
| `subtitle`                         | textarea |     Si      |    No     | Subtitulo descriptivo |
| `members`                          | list     |      -      |    Si     | Lista de miembros     |
| `members[].name`                   | text     |     No      |    Si     | Nombre completo       |
| `members[].role`                   | text     |     Si      |    Si     | Cargo/rol             |
| `members[].bio`                    | textarea |     Si      |    No     | Bio breve             |
| `members[].photo`                  | image    |     No      |    No     | Foto del miembro      |
| `members[].socialLinks`            | list     |      -      |    No     | Redes sociales        |
| `members[].socialLinks[].platform` | select   |     No      |    Si     | Plataforma            |
| `members[].socialLinks[].url`      | link     |     No      |    Si     | URL del perfil        |

**Opciones de Estilo**:

| Opcion       | Tipo   | Default     | Descripcion                                             |
| ------------ | ------ | ----------- | ------------------------------------------------------- |
| `columns`    | select | `3`         | Columnas: `2`, `3`, `4`                                 |
| `cardStyle`  | select | `photo-top` | Layout de tarjeta: `photo-top`, `photo-left`, `overlay` |
| `photoShape` | select | `circle`    | Forma de la foto: `circle`, `square`, `rounded`         |

**Comportamiento Responsive**:

- Desktop: Grid de N columnas
- Tablet: 2 columnas
- Mobile: 1 columna o carousel horizontal

**Contenido por Defecto (Seed)**:

```json
{
  "key": "team",
  "content": {
    "title": {
      "es": "Nuestro Equipo",
      "en": "Our Team"
    },
    "subtitle": {
      "es": "Las personas detras del proyecto",
      "en": "The people behind the project"
    },
    "members": [
      {
        "name": "Alex Garcia",
        "role": { "es": "Director Tecnico", "en": "CTO" },
        "bio": {
          "es": "Mas de 10 anos de experiencia en desarrollo web.",
          "en": "Over 10 years of web development experience."
        },
        "photo": null,
        "socialLinks": [{ "platform": "linkedin", "url": "#" }]
      },
      {
        "name": "Sofia Martinez",
        "role": { "es": "Disenadora UX/UI", "en": "UX/UI Designer" },
        "bio": {
          "es": "Especialista en experiencias digitales centradas en el usuario.",
          "en": "Specialist in user-centered digital experiences."
        },
        "photo": null,
        "socialLinks": [{ "platform": "linkedin", "url": "#" }]
      },
      {
        "name": "Diego Lopez",
        "role": { "es": "Desarrollador Full Stack", "en": "Full Stack Developer" },
        "bio": {
          "es": "Apasionado por el open-source y las tecnologias modernas.",
          "en": "Passionate about open-source and modern technologies."
        },
        "photo": null,
        "socialLinks": [{ "platform": "github", "url": "#" }]
      }
    ]
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 13,
  "defaultEnabled": false
}
```

---

### 4.14 Galeria (`gallery`)

**Proposito**: Muestra una coleccion de imagenes en formato grid, masonry o lightbox. Ideal para portfolio, instalaciones, productos.

**Campos de Contenido**:

| Campo               | Tipo     | Multilingue | Requerido | Descripcion             |
| ------------------- | -------- | :---------: | :-------: | ----------------------- |
| `title`             | text     |     Si      |    No     | Titulo de la seccion    |
| `subtitle`          | textarea |     Si      |    No     | Subtitulo descriptivo   |
| `images`            | list     |      -      |    Si     | Lista de imagenes       |
| `images[].image`    | image    |     No      |    Si     | Imagen                  |
| `images[].caption`  | text     |     Si      |    No     | Pie de foto             |
| `images[].category` | text     |     No      |    No     | Categoria para filtrado |

**Opciones de Estilo**:

| Opcion           | Tipo    | Default  | Descripcion                                   |
| ---------------- | ------- | -------- | --------------------------------------------- |
| `layout`         | select  | `grid`   | Layout: `grid`, `masonry`, `carousel`         |
| `columns`        | select  | `3`      | Columnas: `2`, `3`, `4`                       |
| `gap`            | select  | `medium` | Espaciado: `none`, `small`, `medium`, `large` |
| `enableLightbox` | boolean | true     | Abrir imagen en lightbox al hacer clic        |
| `enableFilters`  | boolean | false    | Mostrar filtros por categoria                 |
| `imageRatio`     | select  | `auto`   | Aspecto: `auto`, `1:1`, `4:3`, `16:9`         |

**Comportamiento Responsive**:

- Desktop: Grid segun configuracion
- Tablet: 2 columnas
- Mobile: 1 o 2 columnas, lightbox a pantalla completa

**Contenido por Defecto (Seed)**:

```json
{
  "key": "gallery",
  "content": {
    "title": {
      "es": "Galeria",
      "en": "Gallery"
    },
    "subtitle": {
      "es": "Explora nuestro trabajo y proyectos",
      "en": "Explore our work and projects"
    },
    "images": [
      {
        "image": {
          "url": "/images/defaults/gallery-1.jpg",
          "alt": { "es": "Proyecto 1", "en": "Project 1" }
        },
        "caption": { "es": "Proyecto destacado 1", "en": "Featured project 1" },
        "category": "web"
      },
      {
        "image": {
          "url": "/images/defaults/gallery-2.jpg",
          "alt": { "es": "Proyecto 2", "en": "Project 2" }
        },
        "caption": { "es": "Proyecto destacado 2", "en": "Featured project 2" },
        "category": "web"
      },
      {
        "image": {
          "url": "/images/defaults/gallery-3.jpg",
          "alt": { "es": "Proyecto 3", "en": "Project 3" }
        },
        "caption": { "es": "Proyecto destacado 3", "en": "Featured project 3" },
        "category": "design"
      },
      {
        "image": {
          "url": "/images/defaults/gallery-4.jpg",
          "alt": { "es": "Proyecto 4", "en": "Project 4" }
        },
        "caption": { "es": "Proyecto destacado 4", "en": "Featured project 4" },
        "category": "design"
      },
      {
        "image": {
          "url": "/images/defaults/gallery-5.jpg",
          "alt": { "es": "Proyecto 5", "en": "Project 5" }
        },
        "caption": { "es": "Proyecto destacado 5", "en": "Featured project 5" },
        "category": "mobile"
      },
      {
        "image": {
          "url": "/images/defaults/gallery-6.jpg",
          "alt": { "es": "Proyecto 6", "en": "Project 6" }
        },
        "caption": { "es": "Proyecto destacado 6", "en": "Featured project 6" },
        "category": "mobile"
      }
    ]
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "wide"
  },
  "defaultOrder": 14,
  "defaultEnabled": false
}
```

---

### 4.15 Grid de Caracteristicas (`features_grid`)

**Proposito**: Grid detallado de funcionalidades o caracteristicas del producto con iconos, titulos y descripciones. Mas detallado que value_prop.

**Campos de Contenido**:

| Campo                    | Tipo     | Multilingue | Requerido | Descripcion                 |
| ------------------------ | -------- | :---------: | :-------: | --------------------------- |
| `title`                  | text     |     Si      |    Si     | Titulo de la seccion        |
| `subtitle`               | textarea |     Si      |    No     | Subtitulo descriptivo       |
| `features`               | list     |      -      |    Si     | Lista de caracteristicas    |
| `features[].icon`        | text     |     No      |    Si     | Icono Lucide                |
| `features[].title`       | text     |     Si      |    Si     | Titulo de la caracteristica |
| `features[].description` | textarea |     Si      |    Si     | Descripcion detallada       |
| `features[].image`       | image    |     No      |    No     | Imagen ilustrativa opcional |
| `features[].link`        | link     |     No      |    No     | Link "Saber mas" opcional   |
| `features[].linkText`    | text     |     Si      |    No     | Texto del link              |

**Opciones de Estilo**:

| Opcion      | Tipo   | Default    | Descripcion                                          |
| ----------- | ------ | ---------- | ---------------------------------------------------- |
| `columns`   | select | `3`        | Columnas: `2`, `3`, `4`                              |
| `cardStyle` | select | `icon-top` | Estilo: `icon-top`, `icon-left`, `bordered`, `glass` |
| `iconSize`  | select | `medium`   | Tamano del icono: `small`, `medium`, `large`         |

**Comportamiento Responsive**:

- Desktop: Grid de N columnas
- Tablet: 2 columnas
- Mobile: 1 columna

**Contenido por Defecto (Seed)**:

```json
{
  "key": "features_grid",
  "content": {
    "title": {
      "es": "Funcionalidades",
      "en": "Features"
    },
    "subtitle": {
      "es": "Todo lo que necesitas en una sola plataforma",
      "en": "Everything you need in one platform"
    },
    "features": [
      {
        "icon": "LayoutDashboard",
        "title": { "es": "Panel Admin Completo", "en": "Complete Admin Panel" },
        "description": {
          "es": "Gestiona todo tu contenido desde un panel intuitivo y profesional.",
          "en": "Manage all your content from an intuitive and professional panel."
        },
        "image": null,
        "link": null,
        "linkText": null
      },
      {
        "icon": "Palette",
        "title": { "es": "20 Paletas de Colores", "en": "20 Color Palettes" },
        "description": {
          "es": "Paletas disenadas para nichos especificos. Cambia el look con un clic.",
          "en": "Palettes designed for specific niches. Change the look with one click."
        },
        "image": null,
        "link": null,
        "linkText": null
      },
      {
        "icon": "Languages",
        "title": { "es": "Multilingue Nativo", "en": "Native Multilingual" },
        "description": {
          "es": "Agrega y gestiona idiomas sin limitaciones desde el panel admin.",
          "en": "Add and manage languages without limitations from the admin panel."
        },
        "image": null,
        "link": null,
        "linkText": null
      },
      {
        "icon": "Puzzle",
        "title": { "es": "19 Modulos Configurables", "en": "19 Configurable Modules" },
        "description": {
          "es": "Activa, desactiva y reordena modulos para crear tu landing page ideal.",
          "en": "Enable, disable and reorder modules to create your ideal landing page."
        },
        "image": null,
        "link": null,
        "linkText": null
      },
      {
        "icon": "Search",
        "title": { "es": "SEO Optimizado", "en": "SEO Optimized" },
        "description": {
          "es": "Meta tags, Open Graph, sitemap y datos estructurados configurables.",
          "en": "Configurable meta tags, Open Graph, sitemap and structured data."
        },
        "image": null,
        "link": null,
        "linkText": null
      },
      {
        "icon": "Plug",
        "title": { "es": "Integraciones Listas", "en": "Ready Integrations" },
        "description": {
          "es": "Google Analytics, Meta Pixel, WhatsApp, Calendly y SMTP incluidos.",
          "en": "Google Analytics, Meta Pixel, WhatsApp, Calendly and SMTP included."
        },
        "image": null,
        "link": null,
        "linkText": null
      }
    ]
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 15,
  "defaultEnabled": false
}
```

---

### 4.16 Cuenta Regresiva (`countdown`)

**Proposito**: Temporizador de cuenta regresiva hacia una fecha/hora especifica. Genera urgencia para lanzamientos, ofertas o eventos.

**Campos de Contenido**:

| Campo            | Tipo     | Multilingue | Requerido | Descripcion                             |
| ---------------- | -------- | :---------: | :-------: | --------------------------------------- |
| `title`          | text     |     Si      |    Si     | Titulo de la seccion                    |
| `subtitle`       | textarea |     Si      |    No     | Subtitulo o mensaje de urgencia         |
| `targetDate`     | date     |     No      |    Si     | Fecha/hora objetivo (ISO 8601)          |
| `expiredMessage` | textarea |     Si      |    Si     | Mensaje cuando el contador llega a cero |
| `ctaText`        | text     |     Si      |    No     | Texto del boton CTA                     |
| `ctaLink`        | link     |     No      |    No     | URL del CTA                             |
| `labels`         | list     |      -      |    No     | Etiquetas de las unidades de tiempo     |
| `labels.days`    | text     |     Si      |    No     | Etiqueta para dias                      |
| `labels.hours`   | text     |     Si      |    No     | Etiqueta para horas                     |
| `labels.minutes` | text     |     Si      |    No     | Etiqueta para minutos                   |
| `labels.seconds` | text     |     Si      |    No     | Etiqueta para segundos                  |

**Opciones de Estilo**:

| Opcion          | Tipo    | Default | Descripcion                                         |
| --------------- | ------- | ------- | --------------------------------------------------- |
| `style`         | select  | `cards` | Estilo visual: `cards`, `minimal`, `circle`, `flip` |
| `showSeconds`   | boolean | true    | Mostrar segundos                                    |
| `hideOnExpired` | boolean | false   | Ocultar seccion cuando expire                       |

**Comportamiento Responsive**:

- Todos los breakpoints: Centrado, contadores en fila (mobile: mas compactos)

**Contenido por Defecto (Seed)**:

```json
{
  "key": "countdown",
  "content": {
    "title": {
      "es": "Oferta por Tiempo Limitado",
      "en": "Limited Time Offer"
    },
    "subtitle": {
      "es": "No te pierdas esta oportunidad unica",
      "en": "Don't miss this unique opportunity"
    },
    "targetDate": "2026-12-31T23:59:59Z",
    "expiredMessage": {
      "es": "La oferta ha finalizado. Suscribete para conocer proximas promociones.",
      "en": "The offer has ended. Subscribe to learn about upcoming promotions."
    },
    "ctaText": {
      "es": "Aprovechar Ahora",
      "en": "Take Advantage Now"
    },
    "ctaLink": "#offer_form",
    "labels": {
      "days": { "es": "Dias", "en": "Days" },
      "hours": { "es": "Horas", "en": "Hours" },
      "minutes": { "es": "Minutos", "en": "Minutes" },
      "seconds": { "es": "Segundos", "en": "Seconds" }
    }
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "narrow"
  },
  "defaultOrder": 16,
  "defaultEnabled": false
}
```

---

### 4.17 Comparacion (`comparison`)

**Proposito**: Tabla o seccion de comparacion lado a lado (antes/despues, nosotros vs competencia, etc.).

**Campos de Contenido**:

| Campo                    | Tipo     | Multilingue | Requerido | Descripcion                       |
| ------------------------ | -------- | :---------: | :-------: | --------------------------------- |
| `title`                  | text     |     Si      |    Si     | Titulo de la seccion              |
| `subtitle`               | textarea |     Si      |    No     | Subtitulo descriptivo             |
| `leftColumn`             | object   |      -      |    Si     | Columna izquierda                 |
| `leftColumn.title`       | text     |     Si      |    Si     | Titulo de la columna izquierda    |
| `leftColumn.badge`       | text     |     Si      |    No     | Badge (ej: "Antes", "Ellos")      |
| `rightColumn`            | object   |      -      |    Si     | Columna derecha                   |
| `rightColumn.title`      | text     |     Si      |    Si     | Titulo de la columna derecha      |
| `rightColumn.badge`      | text     |     Si      |    No     | Badge (ej: "Despues", "Nosotros") |
| `rows`                   | list     |      -      |    Si     | Filas de comparacion              |
| `rows[].feature`         | text     |     Si      |    Si     | Nombre de la caracteristica       |
| `rows[].leftValue`       | text     |     Si      |    Si     | Valor lado izquierdo              |
| `rows[].rightValue`      | text     |     Si      |    Si     | Valor lado derecho                |
| `rows[].leftIsPositive`  | boolean  |     No      |    No     | Si el valor izquierdo es positivo |
| `rows[].rightIsPositive` | boolean  |     No      |    No     | Si el valor derecho es positivo   |

**Opciones de Estilo**:

| Opcion            | Tipo    | Default | Descripcion                              |
| ----------------- | ------- | ------- | ---------------------------------------- |
| `layout`          | select  | `table` | Layout: `table`, `cards`, `side-by-side` |
| `highlightWinner` | boolean | true    | Resaltar la columna "ganadora"           |
| `winnerColumn`    | select  | `right` | Columna a destacar: `left`, `right`      |

**Comportamiento Responsive**:

- Desktop: Tabla o side-by-side segun layout
- Tablet: Tabla compacta
- Mobile: Cards apiladas o tabla con scroll horizontal

**Contenido por Defecto (Seed)**:

```json
{
  "key": "comparison",
  "content": {
    "title": {
      "es": "Por Que Somos Diferentes",
      "en": "Why We're Different"
    },
    "subtitle": {
      "es": "Compara y decide por ti mismo",
      "en": "Compare and decide for yourself"
    },
    "leftColumn": {
      "title": { "es": "Solucion Tradicional", "en": "Traditional Solution" },
      "badge": { "es": "Otros", "en": "Others" }
    },
    "rightColumn": {
      "title": { "es": "Orion Landing", "en": "Orion Landing" },
      "badge": { "es": "Nosotros", "en": "Us" }
    },
    "rows": [
      {
        "feature": { "es": "Costo", "en": "Cost" },
        "leftValue": { "es": "$500-5000", "en": "$500-5000" },
        "rightValue": { "es": "Gratis", "en": "Free" },
        "leftIsPositive": false,
        "rightIsPositive": true
      },
      {
        "feature": { "es": "Tiempo de setup", "en": "Setup time" },
        "leftValue": { "es": "Semanas", "en": "Weeks" },
        "rightValue": { "es": "Minutos", "en": "Minutes" },
        "leftIsPositive": false,
        "rightIsPositive": true
      },
      {
        "feature": { "es": "Requiere codigo", "en": "Requires code" },
        "leftValue": { "es": "Si", "en": "Yes" },
        "rightValue": { "es": "No", "en": "No" },
        "leftIsPositive": false,
        "rightIsPositive": true
      },
      {
        "feature": { "es": "Multilingue", "en": "Multilingual" },
        "leftValue": { "es": "Plugin extra", "en": "Extra plugin" },
        "rightValue": { "es": "Nativo", "en": "Native" },
        "leftIsPositive": false,
        "rightIsPositive": true
      },
      {
        "feature": { "es": "Control de datos", "en": "Data control" },
        "leftValue": { "es": "Del proveedor", "en": "Provider's" },
        "rightValue": { "es": "100% tuyo", "en": "100% yours" },
        "leftIsPositive": false,
        "rightIsPositive": true
      }
    ]
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 17,
  "defaultEnabled": false
}
```

---

### 4.18 Newsletter (`newsletter`)

**Proposito**: Formulario simplificado de suscripcion a newsletter. Captura solo email (y opcionalmente nombre).

**Campos de Contenido**:

| Campo             | Tipo     | Multilingue | Requerido | Descripcion                    |
| ----------------- | -------- | :---------: | :-------: | ------------------------------ |
| `title`           | text     |     Si      |    Si     | Titulo de la seccion           |
| `subtitle`        | textarea |     Si      |    No     | Subtitulo motivador            |
| `placeholder`     | text     |     Si      |    Si     | Placeholder del input de email |
| `submitText`      | text     |     Si      |    Si     | Texto del boton                |
| `successMessage`  | textarea |     Si      |    Si     | Mensaje post-suscripcion       |
| `showNameField`   | boolean  |     No      |    No     | Mostrar campo de nombre        |
| `namePlaceholder` | text     |     Si      |    No     | Placeholder del campo nombre   |
| `consentText`     | richtext |     Si      |    No     | Texto de consentimiento        |

**Opciones de Estilo**:

| Opcion   | Tipo   | Default   | Descripcion                                                             |
| -------- | ------ | --------- | ----------------------------------------------------------------------- |
| `layout` | select | `inline`  | Layout: `inline` (input + boton en linea), `stacked` (apilados), `card` |
| `style`  | select | `minimal` | Estilo: `minimal`, `gradient-bg`, `image-bg`                            |

**Comportamiento Responsive**:

- Desktop: Segun layout
- Mobile: Siempre stacked (input y boton apilados)

**Logica de Backend**:

- Guarda suscripcion en tabla `leads` con campo `source_module = 'newsletter'`
- Validacion de email en servidor
- Opcional: doble opt-in si SMTP esta configurado

**Contenido por Defecto (Seed)**:

```json
{
  "key": "newsletter",
  "content": {
    "title": {
      "es": "Mantente Informado",
      "en": "Stay Informed"
    },
    "subtitle": {
      "es": "Recibe novedades, tips y actualizaciones directamente en tu bandeja",
      "en": "Get news, tips and updates directly in your inbox"
    },
    "placeholder": {
      "es": "Tu correo electronico",
      "en": "Your email address"
    },
    "submitText": {
      "es": "Suscribirse",
      "en": "Subscribe"
    },
    "successMessage": {
      "es": "Gracias por suscribirte. Revisa tu bandeja de entrada.",
      "en": "Thanks for subscribing. Check your inbox."
    },
    "showNameField": false,
    "namePlaceholder": {
      "es": "Tu nombre",
      "en": "Your name"
    },
    "consentText": null
  },
  "styles": {
    "paddingY": "medium",
    "maxWidth": "narrow"
  },
  "defaultOrder": 18,
  "defaultEnabled": false
}
```

---

### 4.19 Mapa de Ubicacion (`map_location`)

**Proposito**: Muestra la ubicacion fisica del negocio con un mapa interactivo (Google Maps embed o Leaflet) junto con datos de contacto.

**Campos de Contenido**:

| Campo                | Tipo     | Multilingue | Requerido | Descripcion                                         |
| -------------------- | -------- | :---------: | :-------: | --------------------------------------------------- |
| `title`              | text     |     Si      |    No     | Titulo de la seccion                                |
| `subtitle`           | textarea |     Si      |    No     | Subtitulo descriptivo                               |
| `address`            | textarea |     Si      |    Si     | Direccion completa                                  |
| `latitude`           | number   |     No      |    Si     | Latitud                                             |
| `longitude`          | number   |     No      |    Si     | Longitud                                            |
| `mapZoom`            | number   |     No      |    No     | Nivel de zoom (1-20, default 15)                    |
| `phone`              | text     |     No      |    No     | Telefono de contacto                                |
| `email`              | text     |     No      |    No     | Email de contacto                                   |
| `schedule`           | list     |      -      |    No     | Horario de atencion                                 |
| `schedule[].day`     | text     |     Si      |    Si     | Dia(s)                                              |
| `schedule[].hours`   | text     |     Si      |    Si     | Horario                                             |
| `googleMapsEmbedUrl` | link     |     No      |    No     | URL de embed de Google Maps (alternativa a lat/lng) |

**Opciones de Estilo**:

| Opcion      | Tipo   | Default    | Descripcion                                              |
| ----------- | ------ | ---------- | -------------------------------------------------------- |
| `layout`    | select | `map-left` | Layout: `map-left`, `map-right`, `map-top`, `map-full`   |
| `mapHeight` | number | 400        | Altura del mapa en px                                    |
| `mapStyle`  | select | `default`  | Estilo del mapa: `default`, `dark`, `light`, `satellite` |

**Comportamiento Responsive**:

- Desktop: Segun layout (mapa + info lado a lado)
- Tablet: Mapa arriba, info abajo
- Mobile: Mapa full-width arriba, info compacta abajo

**Contenido por Defecto (Seed)**:

```json
{
  "key": "map_location",
  "content": {
    "title": {
      "es": "Donde Encontrarnos",
      "en": "Where to Find Us"
    },
    "subtitle": {
      "es": "Visitanos en nuestra oficina",
      "en": "Visit us at our office"
    },
    "address": {
      "es": "Calle Gran Via 123, 28013 Madrid, Espana",
      "en": "123 Gran Via Street, 28013 Madrid, Spain"
    },
    "latitude": 40.4168,
    "longitude": -3.7038,
    "mapZoom": 15,
    "phone": "+34 600 000 000",
    "email": "info@ejemplo.com",
    "schedule": [
      {
        "day": { "es": "Lunes a Viernes", "en": "Monday to Friday" },
        "hours": { "es": "9:00 - 18:00", "en": "9:00 AM - 6:00 PM" }
      },
      {
        "day": { "es": "Sabados", "en": "Saturday" },
        "hours": { "es": "10:00 - 14:00", "en": "10:00 AM - 2:00 PM" }
      },
      { "day": { "es": "Domingos", "en": "Sunday" }, "hours": { "es": "Cerrado", "en": "Closed" } }
    ],
    "googleMapsEmbedUrl": null
  },
  "styles": {
    "paddingY": "large",
    "maxWidth": "default"
  },
  "defaultOrder": 19,
  "defaultEnabled": false
}
```

---

## 5. Motor de Renderizado

### 5.1 Implementacion (`src/lib/modules/renderer.tsx`)

El renderer es el componente central que transforma la lista de modulos activos en secciones renderizadas.

```typescript
// src/lib/modules/renderer.tsx
'use client';

import { Suspense, type FC } from 'react';
import { getModule } from './registry';
import type { ModuleProps, ModuleStyles } from './types';
import { ModuleSkeleton } from '@/components/ui/module-skeleton';
import { ModuleErrorBoundary } from '@/components/ui/module-error-boundary';

export interface PageModule {
  id: string;
  section_key: string;
  content: Record<string, unknown>;
  styles: ModuleStyles;
  sort_order: number;
  is_visible: boolean;
}

interface ModuleRendererProps {
  modules: PageModule[];
  language: string;
  defaultLanguage: string;
  isEditing: boolean;
  onContentChange?: (moduleId: string, path: string, value: unknown) => void;
  onStyleChange?: (moduleId: string, path: string, value: unknown) => void;
}

export const ModuleRenderer: FC<ModuleRendererProps> = ({
  modules,
  language,
  defaultLanguage,
  isEditing,
  onContentChange,
  onStyleChange,
}) => {
  // 1. Filtrar modulos visibles y ordenar por sort_order
  const visibleModules = modules
    .filter(m => m.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      {visibleModules.map((pageModule) => {
        // 2. Buscar el modulo en el registry
        const registryEntry = getModule(pageModule.section_key);

        // 3. Si no existe en el registry, loggear y saltar
        if (!registryEntry) {
          console.warn(
            `[ModuleRenderer] Modulo "${pageModule.section_key}" no encontrado en el registry. Saltando.`
          );
          return null;
        }

        const Component = registryEntry.component;

        // 4. Renderizar con Suspense y ErrorBoundary
        return (
          <ModuleErrorBoundary
            key={pageModule.id}
            moduleKey={pageModule.section_key}
            moduleName={registryEntry.name}
          >
            <Suspense
              fallback={<ModuleSkeleton moduleKey={pageModule.section_key} />}
            >
              <Component
                content={pageModule.content}
                styles={pageModule.styles}
                moduleId={pageModule.id}
                isEditing={isEditing}
                language={language}
                defaultLanguage={defaultLanguage}
                onContentChange={(path, value) =>
                  onContentChange?.(pageModule.id, path, value)
                }
                onStyleChange={(path, value) =>
                  onStyleChange?.(pageModule.id, path, value)
                }
              />
            </Suspense>
          </ModuleErrorBoundary>
        );
      })}
    </>
  );
};
```

### 5.2 Flujo del Renderer

```
1. Recibe lista de PageModule[] desde la pagina principal
                |
                v
2. Filtra is_visible === true
                |
                v
3. Ordena por sort_order ASC
                |
                v
4. Para cada modulo:
   a. Busca en moduleRegistry por section_key
   b. Si no existe: console.warn() y retorna null (no rompe la pagina)
   c. Si existe: obtiene el Component (lazy loaded)
   d. Envuelve en ErrorBoundary (captura errores del componente hijo)
   e. Envuelve en Suspense (muestra skeleton durante lazy load)
   f. Pasa ModuleProps al componente
                |
                v
5. Renderiza todos los modulos en orden
```

### 5.3 Manejo de Errores

| Escenario                                | Comportamiento                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| Modulo no existe en registry             | `console.warn()`, no renderiza, continua con los demas                             |
| Componente falla al cargar (chunk error) | Suspense fallback permanece, ErrorBoundary muestra mensaje amigable                |
| Componente lanza error en runtime        | ErrorBoundary captura, muestra mensaje "Este modulo tuvo un error" con boton retry |
| Contenido faltante o malformado          | El modulo muestra valores por defecto o campos vacios (nunca crash)                |
| Modulo con `is_visible: false`           | No se renderiza ni se carga (cero JS enviado)                                      |

### 5.4 Componentes de Soporte

**ModuleSkeleton**: Componente placeholder que muestra un esqueleto animado durante la carga lazy del modulo. Puede ser generico o personalizado por `moduleKey`.

**ModuleErrorBoundary**: React Error Boundary que:

- Captura cualquier error del componente hijo
- Muestra un mensaje amigable: "El modulo [nombre] tuvo un error"
- En modo edicion: muestra detalles del error y boton "Reintentar"
- En modo publico: muestra un espacio vacio o mensaje generico
- Logea el error a la consola

---

## 6. Ciclo de Vida del Modulo

### 6.1 Diagrama de Flujo Completo

```
CARGA INICIAL
==============
Browser solicita pagina
        |
        v
Server Component (page.tsx)
  - Consulta page_modules de Supabase (con filtro is_visible)
  - Consulta site_config para idioma por defecto
  - Consulta languages para idiomas activos
        |
        v
Client Component (LandingPage.tsx)
  - Recibe datos como props (Server -> Client)
  - Inicializa I18nProvider con idioma del user (localStorage/URL/default)
  - Renderiza <ModuleRenderer modules={...} />
        |
        v
ModuleRenderer
  - Filtra y ordena modulos
  - Lazy load de cada componente
  - Renderiza con Suspense + ErrorBoundary


EDICION INLINE
===============
Admin activa modo edicion (toggle)
        |
        v
ModuleRenderer recibe isEditing=true
  - Pasa prop a todos los modulos
        |
        v
Componente del modulo
  - Activa contentEditable en textos
  - Muestra overlays en imagenes
  - Muestra controles de lista (add/remove/reorder)
        |
        v
Usuario modifica contenido
  - onBlur / onChange dispara onContentChange(path, value)
        |
        v
LandingPage acumula cambios en estado local (dirty state)
  - Muestra boton "Guardar Cambios" en toolbar admin
  - Preview en tiempo real (optimistic update)
        |
        v
Usuario hace clic en "Guardar"
  - Envia PATCH a API /api/modules/[id] con los cambios
  - API valida y actualiza page_modules en Supabase
  - Confirma guardado exitoso
  - Limpia dirty state


EDICION DESDE ADMIN PANEL
===========================
Admin navega a /admin/content
        |
        v
Editor muestra formulario basado en el schema del modulo
  - Carga modulo schema (lazy)
  - Genera campos dinamicamente segun SchemaField[]
        |
        v
Admin modifica campos en el formulario
  - Validacion en tiempo real segun schema.validation
  - Preview lateral (opcional, iframe)
        |
        v
Admin guarda
  - Envia PUT a API /api/modules/[id]
  - API valida contra schema
  - Actualiza page_modules en Supabase
  - Invalida cache de la pagina publica (revalidatePath)
```

### 6.2 Flujo de Datos

```
Supabase DB (page_modules)
        |
        | SELECT con filtros
        v
API Route / Server Component
        |
        | Props serializado (JSON)
        v
Client Component (LandingPage)
        |
        | Via ModuleRenderer
        v
Module Component
        |
        | onContentChange callback
        v
LandingPage (dirty state)
        |
        | PATCH/PUT request
        v
API Route
        |
        | UPDATE SQL
        v
Supabase DB (page_modules)
```

---

## 7. Extensibilidad — Como Agregar un Nuevo Modulo

### Guia Paso a Paso

#### Paso 1: Crear la Carpeta del Modulo

```bash
mkdir src/components/modules/mi-modulo
```

#### Paso 2: Definir los Tipos (`mi-modulo.types.ts`)

```typescript
import type { MultilingualText, MultilingualImage } from '@/lib/modules/types'

export interface MiModuloContent {
  title: MultilingualText
  description: MultilingualText
  image: MultilingualImage
  // ... campos especificos del modulo
}
```

#### Paso 3: Definir el Schema (`mi-modulo.schema.ts`)

```typescript
import type { ModuleSchema } from '@/lib/modules/types'

export const miModuloSchema: ModuleSchema = {
  key: 'mi_modulo',
  name: { es: 'Mi Modulo', en: 'My Module' },
  description: { es: 'Descripcion del modulo', en: 'Module description' },
  fields: [
    {
      key: 'title',
      type: 'text',
      label: { es: 'Titulo', en: 'Title' },
      isMultilingual: true,
      required: true,
      order: 1,
    },
    // ... mas campos
  ],
  version: 1,
}
```

#### Paso 4: Crear el Seed (`mi-modulo.seed.ts`)

```typescript
import type { ModuleSeed } from '@/lib/modules/types'

export const miModuloSeed: ModuleSeed = {
  key: 'mi_modulo',
  content: {
    title: { es: 'Titulo por defecto', en: 'Default title' },
    // ...
  },
  styles: {
    paddingY: 'large',
    maxWidth: 'default',
  },
  defaultOrder: 20, // Siguiente orden disponible
  defaultEnabled: false,
}
```

#### Paso 5: Crear el Componente (`MiModuloModule.tsx`)

```typescript
'use client';

import type { FC } from 'react';
import type { ModuleProps } from '@/lib/modules/types';
import type { MiModuloContent } from './mi-modulo.types';
import { useModuleText } from '@/lib/modules/hooks';

const MiModuloModule: FC<ModuleProps<MiModuloContent>> = ({
  content,
  styles,
  moduleId,
  isEditing,
  language,
  defaultLanguage,
  onContentChange,
}) => {
  const t = useModuleText(content, language, defaultLanguage);

  return (
    <section id={moduleId} data-module="mi_modulo">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold font-heading">
          {t('title')}
        </h2>
        {/* ... contenido del modulo */}
      </div>
    </section>
  );
};

export default MiModuloModule;
```

#### Paso 6: Crear el Index (`index.ts`)

```typescript
export { default } from './MiModuloModule'
export { miModuloSchema } from './mi-modulo.schema'
export { miModuloSeed } from './mi-modulo.seed'
export type { MiModuloContent } from './mi-modulo.types'
```

#### Paso 7: Registrar en el Registry (`src/lib/modules/registry.ts`)

```typescript
mi_modulo: {
  key: 'mi_modulo',
  displayName: 'Mi Modulo',
  description: 'Descripcion de lo que hace el modulo',
  component: dynamic(() => import('@/components/modules/mi-modulo'), { ssr: true }),
  category: 'content',
  isSystem: false,
  defaultOrder: 20,
},
```

> **Nota**: Los schemas y seeds NO se registran en el registry. Se definen en archivos
> separados (`mi-modulo.schema.ts`, `mi-modulo.seed.ts`) dentro de la carpeta del modulo
> y se insertan en la base de datos via el wizard o manualmente (ver Paso 8).

#### Paso 8: Insertar Schema y Seed en la Base de Datos

Al ejecutar el wizard (o manualmente), insertar:

1. En `module_schemas`: el JSON del schema
2. En `page_modules`: el registro con el seed content y styles

#### Paso 9: Verificar

1. El modulo aparece en el gestor de modulos del admin panel
2. El modulo se puede activar/desactivar
3. El contenido se puede editar desde el admin
4. El modulo se renderiza correctamente en la pagina publica
5. La edicion inline funciona
6. El responsive es correcto en todos los breakpoints

### Checklist del Nuevo Modulo

- [ ] `mi-modulo.types.ts` — Tipos TypeScript
- [ ] `mi-modulo.schema.ts` — Esquema de campos
- [ ] `mi-modulo.seed.ts` — Contenido por defecto (ES + EN)
- [ ] `MiModuloModule.tsx` — Componente React
- [ ] `index.ts` — Exportaciones
- [ ] Entrada en `registry.ts`
- [ ] Schema insertado en BD
- [ ] Seed insertado en BD
- [ ] Test de renderizado
- [ ] Test de edicion inline
- [ ] Test responsive (mobile, tablet, desktop)

---

## Apendice A: Hook `useModuleText`

Helper que resuelve texto multilingue con cadena de fallback:

```typescript
// src/lib/modules/hooks.ts

import { useCallback } from 'react'
import type { MultilingualText } from './types'

export function useModuleText(
  content: Record<string, unknown>,
  language: string,
  defaultLanguage: string,
) {
  return useCallback(
    (key: string): string => {
      const field = content[key]

      // Si es string directo, retornarlo
      if (typeof field === 'string') return field

      // Si es objeto multilingue
      if (field && typeof field === 'object' && !Array.isArray(field)) {
        const ml = field as MultilingualText
        // Cadena de fallback: idioma actual -> idioma default -> primer disponible -> key
        return ml[language] ?? ml[defaultLanguage] ?? Object.values(ml)[0] ?? key
      }

      return key
    },
    [content, language, defaultLanguage],
  )
}
```

## Apendice B: Tabla `page_modules` en Supabase

```sql
CREATE TABLE page_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  styles JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indice para consultas ordenadas
CREATE INDEX idx_page_modules_sort ON page_modules (sort_order);

-- Indice para busqueda por section_key
CREATE UNIQUE INDEX idx_page_modules_key ON page_modules (section_key);

-- Trigger para updated_at automatico
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_modules_updated_at
  BEFORE UPDATE ON page_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Apendice C: Tabla `module_schemas` en Supabase

```sql
CREATE TABLE module_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  schema JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER module_schemas_updated_at
  BEFORE UPDATE ON module_schemas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```
