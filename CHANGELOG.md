# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **[S8] Live Editing — Module Integration**: `EditableText`, `EditableImage`, and `EditableRichText` components integrated into Hero, Value Prop, and How It Works modules
- **[S8] Live Editing — Drag & Drop**: `SortablePageWrapper` integrated in `src/app/(public)/page.tsx` for live module reordering
- **[S8] Security — Rate Limiting**: In-memory rate limiting on leads capture, inline-edit, and setup endpoints to prevent abuse
- **[S8] Security — HTTP Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers configured in middleware
- **[S8] Documentation**: Professional `README.md` with badges, full feature list, quick start options, and tech stack table
- **[S8] Documentation**: `CHANGELOG.md` in Keep a Changelog format
- **[S8] Documentation**: Deploy guides for Vercel, Docker, Netlify, and VPS (`docs/deploy/`)

---

## [0.1.0] - 2026-04-05

### Added

#### Phase 0 — Architecture Documentation

- Complete project documentation: PRD, roadmap, architecture overview, data model, security model
- 7 Architecture Decision Records (ADRs) covering framework, backend, admin routing, i18n, module pattern, deployment, and themes
- Technical specifications: MODULE-SYSTEM, WIZARD-FLOW, ADMIN-PANEL, I18N-SYSTEM, THEME-SYSTEM, INTEGRATIONS
- Governance documents: GOVERNANCE, CONSTITUTION, CANONICAL conventions, CONTRIBUTING guide, CODE-OF-CONDUCT

#### Phase 1 — Foundation

- Next.js 15 project scaffold with App Router, TypeScript strict mode, Tailwind CSS 4, ESLint 9, and Prettier
- Supabase integration: browser client, server client, admin client, and middleware helper
- Database schema: 10 tables (`site_config`, `languages`, `page_modules`, `module_schemas`, `leads`, `media`, `theme_config`, `color_palettes`, `integrations`, `seo_config`) with full RLS policies and performance indexes
- Supabase seed data: 20 predefined color palettes, default languages (ES/EN), theme config, SEO defaults
- Authentication flow: login page, Supabase Auth callback, logout endpoint, auth guard helpers
- Middleware: session refresh, `/admin` protection, setup redirect, security headers
- Production Dockerfile (multi-stage: deps → build → runner) with `node:20-alpine`
- `docker-compose.yml` with healthcheck pointing to `/api/health`
- GitHub Actions CI workflow: install → lint → type-check → build
- Husky pre-commit hook with lint-staged (ESLint + Prettier on staged files)
- All state management libraries: Zustand 5, TanStack Query 5, React Hook Form 7, Zod 4, DND Kit 6

#### Phase 2 — Setup Wizard

- 5-step setup wizard at `/setup` (only accessible before first admin user is created):
  - Step 1: Supabase connection — URL, Anon Key, Service Role Key, Database URL; live connection test
  - Step 2: Database tables — DDL execution via direct PostgreSQL connection (`postgres` package); manual SQL fallback for restricted environments
  - Step 3: Seed data — inserts 20 color palettes, default languages, theme config, SEO config
  - Step 4: Site configuration — name, tagline, contact email, social links
  - Step 5: Admin account — creates Supabase Auth user and grants admin role
- `getSetupState()` and `getRedirectStep()` utilities for automatic wizard routing
- Middleware integration: incomplete setup redirects all traffic to the appropriate wizard step

#### Phase 3 — Public Landing Page

- Page renderer that fetches enabled modules from Supabase and renders them in order
- Module Registry pattern: each module is a lazy-loaded Next.js dynamic component registered centrally
- All 19 landing page modules implemented with full TypeScript interfaces, Zod schemas, seed data, and responsive design:
  - `hero`, `value_prop`, `how_it_works`, `social_proof`, `client_logos`, `offer_form`, `faq`, `final_cta`, `footer`
  - `stats`, `pricing`, `video`, `team`, `gallery`, `features_grid`, `countdown`, `comparison`, `newsletter`, `map_location`
- Dynamic i18n engine: reads active language from cookie with fallback chain (cookie → DB default → first available)
- Theme engine: applies color palettes as CSS custom properties on `:root`; 20 niched palettes
- Dynamic `generateMetadata()` from `seo_config` table
- Auto-generated `sitemap.xml` and `robots.txt`
- Open Graph tags, JSON-LD structured data (FAQ schema)
- Responsive layout; mobile hamburger menu for site header

#### Phase 4 — Admin Panel

- Full admin panel at `/admin` with collapsible sidebar, breadcrumbs, and top bar
- **Content Editor** (`/admin/content`): dynamic form generation from `module_schemas`, per-language editing, all field types (text, textarea, richtext, image, URL, color, range, select, toggle, array, number, date, map)
- **Modules Manager** (`/admin/modules`): enable/disable modules, drag-and-drop reorder with DND Kit, live preview of resulting order
- **Design Editor** (`/admin/design`): palette selector with color preview, typography selector (Google Fonts), spacing and border-radius controls
- **Languages Manager** (`/admin/languages`): add/remove languages, set default language, per-language content editing integration
- **SEO Editor** (`/admin/seo`): per-page meta title, description, OG image, canonical URL, robots directives
- **Media Library** (`/admin/media`): upload to Supabase Storage, folder organization, copy URL, delete
- **Integrations** (`/admin/integrations`): Google Analytics 4, Meta Pixel, WhatsApp button, Calendly widget, SMTP config, custom head/body scripts
- **Leads** (`/admin/leads`): data table with read/unread status, search, filter by date, export to CSV
- **Settings** (`/admin/settings`): site-wide configuration (name, tagline, logo, favicon, contact info, social links)
- **Dashboard** (`/admin/dashboard`): KPI cards, recent leads table, quick-action shortcuts
- All admin mutations route through typed API routes with Zod validation; `revalidatePath('/')` triggers public page refresh after edits

#### Phase 5 — Live Editing Infrastructure

- `EditableText` — click-to-edit overlay for plain text fields
- `EditableImage` — click-to-replace overlay for image fields with `MediaPicker` integration
- `EditableRichText` — inline rich text editor overlay
- `ModuleToolbar` — per-module floating toolbar with edit, move, and visibility controls
- `SortablePageWrapper` — DND Kit wrapper for the public page enabling live module reordering
- `LiveEditBar` — floating bar shown when live edit mode is active
- Editor Zustand store extended with `editingModuleId` and `setEditingModule`
- Live edit mode toggle in the admin top bar

#### Phase 6 — Testing & Quality (Partial)

- 32 Vitest unit tests passing (`pnpm test:run`); coverage reporting with v8 (`pnpm test:coverage`)
- Playwright configuration with E2E spec files for: admin login, setup wizard access, lead capture form
- `/api/health` endpoint returning version, environment, and Supabase connectivity status
- `ImageField` and `RichTextField` components completed for the content editor
- Post-audit corrections: Wizard DDL via `postgres` package (not `supabase-js`), lazy loading with `next/dynamic` enforced on all modules, i18n query optimization

---

[Unreleased]: https://github.com/your-username/orion-landing-universal/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-username/orion-landing-universal/releases/tag/v0.1.0
