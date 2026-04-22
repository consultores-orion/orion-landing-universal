# Resolucion Auditoria S2 — Datos y Seguridad RLS

**Auditor original**: Gemini (Antigravity)
**Contra-auditor**: Claude Opus 4.6
**Fecha**: 2026-04-05

---

## Veredicto General: 1/6 hallazgo valido y corregido. 4/6 parcialmente validos pero con severidad sobrestimada. 1/6 correcto sin accion.

---

## Hallazgo 1 — content_changes no documentada en DATA-MODEL.md

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| Severidad Gemini | SIN CLASIFICAR (recomendacion) |
| Severidad real   | BAJO (documentacion)           |
| Estado           | **CORREGIDO**                  |

**Problema**: La tabla `content_changes` (migracion `002_content_changes.sql`) no existia en `docs/architecture/DATA-MODEL.md`. Solo se documentaban las 10 tablas de la migracion 001.
**Verificacion**: `grep -c "content_changes" DATA-MODEL.md` = 0 coincidencias. Confirmado.
**Correccion aplicada**:

- Seccion 3.11 agregada con definicion completa: campos, tipos, RLS policies, indices, notas de uso
- Diagrama ER actualizado para incluir `content_changes` como tabla de audit log
- Seccion 4.1 actualizada para referenciar ambas migraciones (001 + 002)
- Seccion 6.2 corregida: path de migraciones futuras apuntaba a `src/lib/supabase/migrations/` (incorrecto) en lugar de `supabase/migrations/`

---

## Hallazgo 2 — TypeScript types sincronizados

| Campo            | Valor                       |
| ---------------- | --------------------------- |
| Severidad Gemini | N/A (hallazgo positivo)     |
| Severidad real   | N/A                         |
| Estado           | **CONFIRMADO — SIN ACCION** |

**Verificacion**: `src/types/database.ts` contiene las 11 tablas (10 de migracion 001 + `content_changes` de migracion 002). Interfaces `Row`, `Insert` y `Update` son coherentes con los tipos PostgreSQL. Campos nullable correctamente tipados como `string | null`.
**Nota sobre Relationships**: Gemini senala que `Relationships: []` esta vacio. Esto es correcto — es un placeholder requerido por `@supabase/postgrest-js >= 2.x` (GenericTable constraint). Se llenaria automaticamente al regenerar con `supabase gen types`. No es un defecto.

---

## Hallazgo 3 — RLS `integrations` (CRITICO segun Gemini)

| Campo            | Valor                                                  |
| ---------------- | ------------------------------------------------------ |
| Severidad Gemini | **CRITICO**                                            |
| Severidad real   | **BAJO** (uso previsto) / **MEDIO** (si misconfigured) |
| Estado           | **DESESTIMADO — Apropiado para single-tenant**         |

**Analisis de Gemini**: `integrations_admin_read` usa `auth.role() = 'authenticated'`, permitiendo lectura a cualquier usuario autenticado, no solo admins. Contiene SMTP creds y API keys.

**Contra-analisis (con evidencia)**:

1. **Arquitectura single-tenant**: Una instalacion = un sitio = un admin. Documentado en CLAUDE.md linea 1 y `docs/architecture/DATA-MODEL.md`.

2. **El wizard bloquea mas registros**: `src/app/api/setup/create-admin/route.ts` verifica `usersData.users.length > 0` antes de crear un admin. Si ya existe un usuario, retorna 403. No hay ruta para crear usuarios adicionales en el CMS.

3. **El proxy esta ACTIVO**: El sub-agente reporto erroneamente que `proxy.ts` "no esta activo" porque no encontro `middleware.ts`. **FALSO** — en Next.js 16, `proxy.ts` con funcion `proxy()` ES el middleware oficial (ver CLAUDE.md hallazgos S13). Archivo verificado en `src/proxy.ts` con `export async function proxy(request)` y `export const config = { matcher: [...] }`.

4. **Las API routes verifican autenticacion**: Todas las rutas admin (`/api/integrations`, `/api/leads`, etc.) hacen `supabase.auth.getUser()` y retornan 401 si no hay usuario. No es acceso abierto.

5. **Passwords redactados**: `GET /api/integrations` redacta passwords SMTP antes de retornar (sub-agente confirmo lineas 134-137 de `route.ts`).

6. **Cadena de defensa real**:
   - Capa 1: Proxy requiere auth para `/admin/*`
   - Capa 2: API routes verifican `getUser()` → 401 sin sesion
   - Capa 3: RLS verifica `auth.role() = 'authenticated'`
   - Capa 4: Supabase Auth config (signups deben deshabilitarse post-setup)

**El riesgo teorico**: Si el admin deja signups publicos habilitados en Supabase Y alguien se registra con un email real (bypass de email confirmation), esa persona tendria acceso a las API admin.

**Mitigacion correcta**: Operacional, no de codigo. Ya documentada en CLAUDE.md seccion "Correcciones Post-Auditoria" como: "Cierre de Registro: Asegurarse de que el registro publico este deshabilitado en Supabase."

**Por que custom JWT claims NO es la solucion**:

- Requiere crear funciones PostgreSQL custom (`auth.jwt() ->> 'is_admin'`)
- Requiere configurar Supabase Auth hooks para inyectar claims en el JWT
- Requiere cambiar setup wizard de `user_metadata` a `app_metadata` (user_metadata es modificable por el propio usuario)
- Todo esto para proteger contra un escenario que se resuelve con un toggle en el dashboard de Supabase
- Es overengineering para un template de landing page single-tenant

---

## Hallazgo 4 — RLS `content_changes` (ALTO segun Gemini)

| Campo            | Valor                                        |
| ---------------- | -------------------------------------------- |
| Severidad Gemini | **ALTO**                                     |
| Severidad real   | **BAJO**                                     |
| Estado           | **DESESTIMADO — Mismo patron single-tenant** |

**Analisis**: Mismo patron `auth.role() = 'authenticated'`. Gemini lo clasifica ALTO.

**Contra-analisis**:

- `content_changes` es un log de auditoria. Contiene `section_key`, `field_path`, `old_value`, `new_value`, `changed_at`.
- **NO contiene datos sensibles** — son registros de que campos de texto se editaron en la landing page
- Incluso si un atacante los leyera, veria cosas como "titulo del hero cambio de X a Y"
- El nivel de riesgo es sustancialmente menor que `integrations`
- Misma defensa en cadena que hallazgo 3 aplica

---

## Hallazgo 5 — RLS `leads` (MEDIO segun Gemini)

| Campo            | Valor                                                  |
| ---------------- | ------------------------------------------------------ |
| Severidad Gemini | **MEDIO**                                              |
| Severidad real   | **BAJO** (uso previsto) / **MEDIO** (si misconfigured) |
| Estado           | **DESESTIMADO — Apropiado con mitigacion operacional** |

**Analisis**: `leads_admin_select` usa `authenticated`. Leads contienen PII (nombre, email, telefono).

**Contra-analisis**:

- Gemini tiene razon en que leads contienen PII — esto los hace mas sensibles que content_changes
- Sin embargo, la cadena de defensa es identica al hallazgo 3
- `leads_public_insert` con `WITH CHECK (true)` es correcto — es la funcionalidad core (formulario publico)
- El rate limiting en POST protege contra spam (5 req/min por IP, verificado en `src/app/api/leads/route.ts`)
- La defensa real contra acceso no autorizado es la misma: no permitir registros publicos en Supabase

**Nota**: Si en el futuro el proyecto evolucionara a multi-tenant, `leads` seria la PRIMERA tabla que necesitaria reforzar RLS con ownership checks (`user_id = auth.uid()`).

---

## Hallazgo 6 — RLS `media` (MEDIO segun Gemini)

| Campo            | Valor           |
| ---------------- | --------------- |
| Severidad Gemini | **MEDIO**       |
| Severidad real   | **BAJO**        |
| Estado           | **DESESTIMADO** |

**Analisis**: Gemini dice "cualquier usuario logueado puede insertar o eliminar archivos multimedia".

**Contra-analisis**:

- `media_public_read` con `USING (true)` — la lectura ES publica. Las imagenes de la landing page necesitan ser accesibles
- INSERT/UPDATE/DELETE requieren `authenticated` — correcto para CMS admin
- La API route `POST /api/media` valida MIME type (solo imagenes) y tamano maximo (5MB)
- `uploaded_by` registra quien subio cada archivo
- Mismo modelo de amenaza que hallazgos anteriores — requiere registro no autorizado

---

## Recomendacion Gemini — Custom JWT claims

| Campo  | Valor                           |
| ------ | ------------------------------- |
| Estado | **RECHAZADO — Overengineering** |

**Razonamiento completo**: Ver hallazgo 3, seccion "Por que custom JWT claims NO es la solucion".

**Alternativa documentada**: Deshabilitar signups publicos en Supabase Dashboard > Authentication > Providers > Email > "Enable Sign Up" = false. Esta indicacion ya existe en CLAUDE.md y en las guias de deploy.

---

## Recomendacion Gemini — Actualizar DATA-MODEL.md

| Campo  | Valor                   |
| ------ | ----------------------- |
| Estado | **ACEPTADO Y APLICADO** |

Ver hallazgo 1 para detalles de la correccion.

---

## Archivos modificados en esta resolucion

| Archivo                                          | Cambio                                         |
| ------------------------------------------------ | ---------------------------------------------- |
| `docs/architecture/DATA-MODEL.md` (diagrama ER)  | Agregado `content_changes` al diagrama         |
| `docs/architecture/DATA-MODEL.md` (seccion 3.11) | Nueva seccion completa para `content_changes`  |
| `docs/architecture/DATA-MODEL.md` (seccion 4.1)  | Actualizado para referenciar ambas migraciones |
| `docs/architecture/DATA-MODEL.md` (seccion 6.2)  | Corregido path de migraciones futuras          |

**Nota**: No se modifico codigo fuente ni politicas RLS. Los hallazgos de seguridad fueron desestimados como apropiados para la arquitectura single-tenant, con mitigacion operacional ya documentada.

---

## Errores del sub-agente de verificacion (hallazgos propios)

Durante la contra-auditoria, el sub-agente de exploracion reporto erroneamente que `src/proxy.ts` "NO esta activo" porque no encontro `middleware.ts`. Esto es **FALSO** — en Next.js 16, `proxy.ts` reemplaza a `middleware.ts` (ver CLAUDE.md hallazgos S13). Este error no proviene de Gemini sino de mi propio agente de verificacion.

---

_Resolucion S2 completada por Claude Opus 4.6 — 2026-04-05_
