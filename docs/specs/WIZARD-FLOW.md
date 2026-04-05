# WIZARD-FLOW.md — Especificacion del Wizard de Configuracion Inicial

> **Version**: 1.0.0  
> **Fecha**: 2026-04-04  
> **Estado**: Especificacion definitiva  
> **Audiencia**: Desarrolladores, Claude Code, contribuidores open-source

---

## 1. Flujo General

El wizard de configuracion inicial es la primera experiencia del usuario con Orion Landing Universal. Su objetivo es guiar al usuario desde una instalacion limpia hasta una landing page funcional sin necesidad de tocar codigo ni consola.

### Resumen del Flujo

```
Instalacion limpia
       |
       v
Deteccion de primera ejecucion
       |
       +-- Variables de entorno existen? --NO--> Paso 1: Conexion a Supabase + DB URL
       |                                           |
       +-- SI                                      v
       |                                    Paso 2: Crear tablas
       v                                           |
  Tablas existen en DB?                            v
       |                                    Paso 3: Datos iniciales (seed)
       +-- NO --> Paso 2                           |
       |                                           v
       +-- SI                                Paso 4: Crear cuenta admin
       |                                           |
       v                                           v
  Existe usuario admin?                      Paso 5: Finalizacion
       |                                           |
       +-- NO --> Paso 4                           v
       |                                    Redireccion a landing / admin
       +-- SI --> Redireccion a landing page (normal operation)
```

### Rutas del Wizard

| Ruta              | Proposito                  |
| ----------------- | -------------------------- |
| `/setup`          | Ruta principal del wizard  |
| `/setup/connect`  | Paso 1: Conexion Supabase  |
| `/setup/tables`   | Paso 2: Creacion de tablas |
| `/setup/seed`     | Paso 3: Datos iniciales    |
| `/setup/admin`    | Paso 4: Crear cuenta admin |
| `/setup/complete` | Paso 5: Finalizacion       |

### Layout del Wizard

- Barra de progreso superior con los 5 pasos numerados
- Paso actual resaltado, pasos completados con checkmark
- Logo de Orion Landing en la parte superior
- Contenido centrado, maximo 600px de ancho
- Fondo con gradiente sutil usando colores del tema por defecto
- Boton "Siguiente" prominente, boton "Atras" secundario
- Indicador de estado (exito, error, cargando) en cada paso

---

## 2. Deteccion de Primera Ejecucion

### 2.1 Middleware de Deteccion

Se implementa como un middleware de Next.js que intercepta TODAS las rutas y determina el estado de la instalacion.

```typescript
// src/middleware.ts

import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas que siempre se permiten (assets, API del wizard, favicon)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/setup') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next()
  }

  // Verificar estado de instalacion
  const setupState = await getSetupState()

  // Si el wizard no esta completo y el usuario no esta en /setup
  if (!setupState.isComplete && !pathname.startsWith('/setup')) {
    const redirectStep = getRedirectStep(setupState)
    return NextResponse.redirect(new URL(redirectStep, request.url))
  }

  // Si el wizard esta completo y el usuario intenta acceder a /setup
  if (setupState.isComplete && pathname.startsWith('/setup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}
```

### 2.2 Estados de Instalacion

```typescript
interface SetupState {
  /** Fase 1: Variables de entorno configuradas */
  hasEnvVars: boolean

  /** Fase 2: Tablas creadas en la base de datos */
  hasDatabase: boolean

  /** Fase 3: Datos iniciales insertados */
  hasSeedData: boolean

  /** Fase 4: Al menos un usuario admin existe */
  hasAdminUser: boolean

  /** Resumen: toda la configuracion esta completa */
  isComplete: boolean
}
```

### 2.3 Logica de Deteccion

```typescript
async function getSetupState(): Promise<SetupState> {
  // Fase 1: Verificar variables de entorno
  const hasEnvVars = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (!hasEnvVars) {
    return {
      hasEnvVars: false,
      hasDatabase: false,
      hasSeedData: false,
      hasAdminUser: false,
      isComplete: false,
    }
  }

  // Fase 2: Verificar si las tablas existen
  // Intenta consultar la tabla site_config como indicador
  let hasDatabase = false
  try {
    const { error } = await supabaseAdmin.from('site_config').select('id').limit(1)
    hasDatabase = !error
  } catch {
    hasDatabase = false
  }

  if (!hasDatabase) {
    return {
      hasEnvVars,
      hasDatabase: false,
      hasSeedData: false,
      hasAdminUser: false,
      isComplete: false,
    }
  }

  // Fase 3: Verificar datos iniciales
  let hasSeedData = false
  try {
    const { data } = await supabaseAdmin.from('site_config').select('id').limit(1)
    hasSeedData = !!data && data.length > 0
  } catch {
    hasSeedData = false
  }

  if (!hasSeedData) {
    return { hasEnvVars, hasDatabase, hasSeedData: false, hasAdminUser: false, isComplete: false }
  }

  // Fase 4: Verificar si existe al menos un usuario admin
  let hasAdminUser = false
  try {
    const { data } = await supabaseAdmin.auth.admin.listUsers()
    hasAdminUser = !!data?.users && data.users.length > 0
  } catch {
    hasAdminUser = false
  }

  return {
    hasEnvVars,
    hasDatabase,
    hasSeedData,
    hasAdminUser,
    isComplete: hasEnvVars && hasDatabase && hasSeedData && hasAdminUser,
  }
}

function getRedirectStep(state: SetupState): string {
  if (!state.hasEnvVars) return '/setup/connect'
  if (!state.hasDatabase) return '/setup/tables'
  if (!state.hasSeedData) return '/setup/seed'
  if (!state.hasAdminUser) return '/setup/admin'
  return '/'
}
```

---

## 3. Paso 1 — Conexion a Supabase (`/setup/connect`)

### 3.1 Interfaz de Usuario

**Titulo**: "Conecta tu Proyecto Supabase"
**Descripcion**: "Necesitamos las credenciales de tu proyecto Supabase para almacenar el contenido de tu landing page."

**Campos del formulario**:

| Campo                | Tipo                   | Placeholder                                  | Requerido | Validacion                                   |
| -------------------- | ---------------------- | -------------------------------------------- | :-------: | -------------------------------------------- |
| Supabase Project URL | text                   | `https://xxxxx.supabase.co`                  |    Si     | Formato URL, debe terminar en `.supabase.co` |
| Anon Key             | text (password toggle) | `eyJhbGciOi...`                              |    Si     | Formato JWT valido                           |
| Service Role Key     | text (password toggle) | `eyJhbGciOi...`                              |    Si     | Formato JWT valido                           |
| Database URL         | text (password toggle) | `postgresql://postgres.[ref]:[password]@...` |    Si     | Formato URI PostgreSQL valido                |

> **Nota sobre Database URL**: Se encuentra en el dashboard de Supabase: **Settings > Database > Connection String > URI**. Para entornos serverless (Vercel, Netlify), usar la **Transaction Pooler URL** (puerto 6543). Para entornos con conexion persistente (Docker, VPS), usar la conexion directa (puerto 5432). Esta URL es necesaria para ejecutar operaciones DDL (CREATE TABLE) en el Paso 2, ya que PostgREST/supabase-js NO soportan DDL.

**Botones**:

- "Probar Conexion" — Valida las credenciales antes de continuar
- "Siguiente" — Solo habilitado si la conexion fue exitosa

**Elementos de ayuda**:

- Link a documentacion: "Como crear un proyecto Supabase"
- Indicador visual: donde encontrar las keys en el dashboard de Supabase (screenshot/diagram)
- Tooltip explicando la diferencia entre Anon Key y Service Role Key

### 3.2 Validacion del Lado del Servidor

```typescript
// src/app/api/setup/connect/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  const { supabaseUrl, anonKey, serviceRoleKey, databaseUrl } = await request.json()

  // 1. Validar formato de inputs
  if (!supabaseUrl?.match(/^https:\/\/[a-z0-9]+\.supabase\.co$/)) {
    return NextResponse.json(
      { error: 'URL de Supabase invalida. Debe ser https://[proyecto].supabase.co' },
      { status: 400 },
    )
  }

  if (!anonKey?.startsWith('eyJ') || !serviceRoleKey?.startsWith('eyJ')) {
    return NextResponse.json({ error: 'Las keys deben ser tokens JWT validos.' }, { status: 400 })
  }

  if (!databaseUrl?.startsWith('postgresql://')) {
    return NextResponse.json(
      { error: 'Database URL invalida. Debe comenzar con postgresql://' },
      { status: 400 },
    )
  }

  // 2. Probar conexion con Anon Key
  try {
    const supabaseAnon = createClient(supabaseUrl, anonKey)
    // Simplemente verificar que la conexion funciona
    const { error: anonError } = await supabaseAnon.auth.getSession()
    if (anonError && anonError.message !== 'Auth session missing!') {
      return NextResponse.json(
        { error: `Error con Anon Key: ${anonError.message}` },
        { status: 400 },
      )
    }
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo conectar con el Anon Key proporcionado.' },
      { status: 400 },
    )
  }

  // 3. Probar conexion con Service Role Key
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error: adminError } = await supabaseAdmin.auth.admin.listUsers()
    if (adminError) {
      return NextResponse.json(
        { error: `Error con Service Role Key: ${adminError.message}` },
        { status: 400 },
      )
    }
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo conectar con el Service Role Key. Verifica que sea la key correcta.' },
      { status: 400 },
    )
  }

  // 4. Detectar entorno y guardar credenciales
  const isPaaS = !!(process.env.VERCEL || process.env.NETLIFY)

  if (isPaaS) {
    // En PaaS (Vercel/Netlify), NO se puede escribir .env.local.
    // Las variables ya deben estar configuradas en el dashboard de la plataforma.
    // Solo validamos que las credenciales funcionan y las almacenamos en memoria
    // para los pasos siguientes del wizard en esta sesion.
    return NextResponse.json({
      success: true,
      message:
        'Conexion exitosa. En entornos PaaS las variables de entorno se configuran desde el dashboard de la plataforma.',
      environment: 'paas',
      paasNote:
        'Asegurate de configurar NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY y DATABASE_URL en las variables de entorno de tu plataforma de hosting.',
    })
  }

  // En desarrollo local / Docker / VPS: escribir .env.local
  const envPath = join(process.cwd(), '.env.local')
  const envContent = [
    `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
    `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`,
    `DATABASE_URL=${databaseUrl}`,
  ].join('\n')

  try {
    // Si ya existe .env.local, preservar otras variables
    let existingEnv = ''
    if (existsSync(envPath)) {
      existingEnv = readFileSync(envPath, 'utf-8')
      // Remover las variables de Supabase existentes
      existingEnv = existingEnv
        .split('\n')
        .filter(
          (line) =>
            !line.startsWith('NEXT_PUBLIC_SUPABASE_URL') &&
            !line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY') &&
            !line.startsWith('SUPABASE_SERVICE_ROLE_KEY') &&
            !line.startsWith('DATABASE_URL'),
        )
        .join('\n')
    }

    const finalContent = existingEnv
      ? `${existingEnv.trim()}\n\n# Supabase Configuration\n${envContent}\n`
      : `# Supabase Configuration\n${envContent}\n`

    writeFileSync(envPath, finalContent, 'utf-8')
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo escribir el archivo .env.local. Verifica los permisos del sistema.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Conexion exitosa. Credenciales guardadas en .env.local.',
    environment: 'local',
  })
}
```

### 3.3 Notas de Seguridad

- El **Service Role Key** y el **Database URL** NUNCA se exponen al cliente. Solo se usan en rutas API del servidor.
- El `.env.local` no se commitea al repositorio (ya esta en `.gitignore`).
- La API de escritura de `.env.local` solo esta disponible cuando el wizard no esta completo (el middleware bloquea `/api/setup/*` despues de completar).
- En entornos Docker/Vercel, las variables se inyectan como environment variables. El wizard detecta si ya estan presentes y salta al paso correspondiente.

### 3.4 Deteccion de Entorno y Escritura de `.env.local`

La escritura de `.env.local` **solo funciona en entornos con sistema de archivos persistente** (desarrollo local, Docker, VPS). En plataformas PaaS (Vercel, Netlify, Railway):

| Entorno          | Escritura de `.env.local` | Donde se configuran las variables                 |
| ---------------- | :-----------------------: | ------------------------------------------------- |
| Desarrollo local |            Si             | Archivo `.env.local` (escrito por el wizard)      |
| Docker / VPS     |            Si             | `docker-compose.yml` o `.env.local`               |
| Vercel           |            No             | Dashboard > Settings > Environment Variables      |
| Netlify          |            No             | Dashboard > Site settings > Environment variables |
| Railway          |            No             | Dashboard > Variables                             |

El wizard detecta automaticamente el entorno con `process.env.VERCEL` y `process.env.NETLIFY`. Si detecta un PaaS, muestra instrucciones para configurar las variables en el dashboard de la plataforma en lugar de intentar escribir `.env.local`.

---

## 4. Paso 2 — Creacion de Tablas (`/setup/tables`)

### 4.1 Interfaz de Usuario

**Titulo**: "Creando tu Base de Datos"
**Descripcion**: "Vamos a crear las tablas necesarias en tu proyecto Supabase."

**Elementos visuales**:

- Lista de tablas a crear, cada una con:
  - Nombre de la tabla
  - Icono de estado: pendiente (circulo gris), en progreso (spinner), completado (checkmark verde), error (X roja)
  - Descripcion breve de para que sirve
- Barra de progreso general
- Boton "Crear Tablas" prominente
- Boton "Reintentar" si alguna falla

### 4.2 Lista de Tablas

| #   | Tabla            | Descripcion                                      | Dependencias     |
| --- | ---------------- | ------------------------------------------------ | ---------------- |
| 1   | `site_config`    | Configuracion global del sitio                   | Ninguna          |
| 2   | `languages`      | Registro de idiomas activos                      | Ninguna          |
| 3   | `color_palettes` | Paletas de colores predefinidas y personalizadas | Ninguna          |
| 4   | `theme_config`   | Configuracion del tema activo                    | `color_palettes` |
| 5   | `module_schemas` | Esquemas de los modulos                          | Ninguna          |
| 6   | `page_modules`   | Contenido, estilos y orden de los modulos        | Ninguna          |
| 7   | `leads`          | Leads capturados por formularios                 | Ninguna          |
| 8   | `media`          | Biblioteca de medios                             | Ninguna          |
| 9   | `integrations`   | Configuracion de integraciones de terceros       | Ninguna          |
| 10  | `seo_config`     | Configuracion SEO por idioma                     | Ninguna          |

### 4.3 SQL de Migracion Completo

```typescript
// src/lib/setup/migrations.ts

export const MIGRATION_TABLES = [
  {
    name: 'site_config',
    description: 'Configuracion global del sitio',
    sql: `
      CREATE TABLE IF NOT EXISTS site_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_name TEXT NOT NULL DEFAULT 'Mi Landing Page',
        site_description JSONB NOT NULL DEFAULT '{}',
        contact_email TEXT,
        logo_url TEXT,
        favicon_url TEXT,
        social_links JSONB NOT NULL DEFAULT '[]',
        default_language TEXT NOT NULL DEFAULT 'es',
        analytics_enabled BOOLEAN NOT NULL DEFAULT false,
        maintenance_mode BOOLEAN NOT NULL DEFAULT false,
        custom_head_scripts TEXT,
        custom_body_scripts TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  },
  {
    name: 'languages',
    description: 'Registro de idiomas activos',
    sql: `
      CREATE TABLE IF NOT EXISTS languages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        native_name TEXT NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Solo un idioma puede ser default
      CREATE UNIQUE INDEX IF NOT EXISTS idx_languages_default
        ON languages (is_default) WHERE is_default = true;
    `,
  },
  {
    name: 'color_palettes',
    description: 'Paletas de colores predefinidas y personalizadas',
    sql: `
      CREATE TABLE IF NOT EXISTS color_palettes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        niche TEXT,
        colors JSONB NOT NULL,
        is_predefined BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  },
  {
    name: 'theme_config',
    description: 'Configuracion del tema activo',
    sql: `
      CREATE TABLE IF NOT EXISTS theme_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        active_palette_id UUID REFERENCES color_palettes(id),
        custom_colors JSONB NOT NULL DEFAULT '{}',
        heading_font TEXT NOT NULL DEFAULT 'Poppins',
        body_font TEXT NOT NULL DEFAULT 'Lato',
        spacing_preset TEXT NOT NULL DEFAULT 'comfortable',
        border_radius TEXT NOT NULL DEFAULT 'medium',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  },
  {
    name: 'module_schemas',
    description: 'Esquemas de los modulos (definicion de campos)',
    sql: `
      CREATE TABLE IF NOT EXISTS module_schemas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_key TEXT NOT NULL UNIQUE,
        schema JSONB NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  },
  {
    name: 'page_modules',
    description: 'Contenido, estilos y orden de los modulos',
    sql: `
      CREATE TABLE IF NOT EXISTS page_modules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_key TEXT NOT NULL UNIQUE,
        content JSONB NOT NULL DEFAULT '{}',
        styles JSONB NOT NULL DEFAULT '{}',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_visible BOOLEAN NOT NULL DEFAULT true,
        is_system BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_page_modules_sort ON page_modules (sort_order);
    `,
  },
  {
    name: 'leads',
    description: 'Leads capturados por formularios',
    sql: `
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT,
        source_module TEXT NOT NULL DEFAULT 'offer_form',
        form_data JSONB NOT NULL DEFAULT '{}',
        is_read BOOLEAN NOT NULL DEFAULT false,
        ip_address TEXT,
        user_agent TEXT,
        language TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
      CREATE INDEX IF NOT EXISTS idx_leads_is_read ON leads (is_read);
    `,
  },
  {
    name: 'media',
    description: 'Biblioteca de medios (imagenes, archivos)',
    sql: `
      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        alt_text JSONB NOT NULL DEFAULT '{}',
        folder TEXT NOT NULL DEFAULT 'general',
        uploaded_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_media_folder ON media (folder);
      CREATE INDEX IF NOT EXISTS idx_media_mime ON media (mime_type);
    `,
  },
  {
    name: 'integrations',
    description: 'Configuracion de integraciones de terceros',
    sql: `
      CREATE TABLE IF NOT EXISTS integrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        is_enabled BOOLEAN NOT NULL DEFAULT false,
        config JSONB NOT NULL DEFAULT '{}',
        sensitive_config JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  },
  {
    name: 'seo_config',
    description: 'Configuracion SEO por idioma',
    sql: `
      CREATE TABLE IF NOT EXISTS seo_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        language_code TEXT NOT NULL,
        meta_title TEXT,
        meta_description TEXT,
        og_image_url TEXT,
        canonical_url TEXT,
        robots TEXT NOT NULL DEFAULT 'index, follow',
        json_ld JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(language_code)
      );
    `,
  },
]

// Funciones auxiliares comunes
export const SHARED_FUNCTIONS_SQL = `
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
`

// Triggers para updated_at
export const TRIGGERS_SQL = `
  DO $$
  DECLARE
    tbl TEXT;
  BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
      'site_config', 'theme_config', 'module_schemas',
      'page_modules', 'integrations', 'seo_config'
    ])
    LOOP
      EXECUTE format(
        'CREATE TRIGGER IF NOT EXISTS %I_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
        tbl, tbl
      );
    END LOOP;
  END $$;
`

// RLS (Row Level Security) policies
export const RLS_POLICIES_SQL = `
  -- Habilitar RLS en tablas sensibles
  ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
  ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

  -- Politica: Solo usuarios autenticados pueden leer leads
  CREATE POLICY IF NOT EXISTS "Admin read leads"
    ON leads FOR SELECT
    TO authenticated
    USING (true);

  -- Politica: Solo usuarios autenticados pueden modificar integraciones
  CREATE POLICY IF NOT EXISTS "Admin manage integrations"
    ON integrations FOR ALL
    TO authenticated
    USING (true);

  -- Las demas tablas son publicas de lectura (landing page publica)
  -- y requieren autenticacion para escritura

  ALTER TABLE page_modules ENABLE ROW LEVEL SECURITY;
  CREATE POLICY IF NOT EXISTS "Public read modules"
    ON page_modules FOR SELECT
    TO anon, authenticated
    USING (true);
  CREATE POLICY IF NOT EXISTS "Admin write modules"
    ON page_modules FOR ALL
    TO authenticated
    USING (true);

  ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
  CREATE POLICY IF NOT EXISTS "Public read site_config"
    ON site_config FOR SELECT
    TO anon, authenticated
    USING (true);
  CREATE POLICY IF NOT EXISTS "Admin write site_config"
    ON site_config FOR ALL
    TO authenticated
    USING (true);

  ALTER TABLE color_palettes ENABLE ROW LEVEL SECURITY;
  CREATE POLICY IF NOT EXISTS "Public read palettes"
    ON color_palettes FOR SELECT
    TO anon, authenticated
    USING (true);
  CREATE POLICY IF NOT EXISTS "Admin write palettes"
    ON color_palettes FOR ALL
    TO authenticated
    USING (true);

  ALTER TABLE theme_config ENABLE ROW LEVEL SECURITY;
  CREATE POLICY IF NOT EXISTS "Public read theme"
    ON theme_config FOR SELECT
    TO anon, authenticated
    USING (true);
  CREATE POLICY IF NOT EXISTS "Admin write theme"
    ON theme_config FOR ALL
    TO authenticated
    USING (true);

  ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
  CREATE POLICY IF NOT EXISTS "Public read languages"
    ON languages FOR SELECT
    TO anon, authenticated
    USING (true);
  CREATE POLICY IF NOT EXISTS "Admin write languages"
    ON languages FOR ALL
    TO authenticated
    USING (true);

  ALTER TABLE module_schemas ENABLE ROW LEVEL SECURITY;
  CREATE POLICY IF NOT EXISTS "Public read schemas"
    ON module_schemas FOR SELECT
    TO anon, authenticated
    USING (true);
  CREATE POLICY IF NOT EXISTS "Admin write schemas"
    ON module_schemas FOR ALL
    TO authenticated
    USING (true);

  ALTER TABLE media ENABLE ROW LEVEL SECURITY;
  CREATE POLICY IF NOT EXISTS "Public read media"
    ON media FOR SELECT
    TO anon, authenticated
    USING (true);
  CREATE POLICY IF NOT EXISTS "Admin write media"
    ON media FOR ALL
    TO authenticated
    USING (true);

  ALTER TABLE seo_config ENABLE ROW LEVEL SECURITY;
  CREATE POLICY IF NOT EXISTS "Public read seo"
    ON seo_config FOR SELECT
    TO anon, authenticated
    USING (true);
  CREATE POLICY IF NOT EXISTS "Admin write seo"
    ON seo_config FOR ALL
    TO authenticated
    USING (true);
`
```

### 4.4 Estrategia DDL de 3 Niveles

> **CRITICO**: PostgREST (la capa REST de Supabase) NO soporta operaciones DDL (CREATE TABLE, ALTER TABLE, etc.). El cliente `supabase-js` usa PostgREST internamente, por lo tanto **NO puede ejecutar DDL**. La estrategia anterior basada en `supabase.rpc('exec_sql', ...)` es INVALIDA.

La creacion de tablas utiliza una estrategia de 3 niveles con auto-deteccion:

#### Nivel 0: Auto-deteccion (antes de cualquier DDL)

Antes de intentar crear tablas, el wizard verifica si ya existen consultando via PostgREST (esto SI funciona con `supabase-js`):

```typescript
// Verificar si las tablas ya existen
const { error } = await supabase.from('site_config').select('id').limit(1)
if (!error) {
  // Las tablas ya existen — saltar DDL, ir directo a seed/verify
  return NextResponse.json({
    success: true,
    message: 'Tablas ya existentes. Saltando DDL.',
    skipped: true,
  })
}
```

#### Nivel 1: Conexion Directa a PostgreSQL (primario, automatico)

El wizard usa el **Database URL** proporcionado en el Paso 1 para conectarse directamente a PostgreSQL via el paquete `postgres` (npm). Esto permite ejecutar DDL completo sin limitaciones.

```typescript
// src/app/api/setup/tables/route.ts

import { NextResponse } from 'next/server'
import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'
import {
  MIGRATION_TABLES,
  SHARED_FUNCTIONS_SQL,
  TRIGGERS_SQL,
  RLS_POLICIES_SQL,
} from '@/lib/setup/migrations'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const databaseUrl = process.env.DATABASE_URL

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Variables de entorno no configuradas' }, { status: 400 })
  }

  // Nivel 0: Auto-deteccion — verificar si las tablas ya existen
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error: checkError } = await supabase.from('site_config').select('id').limit(1)
  if (!checkError) {
    return NextResponse.json({
      success: true,
      message: 'Las tablas ya existen en la base de datos. Saltando creacion.',
      method: 'skipped',
    })
  }

  // Nivel 1: Conexion directa a PostgreSQL
  if (databaseUrl) {
    try {
      const sql = postgres(databaseUrl, { ssl: 'require' })
      const results: Array<{ table: string; status: 'success' | 'error'; error?: string }> = []

      // 1. Crear funciones compartidas
      await sql.unsafe(SHARED_FUNCTIONS_SQL)

      // 2. Crear tablas una por una
      for (const migration of MIGRATION_TABLES) {
        try {
          await sql.unsafe(migration.sql)
          results.push({ table: migration.name, status: 'success' })
        } catch (err: any) {
          results.push({ table: migration.name, status: 'error', error: err.message })
        }
      }

      // 3. Crear triggers
      await sql.unsafe(TRIGGERS_SQL)

      // 4. Configurar RLS
      await sql.unsafe(RLS_POLICIES_SQL)

      // 5. Cerrar conexion
      await sql.end()

      const hasErrors = results.some((r) => r.status === 'error')
      return NextResponse.json({
        success: !hasErrors,
        results,
        method: 'direct_connection',
        message: hasErrors
          ? 'Algunas tablas no se pudieron crear. Revisa los errores.'
          : 'Todas las tablas fueron creadas exitosamente via conexion directa.',
      })
    } catch (err: any) {
      // Conexion directa fallo — caer al Nivel 2 (fallback)
      console.warn('DDL via conexion directa fallo, activando fallback manual:', err.message)
    }
  }

  // Nivel 2: Fallback — generar script SQL para ejecucion manual
  const fullScript = [
    '-- Orion Landing Universal: Script de Migracion Completo',
    '-- Ejecutar en Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql',
    '',
    '-- Funciones compartidas',
    SHARED_FUNCTIONS_SQL,
    '',
    '-- Tablas',
    ...MIGRATION_TABLES.map((m) => `-- Tabla: ${m.name}\n${m.sql}`),
    '',
    '-- Triggers',
    TRIGGERS_SQL,
    '',
    '-- RLS Policies',
    RLS_POLICIES_SQL,
  ].join('\n')

  return NextResponse.json({
    success: false,
    method: 'manual_fallback',
    message:
      'No se pudo conectar directamente a PostgreSQL. Ejecuta el script SQL manualmente en el SQL Editor de Supabase.',
    sqlScript: fullScript,
    supabaseSqlEditorUrl: `${supabaseUrl.replace('.supabase.co', '')}/sql`,
  })
}
```

#### Nivel 2: Fallback Manual (semi-automatico)

Si la conexion directa falla (restricciones de red, entorno no soportado), el wizard:

1. **Genera el script SQL completo** con todas las migraciones
2. **Muestra el script** en un bloque de codigo con boton "Copiar al portapapeles"
3. **Abre un enlace** al SQL Editor de Supabase (`Dashboard > SQL Editor`)
4. **Proporciona instrucciones paso a paso**: "Pega el script en el SQL Editor y haz clic en Run"
5. **Sondea automaticamente** cada 5 segundos si las tablas fueron creadas (via PostgREST), habilitando el boton "Siguiente" cuando detecta exito

```
+----------------------------------------------------------+
|  No se pudo conectar directamente a la base de datos.    |
|  Ejecuta el siguiente script en el SQL Editor:           |
|                                                          |
|  [Copiar SQL al portapapeles]  [Abrir SQL Editor]        |
|                                                          |
|  -- Orion Landing Universal: Migracion --                |
|  CREATE TABLE IF NOT EXISTS site_config (...)             |
|  CREATE TABLE IF NOT EXISTS languages (...)               |
|  ...                                                     |
|                                                          |
|  Estado: Verificando tablas...  [spinner]                 |
|  O: [Verificar manualmente]                              |
+----------------------------------------------------------+
```

### 4.5 Dependencia: paquete `postgres`

La conexion directa utiliza el paquete [`postgres`](https://www.npmjs.com/package/postgres) (no confundir con `pg`). Este es un cliente PostgreSQL moderno, ligero y compatible con serverless:

```bash
npm install postgres
```

**Compatibilidad**:

- Funciona en Vercel Serverless Functions con la Transaction Pooler URL (puerto 6543)
- Funciona en Docker/VPS con conexion directa (puerto 5432)
- Funciona en Netlify Functions
- NO funciona en Edge Runtime (requiere Node.js runtime)

### 4.6 Manejo de Errores y Rollback

| Escenario                             | Accion                                                     |
| ------------------------------------- | ---------------------------------------------------------- |
| Una tabla falla                       | Continuar con las demas, marcar la fallida como error      |
| Varias tablas fallan                  | Mostrar resumen de errores, boton "Reintentar fallidas"    |
| Fallo catastrofico (conexion perdida) | Boton "Reintentar todo"                                    |
| Tablas ya existen (re-ejecucion)      | `IF NOT EXISTS` previene duplicados, operacion idempotente |

---

## 5. Paso 3 — Datos Iniciales Seed (`/setup/seed`)

### 5.1 Interfaz de Usuario

**Titulo**: "Preparando tu Contenido"
**Descripcion**: "Vamos a cargar contenido de ejemplo y las paletas de colores para que puedas empezar a personalizar inmediatamente."

**Elementos visuales**:

- Lista de categorias con progreso:
  - Paletas de colores (20 paletas)
  - Configuracion del tema
  - Esquemas de modulos (19 esquemas)
  - Modulos con contenido demo (19 modulos)
  - Configuracion del sitio
  - Idiomas (Espanol + Ingles)
  - Configuracion SEO
  - Integraciones (configuracion base)
- Barra de progreso general
- Boton "Cargar Datos Iniciales"

### 5.2 Orden de Insercion

El seed debe ejecutarse en orden para respetar foreign keys:

1. **Storage Buckets** — `page_images` (publico), `avatars` (publico) — via `supabase-js` admin API
2. **Idiomas** (`languages`) — ES como default, EN como secundario
3. **Paletas de colores** (`color_palettes`) — Las 20 paletas predefinidas
4. **Configuracion del tema** (`theme_config`) — Con la primera paleta activa
5. **Esquemas de modulos** (`module_schemas`) — Los 19 esquemas
6. **Modulos con contenido** (`page_modules`) — Los 19 modulos con contenido seed
7. **Configuracion del sitio** (`site_config`) — Valores por defecto
8. **Configuracion SEO** (`seo_config`) — Una entrada por idioma
9. **Integraciones** (`integrations`) — Entradas base desactivadas

### 5.3 Seed de Idiomas

```typescript
export const SEED_LANGUAGES = [
  {
    code: 'es',
    name: 'Spanish',
    native_name: 'Espanol',
    is_default: true,
    is_active: true,
    sort_order: 1,
  },
  {
    code: 'en',
    name: 'English',
    native_name: 'English',
    is_default: false,
    is_active: true,
    sort_order: 2,
  },
]
```

### 5.4 Seed de Paletas (20)

Las 20 paletas predefinidas se documentan completamente en `THEME-SYSTEM.md`. Aqui el formato de insercion:

```typescript
export const SEED_PALETTES: Array<{
  name: string
  description: string
  niche: string
  colors: Record<string, string>
  is_predefined: boolean
}> = [
  // Ver THEME-SYSTEM.md seccion 3 para el listado completo
  // Se insertan las 20 paletas con is_predefined: true
]
```

### 5.5 Seed de Modulos (19)

Se importan los archivos `*.seed.ts` de cada modulo para obtener el contenido y estilos por defecto. Ver la seccion 4 de `MODULE-SYSTEM.md` para el detalle de cada seed.

```typescript
import { heroSeed } from '@/components/modules/hero/hero.seed'
import { valuePropSeed } from '@/components/modules/value-prop/value-prop.seed'
// ... importar los 19 seeds

export const SEED_MODULES = [
  heroSeed,
  valuePropSeed,
  // ... los 19 seeds
].map((seed) => ({
  section_key: seed.key,
  content: seed.content,
  styles: seed.styles,
  sort_order: seed.defaultOrder,
  is_visible: seed.defaultEnabled,
  is_system: ['hero', 'footer'].includes(seed.key),
}))
```

### 5.6 Seed de Configuracion del Sitio

```typescript
export const SEED_SITE_CONFIG = {
  site_name: 'Mi Landing Page',
  site_description: {
    es: 'Bienvenido a mi landing page profesional',
    en: 'Welcome to my professional landing page',
  },
  contact_email: '',
  logo_url: null,
  favicon_url: null,
  social_links: [],
  default_language: 'es',
  analytics_enabled: false,
  maintenance_mode: false,
  custom_head_scripts: null,
  custom_body_scripts: null,
}
```

### 5.7 Seed de SEO

```typescript
export const SEED_SEO = [
  {
    language_code: 'es',
    meta_title: 'Mi Landing Page — Titulo SEO',
    meta_description: 'Descripcion optimizada para motores de busqueda de mi landing page.',
    og_image_url: null,
    canonical_url: null,
    robots: 'index, follow',
    json_ld: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Mi Landing Page',
    },
  },
  {
    language_code: 'en',
    meta_title: 'My Landing Page — SEO Title',
    meta_description: 'Search engine optimized description for my landing page.',
    og_image_url: null,
    canonical_url: null,
    robots: 'index, follow',
    json_ld: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'My Landing Page',
    },
  },
]
```

### 5.8 Seed de Storage Buckets

Ademas de insertar datos en las tablas, el seed debe crear los **Storage Buckets** de Supabase necesarios para el funcionamiento del sistema. Esto SI se puede hacer via `supabase-js` usando la API de admin de Storage.

```typescript
// src/lib/setup/storage-seed.ts

export async function seedStorageBuckets(supabaseAdmin: SupabaseClient) {
  const results: Array<{ bucket: string; status: 'success' | 'error' | 'exists'; error?: string }> =
    []

  // Bucket: page_images — imagenes publicas de la landing page
  const { error: createError } = await supabaseAdmin.storage.createBucket('page_images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'],
    fileSizeLimit: 5 * 1024 * 1024, // 5MB max
  })

  if (createError) {
    if (createError.message.includes('already exists')) {
      results.push({ bucket: 'page_images', status: 'exists' })
    } else {
      results.push({ bucket: 'page_images', status: 'error', error: createError.message })
    }
  } else {
    results.push({ bucket: 'page_images', status: 'success' })
  }

  // Bucket: avatars — fotos de perfil de administradores
  const { error: avatarError } = await supabaseAdmin.storage.createBucket('avatars', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    fileSizeLimit: 2 * 1024 * 1024, // 2MB max
  })

  if (avatarError) {
    if (avatarError.message.includes('already exists')) {
      results.push({ bucket: 'avatars', status: 'exists' })
    } else {
      results.push({ bucket: 'avatars', status: 'error', error: avatarError.message })
    }
  } else {
    results.push({ bucket: 'avatars', status: 'success' })
  }

  return results
}
```

> **Nota**: A diferencia del DDL de tablas, la creacion de Storage buckets y sus politicas de acceso SI es posible via `supabase-js` con la service_role key. No requiere conexion directa a PostgreSQL.

### 5.9 Seed de Integraciones

```typescript
export const SEED_INTEGRATIONS = [
  {
    type: 'google_analytics',
    name: 'Google Analytics 4',
    is_enabled: false,
    config: { measurement_id: '' },
    sensitive_config: {},
  },
  {
    type: 'meta_pixel',
    name: 'Meta Pixel (Facebook)',
    is_enabled: false,
    config: { pixel_id: '' },
    sensitive_config: {},
  },
  {
    type: 'whatsapp',
    name: 'WhatsApp',
    is_enabled: false,
    config: { phone_number: '', default_message: '' },
    sensitive_config: {},
  },
  {
    type: 'calendly',
    name: 'Calendly',
    is_enabled: false,
    config: { calendly_url: '' },
    sensitive_config: {},
  },
  {
    type: 'smtp',
    name: 'Notificaciones por Email (SMTP)',
    is_enabled: false,
    config: { host: '', port: 587, from_address: '', from_name: '' },
    sensitive_config: { username: '', password: '' },
  },
  {
    type: 'custom_scripts',
    name: 'Scripts Personalizados',
    is_enabled: false,
    config: { head_scripts: '', body_scripts: '' },
    sensitive_config: {},
  },
]
```

### 5.10 API Route del Seed

```typescript
// src/app/api/setup/seed/route.ts

export async function POST(request: Request) {
  // 1. Verificar que las tablas existen
  // 2. Verificar que no hay datos previos (idempotente)
  // 3. Crear Storage Buckets (via supabase-js admin API)
  //    a. page_images (publico, para imagenes de la landing)
  //    b. avatars (publico, para fotos de perfil)
  // 4. Insertar datos en orden:
  //    a. Languages
  //    b. Color Palettes
  //    c. Theme Config (con referencia a primera paleta)
  //    d. Module Schemas
  //    e. Page Modules
  //    f. Site Config
  //    g. SEO Config
  //    h. Integrations
  // 5. Retornar resumen (incluyendo resultado de buckets)
  // Cada insercion envuelve en try/catch
  // Si falla, reporta que categoria fallo pero continua con las demas
  // Usar upsert para idempotencia
}
```

---

## 6. Paso 4 — Crear Cuenta Admin (`/setup/admin`)

### 6.1 Interfaz de Usuario

**Titulo**: "Crea tu Cuenta de Administrador"
**Descripcion**: "Esta sera la cuenta con la que gestionaras todo el contenido de tu landing page."

**Campos del formulario**:

| Campo                | Tipo     | Validacion                                             |
| -------------------- | -------- | ------------------------------------------------------ |
| Email                | email    | Formato email valido, requerido                        |
| Contrasena           | password | Minimo 8 caracteres, al menos una mayuscula, un numero |
| Confirmar contrasena | password | Debe coincidir con contrasena                          |

**Elementos adicionales**:

- Indicador de fortaleza de contrasena (debil, media, fuerte)
- Checkbox "Recordar credenciales" (solo un recordatorio visual, no funcional por seguridad)
- Aviso: "Guarda estas credenciales en un lugar seguro. Las necesitaras para acceder al panel de administracion."

### 6.2 API Route

```typescript
// src/app/api/setup/admin/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Variables de entorno no configuradas' }, { status: 400 })
  }

  // Validar inputs
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalido' }, { status: 400 })
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: 'La contrasena debe tener al menos 8 caracteres' },
      { status: 400 },
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Verificar que no existan usuarios previos
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  if (existingUsers?.users && existingUsers.users.length > 0) {
    return NextResponse.json(
      { error: 'Ya existe un usuario administrador. El wizard no puede crear mas usuarios.' },
      { status: 403 },
    )
  }

  // Crear usuario
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirmar email (no requiere verificacion)
    user_metadata: {
      role: 'admin',
      created_by: 'setup_wizard',
    },
  })

  if (error) {
    return NextResponse.json({ error: `Error al crear usuario: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Cuenta de administrador creada exitosamente.',
    user: { email: data.user.email, id: data.user.id },
  })
}
```

---

## 7. Paso 5 — Finalizacion (`/setup/complete`)

### 7.1 Interfaz de Usuario

**Titulo**: "Tu Landing Page esta Lista!"
**Descripcion**: "Has completado toda la configuracion. Tu landing page esta lista para personalizar."

**Resumen visual**:

- Checkmark animado grande (verde)
- Resumen de lo configurado:
  - Base de datos: Conectada (nombre del proyecto)
  - Tablas: 10 tablas creadas
  - Paletas: 20 paletas cargadas
  - Modulos: 19 modulos configurados (9 activos)
  - Idiomas: 2 idiomas (ES como predeterminado, EN)
  - Admin: cuenta@email.com

**Botones de accion**:

- "Ver mi Landing Page" → redirige a `/` (boton primario)
- "Ir al Panel Admin" → redirige a `/admin` (boton secundario)

### 7.2 Logica de Redireccion Post-Wizard

Tras completar el wizard:

1. Se establece una marca en el servidor indicando que la instalacion esta completa (la deteccion en middleware usa la existencia de usuario admin como indicador final)
2. El middleware ya no redirige a `/setup` porque `setupState.isComplete === true`
3. Las rutas `/setup/*` devuelven redirect 302 a `/`
4. Las rutas `/api/setup/*` devuelven 403 Forbidden

---

## 8. Seguridad del Wizard

### 8.1 Reglas de Acceso

| Condicion                |  Acceso al Wizard  | Acceso a Landing | Acceso a Admin |
| ------------------------ | :----------------: | :--------------: | :------------: |
| Sin env vars             |         Si         |  No (redirect)   | No (redirect)  |
| Con env vars, sin tablas |         Si         |  No (redirect)   | No (redirect)  |
| Con tablas, sin seed     |         Si         |  No (redirect)   | No (redirect)  |
| Con seed, sin admin      | Si (solo paso 4+5) |  No (redirect)   | No (redirect)  |
| Setup completo           | No (redirect a /)  |        Si        | Si (con login) |

### 8.2 Protecciones

1. **Rutas API del wizard** (`/api/setup/*`): Solo accesibles cuando el wizard no esta completo. Despues retornan 403.
2. **Service Role Key**: Solo se usa server-side. Nunca se envia al cliente.
3. **Escritura de .env.local**: Solo ocurre en el paso 1. La API valida las credenciales antes de escribir.
4. **Creacion de usuario**: Solo permite crear un usuario si no existe ninguno. Previene escalacion.
5. **Idempotencia**: Todos los pasos son seguros de re-ejecutar (usan `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).

### 8.3 Consideraciones para Docker

En entornos Docker:

- Las variables de entorno se inyectan via `docker-compose.yml` o `docker run -e`
- El Paso 1 detecta que las variables ya existen y se salta automaticamente
- El wizard empieza en el Paso 2 (tablas) directamente

### 8.4 Consideraciones para Vercel/Netlify

En entornos de hosting gestionado:

- Las variables se configuran en el dashboard del hosting
- La escritura de `.env.local` no aplica (las variables ya estan en el entorno)
- El Paso 1 se salta automaticamente
- Si se necesita actualizar credenciales, se hace desde el dashboard del hosting

---

## 9. Diagrama de Flujo Completo

```
                    +---------------------------+
                    |    Usuario accede a URL    |
                    +---------------------------+
                                |
                                v
                    +---------------------------+
                    |       Middleware           |
                    |   getSetupState()         |
                    +---------------------------+
                                |
                    +-----------+-----------+
                    |                       |
                    v                       v
            Setup Incompleto          Setup Completo
                    |                       |
                    v                       v
            Redirect a paso         Pagina normal
            correspondiente         (landing / admin)
                    |
                    v
        +---------------------------+
        |   /setup/connect          |
        |   Paso 1: Credenciales    |
        +---------------------------+
                    |
                    | POST /api/setup/connect
                    | (validar + escribir .env.local)
                    |
                    v
        +---------------------------+
        |   /setup/tables           |
        |   Paso 2: Crear tablas    |
        +---------------------------+
                    |
                    | POST /api/setup/tables
                    |
              +-----+-----+
              |           |
              v           v
        Tablas ya      Tablas no
        existen?       existen
        (PostgREST     |
         check)        +------+------+
              |        |             |
              |        v             v
              |   Nivel 1:      Nivel 2:
              |   Conexion      Fallback
              |   directa       manual
              |   (postgres     (copiar SQL
              |    npm pkg)     al SQL Editor,
              |        |        polling hasta
              |        |        detectar tablas)
              |        |             |
              +--------+------+------+
                              |
                              v
        +---------------------------+
        |   /setup/seed             |
        |   Paso 3: Datos iniciales |
        +---------------------------+
                    |
                    | POST /api/setup/seed
                    | (crear storage buckets +
                    |  insertar paletas, modulos, config)
                    |
                    v
        +---------------------------+
        |   /setup/admin            |
        |   Paso 4: Cuenta admin    |
        +---------------------------+
                    |
                    | POST /api/setup/admin
                    | (crear usuario en Supabase Auth)
                    |
                    v
        +---------------------------+
        |   /setup/complete         |
        |   Paso 5: Finalizacion    |
        +---------------------------+
                    |
                    +-------+-------+
                    |               |
                    v               v
            "Ver Landing"    "Ir al Admin"
                 /              /admin
```

---

## Apendice A: Componente de UI del Wizard

### Layout del Wizard

```typescript
// src/app/setup/layout.tsx

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-heading">
            Orion Landing Universal
          </h1>
          <p className="text-gray-400 mt-2">Asistente de Configuracion Inicial</p>
        </div>

        {/* Barra de Progreso */}
        <WizardProgressBar />

        {/* Contenido del paso */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### Barra de Progreso

```typescript
// src/components/setup/WizardProgressBar.tsx

const STEPS = [
  { id: 1, label: 'Conexion', path: '/setup/connect' },
  { id: 2, label: 'Tablas', path: '/setup/tables' },
  { id: 3, label: 'Datos', path: '/setup/seed' },
  { id: 4, label: 'Admin', path: '/setup/admin' },
  { id: 5, label: 'Listo', path: '/setup/complete' },
]
```

---

## Apendice B: Endpoints API del Wizard

| Metodo | Ruta                         | Proposito                                                                      | Proteccion     |
| ------ | ---------------------------- | ------------------------------------------------------------------------------ | -------------- |
| POST   | `/api/setup/connect`         | Validar credenciales (Supabase + DB URL) y escribir .env.local (si no es PaaS) | Solo pre-setup |
| POST   | `/api/setup/test-connection` | Probar conexion sin guardar                                                    | Solo pre-setup |
| GET    | `/api/setup/state`           | Obtener estado actual de la instalacion                                        | Solo pre-setup |
| POST   | `/api/setup/tables`          | Ejecutar migraciones DDL (3 niveles: auto-detect, direct pg, manual fallback)  | Solo pre-setup |
| POST   | `/api/setup/seed`            | Crear storage buckets + insertar datos iniciales                               | Solo pre-setup |
| POST   | `/api/setup/admin`           | Crear cuenta de administrador                                                  | Solo pre-setup |
