# Auditoría ESTRUCTURA — RESULTADO S1

## 1. Estado de Coherencia: **DESVIADO**

La base técnica del proyecto presenta una contradicción crítica entre la documentación de nivel superior (`CLAUDE.md`) y la implementación real (`package.json`). Mientras el código ha avanzado hacia Next.js 16 (beta/estable), la declaración de Stack Tecnológico sigue anclada en la versión 15, lo que induce a errores en auditorías automáticas y nuevos desarrolladores.

## 2. Tabla de Hallazgos

| Archivo                   | Gravedad       | Hallazgo                                                                                                                                            | Referencia en Docs    |
| :------------------------ | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `CLAUDE.md:13`            | 🔴 **Crítico** | Declara Next.js 15, pero `package.json` usa 16.2.2. Hallazgos posteriores en el mismo archivo (S12-S17) contradicen la línea 13.                    | Stack Tecnológico     |
| `next.config.ts:14`       | 🟡 **Medio**   | Comentario obsolote referenciando Next.js 15 como base para directivas CSP.                                                                         | Código Fuente         |
| `next.config.ts:41`       | 🟡 **Medio**   | Uso de `hostname: '**'` en `remotePatterns`. Práctica de seguridad laxa que permite cargar imágenes de cualquier host HTTPS sin whitelist.          | Seguridad (Config)    |
| `CLAUDE.md` (Logs)        | 🟡 **Medio**   | Saturación de logs (S12, S13, S14, S15, S17) todos con la misma fecha (2026-04-05). Sugiere "sesiones falsas" o falta de rotación real de contexto. | Protocolo de Sesiones |
| `pnpm-workspace.yaml:5-6` | 🔵 **Bajo**    | `sharp` y `unrs-resolver` ignorados en `ignoredBuiltDependencies`. Puede causar degradación silenciosa en procesamiento de imágenes Larch/Next.     | Configuración PNPM    |
| Raíz (`/`)                | 🔵 **Bajo**    | Archivo `message_dos_general.html` presente en la raíz. Archivo huérfano sin referencias en el código. "Código Basura".                             | Higiene de Raíz       |
| Raíz (`/`)                | 🔵 **Bajo**    | `tsconfig.tsbuildinfo` visible en la raíz. Debería estar en `.gitignore` para evitar ruido en el repositorio.                                       | Higiene de Raíz       |

## 3. Análisis de "Código Basura" en Configuración

- **Contradicciones de Versión**: El proyecto se encuentra en un estado de "migración a medias" documental. Las menciones a Next.js 16 son hallazgos de sesión, pero el "norte" del proyecto sigue diciendo Next.js 15.
- **Middleware vs Proxy**: Se confirma que el renombre (`middleware.ts` -> `proxy.ts`) y de la función exportada fue exitoso, eliminando el archivo anterior. Esto es coherente con los requisitos de Next.js 16 declarados en los hallazgos de S13.
- **Higiene de Archivos**: Existe una acumulación de archivos de entorno y basura de sesión (`message_dos_general.html`) que resta profesionalidad al entregable.

## 4. Borrador de PROMPT para S2

```text
Actúa como Auditor de Seguridad y Bases de Datos. Tu misión es la S2 de la auditoría de "Orion Landing Universal".

OBJETIVO: Auditar esquemas de base de datos, tipos y políticas de seguridad (RLS).

TAREAS:
1. Comparar 'supabase/migrations/' contra 'docs/specs/DATABASE-SCHEMA.md'. ¿Están sincronizados?
2. Verificar 'src/types/database.ts'. ¿Refleja la realidad de la base de datos o es un dump desactualizado?
3. Auditar las políticas RLS en las migraciones. ¿Hay tablas con 'ENABLE RLS' pero sin políticas definidas (lo que bloquea todo)? ¿Hay tablas con políticas demasiado permisivas?
4. Revisar la protección de la tabla 'integrations' (API keys).
5. NO MODIFICAR NADA. Generar informe en auditoria_gemini/RESULTADO_S1_ESTRUCTURA.md.

Referencia el ROADMAP.md para el contexto de la auditoría.
```

---

_Sesión S1 concluida por Antigravity (Senior Software Architect)_
