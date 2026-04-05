# Viabilidad del Wizard — Orion Landing Universal

**Auditor**: Antigravity (Gemini 3 Flash)

---

## 1. El Problema de la Inyección Inicial

El Wizard en `WIZARD-FLOW.md` asume que el usuario _solo_ tiene un proyecto en Supabase (un dashboard vacío).
Para que el servidor de Next.js (`api/setup`) pueda crear tablas:

- **A** — Necesita la `Service Role Key` (proporcionado por el usuario).
- **B** — Necesita un medio de ejecución SQL (Supabase no lo expone por defecto vía Service Role API).
- **C** — Necesita crear la base de datos de Auth User (esto es posible con la Admin Auth API de Supabase).

### Diagnóstico de Fallo

Si el usuario simplemente crea el proyecto en Supabase, el `endpoint` de PostgREST no permite `CREATE TABLE`. El Wizard de Claude, tal como está documentado, **fallará** en el paso de creación de tablas si se intenta usar la API de Supabase estándar (`supabase-js`).

## 2. Solución Profesional para 2026

El Wizard debe incluir un **"Paso Cero"** (fuera del Wizard pero guiado):

- **Opción 1 (Botón Único)**: El usuario debe ir al `SQL Editor` de Supabase y pegar el script de las 10 tablas (copiado con un botón del Wizard). Una vez que el Wizard detecta `site_config`, continúa. Es la forma más robusta y segura.
- **Opción 2 (Conexión Directa)**: El Wizard solicita la `DB Password` (además de las Keys) y usa un cliente de Postgres directo (`pg`) para inyectar todo. Esto es 100% automático pero requiere que el usuario sepa su password de DB.

### 💡 Mi Recomendación (Híbrida)

1.  El Wizard abre una pestaña nueva en el SQL Editor de Supabase del usuario.
2.  El Wizard le entrega el SQL completo con un botón "Copiar Esquema".
3.  El usuario lo pega y le da a "Run".
4.  El Wizard detecta que las tablas ya existen (Status Check) y se salta ese paso automáticamente.

Esto es **seguro**, **escalable** y evita problemas de permisos de la Service Role Key para operaciones de DDL (Data Definition Language).

---

## 2. Inyección de Datos (Seeds)

Una vez que las tablas existen, el Wizard puede inyectar los 19 módulos y las 20 paletas de colores.

- **Ojo con los Media**: Las imágenes por defecto deben subirse al bucket `media`. Si el bucket no existe, el paso de Seed fallará.
- **Acción**: El paso de creación de tablas DEBE incluir el SQL para crear los buckets y sus políticas en `storage.buckets` y `storage.objects`.

---

## 3. Conclusión de Viabilidad

El Wizard es **viable** técnicamente, pero la documentación actual subestima la dificultad de inyectar el esquema inicial en una base de datos Postgres de Supabase de manera remota sin privilegios de Superuser o una conexión de red directa.

**Reiteración**: No puedes usar la `anon_key` ni la `service_role_key` para ejecutar `CREATE TABLE` vía HTTP (`supabase-js`). Esto es una limitación de diseño de Supabase para prevenir inyecciones SQL masivas.
