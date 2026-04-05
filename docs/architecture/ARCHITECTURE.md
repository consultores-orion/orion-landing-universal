# Arquitectura del Sistema — Orion Landing Universal

**Versión**: 1.0.0  
**Fecha**: 2026-04-04  
**Autor**: Luis Enrique Gutiérrez Campos  
**Estado**: Documento vivo — se actualiza con cada decisión arquitectónica

---

## 1. Visión General

Orion Landing Universal es una plantilla de landing page open-source, auto-hospedada, con un panel CMS completo integrado. El sistema permite a usuarios sin conocimientos técnicos configurar, personalizar y gestionar su sitio web completo desde el navegador, sin necesidad de editar código.

### Principios Arquitectónicos

| Principio                   | Descripción                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| **Zero-Code Configuration** | Todo se configura desde el navegador: contenido, diseño, idiomas, módulos, SEO                 |
| **Single-Tenant**           | Una instalación = un sitio. Sin complejidad multi-tenant                                       |
| **Module-First**            | Cada sección de la landing es un módulo independiente, habilitado/deshabilitado desde el admin |
| **Server-First Rendering**  | React Server Components por defecto; Client Components solo cuando hay interactividad          |
| **Security by Default**     | RLS en todas las tablas, service_role key solo en servidor, middleware de auth                 |
| **Deployment Agnóstico**    | Funciona en Vercel, Docker y Netlify sin modificar código                                      |

### Alcance Funcional

- **19 módulos** de landing page (9 existentes + 10 nuevos), todos habilitables/deshabilitables
- **Panel de administración** completo en `/admin` con dashboard, gestión de contenido, diseño, idiomas, SEO, media, leads e integraciones
- **Edición inline** en la página pública mediante toggle de modo edición
- **Sistema de i18n dinámico** — agregar/eliminar idiomas desde el admin sin tocar código
- **20 paletas de color predefinidas** por nicho, con arquitectura preparada para marketplace
- **Wizard de configuración inicial** en primera ejecución

---

## 2. Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CAPA DE CLIENTE (Navegador)                    │
│                                                                     │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐     │
│  │  Sitio       │  │  Panel Admin     │  │  Wizard de        │     │
│  │  Público     │  │  (/admin/*)      │  │  Configuración    │     │
│  │  (/)         │  │                  │  │  (/setup)         │     │
│  │              │  │  - Dashboard     │  │                   │     │
│  │  - Módulos   │  │  - Contenido     │  │  - Config inicial │     │
│  │  - i18n      │  │  - Módulos       │  │  - Admin user     │     │
│  │  - Temas     │  │  - Diseño        │  │  - Paleta         │     │
│  │  - Inline    │  │  - Idiomas       │  │  - Módulos base   │     │
│  │    Edit Mode │  │  - SEO           │  │  - Contenido demo │     │
│  │              │  │  - Media         │  │                   │     │
│  │              │  │  - Integraciones │  │                   │     │
│  │              │  │  - Leads         │  │                   │     │
│  │              │  │  - Ajustes       │  │                   │     │
│  └──────┬───────┘  └────────┬─────────┘  └─────────┬─────────┘     │
│         │                   │                       │               │
└─────────┼───────────────────┼───────────────────────┼───────────────┘
          │                   │                       │
          ▼                   ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   CAPA DE APLICACIÓN (Next.js 15)                   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     Middleware (Auth)                         │   │
│  │  - Protege /admin/* verificando sesión Supabase              │   │
│  │  - Redirige a /setup si no hay configuración inicial         │   │
│  │  - Maneja headers de seguridad                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────┐  ┌──────────────────────────────────────┐   │
│  │  App Router        │  │  API Routes (/api/*)                 │   │
│  │                    │  │                                      │   │
│  │  Server Components │  │  POST /api/setup    → Wizard         │   │
│  │  (RSC) por defecto │  │  CRUD /api/content  → Contenido      │   │
│  │                    │  │  CRUD /api/media    → Media Library   │   │
│  │  Client Components │  │  GET  /api/leads    → Exportar leads │   │
│  │  solo para:        │  │  POST /api/leads    → Captura leads  │   │
│  │  - Formularios     │  │  CRUD /api/modules  → Gestión módulos│   │
│  │  - Toggle switches │  │  CRUD /api/design   → Temas/estilos  │   │
│  │  - Inline editing  │  │  CRUD /api/i18n     → Idiomas        │   │
│  │  - Drag & drop     │  │  CRUD /api/seo      → Configuración  │   │
│  │  - Animaciones     │  │                                      │   │
│  └───────────┬───────┘  └──────────────┬───────────────────────┘   │
│              │                          │                           │
└──────────────┼──────────────────────────┼───────────────────────────┘
               │                          │
               ▼                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA DE SERVICIOS (Lógica)                      │
│                                                                     │
│  ┌──────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │  Module      │ │  i18n      │ │  Theme     │ │  Media       │  │
│  │  Registry    │ │  Engine    │ │  Engine    │ │  Service     │  │
│  │              │ │            │ │            │ │              │  │
│  │  - Registro  │ │  - Idiomas │ │  - Paletas │ │  - Upload    │  │
│  │  - Schemas   │ │  - Fallback│ │  - CSS vars│ │  - Optimiz.  │  │
│  │  - Renderer  │ │  - JSONB   │ │  - Fuentes │ │  - CDN URLs  │  │
│  │  - Defaults  │ │    content │ │  - Spacing │ │  - Thumbnails│  │
│  └──────┬───────┘ └─────┬──────┘ └─────┬──────┘ └──────┬───────┘  │
│         │               │              │               │           │
└─────────┼───────────────┼──────────────┼───────────────┼───────────┘
          │               │              │               │
          ▼               ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA DE DATOS (Supabase)                        │
│                                                                     │
│  ┌──────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │  PostgreSQL  │ │  Auth      │ │  Storage   │ │  Realtime    │  │
│  │              │ │            │ │            │ │              │  │
│  │  10 tablas   │ │  Email/    │ │  Buckets:  │ │  Suscripción │  │
│  │  con RLS     │ │  Password  │ │  - media   │ │  a cambios   │  │
│  │              │ │            │ │  - avatars │ │  de contenido│  │
│  │  JSONB para  │ │  JWT       │ │            │ │  (admin)     │  │
│  │  contenido   │ │  Tokens    │ │  Políticas │ │              │  │
│  │  multilingüe │ │            │ │  de acceso │ │              │  │
│  └──────────────┘ └────────────┘ └────────────┘ └──────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Arquitectura de Next.js 15

### 3.1 Estructura del App Router

```
src/app/
├── (public)/                  ← Grupo de rutas públicas
│   ├── layout.tsx             ← Layout público (theme provider, i18n provider)
│   └── page.tsx               ← Landing page principal (RSC)
│
├── admin/                     ← Panel de administración (protegido)
│   ├── layout.tsx             ← Layout admin (sidebar, auth guard)
│   ├── dashboard/page.tsx     ← Dashboard con estadísticas
│   ├── content/page.tsx       ← Editor de contenido por módulo
│   ├── modules/page.tsx       ← Gestión de módulos (activar/desactivar/reordenar)
│   ├── design/page.tsx        ← Paletas, tipografía, espaciado
│   ├── languages/page.tsx     ← Gestión de idiomas
│   ├── seo/page.tsx           ← Meta tags, OG, structured data
│   ├── media/page.tsx         ← Biblioteca de medios
│   ├── integrations/page.tsx  ← Google Analytics, Meta Pixel, WhatsApp, etc.
│   ├── leads/page.tsx         ← Tabla de leads capturados
│   └── settings/page.tsx      ← Configuración general del sitio
│
├── setup/                     ← Wizard de primera ejecución
│   └── page.tsx               ← Flujo paso a paso
│
└── api/                       ← API Routes (Route Handlers)
    ├── setup/route.ts
    ├── content/route.ts
    ├── media/route.ts
    ├── leads/route.ts
    ├── modules/route.ts
    ├── design/route.ts
    ├── i18n/route.ts
    └── seo/route.ts
```

### 3.2 Server Components vs Client Components

La estrategia sigue el principio de Next.js 15: **Server Components por defecto**, Client Components solo cuando se requiere interactividad.

| Tipo                 | Uso                                                                                 | Justificación                                                            |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Server Component** | Página pública, layout público, renderizado de módulos, lectura de datos            | Mejor rendimiento, menor bundle, acceso directo a Supabase server client |
| **Client Component** | Formularios, toggles, drag & drop, inline editing, animaciones, selectores de color | Requieren estado del navegador, eventos de usuario, APIs del DOM         |

**Regla de composición**: Los Server Components pueden importar Client Components, pero no viceversa. El patrón es que el Server Component obtiene datos y los pasa como props al Client Component.

```
// Patrón: Server Component wrapper
// src/app/(public)/page.tsx (Server Component)
async function LandingPage() {
  const modules = await getActiveModules()      // Supabase server client
  const theme = await getThemeConfig()           // Supabase server client
  const lang = await getDefaultLanguage()        // Supabase server client

  return (
    <ThemeProvider theme={theme}>                {/* Client Component */}
      <I18nProvider lang={lang}>                 {/* Client Component */}
        {modules.map(mod => (
          <ModuleRenderer                        {/* Server Component */}
            key={mod.id}
            module={mod}
          />
        ))}
      </I18nProvider>
    </ThemeProvider>
  )
}
```

### 3.3 Middleware

El middleware de Next.js 15 se ejecuta en el edge antes de cada request. Se utiliza para:

1. **Protección de rutas `/admin/*`**: Verifica la sesión de Supabase; redirige a login si no existe
2. **Detección de primera ejecución**: Si `site_config` está vacío, redirige a `/setup`
3. **Resolución de idioma**: Lee cookie/header `Accept-Language` para determinar el idioma activo
4. **Headers de seguridad**: Inyecta CSP, X-Frame-Options, etc.

```
// src/middleware.ts
export const config = {
  matcher: ['/admin/:path*', '/setup', '/']
}
```

---

## 4. Flujo de Datos

### 4.1 Renderizado de la Página Pública (Request Flow)

```
Navegador                Next.js 15 (Server)           Supabase
   │                           │                          │
   │  GET /                    │                          │
   │ ─────────────────────────>│                          │
   │                           │                          │
   │                     Middleware                        │
   │                     - Verificar setup                │
   │                     - Resolver idioma                │
   │                           │                          │
   │                     Server Component                 │
   │                     page.tsx                         │
   │                           │  SELECT * FROM           │
   │                           │  page_modules            │
   │                           │  WHERE is_visible = true │
   │                           │  ORDER BY display_order  │
   │                           │ ────────────────────────>│
   │                           │                          │
   │                           │  ← rows[]               │
   │                           │ <────────────────────────│
   │                           │                          │
   │                     Para cada módulo:                │
   │                     1. Registry.get(section_key)     │
   │                     2. Extraer content[lang]         │
   │                     3. Aplicar theme styles          │
   │                     4. Renderizar componente         │
   │                           │                          │
   │  ← HTML completo (RSC)   │                          │
   │ <─────────────────────────│                          │
   │                           │                          │
   │  Hydration selectiva      │                          │
   │  (solo Client Components) │                          │
```

### 4.2 Estructura de Contenido Multilingüe

Todo el contenido se almacena en JSONB con claves de idioma. El Server Component extrae el idioma activo antes de renderizar:

```json
// page_modules.content (JSONB)
{
  "es": {
    "title": "Bienvenido a nuestro servicio",
    "subtitle": "La mejor solución para tu negocio",
    "cta_text": "Comenzar ahora"
  },
  "en": {
    "title": "Welcome to our service",
    "subtitle": "The best solution for your business",
    "cta_text": "Get started now"
  }
}
```

**Estrategia de fallback**: Si el contenido en el idioma solicitado no existe, se utiliza el idioma marcado como `is_default` en la tabla `languages`.

**Prioridad de resolucion de idioma** (sin contradiccion):

| Prioridad | Fuente                           | Proposito                                                                |
| :-------: | -------------------------------- | ------------------------------------------------------------------------ |
|     1     | URL query param `?lang=`         | Enlace directo a un idioma especifico                                    |
|     2     | Cookie/localStorage `orion_lang` | **Preferencia del usuario** — el usuario eligio este idioma activamente  |
|     3     | Header `Accept-Language`         | Idioma del navegador (deteccion automatica)                              |
|     4     | `languages.is_default` en BD     | **Default del sitio** — configurado por el admin como fallback universal |

La cookie (prioridad 2) y el default de la BD (prioridad 4) no se contradicen: la cookie representa la **eleccion activa del usuario** y siempre toma precedencia. El `is_default` de la BD es el fallback cuando no existe preferencia previa (primer visitante, cookie expirada, nuevo dispositivo).

### 4.3 Flujo de Escritura (Admin → Supabase)

```
Admin Panel (Client)     API Route (Server)          Supabase
   │                           │                          │
   │  POST /api/content        │                          │
   │  { module_id, content }   │                          │
   │ ─────────────────────────>│                          │
   │                           │                          │
   │                     1. Validar sesión (JWT)          │
   │                     2. Validar input (Zod)           │
   │                     3. Sanitizar contenido           │
   │                           │                          │
   │                           │  UPDATE page_modules     │
   │                           │  SET content = $1        │
   │                           │  WHERE id = $2           │
   │                           │ ────────────────────────>│
   │                           │                          │
   │                           │  ← success               │
   │                           │ <────────────────────────│
   │                           │                          │
   │  ← 200 OK                │                          │
   │ <─────────────────────────│                          │
   │                           │                          │
   │  revalidatePath('/')      │                          │
   │  (ISR revalidation)       │                          │
```

---

## 5. Arquitectura del Admin Panel

### 5.1 Layout y Navegación

El admin panel utiliza un layout persistente con sidebar de navegación. El layout es un Client Component que mantiene el estado de la sidebar (colapsada/expandida).

```
┌────────────────────────────────────────────────────────┐
│  Logo Orion         [Toggle Sidebar]    [User Menu]    │
├──────────┬─────────────────────────────────────────────┤
│          │                                             │
│ Dashboard│         Área de Contenido                   │
│ Contenido│                                             │
│ Módulos  │  ┌─────────────────────────────────────┐    │
│ Diseño   │  │                                     │    │
│ Idiomas  │  │   Componente de Página Activa       │    │
│ SEO      │  │   (Server Component que carga       │    │
│ Media    │  │    datos + Client Component para     │    │
│ Integrac.│  │    interactividad)                   │    │
│ Leads    │  │                                     │    │
│ Ajustes  │  └─────────────────────────────────────┘    │
│          │                                             │
│──────────│                                             │
│ [Edición │                                             │
│  Inline] │  ← Toggle que abre la página pública en    │
│          │    modo edición                             │
│ [Salir]  │                                             │
└──────────┴─────────────────────────────────────────────┘
```

### 5.2 Secciones del Admin

| Sección           | Ruta                  | Descripción                                                             |
| ----------------- | --------------------- | ----------------------------------------------------------------------- |
| **Dashboard**     | `/admin/dashboard`    | Estadísticas: leads recientes, módulos activos, idiomas, última edición |
| **Contenido**     | `/admin/content`      | Editor de contenido por módulo con selector de idioma                   |
| **Módulos**       | `/admin/modules`      | Activar/desactivar módulos, reordenar con drag & drop                   |
| **Diseño**        | `/admin/design`       | Selector de paleta, tipografía, espaciado, border-radius                |
| **Idiomas**       | `/admin/languages`    | Agregar/eliminar idiomas, establecer idioma por defecto                 |
| **SEO**           | `/admin/seo`          | Meta tags, Open Graph, robots.txt, structured data                      |
| **Media**         | `/admin/media`        | Biblioteca de imágenes con upload, carpetas, alt text multilingüe       |
| **Integraciones** | `/admin/integrations` | Google Analytics, Meta Pixel, WhatsApp, Calendly, SMTP                  |
| **Leads**         | `/admin/leads`        | Tabla de leads capturados, filtros, exportar CSV                        |
| **Ajustes**       | `/admin/settings`     | Nombre del sitio, logo, favicon, contacto, redes sociales               |

### 5.3 Edición Inline

Además del admin panel completo, existe un modo de edición inline. Cuando un usuario autenticado visita la página pública y activa el toggle de edición:

1. Se inyecta una barra superior con controles de edición
2. Los módulos exponen áreas editables (textos, imágenes) con overlays interactivos
3. Los cambios se guardan vía API routes al hacer clic en "Guardar"
4. El modo se activa/desactiva con un botón en la barra de admin

Este modo es un complemento para edición rápida de contenido. Las operaciones complejas (reordenar módulos, cambiar tema, gestionar idiomas) requieren el admin panel completo.

---

## 6. Sistema de Módulos

### 6.1 Patrón Registry

El sistema de módulos utiliza un **patrón Registry** que mapea cada `section_key` a su componente React, esquema de campos editables y contenido por defecto.

```
src/
  lib/modules/
    registry.ts              ← Registro central
  components/modules/
    hero/
      HeroModule.tsx         ← Componente React
      hero.schema.ts         ← Esquema de campos editables
      hero.seed.ts           ← Contenido por defecto (multilingüe)
    value_prop/
      ValuePropModule.tsx
      value-prop.schema.ts
      value-prop.seed.ts
    ... (19 módulos total)
```

**Registry central** (`registry.ts`):

```typescript
// Ejemplo conceptual del registro
const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  hero: {
    component: lazy(() => import('@/components/modules/hero/HeroModule')),
    schema: heroSchema,
    seed: heroSeed,
    displayName: 'Hero / Banner Principal',
    category: 'header',
    isSystem: false,
  },
  // ... 18 módulos más
}
```

### 6.2 Los 19 Módulos

| #   | section_key     | Nombre                      | Categoría  | Sistema |
| --- | --------------- | --------------------------- | ---------- | ------- |
| 1   | `hero`          | Hero / Banner Principal     | Header     | No      |
| 2   | `value_prop`    | Propuesta de Valor          | Content    | No      |
| 3   | `how_it_works`  | Cómo Funciona               | Content    | No      |
| 4   | `social_proof`  | Prueba Social / Testimonios | Trust      | No      |
| 5   | `client_logos`  | Logos de Clientes           | Trust      | No      |
| 6   | `offer_form`    | Formulario de Contacto      | Conversion | No      |
| 7   | `faq`           | Preguntas Frecuentes        | Content    | No      |
| 8   | `final_cta`     | CTA Final                   | Conversion | No      |
| 9   | `footer`        | Pie de Página               | Footer     | Sí      |
| 10  | `stats`         | Estadísticas / Contadores   | Trust      | No      |
| 11  | `pricing`       | Planes y Precios            | Conversion | No      |
| 12  | `video`         | Video Destacado             | Media      | No      |
| 13  | `team`          | Equipo                      | Trust      | No      |
| 14  | `gallery`       | Galería de Imágenes         | Media      | No      |
| 15  | `features_grid` | Grid de Características     | Content    | No      |
| 16  | `countdown`     | Cuenta Regresiva            | Urgency    | No      |
| 17  | `comparison`    | Tabla Comparativa           | Conversion | No      |
| 18  | `newsletter`    | Suscripción Newsletter      | Conversion | No      |
| 19  | `map_location`  | Mapa / Ubicación            | Contact    | No      |

### 6.3 Renderizado de Módulos

El renderizado sigue este flujo:

1. **Server Component** (`page.tsx`) consulta `page_modules` ordenados por `display_order` donde `is_visible = true`
2. Para cada módulo, se consulta el **Registry** con el `section_key`
3. Se extrae el contenido en el idioma activo del JSONB
4. Se aplican los estilos del módulo (`styles` JSONB) y del tema global
5. Se renderiza el componente React correspondiente

```typescript
// Flujo conceptual del ModuleRenderer
function ModuleRenderer({ module, lang }: Props) {
  const definition = MODULE_REGISTRY[module.section_key]
  if (!definition) return null

  const Component = definition.component
  const content = module.content[lang] ?? module.content[defaultLang]
  const styles = module.styles

  return (
    <section id={module.section_key} style={applyStyles(styles)}>
      <Component content={content} styles={styles} />
    </section>
  )
}
```

### 6.4 Extensibilidad Futura

El patrón Registry está diseñado para soportar un futuro marketplace de módulos:

- **Agregar módulo** = agregar carpeta en `components/modules/` + registrar en `registry.ts`
- Cada módulo es autocontenido: componente, esquema y seed
- Los esquemas definen qué campos son editables y de qué tipo (text, richtext, image, color, url, array)
- El admin panel genera formularios de edición automáticamente a partir del esquema

---

## 7. Estrategia de Deployment

### 7.1 Vercel (Primario)

Vercel es la plataforma primaria de deployment:

- **Zero-config** para Next.js 15 — detección automática del framework
- Soporte nativo para Server Components, API Routes y Middleware
- Edge Runtime para el middleware de auth
- Preview deployments automáticos por branch
- Dominio personalizado + SSL automático

**Variables de entorno requeridas**:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 7.2 Docker (Self-Hosted)

Para usuarios que prefieren hosting en VPS o infraestructura propia:

- `Dockerfile` con multi-stage build (dependencias → build → producción)
- `docker-compose.yml` para levantar Next.js + proxy inverso (opcional)
- Imagen basada en `node:20-alpine` para tamaño mínimo
- Soporte para `standalone` output de Next.js
- Health check endpoint en `/api/health`

### 7.3 Netlify (Secundario)

Como opción alternativa de plataforma cloud:

- Utiliza el adaptador `@netlify/next` para compatibilidad con Next.js 15
- Netlify Functions para API Routes
- Redirects configurados en `netlify.toml`

### 7.4 Limitaciones

- **Static export (`next export`) NO es viable**: El sistema depende de API Routes, Server Components con data fetching dinámico y middleware — todas funcionalidades que requieren un servidor Node.js o runtime equivalente.
- Ver **ADR-006** para la justificación completa de esta decisión.

---

## 8. Decisiones Técnicas Clave

Las decisiones arquitectónicas importantes están documentadas como Architecture Decision Records (ADRs):

| ADR                                               | Título                                      | Estado   |
| ------------------------------------------------- | ------------------------------------------- | -------- |
| [ADR-001](adr/ADR-001-framework-nextjs15.md)      | Framework: Next.js 15                       | Aceptado |
| [ADR-002](adr/ADR-002-backend-supabase.md)        | Backend: Supabase                           | Aceptado |
| [ADR-003](adr/ADR-003-admin-separate-route.md)    | Admin como ruta separada /admin             | Aceptado |
| [ADR-004](adr/ADR-004-i18n-dynamic.md)            | i18n dinámico desde admin                   | Aceptado |
| [ADR-005](adr/ADR-005-module-registry.md)         | Patrón Registry para módulos                | Aceptado |
| [ADR-006](adr/ADR-006-deployment-strategy.md)     | Estrategia de deployment multi-plataforma   | Aceptado |
| [ADR-007](adr/ADR-007-theme-marketplace-ready.md) | Sistema de temas preparado para marketplace | Aceptado |

---

## 9. Tecnologías y Versiones

| Tecnología   | Versión | Propósito                                        |
| ------------ | ------- | ------------------------------------------------ |
| Next.js      | 15.x    | Framework principal (App Router)                 |
| React        | 19.x    | Biblioteca de UI                                 |
| TypeScript   | 5.x     | Tipado estático                                  |
| Tailwind CSS | 4.x     | Utilidades CSS                                   |
| Supabase     | Latest  | Backend-as-a-Service (PostgreSQL, Auth, Storage) |
| shadcn/ui    | Latest  | Componentes UI para el admin panel               |
| Zod          | 3.x     | Validación de esquemas en API routes             |
| DND Kit      | Latest  | Drag & drop para reordenar módulos               |

---

## 10. Convenciones de Código

### Nomenclatura de Archivos

- **Componentes**: PascalCase (`HeroModule.tsx`)
- **Utilidades y libs**: camelCase (`registry.ts`, `client.ts`)
- **Tipos**: PascalCase para interfaces, camelCase para archivos (`database.ts`)
- **API Routes**: `route.ts` dentro del directorio correspondiente

### Organización de Imports

```typescript
// 1. Módulos de Next.js
import { NextResponse } from 'next/server'

// 2. Librerías externas
import { z } from 'zod'

// 3. Componentes internos
import { Button } from '@/components/ui/button'

// 4. Utilidades y tipos internos
import { createServerClient } from '@/lib/supabase/server'
import type { PageModule } from '@/types/modules'
```

### Server vs Client

- Todo archivo es Server Component por defecto
- Solo agregar `'use client'` cuando sea estrictamente necesario
- Los Client Components se mantienen lo más pequeños posible (leaf components)
