# Guía: Creación de Temas Personalizados

> **Audiencia**: Diseñadores y desarrolladores que quieren crear y distribuir temas para Orion Landing Universal.
> **Versión del sistema**: 0.1.0+ (S8)

---

## Índice

1. [Arquitectura del sistema de temas](#1-arquitectura-del-sistema-de-temas)
2. [CSS variables disponibles](#2-css-variables-disponibles)
3. [Estructura de una paleta de colores](#3-estructura-de-una-paleta-de-colores)
4. [Estructura completa de un tema](#4-estructura-completa-de-un-tema)
5. [Crear un tema desde el panel admin](#5-crear-un-tema-desde-el-panel-admin)
6. [Exportar un tema](#6-exportar-un-tema)
7. [Importar un tema](#7-importar-un-tema)
8. [Crear una paleta desde código](#8-crear-una-paleta-desde-código)
9. [Ejemplo completo: tema "Corporate Blue"](#ejemplo-completo-tema-corporate-blue)
10. [Preparación para el marketplace](#10-preparación-para-el-marketplace)

---

## 1. Arquitectura del sistema de temas

El sistema de temas se compone de tres capas:

```
ColorPalette (colores base)
    ↓
ThemeConfig (paleta + tipografía + spacing + border-radius)
    ↓
CSS Custom Properties en :root (lo que los módulos usan)
```

**Flujo de aplicación**:

1. El servidor lee `theme_config` y `color_palettes` de Supabase.
2. La función `themeConfigToCSSVars()` (`src/lib/themes/utils.ts`) convierte la configuración a un string de CSS custom properties.
3. El `ThemeProvider` (`src/lib/themes/provider.tsx`) inyecta esas variables en un `<style>` tag global.
4. Todos los módulos consumen exclusivamente `var(--color-*)` y `var(--font-*)` — nunca valores hardcodeados.

**Archivos clave**:

| Archivo                       | Rol                                                       |
| ----------------------------- | --------------------------------------------------------- |
| `src/lib/themes/types.ts`     | Interfaces `PaletteColors`, `ColorPalette`, `ThemeConfig` |
| `src/lib/themes/utils.ts`     | Funciones de conversión a CSS vars                        |
| `src/lib/themes/palettes.ts`  | Paletas predefinidas (20 paletas)                         |
| `src/lib/themes/provider.tsx` | Componente que inyecta las vars en `<style>`              |
| `src/app/api/design/`         | API para leer/actualizar el tema activo                   |

---

## 2. CSS variables disponibles

Estas son las variables que todos los módulos deben usar. Al crear un tema, se definen los valores de estas variables.

### Colores

| Variable CSS             | Mapeada desde           | Uso típico                                        |
| ------------------------ | ----------------------- | ------------------------------------------------- |
| `--color-primary`        | `colors.primary`        | Botones principales, links, elementos de marca    |
| `--color-secondary`      | `colors.secondary`      | Botones secundarios, variante oscura del primario |
| `--color-accent`         | `colors.accent`         | Highlights, badges, iconos activos                |
| `--color-background`     | `colors.background`     | Fondo de página                                   |
| `--color-surface`        | `colors.surface`        | Fondo de tarjetas, paneles, inputs                |
| `--color-text-primary`   | `colors.text_primary`   | Texto principal (headings, body)                  |
| `--color-text-secondary` | `colors.text_secondary` | Texto secundario (subtítulos, metadatos)          |
| `--color-success`        | `colors.success`        | Mensajes de éxito                                 |
| `--color-error`          | `colors.error`          | Mensajes de error, alertas críticas               |
| `--color-warning`        | `colors.warning`        | Alertas de advertencia                            |
| `--color-info`           | `colors.info`           | Mensajes informativos                             |
| `--color-border`         | `colors.border`         | Bordes de tarjetas, separadores, inputs           |
| `--color-foreground`     | `colors.text_primary`   | Alias de text_primary (compatibilidad)            |

### Tipografía

| Variable CSS       | Mapeada desde             | Valores típicos       |
| ------------------ | ------------------------- | --------------------- |
| `--font-heading`   | `typography.font_heading` | `'Inter', sans-serif` |
| `--font-body`      | `typography.font_body`    | `'Inter', sans-serif` |
| `--font-size-base` | `typography.base_size`    | `'16px'`              |

### Espaciado (spacing presets)

| Variable CSS            | Preset compact | Preset comfortable | Preset spacious |
| ----------------------- | -------------- | ------------------ | --------------- |
| `--section-padding`     | `3rem`         | `4.5rem`           | `6rem`          |
| `--container-max-width` | `1100px`       | `1200px`           | `1400px`        |
| `--element-gap`         | `0.75rem`      | `1rem`             | `1.5rem`        |

### Border radius

| Variable CSS      | none  | small | medium | large  | full     |
| ----------------- | ----- | ----- | ------ | ------ | -------- |
| `--border-radius` | `0px` | `4px` | `8px`  | `16px` | `9999px` |

---

## 3. Estructura de una paleta de colores

Una paleta define los 12 colores base del tema.

```typescript
interface PaletteColors {
  primary: string // Color de marca principal (hex)
  secondary: string // Variante secundaria del primario
  accent: string // Color de acento/highlight
  background: string // Fondo global de la página
  surface: string // Fondo de elementos elevados (cards, inputs)
  text_primary: string // Color principal del texto
  text_secondary: string // Color secundario del texto
  success: string // Verde para estados de éxito
  error: string // Rojo para estados de error
  warning: string // Amarillo/naranja para advertencias
  info: string // Azul para información
  border: string // Color para bordes y separadores
}
```

**Consideraciones de accesibilidad**:

- El contraste entre `text_primary` y `background` debe ser ≥ 4.5:1 (WCAG AA).
- El contraste entre `text_secondary` y `background` debe ser ≥ 3:1.
- El contraste entre texto sobre `primary` (botones) debe ser ≥ 4.5:1.

---

## 4. Estructura completa de un tema

Un tema exportado como JSON incluye la paleta, tipografía, espaciado y border-radius.

```typescript
interface ThemeExport {
  version: '1'
  palette: {
    name: string
    colors: PaletteColors
  } | null
  typography: {
    font_heading: string // Nombre exacto de Google Fonts o fuente del sistema
    font_body: string
    base_size: string // CSS: '14px', '16px', '18px'
    scale_ratio: number // Escala tipográfica: 1.2, 1.25, 1.333
  }
  spacing: {
    section_padding: 'compact' | 'comfortable' | 'spacious'
    container_max_width: string // CSS: '1200px'
    element_gap: string // CSS: '16px'
  }
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full'
  customColors: Record<string, string> // Overrides puntuales sobre la paleta
  createdAt: string // ISO timestamp
}
```

---

## 5. Crear un tema desde el panel admin

El panel admin en `/admin` tiene una sección **Diseño** con estas sub-secciones:

### 5.1 Seleccionar paleta base

1. Ir a `Admin → Diseño → Paletas`.
2. Elegir una de las 20 paletas predefinidas por nicho o crear una personalizada.
3. Hacer clic en **Aplicar paleta**.

Las 20 paletas predefinidas cubren nichos: tecnología, salud, educación, restaurantes, moda, finanzas, etc.

### 5.2 Configurar tipografía

1. Ir a `Admin → Diseño → Tipografía`.
2. Seleccionar la fuente para headings y para el cuerpo del texto.
3. Los nombres deben ser exactamente el nombre de la fuente en Google Fonts (ej: `"Inter"`, `"Playfair Display"`, `"Roboto Mono"`).

### 5.3 Configurar espaciado y bordes

1. Ir a `Admin → Diseño → Espaciado`.
2. Seleccionar un preset: `compact`, `comfortable` (por defecto) o `spacious`.
3. Seleccionar el radio de bordes para botones y tarjetas.

### 5.4 Colores personalizados (overrides)

Si la paleta base no cubre un color específico, se pueden sobrescribir colores individuales desde `Admin → Diseño → Colores personalizados`. Estos overrides se guardan en `custom_colors` y tienen prioridad sobre la paleta base.

---

## 6. Exportar un tema

### Desde el panel admin

1. Ir a `Admin → Diseño → Exportar`.
2. Clic en **Exportar tema completo** para descargar `orion-theme-YYYY-MM-DD.json`.
3. Clic en **Exportar solo paleta** para descargar `orion-palette-YYYY-MM-DD.json`.

### Vía API

```bash
# Exportar tema completo (requiere sesión activa)
GET /api/design/theme/export

# Exportar paleta activa
GET /api/design/palette/export
```

Ambos endpoints devuelven un archivo con `Content-Disposition: attachment`.

---

## 7. Importar un tema

### Desde el panel admin

1. Ir a `Admin → Diseño → Importar`.
2. Seleccionar el archivo `.json` del tema.
3. Clic en **Importar y aplicar**.
4. La página se recargará con los nuevos estilos.

### Vía API

```bash
POST /api/design/theme/import
Content-Type: application/json

{
  "version": "1",
  "palette": {
    "name": "Corporate Blue",
    "colors": { ... }
  },
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
  "borderRadius": "medium",
  "customColors": {}
}
```

Al importar un tema con paleta, el sistema crea automáticamente una nueva entrada en `color_palettes` con `is_predefined: false`.

```bash
# Importar solo paleta
POST /api/design/palette/import
Content-Type: application/json

{
  "version": "1",
  "name": "My Custom Palette",
  "colors": { ... }
}
```

---

## 8. Crear una paleta desde código

Para distribuir una paleta como parte de un proyecto o plugin, puede definirse directamente en `src/lib/themes/palettes.ts`:

```typescript
// src/lib/themes/palettes.ts — agregar al PALETTE_MAP
'corporate-blue-dark': {
  primary: '#1d4ed8',
  secondary: '#1e3a8a',
  accent: '#60a5fa',
  background: '#0f172a',
  surface: '#1e293b',
  text_primary: '#f1f5f9',
  text_secondary: '#94a3b8',
  success: '#22c55e',
  error: '#f87171',
  warning: '#fbbf24',
  info: '#38bdf8',
  border: '#334155',
},
```

Si la paleta debe aparecer en el admin, también debe existir una fila correspondiente en la tabla `color_palettes` de Supabase. Agregar la inserción en la migración de seed:

```sql
INSERT INTO color_palettes (id, name, description, niche, colors, is_predefined)
VALUES (
  'corporate-blue-dark',
  'Corporate Blue Dark',
  'Variante oscura del azul corporativo. Ideal para SaaS y tecnología.',
  'technology',
  '{
    "primary": "#1d4ed8",
    "secondary": "#1e3a8a",
    "accent": "#60a5fa",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text_primary": "#f1f5f9",
    "text_secondary": "#94a3b8",
    "success": "#22c55e",
    "error": "#f87171",
    "warning": "#fbbf24",
    "info": "#38bdf8",
    "border": "#334155"
  }'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;
```

---

## Ejemplo completo: tema "Corporate Blue"

Este es un ejemplo de un archivo de tema listo para importar o distribuir.

```json
{
  "version": "1",
  "palette": {
    "name": "Corporate Blue",
    "colors": {
      "primary": "#1d4ed8",
      "secondary": "#1e3a8a",
      "accent": "#3b82f6",
      "background": "#ffffff",
      "surface": "#eff6ff",
      "text_primary": "#0f172a",
      "text_secondary": "#475569",
      "success": "#16a34a",
      "error": "#dc2626",
      "warning": "#d97706",
      "info": "#0284c7",
      "border": "#bfdbfe"
    }
  },
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
  "borderRadius": "medium",
  "customColors": {},
  "createdAt": "2026-04-05T00:00:00.000Z"
}
```

Para importarlo:

```bash
curl -X POST https://tu-sitio.com/api/design/theme/import \
  -H "Content-Type: application/json" \
  -H "Cookie: [sesión activa]" \
  -d @corporate-blue-theme.json
```

---

## 10. Preparación para el marketplace

El sistema de temas fue diseñado desde el inicio para ser compatible con un marketplace de temas (ADR-007). Al crear un tema para distribución, seguir estas convenciones para asegurar compatibilidad futura.

### Formato estándar de un paquete de tema

```
mi-tema/
  theme.json           ← Configuración completa (formato descrito en sección 4)
  preview.png          ← Captura de pantalla 1200×800 (requerida para marketplace)
  README.md            ← Descripción, nichos de uso, instrucciones
  LICENSE              ← MIT o compatible
```

### Metadatos recomendados (extensión futura)

El campo `version` del JSON actualmente es `"1"`. Para preparar el tema para el marketplace, incluir un campo `meta` adicional (ignorado por el importador actual pero útil para herramientas futuras):

```json
{
  "version": "1",
  "meta": {
    "name": "Corporate Blue",
    "author": "Tu nombre o empresa",
    "description": "Tema profesional para SaaS y corporaciones en industria tech.",
    "niches": ["technology", "saas", "corporate"],
    "tags": ["blue", "professional", "clean"],
    "previewUrl": "https://ejemplo.com/preview",
    "license": "MIT"
  },
  "palette": { ... },
  "typography": { ... },
  "spacing": { ... },
  "borderRadius": "medium",
  "customColors": {}
}
```

### Convenciones de naming

- `id` de paleta: kebab-case, descriptivo del color y nicho. Ej: `emerald-health`, `sunset-warm`, `midnight-saas`.
- Evitar IDs genéricos (`theme-1`, `custom-palette`) — son difíciles de identificar en la DB.
- El campo `niche` acepta cualquier string. Los valores usados por las paletas predefinidas son: `technology`, `health`, `education`, `restaurant`, `fashion`, `finance`, `real-estate`, `custom`.

### Flujo de validación antes de publicar en marketplace

1. Importar el `theme.json` en una instalación limpia.
2. Verificar contraste de colores con una herramienta como [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
3. Probar en los 19 módulos del sistema (especialmente hero, pricing, final_cta — son los más sensibles al color).
4. Verificar que el tema funciona bien en modo oscuro (si `background` es oscuro, asegurarse de que `surface` y `border` también lo sean).
5. Incluir un `preview.png` generado desde la landing con los datos de seed por defecto.
