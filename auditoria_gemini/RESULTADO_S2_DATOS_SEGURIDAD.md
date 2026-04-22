# Informe de Auditoría S2: Datos y Seguridad — Orion Landing Universal

## 1. Resumen Ejecutivo

La auditoría de la Fase S2 confirma una alta coherencia técnica entre las migraciones de la base de datos y los tipos de TypeScript. Sin embargo, se ha detectado una desincronización en la documentación del modelo de datos. El hallazgo más crítico es la configuración de seguridad **RLS (Row Level Security)**, que utiliza el rol `authenticated` de forma excesivamente permisiva, exponiendo potencialmente credenciales sensibles en la tabla `integrations`.

## 2. Estado de Sincronización

### Documentación vs. Migraciones (`DATA-MODEL.md` vs. `supabase/migrations/`)

- **Estado**: Parcialmente Sincronizado.
- **Hallazgos**:
  - La tabla `content_changes` (introducida en la migración `002_content_changes.sql`) **no existe** en `docs/architecture/DATA-MODEL.md`.
  - La tabla `integrations` y el resto de las tablas principales están correctamente documentadas.
- **Veredicto**: La documentación requiere una actualización para incluir el log de auditoría de cambios.

### Tipos de TypeScript vs. Migraciones (`src/types/database.ts` vs. Migraciones)

- **Estado**: **Sincronizado**.
- **Hallazgos**:
  - El archivo `database.ts` refleja fielmente las 11 tablas actuales, incluyendo la tabla `content_changes`.
  - Las interfaces `Row`, `Insert` y `Update` son coherentes con las restricciones de nulidad y tipos de PostgreSQL.
- **Nota**: El campo `Relationships` está vacío en todas las tablas. Aunque no afecta la funcionalidad actual (single-tenant, pocas relaciones FK complejas), se recomienda su regeneración futura con el CLI de Supabase para mejorar el DX en consultas complejas.

## 3. Auditoría de Seguridad RLS

### Cobertura de RLS

Se confirma que las **11 tablas** tienen RLS activado (`ENABLE ROW LEVEL SECURITY`). No hay tablas "olvidadas" que permitan acceso directo sin políticas.

### Hallazgos en Políticas RLS

Se han identificado los siguientes riesgos por políticas demasiado permisivas:

| Tabla             | Riesgo      | Descripción                                                                                                                                      |
| :---------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `integrations`    | **CRÍTICO** | La política `integrations_admin_read` permite acceso SELECT a cualquier usuario con el rol `authenticated`.                                      |
| `content_changes` | **ALTO**    | Cualquier usuario `authenticated` puede leer y escribir en el log de auditoría.                                                                  |
| `leads`           | **MEDIO**   | El acceso SELECT para administradores usa `authenticated`, permitiendo que cualquier usuario logueado vea los leads si el registro está abierto. |
| `media`           | **MEDIO**   | Cualquier usuario logueado puede insertar o eliminar archivos multimedia.                                                                        |

**El problema del rol `authenticated`:**
En Supabase, cualquier usuario que se registre (si el registro público está habilitado en Auth) obtiene el rol `authenticated`. Estas políticas asumen que solo existe un usuario (el admin), lo cual es peligroso si se escala o si se deja el registro abierto por error.

## 4. Auditoría de Protección: Tabla `integrations`

- **Contenido**: Almacena IDs de seguimiento (GA4, Pixel), credenciales de SMTP y configuraciones de WhatsApp/Calendly.
- **Veredicto**: **INSEGURO**.
- **Detalle**: Aunque las contraseñas SMTP se documentan como cifradas, los IDs de medición y otros parámetros de configuración son visibles para cualquier usuario logueado. Un atacante que logre registrarse podría exfiltrar esta configuración técnica.

## 5. Recomendaciones de Seguridad

1.  **Restringir Acceso a `integrations`**: Eliminar la política de lectura para `authenticated` y delegar el acceso exclusivamente al lado del servidor (API Routes) usando la `service_role` key, o bien implementar una comprobación de correo específico de admin en la política.
2.  **Reforzar Comprobación de Admin**: Cambiar `auth.role() = 'authenticated'` por una comprobación más robusta, idealmente mediante un custom claim en el JWT (ej. `(auth.jwt() ->> 'is_admin')::boolean = true`).
3.  **Cierre de Registro**: Asegurarse de que el registro público esté deshabilitado en Supabase una vez completado el setup inicial.
4.  **Actualizar `DATA-MODEL.md`**: Incluir la definición de la tabla `content_changes` para mantener la paridad entre docs y código.

## 6. Referencia al ROADMAP

- **Estado S2**: **COMPLETADO**.
- **Alineación**: Se han cumplido todos los objetivos de la Fase S2 según el `ROADMAP.md`. Los hallazgos de esta sesión deben ser registrados como tareas de "Seguridad" en la Fase 6 (Polish y Producción).

---

**Auditor**: Antigravity (Gemini 3 Flash)
**Fecha**: 2026-04-05
