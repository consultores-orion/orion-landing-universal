# ADMIN-PANEL.md — Especificacion del Panel de Administracion

> **Version**: 1.0.0  
> **Fecha**: 2026-04-04  
> **Estado**: Especificacion definitiva  
> **Audiencia**: Desarrolladores, Claude Code, contribuidores open-source

---

## 1. Estructura de Rutas

```
/admin                          → Redirect a /admin/dashboard
  /admin/dashboard              → Vista general, estadisticas rapidas
  /admin/content                → Editor de contenido por modulo
  /admin/content/[section_key]  → Editor de un modulo especifico
  /admin/modules                → Gestor de modulos (activar/desactivar/reordenar)
  /admin/design                 → Editor de tema, paleta, tipografia
  /admin/languages              → Gestor de idiomas
  /admin/seo                    → Configuracion SEO
  /admin/seo/[lang]             → SEO para un idioma especifico
  /admin/media                  → Biblioteca de medios
  /admin/integrations           → Configuracion de integraciones
  /admin/leads                  → Gestion de leads
  /admin/leads/[id]             → Detalle de un lead
  /admin/settings               → Configuracion general del sitio
```

### Proteccion de Rutas

Todas las rutas bajo `/admin` requieren autenticacion. Se implementa un layout de Next.js que verifica la sesion:

```typescript
// src/app/admin/layout.tsx

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return <AdminLayout user={user}>{children}</AdminLayout>;
}
```

---

## 2. Layout del Panel Admin

### 2.1 Estructura Visual

```
+------------------------------------------------------------------+
|  TOP BAR                                                          |
|  [Logo] [Nombre del Sitio]              [Vista Previa] [Avatar]  |
+--------+---------------------------------------------------------+
|        |                                                          |
| SIDE   |  CONTENIDO PRINCIPAL                                     |
| BAR    |                                                          |
|        |  Breadcrumb: Admin > Seccion > Subseccion                |
| [icon] |                                                          |
| Dash   |  +---------------------------------------------+        |
| [icon] |  |                                             |        |
| Cont   |  |       Area de contenido dinamico            |        |
| [icon] |  |       (cambia segun la ruta activa)         |        |
| Mods   |  |                                             |        |
| [icon] |  +---------------------------------------------+        |
| Design |                                                          |
| [icon] |                                                          |
| Langs  |                                                          |
| [icon] |                                                          |
| SEO    |                                                          |
| [icon] |                                                          |
| Media  |                                                          |
| [icon] |                                                          |
| Integ  |                                                          |
| [icon] |                                                          |
| Leads  |                                                          |
| [icon] |                                                          |
| Config |                                                          |
+--------+---------------------------------------------------------+
```

### 2.2 Sidebar (Navegacion Lateral)

**Comportamiento**:

- Desktop (1280px+): Expandida por defecto (250px), con iconos + texto
- Tablet (1024px-1279px): Colapsada por defecto (64px), solo iconos, expandible al hacer clic
- Mobile (<1024px): Oculta, se abre como drawer al tocar el boton hamburguesa

**Elementos del Sidebar**:

| Icono             | Etiqueta      | Ruta                  | Badge                     |
| ----------------- | ------------- | --------------------- | ------------------------- |
| `LayoutDashboard` | Dashboard     | `/admin/dashboard`    | -                         |
| `FileText`        | Contenido     | `/admin/content`      | -                         |
| `Puzzle`          | Modulos       | `/admin/modules`      | -                         |
| `Palette`         | Diseno        | `/admin/design`       | -                         |
| `Languages`       | Idiomas       | `/admin/languages`    | Numero de idiomas activos |
| `Search`          | SEO           | `/admin/seo`          | -                         |
| `Image`           | Medios        | `/admin/media`        | -                         |
| `Plug`            | Integraciones | `/admin/integrations` | Numero activas            |
| `Users`           | Leads         | `/admin/leads`        | Leads sin leer            |
| `Settings`        | Configuracion | `/admin/settings`     | -                         |

**Pie del Sidebar**:

- Boton "Colapsar/Expandir" sidebar
- Version de la aplicacion (ej: "v1.0.0")

### 2.3 Top Bar (Barra Superior)

**Elementos**:

- **Izquierda**: Logo (clickeable, lleva a dashboard) + Nombre del sitio (editable inline)
- **Centro**: Breadcrumb de la ubicacion actual
- **Derecha**:
  - Boton "Vista Previa" → Abre la landing en nueva pestana
  - Boton "Edicion en Vivo" → Toggle que activa el modo de edicion inline en la pagina publica
  - Menu de usuario (avatar + dropdown):
    - Nombre del usuario
    - Email
    - Separador
    - "Mi Perfil" (cambiar contrasena)
    - "Cerrar Sesion"

### 2.4 Componente AdminLayout

```typescript
// src/components/admin/AdminLayout.tsx

'use client';

import { type FC, type ReactNode, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { type User } from '@supabase/supabase-js';

interface AdminLayoutProps {
  user: User;
  children: ReactNode;
}

export const AdminLayout: FC<AdminLayoutProps> = ({ user, children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminTopBar
        user={user}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex pt-16"> {/* pt-16 para compensar topbar fija */}
        <AdminSidebar collapsed={sidebarCollapsed} />
        <main
          className={`flex-1 p-6 transition-all ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
```

---

## 3. Dashboard (`/admin/dashboard`)

### 3.1 Tarjetas de Estadisticas

Fila superior con 4 tarjetas KPI:

| Tarjeta           | Icono       | Dato           | Subtitulo                              | Color                               |
| ----------------- | ----------- | -------------- | -------------------------------------- | ----------------------------------- |
| Leads esta Semana | `Users`     | Numero         | "+X vs semana anterior" o "Sin cambio" | Verde si positivo, rojo si negativo |
| Modulos Activos   | `Puzzle`    | Numero         | "de 19 totales"                        | Azul                                |
| Idiomas Activos   | `Languages` | Numero         | Listado de codigos (ej: "ES, EN")      | Purpura                             |
| Ultima Edicion    | `Clock`     | Fecha relativa | "Hace 2 horas"                         | Gris                                |

### 3.2 Tabla de Leads Recientes

Tabla compacta mostrando los ultimos 5 leads:

| Columna | Descripcion                         |
| ------- | ----------------------------------- |
| Nombre  | Nombre del lead                     |
| Email   | Email (truncado si es largo)        |
| Fecha   | Fecha relativa ("Hace 3 horas")     |
| Estado  | Badge: "Nuevo" (no leido) o "Leido" |

- Boton "Ver todos los leads" que redirige a `/admin/leads`

### 3.3 Links Rapidos

Grid de botones/cards con accesos directos:

- "Editar Contenido del Hero" → `/admin/content/hero`
- "Cambiar Paleta de Colores" → `/admin/design`
- "Agregar un Idioma" → `/admin/languages`
- "Configurar Integraciones" → `/admin/integrations`
- "Exportar Leads" → accion directa de descarga CSV
- "Ver mi Landing Page" → abre en nueva pestana

### 3.4 Consultas Necesarias

```typescript
// src/app/admin/dashboard/page.tsx

export default async function DashboardPage() {
  const supabase = await createServerClient()

  // Leads de esta semana
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const { count: leadsThisWeek } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekStart.toISOString())

  // Leads de la semana anterior (para comparacion)
  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const { count: leadsPrevWeek } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', prevWeekStart.toISOString())
    .lt('created_at', weekStart.toISOString())

  // Modulos activos
  const { count: activeModules } = await supabase
    .from('page_modules')
    .select('*', { count: 'exact', head: true })
    .eq('is_visible', true)

  // Idiomas activos
  const { data: languages } = await supabase
    .from('languages')
    .select('code, name')
    .eq('is_active', true)

  // Ultima edicion
  const { data: lastEdit } = await supabase
    .from('page_modules')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  // Leads recientes
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('id, name, email, created_at, is_read')
    .order('created_at', { ascending: false })
    .limit(5)

  // Renderizar dashboard con estos datos
}
```

---

## 4. Editor de Contenido (`/admin/content`)

### 4.1 Vista General (`/admin/content`)

**Layout**: Lista de todos los modulos activos, cada uno como una tarjeta expandible o link a su editor individual.

**Para cada modulo**:

- Icono del modulo
- Nombre del modulo
- Badge de estado: "Activo" (verde) o "Inactivo" (gris)
- Indicador de completitud de traduccion por idioma
- Boton "Editar" → navega a `/admin/content/[section_key]`
- Preview thumbnail del modulo (captura estatica o mini-render)

### 4.2 Editor Individual (`/admin/content/[section_key]`)

**Layout**:

- Header con nombre del modulo y boton "Volver a listado"
- Selector de idioma (tabs) para ver/editar el contenido en cada idioma
- Formulario generado dinamicamente a partir del `ModuleSchema`
- Boton "Guardar" sticky en la parte inferior
- Panel lateral (opcional): preview en tiempo real del modulo

### 4.3 Generacion Dinamica de Formularios

El editor lee el `ModuleSchema` del modulo y genera campos de formulario automaticamente segun el tipo de cada campo:

| Tipo de Campo (`FieldType`) | Componente UI                  | Comportamiento                                                                                                               |
| --------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `text`                      | `<Input />` (shadcn/ui)        | Input de texto simple. Si `isMultilingual`, muestra un input por idioma o tabs                                               |
| `textarea`                  | `<Textarea />` (shadcn/ui)     | Textarea multilinea. Soporta multilingual                                                                                    |
| `richtext`                  | Editor Rich Text basico        | Toolbar basica: negrita, italica, link, lista. Output HTML. Multilingual                                                     |
| `image`                     | `<ImageUploader />` custom     | Preview + boton "Cambiar". Abre modal de media library. Incluye campo alt (multilingual)                                     |
| `list`                      | `<DynamicList />` custom       | Lista dinamica: cada item tiene sub-formulario segun `listItemSchema`. Botones: agregar, eliminar, reordenar (drag-and-drop) |
| `number`                    | `<Input type="number" />`      | Con validacion min/max si se define en schema                                                                                |
| `boolean`                   | `<Switch />` (shadcn/ui)       | Toggle on/off                                                                                                                |
| `color`                     | `<ColorPicker />` custom       | Input de color hex con picker visual                                                                                         |
| `link`                      | `<Input />` con validacion URL | Acepta URLs absolutas y anclas (#seccion)                                                                                    |
| `date`                      | `<DatePicker />` (shadcn/ui)   | Calendario para seleccionar fecha/hora                                                                                       |
| `select`                    | `<Select />` (shadcn/ui)       | Dropdown con opciones definidas en `selectOptions`                                                                           |

### 4.4 Manejo de Campos Multilingues

Cuando un campo tiene `isMultilingual: true`:

**Opcion A — Tabs de Idioma** (recomendado para formularios con pocos campos):

```
[ES] [EN] [FR]
+----------------------------------+
| Titulo: [                       ]|
| Subtitulo: [                    ]|
| Descripcion: [                  ]|
+----------------------------------+
```

**Opcion B — Side-by-Side** (recomendado para traduccion):

```
+------------------+------------------+
| ES (Referencia)  | EN (Editando)    |
+------------------+------------------+
| Titulo:          | Title:           |
| [Texto en ES]    | [Text in EN    ] |
| Subtitulo:       | Subtitle:        |
| [Texto en ES]    | [Text in EN    ] |
+------------------+------------------+
```

La opcion se configura en preferencias del admin. Default: tabs.

### 4.5 Logica de Guardado

```typescript
// src/app/api/modules/[id]/route.ts

import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// PATCH — Actualizar campos parciales del contenido
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  // Verificar autenticacion
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { content, styles } = body

  // Construir update parcial
  const updateData: Record<string, unknown> = {}
  if (content !== undefined) updateData.content = content
  if (styles !== undefined) updateData.styles = styles

  const { data, error } = await supabase
    .from('page_modules')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Revalidar la pagina publica
  // revalidatePath('/');

  return NextResponse.json({ success: true, data })
}

// PUT — Reemplazar todo el contenido del modulo
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()

  // Validar contra el schema del modulo
  // ... (ver seccion de validacion)

  const { data, error } = await supabase
    .from('page_modules')
    .update({
      content: body.content,
      styles: body.styles,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
```

### 4.6 Validacion de Contenido

Antes de guardar, se valida el contenido contra el esquema del modulo:

1. Campos `required` no pueden estar vacios
2. Campos `text` respetan `minLength`/`maxLength`
3. Campos `number` respetan `min`/`max`
4. Campos `image` verifican que la URL sea valida o referencia a media library
5. Campos `list` validan cada item contra `listItemSchema`
6. Campos multilingues verifican que al menos el idioma default tenga valor

---

## 5. Gestor de Modulos (`/admin/modules`)

### 5.1 Interfaz

**Titulo**: "Gestionar Modulos"
**Descripcion**: "Activa, desactiva y reordena los modulos de tu landing page."

**Lista de modulos** (drag-and-drop):

```
+------------------------------------------------------------------+
| [=] [icono] Hero                            [Sistema] [Toggle ON] |
+------------------------------------------------------------------+
| [=] [icono] Propuesta de Valor                       [Toggle ON] |
+------------------------------------------------------------------+
| [=] [icono] Como Funciona                            [Toggle ON] |
+------------------------------------------------------------------+
| [=] [icono] Prueba Social                            [Toggle ON] |
+------------------------------------------------------------------+
| [=] [icono] Logos de Clientes                        [Toggle ON] |
+------------------------------------------------------------------+
| [=] [icono] Formulario de Contacto                   [Toggle ON] |
+------------------------------------------------------------------+
| [=] [icono] FAQ                                      [Toggle ON] |
+------------------------------------------------------------------+
| [=] [icono] CTA Final                                [Toggle ON] |
+------------------------------------------------------------------+
| [=] [icono] Footer                          [Sistema] [Toggle ON] |
+------------------------------------------------------------------+
|                                                                    |
| --- Modulos Inactivos ---                                          |
|                                                                    |
| [=] [icono] Estadisticas                           [Toggle OFF]  |
| [=] [icono] Precios                                [Toggle OFF]  |
| [=] [icono] Video                                  [Toggle OFF]  |
| [=] [icono] Equipo                                 [Toggle OFF]  |
| [=] [icono] Galeria                                [Toggle OFF]  |
| [=] [icono] Grid de Funcionalidades                [Toggle OFF]  |
| [=] [icono] Cuenta Regresiva                       [Toggle OFF]  |
| [=] [icono] Comparacion                            [Toggle OFF]  |
| [=] [icono] Newsletter                             [Toggle OFF]  |
| [=] [icono] Mapa de Ubicacion                      [Toggle OFF]  |
+------------------------------------------------------------------+
```

**Elementos por modulo**:

- `[=]` Handle de arrastre (drag-and-drop)
- Icono del modulo (segun registry)
- Nombre del modulo
- Badge "Sistema" si `is_system: true` (hero, footer — no se pueden desactivar)
- Toggle de visibilidad (on/off)
- El orden visual refleja el `sort_order`

### 5.2 Drag and Drop

Se usa una libreria como `@dnd-kit/sortable` para el reordenamiento:

- Al soltar un modulo en nueva posicion, se recalculan los `sort_order` de todos los modulos
- Se envia un PATCH con el nuevo array de ordenes
- La actualizacion es optimista (UI se actualiza inmediatamente, rollback si falla)

### 5.3 API de Reordenamiento

```typescript
// src/app/api/modules/reorder/route.ts

export async function PATCH(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { order } = await request.json()
  // order: Array<{ id: string; sort_order: number }>

  // Actualizar cada modulo en una transaccion
  const promises = order.map(({ id, sort_order }: { id: string; sort_order: number }) =>
    supabase.from('page_modules').update({ sort_order }).eq('id', id),
  )

  await Promise.all(promises)

  return NextResponse.json({ success: true })
}
```

### 5.4 API de Toggle de Visibilidad

```typescript
// src/app/api/modules/[id]/visibility/route.ts

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { is_visible } = await request.json()

  // Verificar que no se desactive un modulo sistema
  const { data: module } = await supabase
    .from('page_modules')
    .select('is_system')
    .eq('id', params.id)
    .single()

  if (module?.is_system && !is_visible) {
    return NextResponse.json(
      { error: 'No se puede desactivar un modulo del sistema' },
      { status: 400 },
    )
  }

  const { error } = await supabase.from('page_modules').update({ is_visible }).eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

---

## 6. Editor de Diseno (`/admin/design`)

### 6.1 Secciones del Editor

El editor de diseno se divide en tabs o secciones:

#### Tab 1: Paleta de Colores

**Selector de paleta**:

- Grid visual de todas las paletas disponibles (20 predefinidas + personalizadas)
- Cada paleta muestra: nombre, nicho, preview de los colores como circulos
- Paleta activa resaltada con borde dorado
- Boton "Crear Paleta Personalizada" al final

**Al seleccionar una paleta**:

- Preview en vivo del cambio (sin guardar aun)
- Los colores se aplican a un mini-preview de la landing embebido
- Boton "Aplicar Paleta" para confirmar

**Overrides de color**:

- Debajo del selector, una seccion "Ajustes de Color" que permite override individual:
  - Primary → Color picker
  - Secondary → Color picker
  - Accent → Color picker
  - Background → Color picker
  - Surface → Color picker
  - Text Primary → Color picker
  - Text Secondary → Color picker
  - Success → Color picker
  - Error → Color picker
- Cada override tiene un boton "Reset" que vuelve al valor de la paleta seleccionada

#### Tab 2: Tipografia

- **Fuente de Titulos** (heading font): Selector con preview. Busqueda entre Google Fonts populares. Default: Poppins
- **Fuente de Cuerpo** (body font): Selector con preview. Default: Lato
- **Preview de tipografia**: Muestra un H1, H2, H3, parrafo y lista con las fuentes seleccionadas
- Lista de fuentes sugeridas (precargadas): Poppins, Lato, Inter, Roboto, Montserrat, Open Sans, Playfair Display, Raleway, Nunito, Source Sans 3

#### Tab 3: Espaciado y Bordes

- **Preset de espaciado**: `compact`, `comfortable` (default), `spacious`
  - Cada preset define padding base de los modulos
- **Radio de bordes**: `none` (0), `small` (4px), `medium` (8px, default), `large` (16px), `full` (9999px)
- Preview en vivo de los cambios

#### Tab 4: Logo y Favicon

- **Logo**:
  - Upload o seleccionar de media library
  - Preview del logo en el header
  - Opciones: solo imagen, solo texto, imagen + texto
  - Campos: logo_url, logo_alt (multilingual)
- **Favicon**:
  - Upload de archivo .ico, .png o .svg
  - Preview del favicon en pestana
  - Formato recomendado: 32x32 px PNG

### 6.2 API de Diseno

```typescript
// src/app/api/design/theme/route.ts

export async function PUT(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const {
    active_palette_id,
    custom_colors,
    heading_font,
    body_font,
    spacing_preset,
    border_radius,
  } = await request.json()

  const { data, error } = await supabase
    .from('theme_config')
    .update({
      active_palette_id,
      custom_colors,
      heading_font,
      body_font,
      spacing_preset,
      border_radius,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
```

---

## 7. Gestor de Idiomas (`/admin/languages`)

### 7.1 Interfaz

**Lista de idiomas activos**:

```
+------------------------------------------------------------------+
| Espanol (ES)                                                      |
| [Predeterminado]  Traduccion: [=========90%==] 90%   [Editar]   |
+------------------------------------------------------------------+
| English (EN)                                                      |
|                   Traduccion: [=======75%====] 75%   [Editar] [X]|
+------------------------------------------------------------------+

[+ Agregar Idioma]
```

**Para cada idioma**:

- Nombre nativo + codigo ISO
- Badge "Predeterminado" si es el default
- Barra de progreso de traduccion (porcentaje de campos multilingues con valor)
- Boton "Editar" (ver traducciones por modulo)
- Boton "Eliminar" (con confirmacion, no disponible para el idioma default)

### 7.2 Agregar Idioma

**Modal "Agregar Idioma"**:

- Busqueda/filtro por nombre o codigo
- Lista de idiomas ISO 639-1 mas comunes, con nombre en ingles y nombre nativo:
  - Espanol (es), English (en), Francais (fr), Deutsch (de), Italiano (it), Portugues (pt), Zhongwen (zh), Nihongo (ja), Hangugeo (ko), Arabiyya (ar), Hindi (hi), Russkiy (ru), etc.
- Al seleccionar: se inserta en tabla `languages` con `is_active: true`
- Contenido existente mostrara fallback al idioma default hasta que se traduzca

### 7.3 Calculo de Progreso de Traduccion

```typescript
function calculateTranslationProgress(
  modules: PageModule[],
  languageCode: string,
  schema: ModuleSchema[],
): number {
  let totalFields = 0
  let translatedFields = 0

  for (const module of modules) {
    const moduleSchema = schema.find((s) => s.key === module.section_key)
    if (!moduleSchema) continue

    for (const field of moduleSchema.fields) {
      if (!field.isMultilingual) continue

      totalFields++
      const value = getNestedValue(module.content, field.key)
      if (value && typeof value === 'object' && (value as any)[languageCode]) {
        translatedFields++
      }
    }
  }

  return totalFields === 0 ? 100 : Math.round((translatedFields / totalFields) * 100)
}
```

### 7.4 Eliminar Idioma

**Flujo de eliminacion**:

1. Confirmacion: "Estas seguro? Se eliminaran todas las traducciones en [idioma]. Esta accion no se puede deshacer."
2. No se puede eliminar el idioma default (boton deshabilitado con tooltip explicativo)
3. Al confirmar:
   - Eliminar registro de tabla `languages`
   - Recorrer todos los `page_modules` y eliminar la clave del idioma de cada campo JSONB multilingue
   - Eliminar registro de `seo_config` para ese idioma
4. Confirmacion de exito

---

## 8. SEO (`/admin/seo`)

### 8.1 Vista General

**Lista por idioma** — Muestra una tarjeta por cada idioma activo con resumen de la configuracion SEO:

Para cada idioma:

- Meta titulo (truncado)
- Meta descripcion (truncada)
- OG Image (thumbnail)
- Status: "Completo" o "Pendiente" segun campos vacios

### 8.2 Editor SEO por Idioma (`/admin/seo/[lang]`)

**Campos**:

| Campo            | Tipo            | Descripcion                       | Validacion                                             |
| ---------------- | --------------- | --------------------------------- | ------------------------------------------------------ |
| Meta Title       | text            | Titulo para `<title>` y OG        | Max 60 caracteres (con contador)                       |
| Meta Description | textarea        | Descripcion para meta description | Max 160 caracteres (con contador)                      |
| OG Image         | image           | Imagen para compartir en redes    | Recomendado: 1200x630px                                |
| Canonical URL    | text            | URL canonica                      | Formato URL valido                                     |
| Robots           | select          | Directiva de robots               | `index,follow` / `noindex,follow` / `noindex,nofollow` |
| JSON-LD          | textarea (code) | Datos estructurados               | JSON valido                                            |

**Preview**:

- Preview de como se vera en Google (titulo + URL + descripcion)
- Preview de como se vera al compartir en redes sociales (OG card)

### 8.3 API SEO

```typescript
// src/app/api/seo/[lang]/route.ts

export async function PUT(request: Request, { params }: { params: { lang: string } }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()

  const { data, error } = await supabase
    .from('seo_config')
    .upsert({
      language_code: params.lang,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      og_image_url: body.og_image_url,
      canonical_url: body.canonical_url,
      robots: body.robots,
      json_ld: body.json_ld,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
```

---

## 9. Media Library (`/admin/media`)

### 9.1 Interfaz

**Layout**: Vista de grid o lista (toggle)

**Barra superior**:

- Boton "Subir Archivo" (abre dialogo o zona de drag-and-drop)
- Selector de carpeta (filtro): "Todas", "General", "Hero", "Team", etc.
- Barra de busqueda por nombre de archivo
- Toggle vista Grid/Lista
- Ordenar por: Fecha (reciente primero), Nombre, Tamano

**Vista Grid**:

```
+--------+ +--------+ +--------+ +--------+
|  img   | |  img   | |  img   | |  img   |
|        | |        | |        | |        |
+--------+ +--------+ +--------+ +--------+
| nombre | | nombre | | nombre | | nombre |
| 120KB  | | 340KB  | | 89KB   | | 1.2MB  |
+--------+ +--------+ +--------+ +--------+
```

**Vista Lista**:
| Thumbnail | Nombre | Carpeta | Tamano | Dimensiones | Fecha |
|-----------|--------|---------|--------|-------------|-------|

### 9.2 Upload de Archivos

**Soporte**:

- Formatos: JPEG, PNG, WebP, SVG, GIF, ICO
- Tamano maximo: 5MB por archivo
- Upload multiple (hasta 10 archivos simultaneos)
- Drag-and-drop zone

**Flujo de upload**:

1. Archivo seleccionado o dropeado
2. Validacion client-side (formato, tamano)
3. Upload a Supabase Storage (bucket `media`)
4. Generar URL publica
5. Insertar registro en tabla `media` con metadatos
6. Mostrar en el grid

### 9.3 Detalle de Imagen (Modal/Panel)

Al hacer clic en una imagen:

| Campo           | Tipo                | Descripcion                             |
| --------------- | ------------------- | --------------------------------------- |
| Preview         | -                   | Imagen a tamano visible                 |
| Nombre          | text (readonly)     | Nombre del archivo                      |
| URL             | text (copy button)  | URL publica del archivo                 |
| Tamano          | text (readonly)     | Tamano en KB/MB                         |
| Dimensiones     | text (readonly)     | Ancho x Alto px                         |
| Alt Text        | text (multilingual) | Texto alternativo por idioma            |
| Carpeta         | select              | Carpeta de organizacion                 |
| Fecha de subida | text (readonly)     | Fecha y hora                            |
| En uso          | list (readonly)     | Listado de modulos que usan esta imagen |

**Acciones**:

- "Copiar URL" — Copia al clipboard
- "Editar Alt Text" — Editar alt text por idioma
- "Mover a Carpeta" — Cambiar carpeta
- "Eliminar" — Con verificacion de uso. Si esta en uso, mostrar advertencia: "Esta imagen esta siendo usada en los modulos: [lista]. Eliminarla reemplazara la referencia con un placeholder."

### 9.4 Verificacion de Uso

Antes de eliminar una imagen, buscar su URL en todos los campos JSONB de `page_modules` y `site_config`:

```typescript
async function checkImageUsage(imageUrl: string): Promise<string[]> {
  const supabase = await createServerClient()
  const usages: string[] = []

  // Buscar en page_modules
  const { data: modules } = await supabase.from('page_modules').select('section_key, content')

  for (const module of modules || []) {
    const contentStr = JSON.stringify(module.content)
    if (contentStr.includes(imageUrl)) {
      usages.push(`Modulo: ${module.section_key}`)
    }
  }

  // Buscar en site_config
  const { data: config } = await supabase
    .from('site_config')
    .select('logo_url, favicon_url')
    .single()

  if (config?.logo_url === imageUrl) usages.push('Logo del sitio')
  if (config?.favicon_url === imageUrl) usages.push('Favicon del sitio')

  return usages
}
```

---

## 10. Integraciones (`/admin/integrations`)

### 10.1 Interfaz

**Layout**: Grid de tarjetas, una por integracion.

```
+---------------------------+  +---------------------------+
| [GA Icon]                 |  | [Meta Icon]               |
| Google Analytics 4        |  | Meta Pixel                |
| [Toggle: OFF]             |  | [Toggle: OFF]             |
|                           |  |                           |
| Rastrea visitas y eventos |  | Pixel de conversion       |
| [Configurar]              |  | [Configurar]              |
+---------------------------+  +---------------------------+

+---------------------------+  +---------------------------+
| [WA Icon]                 |  | [Cal Icon]                |
| WhatsApp                  |  | Calendly                  |
| [Toggle: OFF]             |  | [Toggle: OFF]             |
|                           |  |                           |
| Boton flotante de chat    |  | Widget de agenda          |
| [Configurar]              |  | [Configurar]              |
+---------------------------+  +---------------------------+

+---------------------------+  +---------------------------+
| [Mail Icon]               |  | [Code Icon]               |
| Notificaciones SMTP       |  | Scripts Personalizados    |
| [Toggle: OFF]             |  | [Toggle: OFF]             |
|                           |  |                           |
| Email al recibir leads    |  | Scripts en head/body      |
| [Configurar]              |  | [Configurar]              |
+---------------------------+  +---------------------------+
```

### 10.2 Configuracion por Integracion

Al hacer clic en "Configurar", se abre un modal o panel con los campos especificos de cada integracion. Ver `INTEGRATIONS.md` para el detalle completo de cada una.

Cada integracion tiene:

- Toggle de activacion
- Formulario de configuracion
- Boton "Probar" (donde aplique)
- Boton "Guardar"

---

## 11. Leads (`/admin/leads`)

### 11.1 Tabla Principal

**Barra de herramientas**:

- Filtro por estado: "Todos", "Sin leer", "Leidos"
- Filtro por fecha: selector de rango de fechas
- Filtro por modulo fuente: "Formulario de Contacto", "Newsletter"
- Busqueda por nombre o email
- Boton "Exportar CSV" (exporta los leads filtrados)
- Boton "Marcar Seleccionados como Leidos"

**Columnas de la tabla**:

| Columna  | Tipo     | Sorteable | Descripcion                                  |
| -------- | -------- | :-------: | -------------------------------------------- |
| Checkbox | checkbox |    No     | Para seleccion multiple                      |
| Estado   | badge    |    Si     | Indicador "Nuevo" o "Leido"                  |
| Nombre   | text     |    Si     | Nombre del lead                              |
| Email    | text     |    Si     | Email del lead                               |
| Telefono | text     |    No     | Telefono (si existe)                         |
| Fuente   | badge    |    Si     | Modulo de origen                             |
| Fecha    | date     |    Si     | Fecha relativa con tooltip de fecha completa |
| Acciones | buttons  |    No     | "Ver detalle", "Marcar leido/no leido"       |

**Paginacion**: 20 leads por pagina, con navegacion de paginas.

### 11.2 Detalle de Lead (Modal)

Al hacer clic en un lead o en "Ver detalle":

```
+--------------------------------------------------+
| Lead: Juan Garcia                                 |
| Email: juan@example.com                           |
| Telefono: +34 600 123 456                         |
| Fecha: 3 de abril de 2026 a las 14:23            |
| Fuente: Formulario de Contacto (offer_form)       |
| IP: 192.168.1.100                                 |
| Idioma: es                                        |
|                                                    |
| --- Datos del Formulario ---                       |
| Nombre: Juan Garcia                                |
| Email: juan@example.com                            |
| Telefono: +34 600 123 456                          |
| Mensaje: Me interesa saber mas sobre...            |
|                                                    |
| [Marcar como Leido] [Eliminar] [Cerrar]           |
+--------------------------------------------------+
```

### 11.3 Exportacion CSV

**Formato del CSV**:

```csv
"id","nombre","email","telefono","mensaje","fuente","idioma","fecha","leido"
"uuid-1","Juan Garcia","juan@example.com","+34600123456","Me interesa...","offer_form","es","2026-04-03T14:23:00Z","false"
```

**Logica**:

- Exporta los leads que cumplan los filtros activos
- Encoding UTF-8 con BOM para compatibilidad con Excel
- Nombre del archivo: `leads_YYYY-MM-DD.csv`

### 11.4 API de Leads

```typescript
// GET /api/leads — Listado con filtros y paginacion
// PATCH /api/leads/[id] — Actualizar estado (is_read)
// DELETE /api/leads/[id] — Eliminar lead
// GET /api/leads/export — Exportar CSV
// PATCH /api/leads/bulk — Acciones masivas (marcar leidos)
```

---

## 12. Settings (`/admin/settings`)

### 12.1 Secciones

#### Configuracion del Sitio

| Campo                   | Tipo                    | Descripcion                   |
| ----------------------- | ----------------------- | ----------------------------- |
| Nombre del Sitio        | text                    | Se muestra en el header y SEO |
| Descripcion del Sitio   | textarea (multilingual) | Descripcion general           |
| Email de Contacto       | email                   | Email principal               |
| Links de Redes Sociales | list                    | Plataforma + URL por cada red |

#### Informacion de Conexion (Solo Lectura)

| Campo              | Valor                                             |
| ------------------ | ------------------------------------------------- |
| Supabase URL       | `https://xxx.supabase.co` (mostrado parcialmente) |
| Estado de Conexion | Badge verde "Conectado" o rojo "Error"            |
| Tablas en BD       | 10/10 tablas verificadas                          |
| Version de Orion   | v1.0.0                                            |

#### Backup y Restauracion

**Exportar Backup**:

- Boton "Exportar Todo como JSON"
- Exporta: site_config, theme_config, page_modules, languages, seo_config, integrations, color_palettes (personalizadas)
- No exporta: leads (por privacidad), media files (solo URLs)
- Formato: archivo JSON descargable `backup_YYYY-MM-DD.json`

**Restaurar Backup**:

- Boton "Importar Backup"
- Selector de archivo JSON
- Validacion del formato antes de importar
- Confirmacion: "Esto reemplazara toda la configuracion actual. Continuar?"
- Importa solo las tablas de configuracion, no sobreescribe leads ni media

**Estructura del backup JSON**:

```json
{
  "version": "1.0.0",
  "exported_at": "2026-04-04T12:00:00Z",
  "data": {
    "site_config": { ... },
    "theme_config": { ... },
    "languages": [ ... ],
    "color_palettes": [ ... ],
    "page_modules": [ ... ],
    "module_schemas": [ ... ],
    "seo_config": [ ... ],
    "integrations": [ ... ]
  }
}
```

#### Gestion de Usuarios

- Tabla de usuarios admin existentes
- Boton "Invitar Admin" (crear nuevo usuario con email + contrasena temporal)
- Opcion de cambiar contrasena propia
- Opcion de eliminar usuario (excepto el ultimo admin — proteccion)

### 12.2 API de Settings

```typescript
// PUT /api/settings/site-config — Actualizar configuracion del sitio
// GET /api/settings/backup — Exportar backup
// POST /api/settings/restore — Importar backup
// POST /api/settings/users — Crear nuevo usuario admin
// DELETE /api/settings/users/[id] — Eliminar usuario admin
// PUT /api/settings/users/[id]/password — Cambiar contrasena
```

---

## 13. Responsive Admin

### 13.1 Breakpoints

| Breakpoint                    | Comportamiento                                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Desktop (1280px+)             | Layout completo, sidebar expandida, todas las funcionalidades                                                                                                                                          |
| Tablet (1024px-1279px)        | Sidebar colapsada (solo iconos), contenido ajustado                                                                                                                                                    |
| Tablet pequena (768px-1023px) | Sidebar como drawer, contenido full-width, funcionalidad completa                                                                                                                                      |
| Mobile (<768px)               | **Solo lectura**. Banner "Admin en modo solo lectura en dispositivos moviles. Para editar, usa una tablet o computadora." Se puede navegar y ver, pero los formularios de edicion estan deshabilitados |

### 13.2 Justificacion del Mobile Read-Only

La edicion de contenido CMS complejo (rich text, listas anidadas, drag-and-drop, previews lado a lado) no es una experiencia aceptable en pantallas menores a 768px. En lugar de ofrecer una experiencia degradada que cause errores, se opta por permitir la consulta (ver leads, estadisticas, estado del sitio) pero restringir la edicion.

### 13.3 Componente de Restriccion Mobile

```typescript
// src/components/admin/MobileReadOnlyGuard.tsx

'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function MobileReadOnlyGuard({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isMobile) {
    return (
      <div className="pointer-events-none opacity-60">
        <Alert className="mb-4 pointer-events-auto opacity-100">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Modo Solo Lectura</AlertTitle>
          <AlertDescription>
            El panel de administracion requiere una pantalla de al menos 768px para editar contenido.
            Puedes consultar informacion pero no realizar cambios.
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## Apendice A: Esquema de Componentes UI del Admin

Todos los componentes del admin se construyen con **shadcn/ui**. Los componentes principales:

| Componente     | Uso                                        |
| -------------- | ------------------------------------------ |
| `Button`       | Todos los botones del admin                |
| `Input`        | Campos de texto                            |
| `Textarea`     | Campos multilinea                          |
| `Select`       | Selects y dropdowns                        |
| `Switch`       | Toggles on/off                             |
| `Table`        | Tablas de datos (leads, modulos)           |
| `Card`         | Tarjetas KPI del dashboard                 |
| `Dialog`       | Modales de confirmacion y detalle          |
| `Sheet`        | Paneles laterales deslizantes              |
| `Tabs`         | Tabs de idioma y secciones                 |
| `Badge`        | Badges de estado                           |
| `Alert`        | Mensajes de alerta y notificacion          |
| `Breadcrumb`   | Navegacion de migas de pan                 |
| `Skeleton`     | Placeholders de carga                      |
| `Toast`        | Notificaciones transitorias (exito, error) |
| `DropdownMenu` | Menu de usuario y acciones                 |
| `Command`      | Busqueda rapida de acciones                |

## Apendice B: API Routes Completas del Admin

| Metodo | Ruta                                | Descripcion                   |
| ------ | ----------------------------------- | ----------------------------- |
| GET    | `/api/modules`                      | Listar todos los modulos      |
| GET    | `/api/modules/[id]`                 | Obtener un modulo             |
| PUT    | `/api/modules/[id]`                 | Actualizar contenido completo |
| PATCH  | `/api/modules/[id]`                 | Actualizar parcialmente       |
| PATCH  | `/api/modules/[id]/visibility`      | Toggle visibilidad            |
| PATCH  | `/api/modules/reorder`              | Reordenar modulos             |
| GET    | `/api/leads`                        | Listar leads con filtros      |
| GET    | `/api/leads/[id]`                   | Detalle de un lead            |
| PATCH  | `/api/leads/[id]`                   | Actualizar lead (is_read)     |
| DELETE | `/api/leads/[id]`                   | Eliminar lead                 |
| PATCH  | `/api/leads/bulk`                   | Acciones masivas              |
| GET    | `/api/leads/export`                 | Exportar CSV                  |
| PUT    | `/api/design/theme`                 | Actualizar tema               |
| GET    | `/api/languages`                    | Listar idiomas                |
| POST   | `/api/languages`                    | Agregar idioma                |
| DELETE | `/api/languages/[code]`             | Eliminar idioma               |
| PUT    | `/api/seo/[lang]`                   | Actualizar SEO                |
| GET    | `/api/media`                        | Listar medios                 |
| POST   | `/api/media/upload`                 | Subir archivo                 |
| PUT    | `/api/media/[id]`                   | Actualizar metadata           |
| DELETE | `/api/media/[id]`                   | Eliminar archivo              |
| GET    | `/api/integrations`                 | Listar integraciones          |
| PUT    | `/api/integrations/[type]`          | Actualizar integracion        |
| POST   | `/api/integrations/[type]/test`     | Probar integracion            |
| PUT    | `/api/settings/site-config`         | Actualizar config sitio       |
| GET    | `/api/settings/backup`              | Exportar backup               |
| POST   | `/api/settings/restore`             | Importar backup               |
| POST   | `/api/settings/users`               | Crear usuario admin           |
| DELETE | `/api/settings/users/[id]`          | Eliminar usuario              |
| PUT    | `/api/settings/users/[id]/password` | Cambiar contrasena            |
