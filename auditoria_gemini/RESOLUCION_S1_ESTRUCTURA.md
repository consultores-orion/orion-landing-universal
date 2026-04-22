# Resolucion Auditoria S1 — Integridad Estructural y Configuracion

**Auditor original**: Gemini (Antigravity)
**Contra-auditor**: Claude Opus 4.6
**Fecha**: 2026-04-05

---

## Veredicto General: 3/7 hallazgos validos y corregidos. 4/7 falsos positivos.

---

## Hallazgo 1 — Version Next.js en CLAUDE.md

| Campo            | Valor                            |
| ---------------- | -------------------------------- |
| Severidad Gemini | CRITICO                          |
| Severidad real   | MEDIO (documentacion, no codigo) |
| Estado           | CORREGIDO                        |

**Problema**: CLAUDE.md:13 decia "Next.js 15", package.json usa 16.2.2.
**Correccion**: Actualizado a "Next.js 16" en CLAUDE.md, docs/INDEX.md (2 referencias).
**Nota**: El ADR-001 mantiene "Next.js 15" en su nombre de archivo porque documenta la decision ORIGINAL. La migracion a 16 fue evolutiva durante S12-S13. Esto no es un error — es historia.

---

## Hallazgo 2 — Comentario obsoleto en next.config.ts

| Campo            | Valor     |
| ---------------- | --------- |
| Severidad Gemini | MEDIO     |
| Severidad real   | BAJO      |
| Estado           | CORREGIDO |

**Problema**: Linea 14 decia "required for Next.js 15".
**Correccion**: Actualizado a "required for Next.js 16".
**Nota**: Las directivas CSP (unsafe-inline, unsafe-eval) siguen siendo necesarias en Next.js 16 para hidratacion e inline scripts. El comentario era impreciso en version, no en contenido tecnico.

---

## Hallazgo 3 — hostname: '\*\*' en remotePatterns

| Campo            | Valor                  |
| ---------------- | ---------------------- |
| Severidad Gemini | MEDIO                  |
| Severidad real   | ACEPTABLE (por diseno) |
| Estado           | NO REQUIERE CAMBIO     |

**Analisis**: Gemini lo marca como "practica de seguridad laxa". En realidad:

1. El proyecto es un CMS single-tenant — el admin configura imagenes de CUALQUIER fuente (galeria, equipo, logos, etc.)
2. Ya tiene CSP sandbox en imagenes: `script-src 'none'; sandbox;` — previene ejecucion de scripts en SVGs maliciosos
3. El comentario en lineas 37-38 de next.config.ts documenta explicitamente esta decision

**Contraargumento**: Restringir hostname romperia la funcionalidad core del CMS. El admin ES un usuario de confianza en un deployment single-tenant.

---

## Hallazgo 4 — Sesiones con misma fecha

| Campo            | Valor          |
| ---------------- | -------------- |
| Severidad Gemini | MEDIO          |
| Severidad real   | FALSO POSITIVO |
| Estado           | DESESTIMADO    |

**Analisis**: Las 11 sesiones (S7-S17) tienen fecha 2026-04-05. Gemini sugiere "sesiones falsas o falta de rotacion".
**Realidad**: Son sesiones REALES de desarrollo intensivo en un mismo dia. Cada una cubre features completamente distintas:

- S7: Live Editing infraestructura
- S8: SortablePageWrapper, exports
- S9: Testing (86 tests), plugins
- S10: next/image, a11y WCAG
- S11: Content history, CLI npm
- S12: Bundle analyzer, focus-visible
- S13: Proxy rename, LHCI
- S14-S17: Various fixes and guides

Las sesiones se rotaron por limites de contexto, no por dias. La fecha es correcta.

---

## Hallazgo 5 — sharp en ignoredBuiltDependencies

| Campo            | Valor          |
| ---------------- | -------------- |
| Severidad Gemini | BAJO           |
| Severidad real   | FALSO POSITIVO |
| Estado           | DESESTIMADO    |

**Analisis**: `ignoredBuiltDependencies` solo evita el build nativo de sharp durante `pnpm install`. Sharp es una dependencia OPCIONAL de Next.js (listada en optionalDependencies). Si no compila, Next.js usa fallback. No hay "degradacion silenciosa" — es degradacion GRACEFUL documentada por Next.js.

---

## Hallazgo 6 — message_dos_general.html

| Campo            | Valor                         |
| ---------------- | ----------------------------- |
| Severidad Gemini | BAJO                          |
| Severidad real   | BAJO (pero valido)            |
| Estado           | CORREGIDO — ARCHIVO ELIMINADO |

**Problema**: Archivo HTML de 70KB en la raiz. Prototipo legacy con Tailwind CDN, Sortable.js, Swiper.js. Cero referencias en el codebase.
**Correccion**: Eliminado.

---

## Hallazgo 7 — tsconfig.tsbuildinfo en raiz

| Campo            | Valor          |
| ---------------- | -------------- |
| Severidad Gemini | BAJO           |
| Severidad real   | FALSO POSITIVO |
| Estado           | DESESTIMADO    |

**Analisis**: El archivo SI existe fisicamente, pero `.gitignore` tiene `*.tsbuildinfo` en linea 48. `git check-ignore` confirma que esta ignorado. NUNCA se trackea ni se commitea. Es un artefacto de build local, no un problema de higiene del repositorio.

---

## Archivos modificados en esta resolucion

| Archivo                    | Cambio                                  |
| -------------------------- | --------------------------------------- |
| `CLAUDE.md:13`             | "Next.js 15" -> "Next.js 16"            |
| `next.config.ts:14`        | Comentario "Next.js 15" -> "Next.js 16" |
| `docs/INDEX.md:25`         | "Next.js 15" -> "Next.js 16"            |
| `docs/INDEX.md:102`        | "15.x" -> "16.x"                        |
| `message_dos_general.html` | ELIMINADO (70KB prototipo huerfano)     |

---

_Resolucion S1 completada por Claude Opus 4.6 — 2026-04-05_
