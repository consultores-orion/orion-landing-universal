# Modelo de Seguridad — Orion Landing Universal

**Versión**: 1.0.0  
**Fecha**: 2026-04-04  
**Autor**: Luis Enrique Gutiérrez Campos  
**Clasificación**: Documento técnico de seguridad

---

## 1. Modelo de Autenticación

### 1.1 Proveedor de Autenticación

El sistema utiliza **Supabase Auth** como proveedor único de autenticación. Se emplea el método de **email y contraseña** para el acceso al panel de administración.

| Aspecto                      | Configuración                                    |
| ---------------------------- | ------------------------------------------------ |
| **Proveedor**                | Supabase Auth (GoTrue)                           |
| **Método**                   | Email + contraseña                               |
| **Sesiones**                 | JWT con refresh token                            |
| **Duración del token**       | Access token: 1 hora / Refresh token: 7 días     |
| **Almacenamiento del token** | Cookie `httpOnly` gestionada por `@supabase/ssr` |
| **MFA**                      | No en v1.0 — planificado para v2.0               |

### 1.2 Flujo de Autenticación

```
Usuario                  Navegador              Next.js Server           Supabase Auth
  │                         │                        │                       │
  │  Ingresa credenciales   │                        │                       │
  │ ───────────────────────>│                        │                       │
  │                         │  POST /api/auth/login  │                       │
  │                         │ ──────────────────────>│                       │
  │                         │                        │  signInWithPassword() │
  │                         │                        │ ─────────────────────>│
  │                         │                        │                       │
  │                         │                        │  ← JWT + Refresh      │
  │                         │                        │ <─────────────────────│
  │                         │                        │                       │
  │                         │  Set-Cookie: httpOnly  │                       │
  │                         │  (access + refresh)    │                       │
  │                         │ <──────────────────────│                       │
  │                         │                        │                       │
  │  ← Redirect /admin      │                        │                       │
  │ <───────────────────────│                        │                       │
```

### 1.3 Gestión de Sesiones

La gestión de sesiones sigue el patrón recomendado por Supabase para Next.js 15 con `@supabase/ssr`:

- **Access token**: Se almacena en una cookie `httpOnly` con flag `Secure` y `SameSite=Lax`
- **Refresh token**: Cookie separada `httpOnly` para renovación automática
- **Renovación automática**: El middleware de Next.js verifica el token en cada request a `/admin/*`. Si está expirado pero el refresh token es válido, se renueva transparentemente
- **Cierre de sesión**: `signOut()` invalida ambos tokens y limpia las cookies

### 1.4 Creación del Usuario Administrador

El usuario administrador se crea durante el wizard de configuración inicial (`/setup`):

1. El wizard solicita email y contraseña
2. La API route `/api/setup` usa el `service_role` key para crear el usuario vía `supabase.auth.admin.createUser()`
3. No se permite registro público — `signup` está deshabilitado en la configuración de Supabase Auth
4. Para agregar administradores adicionales, se hace desde el admin panel o directamente desde el dashboard de Supabase

---

## 2. Row Level Security (RLS)

### 2.1 Principio General

**Todas las tablas tienen RLS habilitado.** La estrategia general es:

| Tabla            | Lectura Pública          | Escritura Autenticada | Notas                                                      |
| ---------------- | ------------------------ | --------------------- | ---------------------------------------------------------- |
| `site_config`    | Sí                       | Sí                    | El sitio público necesita la configuración para renderizar |
| `languages`      | Sí                       | Sí                    | El selector de idioma es público                           |
| `page_modules`   | Solo `is_visible = true` | Sí                    | Admin ve todos; público solo los visibles                  |
| `module_schemas` | Sí                       | Sí                    | Los schemas se usan para renderizado                       |
| `leads`          | Solo INSERT              | Lectura + gestión     | Visitantes pueden crear leads; solo admin los lee          |
| `media`          | Sí                       | Sí                    | Las imágenes se muestran públicamente                      |
| `theme_config`   | Sí                       | Sí                    | El tema se aplica al sitio público                         |
| `color_palettes` | Sí                       | Solo no predefinidas  | Las paletas predefinidas son inmutables                    |
| `integrations`   | No                       | Sí                    | Contienen credenciales sensibles                           |
| `seo_config`     | Sí                       | Sí                    | Los meta tags se renderizan en el HTML público             |

### 2.2 Patrón de Políticas

Cada tabla sigue uno de estos patrones:

**Patrón A: Lectura pública, escritura autenticada** (site_config, languages, module_schemas, media, theme_config, seo_config):

```sql
CREATE POLICY "{table}_public_read" ON {table}
    FOR SELECT USING (true);

CREATE POLICY "{table}_admin_write" ON {table}
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

**Patrón B: Lectura pública condicional** (page_modules):

```sql
-- Público: solo módulos visibles
CREATE POLICY "page_modules_public_read" ON page_modules
    FOR SELECT USING (is_visible = true);

-- Admin: ve todo
CREATE POLICY "page_modules_admin_read_all" ON page_modules
    FOR SELECT USING (auth.role() = 'authenticated');
```

**Patrón C: Solo escritura pública** (leads):

```sql
-- Cualquier visitante puede crear un lead
CREATE POLICY "leads_public_insert" ON leads
    FOR INSERT WITH CHECK (true);

-- Solo admin puede leer leads
CREATE POLICY "leads_admin_read" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');
```

**Patrón D: Sin acceso público** (integrations):

```sql
-- Solo admin (las credenciales nunca se exponen al público)
CREATE POLICY "integrations_admin_only" ON integrations
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

### 2.3 Protección de Paletas Predefinidas

Las 20 paletas predefinidas no pueden ser modificadas ni eliminadas por el usuario:

```sql
CREATE POLICY "color_palettes_admin_update" ON color_palettes
    FOR UPDATE
    USING (auth.role() = 'authenticated' AND is_predefined = false);

CREATE POLICY "color_palettes_admin_delete" ON color_palettes
    FOR DELETE
    USING (auth.role() = 'authenticated' AND is_predefined = false);
```

### 2.4 Protección de Módulos de Sistema

Los módulos marcados como `is_system = true` (ej: footer) no pueden ser eliminados:

```sql
CREATE POLICY "page_modules_admin_delete" ON page_modules
    FOR DELETE
    USING (auth.role() = 'authenticated' AND is_system = false);
```

---

## 3. Operaciones Server-Side

### 3.1 Dos Clientes de Supabase

El sistema mantiene dos clientes de Supabase claramente separados:

| Cliente            | Archivo                      | Key Utilizada                   | Contexto                                      |
| ------------------ | ---------------------------- | ------------------------------- | --------------------------------------------- |
| **Browser Client** | `src/lib/supabase/client.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Componentes del lado del cliente              |
| **Server Client**  | `src/lib/supabase/server.ts` | `SUPABASE_SERVICE_ROLE_KEY`     | API Routes, Server Components, Server Actions |

### 3.2 Principio de Mínimo Privilegio

```
┌─────────────────────────────────────────────────────────┐
│                    Navegador (Cliente)                    │
│                                                          │
│  anon key → RLS se aplica → solo datos permitidos       │
│  Acceso limitado por las políticas de cada tabla         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 API Routes (Servidor)                     │
│                                                          │
│  service_role key → RLS se bypasea → acceso total       │
│  Validación manual obligatoria antes de cada operación   │
│                                                          │
│  NUNCA se expone en:                                     │
│  - NEXT_PUBLIC_* variables                               │
│  - Client Components                                     │
│  - Respuestas de API                                     │
│  - Código fuente del frontend                            │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Operaciones que Requieren Service Role

Las siguientes operaciones solo se ejecutan desde API Routes con `service_role` key:

| Operación                                    | API Route                   | Razón                                           |
| -------------------------------------------- | --------------------------- | ----------------------------------------------- |
| Crear usuario admin                          | `POST /api/setup`           | `auth.admin.createUser()` requiere service_role |
| Cifrar/descifrar credenciales de integración | `CRUD /api/integrations`    | Los datos sensibles se cifran server-side       |
| Enviar notificaciones por email (SMTP)       | `POST /api/leads` (trigger) | Las credenciales SMTP están cifradas            |
| Eliminar archivos de Storage                 | `DELETE /api/media`         | Requiere service_role para eliminar del bucket  |
| Operaciones masivas                          | `POST /api/setup` (seed)    | Inserción masiva de módulos y paletas           |

---

## 4. Middleware de Autenticación

### 4.1 Implementación

El middleware de Next.js 15 intercepta todas las requests antes de que lleguen a las rutas:

```typescript
// src/middleware.ts — Estructura conceptual
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Gestión de cookies para SSR
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 1. Verificar si el setup está completado
  if (!setupCompleted && !request.nextUrl.pathname.startsWith('/setup')) {
    return NextResponse.redirect(new URL('/setup', request.url))
  }

  // 2. Proteger rutas /admin/*
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // 3. Evitar acceso a /setup si ya está configurado
  if (setupCompleted && request.nextUrl.pathname.startsWith('/setup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/setup', '/'],
}
```

### 4.2 Flujo de Decisión del Middleware

```
Request entrante
      │
      ▼
¿Setup completado?
      │
  No ──┤──── Sí
      │         │
      ▼         ▼
¿Es /setup? ──→ ¿Es ruta /admin/*?
      │              │
  No ──┤          Sí ──┤──── No
      │              │         │
      ▼              ▼         ▼
Redirect         ¿Tiene       Continuar
a /setup         sesión?      (página pública)
                    │
                Sí ──┤──── No
                    │         │
                    ▼         ▼
                Continuar   Redirect
                (admin)     a /admin/login
```

---

## 5. Validación de Entrada

### 5.1 Esquemas Zod en API Routes

Toda entrada de usuario se valida con Zod antes de procesarse. Los esquemas están centralizados en `src/lib/validations/`.

```typescript
// src/lib/validations/content.ts — Ejemplo
import { z } from 'zod'

export const updateModuleContentSchema = z.object({
  module_id: z.string().uuid(),
  language: z.string().min(2).max(10),
  content: z.record(z.string(), z.unknown()).refine((data) => Object.keys(data).length > 0, {
    message: 'El contenido no puede estar vacío',
  }),
})

export const createLeadSchema = z.object({
  name: z.string().max(255).optional(),
  email: z.string().email('Email no válido'),
  phone: z.string().max(50).optional(),
  message: z.string().max(5000).optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  source_module: z.string().max(50).default('offer_form'),
})
```

### 5.2 Patrón de Validación en API Routes

```typescript
// Patrón obligatorio en cada API route
export async function POST(request: NextRequest) {
  try {
    // 1. Parsear body
    const body = await request.json()

    // 2. Validar con Zod (lanza ZodError si falla)
    const validated = createLeadSchema.parse(body)

    // 3. Sanitizar contenido (ver sección 6)
    const sanitized = sanitize(validated)

    // 4. Ejecutar operación
    const { error } = await supabase.from('leads').insert(sanitized)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada no válidos', details: error.issues },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
```

### 5.3 Validación en Capas

| Capa              | Tipo de Validación                            | Propósito                                |
| ----------------- | --------------------------------------------- | ---------------------------------------- |
| **Cliente**       | Validación de formulario (HTML5 + Zod client) | UX inmediata, no es barrera de seguridad |
| **API Route**     | Zod schema (server-side)                      | Barrera de seguridad real                |
| **Base de datos** | Constraints SQL (NOT NULL, CHECK, UNIQUE)     | Última línea de defensa                  |

---

## 6. Protección contra XSS

### 6.1 Estrategia de Sanitización

El contenido editable por el usuario (textos de módulos, mensajes de leads) puede contener intentos de inyección XSS. La estrategia es:

1. **Sanitización en entrada**: Todo contenido que pase por API routes se sanitiza antes de almacenarse en la base de datos
2. **Escapado en renderizado**: React escapa automáticamente el contenido en JSX (`{variable}` se escapa por defecto)
3. **`dangerouslySetInnerHTML` prohibido**: Solo se permite en contextos controlados (como el campo `custom_head_scripts` de `site_config`, que solo el admin puede editar)

### 6.2 Librería de Sanitización

Se utiliza `isomorphic-dompurify` para sanitizar HTML en campos richtext:

```typescript
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h2', 'h3', 'h4'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

export function sanitizePlainText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}
```

### 6.3 Campos con Riesgo Especial

| Campo                 | Tabla          | Riesgo                               | Mitigación                                      |
| --------------------- | -------------- | ------------------------------------ | ----------------------------------------------- |
| `content` (richtext)  | `page_modules` | Alto — HTML inyectado                | Sanitizar con allowlist de tags                 |
| `message`             | `leads`        | Medio — texto enviado por visitantes | Sanitizar a texto plano                         |
| `custom_css`          | `site_config`  | Alto — CSS injection                 | Solo admin puede editarlo; validar sintaxis     |
| `custom_head_scripts` | `site_config`  | Crítico — JS arbitrario              | Solo admin; advertencia explícita en UI         |
| `structured_data`     | `seo_config`   | Medio — JSON-LD                      | Validar como JSON válido; no ejecutar como HTML |

---

## 7. CORS y Headers de Seguridad

### 7.1 Headers de Seguridad

Configurados en `next.config.ts`:

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
  {
    key: 'Content-Security-Policy',
    value: buildCSP(),
  },
]
```

### 7.2 Content Security Policy (CSP)

La CSP se construye dinámicamente para incluir los dominios de Supabase y servicios de terceros activos:

```typescript
function buildCSP(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://calendly.com https://www.youtube.com https://www.google.com/maps",
    "base-uri 'self'",
    "form-action 'self'",
  ]
  return directives.join('; ')
}
```

> **Nota**: `'unsafe-inline'` en `script-src` es necesario para Google Tag Manager y Meta Pixel. En una versión futura, se implementará nonce-based CSP para eliminar esta excepción.

### 7.3 CORS

Las API Routes de Next.js 15 no necesitan configuración CORS adicional cuando el frontend y el backend están en el mismo origen (que es el caso estándar). Si se despliega con un dominio diferente para la API, se configurará CORS explícitamente:

```typescript
// Solo necesario si la API está en un dominio diferente
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
```

---

## 8. Rate Limiting

### 8.1 Estrategia

El rate limiting protege contra abuso de la API, especialmente en endpoints públicos como la captura de leads.

| Endpoint                   | Límite       | Ventana    | Justificación                    |
| -------------------------- | ------------ | ---------- | -------------------------------- |
| `POST /api/leads`          | 5 requests   | 1 minuto   | Prevenir spam de formularios     |
| `POST /api/auth/login`     | 5 intentos   | 15 minutos | Prevenir fuerza bruta            |
| `POST /api/media`          | 10 uploads   | 1 minuto   | Prevenir abuso de almacenamiento |
| `GET /api/*` (autenticado) | 100 requests | 1 minuto   | Uso normal del admin panel       |

### 8.2 Implementación

Se utiliza `upstash/ratelimit` con almacenamiento en memoria (para Vercel) o Redis (para Docker):

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limiter para endpoints públicos
const publicLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: 'ratelimit:public',
})

// Rate limiter para login
const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
})
```

### 8.3 Respuesta ante Límite Alcanzado

```typescript
const { success, limit, remaining, reset } = await publicLimiter.limit(ip)

if (!success) {
  return NextResponse.json(
    { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    },
  )
}
```

### 8.4 Alternativa sin Redis

Para despliegues Docker sin Redis disponible, se utiliza un rate limiter en memoria:

```typescript
// Fallback simple basado en Map (se reinicia con cada redeploy)
const ipRequestMap = new Map<string, { count: number; resetAt: number }>()
```

> **Limitación**: Este enfoque no funciona con múltiples instancias de Next.js (horizontally scaled). Para producción con múltiples instancias, Redis es obligatorio.

---

## 9. Seguridad de Storage

### 9.1 Buckets de Supabase Storage

| Bucket    | Lectura | Escritura         | Propósito                         |
| --------- | ------- | ----------------- | --------------------------------- |
| `media`   | Pública | Solo autenticados | Imágenes del sitio, fondos, logos |
| `avatars` | Pública | Solo autenticados | Fotos de perfil de admin          |

### 9.2 Políticas de Bucket

```sql
-- Bucket: media
-- Lectura pública (las imágenes se muestran en la landing)
CREATE POLICY "media_public_read" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'media');

-- Upload solo para usuarios autenticados
CREATE POLICY "media_auth_insert" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'media'
        AND auth.role() = 'authenticated'
    );

-- Eliminación solo para usuarios autenticados
CREATE POLICY "media_auth_delete" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'media'
        AND auth.role() = 'authenticated'
    );
```

### 9.3 Validación de Archivos

Antes de subir un archivo al storage, la API route valida:

| Validación      | Criterio                                                                   | Acción si falla           |
| --------------- | -------------------------------------------------------------------------- | ------------------------- |
| **Tipo MIME**   | Solo `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `image/gif` | Rechazar con 400          |
| **Tamaño**      | Máximo 5 MB por archivo                                                    | Rechazar con 413          |
| **Nombre**      | Sanitizar caracteres especiales, limitar longitud                          | Renombrar automáticamente |
| **Extensión**   | Debe coincidir con el tipo MIME declarado                                  | Rechazar con 400          |
| **Magic bytes** | Verificar los primeros bytes del archivo para confirmar el tipo real       | Rechazar con 400          |

```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
] as const

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
```

### 9.4 Transformaciones de Imagen

Supabase Storage Pro permite transformaciones on-the-fly (resize, format conversion). Se utilizan para:

- Generar thumbnails para la biblioteca de medios del admin
- Servir imágenes en formato WebP cuando el navegador lo soporta
- Redimensionar imágenes grandes automáticamente

---

## 10. Gestión de Secretos

### 10.1 Variables de Entorno

| Variable                        | Exposición          | Propósito                                       |
| ------------------------------- | ------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Pública (navegador) | URL del proyecto Supabase                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública (navegador) | Clave anónima (limitada por RLS)                |
| `SUPABASE_SERVICE_ROLE_KEY`     | Solo servidor       | Clave con acceso total (bypass RLS)             |
| `UPSTASH_REDIS_REST_URL`        | Solo servidor       | URL de Redis para rate limiting                 |
| `UPSTASH_REDIS_REST_TOKEN`      | Solo servidor       | Token de Redis                                  |
| `ENCRYPTION_KEY`                | Solo servidor       | Clave para cifrar credenciales de integraciones |

### 10.2 Reglas de Gestión

1. **`.env.local`** se usa en desarrollo y NUNCA se sube al repositorio
2. **`.env.example`** se incluye en el repositorio con placeholders descriptivos
3. **Variables `NEXT_PUBLIC_*`** se embeben en el bundle del cliente — solo incluir lo estrictamente necesario
4. **Variables sin prefijo** solo están disponibles en el servidor — aquí van todas las claves sensibles
5. **En producción (Vercel/Netlify)**: Las variables se configuran en el dashboard de la plataforma
6. **En producción (Docker)**: Se pasan como variables de entorno al contenedor o se usa Docker Secrets

### 10.3 `.env.example`

```env
# Supabase — Obligatorias
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Rate Limiting (opcional — fallback a in-memory si no se configura)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cifrado de credenciales de integraciones
ENCRYPTION_KEY=generate-a-32-byte-random-string-here

# Entorno
NODE_ENV=development
```

### 10.4 Cifrado de Credenciales de Integraciones

Las credenciales de integraciones (contraseñas SMTP, API keys) se cifran antes de almacenarse en la tabla `integrations`:

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedText] = encrypted.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

---

## 11. Checklist de Seguridad para Deployment

Antes de desplegar a producción, verificar:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` NO tiene prefijo `NEXT_PUBLIC_`
- [ ] `.env.local` está en `.gitignore`
- [ ] RLS está habilitado en TODAS las tablas
- [ ] El registro de usuarios (`signup`) está deshabilitado en Supabase Auth
- [ ] Las políticas RLS están probadas con `anon` key y `authenticated` role
- [ ] Los headers de seguridad están configurados en `next.config.ts`
- [ ] El rate limiting está activo en endpoints públicos
- [ ] Las credenciales de integraciones están cifradas
- [ ] Los uploads de archivos validan tipo MIME y tamaño
- [ ] La CSP incluye solo los dominios necesarios
- [ ] El campo `custom_head_scripts` tiene advertencia visible en el admin
- [ ] Las cookies de sesión tienen flags `httpOnly`, `Secure` y `SameSite`
- [ ] No hay `console.log` con datos sensibles en producción
