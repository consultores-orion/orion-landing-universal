![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E?logo=supabase)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-0.1.0-orange)

# Orion Landing Universal

> Open-source, self-hosted landing page builder with a full admin panel. No code required after deployment.

A complete landing page template that puts you in full control. Configure content, switch themes, manage languages, capture leads, and connect third-party integrations — all from the browser. Built on Next.js 15 and Supabase, deployable anywhere in minutes.

**Created by**: Luis Enrique Gutiérrez Campos — [Orion AI Society](https://github.com/orion-ai-society)
**Original concept**: Erwin Rojas
**License**: MIT

---

## Features

- **19 configurable modules** — hero, testimonials, pricing, FAQ, gallery, map, countdown, and more
- **Full admin panel** at `/admin` — manage content, design, modules, languages, media, leads, integrations, and SEO
- **Dynamic i18n** — add or remove languages from the admin panel, no code changes required
- **20+ built-in color palettes** by niche (professional, health, tech, luxury, education...) + custom theme support
- **Live editing** — click any text or image on the landing page to edit it in place
- **5-step setup wizard** — get running in under 5 minutes with a guided first-run experience
- **Lead capture** — built-in form submissions stored in Supabase, exportable from the admin
- **Integrations** — Google Analytics 4, Meta Pixel, WhatsApp, Calendly, SMTP email, and custom scripts
- **SEO ready** — dynamic `generateMetadata()`, sitemap.xml, robots.txt, Open Graph, JSON-LD
- **Deploy anywhere** — Vercel one-click, Docker, Netlify, or any VPS

---

## Quick Start

### Option 1: Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/orion-landing-universal)

1. Click **Deploy** above — Vercel will fork the repo and deploy it automatically.
2. In your Vercel project settings, add the [required environment variables](#environment-variables).
3. Redeploy after adding the variables.
4. Navigate to `https://your-site.vercel.app/setup` to run the initial configuration wizard.

For a detailed walkthrough, see [docs/deploy/VERCEL.md](docs/deploy/VERCEL.md).

---

### Option 2: Docker

```bash
# 1. Clone the repository
git clone https://github.com/your-username/orion-landing-universal.git
cd orion-landing-universal

# 2. Copy and fill in the environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start the container
docker compose up -d

# 4. Open the setup wizard
# Visit http://localhost:3000/setup
```

For production Docker deployment with nginx and SSL, see [docs/deploy/DOCKER.md](docs/deploy/DOCKER.md).

---

### Option 3: Local Development

**Prerequisites:**
- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- A [Supabase](https://supabase.com) project (free tier works)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/orion-landing-universal.git
cd orion-landing-universal

# 2. Install dependencies
pnpm install

# 3. Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start the development server
pnpm dev
```

Visit `http://localhost:3000/setup` to run the initial configuration wizard.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values below.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key — server-side only, never exposed to the client |
| `DATABASE_URL` | **Yes** | PostgreSQL direct connection URL (used by the setup wizard to run DDL migrations) |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Full URL of your deployed site (e.g. `https://your-site.vercel.app`) — used for SEO, sitemap, and redirects |

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` must never be exposed to the browser. They are only used in server-side API routes and the setup wizard.

---

## Project Structure

```
orion-landing-universal/
  src/
    app/
      (public)/          # Public landing page (Server Components)
      admin/             # Admin panel (/admin/*)
      setup/             # First-run setup wizard (/setup/*)
      api/               # API Routes (all mutations go through here)
      login/             # Authentication page
    components/
      modules/           # 19 landing page modules (hero, pricing, etc.)
      admin/             # Admin panel components
      live-edit/         # Live editing overlays and controls
      ui/                # shadcn/ui base components
    lib/
      supabase/          # Browser, server, and admin Supabase clients
      modules/           # Module Registry and page renderer
      i18n/              # Dynamic i18n provider and hooks
      themes/            # Theme engine (CSS variables, palette application)
    stores/              # Zustand stores (admin state, editor state)
    hooks/               # Custom React hooks
    types/               # Shared TypeScript types
  supabase/
    migrations/          # SQL migration files (run via setup wizard or manually)
    seed.sql             # Seed data (20 color palettes, default languages, etc.)
  docs/                  # Full project documentation
  public/                # Static assets
  .env.example           # Environment variable template
  docker-compose.yml     # Docker Compose configuration
  Dockerfile             # Multi-stage production Dockerfile
```

---

## Modules

All 19 modules can be enabled, disabled, and reordered from the admin panel.

| Module | Description |
|---|---|
| `hero` | Main banner with headline, subheadline, and CTA button |
| `value_prop` | Value proposition / benefits section |
| `how_it_works` | Step-by-step process section |
| `social_proof` | Testimonials carousel |
| `client_logos` | Client logo marquee / ticker |
| `offer_form` | Lead capture form |
| `faq` | Frequently asked questions (accordion) |
| `final_cta` | Final call-to-action section |
| `footer` | Site footer with links and social icons |
| `stats` | Key metrics with animated counters |
| `pricing` | Pricing plans table (monthly/annual toggle) |
| `video` | Embedded video (YouTube / Vimeo) |
| `team` | Team / About us grid |
| `gallery` | Image gallery with lightbox |
| `features_grid` | Features grid with icons |
| `countdown` | Countdown timer to a target date |
| `comparison` | Comparison table |
| `newsletter` | Email signup form |
| `map_location` | Embedded map and address block |

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript (strict) | 5.x |
| Styles | Tailwind CSS | 4.x |
| UI Components | shadcn/ui + Radix UI | latest |
| Backend | Supabase (PostgreSQL + Auth + Storage + RLS) | latest |
| Client State | Zustand | 5.x |
| Server Data | TanStack Query | 5.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Drag & Drop | @dnd-kit | 6.x |
| Testing | Vitest + Playwright | latest |
| Deployment | Vercel / Docker / Netlify / VPS | — |

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm type-check` | TypeScript type checking (no emit) |
| `pnpm format` | Format source files with Prettier |
| `pnpm format:check` | Check formatting without modifying files |
| `pnpm db:types` | Generate TypeScript types from Supabase schema |
| `pnpm test:run` | Run Vitest unit tests once |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:e2e` | Run Playwright end-to-end tests |

---

## Documentation

Full documentation is in the [`docs/`](docs/) directory.

| Document | Description |
|---|---|
| [docs/INDEX.md](docs/INDEX.md) | Master documentation index |
| [docs/prd/PRD.md](docs/prd/PRD.md) | Product Requirements Document |
| [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) | System architecture overview |
| [docs/architecture/DATA-MODEL.md](docs/architecture/DATA-MODEL.md) | Database schema and RLS policies |
| [docs/specs/MODULE-SYSTEM.md](docs/specs/MODULE-SYSTEM.md) | Module system specification |
| [docs/specs/ADMIN-PANEL.md](docs/specs/ADMIN-PANEL.md) | Admin panel specification |
| [docs/deploy/VERCEL.md](docs/deploy/VERCEL.md) | Vercel deployment guide |
| [docs/deploy/DOCKER.md](docs/deploy/DOCKER.md) | Docker deployment guide |
| [docs/deploy/NETLIFY.md](docs/deploy/NETLIFY.md) | Netlify deployment guide |
| [docs/deploy/VPS.md](docs/deploy/VPS.md) | VPS deployment guide |

---

## Contributing

Contributions are welcome. Please read [docs/governance/CONTRIBUTING.md](docs/governance/CONTRIBUTING.md) before opening a pull request.

All contributors are expected to follow the [Code of Conduct](docs/governance/CODE-OF-CONDUCT.md).

---

## License

MIT — see [LICENSE](LICENSE) for full text.

---

## Credits

**Created by** [Luis Enrique Gutiérrez Campos](https://github.com/orion-ai-society) — Orion AI Society

**Original concept by** Erwin Rojas — whose initiative and creative vision planted the seed that became this project. What started as a student's spark of curiosity evolved into a tool for the entire community.

---

> Born from the belief that powerful tools should be accessible to everyone, regardless of technical background.
