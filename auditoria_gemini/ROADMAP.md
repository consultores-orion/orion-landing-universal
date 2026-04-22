# Roadmap de Auditoría Arquitectónica — ORION Landing Universal

## Objetivo

Realizar una auditoría técnica profunda, crítica y honesta del proyecto para asegurar la coherencia absoluta entre la documentación (`docs/` y `CLAUDE.md`) y la implementación real en el código, identificando redundancias, código basura y desviaciones arquitectónicas.

## Metodología (Sesiones de Auditoría)

La auditoría se divide en 5 sesiones estratégicas. Cada sesión será ejecutada por un agente especializado (sub-agente) que generará un informe de resultados y el prompt para la siguiente sesión.

| Sesión | Bloque / Fase                              | Alcance Principal                                                                                                       | Entregable                             |
| :----- | :----------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S1** | **Integridad Estructural y Configuración** | Validación de versiones (Next.js 15 vs 16), `package.json`, `pnpm-workspace`, `tsconfig`, y alineación con `CLAUDE.md`. | `RESULTADO_S1_ESTRUCTURA.md`           | **COMPLETADA** — 3/7 corregidos, 4/7 falsos positivos. Ver `RESOLUCION_S1_ESTRUCTURA.md`                                                                                                                                   |
| **S2** | **Arquitectura de Datos y Seguridad RLS**  | Esquemas en `supabase/migrations` vs `docs/specs/`, verificación de políticas RLS y tipos de TypeScript.                | `RESULTADO_S2_DATOS_SEGURIDAD.md`      | **COMPLETADA** — 1/6 corregido (docs), 4/6 desestimados (severidad sobrestimada para single-tenant), 1/6 confirmado sin accion. Ver `RESOLUCION_S2_DATOS_SEGURIDAD.md`                                                     |
| **S3** | **Núcleo de Aplicación y Motores**         | Auditoría del `Module Registry`, `i18n Engine`, `Theme Engine` y `Plugin Sandbox`. Búsqueda de lógica duplicada.        | `RESULTADO_S3_CORE_LOGIC.md`           | **COMPLETADA** — 5/10 válidos, 3/10 parciales, 1/10 válido baja severidad, 1/10 falso positivo. 1 doc fix aplicado (MODULE-SYSTEM.md). Ver `RESOLUCION_S3_CORE_LOGIC.md`                                                   |
| **S4** | **Frontend, Performance & SEO**            | Coherencia de Tailwind 4, shadcn/ui, WCAG, next/image, sitemap, bundle size, edicion inline.                            | `RESULTADO_S4_FRONTEND_PERFORMANCE.md` | **COMPLETADA** — 2/7 validos (fix aplicado: sitemap fragments + dnd-kit bundle), 2/7 falsos positivos, 1/7 parcial, 1/7 ya documentado, 1/7 ya resuelto. Ver `RESOLUCION_S4_FRONTEND_PERFORMANCE.md`                       |
| **S5** | **Higiene de Código y Veredicto Final**    | Escaneo de "código basura", archivos huérfanos, dependencias no usadas y contradicciones finales en docs.               | `AUDIT_FINAL_VERDICT_GEMINI.md`        | **COMPLETADA** — 1/5 hallazgo valido (archivo `null`), 2/5 falsos positivos, 2/5 ya resueltos. 7 "MUST-FIX" de Gemini: 0 validos (5 ya resueltos, 1 falso positivo, 1 desestimado). Ver `RESOLUCION_S5_VEREDICTO_FINAL.md` |

## Reglas de Oro de esta Auditoría

1. **No Modificar**: No se toca ni una sola línea de código ni de documentación oficial.
2. **Honestidad Brutal**: Si algo está mal documentado o el código es un "parche", se señala sin filtros.
3. **Profundidad**: No solo ver si el archivo existe, sino si la lógica implementada sigue el ADR (Architectural Decision Record) correspondiente.
4. **Trazabilidad**: Cada hallazgo debe referenciar el archivo y línea específica.

---

_Generado por Antigravity (Arquitecto Senior AI) — 2026-04-05_
