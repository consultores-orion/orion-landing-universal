# Patrones Canónicos y Convenciones — Orion Landing Universal

> Este documento define los patrones, convenciones y estándares de código obligatorios para el proyecto. Toda contribución debe adherirse a estas reglas. Si encuentras un caso donde las reglas no aplican, abre un Issue para discutirlo — no lo ignores silenciosamente.

---

## 1. Lenguaje y Tipado

### TypeScript Strict Mode

El proyecto usa TypeScript en modo estricto en todo el codebase. No hay excepciones.

```json
// tsconfig.json (extracto)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Reglas de tipado

| Regla                 | Correcto                               | Incorrecto                  |
| --------------------- | -------------------------------------- | --------------------------- |
| Nunca usar `any`      | `unknown` + type guard                 | `any`                       |
| Objetos               | `interface UserProps { ... }`          | `type UserProps = { ... }`  |
| Uniones y alias       | `type Status = 'active' \| 'inactive'` | `interface` para no-objetos |
| Enums                 | Uniones de strings literales           | `enum` de TypeScript        |
| Funciones de utilidad | Tipos genéricos con constraints        | Overloads excesivos         |

```typescript
// CORRECTO: unknown + type guard
function parseConfig(raw: unknown): SiteConfig {
  const parsed = siteConfigSchema.parse(raw) // Zod valida y tipea
  return parsed
}

// INCORRECTO: any
function parseConfig(raw: any): SiteConfig {
  return raw as SiteConfig // Peligroso, sin validación
}
```

### Validación en Runtime

- **Zod** es la librería estándar para validación en runtime.
- Toda frontera de API (Route Handlers, formularios, datos de Supabase) debe validarse con Zod.
- Los schemas de Zod son la fuente de verdad para los tipos: usar `z.infer<typeof schema>`.

```typescript
// Schema como fuente de verdad
const heroSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(300).optional(),
  ctaText: z.string().min(1).max(50),
  ctaUrl: z.string().url(),
})

type HeroData = z.infer<typeof heroSchema>
```

---

## 2. Estructura de Archivos

### Organización por Feature

El proyecto se organiza por funcionalidad, no por tipo de archivo.

```
src/
├── app/                        # App Router de Next.js
│   ├── (public)/               # Rutas públicas (landing page)
│   ├── admin/                  # Panel de administración
│   └── api/                    # Route Handlers
├── modules/                    # Módulos de la landing page
│   ├── hero/
│   │   ├── HeroModule.tsx          # Componente principal
│   │   ├── hero.schema.ts          # Schema Zod
│   │   ├── hero.types.ts           # Tipos (si necesario aparte del schema)
│   │   ├── hero.seed.ts            # Datos de ejemplo
│   │   ├── HeroModule.test.tsx     # Tests
│   │   ├── HeroEditor.tsx          # Editor del admin panel
│   │   └── index.ts                # Barrel export
│   ├── features/
│   ├── testimonials/
│   └── ...
├── components/                 # Componentes compartidos
│   ├── ui/                     # shadcn/ui components
│   └── shared/                 # Componentes propios compartidos
├── lib/                        # Utilidades y configuración
│   ├── supabase/               # Clientes de Supabase
│   ├── utils/                  # Funciones de utilidad
│   └── config/                 # Configuración del sitio
├── stores/                     # Zustand stores
├── hooks/                      # Custom hooks
└── styles/                     # Estilos globales y tema
```

### Convenciones de Nombrado

| Elemento               | Convención              | Ejemplo               |
| ---------------------- | ----------------------- | --------------------- |
| Componentes React      | PascalCase              | `HeroModule.tsx`      |
| Archivos de utilidad   | kebab-case              | `format-date.ts`      |
| Schemas                | kebab-case + `.schema`  | `hero.schema.ts`      |
| Tipos                  | kebab-case + `.types`   | `hero.types.ts`       |
| Seeds                  | kebab-case + `.seed`    | `hero.seed.ts`        |
| Tests                  | PascalCase + `.test`    | `HeroModule.test.tsx` |
| Hooks                  | camelCase con `use`     | `useModuleData.ts`    |
| Stores                 | kebab-case + `.store`   | `editor.store.ts`     |
| Constantes             | UPPER_SNAKE_CASE        | `MAX_UPLOAD_SIZE`     |
| Variables y funciones  | camelCase               | `getModuleConfig()`   |
| Interfaces de Props    | PascalCase + `Props`    | `HeroModuleProps`     |
| Tipos de respuesta API | PascalCase + `Response` | `ModuleListResponse`  |

### Barrel Exports

Cada directorio de módulo o feature tiene un `index.ts` que exporta su API pública:

```typescript
// modules/hero/index.ts
export { HeroModule } from './HeroModule'
export { HeroEditor } from './HeroEditor'
export { heroSchema } from './hero.schema'
export type { HeroData } from './hero.schema'
```

---

## 3. Componentes React

### Server Components por Defecto

Todos los componentes son Server Components a menos que necesiten explícitamente funcionalidad del cliente.

**Agregar `'use client'` SOLO cuando se necesite:**

- Event handlers (`onClick`, `onChange`, etc.)
- Hooks de React (`useState`, `useEffect`, `useRef`, etc.)
- APIs del navegador (`window`, `document`, `localStorage`)
- Context consumers

```typescript
// Server Component (default) — sin directiva
interface HeroModuleProps {
  data: HeroData;
}

export function HeroModule({ data }: HeroModuleProps) {
  return (
    <section className="relative min-h-screen flex items-center">
      <h1>{data.title}</h1>
      <p>{data.subtitle}</p>
    </section>
  );
}
```

```typescript
// Client Component — solo cuando es necesario
'use client'

import { useState } from 'react'

interface HeroEditorProps {
  initialData: HeroData
  onSave: (data: HeroData) => Promise<void>
}

export function HeroEditor({ initialData, onSave }: HeroEditorProps) {
  const [formData, setFormData] = useState(initialData)
  // ...
}
```

### Convenciones de Componentes

- Las interfaces de Props se nombran `{ComponentName}Props`.
- Preferir composición sobre prop drilling. Si un componente pasa más de 3 props a un hijo, considerar un componente intermedio o context.
- **shadcn/ui** para todos los elementos de UI del panel de administración.
- No usar inline styles excepto para valores dinámicos (colores del tema, posiciones calculadas).
- Usar `forwardRef` solo cuando el componente necesite exponer su DOM element (componentes de formulario, tooltips).

### Patrones de Composición

```typescript
// CORRECTO: Composición
<Card>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent>{children}</CardContent>
</Card>

// INCORRECTO: Prop drilling excesivo
<Card
  title={title}
  headerVariant="large"
  contentPadding="md"
  footerActions={actions}
  showBorder={true}
/>
```

---

## 4. Estado y Data Fetching

### Jerarquía de Estrategias

1. **Server Components** — obtener datos directamente en el componente (fetch en servidor).
2. **React Query (TanStack Query)** — datos del cliente que necesitan cache, revalidación o polling.
3. **Zustand** — estado de UI del cliente (modo edición, cambios pendientes, preferencias).
4. **React Hook Form + Zod** — estado de formularios.

### Server-Side Data Fetching

```typescript
// CORRECTO: Fetch directo en Server Component
import { createServerClient } from '@/lib/supabase/server';

export default async function LandingPage() {
  const supabase = await createServerClient();
  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .order('order');

  return <ModuleRenderer modules={modules} />;
}
```

```typescript
// INCORRECTO: useEffect para datos iniciales
'use client'
export function LandingPage() {
  const [modules, setModules] = useState([])
  useEffect(() => {
    fetchModules().then(setModules) // NO — usar Server Component
  }, [])
}
```

### Zustand para Estado de Admin

```typescript
// stores/editor.store.ts
import { create } from 'zustand'

interface EditorStore {
  isEditing: boolean
  pendingChanges: Map<string, unknown>
  setEditing: (editing: boolean) => void
  addChange: (moduleId: string, data: unknown) => void
  clearChanges: () => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  isEditing: false,
  pendingChanges: new Map(),
  setEditing: (editing) => set({ isEditing: editing }),
  addChange: (moduleId, data) =>
    set((state) => {
      const next = new Map(state.pendingChanges)
      next.set(moduleId, data)
      return { pendingChanges: next }
    }),
  clearChanges: () => set({ pendingChanges: new Map() }),
}))
```

### Formularios

Todo formulario usa React Hook Form con un resolver de Zod:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { heroSchema, type HeroData } from './hero.schema'

const form = useForm<HeroData>({
  resolver: zodResolver(heroSchema),
  defaultValues: initialData,
})
```

---

## 5. Supabase

### Clientes

El proyecto tiene dos clientes de Supabase con propósitos distintos:

| Cliente                 | Contexto                                          | Uso                                          |
| ----------------------- | ------------------------------------------------- | -------------------------------------------- |
| `createServerClient()`  | Server Components, Route Handlers, Server Actions | Fetch de datos, mutaciones                   |
| `createBrowserClient()` | Client Components                                 | Autenticación, subscripciones en tiempo real |

### Reglas Inquebrantables

1. **NUNCA exponer la `service_role` key al cliente.** La service_role bypasea RLS — su uso se limita estrictamente a migraciones y scripts del servidor.
2. **Todas las mutaciones pasan por Route Handlers (`app/api/`).** Los Client Components no mutan datos directamente.
3. **Row Level Security (RLS) habilitado en todas las tablas.** Sin excepciones.
4. **Validar con Zod antes de insertar/actualizar.** Supabase valida en la base de datos, pero la validación en el aplicativo da mejores mensajes de error.

```typescript
// CORRECTO: Mutación a través de Route Handler
// app/api/modules/[id]/route.ts
import { createServerClient } from '@/lib/supabase/server'
import { moduleUpdateSchema } from '@/modules/module.schema'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const body = await request.json()
  const validated = moduleUpdateSchema.parse(body)

  const { data, error } = await supabase
    .from('modules')
    .update(validated)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
```

---

## 6. Estilos

### Tailwind CSS 4

- Tailwind CSS 4 es el sistema de estilos exclusivo.
- **No usar** CSS Modules, styled-components, Emotion, ni ningún otro sistema CSS-in-JS.
- La única excepción para estilos inline son valores dinámicos que dependen de datos en runtime.

### Variables de Tema

Los colores del tema se definen como CSS custom properties y se referencian con `var()`:

```css
/* styles/globals.css */
:root {
  --color-primary: #2563eb;
  --color-primary-foreground: #ffffff;
  --color-secondary: #64748b;
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --color-accent: #f59e0b;
  /* ... */
}
```

```tsx
// Uso en componentes - valores dinámicos del tema del usuario
<div style={{ backgroundColor: `var(--color-primary)` }}>
  {/* Esto es aceptable porque el color viene de la configuración del usuario */}
</div>

// Para clases estáticas, usar Tailwind
<div className="bg-primary text-primary-foreground">
  {/* Tailwind mapea a las CSS variables */}
</div>
```

### Utilidad `cn()`

Usar la utilidad `cn()` de shadcn (basada en `clsx` + `tailwind-merge`) para clases condicionales:

```typescript
import { cn } from '@/lib/utils';

<button
  className={cn(
    'px-4 py-2 rounded-md font-medium transition-colors',
    variant === 'primary' && 'bg-primary text-primary-foreground',
    variant === 'ghost' && 'bg-transparent hover:bg-accent/10',
    disabled && 'opacity-50 cursor-not-allowed'
  )}
>
```

### Responsive Design

Mobile-first obligatorio. Los breakpoints se aplican de menor a mayor:

```tsx
<div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">{title}</h1>
</div>
```

Breakpoints de referencia:

- Default: 0-639px (mobile)
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+
- `2xl`: 1536px+

---

## 7. Git y Versionado

### Ramas

| Patrón      | Uso                              | Ejemplo                     |
| ----------- | -------------------------------- | --------------------------- |
| `feat/`     | Nueva funcionalidad              | `feat/testimonials-module`  |
| `fix/`      | Corrección de bug                | `fix/admin-login-redirect`  |
| `docs/`     | Documentación                    | `docs/contributing-guide`   |
| `refactor/` | Refactoring sin cambio funcional | `refactor/module-registry`  |
| `test/`     | Tests                            | `test/hero-module-e2e`      |
| `chore/`    | Tareas de mantenimiento          | `chore/update-dependencies` |

### Conventional Commits

Todos los mensajes de commit siguen el estándar [Conventional Commits](https://www.conventionalcommits.org/es/):

```
<tipo>[alcance opcional]: <descripción>

[cuerpo opcional]

[pie(s) opcional(es)]
```

**Tipos permitidos:**

| Tipo       | Descripción                                     |
| ---------- | ----------------------------------------------- |
| `feat`     | Nueva funcionalidad                             |
| `fix`      | Corrección de bug                               |
| `docs`     | Cambios en documentación                        |
| `refactor` | Refactoring sin cambio funcional                |
| `test`     | Agregar o modificar tests                       |
| `chore`    | Mantenimiento, dependencias, CI                 |
| `style`    | Cambios de formato (no CSS — formato de código) |
| `perf`     | Mejora de rendimiento                           |
| `ci`       | Cambios en configuración de CI/CD               |

**Ejemplos:**

```
feat(modules): add testimonials carousel module

fix(admin): resolve session expiry redirect loop

docs(governance): add canonical patterns document

refactor(supabase): extract query builders to shared utilities

BREAKING CHANGE: module schema format changed from v1 to v2
```

### Flujo de Trabajo Git

1. **Nunca** hacer push directamente a `main`.
2. Un Pull Request por funcionalidad o corrección.
3. Squash merge a `main` (un commit limpio por PR).
4. Borrar la rama después del merge.
5. Mantener los PRs enfocados — si el diff supera 500 líneas, considerar dividir.

---

## 8. Testing

### Frameworks

| Framework      | Tipo               | Uso                                            |
| -------------- | ------------------ | ---------------------------------------------- |
| **Vitest**     | Unit / Integration | Lógica de negocio, utilidades, schemas, stores |
| **Playwright** | End-to-End         | Flujos críticos de usuario                     |

### Estructura de Tests

Los archivos de test se colocan junto al código que prueban:

```
modules/hero/
├── HeroModule.tsx
├── HeroModule.test.tsx      # Tests del componente
├── hero.schema.ts
└── hero.schema.test.ts      # Tests del schema
```

### Cobertura Mínima

| Área                                 | Cobertura mínima                                |
| ------------------------------------ | ----------------------------------------------- |
| Funciones de utilidad (`lib/utils/`) | 70%                                             |
| Schemas de Zod                       | 100% de validaciones                            |
| Zustand stores                       | 70%                                             |
| Flujos críticos E2E                  | Wizard, login admin, guardar contenido, preview |

### Convenciones de Tests

```typescript
import { describe, it, expect } from 'vitest'
import { heroSchema } from './hero.schema'

describe('heroSchema', () => {
  it('valida datos correctos del hero', () => {
    const validData = {
      title: 'Bienvenido',
      ctaText: 'Comenzar',
      ctaUrl: 'https://example.com',
    }
    expect(() => heroSchema.parse(validData)).not.toThrow()
  })

  it('rechaza título vacío', () => {
    const invalidData = {
      title: '',
      ctaText: 'Comenzar',
      ctaUrl: 'https://example.com',
    }
    expect(() => heroSchema.parse(invalidData)).toThrow()
  })
})
```

---

## 9. Documentación en Código

### JSDoc

Usar JSDoc para funciones públicas, APIs complejas y tipos no triviales:

````typescript
/**
 * Registra un nuevo módulo en el sistema de módulos de la landing page.
 *
 * @param config - Configuración del módulo incluyendo schema, componente y metadata
 * @returns El módulo registrado con su ID asignado
 * @throws {ModuleRegistryError} Si ya existe un módulo con el mismo slug
 *
 * @example
 * ```ts
 * registerModule({
 *   slug: 'testimonials',
 *   name: 'Testimonios',
 *   component: TestimonialsModule,
 *   schema: testimonialsSchema,
 * });
 * ```
 */
export function registerModule(config: ModuleConfig): RegisteredModule {
  // ...
}
````

### Qué NO documentar

- Código autoexplicativo. Si el nombre de la función y sus tipos dicen todo, no hay necesidad de JSDoc.
- Obviedades (`// incrementa el contador` sobre `counter++`).
- Comentarios que repiten lo que el tipo ya dice.

### README por Directorio

Cada directorio mayor incluye un `README.md` breve que explica:

- Qué contiene el directorio.
- Cómo se organizan los archivos.
- Cómo agregar un nuevo elemento (si aplica).

---

## 10. Rendimiento

### Carga Dinámica

Los módulos pesados se cargan con `next/dynamic`:

```typescript
import dynamic from 'next/dynamic';

const VideoModule = dynamic(() => import('@/modules/video/VideoModule'), {
  loading: () => <ModuleSkeleton height="500px" />,
});

const GalleryModule = dynamic(() => import('@/modules/gallery/GalleryModule'), {
  loading: () => <ModuleSkeleton height="600px" />,
});
```

### Imágenes

Todas las imágenes usan el componente `next/image`:

```tsx
import Image from 'next/image'
;<Image
  src={imageUrl}
  alt={descriptiveAltText} // Alt text obligatorio y descriptivo
  width={800}
  height={600}
  className="rounded-lg object-cover"
  priority={isAboveTheFold} // priority solo para imágenes above the fold
/>
```

### Fuentes

Las fuentes se cargan con `next/font/google` para evitar layout shift:

```typescript
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
})
```

### Bundle Analysis

- La configuración de CI incluye análisis de bundle size.
- Un aumento significativo sin justificación bloquea el merge.
- Usar `@next/bundle-analyzer` durante el desarrollo para detectar imports pesados.

---

## 11. Checklist de Contribución

Antes de enviar un PR, verificar que el código cumple con:

- [ ] TypeScript strict sin errores.
- [ ] Sin uso de `any`.
- [ ] Validación Zod en fronteras de API.
- [ ] Server Components por defecto, `'use client'` solo cuando es necesario.
- [ ] Estilos con Tailwind CSS, sin CSS modules ni inline styles innecesarios.
- [ ] Responsive mobile-first.
- [ ] Tests para lógica nueva.
- [ ] JSDoc en funciones públicas complejas.
- [ ] Nombres consistentes con las convenciones.
- [ ] Commit messages siguiendo Conventional Commits.
- [ ] Sin secretos ni credenciales en el código.

---

_Última actualización: Abril 2026_
_Versión del documento: 1.0_
