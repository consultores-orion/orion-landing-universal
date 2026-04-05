# Orion Landing Universal — Documentaci&oacute;n

> **Versi&oacute;n**: 0.1.0 &nbsp;|&nbsp; **Fecha**: 2026-04-04 &nbsp;|&nbsp; **Estado**: Fase 0 — Documentaci&oacute;n y Arquitectura

Plantilla de landing page open-source, auto-hospedada, con panel de administraci&oacute;n completo y backend Supabase. Configurable al 100% desde el navegador, sin modificar c&oacute;digo.

**Creado por**: Luis Enrique Guti&eacute;rrez Campos — [Orion AI Society](https://github.com/orion-ai-society)
**Concepto original**: Erwin Rojas

---

## Navegaci&oacute;n R&aacute;pida

### Producto

| Documento                     | Descripci&oacute;n                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| [PRD](prd/PRD.md)             | Documento de Requisitos del Producto — visi&oacute;n, funcionalidades, m&eacute;tricas, riesgos |
| [ROADMAP](roadmap/ROADMAP.md) | Hoja de ruta por fases (0-7) con entregables, dependencias y criterios de &eacute;xito          |

### Arquitectura

| Documento                                        | Descripci&oacute;n                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| [ARCHITECTURE](architecture/ARCHITECTURE.md)     | Visi&oacute;n general del sistema — capas, flujos de datos, estructura Next.js 15       |
| [DATA-MODEL](architecture/DATA-MODEL.md)         | Modelo de datos completo — 10 tablas, SQL, RLS, &iacute;ndices, ejemplos JSONB          |
| [SECURITY-MODEL](architecture/SECURITY-MODEL.md) | Modelo de seguridad — autenticaci&oacute;n, RLS, middleware, validaci&oacute;n, headers |

### Decisiones Arquitect&oacute;nicas (ADRs)

| ADR                                                            | Decisi&oacute;n                                                      |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| [ADR-001](architecture/adr/ADR-001-framework-nextjs15.md)      | Framework: Next.js 15 sobre Astro, SvelteKit, Nuxt                   |
| [ADR-002](architecture/adr/ADR-002-backend-supabase.md)        | Backend: Supabase sobre Firebase, PlanetScale, custom                |
| [ADR-003](architecture/adr/ADR-003-admin-separate-route.md)    | Admin: Ruta separada `/admin` + edici&oacute;n inline h&iacute;brida |
| [ADR-004](architecture/adr/ADR-004-i18n-dynamic.md)            | i18n: Din&aacute;mico desde admin sobre idiomas hardcodeados         |
| [ADR-005](architecture/adr/ADR-005-module-registry.md)         | M&oacute;dulos: Patr&oacute;n Registry sobre switch/case             |
| [ADR-006](architecture/adr/ADR-006-deployment-strategy.md)     | Deploy: Vercel + Docker + Netlify, sin export est&aacute;tico        |
| [ADR-007](architecture/adr/ADR-007-theme-marketplace-ready.md) | Temas: Arquitectura preparada para marketplace futuro                |

### Especificaciones T&eacute;cnicas

| Documento                               | Descripci&oacute;n                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------ |
| [MODULE-SYSTEM](specs/MODULE-SYSTEM.md) | Sistema de m&oacute;dulos — registry, 19 m&oacute;dulos, schemas, renderer, extensibilidad |
| [WIZARD-FLOW](specs/WIZARD-FLOW.md)     | Wizard de configuraci&oacute;n — 5 pasos, detecci&oacute;n, migraciones, seed data         |
| [ADMIN-PANEL](specs/ADMIN-PANEL.md)     | Panel de administraci&oacute;n — 10 secciones, dashboard, editor, media, leads             |
| [I18N-SYSTEM](specs/I18N-SYSTEM.md)     | Sistema de internacionalizaci&oacute;n — i18n din&aacute;mico, proveedor React, fallback   |
| [THEME-SYSTEM](specs/THEME-SYSTEM.md)   | Sistema de temas — paletas, CSS variables, Tailwind 4, marketplace-ready                   |
| [INTEGRATIONS](specs/INTEGRATIONS.md)   | Integraciones — Analytics, Meta Pixel, WhatsApp, Calendly, SMTP, scripts                   |

### Gobernanza

| Documento                                        | Descripci&oacute;n                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [GOVERNANCE](governance/GOVERNANCE.md)           | Modelo de gobernanza — BDFL, roles, proceso de decisiones, releases                            |
| [CONSTITUTION](governance/CONSTITUTION.md)       | Constituci&oacute;n del proyecto — misi&oacute;n, visi&oacute;n, valores, principios, no-goals |
| [CANONICAL](governance/CANONICAL.md)             | Convenciones can&oacute;nicas — TypeScript, React, Supabase, Git, testing, estilos             |
| [CONTRIBUTING](governance/CONTRIBUTING.md)       | Gu&iacute;a de contribuci&oacute;n — setup, workflow, crear m&oacute;dulos, templates          |
| [CODE-OF-CONDUCT](governance/CODE-OF-CONDUCT.md) | C&oacute;digo de conducta — basado en Contributor Covenant 2.1                                 |

---

## Stack Tecnol&oacute;gico

| Capa           | Tecnolog&iacute;a                      | Versi&oacute;n |
| -------------- | -------------------------------------- | -------------- |
| Framework      | Next.js (App Router)                   | 15.x           |
| Lenguaje       | TypeScript (strict)                    | 5.x            |
| Estilos        | Tailwind CSS                           | 4.x            |
| UI Admin       | shadcn/ui + Radix UI                   | latest         |
| Backend        | Supabase (PostgreSQL + Auth + Storage) | latest         |
| Estado cliente | Zustand + TanStack Query               | latest         |
| Formularios    | React Hook Form + Zod                  | latest         |
| Testing        | Vitest + Playwright                    | latest         |
| Deploy         | Vercel / Docker / Netlify              | —              |

---

## Estructura del Proyecto (prevista)

```
orion-landing-universal/
  docs/                    &larr; Esta documentaci&oacute;n
  src/
    app/
      (public)/            &larr; Landing page p&uacute;blica
      admin/               &larr; Panel de administraci&oacute;n
      setup/               &larr; Wizard de primera ejecuci&oacute;n
      api/                 &larr; API Routes (operaciones seguras)
    components/
      modules/             &larr; 19 m&oacute;dulos (hero, pricing, etc.)
      admin/               &larr; Componentes del admin panel
      ui/                  &larr; shadcn/ui
    lib/
      supabase/            &larr; Clientes y migraciones
      modules/             &larr; Registry y renderer
      i18n/                &larr; Proveedor de internacionalizaci&oacute;n
      themes/              &larr; Motor de temas
    types/                 &larr; Tipos TypeScript compartidos
  public/                  &larr; Assets est&aacute;ticos
  supabase/
    migrations/            &larr; SQL migrations versionadas
  .env.example             &larr; Template de variables de entorno
  CLAUDE.md                &larr; Contexto del proyecto para AI
```

---

## Estado Actual

- [x] **Fase 0**: Documentaci&oacute;n y Arquitectura (completa)
- [ ] **Fase 1**: Foundation
- [ ] **Fase 2**: Setup Wizard
- [ ] **Fase 3**: Public Landing
- [ ] **Fase 4**: Admin Panel
- [ ] **Fase 5**: Live Editing
- [ ] **Fase 6**: Polish y Producci&oacute;n
- [ ] **Fase 7**: Marketplace y Comunidad

---

## Licencia

MIT &copy; 2026 Luis Enrique Guti&eacute;rrez Campos — Orion AI Society

> Born from the creative vision and original concept of **Erwin Rojas**, whose initiative and imagination planted the seed that became this project. What started as a student's spark of creativity evolved into a tool for the entire community — proof that great ideas can come from anywhere when curiosity meets the right guidance.
