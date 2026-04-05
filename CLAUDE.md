# Orion Landing Universal — Contexto para Claude

## Descripci&oacute;n

Plantilla de landing page **open-source** y **auto-hospedada** con panel de administraci&oacute;n completo. El usuario configura, personaliza y gestiona su landing page al 100% desde el navegador, sin modificar c&oacute;digo directamente. Backend en Supabase (PostgreSQL + Auth + Storage).

**Creado por**: Luis Enrique Guti&eacute;rrez Campos — Orion AI Society
**Concepto original**: Erwin Rojas
**Licencia**: MIT

## Stack Tecnol&oacute;gico

- **Framework**: Next.js 15 (App Router) + TypeScript strict
- **Estilos**: Tailwind CSS 4 + CSS custom properties para temas
- **UI Admin**: shadcn/ui (Radix UI)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Estado**: Zustand (admin state) + TanStack Query (server data) + React Hook Form + Zod
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deploy**: Vercel (primary) + Docker + Netlify

## Arquitectura

**Patr&oacute;n**: Aplicaci&oacute;n Next.js full-stack con CMS integrado
**Tenencia**: Single-tenant (una instalaci&oacute;n = un sitio)
**Capas**:

1. **Cliente** (Browser): Landing p&uacute;blica + Admin panel (`/admin`) + Setup wizard (`/setup`)
2. **Aplicaci&oacute;n** (Next.js): Server Components, API Routes, Middleware de auth
3. **Servicio**: Module Registry, i18n Engine, Theme Engine, Media Service
4. **Datos**: Supabase (10 tablas con RLS)

**Tablas principales**: `site_config`, `languages`, `page_modules`, `module_schemas`, `leads`, `media`, `theme_config`, `color_palettes`, `integrations`, `seo_config`

## Convenciones

- **Server Components por defecto**, `'use client'` solo cuando sea necesario
- **Feature-based file structure**: cada m&oacute;dulo en su carpeta (`components/modules/{name}/`)
- **Naming**: PascalCase componentes, camelCase utilidades, kebab-case archivos
- **Supabase server client** para Server Components y API Routes (nunca exponer service_role key)
- **Supabase browser client** solo para auth y realtime en el cliente
- **Todas las mutaciones** pasan por API Routes (nunca mutaciones directas desde el cliente)
- **Zod** para validaci&oacute;n de entrada en todos los API Routes
- **Tailwind CSS variables**: `var(--color-primary)`, `var(--color-background)`, etc.
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- **Branch naming**: `feat/module-name`, `fix/bug-description`, `docs/topic`

## Sistema de M&oacute;dulos

19 m&oacute;dulos, todos habilitables/deshabilitables desde admin:

| M&oacute;dulo   | Descripci&oacute;n                             |
| --------------- | ---------------------------------------------- |
| `hero`          | Banner principal con CTA                       |
| `value_prop`    | Propuesta de valor / beneficios                |
| `how_it_works`  | Pasos del proceso                              |
| `social_proof`  | Testimonios (carrusel)                         |
| `client_logos`  | Logos de clientes (marquee)                    |
| `offer_form`    | Formulario de captura de leads                 |
| `faq`           | Preguntas frecuentes (acorde&oacute;n)         |
| `final_cta`     | Call to action final                           |
| `footer`        | Pie de p&aacute;gina                           |
| `stats`         | M&eacute;tricas clave con animaci&oacute;n     |
| `pricing`       | Tabla de precios/planes                        |
| `video`         | Video embebido (YouTube/Vimeo)                 |
| `team`          | Equipo / Sobre nosotros                        |
| `gallery`       | Galer&iacute;a de im&aacute;genes con lightbox |
| `features_grid` | Grid de features con iconos                    |
| `countdown`     | Temporizador de cuenta regresiva               |
| `comparison`    | Tabla comparativa                              |
| `newsletter`    | Signup simple de email                         |
| `map_location`  | Mapa embebido + direcci&oacute;n               |

Cada m&oacute;dulo tiene: `{Name}Module.tsx` (componente), `{name}.schema.ts` (campos editables), `{name}.seed.ts` (contenido demo), `{name}.types.ts` (interfaces).

## Reglas Espec&iacute;ficas

- **El wizard de setup** (`/setup`) solo es accesible si no existen usuarios admin en Supabase Auth
- **Las credenciales de Supabase** se almacenan en `.env.local`, NUNCA en c&oacute;digo cliente
- **i18n es din&aacute;mico**: los idiomas se gestionan desde admin, estructura JSONB `{ "es": "...", "en": "..." }`
- **Fallback de idioma**: currentLang &rarr; defaultLang &rarr; primer idioma disponible &rarr; key
- **Temas via CSS variables**: las paletas se aplican a `:root` como custom properties
- **20 paletas predefinidas** por nicho + soporte para paletas custom
- **Admin responsive**: funcional en tablet (1024px+), vista solo lectura en m&oacute;vil
- **Integraciones**: Google Analytics 4, Meta Pixel, WhatsApp, Calendly, SMTP, scripts custom

## Estado Actual

**Sesi&oacute;n completada**: S7 (Fase 5 — Live Editing infraestructura + Fase 6 Testing base)
**Pr&oacute;xima sesi&oacute;n**: S8 (Integraci&oacute;n Live Edit en m&oacute;dulos + Fase 6 Polish: Lighthouse, a11y, security + Fase 7 Marketplace)
**Tareas totales**: ~500 (~470 completadas, ~30 pendientes)
**&Uacute;ltima actualizaci&oacute;n**: 2026-04-05

## Reglas de Mantenimiento de Documentaci&oacute;n (OBLIGATORIO)

### Control de Desarrollo

- **ANTES de implementar cualquier tarea**: verificar `docs/DEVELOPMENT-TRACKER.md` para confirmar que no est&aacute; ya hecha o en progreso
- **DESPU&Eacute;S de completar cualquier tarea**: marcarla como completada en el tracker inmediatamente
- **NUNCA avanzar sin actualizar el tracker** — es la fuente &uacute;nica de verdad del progreso

### Sincronizaci&oacute;n de Documentaci&oacute;n

- Si la implementaci&oacute;n **diverge** de una spec (cambio de enfoque, limitaci&oacute;n t&eacute;cnica, mejora descubierta): actualizar la spec correspondiente en `docs/specs/`
- Si se toma una **nueva decisi&oacute;n arquitect&oacute;nica**: crear un ADR en `docs/architecture/adr/`
- Si se descubre un **bug, gotcha o limitaci&oacute;n**: documentar en la secci&oacute;n relevante de la spec
- El DEVELOPMENT-TRACKER.md se actualiza **por tarea**, no al final del d&iacute;a

### Auditor&iacute;as

- Las resoluciones de auditor&iacute;as externas se documentan en `docs/AUDIT-RESOLUTION.md`
- Archivos originales de auditor&iacute;a se conservan en `auditoria_gemini/` (o carpeta del auditor) como referencia hist&oacute;rica

## Documentaci&oacute;n

Toda la documentaci&oacute;n del proyecto est&aacute; en `docs/`. El &iacute;ndice maestro est&aacute; en [docs/INDEX.md](docs/INDEX.md).

## ADRs (Decisiones Arquitect&oacute;nicas)

1. **ADR-001**: Next.js 15 como framework (sobre Astro, SvelteKit, Nuxt)
2. **ADR-002**: Supabase como backend (sobre Firebase, PlanetScale)
3. **ADR-003**: Admin en ruta separada `/admin` + edici&oacute;n inline h&iacute;brida
4. **ADR-004**: i18n din&aacute;mico desde admin (no hardcodeado)
5. **ADR-005**: Patr&oacute;n Registry para m&oacute;dulos (no switch/case)
6. **ADR-006**: Deploy: Vercel + Docker + Netlify (sin export est&aacute;tico)
7. **ADR-007**: Sistema de temas preparado para marketplace futuro

## Protocolo de Rotaci&oacute;n de Sesiones (OBLIGATORIO)

Este proyecto se implementa en **m&uacute;ltiples sesiones de Claude Code**. Cada sesi&oacute;n arranca con contexto limpio para maximizar precisi&oacute;n y minimizar alucinaciones.

### Mapa de Sesiones

| Sesi&oacute;n | Alcance  | Objetivo                                                                                 |
| ------------- | -------- | ---------------------------------------------------------------------------------------- |
| S0            | Fase 0   | Documentaci&oacute;n arquitect&oacute;nica completa (**COMPLETADA**)                     |
| S1            | Fase 1   | Foundation: scaffold Next.js 15, schema Supabase, Auth + RLS (**COMPLETADA**)            |
| S2            | Fase 2   | Setup Wizard completo (5 pasos, DDL, seed) (**COMPLETADA**)                              |
| S3            | Fase 3a  | Motor de renderizado + M&oacute;dulos 1-10 (**COMPLETADA**)                              |
| S4            | Fase 3b  | M&oacute;dulos 11-19 + i18n + Temas (**COMPLETADA**)                                     |
| S5            | Fase 4a  | Admin Panel bloques 1-7 (**COMPLETADA** en 2026-04-05)                                   |
| S6            | Fase 4b  | Admin Panel bloques 8-11 (media, integrations, leads, settings) (**COMPLETADA**)         |
| S7            | Fase 5+6 | Live Editing infraestructura + Testing base (**COMPLETADA** en 2026-04-05)               |
| S8            | Fase 7   | Integraci&oacute;n Live Edit en m&oacute;dulos + Polish (Lighthouse, a11y) + Marketplace |

### Al INICIAR cada sesi&oacute;n (PRIMERA ACCI&Oacute;N)

1. Leer este archivo (`CLAUDE.md`) completo
2. Leer `docs/DEVELOPMENT-TRACKER.md` para saber qu&eacute; est&aacute; hecho y qu&eacute; sigue
3. Buscar en engram: `mem_search(query: "session summary", project: "landingpage_universal")`
4. Leer la spec correspondiente a la fase actual (ej: para S2 leer `docs/specs/WIZARD-FLOW.md`)
5. **NO leer** specs de fases futuras ni archivos de fases ya completadas (a menos que sean dependencias directas)

### Al CERRAR cada sesi&oacute;n (ANTES de decir "listo")

1. **Actualizar** `docs/DEVELOPMENT-TRACKER.md` — marcar TODAS las tareas completadas
2. **Actualizar** `Estado Actual` en este archivo (`CLAUDE.md`) con la fase/sesi&oacute;n actual
3. **Guardar** resumen de sesi&oacute;n en engram v&iacute;a `mem_session_summary` con: Goal, Discoveries, Accomplished, Next Steps, Relevant Files
4. **Si la implementaci&oacute;n divergi&oacute; de alguna spec**: actualizar la spec antes de cerrar
5. **Generar el prompt de continuaci&oacute;n** para la siguiente sesi&oacute;n y entreg&aacute;rselo al usuario

### Cu&aacute;ndo rotar a sesi&oacute;n nueva

Claude DEBE sugerir al usuario cambiar de sesi&oacute;n cuando:

- Se completa el alcance definido para la sesi&oacute;n actual (ver mapa arriba)
- El contexto se siente saturado (muchas iteraciones de debug, re-lecturas excesivas)
- Se ha acumulado m&aacute;s de ~100K tokens de conversaci&oacute;n
- Se detect&oacute; una compactaci&oacute;n de contexto

### Plantilla de Prompt de Continuaci&oacute;n

Al cerrar sesi&oacute;n, generar un prompt con esta estructura para que el usuario lo pegue en la nueva sesi&oacute;n:

```
Soy [nombre del usuario]. Estamos desarrollando Orion Landing Universal.

PROYECTO: c:/Users/LABORATORIO/Downloads/desarrollos/ORION OCG/landingpage_universal
SESI&Oacute;N: S[N] — [Nombre de la fase]

ACCIONES INMEDIATAS:
1. Lee CLAUDE.md en la ra&iacute;z del proyecto
2. Lee docs/DEVELOPMENT-TRACKER.md (busca tareas pendientes de Fase [X])
3. Busca en engram: mem_search("session summary", project: "landingpage_universal")
4. Lee la spec: docs/specs/[SPEC-RELEVANTE].md

OBJETIVO DE ESTA SESI&Oacute;N:
[Descripci&oacute;n espec&iacute;fica de lo que se debe implementar]

CONTEXTO CLAVE DE LA SESI&Oacute;N ANTERIOR:
[2-3 puntos cr&iacute;ticos que la nueva sesi&oacute;n necesita saber]

NO hacer: [Cosas espec&iacute;ficas a evitar, como re-implementar algo ya hecho]
```

## Correcciones Post-Auditor&iacute;a (2026-04-04)

- **Wizard DDL**: `supabase-js` NO puede ejecutar CREATE TABLE. Soluci&oacute;n: conexi&oacute;n directa PostgreSQL v&iacute;a paquete `postgres` + fallback a SQL Editor manual
- **Lazy Loading obligatorio**: Todos los m&oacute;dulos en el registry DEBEN usar `next/dynamic` con `ssr: true`
- **i18n queries**: P&aacute;gina p&uacute;blica usa `content->>'lang'` (solo idioma activo). Admin trae JSONB completo
- **.env.local**: Solo funciona en dev/Docker/VPS. PaaS usa env vars de la plataforma
- **i18n prioridad**: Cookie (preferencia usuario) > DB default (languages.is_default)
- Ver detalles completos en `docs/AUDIT-RESOLUTION.md`

## Hallazgos clave S7 (2026-04-05)

- **`MediaPicker` interfaz real**: `{ value?: string; onChange: (url: string) => void; placeholder?: string }` — NO usa `open`/`onOpenChange`/`onSelect`. Siempre leer el archivo antes de integrar.
- **`editor.store.ts` extendido**: Se agreg&oacute; `editingModuleId` y `setEditingModule`. NO crear un store separado `edit-mode-store.ts`.
- **Live Editing pendiente integraci&oacute;n**: Los componentes `EditableText`, `EditableImage`, etc. est&aacute;n listos en `src/components/live-edit/`. Cada m&oacute;dulo debe adoptar estos componentes en S8.
- **SortablePageWrapper**: Debe integrarse en `src/app/(public)/page.tsx` en S8 para habilitar DnD en la landing.
- **Vitest**: 32 tests pasando. Ejecutar con `pnpm test:run`. Coverage con `pnpm test:coverage`.
- **Playwright**: Configurado pero browsers no instalados. Instalar con `pnpm exec playwright install chromium` antes de correr E2E.
