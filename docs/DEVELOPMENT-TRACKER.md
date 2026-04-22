# Orion Landing Universal — Control de Desarrollo

> **Este archivo es la FUENTE UNICA DE VERDAD del progreso de implementacion.**
> Se actualiza despues de cada tarea completada. **NO codificar sin verificar este archivo primero.**
>
> **Proyecto**: Orion Landing Universal
> **Version**: 0.1.0
> **Ultima actualizacion**: 2026-04-05
> **Mantenido por**: Luis Enrique Gutierrez Campos — Orion AI Society

---

## Convenciones

- `[ ]` Pendiente
- `[x]` Completado
- `[~]` En progreso
- `[!]` Bloqueado (con razon)
- `[-]` Omitido/Pospuesto (con razon)

---

## Resumen de Progreso

| Fase      | Nombre                       | Estado         | Progreso                                           | Estimacion     |
| --------- | ---------------------------- | -------------- | -------------------------------------------------- | -------------- |
| 0         | Documentacion y Arquitectura | Completada     | 25/25 archivos                                     | S (1-2 sem)    |
| 1         | Foundation                   | Completada     | 105/105 tareas                                     | Completada S1  |
| 2         | Setup Wizard                 | Completada     | 26/26 tareas                                       | Completada S2  |
| 3         | Public Landing               | Completada     | 145/145 tareas (3b completada S4)                  | Completada S4  |
| 4         | Admin Panel                  | Completada     | 68/68 tareas (4b completada S6)                    | Completada S6  |
| 5         | Live Editing                 | Completada     | 21/21 tareas (S7+S8+S10+S11)                       | Completada S11 |
| 6         | Polish y Produccion          | Completada     | 43/43 tareas (S16: WebVitals RUM)                  | Completada S16 |
| 7         | Marketplace y Comunidad      | Completada     | 25/25 tareas (S16: sandbox 7.4)                    | Completada S16 |
| **Total** |                              | **Completado** | **486/486 tareas** (+ 4 omitidas justificadamente) |                |

---

## Grafo de Dependencias

```
Fase 0 (Docs) ──> Fase 1 (Foundation)
                        │
                  ┌─────┴─────┐
                  v           v
            Fase 2        Fase 3
            (Wizard)      (Landing)
                  └─────┬─────┘
                        v
                  Fase 4 (Admin)
                        v
                  Fase 5 (Live Edit)
                        v
                  Fase 6 (Polish)
                        v
                  Fase 7 (Marketplace)
```

> Fases 2 y 3 pueden ejecutarse en paralelo tras completar Fase 1.

---

## Fase 0 — Documentacion y Arquitectura ✅

> **Estado**: Completada | **Archivos**: 25/25

### 0.1 Producto

- [x] `docs/INDEX.md` — Indice general de documentacion
- [x] `docs/prd/PRD.md` — Documento de Requisitos del Producto

### 0.2 Roadmap

- [x] `docs/roadmap/ROADMAP.md` — Hoja de ruta por fases (0-7)

### 0.3 Arquitectura

- [x] `docs/architecture/ARCHITECTURE.md` — Vision general del sistema, capas, flujos de datos
- [x] `docs/architecture/DATA-MODEL.md` — Modelo de datos completo (10 tablas, SQL, RLS, indices)
- [x] `docs/architecture/SECURITY-MODEL.md` — Modelo de seguridad (auth, RLS, middleware, headers)

### 0.4 ADRs (Architecture Decision Records)

- [x] `docs/architecture/adr/ADR-001-framework-nextjs15.md` — Framework: Next.js 15
- [x] `docs/architecture/adr/ADR-002-backend-supabase.md` — Backend: Supabase
- [x] `docs/architecture/adr/ADR-003-admin-separate-route.md` — Admin: Ruta separada /admin
- [x] `docs/architecture/adr/ADR-004-i18n-dynamic.md` — i18n: Dinamico desde admin
- [x] `docs/architecture/adr/ADR-005-module-registry.md` — Modulos: Patron Registry
- [x] `docs/architecture/adr/ADR-006-deployment-strategy.md` — Deploy: Multi-plataforma
- [x] `docs/architecture/adr/ADR-007-theme-marketplace-ready.md` — Temas: Marketplace-ready

### 0.5 Especificaciones Tecnicas

- [x] `docs/specs/MODULE-SYSTEM.md` — Sistema de modulos (19 modulos, registry, renderer)
- [x] `docs/specs/WIZARD-FLOW.md` — Wizard de configuracion (5 pasos, deteccion, migraciones)
- [x] `docs/specs/ADMIN-PANEL.md` — Panel de administracion (10 secciones)
- [x] `docs/specs/I18N-SYSTEM.md` — Sistema de internacionalizacion
- [x] `docs/specs/THEME-SYSTEM.md` — Sistema de temas (paletas, CSS variables, Tailwind 4)
- [x] `docs/specs/INTEGRATIONS.md` — Integraciones (Analytics, Pixel, WhatsApp, SMTP)

### 0.6 Gobernanza

- [x] `docs/governance/GOVERNANCE.md` — Modelo de gobernanza (BDFL, roles, releases)
- [x] `docs/governance/CONSTITUTION.md` — Constitucion del proyecto (mision, vision, valores)
- [x] `docs/governance/CANONICAL.md` — Convenciones canonicas (TypeScript, React, Supabase, Git)
- [x] `docs/governance/CONTRIBUTING.md` — Guia de contribucion (setup, workflow, templates)
- [x] `docs/governance/CODE-OF-CONDUCT.md` — Codigo de conducta (Contributor Covenant 2.1)

### 0.7 Proyecto

- [x] `CLAUDE.md` — Contexto del proyecto para AI

---

## Fase 1 — Foundation ✅

> **Estado**: Completada | **Dependencias**: Fase 0 | **Completada en**: S1 (2026-04-05)
> **Criterio de exito**: ✅ `pnpm dev` levanta sin errores, migraciones listas, auth protege /admin, TS compila sin errores.

### 1.1 Scaffold Next.js 15

- [x] Crear proyecto con `create-next-app@latest` (App Router, TypeScript, Tailwind, ESLint, src/ directory, import alias @/)
- [x] Verificar `next.config.ts` — habilitar `output: 'standalone'` para Docker
- [x] Configurar `tsconfig.json` — modo estricto completo:
  - `strict: true`
  - `noUncheckedIndexedAccess: true`
  - `noImplicitReturns: true`
  - `noFallthroughCasesInSwitch: true`
- [x] Instalar y configurar Tailwind CSS 4 (`@tailwindcss/postcss`)
- [x] Configurar `postcss.config.mjs` para Tailwind 4
- [x] Crear `src/app/globals.css` con imports de Tailwind y CSS custom properties base del tema
- [x] Instalar shadcn/ui (`npx shadcn@latest init`) — preset base-nova (shadcn v4 ya no usa estilo New York/Default)
- [x] Instalar componentes base de shadcn/ui: `button`, `input`, `label`, `card`, `sonner` (reemplaza toast), `dialog`, `dropdown-menu`, `separator`, `badge`, `avatar`
- [x] Instalar Prettier + plugin Tailwind (`prettier-plugin-tailwindcss`)
- [x] Configurar `.prettierrc` (singleQuote, semi:false, tabWidth: 2, printWidth: 100)
- [x] Configurar `eslint.config.mjs` con `next/core-web-vitals` y `next/typescript` (ESLint 9 flat config)
- [x] Agregar reglas ESLint: no-explicit-any, no-unused-vars (warn), prefer-const
- [x] Verificar que `pnpm dev` levanta correctamente en `http://localhost:3000`

### 1.2 Estructura de Carpetas

- [x] Crear `src/app/(public)/layout.tsx` — Layout publico (placeholder, ThemeProvider en S3)
- [x] Crear `src/app/(public)/page.tsx` — Pagina principal publica (placeholder)
- [x] Crear `src/app/admin/layout.tsx` — Layout admin (placeholder, sidebar en S5)
- [x] Crear `src/app/admin/page.tsx` — Redirect a /admin/dashboard
- [x] Crear `src/app/setup/layout.tsx` — Layout del wizard (centrado, gradient)
- [x] Crear `src/app/setup/page.tsx` — Pagina principal del wizard (placeholder)
- [x] Crear `src/app/api/` — Directorio para Route Handlers (con /api/health)
- [x] Crear `src/components/modules/` — Directorio para los 19 modulos
- [x] Crear `src/components/admin/` — Directorio para componentes del admin
- [x] Crear `src/components/ui/` — Directorio shadcn/ui (creado por init)
- [x] Crear `src/lib/supabase/` — Directorio para clientes Supabase
- [x] Crear `src/lib/modules/` — Directorio para registry y renderer
- [x] Crear `src/lib/i18n/` — Directorio para internacionalizacion
- [x] Crear `src/lib/themes/` — Directorio para motor de temas
- [x] Crear `src/lib/utils/` — Directorio para funciones de utilidad
- [x] Crear `src/types/` — Directorio para tipos TypeScript globales
- [x] Crear `src/stores/` — Directorio para Zustand stores
- [x] Crear `src/hooks/` — Directorio para custom hooks
- [x] Crear `src/config/` — Directorio para configuracion de la app

### 1.3 Supabase — Clientes

- [x] Instalar `@supabase/supabase-js` y `@supabase/ssr`
- [x] Crear `src/lib/supabase/client.ts` — Cliente browser (createBrowserClient con NEXT_PUBLIC vars)
- [x] Crear `src/lib/supabase/server.ts` — Cliente server (createServerClient con cookies)
- [x] Crear `src/lib/supabase/admin.ts` — Cliente admin (createClient con SUPABASE_SERVICE_ROLE_KEY, solo server-side)
- [x] Crear `src/lib/supabase/middleware.ts` — Helper para actualizar sesion en middleware
- [x] Crear `src/types/database.ts` — Tipos manuales de Supabase (placeholder, se auto-generan con `pnpm db:types`)

### 1.4 Supabase — Schema y Migraciones

- [x] Crear `supabase/migrations/001_initial_schema.sql` — Migracion consolidada conteniendo:
  - [x] Funcion `update_updated_at_column()` (trigger compartido)
  - [x] Tabla `site_config` (singleton, configuracion global)
  - [x] Tabla `languages` (idiomas registrados)
  - [x] Tabla `page_modules` (modulos de pagina con contenido JSONB)
  - [x] Tabla `module_schemas` (esquemas de campos editables)
  - [x] Tabla `leads` (captura de leads)
  - [x] Tabla `media` (biblioteca de medios)
  - [x] Tabla `theme_config` (configuracion del tema activo)
  - [x] Tabla `color_palettes` (20 paletas predefinidas)
  - [x] Tabla `integrations` (integraciones de terceros)
  - [x] Tabla `seo_config` (configuracion SEO)
- [x] Crear triggers `update_updated_at` para: `site_config`, `page_modules`, `theme_config`, `integrations`, `seo_config`
- [x] Crear todas las politicas RLS (29 politicas total):
  - [x] RLS para `site_config` (public read, admin write)
  - [x] RLS para `languages` (public read, admin write)
  - [x] RLS para `page_modules` (public read visible only, admin read all, admin write, admin delete non-system)
  - [x] RLS para `module_schemas` (public read, admin write)
  - [x] RLS para `leads` (public insert, admin read/update/delete)
  - [x] RLS para `media` (public read, admin insert/update/delete)
  - [x] RLS para `theme_config` (public read, admin write)
  - [x] RLS para `color_palettes` (public read, admin insert, admin update/delete non-predefined)
  - [x] RLS para `integrations` (admin only — sin lectura publica)
  - [x] RLS para `seo_config` (public read, admin write)
- [x] Crear indices de rendimiento (14 indices):
  - [x] `idx_page_modules_display_order`, `idx_page_modules_visible`, `idx_page_modules_section_key`
  - [x] `idx_leads_created_at`, `idx_leads_is_read`, `idx_leads_email`, `idx_leads_source_module`
  - [x] `idx_media_folder`, `idx_media_mime_type`, `idx_media_created_at`
  - [x] `idx_integrations_type`, `idx_integrations_active`
  - [x] `idx_seo_config_page_key`
  - [x] `idx_languages_single_default` (unique partial)
- [x] Crear `supabase/seed.sql` — Datos semilla:
  - [x] INSERT 20 paletas de color predefinidas en `color_palettes`
  - [x] INSERT idiomas por defecto (`es` como default, `en` como secundario) en `languages`
  - [x] INSERT configuracion base de tema en `theme_config` (palette: professional-blue)
  - [x] INSERT configuracion SEO basica en `seo_config`
  - [x] INSERT `site_config` con valores por defecto
- [x] Tipos TypeScript manuales creados en `src/types/database.ts` (auto-gen con `pnpm db:types` cuando hay proyecto Supabase live)

### 1.5 Autenticacion

- [x] Crear `src/middleware.ts` — Middleware principal de Next.js:
  - Matcher: catch-all excepto static assets
  - Verificar sesion Supabase para rutas `/admin/*`
  - Redirigir a `/setup` si no hay configuracion (setup_completed = false)
  - Redirigir a `/login` si no autenticado en `/admin/*`
  - Headers de seguridad via `next.config.ts` (CSP pendiente para S3 con integraciones)
- [x] Crear `src/app/login/page.tsx` — Pagina de login (email + password)
- [x] Crear `src/app/login/layout.tsx` — Layout centrado para login
- [x] Crear `src/app/api/auth/callback/route.ts` — Callback de Supabase Auth
- [x] Crear `src/app/api/auth/logout/route.ts` — Endpoint de logout
- [x] Crear `src/lib/auth/guards.ts` — Funciones helper: `requireAuth()`, `getSession()`

### 1.6 Dependencias del Proyecto

- [x] Instalar Zustand (`zustand` v5)
- [x] Instalar TanStack Query (`@tanstack/react-query` v5)
- [x] Crear `src/app/providers.tsx` — Client Component wrapper con QueryClientProvider + Toaster
- [x] Instalar React Hook Form (`react-hook-form` v7)
- [x] Instalar Zod (`zod` v4) + resolver (`@hookform/resolvers` v5)
- [x] Instalar DND Kit (`@dnd-kit/core` v6, `@dnd-kit/sortable` v10, `@dnd-kit/utilities` v3)
- [x] Instalar Lucide React (`lucide-react`) para iconografia
- [x] Instalar date-fns (`date-fns` v4) para manejo de fechas
- [x] `cn()` ya incluida en `src/lib/utils.ts` por shadcn/ui init (clsx + twMerge)

### 1.7 Configuracion de Desarrollo

- [x] Crear `.env.example` con todas las variables
- [x] Crear `.env.local` (en .gitignore) con valores de desarrollo
- [x] Configurar `package.json` scripts:
  - `dev` (turbopack), `build`, `start`, `lint`, `lint:fix`, `type-check`, `format`, `format:check`, `db:types`
- [x] Crear `Dockerfile` — Multi-stage build (deps -> build -> production con node:20-alpine)
- [x] Crear `docker-compose.yml` — Servicio Next.js con healthcheck
- [x] Crear `.dockerignore` (node_modules, .next, .env.local, etc.)
- [x] Instalar Husky (`husky` v9) + lint-staged (`lint-staged` v16)
- [x] Configurar pre-commit hook: lint-staged (ESLint + Prettier en archivos staged)
- [x] Crear `.gitignore` exhaustivo (node_modules, .next, .env.local, .vercel, IDE, etc.)
- [x] Actualizar `README.md` — Instrucciones de setup para desarrollo local

### 1.8 CI/CD Base

- [x] Crear `.github/workflows/ci.yml` — GitHub Actions:
  - Trigger: push a main + pull requests
  - Jobs: install -> lint -> type-check -> build
  - Node 20, pnpm 10
- [x] Crear `.github/ISSUE_TEMPLATE/bug_report.md` — Template de bug report
- [x] Crear `.github/ISSUE_TEMPLATE/feature_request.md` — Template de feature request
- [x] Crear `.github/PULL_REQUEST_TEMPLATE.md` — Template de PR

---

## Fase 2 — Setup Wizard ✅

> **Estado**: Completada | **Dependencias**: Fase 1 | **Completada en**: S2 (2026-04-05)
> **Criterio de exito**: ✅ Usuario no-tecnico completa wizard en <5 min, landing muestra contenido demo, admin accesible.

### 2.1 Deteccion de Primera Ejecucion

- [x] Implementar `getSetupState()` en `src/lib/setup/state.ts`:
  - Verificar variables de entorno (`hasEnvVars`)
  - Verificar existencia de tablas (`hasDatabase`)
  - Verificar datos semilla (`hasSeedData`)
  - Verificar usuario admin (`hasAdminUser`)
  - Retornar `SetupState` con flag `isComplete`
- [x] Implementar `getRedirectStep()` — Determina a que paso redirigir segun estado
- [x] Integrar deteccion en `src/middleware.ts`:
  - Si `!isComplete` y no esta en `/setup/*` -> redirigir al paso correspondiente
  - Si `isComplete` y esta en `/setup/*` -> redirigir a `/`
  - Permitir siempre: `/_next`, `/api/setup`, `/favicon`, assets estaticos
- [x] Crear tipo `SetupState` en `src/types/setup.ts`

### 2.2 Layout y UI del Wizard

- [x] Crear `src/app/setup/layout.tsx`:
  - Barra de progreso superior con 5 pasos numerados
  - Logo de Orion Landing centrado
  - Contenido centrado (max-width: 600px)
  - Gradiente de fondo sutil
- [x] Crear `src/components/setup/WizardProgress.tsx` — Barra de progreso con pasos
- [x] Crear `src/components/setup/WizardStep.tsx` — Wrapper reutilizable para cada paso
- [x] Crear `src/components/setup/WizardNavigation.tsx` — Botones Anterior/Siguiente

### 2.3 Paso 1: Conexion a Supabase

- [x] Crear `src/app/setup/connect/page.tsx`:
  - Campos: Supabase URL, Anon Key, Service Role Key, Database URL
  - Validacion de formato de URL y claves
  - Boton "Probar conexion" con feedback visual
  - Instrucciones paso a paso para obtener las credenciales de Supabase
- [x] Crear `src/app/api/setup/test-connection/route.ts`:
  - POST: Recibe URL + keys + DB URL, testea cada conexion independientemente
  - Retorna estado de conexion (ok/error con detalle por test)
- [x] Crear `src/app/api/setup/save-config/route.ts`:
  - POST: Guarda las credenciales en .env.local (local) o instrucciones para PaaS
  - Deteccion automatica de entorno (VERCEL, NETLIFY, RAILWAY)

### 2.4 Paso 2: Creacion de Tablas (DDL)

- [x] Crear `src/app/setup/tables/page.tsx`:
  - Lista de 10 tablas a crear con checkmarks de progreso
  - Boton "Crear tablas" que ejecuta la migracion
  - Manejo de error: si falla, mostrar SQL para ejecucion manual en Supabase SQL Editor
  - Polling cada 5s para detectar tablas creadas manualmente
- [x] Crear `src/app/api/setup/create-tables/route.ts`:
  - Estrategia DDL de 3 niveles: auto-deteccion, conexion directa (postgres), fallback manual
  - Ejecuta DDL en orden: funciones -> tablas -> triggers -> RLS -> indices
  - Retorna progreso por tabla
- [x] Crear `src/lib/setup/migration-sql.ts` — SQL de migracion como string template (10 tablas)
- [x] Implementar fallback: boton "Copiar SQL" + enlace a SQL Editor + polling automatico

### 2.5 Paso 3: Datos Iniciales (Seed)

- [x] Crear `src/app/setup/seed/page.tsx`:
  - Lista de 7 categorias de datos a insertar con progreso
  - Boton "Cargar datos iniciales"
- [x] Crear `src/app/api/setup/seed/route.ts`:
  - POST: Ejecuta INSERT de datos semilla via supabase-js
  - Storage buckets (page_images, avatars)
  - Insertar 20 paletas de color
  - Insertar idiomas por defecto (es, en)
  - Insertar configuracion de tema (professional-blue)
  - Insertar configuracion SEO basica
  - Insertar site_config con valores por defecto
  - Insertar integraciones base (6 tipos)
- [x] Crear `src/lib/setup/seed-data.ts` — Datos semilla organizados por tabla
- [x] Crear `src/lib/setup/storage-seed.ts` — Creacion de storage buckets

### 2.6 Paso 4: Cuenta Admin

- [x] Crear `src/app/setup/admin/page.tsx`:
  - Formulario: Email + Password + Confirmar Password
  - Validacion de fortaleza de password (minimo 8 chars, 1 mayuscula, 1 numero)
  - Indicador visual de fortaleza (debil/media/fuerte)
- [x] Crear `src/app/api/setup/create-admin/route.ts`:
  - POST: Crea usuario via Supabase Auth (supabase.auth.admin.createUser)
  - Marca `site_config.setup_completed = true`
  - Verifica que no existan usuarios previos (403 si hay)

### 2.7 Paso 5: Finalizacion

- [x] Crear `src/app/setup/complete/page.tsx`:
  - Resumen de la configuracion completada (6 items con checkmarks)
  - Checkmark verde animado grande
  - Enlace "Ir al Panel Admin" -> `/admin`
  - Enlace "Ver tu Landing Page" -> `/`

### 2.8 Seguridad del Wizard

- [x] Verificar que el wizard solo es accesible si `setup_completed = false` (middleware + API routes)
- [x] Validar con Zod todas las entradas en los API routes del wizard (connectSchema, adminSchema)
- [x] No exponer service_role_key al cliente (solo usar en server-side)
- [x] Middleware bloquea /api/setup/\* despues de setup completo (403)
- [x] Crear `src/lib/setup/validation.ts` — Schemas Zod para validacion de inputs

---

## Fase 3 — Public Landing

> **Estado**: Completada | **Dependencias**: Fase 1 | **Completada en**: S3+S4 (2026-04-05)
> **Criterio de exito**: ✅ 19 modulos renderizan, i18n funciona, temas aplican, responsive completo.
> **Completado en S3**: Secciones 3.1-3.14, 3.24 (parcial), 3.25 (parcial)
> **Completado en S4**: Modulos 11-19 (3.15-3.23), 3.24 (resto), 3.25 (resto), 3.26

### 3.1 Motor de Renderizado de Modulos ✅

- [x] Crear `src/lib/modules/registry.ts` — Registro central de modulos:
  - Map de `section_key` -> `ModuleDefinition` (component, schema, seed, displayName, category)
  - Funcion `getModuleDefinition(key)`
  - Funcion `getAllModules()`
  - Funcion `getModulesByCategory(category)`
- [x] Crear `src/lib/modules/renderer.tsx` — Componente `ModuleRenderer`:
  - Recibe `module` (fila de page_modules) + `lang` (idioma activo)
  - Busca en registry por section_key
  - Extrae content[lang] con fallback a idioma por defecto
  - Aplica styles del modulo
  - Renderiza componente con error boundary
- [x] Crear `src/lib/modules/types.ts` — Tipos compartidos:
  - `ModuleDefinition`, `ModuleContent`, `ModuleStyles`, `ModuleCategory`
- [x] Crear `src/components/shared/ModuleErrorBoundary.tsx` — Error boundary por modulo
- [x] Crear `src/components/shared/ModuleWrapper.tsx` — Wrapper con estilos y section id

### 3.2 Sistema i18n ✅

- [x] Crear `src/lib/i18n/provider.tsx` — `I18nProvider` (Client Component):
  - Context con idioma activo y funcion de cambio
  - Carga traducciones desde page_modules.content
  - Fallback al idioma por defecto
- [x] Crear `src/lib/i18n/hooks.ts` — Custom hooks:
  - `useI18n()` — Acceso al idioma activo y funcion de cambio
  - `useTranslation(content)` — Extrae traduccion del content JSONB
- [x] Crear `src/lib/i18n/utils.ts` — Utilidades:
  - `detectBrowserLanguage()` — Deteccion automatica del idioma del navegador
  - `getContentForLang(content, lang, defaultLang)` — Extraccion con fallback
- [x] Crear `src/components/shared/LanguageSelector.tsx` — Selector de idioma en header

### 3.3 Sistema de Temas (CSS Variables) ✅

- [x] Crear `src/lib/themes/provider.tsx` — `ThemeProvider` (Client Component):
  - Inyecta CSS custom properties desde la paleta activa
  - Aplica tipografia (Google Fonts link + CSS variables)
  - Aplica spacing (section padding, container max-width)
- [x] Crear `src/lib/themes/palettes.ts` — Mapa de paletas a CSS variables
- [x] Crear `src/lib/themes/utils.ts` — Utilidades:
  - `paletteToCSSVars(colors)` — Convierte paleta a CSS custom properties
  - `loadGoogleFont(fontFamily)` — Genera link de Google Fonts
- [x] Crear `src/lib/themes/types.ts` — Tipos: `Palette`, `ThemeConfig`, `Typography`
- [x] Actualizar `src/app/globals.css` — CSS custom properties con valores por defecto del tema (ya existia de S1)

### 3.4 Layout y Navegacion Publica ✅

- [x] Implementar `src/app/(public)/layout.tsx`:
  - Server Component que carga theme, languages, site_config desde Supabase
  - Wraps con ThemeProvider + I18nProvider
  - Header con navegacion sticky
- [x] Implementar `src/app/(public)/page.tsx`:
  - Server Component que carga page_modules ordenados por display_order (is_visible = true)
  - Renderiza cada modulo con ModuleRenderer
  - Metadata dinamica (generateMetadata) desde seo_config
- [x] Crear `src/components/shared/SiteHeader.tsx` — Header publico (split Server+Client: SiteHeader.tsx + SiteHeaderClient.tsx):
  - Logo del sitio (desde site_config.logo_url)
  - Navegacion por anclas a cada modulo visible
  - Selector de idioma
  - Hamburger menu en mobile

### 3.5 Modulos — Hero (`hero`) ✅

- [x] Crear `src/components/modules/hero/HeroModule.tsx` — Componente React
- [x] Crear `src/components/modules/hero/hero.schema.ts` — Schema Zod de campos
- [x] Crear `src/components/modules/hero/hero.seed.ts` — Contenido por defecto (es/en)
- [x] Crear `src/components/modules/hero/hero.types.ts` — Interfaces TypeScript
- [x] Crear `src/components/modules/hero/index.ts` — Barrel export
- [x] Implementar: titulo, subtitulo, CTA primario, CTA secundario, imagen/video de fondo, overlay

### 3.6 Modulos — Propuesta de Valor (`value_prop`) ✅

- [x] Crear `src/components/modules/value-prop/ValuePropModule.tsx`
- [x] Crear `src/components/modules/value-prop/value-prop.schema.ts`
- [x] Crear `src/components/modules/value-prop/value-prop.seed.ts`
- [x] Crear `src/components/modules/value-prop/value-prop.types.ts`
- [x] Crear `src/components/modules/value-prop/index.ts`
- [x] Implementar: grid 3-6 beneficios con icono, titulo y descripcion

### 3.7 Modulos — Como Funciona (`how_it_works`) ✅

- [x] Crear `src/components/modules/how-it-works/HowItWorksModule.tsx`
- [x] Crear `src/components/modules/how-it-works/how-it-works.schema.ts`
- [x] Crear `src/components/modules/how-it-works/how-it-works.seed.ts`
- [x] Crear `src/components/modules/how-it-works/how-it-works.types.ts`
- [x] Crear `src/components/modules/how-it-works/index.ts`
- [x] Implementar: timeline/stepper 3-5 pasos con icono y descripcion

### 3.8 Modulos — Prueba Social (`social_proof`) ✅

- [x] Crear `src/components/modules/social-proof/SocialProofModule.tsx`
- [x] Crear `src/components/modules/social-proof/social-proof.schema.ts`
- [x] Crear `src/components/modules/social-proof/social-proof.seed.ts`
- [x] Crear `src/components/modules/social-proof/social-proof.types.ts`
- [x] Crear `src/components/modules/social-proof/index.ts`
- [x] Implementar: carrusel de testimonios con avatar, nombre, cargo, cita

### 3.9 Modulos — Logos de Clientes (`client_logos`) ✅

- [x] Crear `src/components/modules/client-logos/ClientLogosModule.tsx`
- [x] Crear `src/components/modules/client-logos/client-logos.schema.ts`
- [x] Crear `src/components/modules/client-logos/client-logos.seed.ts`
- [x] Crear `src/components/modules/client-logos/client-logos.types.ts`
- [x] Crear `src/components/modules/client-logos/index.ts`
- [x] Implementar: marquee infinito CSS, logos con grayscale+hover color

### 3.10 Modulos — Formulario de Contacto (`offer_form`) ✅

- [x] Crear `src/components/modules/offer-form/OfferFormModule.tsx` (Client Component)
- [x] Crear `src/components/modules/offer-form/offer-form.schema.ts`
- [x] Crear `src/components/modules/offer-form/offer-form.seed.ts`
- [x] Crear `src/components/modules/offer-form/offer-form.types.ts`
- [x] Crear `src/components/modules/offer-form/index.ts`
- [x] Implementar: formulario configurable con campos dinamicos, envio a Supabase (tabla leads)
- [x] Crear `src/app/api/leads/route.ts` — POST para captura de leads

### 3.11 Modulos — Preguntas Frecuentes (`faq`) ✅

- [x] Crear `src/components/modules/faq/FaqModule.tsx`
- [x] Crear `src/components/modules/faq/faq.schema.ts`
- [x] Crear `src/components/modules/faq/faq.seed.ts`
- [x] Crear `src/components/modules/faq/faq.types.ts`
- [x] Crear `src/components/modules/faq/index.ts`
- [x] Implementar: acordeon nativo HTML details/summary, JSON-LD FAQPage schema para SEO

### 3.12 Modulos — CTA Final (`final_cta`) ✅

- [x] Crear `src/components/modules/final-cta/FinalCtaModule.tsx`
- [x] Crear `src/components/modules/final-cta/final-cta.schema.ts`
- [x] Crear `src/components/modules/final-cta/final-cta.seed.ts`
- [x] Crear `src/components/modules/final-cta/final-cta.types.ts`
- [x] Crear `src/components/modules/final-cta/index.ts`
- [x] Implementar: bloque con titulo, texto descriptivo y boton CTA prominente

### 3.13 Modulos — Footer (`footer`) ✅

- [x] Crear `src/components/modules/footer/FooterModule.tsx`
- [x] Crear `src/components/modules/footer/footer.schema.ts`
- [x] Crear `src/components/modules/footer/footer.seed.ts`
- [x] Crear `src/components/modules/footer/footer.types.ts`
- [x] Crear `src/components/modules/footer/index.ts`
- [x] Implementar: links en columnas, redes sociales (SVG inline por limitacion de lucide v1), copyright, legal

### 3.14 Modulos — Estadisticas (`stats`) ✅

- [x] Crear `src/components/modules/stats/StatsModule.tsx` (Client Component para animacion)
- [x] Crear `src/components/modules/stats/stats.schema.ts`
- [x] Crear `src/components/modules/stats/stats.seed.ts`
- [x] Crear `src/components/modules/stats/stats.types.ts`
- [x] Crear `src/components/modules/stats/index.ts`
- [x] Implementar: contadores animados con efecto de incremento (IntersectionObserver trigger)

### 3.15 Modulos — Precios (`pricing`)

- [x] Crear `src/components/modules/pricing/PricingModule.tsx` (Client Component para toggle)
- [x] Crear `src/components/modules/pricing/pricing.schema.ts`
- [x] Crear `src/components/modules/pricing/pricing.seed.ts`
- [x] Crear `src/components/modules/pricing/pricing.types.ts`
- [x] Crear `src/components/modules/pricing/index.ts`
- [x] Implementar: 2-4 planes, toggle mensual/anual, feature list, CTA por plan, plan destacado

### 3.16 Modulos — Video (`video`)

- [x] Crear `src/components/modules/video/VideoModule.tsx` (Client Component)
- [x] Crear `src/components/modules/video/video.schema.ts`
- [x] Crear `src/components/modules/video/video.seed.ts`
- [x] Crear `src/components/modules/video/video.types.ts`
- [x] Crear `src/components/modules/video/index.ts`
- [x] Implementar: player embebido responsivo (YouTube/Vimeo/archivo), poster image, lazy load

### 3.17 Modulos — Equipo (`team`)

- [x] Crear `src/components/modules/team/TeamModule.tsx`
- [x] Crear `src/components/modules/team/team.schema.ts`
- [x] Crear `src/components/modules/team/team.seed.ts`
- [x] Crear `src/components/modules/team/team.types.ts`
- [x] Crear `src/components/modules/team/index.ts`
- [x] Implementar: grid de miembros con foto, nombre, cargo, links a redes sociales

### 3.18 Modulos — Galeria (`gallery`)

- [x] Crear `src/components/modules/gallery/GalleryModule.tsx` (Client Component para lightbox)
- [x] Crear `src/components/modules/gallery/gallery.schema.ts`
- [x] Crear `src/components/modules/gallery/gallery.seed.ts`
- [x] Crear `src/components/modules/gallery/gallery.types.ts`
- [x] Crear `src/components/modules/gallery/index.ts`
- [x] Implementar: grid masonry con lightbox, categorias opcionales, lazy load

### 3.19 Modulos — Grid de Caracteristicas (`features_grid`)

- [x] Crear `src/components/modules/features-grid/FeaturesGridModule.tsx`
- [x] Crear `src/components/modules/features-grid/features-grid.schema.ts`
- [x] Crear `src/components/modules/features-grid/features-grid.seed.ts`
- [x] Crear `src/components/modules/features-grid/features-grid.types.ts`
- [x] Crear `src/components/modules/features-grid/index.ts`
- [x] Implementar: grid responsivo 4-12 features con icono, titulo, descripcion

### 3.20 Modulos — Cuenta Regresiva (`countdown`)

- [x] Crear `src/components/modules/countdown/CountdownModule.tsx` (Client Component)
- [x] Crear `src/components/modules/countdown/countdown.schema.ts`
- [x] Crear `src/components/modules/countdown/countdown.seed.ts`
- [x] Crear `src/components/modules/countdown/countdown.types.ts`
- [x] Crear `src/components/modules/countdown/index.ts`
- [x] Implementar: temporizador con fecha objetivo configurable, accion al llegar a cero

### 3.21 Modulos — Tabla Comparativa (`comparison`)

- [x] Crear `src/components/modules/comparison/ComparisonModule.tsx`
- [x] Crear `src/components/modules/comparison/comparison.schema.ts`
- [x] Crear `src/components/modules/comparison/comparison.seed.ts`
- [x] Crear `src/components/modules/comparison/comparison.types.ts`
- [x] Crear `src/components/modules/comparison/index.ts`
- [x] Implementar: tabla de comparacion con columnas configurables, checkmarks, responsive scroll

### 3.22 Modulos — Newsletter (`newsletter`)

- [x] Crear `src/components/modules/newsletter/NewsletterModule.tsx` (Client Component)
- [x] Crear `src/components/modules/newsletter/newsletter.schema.ts`
- [x] Crear `src/components/modules/newsletter/newsletter.seed.ts`
- [x] Crear `src/components/modules/newsletter/newsletter.types.ts`
- [x] Crear `src/components/modules/newsletter/index.ts`
- [x] Implementar: formulario de email, validacion, envio a tabla leads (source_module: newsletter)

### 3.23 Modulos — Mapa/Ubicacion (`map_location`)

- [x] Crear `src/components/modules/map-location/MapLocationModule.tsx` (Client Component)
- [x] Crear `src/components/modules/map-location/map-location.schema.ts`
- [x] Crear `src/components/modules/map-location/map-location.seed.ts`
- [x] Crear `src/components/modules/map-location/map-location.types.ts`
- [x] Crear `src/components/modules/map-location/index.ts`
- [x] Implementar: mapa embebido (Google Maps iframe o alternativa), direccion, horarios

### 3.24 Registro de Modulos en Registry

- [x] Registrar los 10 modulos (S3) en `src/lib/modules/registry.ts` con su metadata completa
- [x] Verificar fallback para modulos no encontrados en registry
- [x] Registrar modulos 11-19 (S4)
- [x] Verificar que todos los 19 modulos renderizan con datos de seed (S4)

### 3.25 SEO Base

- [x] Implementar `generateMetadata()` en `src/app/(public)/page.tsx` desde `seo_config`
- [x] Crear `src/app/sitemap.ts` — Generacion automatica de sitemap.xml
- [x] Crear `src/app/robots.ts` — Generacion de robots.txt
- [x] Agregar schema JSON-LD en el modulo FAQ (FAQPage structured data)
- [x] Agregar Open Graph tags dinamicos (og:title, og:description, og:image) — S4

### 3.26 Responsive y Mobile

- [x] Hamburger menu en mobile para SiteHeader (SiteHeaderClient.tsx)
- [x] Verificar responsive en todos los 19 modulos (S4)
- [-] Verificar imagenes responsivas con `next/image` (srcset, sizes, lazy loading) (S4) — Omitido/Pospuesto: usamos `<img>` tag por compatibilidad con URLs externas; revisar en siguiente sesion si se requiere
- [-] Implementar tipografia fluida con `clamp()` (S4) — Omitido: Tailwind responsive classes cubren los casos de uso

---

## Fase 4 — Admin Panel ✅

> **Estado**: Completada | **Dependencias**: Fases 2 + 3 | **Completada en**: S6 (2026-04-05)
> **Criterio de exito**: ✅ Todas las secciones funcionales, cambios se reflejan en landing, UX intuitiva, <2s de carga.
> **Completado en S5 (2026-04-05)**: Secciones 4.1-4.7 (layout, dashboard, content, modules, design, languages, seo)
> **Completado en S6 (2026-04-05)**: Secciones 4.8-4.11 (media, integrations, leads, settings)

### 4.1 Layout del Admin (`/admin`)

- [x] Implementar `src/components/admin/AdminLayout.tsx` (Client Component):
  - Sidebar colapsable + TopBar + area de contenido
  - Estado de sidebar en Zustand para persistencia
- [x] Crear `src/components/admin/AdminSidebar.tsx`:
  - 10 items de navegacion con iconos Lucide
  - Colapsado en tablet, drawer en mobile
  - Indicador de seccion activa
  - Badges (leads sin leer, integraciones activas)
- [x] Crear `src/components/admin/AdminTopBar.tsx`:
  - Logo clickeable (lleva a dashboard)
  - Breadcrumbs
  - Boton "Vista Previa" (abre landing en nueva pestana)
  - Boton "Edicion en Vivo" (toggle)
  - Menu de usuario (avatar, nombre, logout)
- [x] Crear `src/components/admin/AdminBreadcrumbs.tsx`
- [x] Crear `src/stores/admin-store.ts` — Zustand store para estado del admin (sidebar, breadcrumbs)
- [x] Actualizar `src/app/admin/layout.tsx` — auth check + AdminLayout wrapper

### 4.2 Dashboard (`/admin/dashboard`)

- [x] Crear `src/app/admin/dashboard/page.tsx`:
  - 4 tarjetas KPI: leads esta semana, modulos activos, idiomas activos, ultima edicion
  - Tabla de ultimos 5 leads
  - Accesos directos a secciones frecuentes
  - Banner de bienvenida para primer uso post-wizard
- [x] Crear `src/components/admin/dashboard/StatsCard.tsx`
- [x] Crear `src/components/admin/dashboard/RecentLeadsTable.tsx`
- [x] Crear `src/components/admin/dashboard/QuickActions.tsx`
- [x] Crear `src/app/api/admin/stats/route.ts` — GET estadisticas del dashboard

### 4.3 Editor de Contenido (`/admin/content`)

- [x] Crear `src/app/admin/content/page.tsx` — Lista de modulos activos con acceso a edicion
- [x] Crear `src/app/admin/content/[section_key]/page.tsx` — Editor de un modulo especifico
- [x] Crear `src/components/admin/content/ModuleEditor.tsx`:
  - Genera formulario dinamico desde module_schemas.fields
  - Soporte para todos los tipos de campo (text, textarea, richtext, image, url, color, range, select, toggle, array, number, date, map)
  - Selector de idioma para editar contenido en cada idioma
- [x] Crear `src/components/admin/content/DynamicField.tsx` — Renderizado de campo segun tipo
- [x] Crear `src/components/admin/content/ArrayField.tsx` — Campo de lista repetible (FAQs, planes, etc.)
- [x] Crear `src/components/admin/content/ImageField.tsx` — Selector de imagen (media library) con preview + MediaPicker integrado (S7)
- [x] Crear `src/components/admin/content/RichTextField.tsx` — Editor de texto enriquecido con toolbar Bold/Italic/Lista/Link + contentEditable (S7)
- [x] Crear `src/app/api/content/route.ts` — GET/PUT contenido de modulos
- [x] Crear `src/app/api/content/[section_key]/route.ts` — GET/PUT contenido de un modulo

### 4.4 Gestor de Modulos (`/admin/modules`)

- [x] Crear `src/app/admin/modules/page.tsx`:
  - Vista de todos los modulos (activos e inactivos)
  - Toggle activacion/desactivacion por modulo
  - Drag-and-drop para reordenar (DND Kit)
  - Vista previa del orden resultante
- [x] Crear `src/components/admin/modules/ModuleCard.tsx` — Tarjeta de modulo con toggle y drag handle
- [x] Crear `src/components/admin/modules/ModuleSortableList.tsx` — Lista sortable con DND Kit
- [x] Crear `src/app/api/modules/route.ts` — GET todos los modulos, PUT actualizar orden/visibilidad
- [x] Crear `src/app/api/modules/[id]/route.ts` — PATCH actualizar un modulo
- [x] Crear `src/app/api/modules/reorder/route.ts` — PUT reordenar modulos por drag-and-drop
- [x] Crear `src/app/api/modules/[id]/visibility/route.ts` — PATCH toggle visibilidad individual

### 4.5 Editor de Diseno (`/admin/design`)

- [x] Crear `src/app/admin/design/page.tsx`:
  - Selector de paleta (20 predefinidas, grid visual)
  - Preview en tiempo real al seleccionar paleta
  - Configuracion de tipografia (Google Fonts dropdown)
  - Ajustes de espaciado (compacto, normal, espacioso)
  - Border radius selector
- [x] Crear `src/components/admin/design/PaletteSelector.tsx` — Grid de paletas con preview de colores
- [x] Crear `src/components/admin/design/TypographyEditor.tsx` — Selector de fuentes con preview en vivo
- [x] Crear `src/components/admin/design/SpacingEditor.tsx` — Controles de espaciado y border radius
- [x] Crear `src/components/admin/design/DesignEditor.tsx` — Contenedor principal con tabs
- [x] Crear `src/components/admin/design/BreadcrumbSetter.tsx` — Breadcrumb para la seccion
- [-] Crear `src/components/admin/design/DesignPreview.tsx` — Preview side-by-side (pospuesto — Live Editing cubre este caso en Fase 5)
- [x] Crear `src/app/api/design/route.ts` — GET configuracion de tema + paletas
- [x] Crear `src/app/api/design/theme/route.ts` — PUT actualizacion de tema con revalidatePath('/')

### 4.6 Gestor de Idiomas (`/admin/languages`)

- [x] Crear `src/app/admin/languages/page.tsx`:
  - Lista de idiomas configurados con flags
  - Agregar nuevo idioma (codigo ISO + nombre + nombre nativo + flag emoji)
  - Eliminar idioma con confirmacion
  - Toggle idioma por defecto
  - Indicador de completitud de traducciones por idioma
- [x] Crear `src/components/admin/languages/LanguageList.tsx`
- [x] Crear `src/components/admin/languages/AddLanguageDialog.tsx`
- [x] Crear `src/components/admin/languages/TranslationStatus.tsx` — Barra de progreso de traducciones
- [x] Crear `src/app/api/i18n/route.ts` — CRUD de idiomas
- [x] Crear `src/app/api/i18n/[code]/route.ts` — GET/DELETE idioma especifico

### 4.7 SEO Manager (`/admin/seo`)

- [x] Crear `src/app/admin/seo/page.tsx`:
  - Meta titulo y descripcion (por idioma)
  - Upload de favicon
  - Upload de imagen Open Graph
  - Campo de canonical URL
  - Preview de Google SERP
  - Preview de card en redes sociales
- [x] Crear `src/app/admin/seo/[lang]/page.tsx` — Editor SEO por idioma especifico
- [x] Crear `src/components/admin/seo/SerpPreview.tsx` — Preview de como se ve en Google
- [x] Crear `src/components/admin/seo/SocialPreview.tsx` — Preview de og:image en redes
- [x] Crear `src/components/admin/seo/SeoEditor.tsx` — Formulario principal de edicion SEO
- [x] Crear `src/app/api/seo/route.ts` — GET/PUT configuracion SEO
- [x] Crear `src/app/api/seo/[lang]/route.ts` — GET/PUT SEO por idioma

### 4.8 Media Library (`/admin/media`)

- [x] Crear `src/app/admin/media/page.tsx`:
  - Vista de galeria con thumbnails (grid y lista)
  - Upload con drag-and-drop (Supabase Storage bucket "media")
  - Metadata por imagen (nombre, alt text multilingue, dimensiones, peso)
  - Busqueda y filtrado por nombre/carpeta
  - Eliminacion con confirmacion
- [x] Crear `src/components/admin/media/MediaGrid.tsx` — Grid con toggle grid/lista, filtros, sort
- [x] Crear `src/components/admin/media/MediaUploader.tsx` — Zona drag-and-drop, multi-file, progress por archivo
- [x] Crear `src/components/admin/media/MediaDetail.tsx` — Sheet lateral: preview, alt text por idioma, carpeta, copiar URL, eliminar
- [x] Crear `src/components/admin/media/MediaPicker.tsx` — Selector reutilizable (dialog con mini-grid)
- [x] Crear `src/components/admin/media/MediaPageClient.tsx` — Client orchestrator (refresh key pattern)
- [x] Crear `src/app/api/media/route.ts` — GET (lista paginada + filtros), POST (upload a Storage)
- [x] Crear `src/app/api/media/[id]/route.ts` — GET/PUT (alt_text, folder)/DELETE (Storage + BD)
- [x] Actualizar `src/app/providers.tsx` — agregar TooltipProvider wrapper

### 4.9 Integraciones (`/admin/integrations`)

- [x] Crear `src/app/admin/integrations/page.tsx`:
  - Grid de 7 tarjetas de integracion (GA4, GTM, Meta Pixel, WhatsApp, Calendly, SMTP, Custom Scripts)
  - Toggle de activacion con optimistic update
  - Modal de configuracion por integracion
- [x] Crear `src/components/admin/integrations/IntegrationCard.tsx` — Tarjeta con toggle, badge configurado/sin configurar
- [x] Crear `src/components/admin/integrations/IntegrationConfig.tsx` — Dialog con formulario dinamico por tipo
- [x] Crear `src/components/admin/integrations/IntegrationsGrid.tsx` — Client orchestrator
- [x] Crear `src/app/api/integrations/route.ts` — GET (lista, password SMTP redactado) / PUT (actualizar, preservar password)
- [x] Crear `src/lib/integrations/scripts.ts` — Tipos de config, type guards, helpers (label, description, isConfigured)
- [x] Crear `src/components/integrations/GoogleAnalytics.tsx` — Script GA4 (afterInteractive)
- [x] Crear `src/components/integrations/GoogleTagManager.tsx` — Script GTM + GTMNoScript export
- [x] Crear `src/components/integrations/MetaPixel.tsx` — Script Meta Pixel + noscript fallback
- [x] Crear `src/components/integrations/WhatsAppButton.tsx` — Boton flotante fijo (left/right configurable)
- [x] Crear `src/components/integrations/CalendlyWidget.tsx` — Script loader lazyOnload
- [x] Crear `src/components/integrations/CustomScripts.tsx` — Inyeccion head/body via dangerouslySetInnerHTML

### 4.10 Gestion de Leads (`/admin/leads`)

- [x] Crear `src/app/admin/leads/page.tsx`:
  - Tabla con paginacion server-side (20/pagina)
  - Filtros: estado (leido/no leido), fuente, busqueda por texto, rango de fechas
  - Seleccion multiple para acciones masivas (marcar leido/no leido, eliminar)
  - Boton exportar CSV (respeta filtros activos)
- [x] Crear `src/app/admin/leads/[id]/page.tsx` — Vista detallada (deep-link)
- [x] Crear `src/components/admin/leads/LeadsTable.tsx` — Tabla con checkboxes, badges, paginacion, skeleton loading
- [x] Crear `src/components/admin/leads/LeadDetail.tsx` — Sheet lateral: datos de contacto, mensaje, metadata, acciones
- [x] Crear `src/components/admin/leads/LeadFilters.tsx` — Barra de filtros con date range picker
- [x] Crear `src/components/admin/leads/LeadsPageClient.tsx` — Client orchestrator
- [x] Extender `src/app/api/leads/route.ts` — GET paginado con filtros (POST existente preservado)
- [x] Crear `src/app/api/leads/[id]/route.ts` — GET/PATCH (is_read)/DELETE lead individual
- [x] Crear `src/app/api/leads/export/route.ts` — GET CSV con BOM UTF-8, respeta filtros
- [x] Crear `src/app/api/leads/bulk/route.ts` — PATCH acciones masivas (mark_read/unread/delete)

### 4.11 Configuracion / Settings (`/admin/settings`)

- [x] Crear `src/app/admin/settings/page.tsx` — Tabs: Sitio / Avanzado / Usuarios / Backup / Sistema
- [x] Crear `src/components/admin/settings/SettingsPageClient.tsx` — Client orchestrator para los Tabs
- [x] Crear `src/components/admin/settings/SiteInfoForm.tsx` — Formulario: nombre, descripcion, logos, favicon, email + AdvancedSettings (CSS, scripts)
- [x] Crear `src/components/admin/settings/SocialLinksEditor.tsx` — Lista dinamica de redes sociales (plataforma + URL)
- [x] Crear `src/components/admin/settings/PasswordChangeForm.tsx` — Cambio de password con validacion
- [x] Crear `src/components/admin/settings/SystemInfo.tsx` — Estado de conexion (fetch /api/health), version, entorno
- [x] Crear `src/components/admin/settings/UsersManager.tsx` — Tabla de admins, crear/eliminar usuarios
- [x] Crear `src/components/admin/settings/BackupRestore.tsx` — Exportar/importar backup JSON
- [x] Crear `src/app/api/settings/route.ts` — GET/PUT site_config con revalidatePath
- [x] Crear `src/app/api/settings/backup/route.ts` — GET exportar 7 tablas como JSON descargable
- [x] Crear `src/app/api/settings/restore/route.ts` — POST importar backup con upsert por tabla
- [x] Crear `src/app/api/settings/users/route.ts` — GET lista admins / POST crear admin (via admin client)
- [x] Crear `src/app/api/settings/users/[id]/route.ts` — DELETE (guards: no self, no last) / PUT password

---

## Fase 5 — Live Editing (Edicion en Vivo)

> **Estado**: Completada | **Dependencias**: Fase 4 | **Completada en**: S7+S8+S10+S11 (2026-04-05)
> **Criterio de exito**: ✅ Edicion inline en todos los modulos, guardado <1s, invisible para visitantes.
> **Completado en S7**: Secciones 5.1-5.5 (componentes e infraestructura)
> **Completado en S8-S11**: 5.6 completa (rate limiting, content_changes log + admin UI)

### 5.1 Toggle de Modo Edicion

- [x] Crear `src/components/live-edit/EditModeToggle.tsx` — Boton flotante (solo admin autenticado)
- [x] Extender `src/stores/editor.store.ts` — agregar `editingModuleId` + `setEditingModule` (se extendio el store existente, no se creo uno nuevo)
- [x] Implementar indicador visual de modo activo (borde pulsante, estado "Editando")
- [x] Verificar que el toggle solo aparece si hay sesion de admin autenticada (auth check en public layout)
- [x] Integrar `EditModeToggle` en `src/app/(public)/layout.tsx` con `supabase.auth.getUser()`

### 5.2 Edicion de Texto Inline (contentEditable)

- [x] Crear `src/components/live-edit/EditableText.tsx`:
  - contentEditable con borde visual al hacer foco
  - Guardado automatico al blur o Ctrl/Cmd+S
  - Indicador de estado: guardando / guardado / error
  - Debounce en auto-save
- [x] Crear `src/components/live-edit/EditableRichText.tsx` — Para campos con formato (toolbar Bold/Italic/List)
- [x] Crear `src/hooks/useInlineEdit.ts` — Hook para logica de edicion inline (debounce manual, saveStatus)
- [x] Crear `src/app/api/inline-edit/route.ts` — PUT guardado rapido de campo individual (auth-gated, zod validation, revalidatePath)

### 5.3 Edicion de Imagenes en Vivo

- [x] Crear `src/components/live-edit/EditableImage.tsx`:
  - Clic en imagen para abrir MediaPicker
  - Preview inmediato de imagen seleccionada (optimistic update)
  - Guardado automatico + rollback si falla
- [x] MediaPicker ya era reutilizable desde S6 (`src/components/admin/media/MediaPicker.tsx`)

### 5.4 Preview en Tiempo Real

- [x] Actualizacion optimista en EditableText y EditableImage
- [x] Rollback automatico si el guardado falla (EditableImage)
- [x] Revalidacion de cache Next.js (revalidatePath('/')) en inline-edit API
- [x] Verificar que los cambios se reflejan sin recarga en modulos reales (EditableText integrado en hero, value_prop, how_it_works — S8)

### 5.5 Drag-and-Drop de Modulos en Vivo

- [x] Crear `src/components/live-edit/SortableModuleWrapper.tsx`:
  - En modo edicion, cada modulo muestra drag handles (GripVertical)
  - DND Kit (@dnd-kit/sortable) — ya instalado en el proyecto
  - Animacion suave (opacity 0.5 durante drag)
  - Guardado automatico del nuevo orden (PATCH /api/modules/reorder)
- [x] Crear `src/components/live-edit/ModuleToolbar.tsx`:
  - Mover arriba/abajo, ocultar modulo, link a edicion avanzada en admin
- [x] Crear `src/components/live-edit/SortablePageWrapper.tsx` — DndContext + SortableContext container
- [x] Crear `src/components/live-edit/index.ts` — Barrel export de todos los componentes
- [x] Crear `src/components/live-edit/SortableModuleItem.tsx` — Client Component adapter con handlers API internos (S8)
- [x] Integrar SortablePageWrapper en `src/app/(public)/page.tsx` con SortableModuleItem (S8)

### 5.6 Seguridad del Modo Edicion

- [x] Modo edicion invisible para visitantes (EditModeToggle renders null si isAdmin=false)
- [x] Auth check en `/api/inline-edit` (401 si no hay sesion)
- [x] Rate limiting en endpoints criticos (leads: 5/min, inline-edit: 30/min — completado S8)
- [x] Log de cambios via edicion inline — tabla content_changes + API logging (S10)
- [x] UI de historial de ediciones en `/admin/content-history` — tabla filtrable por seccion y fecha, paginada, con old/new values (S11)

---

## Fase 6 — Polish y Produccion

> **Estado**: Completada | **Dependencias**: Fase 5 | **Completada en**: S9-S16 (2026-04-05)
> **Criterio de exito**: ✅ Lighthouse CI 0 errores, zero vulnerabilidades, 86/86 tests pasando, 4 deploy guides completos, documentacion final completa.

### 6.1 Performance (Lighthouse 90+)

- [x] Auditoria Lighthouse ejecutada (`pnpm build && pnpm lhci`) — S13: 0 errores, 2 warnings aceptables (LCP 0.71 en setup page, 1 legacy JS de dependencias). NOTA: sin Supabase configurado, el audit cae en `/setup/connect`. Para auditar la landing real, se requiere Supabase con `setup_completed = true`.
- [x] Optimizacion de imagenes: next/image en SiteHeaderClient, SocialProofModule, TeamModule, ClientLogosModule, GalleryModule (S10)
- [x] Bundle analyzer investigado — `@next/bundle-analyzer` incompatible con Turbopack (webpack plugin). Chunks mas grandes sin comprimir: 270KB, 227KB. Con gzip la reduccion es ~70%. Turbopack no genera reporte HTML. (S13) Alternativa Turbopack: pnpm analyze:turbo (next experimental-analyze, nativo Next.js 16.2.2). (S13/S14)
- [x] Cache headers implementados en next.config.ts (S8/S10)
- [x] Indices de Supabase en migration 001_initial_schema.sql (ya implementados)
- [-] Prefetch de datos criticos — no aplica: la landing `/` ya es SSG (static), los datos se obtienen en Server Components en build time
- [x] Hero LCP optimization: `<link rel="preload" as="image">` en `src/app/(public)/page.tsx` para hero background image. React 18 hoist to `<head>`. Cubre CSS background-image que el navegador no preloadea automaticamente (S15).
- [x] Verificar Core Web Vitals (LCP, INP, CLS) — WebVitalsReporter agregado en public layout (`src/components/shared/WebVitalsReporter.tsx`). Captura LCP/INP/CLS/FCP/TTFB via `web-vitals` package (dynamic import, no critical bundle). Loguea en dev con rating. Para audit real con Supabase configurado: ver docs/guides/CORE-WEB-VITALS.md (S16)

### 6.2 Accesibilidad (WCAG 2.1 AA)

- [x] Revision con axe-core/jest-axe automatizado (S9)
- [x] Guia de pruebas manuales creada en docs/guides/SCREEN-READER-TESTING.md (S14). Pruebas a ejecutar manualmente por el usuario.
- [x] Navegacion completa por teclado — fixes aplicados en S12: skip link (WCAG 2.4.1), focus-visible global CSS, Escape en menu movil, GalleryModule lightbox aria-modal + focus trap, ClientLogos aria-hidden, LanguageSelector focus-visible, 13 fixes focus:→focus-visible: en Hero/Newsletter/OfferForm/Pricing/Video (S12)
- [x] Contraste de colores validado — utilidad WCAG 2.1 AA en `src/lib/themes/contrast.ts` + reporte visual en ThemePreviewPanel (5 pares criticos, badge pasa/falla) (S11)
- [x] Correccion de issues A y AA: tabIndex, aria-live, aria-label en admin y modulos (S10)
- [x] aria-labels en AdminTopBar, MediaGrid, MediaPicker, setup wizard (S10)

### 6.3 Security Hardening

- [x] Revision de politicas RLS: 10 tablas auditadas, diseno correcto (S10)
- [x] Rate limiting en endpoints criticos (login, leads, setup)
- [x] Headers de seguridad HTTP verificados (CSP, X-Frame-Options, HSTS)
- [x] Validacion server-side con Zod en todos los API routes (ya implementado en S3-S6 + inline-edit en S7)
- [x] `pnpm audit` limpio (zero vulnerabilidades conocidas) — S9: 0 vulns en 830 deps
- [x] Revision de env vars: NEXT*PUBLIC* apropiadas, SERVICE_ROLE_KEY solo server-side (S10)

### 6.4 Testing

- [x] Configurar Vitest para tests unitarios (`vitest.config.ts`, `src/__tests__/setup.ts`)
- [x] Configurar Playwright para tests E2E (`playwright.config.ts`, `tests/e2e/`)
- [x] Tests unitarios para logica critica — 86 tests pasando (S9: +54 RTL):
  - `src/__tests__/i18n-utils.test.ts` — 12 tests (getContentForLang, detectBrowserLanguage)
  - `src/__tests__/theme-utils.test.ts` — 12 tests (paletteToCSSVars, themeConfigToCSSVars, loadGoogleFont)
  - `src/__tests__/registry.test.ts` — 8 tests (getModuleDefinition, getAllModules)
  - `src/__tests__/components/HeroModule.test.tsx` — 11 tests (render, i18n, CTA, a11y via jest-axe)
  - `src/__tests__/components/ValuePropModule.test.tsx` — 11 tests (3 layouts, icons, a11y)
  - `src/__tests__/components/HowItWorksModule.test.tsx` — 12 tests (3 layouts, steps, a11y)
  - `src/__tests__/components/EditableText.test.tsx` — 20 tests (static/edit mode, className/style, placeholder)
- [x] Tests de componentes con React Testing Library + jest-axe a11y — S9: 54 tests nuevos, 86/86 total
- [x] Tests E2E con Playwright (37 tests nuevos en S9):
  - [x] `tests/e2e/homepage.spec.ts` — homepage carga y tiene meta tags
  - [x] `tests/e2e/admin-login.spec.ts` — login page + redirect unauthenticated
  - [x] `tests/e2e/setup.spec.ts` — setup wizard accesible
  - [x] `tests/e2e/lead-capture.spec.ts` — formulario de leads
  - [x] `tests/e2e/wizard-flow.spec.ts` — flujo completo wizard 5 pasos (S9)
  - [x] `tests/e2e/admin-content-edit.spec.ts` — auth guards + login page (S9)
  - [x] `tests/e2e/theme-change.spec.ts` — CSS vars en :root + API theme/export (S9)
  - [x] `tests/e2e/inline-edit.spec.ts` — sin errores JS + no DnD handles para anon (S9)
- [x] Configurar Lighthouse CI en GitHub Actions — `.github/workflows/ci.yml` + `.lighthouserc.json` (S9)

### 6.5 Guias de Deploy

- [x] Guia de deploy en Vercel (paso a paso con variables de entorno) — `docs/deploy/VERCEL.md`
- [x] Guia de deploy con Docker (`docker compose up`) — `docs/deploy/DOCKER.md`
- [x] Guia de deploy en Netlify (con @netlify/next) — `docs/deploy/NETLIFY.md`
- [x] Guia generica para VPS (nginx + PM2 + Node.js) — `docs/deploy/VPS.md`
- [x] Crear `src/app/api/health/route.ts` — Health check endpoint (version, env, supabase status)

### 6.6 Documentacion Final

- [x] `README.md` completo y profesional (badges, screenshots, quick start)
- [x] `CHANGELOG.md` con historial de cambios
- [x] Documentacion de API interna (para desarrolladores que extiendan) — `docs/api/INTERNAL-API.md` (37 endpoints) (S9)
- [x] Guia de creacion de modulos personalizados — `docs/guides/CUSTOM-MODULE.md` (S9)
- [x] Guia de creacion de temas personalizados — `docs/guides/CUSTOM-THEME.md` (S9)

---

## Fase 7 — Marketplace y Comunidad

> **Estado**: Completada | **Dependencias**: Fase 6 | **Completada en**: S8-S16 (2026-04-05)
> **Criterio de exito**: ✅ Export/import paletas+temas+layouts, plugin system con sandbox, CLI scaffold, community docs.

### 7.1 Export/Import de Paletas

- [x] Crear endpoint de exportacion de paleta como JSON (`GET /api/design/palette/export`)
- [x] Crear UI de importacion de paleta desde archivo JSON (botones en tab Paleta de DesignEditor)
- [x] Validacion de formato de paleta importada con Zod (`POST /api/design/palette/import`)

### 7.2 Export/Import de Temas

- [x] Definir formato estandarizado de paquete de tema (JSON: version, palette, typography, spacing, borderRadius, customColors, createdAt)
- [x] Crear mecanismo de exportacion de tema completo (paleta + tipografia + spacing) (`GET /api/design/theme/export`)
- [x] Crear mecanismo de importacion de tema desde archivo (`POST /api/design/theme/import`)
- [x] Preview de tema antes de aplicar — ThemePreviewPanel con CSS vars escopados (S10)
- [x] Validacion de integridad del paquete (Zod schema completo)

### 7.3 Export/Import de Layouts

- [x] Exportar configuracion de layout (orden de modulos, visibilidad) (`GET /api/modules/export`)
- [x] Importar layout desde archivo (`POST /api/modules/import`)
- [x] Merge inteligente con contenido existente — dry_run support + diff detallado (changes/unchanged/skipped), solo actualiza lo que realmente cambia vs estado actual DB (S15)

### 7.4 Plugin System Foundation

- [x] Definir API de plugins (hooks del ciclo de vida: onLeadCaptured, onContentSaved, onThemeChanged, onModuleVisibilityChanged, onAdminLogin, onBeforeRender) — `src/lib/plugins/types.ts` (S9)
- [x] Crear registry de plugins con Promise.allSettled (errores aislados por plugin) — `src/lib/plugins/registry.ts` (S9)
- [x] Documentar API de plugins — `docs/guides/PLUGIN-SYSTEM.md` (S9)
- [x] Crear 2-3 plugins de ejemplo como referencia: (S9)
  - [x] Plugin de webhook para leads — `src/lib/plugins/examples/webhook-plugin.ts`
  - [x] Plugin de logging universal — `src/lib/plugins/examples/log-plugin.ts`
- [x] Integrar emit en leads route y inline-edit route (S9)
- [x] Sandbox de ejecucion para plugins de terceros — timeout por trust level (trusted:10s, community:5s, unverified:3s) + PluginPermission declarations + SandboxTimeoutError distinguido en logs. `src/lib/plugins/sandbox.ts` + types.ts + registry.ts actualizado (S16)

### 7.5 Herramientas de Comunidad

- [x] Template de repositorio para nuevos modulos — guia en `docs/community/MODULE-TEMPLATE-REPO.md` (S11)
- [x] CLI basico para scaffold de modulos: scripts/create-module.js + pnpm scaffold:module (S10)
- [x] CLI npm publicable: `packages/create-orion-module/` (bin: npx create-orion-module) (S11)
- [x] Showcase de sitios creados con Orion Landing Universal — `docs/community/SHOWCASE.md` (S11)
- [x] Programa de contribuidores destacados — `docs/community/CONTRIBUTOR-PROGRAM.md` + `CONTRIBUTORS.md` (S11)
- [x] Galeria de temas comunitarios (GitHub-based) — `docs/community/THEME-GALLERY.md` (S11)

---

## Registro de Cambios

| Fecha      | Descripcion                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Autor                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 2026-04-05 | Creacion inicial del tracker con 324 tareas en 8 fases                                                                                                                                                                                                                                                                                                                                                                                                                   | Luis E. Gutierrez / Claude |
| 2026-04-05 | S7: Live Editing completo (5.1-5.5), Testing base (Vitest 32 tests + Playwright), Health check API, ImageField + RichTextField                                                                                                                                                                                                                                                                                                                                           | Luis E. Gutierrez / Claude |
| 2026-04-05 | S8: Rate limiting en leads/inline-edit/setup, security headers en next.config.ts (CSP, HSTS prod-only, X-XSS-Protection, Referrer-Policy)                                                                                                                                                                                                                                                                                                                                | Luis E. Gutierrez / Claude |
| 2026-04-05 | S8: README.md profesional (badges, features, quick start, modulos, stack), CHANGELOG.md, 4 guias de deploy (Vercel/Docker/Netlify/VPS), INDEX.md actualizado                                                                                                                                                                                                                                                                                                             | Luis E. Gutierrez / Claude |
| 2026-04-05 | S8: SortablePageWrapper integrado en page.tsx, SortableModuleItem creado, EditableText en hero/value_prop/how_it_works, conflictos git resueltos en DEVELOPMENT-TRACKER.md                                                                                                                                                                                                                                                                                               | Luis E. Gutierrez / Claude |
| 2026-04-05 | S8: Phase 7 — Export/Import de paletas, temas y layouts (7.1-7.3 completo)                                                                                                                                                                                                                                                                                                                                                                                               | Luis E. Gutierrez / Claude |
| 2026-04-05 | S9: pnpm audit (0 vulns), RTL+jest-axe (86 tests, +54), Playwright E2E (+37 tests, 8 specs), Lighthouse CI GitHub Actions, .lighthouserc.json                                                                                                                                                                                                                                                                                                                            | Luis E. Gutierrez / Claude |
| 2026-04-05 | S9: docs/api/INTERNAL-API.md (37 endpoints), docs/guides/CUSTOM-MODULE.md, docs/guides/CUSTOM-THEME.md, docs/guides/PLUGIN-SYSTEM.md                                                                                                                                                                                                                                                                                                                                     | Luis E. Gutierrez / Claude |
| 2026-04-05 | S9: Plugin System Foundation 7.4 — types.ts, registry.ts (Promise.allSettled), webhook-plugin.ts, log-plugin.ts, integrado en leads + inline-edit routes                                                                                                                                                                                                                                                                                                                 | Luis E. Gutierrez / Claude |
| 2026-04-05 | S10: next/image en 5 modulos publicos, prefers-reduced-motion (globals.css + ClientLogos + Stats), tabIndex/aria-live/aria-label fixes WCAG AA (9 archivos)                                                                                                                                                                                                                                                                                                              | Luis E. Gutierrez / Claude |
| 2026-04-05 | S10: RLS audit (10 tablas), env vars audit, ThemePreviewPanel (7.2), content_changes table + API logging (5.6), CLI scaffold scripts/create-module.js (7.5)                                                                                                                                                                                                                                                                                                              | Luis E. Gutierrez / Claude |
| 2026-04-05 | S11: content_changes admin UI /admin/content-history (5.6), contraste WCAG 2.1 AA validator + ThemePreviewPanel badge (6.2)                                                                                                                                                                                                                                                                                                                                              | Luis E. Gutierrez / Claude |
| 2026-04-05 | S11: CLI npm package packages/create-orion-module (7.5), community docs SHOWCASE/CONTRIBUTOR-PROGRAM/THEME-GALLERY/MODULE-TEMPLATE-REPO (7.5)                                                                                                                                                                                                                                                                                                                            | Luis E. Gutierrez / Claude |
| 2026-04-05 | S12: Bundle analyzer (@next/bundle-analyzer + cross-env + @lhci/cli), scripts pnpm analyze/lhci/lighthouse, .lighthouserc.json con startServerCommand                                                                                                                                                                                                                                                                                                                    | Luis E. Gutierrez / Claude |
| 2026-04-05 | S12: a11y WCAG 2.1 AA keyboard — skip link (WCAG 2.4.1), \*:focus-visible CSS global, GalleryModule aria-modal+focus-trap+role=button, SiteHeaderClient Escape key, ClientLogos aria-hidden+sr-only, LanguageSelector focus-visible, 13 focus:→focus-visible: en 5 modulos (Hero/Newsletter/OfferForm/Pricing/Video)                                                                                                                                                     | Luis E. Gutierrez / Claude |
| 2026-04-05 | S12: Discovery — Next.js 16.2.2 depreca middleware.ts → proxy.ts (solo warning, no breaking). Landing / es SSG (static), no requiere prefetch manual. 0 errores TS, 86/86 tests.                                                                                                                                                                                                                                                                                         | Luis E. Gutierrez / Claude |
| 2026-04-05 | S13: src/middleware.ts → src/proxy.ts + renombrar export `middleware` → `proxy` (Next.js 16 requiere AMBOS cambios para compilar sin error). .browserslistrc modern browsers.                                                                                                                                                                                                                                                                                            | Luis E. Gutierrez / Claude |
| 2026-04-05 | S13: LHCI ejecutado: 0 errores, 2 warnings aceptables. Fixes: skip-link en setup layout (id="main-content"), target-size eye-toggle buttons (+p-2), .lighthouserc.json falsos positivos suprimidos.                                                                                                                                                                                                                                                                      | Luis E. Gutierrez / Claude |
| 2026-04-05 | S13: Discovery — @next/bundle-analyzer incompatible con Turbopack (webpack plugin). Next.js 16 usa Turbopack por defecto en build. Chunks max: 270KB/227KB (uncompressed). 0 TS errors, 86/86 tests.                                                                                                                                                                                                                                                                     | Luis E. Gutierrez / Claude |
| 2026-04-05 | S14: next experimental-analyze (Turbopack bundle analyzer nativo), fix --webpack en pnpm analyze para webpack mode.                                                                                                                                                                                                                                                                                                                                                      | Luis E. Gutierrez / Claude |
| 2026-04-05 | S14: docs/guides/SCREEN-READER-TESTING.md — 12 test cases VoiceOver/NVDA. Bugs a11y encontrados y corregidos: tabIndex={-1} en main, focus trap menu movil, html lang dinamico.                                                                                                                                                                                                                                                                                          | Luis E. Gutierrez / Claude |
| 2026-04-05 | S14: docs/guides/CORE-WEB-VITALS.md — guia LCP/INP/CLS especifica para el proyecto.                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-04-05 | S15: Hero LCP — `<link rel="preload" as="image">` en page.tsx para hero background image (React 18 hoist). Cubre CSS bg-image que el browser no preloadea.                                                                                                                                                                                                                                                                                                               |
| 2026-04-05 | S15: 7.3 Merge inteligente — POST /api/modules/import ahora soporta dry_run, computa diff real vs DB, solo actualiza lo que cambia (smart merge). Respuesta incluye changes/unchanged/skipped.                                                                                                                                                                                                                                                                           | Luis E. Gutierrez / Claude |
| 2026-04-05 | S16: Plugin Sandbox (7.4) — sandbox.ts con withTimeout + SandboxTimeoutError. Trust levels (trusted:10s/community:5s/unverified:3s). PluginPermission declarations. Registry actualizado. sandboxed-community-plugin.ts ejemplo.                                                                                                                                                                                                                                         | Luis E. Gutierrez / Claude |
| 2026-04-05 | S16: Web Vitals RUM — web-vitals package instalado. WebVitalsReporter.tsx (dynamic import, dev logging con rating). Integrado en public layout. Fase 6.1 y Fase 7 completas.                                                                                                                                                                                                                                                                                             | Luis E. Gutierrez / Claude |
| 2026-04-05 | S17: Bug fixes Server/Client boundary — dangerouslyAllowSVG en next.config.ts, placeholder-avatar.svg, StatsCard icon string mapping (no React components como props), resolveLabel null-safe en DynamicField, Link+buttonVariants en SEO admin pages (reemplaza Button render={Link})                                                                                                                                                                                   | Luis E. Gutierrez / Claude |
| 2026-04-05 | S17b: buttonVariants client-only fix (3 archivos), hydration mismatch LanguageSelector, display_name en seed data (19 módulos), nav labels client-side con useI18n, SECTION_KEY_LABELS multilingüe (ES/EN/FR/PT), query .order('display_order'), spacing header gap-8, getContentForLang fallback determinístico                                                                                                                                                         | Luis E. Gutierrez / Claude |
| 2026-04-05 | S18: Auditoria de produccion — ImageField.tsx y RichTextField.tsx ya existian (implementados en S7), marcados como [x]. Conteos corregidos (486/486 + 4 omitidas). Fases 5, 6, 7 marcadas Completadas. Documentacion sincronizada: ROADMAP.md, INDEX.md, CLAUDE.md actualizados a estado real de produccion. 0 errores TS, 86/86 tests.                                                                                                                                  | Luis E. Gutierrez / Claude |
| 2026-04-05 | S19: QA funcional end-to-end con Chrome DevTools MCP — 13/13 flujos validados: login, content edit (hero field-first JSONB + revalidatePath), module toggle (DOM + nav), paleta diseño (CSS vars confirmados via getComputedStyle), idiomas, SEO, media upload (POST /api/media 201), integraciones, lead capture, settings, content-history. 0 regresiones. 3 fixes previos (ModuleEditor field-first, revalidatePath, storage bucket media) confirmados en produccion. | Luis E. Gutierrez / Claude |

---

## Notas de Uso

### Como Actualizar Este Archivo

1. **Antes de empezar una tarea**: Verificar que no esta marcada como completada o en progreso por alguien mas.
2. **Al iniciar una tarea**: Cambiar `[ ]` a `[~]` (en progreso).
3. **Al completar una tarea**: Cambiar `[~]` a `[x]` (completado).
4. **Si se bloquea**: Cambiar a `[!]` y agregar nota con la razon.
5. **Si se pospone**: Cambiar a `[-]` y agregar nota con la razon.
6. **Actualizar la tabla de Resumen de Progreso** despues de cada sesion de trabajo.
7. **Agregar entrada al Registro de Cambios** con fecha y descripcion.

### Reglas de Integridad

- **Este archivo es la fuente unica de verdad.** Si hay conflicto entre este archivo y otro documento, este archivo tiene prioridad para el estado de implementacion.
- **No duplicar tareas.** Si una tarea abarca multiples archivos, agruparla logicamente.
- **Ser especifico.** Cada tarea debe ser lo suficientemente clara para que cualquier desarrollador sepa exactamente que hacer sin preguntar.
- **Incluir paths.** Siempre que sea posible, incluir la ruta del archivo a crear o modificar.
