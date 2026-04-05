# ADR-007: Sistema de Temas Preparado para Marketplace

**Fecha**: 2026-04-04  
**Estado**: Aceptado  
**Autor**: Luis Enrique Gutiérrez Campos

---

## Contexto

Orion Landing Universal necesita un sistema de personalización visual que permita a los usuarios cambiar la apariencia de su landing page sin escribir CSS. Los requisitos son:

- **20 paletas predefinidas** por nicho de industria (salud, tecnología, legal, gastronomía, etc.)
- **Personalización granular**: Colores, tipografía, espaciado, border-radius
- **Paletas personalizadas**: El usuario puede crear sus propias paletas desde el admin
- **Futuro marketplace**: La arquitectura debe soportar un marketplace donde la comunidad pueda compartir, importar y exportar paletas de color

La pregunta es: **¿cómo se diseña el sistema de temas para que sea funcional hoy y extensible para un marketplace futuro?**

---

## Decisión

Se implementa un sistema de temas basado en:

1. **Tabla `color_palettes`** con flag `is_predefined` para diferenciar paletas del sistema vs paletas del usuario
2. **Tabla `theme_config`** singleton que referencia la paleta activa y almacena configuración de tipografía, espaciado y overrides
3. **Formato JSON estandarizado** para paletas que permite importación/exportación directa
4. **CSS custom properties** como mecanismo de aplicación del tema al DOM
5. **Arquitectura de datos preparada para marketplace** sin implementar el marketplace en v1.0

---

## Alternativas Consideradas

### 1. Paletas en BD con formato estandarizado + CSS variables — SELECCIONADO

**Descripción**: Las paletas se almacenan en la tabla `color_palettes` como registros con un JSONB de colores estandarizado. La paleta activa se referencia desde `theme_config.palette_id`. Los colores se aplican al DOM como CSS custom properties.

**Pros**:

- **Estructura de datos clara**: Cada paleta es un registro con un JSON de colores — fácil de exportar como archivo `.json`, compartir, o importar desde otro sitio
- **Formato estándar**: Todas las paletas (predefinidas y personalizadas) siguen exactamente la misma estructura JSONB con las mismas claves (`primary`, `secondary`, `accent`, `background`, etc.)
- **Inmutabilidad de predefinidas**: Las 20 paletas predefinidas tienen `is_predefined = true` y no pueden ser modificadas ni eliminadas (protegido por RLS)
- **Overrides por paleta**: `theme_config.custom_colors` permite sobreescribir colores específicos de la paleta activa sin duplicarla
- **CSS variables**: El tema se aplica al DOM como `--color-primary: #2563eb` en `:root`, lo que permite que Tailwind CSS 4 y los componentes los consuman nativamente
- **Marketplace-ready**: Importar una paleta comunitaria = INSERT en `color_palettes` con `is_predefined = false`; exportar = SELECT + JSON stringify
- **Previsualización instantánea**: Cambiar la paleta activa actualiza las CSS variables y la página se repinta sin reload

**Contras**:

- Los temas solo cubren colores, tipografía y espaciado — no layouts ni variantes de componentes (suficiente para v1.0)
- Las paletas predefinidas consumen espacio en la base de datos (20 filas con JSONB — impacto despreciable)
- El formato JSON no incluye metadatos avanzados (licencia, autor, versión) — se agregarán cuando se implemente el marketplace

### 2. Temas como archivos CSS/Tailwind config

**Descripción**: Cada tema es un archivo de configuración de Tailwind CSS o un archivo `.css` con variables custom.

```
src/themes/
  professional-blue.css
  emerald-health.css
  dark-mode.css
  ...
```

**Pros**:

- Familiar para desarrolladores frontend
- Soporte nativo de Tailwind CSS
- Sin base de datos para los temas

**Contras**:

- **No editable desde el admin**: Cambiar de tema requiere modificar archivos y hacer redeploy
- **Contradice zero-code**: El usuario no puede crear una paleta personalizada desde el navegador
- **No marketplace-ready**: Agregar una paleta comunitaria requiere copiar un archivo al repositorio y hacer build
- **Sincronización**: El admin panel necesitaría leer el filesystem para listar temas disponibles — frágil en serverless

### 3. Tailwind CSS Themes Plugin

**Descripción**: Usar un plugin de Tailwind como `tailwindcss-themer` o `daisyUI` que define temas como configuración.

**Pros**:

- Integración nativa con el sistema de utilidades de Tailwind
- Temas tipados y con autocompletado en el editor
- Soporte para modo oscuro/claro automático

**Contras**:

- **Estático**: Los temas se definen en `tailwind.config.ts` en tiempo de build
- **No CMS-friendly**: El admin panel no puede crear ni modificar temas dinámicamente
- **Lock-in a Tailwind plugins**: Si Tailwind cambia su API de plugins (como hizo en v4), los temas se rompen
- **Sin marketplace path**: Los plugins de Tailwind no tienen un formato de intercambio estándar

### 4. Theme engine complejo con layouts y variantes

**Descripción**: Un sistema de temas completo que incluye no solo colores sino también variantes de layout (hero con imagen a la izquierda vs derecha vs full-screen), tipografía completa, animaciones y spacing grids.

**Pros**:

- Máxima personalización: cada tema cambia radicalmente la apariencia del sitio
- Similar a WordPress themes que cambian el layout completo

**Contras**:

- **Complejidad enorme**: Cada módulo necesitaría múltiples variantes de layout, multiplicando el código
- **Mantenimiento insostenible**: 19 módulos × N variantes de layout × M temas = explosión combinatoria
- **Inconsistencia garantizada**: Con muchas variantes, mantener calidad visual consistente es extremadamente difícil
- **Scope creep**: Implementar esto retrasa significativamente el lanzamiento de v1.0
- **Over-engineering**: Para una landing page, cambiar colores + tipografía + spacing cubre el 90% de las necesidades de personalización

---

## Consecuencias

### Positivas

- **Personalización inmediata**: 20 paletas predefinidas cubren los nichos más comunes — el usuario tiene una base visual profesional desde el primer minuto
- **Paletas personalizadas**: El admin puede crear paletas propias sin limitaciones
- **Overrides granulares**: El usuario puede tomar una paleta predefinida y cambiar solo el color primario sin duplicar toda la paleta
- **Formato de intercambio**: Las paletas son JSON — se pueden copiar/pegar, enviar por email, publicar en GitHub
- **Camino claro al marketplace**: La estructura de datos ya soporta paletas comunitarias. Implementar el marketplace significa agregar una UI de "explorar paletas" + un endpoint de importación, sin cambiar el modelo de datos
- **CSS variables performantes**: Cambiar de paleta es instantáneo (actualizar `:root` CSS variables) sin re-render de React

### Negativas

- **Solo colores y tipografía**: Los temas en v1.0 no cambian layouts ni variantes de componentes
- **20 paletas en la BD**: Las paletas predefinidas ocupan espacio en la base de datos de cada instalación (impacto insignificante)
- **Sin marketplace en v1.0**: La arquitectura está preparada, pero el marketplace como tal (explorar, calificar, instalar) es funcionalidad futura

### Riesgos

- **Conflicto de colores**: Un usuario puede crear una paleta con bajo contraste (texto gris sobre fondo gris). Mitigación: el admin panel incluirá un checker de contraste WCAG que advierte sobre combinaciones con bajo contraste
- **Paletas importadas malformadas**: Un JSON importado puede tener claves faltantes o valores inválidos. Mitigación: validación Zod al importar, que verifica que todas las claves requeridas existan y los valores sean colores válidos
- **CSS variable injection**: Si un color importado contiene CSS malicioso (ej: `red; background-image: url(evil.com)`), podría inyectar estilos. Mitigación: validar que cada valor de color sea un color CSS válido (hex, rgb, hsl) y nada más

---

## Especificaciones Técnicas

### Formato Estándar de Paleta

Toda paleta — predefinida, personalizada o importada — debe cumplir con esta estructura:

```typescript
interface ColorPalette {
  id: string // Identificador único (slug)
  name: string // Nombre legible
  description: string // Descripción del nicho/uso
  niche: string // Categoría del nicho
  colors: {
    primary: string // Color principal de la marca
    secondary: string // Color secundario/complementario
    accent: string // Color de acento para CTAs y highlights
    background: string // Fondo principal de la página
    surface: string // Fondo de tarjetas y secciones alternas
    text_primary: string // Color de texto principal
    text_secondary: string // Color de texto secundario/muted
    success: string // Estado de éxito
    error: string // Estado de error
    warning: string // Estado de advertencia
    info: string // Estado informativo
    border: string // Color de bordes
  }
  is_predefined: boolean // true = paleta del sistema, inmutable
}
```

### Aplicación al DOM

```typescript
// Theme engine: aplica la paleta como CSS custom properties
function applyTheme(palette: ColorPalette, overrides?: Partial<ColorPalette['colors']>) {
  const colors = { ...palette.colors, ...overrides }
  const root = document.documentElement

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key.replace('_', '-')}`, value)
  })
}
```

```css
/* Tailwind CSS 4 consume las variables */
@theme {
  --color-primary: var(--color-primary);
  --color-secondary: var(--color-secondary);
  --color-accent: var(--color-accent);
  /* ... */
}
```

### Exportación e Importación

**Exportar**:

```typescript
// Genera un JSON descargable
function exportPalette(palette: ColorPalette): string {
  const exportable = {
    name: palette.name,
    description: palette.description,
    niche: palette.niche,
    colors: palette.colors,
    _meta: {
      format: 'orion-palette-v1',
      exported_at: new Date().toISOString(),
      source: 'Orion Landing Universal',
    },
  }
  return JSON.stringify(exportable, null, 2)
}
```

**Importar**:

```typescript
// Valida y crea la paleta en la BD
const paletteImportSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(''),
  niche: z.string().max(100).default('custom'),
  colors: z.object({
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    surface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    text_primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    text_secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    success: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    error: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    warning: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    info: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    border: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }),
  _meta: z
    .object({
      format: z.literal('orion-palette-v1'),
    })
    .optional(),
})
```

### Roadmap del Marketplace

| Fase     | Funcionalidad                                                           | Estado      |
| -------- | ----------------------------------------------------------------------- | ----------- |
| **v1.0** | 20 paletas predefinidas + paletas personalizadas + import/export JSON   | Actual      |
| **v1.5** | Galería pública de paletas comunitarias (read-only, curada)             | Planificado |
| **v2.0** | Marketplace completo: publicar, calificar, instalar paletas con un clic | Futuro      |
| **v2.5** | Temas completos (paleta + tipografía + spacing + layouts)               | Futuro      |

La estructura de datos actual (`color_palettes` con `is_predefined` flag y formato JSON estandarizado) soporta todas las fases sin cambios de schema.

---

## Referencias

- [CSS Custom Properties Specification](https://www.w3.org/TR/css-variables-1/) — estándar de CSS variables
- [Tailwind CSS 4 Theme Configuration](https://tailwindcss.com/docs/theme) — integración con variables CSS
- [WCAG Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) — estándares de contraste para accesibilidad
- [Shadcn/ui Theming](https://ui.shadcn.com/docs/theming) — referencia de cómo shadcn/ui usa CSS variables para temas
- [ADR-002: Backend Supabase](ADR-002-backend-supabase.md) — PostgreSQL JSONB como almacenamiento de paletas
