# Referencia de API Interna

> **Audiencia**: Desarrolladores que integran o extienden Orion Landing Universal.
> **Base URL**: Relativa al dominio de la instalación. Ej: `https://mi-sitio.com/api/...`
> **Versión**: 0.1.0+ (S8)

---

## Índice

1. [Autenticación](#1-autenticación)
2. [Convenciones generales](#2-convenciones-generales)
3. [Rate limiting](#3-rate-limiting)
4. [Referencia de endpoints](#4-referencia-de-endpoints)
   - [Salud del sistema](#salud-del-sistema)
   - [Autenticación](#autenticación-endpoints)
   - [Setup Wizard](#setup-wizard)
   - [Contenido de módulos](#contenido-de-módulos)
   - [Módulos — estructura](#módulos--estructura)
   - [Live Edit inline](#live-edit-inline)
   - [Diseño (temas y paletas)](#diseño-temas-y-paletas)
   - [SEO](#seo)
   - [Media](#media)
   - [Leads](#leads)
   - [Internacionalización](#internacionalización)
   - [Integraciones](#integraciones)
   - [Configuración del sitio](#configuración-del-sitio)
   - [Dashboard admin](#dashboard-admin)

---

## 1. Autenticación

Todos los endpoints marcados con **[Auth]** requieren una sesión activa de Supabase Auth.

### Mecanismo

El sistema usa cookies HTTP-only gestionadas por Supabase Auth. En cada request, el servidor llama `supabase.auth.getUser()` internamente — si no hay sesión válida, devuelve `401`.

No se usa JWT Bearer en headers: la sesión se envía automáticamente en la cookie `sb-[project-ref]-auth-token`.

### Iniciar sesión

La autenticación se realiza a través del formulario en `/login`, que usa el Supabase Auth client-side. No hay endpoint de login propio — Supabase gestiona el flujo directamente.

### Callback OAuth

```
GET /api/auth/callback?code={code}
```

Endpoint de callback para el flujo OAuth. Intercambia el `code` por una sesión y redirige al admin. Gestionado internamente por Supabase Auth.

### Cerrar sesión

```
POST /api/auth/logout
```

Invalida la sesión activa y redirige a `/login`.

- **Auth**: No requerida (pero solo tiene efecto si hay sesión activa)
- **Respuesta**: Redirect 302 a `/login`

---

## 2. Convenciones generales

### Formato de respuesta

**Éxito**:

```json
{ "data": { ... } }
// o
{ "success": true }
// o
{ "success": true, "data": { ... } }
```

**Error**:

```json
{ "error": "Mensaje de error legible" }
// Con detalles de validación:
{ "error": "Validation failed", "details": { "fieldErrors": { ... }, "formErrors": [] } }
```

### Códigos de estado

| Código | Significado                                                                  |
| ------ | ---------------------------------------------------------------------------- |
| `200`  | OK — operación exitosa                                                       |
| `201`  | Created — recurso creado                                                     |
| `302`  | Redirect (auth callbacks, logout)                                            |
| `400`  | Bad Request — JSON inválido o parámetros incorrectos                         |
| `401`  | Unauthorized — sesión no encontrada o expirada                               |
| `403`  | Forbidden — operación no permitida (setup ya completo, módulo sistema, etc.) |
| `404`  | Not Found — recurso no encontrado                                            |
| `409`  | Conflict — recurso ya existe (ej: código de idioma duplicado)                |
| `422`  | Unprocessable Entity — validación de datos fallida                           |
| `429`  | Too Many Requests — rate limit excedido                                      |
| `500`  | Internal Server Error — error de Supabase u otro error interno               |

### Tipos de contenido

- Requests con body: `Content-Type: application/json`
- Upload de archivos: `Content-Type: multipart/form-data`
- Exports (descargas): respuesta con `Content-Disposition: attachment`

---

## 3. Rate limiting

El sistema implementa rate limiting in-memory por IP. **Nota**: En entornos serverless (Vercel), cada función tiene memoria separada, por lo que el rate limiting puede no ser 100% estricto entre invocaciones.

| Endpoint               | Límite               |
| ---------------------- | -------------------- |
| `POST /api/leads`      | 5 req/minuto por IP  |
| `PUT /api/inline-edit` | 30 req/minuto por IP |
| `POST /api/setup/*`    | 10 req/minuto por IP |

Cuando se excede el límite, el servidor devuelve `429` con headers:

```
X-RateLimit-Limit: {max}
X-RateLimit-Remaining: 0
X-RateLimit-Reset: {timestamp}
```

---

## 4. Referencia de endpoints

---

### Salud del sistema

#### `GET /api/health`

Verificación de estado del sistema. No requiere autenticación.

**Respuesta 200**:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "environment": "production",
  "timestamp": "2026-04-05T12:00:00.000Z",
  "supabase": "connected"
}
```

| Campo      | Valores posibles                    |
| ---------- | ----------------------------------- |
| `status`   | `"ok"`                              |
| `supabase` | `"connected"` \| `"not_configured"` |

---

### Autenticación (endpoints)

#### `GET /api/auth/callback`

Callback de OAuth. Gestionado internamente por Supabase. Ver sección [Autenticación](#1-autenticación).

#### `POST /api/auth/logout`

Cierra la sesión activa y redirige a `/login`.

---

### Setup Wizard

Los endpoints de setup solo están disponibles **antes** de que el setup esté completo. Una vez completado, devuelven `403`.

#### `POST /api/setup/test-connection`

Verifica la conexión con Supabase antes de guardar la configuración.

**Body**:

```json
{
  "supabaseUrl": "https://xxxx.supabase.co",
  "anonKey": "eyJ...",
  "serviceRoleKey": "eyJ...",
  "databaseUrl": "postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres"
}
```

**Respuesta 200** (tanto en éxito como en fallo parcial):

```json
{
  "success": true,
  "tests": {
    "anon": true,
    "serviceRole": true,
    "database": true
  },
  "message": "All connection tests passed."
}
```

```json
{
  "success": false,
  "error": "Anon key test failed: Invalid API key",
  "tests": {
    "anon": false,
    "serviceRole": true,
    "database": false
  }
}
```

- **Rate limit**: 10 req/min por IP
- **Seguridad**: Bloqueado si el setup ya está completo

#### `POST /api/setup/save-config`

Guarda las credenciales de Supabase en el archivo `.env.local` del servidor.

**Body**: Mismo schema que `test-connection`.

**Respuesta 200**:

```json
{ "success": true }
```

- **Rate limit**: 10 req/min por IP
- **Seguridad**: Bloqueado si el setup ya está completo

#### `POST /api/setup/create-tables`

Ejecuta las migraciones DDL para crear las 10 tablas del sistema. Usa conexión directa PostgreSQL (paquete `postgres`).

**Body**: Vacío o `{}`.

**Respuesta 200**:

```json
{
  "success": true,
  "results": [
    { "table": "site_config", "status": "success" },
    { "table": "languages", "status": "success" },
    ...
  ]
}
```

- **Rate limit**: 10 req/min por IP
- **Seguridad**: Bloqueado si el setup ya está completo

#### `POST /api/setup/seed`

Inserta los datos iniciales en todas las tablas (site_config base, idiomas, módulos, esquemas, paletas de colores).

**Respuesta 200**:

```json
{ "success": true, "message": "Seed completed successfully." }
```

#### `POST /api/setup/create-admin`

Crea el primer usuario admin en Supabase Auth. Solo funciona si no existe ningún usuario.

**Body**:

```json
{
  "email": "admin@example.com",
  "password": "MiPassword123!",
  "confirmPassword": "MiPassword123!"
}
```

**Respuesta 200**:

```json
{
  "success": true,
  "message": "Admin account created. Setup is complete.",
  "user": {
    "email": "admin@example.com",
    "id": "uuid-del-usuario"
  }
}
```

**Errores específicos**:

- `403` si ya existe un usuario admin
- `403` si el setup ya está completo

---

### Contenido de módulos

#### `GET /api/content` [Auth]

Lista todos los módulos con su visibilidad y orden (vista simplificada para el admin).

**Respuesta 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "section_key": "hero",
      "is_visible": true,
      "display_order": 1
    }
  ]
}
```

#### `GET /api/content/[section_key]` [Auth]

Obtiene el contenido completo de un módulo específico junto con su schema de edición.

**Parámetros de ruta**: `section_key` — clave del módulo (ej: `hero`, `pricing`)

**Respuesta 200**:

```json
{
  "module": {
    "id": "uuid",
    "section_key": "hero",
    "display_name": { "es": "Hero", "en": "Hero" },
    "content": { "title": { "es": "...", "en": "..." }, ... },
    "styles": { "paddingY": "xlarge", ... },
    "is_visible": true,
    "is_system": false,
    "display_order": 1
  },
  "schema": { ... }
}
```

**Errores**:

- `404` si el `section_key` no existe

#### `PUT /api/content/[section_key]` [Auth]

Reemplaza el objeto `content` completo de un módulo.

**Body**:

```json
{
  "content": {
    "title": { "es": "Nuevo título", "en": "New title" },
    "layout": "centered"
  }
}
```

**Respuesta 200**:

```json
{ "success": true }
```

**Nota**: Este endpoint reemplaza el `content` completo. Para actualizaciones campo a campo, usar `/api/inline-edit`.

---

### Módulos — estructura

#### `GET /api/modules` [Auth]

Lista todos los módulos con su estructura (orden, visibilidad, nombre).

**Respuesta 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "section_key": "hero",
      "display_name": { "es": "Hero", "en": "Hero" },
      "is_visible": true,
      "is_system": false,
      "display_order": 1
    }
  ]
}
```

#### `PATCH /api/modules/reorder` [Auth]

Actualiza el `display_order` de múltiples módulos en una sola operación (usado por el DnD del admin).

**Body**:

```json
{
  "order": [
    { "id": "uuid-hero", "display_order": 1 },
    { "id": "uuid-value-prop", "display_order": 2 },
    { "id": "uuid-pricing", "display_order": 3 }
  ]
}
```

**Respuesta 200**:

```json
{ "success": true }
```

#### `PATCH /api/modules/[id]/visibility` [Auth]

Activa o desactiva la visibilidad de un módulo.

**Parámetros de ruta**: `id` — UUID del módulo en `page_modules`

**Body**:

```json
{ "is_visible": false }
```

**Respuesta 200**:

```json
{ "success": true }
```

**Errores específicos**:

- `400` si se intenta desactivar un módulo de sistema (`is_system: true`)
- `404` si el módulo no existe

#### `GET /api/modules/export` [Auth]

Descarga el layout actual (orden y visibilidad) como archivo JSON. No incluye el `content` de los módulos.

**Respuesta**: Archivo `orion-layout-YYYY-MM-DD.json`

```json
{
  "version": "1",
  "modules": [
    {
      "section_key": "hero",
      "display_order": 1,
      "is_visible": true,
      "display_name": { "es": "Hero", "en": "Hero" }
    }
  ],
  "createdAt": "2026-04-05T12:00:00.000Z"
}
```

#### `POST /api/modules/import` [Auth]

Importa un archivo de layout. Solo actualiza `display_order` e `is_visible` — nunca crea módulos nuevos ni modifica su `content`.

**Body**: Mismo formato que el export de `/api/modules/export`.

**Respuesta 200**:

```json
{
  "success": true,
  "updated": 19,
  "skipped": 0
}
```

`skipped` indica cuántos `section_key` del archivo importado no existen en la DB.

---

### Live Edit inline

#### `PUT /api/inline-edit` [Auth]

Realiza una actualización quirúrgica de un campo individual en el `content` JSONB de un módulo. Usado por el modo Live Edit del admin.

**Body**:

```json
{
  "sectionKey": "hero",
  "fieldPath": "title",
  "value": "Nuevo título",
  "lang": "es"
}
```

| Campo        | Tipo                          | Descripción                                                                                                 |
| ------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `sectionKey` | `string`                      | Clave del módulo en `page_modules.section_key`                                                              |
| `fieldPath`  | `string`                      | Clave del campo en el objeto `content`                                                                      |
| `value`      | `string \| number \| boolean` | Nuevo valor del campo                                                                                       |
| `lang`       | `string` (opcional)           | Si se proporciona, actualiza `content[lang][fieldPath]`; si no, actualiza `content[fieldPath]` directamente |

**Respuesta 200**:

```json
{ "success": true }
```

**Notas**:

- Solo soporta dot-notation de un nivel (ej: `"title"`, no `"items.0.text"`).
- Para campos multilinguales: pasar `lang` (ej: `"es"`) actualiza solo ese idioma sin afectar los demás.
- Rate limit: 30 req/minuto por IP.

---

### Diseño (temas y paletas)

#### `GET /api/design` [Auth]

Obtiene la configuración del tema activo y todas las paletas disponibles.

**Respuesta 200**:

```json
{
  "themeConfig": {
    "id": "uuid",
    "palette_id": "professional-blue",
    "custom_colors": {},
    "typography": {
      "font_heading": "Inter",
      "font_body": "Inter",
      "base_size": "16px",
      "scale_ratio": 1.25
    },
    "spacing": {
      "section_padding": "comfortable",
      "container_max_width": "1200px",
      "element_gap": "16px"
    },
    "border_radius": "medium"
  },
  "palettes": [
    {
      "id": "professional-blue",
      "name": "Professional Blue",
      "description": "...",
      "niche": "technology",
      "colors": { "primary": "#2563eb", ... },
      "is_predefined": true
    }
  ]
}
```

#### `PUT /api/design/theme` [Auth]

Actualiza la configuración del tema activo. Todos los campos son opcionales — solo se actualizan los campos enviados.

**Body**:

```json
{
  "active_palette_id": "professional-blue",
  "heading_font": "Inter",
  "body_font": "Inter",
  "spacing_preset": "comfortable",
  "border_radius": "medium",
  "custom_colors": {
    "primary": "#1d4ed8"
  }
}
```

| Campo               | Tipo     | Valores                                                                |
| ------------------- | -------- | ---------------------------------------------------------------------- |
| `active_palette_id` | `string` | ID de paleta en `color_palettes`                                       |
| `heading_font`      | `string` | Nombre de Google Font                                                  |
| `body_font`         | `string` | Nombre de Google Font                                                  |
| `spacing_preset`    | `string` | `"compact"` \| `"comfortable"` \| `"spacious"`                         |
| `border_radius`     | `string` | `"none"` \| `"small"` \| `"medium"` \| `"large"` \| `"full"`           |
| `custom_colors`     | `object` | Mapa `{ [colorKey]: hexValue }` para sobrescribir colores de la paleta |

**Respuesta 200**:

```json
{ "success": true, "data": { ... } }
```

**Efecto secundario**: Llama `revalidatePath('/')` para refrescar las CSS variables en la landing pública.

#### `GET /api/design/theme/export` [Auth]

Descarga el tema completo como archivo JSON.

**Respuesta**: Archivo `orion-theme-YYYY-MM-DD.json`. Ver formato en [CUSTOM-THEME.md](../guides/CUSTOM-THEME.md#4-estructura-completa-de-un-tema).

#### `POST /api/design/theme/import` [Auth]

Importa y aplica un tema completo desde JSON. Si el JSON incluye una paleta, la crea como entrada personalizada en `color_palettes`.

**Body**: Formato de tema completo. Ver [CUSTOM-THEME.md](../guides/CUSTOM-THEME.md#4-estructura-completa-de-un-tema).

**Respuesta 200**:

```json
{ "success": true, "data": { ... } }
```

#### `GET /api/design/palette/export` [Auth]

Descarga la paleta activa como archivo JSON.

**Respuesta**: Archivo `orion-palette-YYYY-MM-DD.json`.

```json
{
  "version": "1",
  "name": "Professional Blue",
  "colors": {
    "primary": "#2563eb",
    "secondary": "#1e40af",
    ...
  },
  "createdAt": "2026-04-05T12:00:00.000Z"
}
```

#### `POST /api/design/palette/import` [Auth]

Importa una paleta y la guarda como paleta personalizada (`is_predefined: false`). No la activa automáticamente.

**Body**:

```json
{
  "version": "1",
  "name": "Mi Paleta",
  "colors": {
    "primary": "#...",
    "secondary": "#...",
    "accent": "#...",
    "background": "#...",
    "surface": "#...",
    "text_primary": "#...",
    "text_secondary": "#...",
    "success": "#...",
    "error": "#...",
    "warning": "#...",
    "info": "#...",
    "border": "#..."
  }
}
```

**Respuesta 201**:

```json
{ "success": true, "data": { "id": "custom-1234-abcde", ... } }
```

---

### SEO

#### `GET /api/seo` [Auth]

Lista todos los registros de `seo_config`.

**Respuesta 200**:

```json
{ "data": [ { "page_key": "home", "meta_title": { "es": "...", "en": "..." }, ... } ] }
```

#### `GET /api/seo/[lang]` [Auth]

Obtiene la configuración SEO para un idioma específico, extrayendo los valores del JSONB multilingual.

**Parámetros de ruta**: `lang` — código de idioma activo (ej: `es`, `en`)

**Respuesta 200**:

```json
{
  "data": {
    "meta_title": "Título para SEO en español",
    "meta_description": "Descripción para SEO en español",
    "og_image_url": "https://...",
    "canonical_url": "https://...",
    "robots": "index,follow",
    "structured_data": {}
  }
}
```

**Errores**: `404` si el idioma no existe o no está activo.

#### `PUT /api/seo/[lang]` [Auth]

Actualiza la configuración SEO para un idioma. Los campos de `meta_title` y `meta_description` se fusionan en el JSONB existente (no reemplazan los otros idiomas).

**Body**:

```json
{
  "meta_title": "Título SEO actualizado",
  "meta_description": "Descripción actualizada (máx 160 caracteres)",
  "og_image_url": "https://ejemplo.com/og.jpg",
  "canonical_url": "https://ejemplo.com",
  "robots": "index,follow",
  "json_ld": "{\"@type\": \"Organization\", ...}"
}
```

| Campo              | Max       | Valores                                                        |
| ------------------ | --------- | -------------------------------------------------------------- |
| `meta_title`       | 60 chars  | —                                                              |
| `meta_description` | 160 chars | —                                                              |
| `robots`           | —         | `"index,follow"` \| `"noindex,follow"` \| `"noindex,nofollow"` |
| `json_ld`          | —         | String JSON válido para structured data                        |

**Respuesta 200**:

```json
{ "success": true }
```

---

### Media

#### `GET /api/media` [Auth]

Lista los archivos de media con paginación y filtros.

**Query params**:

| Param    | Tipo   | Default      | Descripción                                      |
| -------- | ------ | ------------ | ------------------------------------------------ |
| `folder` | string | —            | Filtrar por carpeta                              |
| `search` | string | —            | Buscar por nombre de archivo                     |
| `page`   | number | 1            | Página actual                                    |
| `limit`  | number | 20           | Items por página (máx 100)                       |
| `sort`   | string | `created_at` | `"created_at"` \| `"file_name"` \| `"file_size"` |

**Respuesta 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "file_name": "logo.png",
      "file_path": "general/uuid-logo.png",
      "public_url": "https://xxxx.supabase.co/storage/v1/object/public/media/...",
      "mime_type": "image/png",
      "file_size": 45312,
      "alt_text": {},
      "folder": "general",
      "uploaded_by": "user-uuid"
    }
  ],
  "total": 42,
  "page": 1,
  "totalPages": 3
}
```

#### `POST /api/media` [Auth]

Sube un archivo de imagen a Supabase Storage e inserta el registro en la tabla `media`.

**Body**: `multipart/form-data`

| Campo    | Tipo     | Requerido | Descripción                            |
| -------- | -------- | --------- | -------------------------------------- |
| `file`   | `File`   | Sí        | Archivo a subir                        |
| `folder` | `string` | No        | Carpeta destino (default: `"general"`) |

**Tipos MIME permitidos**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`, `image/x-icon`

**Tamaño máximo**: 5 MB

**Respuesta 201**:

```json
{
  "data": {
    "id": "uuid",
    "file_name": "foto.jpg",
    "public_url": "https://..."
  }
}
```

**Errores específicos**:

- `400` si el tipo MIME no está permitido
- `400` si el archivo supera 5 MB
- `500` si falla el upload o el insert (con cleanup automático del archivo si el insert falla)

---

### Leads

#### `GET /api/leads` [Auth]

Lista los leads capturados con paginación y filtros.

**Query params**:

| Param      | Tipo   | Descripción                             |
| ---------- | ------ | --------------------------------------- |
| `page`     | number | Página (default: 1)                     |
| `limit`    | number | Items por página (máx 100, default: 20) |
| `status`   | string | `"all"` \| `"read"` \| `"unread"`       |
| `source`   | string | Filtrar por `source_module`             |
| `search`   | string | Búsqueda en `name` o `email`            |
| `dateFrom` | string | Filtro fecha desde (ISO)                |
| `dateTo`   | string | Filtro fecha hasta (ISO)                |

**Respuesta 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "phone": "+52 55 1234 5678",
      "message": "Me interesa el servicio",
      "source_module": "offer_form",
      "metadata": {},
      "is_read": false,
      "created_at": "2026-04-05T10:00:00.000Z"
    }
  ],
  "total": 127,
  "page": 1,
  "limit": 20,
  "totalPages": 7
}
```

#### `POST /api/leads`

Registra un nuevo lead. **No requiere autenticación** — es llamado desde la landing pública cuando un visitante envía un formulario.

**Body**:

```json
{
  "email": "visitante@ejemplo.com",
  "name": "Ana López",
  "phone": "+52 55 9876 5432",
  "message": "Quiero más información",
  "source_module": "offer_form",
  "metadata": {
    "utm_source": "google",
    "utm_campaign": "verano2026"
  }
}
```

| Campo           | Requerido | Validación                                  |
| --------------- | --------- | ------------------------------------------- |
| `email`         | Sí        | Email válido                                |
| `name`          | No        | Máx 100 chars                               |
| `phone`         | No        | Máx 30 chars                                |
| `message`       | No        | Máx 2000 chars                              |
| `source_module` | Sí        | 1–50 chars (identifica el módulo de origen) |
| `metadata`      | No        | Objeto libre para datos extra (UTMs, etc.)  |

**Respuesta 201**:

```json
{ "success": true }
```

**Rate limit**: 5 req/minuto por IP.

---

### Internacionalización

#### `GET /api/i18n` [Auth]

Lista todos los idiomas configurados, ordenados por `sort_order`.

**Respuesta 200**:

```json
{
  "data": [
    {
      "code": "es",
      "name": "Spanish",
      "native_name": "Español",
      "flag_emoji": "🇪🇸",
      "is_default": true,
      "is_active": true,
      "sort_order": 0
    }
  ]
}
```

#### `POST /api/i18n` [Auth]

Agrega un nuevo idioma al sistema.

**Body**:

```json
{
  "code": "pt",
  "name": "Portuguese",
  "native_name": "Português",
  "flag_emoji": "🇧🇷"
}
```

**Respuesta 201**:

```json
{ "data": { "code": "pt", ... } }
```

**Errores**: `409` si el código de idioma ya existe.

#### `GET /api/i18n/[code]` [Auth]

Obtiene los datos de un idioma por su código.

**Respuesta 200**: Objeto de idioma individual.

#### `PUT /api/i18n/[code]` [Auth]

Actualiza la configuración de un idioma (nombre, estado activo, idioma por defecto).

---

### Integraciones

#### `GET /api/integrations` [Auth]

Lista todas las integraciones configuradas. Las contraseñas SMTP se redactan automáticamente (`"***"`).

**Respuesta 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "google_analytics",
      "config": { "measurement_id": "G-XXXXXXXX" },
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    },
    {
      "id": "uuid",
      "type": "smtp",
      "config": {
        "host": "smtp.gmail.com",
        "port": 587,
        "user": "correo@gmail.com",
        "password": "***"
      },
      "is_active": false
    }
  ]
}
```

**Tipos de integración disponibles**: `google_analytics`, `meta_pixel`, `whatsapp`, `calendly`, `smtp`, `custom_script`.

#### `PUT /api/integrations` [Auth]

Actualiza la configuración de una integración.

**Body**:

```json
{
  "id": "uuid-de-la-integracion",
  "is_active": true,
  "config": {
    "measurement_id": "G-XXXXXXXXXX"
  }
}
```

**Nota sobre SMTP**: Si `config.password === "***"`, el sistema preserva la contraseña existente en la DB (para evitar que el frontend sobrescriba la contraseña al editar otros campos).

**Respuesta 200**:

```json
{ "data": { ... } }
```

**Efecto secundario**: Llama `revalidatePath('/')` para que los scripts se re-inyecten en la landing.

---

### Configuración del sitio

#### `GET /api/settings` [Auth]

Obtiene la configuración global del sitio (`site_config`).

**Respuesta 200**:

```json
{
  "data": {
    "id": "main",
    "site_name": "Mi Empresa",
    "site_description": "Descripción del sitio",
    "favicon_url": "https://...",
    "logo_url": "https://...",
    "logo_dark_url": "https://...",
    "primary_contact_email": "contacto@empresa.com",
    "social_links": {
      "instagram": "https://instagram.com/...",
      "linkedin": "https://linkedin.com/..."
    },
    "custom_css": "",
    "custom_head_scripts": ""
  }
}
```

#### `PUT /api/settings` [Auth]

Actualiza la configuración del sitio. Todos los campos son opcionales.

**Body**:

```json
{
  "site_name": "Mi Empresa Actualizada",
  "site_description": "Nueva descripción",
  "favicon_url": "https://...",
  "logo_url": "https://...",
  "logo_dark_url": "https://...",
  "primary_contact_email": "nuevo@empresa.com",
  "social_links": { "instagram": "https://..." },
  "custom_css": ".hero { ... }",
  "custom_head_scripts": "<script>...</script>"
}
```

**Respuesta 200**:

```json
{ "data": { ... } }
```

#### `GET /api/settings/backup` [Auth]

Descarga un backup completo de toda la configuración del sitio como JSON. Incluye: `site_config`, `theme_config`, `page_modules` (con content), `languages`, `seo_config`, `integrations` (passwords SMTP redactados), `color_palettes` personalizadas.

**Respuesta**: Archivo `orion-backup-YYYY-MM-DD.json`.

#### `POST /api/settings/restore` [Auth]

Restaura la configuración desde un archivo de backup.

**Body**: Mismo formato que el backup exportado.

#### `GET /api/settings/users` [Auth]

Lista los usuarios administradores del sistema.

**Respuesta 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "admin@ejemplo.com",
      "created_at": "...",
      "last_sign_in_at": "..."
    }
  ]
}
```

#### `POST /api/settings/users` [Auth]

Crea un nuevo usuario administrador.

**Body**:

```json
{
  "email": "nuevo-admin@ejemplo.com",
  "password": "ContraseñaSegura123!"
}
```

**Respuesta 201**:

```json
{ "data": { "id": "uuid", "email": "...", ... } }
```

#### `PUT /api/settings/users/[id]` [Auth]

Cambia la contraseña de un usuario. Si `id` es el propio usuario autenticado, usa `supabase.auth.updateUser()`; si es otro usuario, usa el cliente admin.

**Body**:

```json
{ "password": "NuevaContraseña123!" }
```

**Respuesta 200**:

```json
{ "success": true }
```

#### `DELETE /api/settings/users/[id]` [Auth]

Elimina un usuario administrador.

**Restricciones**:

- No se puede eliminar a sí mismo (`400`)
- No se puede eliminar el último usuario admin (`400`)

**Respuesta 200**:

```json
{ "success": true }
```

---

### Dashboard admin

#### `GET /api/admin/stats` [Auth]

Obtiene las métricas del dashboard principal. Ejecuta 6 queries en paralelo para minimizar latencia.

**Respuesta 200**:

```json
{
  "leadsThisWeek": 24,
  "leadsPrevWeek": 18,
  "activeModules": 15,
  "languages": [{ "code": "es", "name": "Spanish", "native_name": "Español", "flag_emoji": "🇪🇸" }],
  "lastEdit": "2026-04-05T10:30:00.000Z",
  "recentLeads": [
    {
      "id": "uuid",
      "name": "María López",
      "email": "maria@ejemplo.com",
      "created_at": "...",
      "is_read": false
    }
  ]
}
```

| Campo           | Descripción                                             |
| --------------- | ------------------------------------------------------- |
| `leadsThisWeek` | Leads capturados esta semana (lunes 00:00 → ahora)      |
| `leadsPrevWeek` | Leads de la semana anterior (para calcular variación %) |
| `activeModules` | Módulos con `is_visible: true`                          |
| `languages`     | Idiomas activos configurados                            |
| `lastEdit`      | Timestamp de la última edición de cualquier módulo      |
| `recentLeads`   | Los 5 leads más recientes                               |
