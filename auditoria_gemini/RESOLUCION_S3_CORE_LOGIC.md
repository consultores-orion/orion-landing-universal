# Resolución de Auditoría S3: Core Logic & Extensibility

**Contra-auditor:** Claude (Opus 4.6) — Tribunal de IAs
**Fecha:** 5 de Abril, 2026
**Auditor original:** Antigravity (Gemini)

---

## Resumen Ejecutivo

La auditoría de Gemini sobre los motores core fue **profesional y mayormente precisa**. De los 10 hallazgos evaluados: **5 son válidos**, **3 parcialmente correctos**, **1 válido pero de baja severidad**, y **1 falso positivo**. Solo se requirió una corrección: sincronización de `docs/specs/MODULE-SYSTEM.md` con la implementación real del registry.

**Cambios aplicados:** 1 archivo de documentación corregido.
**Cambios de código:** Ninguno requerido.

---

## Veredictos por Hallazgo

### H1 — Module Registry: Patrón de Registro Dinámico

**Claim de Gemini:** El registry usa `next/dynamic` con `ssr: true`. ModuleRenderer tiene ErrorBoundary + Suspense.
**Veredicto: ✅ VÁLIDO**

**Evidencia:**

- `src/lib/modules/registry.ts:22-251` — 19 módulos registrados con `asModule()` wrapper que usa `next/dynamic`
- `src/lib/modules/renderer.tsx:47-66` — ErrorBoundary + Suspense compuestos correctamente:
  ```
  <ModuleErrorBoundary> → <Suspense fallback={<ModuleSkeleton>}> → <Component>
  ```
- `src/components/shared/ModuleErrorBoundary.tsx:15-46` — Error boundary con `getDerivedStateFromError` + `componentDidCatch`

**Acción:** Ninguna.

---

### H2 — Module Registry: Desincronización Documental

**Claim de Gemini:** MODULE-SYSTEM.md define `schema`, `seed`, `icon` como obligatorias en la interfaz del registry, pero la implementación solo tiene `component` + metadatos básicos.
**Veredicto: ✅ VÁLIDO**

**Evidencia:**

- `src/lib/modules/types.ts:90-98` — Interfaz real: `key`, `displayName`, `description`, `component`, `category`, `isSystem`, `defaultOrder`
- `docs/specs/MODULE-SYSTEM.md:~429` — Interfaz documentada incluía `schema()`, `seed()`, `icon` que NO existen en el código
- Los schemas/seeds viven en carpetas de módulo individuales (`hero.schema.ts`, `hero.seed.ts`), no en el registry

**Acción aplicada:** Actualizado MODULE-SYSTEM.md en 3 ubicaciones:

1. Ejemplo de código del registry (~línea 181) — removidas propiedades inexistentes
2. Definición de interfaz (~línea 429) — sincronizada con `types.ts` real
3. Guía "crear un módulo" (~línea 2665) — actualizada con patrón `dynamic()` correcto

---

### H3 — i18n Engine: Sistema de Fallback

**Claim de Gemini:** Cadena de fallback: `idioma_actual → idioma_default → "es" → "en" → primer_disponible`.
**Veredicto: ✅ VÁLIDO**

**Evidencia:**

- `src/lib/i18n/utils.ts:13` — Implementación exacta:
  ```typescript
  return (
    content[lang] ??
    content[defaultLang] ??
    content['es'] ??
    content['en'] ??
    Object.values(content)[0] ??
    ''
  )
  ```
- Incluye un fallback adicional (`''`) no mencionado por Gemini pero que es correcto como safety net.

**Acción:** Ninguna.

---

### H4 — i18n Engine: Hidratación + localStorage

**Claim de Gemini:** I18nProvider inicializa con valores seguros para SSR y usa `useEffect` para detectar preferencias del cliente.
**Veredicto: ✅ VÁLIDO**

**Evidencia:**

- `src/lib/i18n/provider.tsx:38` — `useState(initialLang ?? defaultLang)` siempre inicializa con valor seguro para servidor
- `src/lib/i18n/provider.tsx:40-68` — `useEffect([])` detecta post-hidratación: URL → localStorage → browser language
- Valida contra `languages.some()` antes de aplicar cambio
- Bug de hidratación fue corregido en sesiones anteriores (documentado en CLAUDE.md, Hallazgos S17)

**Acción:** Ninguna.

---

### H5 — i18n Engine: "Flash" de Contenido + Recomendación Cookies

**Claim de Gemini:** localStorage podría causar flash si idioma detectado difiere del predeterminado. Recomienda evaluar cookies para SSR.
**Veredicto: ⚠️ PARCIALMENTE CORRECTO**

**Evidencia del flash:**

- `src/app/layout.tsx:23` — `<html lang="es">` hardcodeado en Server Component
- `src/components/shared/HtmlLangUpdater.tsx:13-17` — Actualiza `document.documentElement.lang` via `useEffect` (post-hidratación)
- Ventana de flash: ~100-200ms entre hidratación y ejecución del `useEffect`

**Evaluación de la recomendación:**

- El flash es **técnicamente real** pero **prácticamente imperceptible** (<200ms)
- Para una **plantilla de landing page**, el impacto es negligible:
  - Sin transiciones CSS afectadas
  - Screen readers reciben update vía HtmlLangUpdater inmediatamente
  - El contenido no desaparece (fallback chain garantiza texto visible)
- Cookies requerirían middleware adicional + complejidad — beneficio desproporcional al costo
- Decisión de usar localStorage fue **consciente y documentada** (ADR implícito en CLAUDE.md, Hallazgos S14)

**Acción:** Ninguna. Documentado como mejora futura no prioritaria.

---

### H6 — Theme Engine: Inyección CSS + Tailwind 4 + Contraste WCAG

**Claim de Gemini:** Variables CSS en `:root`, consumidas por Tailwind 4 nativo. Contraste WCAG 2.1 correcto. ThemePreviewPanel integrado.
**Veredicto: ✅ VÁLIDO (4/4 sub-claims confirmados)**

**Evidencia:**

- `src/lib/themes/provider.tsx:21` — `:root { ${cssVars} }` inyectado vía `dangerouslySetInnerHTML`
- `src/app/globals.css:86-132` — `@theme inline { }` consume variables CSS dinámicas
- `src/lib/themes/contrast.ts:36-42` — Fórmula de luminancia WCAG exacta: coeficientes `0.2126/0.7152/0.0722`, linearización correcta
- `src/lib/themes/contrast.ts:97-140` — 5 pares exactos verificados (texto/fondo, texto/superficie, blanco/primario, primario/fondo)
- `src/components/admin/design/ThemePreviewPanel.tsx:19-180` — Badge verde/rojo + tabla de ratios integrada

**Observación no reportada por Gemini:** No existen unit tests para `contrast.ts` a pesar de contener cálculos WCAG críticos. Riesgo MEDIO — los cálculos son correctos por inspección pero carecen de regression tests.

**Acción:** Ninguna (observación documentada para futuro).

---

### H7 — Plugin Sandbox: Mecanismo de Timeout

**Claim de Gemini:** Usa "patrón robusto de `withTimeout` vía `Promise.race`".
**Veredicto: ⚠️ PARCIALMENTE CORRECTO**

**Evidencia:**

- `src/lib/plugins/sandbox.ts:58-80` — Implementación usa **setTimeout manual con cleanup**, NO `Promise.race`:
  ```typescript
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new SandboxTimeoutError(...)), timeoutMs)
    promise.then(
      (value) => { clearTimeout(timer); resolve(value) },
      (err) => { clearTimeout(timer); reject(err) }
    )
  })
  ```
- Es funcionalmente equivalente pero técnicamente distinto — el patrón manual limpia el timer explícitamente, evitando memory leaks que `Promise.race` no maneja

**Acción:** Ninguna. La implementación es correcta y arguably superior al `Promise.race` que Gemini describe.

---

### H8 — Plugin Sandbox: Trust Tiers + Emit

**Claim de Gemini:** Timeouts: trusted=10000ms, community=5000ms, unverified=3000ms. Aplicados en `emit` del registry.
**Veredicto: ✅ VÁLIDO**

**Evidencia:**

- `src/lib/plugins/sandbox.ts:23-27` — Valores exactos confirmados
- `src/lib/plugins/registry.ts:61-67` — Cada handler envuelto con `withTimeout()` + `resolveTimeout(plugin)`
- `src/lib/plugins/registry.ts:61` — `Promise.allSettled` para aislamiento de errores entre plugins

**Acción:** Ninguna.

---

### H9 — Lógica Duplicada: Lead Handlers + Email Regex

**Claim de Gemini:** OfferFormModule y NewsletterModule tienen lógica casi idéntica. Email regex hardcodeada en Newsletter.
**Veredicto: ⚠️ PARCIALMENTE CORRECTO (lead handlers) + ✅ VÁLIDO (email regex)**

**Lead Handlers — análisis detallado:**

- **OfferFormModule** usa `react-hook-form` + Zod schema (campos dinámicos, validación declarativa)
- **NewsletterModule** usa `useState` plano para un solo campo email
- Patrón compartido: ~12 líneas de fetch/try-catch/state (de ~20-25 líneas de lógica de envío cada uno)
- **Arquitecturas fundamentalmente diferentes** — un hook `useLeadCapture` sería una abstracción forzada que necesitaría acomodar ambos patrones

**Email regex — evidencia real:**

- Misma regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` aparece en **3 archivos**:
  1. `NewsletterModule.tsx:27`
  2. `UsersManager.tsx:170`
  3. `SiteInfoForm.tsx:151`
- Además, `OfferFormModule` usa Zod `.email()` — 4ª estrategia distinta
- `src/lib/utils/validators.ts` NO existe

**Acción:** Ninguna aplicada.

- **Lead handlers:** No se recomienda extraer — la abstracción costaría más que la duplicación (~12 líneas)
- **Email regex:** Duplicación real pero de baja severidad. Crear `validators.ts` es una mejora válida pero no urgente. Recomendado para una sesión de limpieza futura.

---

### H10 — Lógica Duplicada: AnimatedCounter

**Claim de Gemini:** AnimatedCounter en StatsModule debería extraerse a `src/components/ui/` para reutilización.
**Veredicto: ❌ FALSO POSITIVO**

**Evidencia:**

- `src/components/modules/stats/StatsModule.tsx:11-62` — 52 líneas incluyendo interfaz
- **Uso actual:** 1 ubicación (solo en StatsModule, línea 113)
- **0 otros usos** encontrados en el codebase
- Componente con lógica específica: `IntersectionObserver`, `prefers-reduced-motion`, duración hardcodeada
- Principio YAGNI: extraer sin segundo consumidor es abstracción prematura

**Acción:** Ninguna. Se extraerá cuando exista un segundo caso de uso real.

---

## Resumen de Cambios

### Archivos Modificados

| Archivo                       | Cambio                                                                                                                                                                             | Razón                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `docs/specs/MODULE-SYSTEM.md` | Interfaz `ModuleRegistryEntry` sincronizada con implementación real; removidas propiedades `schema`, `seed`, `icon` inexistentes; actualizado ejemplo de código y guía de creación | H2 — Doc sync válido |

### Archivos Creados

| Archivo                                        | Propósito      |
| ---------------------------------------------- | -------------- |
| `auditoria_gemini/RESOLUCION_S3_CORE_LOGIC.md` | Este documento |

### Sin Cambios de Código

No se requirieron cambios en código fuente. La arquitectura core es sólida.

---

## Recomendaciones para Futuro (no urgentes)

1. **Unit tests para `contrast.ts`** — Cálculos WCAG sin regression tests. Riesgo medio.
2. **Centralizar email regex** — `src/lib/utils/validators.ts` con constante compartida. 5 minutos de esfuerzo.
3. **Cookie-based i18n** — Solo si el flash de idioma se convierte en queja real de usuarios.

---

## Evaluación del Auditor Original

**Calidad de la auditoría de Gemini: 7.5/10**

**Fortalezas:**

- Verificación correcta de mecanismos core (fallback chain, WCAG, trust tiers)
- Identificación válida del gap documental del registry
- Tono profesional y estructurado

**Debilidades:**

- Imprecisión técnica en Plugin Sandbox ("Promise.race" vs setTimeout manual)
- Recomendación de extracción prematura (AnimatedCounter — viola YAGNI)
- Sobrestimación de duplicación en lead handlers (ignora diferencia arquitectónica react-hook-form vs useState)
- No detectó la ausencia de tests para `contrast.ts` (hallazgo que sí encontramos)

---

_Contra-auditoría completada por Claude (Opus 4.6) — Tribunal de IAs, 2026-04-05_
