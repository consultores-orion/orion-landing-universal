# Orion Landing Universal — Contexto para Claude

## Descripci&oacute;n

Plantilla de landing page **open-source** y **auto-hospedada** con panel de administraci&oacute;n completo. El usuario configura, personaliza y gestiona su landing page al 100% desde el navegador, sin modificar c&oacute;digo directamente. Backend en Supabase (PostgreSQL + Auth + Storage).

**Creado por**: Luis Enrique Guti&eacute;rrez Campos — Orion AI Society
**Concepto original**: Erwin Rojas
**Licencia**: MIT

## Stack Tecnol&oacute;gico

- **Framework**: Next.js 16 (App Router) + TypeScript strict
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

**Estado**: Completado — Listo para producci&oacute;n (Fases 0-7) — QA funcional validado
**Sesi&oacute;n completada**: S19 (QA funcional end-to-end con Chrome DevTools MCP)
**Tareas totales**: 486/486 completadas + 4 omitidas justificadamente
**TypeScript**: 0 errores | **Tests**: 86/86 | **Vulnerabilidades**: 0
**&Uacute;ltima actualizaci&oacute;n**: 2026-04-05

## Hallazgos clave S19 — QA Funcional (2026-04-05)

- **Validaci&oacute;n end-to-end completa**: 13/13 flujos cr&iacute;ticos del admin validados con Chrome DevTools MCP. 0 regresiones encontradas.
- **`content_changes` solo registra inline edits**: La tabla y la UI `/admin/content-history` rastrean &uacute;nicamente `PUT /api/inline-edit` (clicks sobre texto en la landing p&uacute;blica). Las ediciones del panel admin (`PUT /api/content/[section_key]`) NO se auditan ah&iacute;. Esto es comportamiento correcto por dise&ntilde;o — 0 registros despu&eacute;s de sesiones de edici&oacute;n admin es esperado y v&aacute;lido.
- **Los 3 fixes cr&iacute;ticos confirmados en producci&oacute;n**: (1) `ModuleEditor` field-first JSONB — save en Espa&ntilde;ol se refleja inmediatamente en `/`; (2) `revalidatePath('/')` en `PUT /api/content/[section_key]` — propagaci&oacute;n inmediata sin reload manual; (3) Bucket `media` en storage-seed + 12 RLS policies — `POST /api/media` retorna 201 con URL Supabase v&aacute;lida.
- **Verificaci&oacute;n de CSS vars requiere `evaluate_script`**: El &aacute;rbol de accesibilidad no expone valores de custom properties. Usar `getComputedStyle(document.documentElement).getPropertyValue('--color-primary')` para confirmar cambios de paleta.
- **`upload_file` DevTools no puede apuntar a inputs `display:none`**: Para testing automatizado de media upload, usar `evaluate_script` con `fetch` + `FormData` + `Blob` sint&eacute;tico hacia `/api/media`.
- **Toggle de m&oacute;dulo afecta DOM y nav simult&aacute;neamente**: Deshabilitar un m&oacute;dulo desde `/admin/modules` elimina tanto el componente del DOM p&uacute;blico como su link de navegaci&oacute;n en el header. Re-habilitar restaura ambos. Comportamiento correcto y verificado.
- **i18n SSR es limitaci&oacute;n conocida**: Server Components renderizan en idioma por defecto de BD. Labels del nav y selector de idioma cambian client-side inmediatamente. Contenido de m&oacute;dulos (Server Components) requiere navegaci&oacute;n o recarga para reflejar nuevo idioma. Documentado en hallazgos S14.

## Hallazgos clave Contra-Auditor&iacute;a (2026-04-05)

- **Storage bucket `media` faltante**: `storage-seed.ts` creaba buckets `page_images` y `avatars` pero NO `media`. La API `POST /api/media` fallaba con `StorageApiError: Bucket not found` (500). Fix: bucket `media` agregado al seed. Migraci&oacute;n `003_storage_buckets.sql` creada con los 3 buckets + 12 RLS policies en `storage.objects`.
- **Storage RLS policies faltantes**: Supabase habilita RLS en `storage.objects` por defecto. Sin policies expl&iacute;citas, TODAS las operaciones de Storage son denegadas. Se crearon policies: SELECT p&uacute;blico + INSERT/UPDATE/DELETE para authenticated, por cada bucket.
- **La tabla `media` vac&iacute;a es estado correcto**: No se siembra con datos ficticios. Los registros se crean cuando el admin sube archivos desde `/admin/media`. Los m&oacute;dulos (gallery, team, hero) usan URLs directas en JSONB, no FK a `media`.
- **GET /api/media funciona correctamente con tabla vac&iacute;a**: Retorna `{ data: [], total: 0 }` (200). Solo POST fallaba por bucket inexistente.

## Hallazgos clave S16 (2026-04-05)

- **Plugin Sandbox — timeout-based, no VM**: La sandbox implementada usa `Promise.race` con un timer (`withTimeout` en `src/lib/plugins/sandbox.ts`). NO usa Worker Threads ni `isolated-vm` (overkill para landing page template, no funciona bien en Vercel serverless). La protección real es: timeout (evita plugins colgados), trust tiers (documentan confianza), permission declarations (auditing). `SandboxTimeoutError` se distingue de errores normales con `console.warn` en lugar de `console.error`.
- **Trust tiers → timeouts**: `trusted` = 10 000ms (default, backwards compat), `community` = 5 000ms, `unverified` = 3 000ms. `plugin.timeout` override tiene precedencia.
- **PluginPermission es declarativo (no enforcement)**: `'network' | 'console' | 'env_read'` sirven para documentación y futuras auditorías. El registry NO bloquea plugins que usen capacidades no declaradas todavía.
- **Web Vitals via dynamic import**: `WebVitalsReporter.tsx` usa `import('web-vitals')` dinámico dentro de `useEffect`. Esto asegura que el bundle de `web-vitals` (~5KB) NO esté en el critical path. Se loguea en consola de dev con `rating` (good/needs-improvement/poor).
- **Fase 7 completa**: Todas las 25 tareas de Fase 7 (Marketplace y Comunidad) están marcadas como completas. Plugin sandbox era la última pendiente.
- **pnpm type-check**: 0 errores al cierre de S16. 86/86 tests.

## Hallazgos clave S17 (2026-04-05)

- **next/image SVG bloqueados — dangerouslyAllowSVG**: `next.config.ts` no tenía `dangerouslyAllowSVG: true`. Las imágenes de placehold.co (seed data de gallery) retornan SVG, y `next/image` las bloqueaba. Fix: agregar `dangerouslyAllowSVG: true` + `contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"` en el bloque `images` de next.config. La política CSP sandbox previene ejecución de scripts en SVGs.
- **placeholder-avatar.svg creado**: `public/placeholder-avatar.svg` — ícono minimalista de silueta (200×200, fondo `#e5e7eb`, silueta `#9ca3af`). Resuelve 404 del fallback en `TeamModule.tsx:142` cuando `avatar_url` está vacío en seed data.
- **StatsCard icon — Server/Client boundary**: `DashboardPage` (Server Component) pasaba componentes Lucide (`Users`, `Puzzle`, `Languages`, `Clock`) como props a `StatsCard` (Client Component). Next.js 16 prohíbe pasar funciones/componentes a través de la frontera Server→Client. Fix: `StatsCard` ahora acepta `icon: string` con un `iconMap` interno que resuelve el componente Lucide client-side. Dashboard pasa `icon="users"` en lugar de `icon={Users}`.
- **resolveLabel crash con undefined**: `DynamicField` llamaba `resolveLabel(field.label)` pero los schemas en la BD (seed data) no incluyen `label`. `resolveLabel(undefined)` intentaba acceder a `undefined['es']` → TypeError. Fix: (1) `resolveLabel` ahora acepta `undefined` con guard temprano `if (!label) return ''`, (2) `DynamicField` genera label legible desde `field.key` como fallback (`background_image` → `"Background Image"`).
- **SEO pages Button — Base UI nativeButton**: `Button` (basado en `@base-ui/react`) espera `<button>` nativo. Las páginas SEO usaban `<Button render={<Link>}>` para navegación, violando la expectativa de Base UI. Fix: reemplazado con `<Link className={buttonVariants(...)}>` — semánticamente correcto (links de navegación = `<a>`) y elimina el warning.
- **Patrón establecido — Links como botones**: Para elementos de navegación que necesitan estilo de botón en Server Components, usar `<Link className={buttonVariants({ variant, size })}>` en lugar de `<Button asChild>` o `<Button render={<Link>}>`. Esto evita problemas de Server/Client boundary y es semánticamente correcto.
- **pnpm type-check**: 0 errores al cierre de S17.
- **`buttonVariants()` es client-only**: `src/components/ui/button.tsx` tiene `'use client'`, lo que prohíbe llamar a `buttonVariants()` desde Server Components. Fix en 3 archivos: reemplazado con clases Tailwind inline equivalentes en `seo/page.tsx`, `seo/[lang]/page.tsx`, y `leads/[id]/page.tsx`.
- **Hydration mismatch en LanguageSelector**: `I18nProvider` leía `localStorage` en el inicializador de `useState`, causando diferencia entre server render (defaultLang) y client hydration (localStorage lang). Fix: `useState` siempre inicializa con `defaultLang`; detección de idioma preferido se mueve a `useEffect` post-hydration.
- **`display_name` nunca se poblaba en seed data**: La interfaz `SeedPageModule` no incluía `display_name`. Los 19 módulos se guardaban con `display_name: {}` vacío. El header fallback llegaba hasta `section_key` crudo (`social_proof`, `final_cta`). Fix: (1) `display_name` con ES/EN agregado a los 19 módulos en seed-data.ts, (2) seeding code actualizado, (3) fallback estático multilingüe en SiteHeaderClient.
- **Nav labels resueltos client-side, no server-side**: `SiteHeader.tsx` resolvía labels server-side con `currentLang` hardcodeado a `'es'`. No respetaba el idioma seleccionado por el usuario. Fix: SiteHeader ahora pasa datos crudos (`display_name`) a `SiteHeaderClient`, que usa `useI18n()` para resolver labels en el idioma activo del usuario.
- **Fallback map multilingüe (ES/EN/FR/PT)**: `SECTION_KEY_LABELS` movido de SiteHeader (server, solo español) a SiteHeaderClient (client, 4 idiomas). Cadena de fallback: `display_name[currentLang]` → `display_name[defaultLang]` → `fallback[currentLang]` → `fallback[defaultLang]` → `fallback['es']` → `section_key`.
- **Query sin `.order('display_order')`**: La query en `layout.tsx` no ordenaba módulos por `display_order`. Nav mostraba módulos en orden arbitrario de BD. Fix: agregado `.order('display_order', { ascending: true })` y `display_order` al select.
- **Spacing header**: `"Mi Sitio"` pegado a `"Beneficios"` — faltaba `gap-8` en el contenedor flex principal de `SiteHeaderClient.tsx`.
- **`getContentForLang` fallback determinístico**: `Object.values(content)[0]` era impredecible. Cadena cambiada a: `content[lang]` → `content[defaultLang]` → `content['es']` → `content['en']` → `Object.values(content)[0]` → `''`.

## Hallazgos clave S15 (2026-04-05)

- **Hero LCP preload**: `src/app/(public)/page.tsx` agrega `<link rel="preload" as="image" href={heroBgUrl} />` para el background del Hero. React 18 hoist automático a `<head>`. URL se extrae de `styles.backgroundImage` (CSS rendering path en ModuleWrapper) con fallback a `content.backgroundImage.url`. Solo se renderiza el link si existe una URL no vacía.
- **CSS background-image no se preloadea**: El navegador descubre `background-image: url(...)` al aplicar CSS, DESPUÉS del parse HTML inicial. Esto retarda LCP cuando la imagen de fondo es el elemento LCP candidato. El `<link rel="preload">` soluciona esto sin cambiar el rendering approach.
- **next/image NO aplica para hero background**: `next.config.ts` solo whitelist `*.supabase.co`. Los admins pueden configurar cualquier URL de imagen como background → `next/image` fallaría con URLs externas. La solución preload es universalmente segura.
- **7.3 Merge inteligente implementado**: `POST /api/modules/import` ahora: (1) fetches current DB state before applying, (2) computes diff (changes/unchanged/skipped), (3) supports `dry_run: true` para preview sin aplicar, (4) solo actualiza lo que realmente difiere del estado actual (no full overwrite). Respuesta siempre incluye diff detallado.
- **pnpm type-check**: 0 errores al cierre de S15. 86/86 tests.

## Hallazgos clave S8 (2026-04-05)

- **SortableModuleItem** creado: `src/components/live-edit/SortableModuleItem.tsx` — Client Component que encapsula `SortableModuleWrapper` con handlers API internos (move up/down, toggle visibility). Usar este en `page.tsx` en lugar de pasar callbacks desde Server Component.
- **EditableText tiene prop `style?`**: Se agreg&oacute; `style?: CSSProperties` al componente para preservar estilos inline dinámicos (colores de hero con fondo). Leer el componente antes de integrar en otros m&oacute;dulos.
- **display_name en page_modules es JSONB** (`Record<string,string>`), no string. `page.tsx` usa helper `resolveDisplayName` para extraer el string.
- **Rate limiting in-memory**: `src/lib/security/rate-limit.ts` — funciona en Docker/VPS (single-instance). En Vercel serverless, cada función tiene memoria separada — limitación conocida.
- **Phase 7 bases**: Export/import de paletas, temas y layouts implementado. API routes en `/api/design/palette/`, `/api/design/theme/export|import`, `/api/modules/export|import`.
- **pnpm type-check**: 0 errores al cierre de S8.

## Hallazgos clave S9 (2026-04-05)

- **jest-axe requiere `expect.extend(toHaveNoViolations)` explicit** en Vitest (no auto-extend como en Jest). Agregar en `src/__tests__/setup.ts`. Deshabilitar regla `color-contrast` en jsdom (false positives sin CSS real).
- **jsdom normaliza colores CSS**: `toHaveStyle({ color: 'blue' })` falla — usar `rgb(0, 0, 255)`.
- **`useEditorStore` mock pattern**: el selector function de Zustand requiere mock que acepta una función `(state) => state.isEditing`. Patr&oacute;n establecido en `src/__tests__/components/`.
- **Playwright en CI**: requiere flags `--no-sandbox --disable-dev-shm-usage` en GitHub Actions (sin display real). Configurado en `.lighthouserc.json`.
- **Plugin system**: `Promise.allSettled` en `emit()` — un plugin que falla NO bloquea los demás. Las rutas `leads` y `inline-edit` ahora emiten hooks. Los plugins van en `src/lib/plugins/`.
- **POST /api/leads**: cambió de `insert()` a `insert().select().single()` para obtener el registro completo para el plugin `onLeadCaptured`.
- **37 endpoints API internos** documentados en `docs/api/INTERNAL-API.md`. El único endpoint público (sin auth) es `POST /api/leads`.
- **pnpm audit**: 0 vulnerabilidades en 830 deps al cierre de S9.
- **pnpm type-check**: 0 errores al cierre de S9. 86/86 tests.

## Hallazgos clave S10 (2026-04-05)

- **`next/image` en 5 módulos**: `SiteHeaderClient`, `SocialProofModule`, `TeamModule`, `ClientLogosModule`, `GalleryModule`. Lightbox fullscreen deja `<img>` nativo (dimensiones desconocidas, puede ser URL externa).
- **prefers-reduced-motion en 3 niveles**: (1) `globals.css` global (cubre Tailwind `animate-*`), (2) inline `@media` en marquee keyframes de `ClientLogosModule`, (3) check JS en `useEffect` de `AnimatedCounter` en `StatsModule` — evita hydration mismatch moviendo el check al cliente.
- **a11y WCAG 2.1 AA — patches aplicados**: `tabIndex={-1}` removido de botones de toggle password (setup wizard), `aria-label` en botones sin texto, `aria-pressed` en toggles, `role="status" aria-live="polite"` en mensajes de éxito (NewsletterModule, OfferFormModule, EditableImage SaveBadge), `aria-hidden="true"` en íconos decorativos.
- **RLS audit completo**: 10 tablas revisadas, todas correctamente configuradas. `integrations` sin acceso público (protege API keys). `leads` INSERT público mitigado por rate limiting + Zod. Sin brechas encontradas.
- **`content_changes` table**: Migración `supabase/migrations/002_content_changes.sql` creada. `src/types/database.ts` actualizado. `PUT /api/inline-edit` captura `old_value` y persiste log de forma non-blocking (`.then()` en vez de `await`). No hay UI admin para ver el historial todavía (pendiente S11).
- **ThemePreviewPanel**: `src/components/admin/design/ThemePreviewPanel.tsx` — preview de paleta en tiempo real sin DB call. Usa `paletteToCSSVars()` + inline styles en contenedor aislado. Integrado en `DesignEditor.tsx`.
- **CLI scaffold**: `scripts/create-module.js` genera los 5 archivos del módulo (`{Name}Module.tsx`, `{name}.schema.ts`, `{name}.seed.ts`, `{name}.types.ts`, `index.ts`). Script `pnpm scaffold:module` en `package.json`. Validación kebab-case, check de directorio existente, imprime snippet del registry al final.
- **pnpm type-check**: 0 errores al cierre de S10. 86/86 tests.

## Hallazgos clave S11 (2026-04-05)

- **content_changes admin UI**: `/admin/content-history` — Server Component + Client orchestrator. Misma arquitectura que `/admin/leads`. API `GET /api/content-changes` con paginación y filtros (section_key, dateFrom, dateTo). Link "Historial" agregado al AdminSidebar entre Leads y Configuración.
- **CLI npm package**: `packages/create-orion-module/` — bin: `npx create-orion-module`. Fix crítico: `projectRoot = process.cwd()` en lugar de `path.resolve(__dirname, '..')` — en npx, `__dirname` apunta al cache npm, no al proyecto del usuario. `pnpm-workspace.yaml` actualizado con `packages/*`.
- **Community docs**: 5 archivos en `docs/community/` — SHOWCASE.md, CONTRIBUTOR-PROGRAM.md, CONTRIBUTORS.md, THEME-GALLERY.md, MODULE-TEMPLATE-REPO.md. `docs/INDEX.md` actualizado con sección Community.
- **Palette contrast validator**: `src/lib/themes/contrast.ts` — utilidad pura (sin deps externas) que implementa la fórmula WCAG 2.1 (luminancia relativa + ratio 1-21). Checks 5 pares críticos (text/bg, text/surface, #fff/primary, primary/bg). `hexToRgb` usa `charAt()` no bracket indexing (fix para `noUncheckedIndexedAccess`). ThemePreviewPanel muestra badge verde/rojo + tabla de ratios por par.
- **pnpm type-check**: 0 errores al cierre de S11. 86/86 tests.

## Hallazgos clave S12 (2026-04-05)

- **Bundle analyzer configurado**: `@next/bundle-analyzer` instalado, script `pnpm analyze` disponible. La landing `/` compila como SSG (static) en build, no necesita prefetch manual.
- **LHCI integrado**: `@lhci/cli` instalado, `.lighthouserc.json` actualizado con `startServerCommand: "pnpm start"`. Para auditar: `pnpm build && pnpm lhci`. Script `pnpm lighthouse` hace ambos pasos en uno.
- **`focus:` → `focus-visible:` pattern**: Todos los módulos y componentes shared usaban `focus:outline-none focus:ring-2` — viola WCAG 2.4.7 porque muestra ring en mouse click y elimina outline para teclado. Patrón correcto: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`. 13 instancias corregidas en Hero, Newsletter, OfferForm, Pricing, Video.
- **`*:focus-visible` CSS global**: Agregado en `globals.css` como baseline WCAG 2.4.7 para cualquier elemento interactivo sin estilos custom. Usa `var(--color-primary)` para respetar el tema dinámico.
- **Skip link (WCAG 2.4.1)**: `<a href="#main-content" className="skip-link">` en `layout.tsx`. `.skip-link` CSS en `globals.css` — aparece solo al recibir focus con teclado (`top: -100%` → `top: 0`). Target `id="main-content"` en `<main>` de `page.tsx`.
- **GalleryModule lightbox**: Refactorizado para WCAG completo — imágenes en `<button type="button">` con `aria-label`, lightbox con `role="dialog" aria-modal="true"`, focus trap con `useRef` (abre → foca close button, cierra → restaura foco al trigger), contador con `aria-live="polite"`.
- **SiteHeaderClient**: Agregado `useEffect` para cerrar menú móvil con tecla Escape. Links con `focus-visible:ring-2`.
- **ClientLogosModule**: Marquee marcado `aria-hidden="true"` (decorativo). `<ul className="sr-only">` con lista de clientes para lectores de pantalla (sin duplicados).
- **Next.js 16 warning**: `middleware.ts` → `proxy.ts` deprecation warning en build. No es breaking aún pero se debe renombrar en S13.
- **pnpm type-check**: 0 errores al cierre de S12. 86/86 tests.

## Hallazgos clave S13 (2026-04-05)

- **Next.js 16 renombra AMBAS cosas**: El archivo `middleware.ts` → `proxy.ts` Y la función exportada `middleware` → `proxy`. Si solo renombras el archivo pero no la función, el build falla con "Proxy is missing expected function export name". Ambos cambios son obligatorios.
- **Conflicto middleware+proxy**: Si ambos archivos existen simultáneamente, Next.js 16 falla con error de build (no solo warning). El archivo `middleware.ts` DEBE ser eliminado (`git rm -f`) antes de compilar.
- **LHCI en dev sin Supabase**: La landing `/` nunca puede auditarse sin Supabase configurado — el proxy redirige a `/setup/connect`. Para audit real: desplegar en producción o configurar `.env.local` con Supabase real y `setup_completed = true`.
- **@next/bundle-analyzer incompatible con Turbopack**: Next.js 16 usa Turbopack para `next build` por defecto. `@next/bundle-analyzer` es webpack-only y no genera HTML. Chunks más grandes (sin comprimir): 270KB, 227KB. Con gzip ~70% menor.
- **Skip link en setup pages**: El skip link en `layout.tsx` tiene target `#main-content`, pero el setup layout no tenía ese ID → Axe `skip-link` failure. Fix: `<main id="main-content" tabIndex={-1}>` en `src/app/setup/layout.tsx`.
- **target-size en wizard**: Eye-toggle buttons en setup wizard sin padding → 16×16px tap target. Axe falla con tap targets < 24×24px. Fix: añadir `p-2 rounded` → 32×32px.
- **LHCI result (S13)**: 0 errores, 2 warnings — LCP 0.71 en setup page (acceptable), 1 legacy JS de dependencias (acceptable con .browserslistrc añadido).
- **pnpm type-check**: 0 errores al cierre de S13. 86/86 tests.

## Hallazgos clave S14 (2026-04-05)

- **`next experimental-analyze` es el bundle analyzer nativo de Turbopack**: disponible en Next.js 16.1+. Comando: `pnpm analyze:turbo`. Usa `pnpm analyze:turbo:out` para output estático. Para webpack clásico: `pnpm analyze` (usa flag `--webpack`). Implementado en `package.json`.
- **i18n usa localStorage (no cookies)**: El sistema de idioma almacena la preferencia en `localStorage` (key: `orion_lang`). Server-side layout.tsx NO puede leer el idioma. Solución: `HtmlLangUpdater.tsx` client component dentro de `I18nProvider` que actualiza `document.documentElement.lang` vía `useEffect`.
- **HeroModule usa CSS background-image**: No usa `next/image` → no hay preload automático → posible LCP regression en producción. Quick-win documentado en `docs/guides/CORE-WEB-VITALS.md`.
- **Fix: `tabIndex={-1}` en `<main id="main-content">`**: `src/app/(public)/page.tsx` — necesario para que el skip link mueva el foco correctamente en todos los navegadores.
- **Fix: Focus trap en menú móvil**: `src/components/shared/SiteHeaderClient.tsx` — Tab/Shift+Tab cicla dentro del menú cuando está abierto. Focus se mueve al primer elemento al abrir. `menuRef` en `<nav id="mobile-menu">`.
- **Fix: `<html lang>` dinámico**: `src/components/shared/HtmlLangUpdater.tsx` (nuevo) + integrado en `src/app/(public)/layout.tsx`. Screen readers ahora reciben el idioma correcto cuando el usuario cambia de idioma.
- **Guides creadas en S14**: `docs/guides/SCREEN-READER-TESTING.md` (12 test cases VoiceOver/NVDA), `docs/guides/CORE-WEB-VITALS.md` (LCP/INP/CLS específico para el proyecto).

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
