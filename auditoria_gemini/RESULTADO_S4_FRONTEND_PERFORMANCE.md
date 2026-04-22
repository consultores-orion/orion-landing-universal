# Informe de Auditoría S4: Frontend, Performance & SEO

**Proyecto:** Orion Landing Universal
**Auditor:** Antigravity (UX/Performance Specialist & Senior Frontend Architect)
**Fecha:** 5 de Abril, 2026
**Estado de Hito M5:** 🔴 **BLOQUEADO (Pendiente de Corrección)**

---

## 1. Resumen Ejecutivo

La auditoría S4 evalúa la preparación para producción (Hito M5) centrada en los 19 módulos visuales, el motor de SEO y la accesibilidad. Si bien la arquitectura de componentes es robusta y sigue patrones modernos de Next.js 16/React 19, se han detectado **vulnerabilidades críticas en SEO (Sitemap)** y **oportunidades perdidas en Performance (next/image)** que impiden certificar el producto como "Production Ready".

---

## 2. Auditoría de Módulos Visuales (UI/UX)

**Ubicación:** `src/components/modules/`

### Hallazgos de Diseño Responsivo:

- **Tailwind 4 Breakpoints:** Se verifica un uso correcto y fluido de los nuevos sistemas de breakpoints de Tailwind 4 (`md:`, `sm:`, `lg:`). La tipografía fluida mediante `clamp()` y variables CSS dinámicas asegura legibilidad.
- **Consistencia Visual:** El uso de `ModuleWrapper` centraliza los paddings y anchos máximos (`max-w-6xl`, `max-w-full`), garantizando una alineación perfecta entre los 19 módulos.

### Hallazgos de `next/image` y Rendimiento:

- 🔴 **Infrautilización de `next/image`:** En el core del sistema (`src/components/shared/ModuleWrapper.tsx:50`), las imágenes de fondo se inyectan mediante `inlineStyles.backgroundImage = \`url(${styles.backgroundImage})\``.
  - **Impacto:** Las imágenes cargadas por CSS NO son optimizadas por Next.js (formato WebP/AVIF, redimensionamiento automático). Esto degrada el **Largest Contentful Paint (LCP)** y desperdicia ancho de banda.
  - **Recomendación:** Refactorizar `ModuleWrapper` para usar `<Image fill />` con `priority` condicional para el Hero.
- 🟡 **Cumulative Layout Shift (CLS):** La pre-carga (`preload`) del fondo del Hero en `src/app/(public)/page.tsx:132` mitiga el CLS, pero no sustituye la optimización de activos.

---

## 3. Auditoría de Performance & SEO

**Ubicación:** `src/app/(public)/`

### Hallazgos SEO:

- 🔴 **Sitemap Inválido (`src/app/sitemap.ts`):**
  - El sitemap genera URLs con fragmentos de anclaje: `url: \`${baseUrl}#${mod.section_key}\`` (Línea 26).
  - **Impacto:** Los fragmentos (`#`) no son procesados por los rastreadores de motores de búsqueda en `sitemap.xml`. Esto ensucia el índice de Google y puede causar errores en Search Console. El sitemap debe contener solo la URL base si todas las secciones están en ella.
- 🟢 **Metadata Dinámica:** Implementación correcta de `generateMetadata` en `page.tsx`. Soporta OpenGraph y Twitter Cards con reubicación de URLs absolutas mediante `metadataBase`.

### Hallazgos de Bundle (Hydration & Client Components):

- 🟡 **Inflamiento del bundle público:** `SortablePageWrapper.tsx` importa directamente `@dnd-kit/core` y `@dnd-kit/sortable`.
  - **Problema:** Aunque hay una guarda `if (!isEditing || !isAdmin)`, la librería se incluye en el bundle de JS enviado a **todos** los usuarios visitantes.
  - **Recomendación:** Carga dinámica (`next/dynamic`) de los componentes de edición sólo cuando `isAdmin` sea verdadero.

---

## 4. Auditoría de Accesibilidad (A11y)

**Hallazgos:**

- 🟢 **Etiquetas Semánticas:** Uso impecable de `<section>`, `<main>`, `<header>` y `<footer>`. El `skip-link` en el layout raíz es funcional y bien posicionado.
- 🟡 **ARIA Labels:**
  - `NewsletterModule` y `StatsModule` implementan `aria-label` y `aria-live` correctamente.
  - `HeroModule.tsx` (Línea 161) carece de `aria-label` explícito en los botones de CTA. Aunque el texto `{label}` ayuda, CTAs con texto genérico (ej. "Saber más") requieren mayor contexto para lectores de pantalla.
- 🟢 **Contraste:** Los cálculos de `contrast.ts` verificados en S3 están integrados en el dashboard admin para prevenir el uso de paletas ilegibles.

---

## 5. Verificación de Dependencias (package.json)

- **Obsolescencia:** Se confirma que se usa Next.js 16.2.2 y Tailwind 4 (experimental/canary), lo cual es coherente con el Hito M6 de tecnología punta, pero contradice el Roadmap documental (Next.js 15).
- **Duplicidad:** No se encuentran librerías de UI duplicadas. La limpieza en este aspecto es satisfactoria.

---

## 6. Resolución de Anomalías (Referencia S3)

Se confirma que las redundancias en `OfferFormModule` y `NewsletterModule` **PERSISTEN** (Líneas 68-87 de OfferForm vs Líneas 25-49 de Newsletter). Ambos módulos re-implementan el `fetch` al endpoint de leads de forma manual.

---

## 7. Veredicto Final S4

**ESTADO: RECHAZADO PARA PRODUCCIÓN (M5 BLOQUEADO)**

El producto posee una estética y una base técnica de primer nivel, pero falla en la fase final de pulido. **Para alcanzar el Hito M5 es obligatorio:**

1. Eliminar los fragmentos (`#`) del `sitemap.ts`.
2. Migrar las imágenes de fondo a `next/image`.
3. Centralizar la lógica de leads en un hook (`useLeadCapture`) para evitar inconsistencias de validación/envío.

---

_Fin de la Auditoría S4 — Antigravity Frontend Architect_
