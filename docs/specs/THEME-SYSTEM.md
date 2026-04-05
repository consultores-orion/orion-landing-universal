# THEME-SYSTEM.md — Especificacion del Sistema de Temas y Diseno

> **Version**: 1.0.0  
> **Fecha**: 2026-04-04  
> **Estado**: Especificacion definitiva  
> **Audiencia**: Desarrolladores, Claude Code, contribuidores open-source

---

## 1. Arquitectura del Sistema de Temas

### 1.1 Enfoque

El sistema de temas de Orion Landing Universal se basa en **CSS Custom Properties** (variables CSS) que se aplican a nivel `:root` y son consumidas por todos los componentes via Tailwind CSS 4. La paleta de colores seleccionada por el admin define los valores de estas variables, y cualquier cambio se refleja instantaneamente en toda la pagina.

### 1.2 Flujo de Datos

```
Supabase: theme_config + color_palettes
              |
              | Fetch en Server Component
              v
ThemeProvider (React Context + CSS injection)
              |
              | Inyecta CSS variables en :root
              v
CSS Custom Properties (--color-primary, --color-background, etc.)
              |
              | Consumidas por Tailwind CSS 4
              v
Componentes usan clases: bg-primary, text-foreground, etc.
```

### 1.3 Principios

| Principio                | Descripcion                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| **CSS Variables**        | Todo color, fuente y espaciado se define como variable CSS        |
| **Sin rebuild**          | Cambiar el tema no requiere recompilar la app                     |
| **Overrides por modulo** | Cada modulo puede sobreescribir colores base via JSONB `styles`   |
| **Predefinido + Custom** | 20 paletas predefinidas + paletas personalizadas del admin        |
| **Dark-aware**           | El sistema detecta automaticamente si la paleta es clara u oscura |

---

## 2. Estructura de Paleta

### 2.1 Interfaz TypeScript

```typescript
// src/lib/theme/types.ts

export interface ColorPalette {
  id: string
  name: string
  description: string
  niche: string
  colors: PaletteColors
  isPredefined: boolean
}

export interface PaletteColors {
  /** Color principal de la marca. Botones, links, acentos primarios */
  primary: string

  /** Color secundario. Complementa al primario, se usa en elementos de soporte */
  secondary: string

  /** Color de acento. Highlights, badges, elementos especiales */
  accent: string

  /** Color de fondo principal de la pagina */
  background: string

  /** Color de fondo de tarjetas, secciones elevadas */
  surface: string

  /** Color de texto principal (sobre background/surface) */
  textPrimary: string

  /** Color de texto secundario (subtitulos, labels, texto menos importante) */
  textSecondary: string

  /** Color para estados de exito (confirmaciones, checks) */
  success: string

  /** Color para estados de error (validacion, alertas) */
  error: string
}

export interface ThemeConfig {
  id: string
  activePaletteId: string
  customColors: Partial<PaletteColors>
  headingFont: string
  bodyFont: string
  spacingPreset: 'compact' | 'comfortable' | 'spacious'
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full'
}
```

### 2.2 Roles de Color

| Rol             | Variable CSS             | Uso                                                 | Ejemplo            |
| --------------- | ------------------------ | --------------------------------------------------- | ------------------ |
| `primary`       | `--color-primary`        | Botones CTA, links activos, iconos destacados       | `#F7DE88` (dorado) |
| `secondary`     | `--color-secondary`      | Botones secundarios, bordes, backgrounds alternos   | `#D4AF37`          |
| `accent`        | `--color-accent`         | Badges, notificaciones, highlights                  | `#E8C547`          |
| `background`    | `--color-background`     | Fondo principal de la pagina                        | `#1A1A1A`          |
| `surface`       | `--color-surface`        | Fondo de tarjetas, modales, secciones elevadas      | `#222222`          |
| `textPrimary`   | `--color-text-primary`   | Texto principal (titulos, body)                     | `#EAEAEA`          |
| `textSecondary` | `--color-text-secondary` | Texto secundario (labels, subtitulos, placeholders) | `#A0A0A0`          |
| `success`       | `--color-success`        | Confirmaciones, checks, estados positivos           | `#4CAF50`          |
| `error`         | `--color-error`          | Errores, validacion fallida, alertas                | `#F44336`          |

---

## 3. Paletas Predefinidas (20)

### 3.1 Catalogo Completo

#### 1. IA Hoteleria (`ia-hoteleria`)

**Nicho**: Hoteles, resorts, turismo de lujo

```json
{
  "name": "IA Hoteleria",
  "description": "Elegancia dorada para el sector hotelero y turismo de lujo",
  "niche": "ia-hoteleria",
  "colors": {
    "primary": "#D4AF37",
    "secondary": "#B8860B",
    "accent": "#F7DE88",
    "background": "#1A1A1A",
    "surface": "#2A2520",
    "textPrimary": "#F5F0E8",
    "textSecondary": "#C4B998",
    "success": "#6B8E23",
    "error": "#CD5C5C"
  }
}
```

#### 2. Salud y Bienestar (`salud-bienestar`)

**Nicho**: Clinicas, spas, bienestar, medicina

```json
{
  "name": "Salud y Bienestar",
  "description": "Tonos calmantes y profesionales para el sector salud",
  "niche": "salud-bienestar",
  "colors": {
    "primary": "#00897B",
    "secondary": "#4DB6AC",
    "accent": "#80CBC4",
    "background": "#FAFFFE",
    "surface": "#FFFFFF",
    "textPrimary": "#1A2E2A",
    "textSecondary": "#5F7A76",
    "success": "#43A047",
    "error": "#E53935"
  }
}
```

#### 3. Tecnologia SaaS (`tecnologia-saas`)

**Nicho**: Software, startups tech, SaaS

```json
{
  "name": "Tecnologia SaaS",
  "description": "Moderno y profesional para productos tecnologicos",
  "niche": "tecnologia-saas",
  "colors": {
    "primary": "#6366F1",
    "secondary": "#818CF8",
    "accent": "#A78BFA",
    "background": "#0F0F23",
    "surface": "#1A1A3E",
    "textPrimary": "#E8E8F0",
    "textSecondary": "#9CA3C0",
    "success": "#34D399",
    "error": "#F87171"
  }
}
```

#### 4. Finanzas y Consultoria (`finanzas-consultoria`)

**Nicho**: Bancos, asesores financieros, consultoras

```json
{
  "name": "Finanzas y Consultoria",
  "description": "Confianza y sobriedad para el sector financiero",
  "niche": "finanzas-consultoria",
  "colors": {
    "primary": "#1B3A5C",
    "secondary": "#2E5C8A",
    "accent": "#4A90D9",
    "background": "#FAFBFC",
    "surface": "#FFFFFF",
    "textPrimary": "#1A2332",
    "textSecondary": "#5A6B7F",
    "success": "#2E7D32",
    "error": "#C62828"
  }
}
```

#### 5. Moda y Belleza (`moda-belleza`)

**Nicho**: Tiendas de moda, salones de belleza, cosmeticos

```json
{
  "name": "Moda y Belleza",
  "description": "Elegante y sofisticado para la industria de la moda",
  "niche": "moda-belleza",
  "colors": {
    "primary": "#E91E63",
    "secondary": "#F48FB1",
    "accent": "#FF80AB",
    "background": "#FFF8FA",
    "surface": "#FFFFFF",
    "textPrimary": "#2C1018",
    "textSecondary": "#7A5A63",
    "success": "#66BB6A",
    "error": "#EF5350"
  }
}
```

#### 6. Ecologico y Sostenible (`ecologico-sostenible`)

**Nicho**: Marcas eco-friendly, energia renovable, sostenibilidad

```json
{
  "name": "Ecologico Sostenible",
  "description": "Natural y organico para marcas comprometidas con el medio ambiente",
  "niche": "ecologico-sostenible",
  "colors": {
    "primary": "#2E7D32",
    "secondary": "#66BB6A",
    "accent": "#A5D6A7",
    "background": "#F1F8E9",
    "surface": "#FFFFFF",
    "textPrimary": "#1B3A1E",
    "textSecondary": "#5A7A5E",
    "success": "#43A047",
    "error": "#D32F2F"
  }
}
```

#### 7. Inmobiliaria de Lujo (`inmobiliaria-lujo`)

**Nicho**: Bienes raices, propiedades de lujo, desarrollos inmobiliarios

```json
{
  "name": "Inmobiliaria de Lujo",
  "description": "Sofisticado y premium para el sector inmobiliario",
  "niche": "inmobiliaria-lujo",
  "colors": {
    "primary": "#8B7355",
    "secondary": "#A0916B",
    "accent": "#C9B88C",
    "background": "#0D0D0D",
    "surface": "#1C1C1C",
    "textPrimary": "#F0ECE2",
    "textSecondary": "#B0A898",
    "success": "#6B8E23",
    "error": "#CD5C5C"
  }
}
```

#### 8. Alimentacion y Restaurantes (`alimentacion-restaurantes`)

**Nicho**: Restaurantes, food delivery, gastronomia

```json
{
  "name": "Alimentacion y Restaurantes",
  "description": "Calido y apetitoso para el sector gastronomico",
  "niche": "alimentacion-restaurantes",
  "colors": {
    "primary": "#E65100",
    "secondary": "#FF8A65",
    "accent": "#FFAB91",
    "background": "#FFF8F0",
    "surface": "#FFFFFF",
    "textPrimary": "#3E2723",
    "textSecondary": "#795548",
    "success": "#558B2F",
    "error": "#D84315"
  }
}
```

#### 9. Educacion y Cursos (`educacion-cursos`)

**Nicho**: Plataformas educativas, cursos online, academias

```json
{
  "name": "Educacion y Cursos",
  "description": "Inspirador y accesible para el sector educativo",
  "niche": "educacion-cursos",
  "colors": {
    "primary": "#1565C0",
    "secondary": "#42A5F5",
    "accent": "#90CAF9",
    "background": "#F5F9FF",
    "surface": "#FFFFFF",
    "textPrimary": "#0D1B2A",
    "textSecondary": "#546E8A",
    "success": "#2E7D32",
    "error": "#C62828"
  }
}
```

#### 10. Fitness y Deportes (`fitness-deportes`)

**Nicho**: Gimnasios, entrenadores, marcas deportivas

```json
{
  "name": "Fitness y Deportes",
  "description": "Energetico y dinamico para el mundo fitness",
  "niche": "fitness-deportes",
  "colors": {
    "primary": "#FF5722",
    "secondary": "#FF8A65",
    "accent": "#FFE0B2",
    "background": "#121212",
    "surface": "#1E1E1E",
    "textPrimary": "#FFFFFF",
    "textSecondary": "#B0BEC5",
    "success": "#76FF03",
    "error": "#FF1744"
  }
}
```

#### 11. Viajes y Aventura (`viajes-aventura`)

**Nicho**: Agencias de viaje, turismo aventura, experiencias

```json
{
  "name": "Viajes y Aventura",
  "description": "Aventurero e inspirador para el sector turismo",
  "niche": "viajes-aventura",
  "colors": {
    "primary": "#00ACC1",
    "secondary": "#4DD0E1",
    "accent": "#B2EBF2",
    "background": "#F0FCFF",
    "surface": "#FFFFFF",
    "textPrimary": "#0D2B33",
    "textSecondary": "#4A7A85",
    "success": "#26A69A",
    "error": "#EF5350"
  }
}
```

#### 12. Mascotas y Servicios (`mascotas-servicios`)

**Nicho**: Veterinarias, pet shops, servicios para mascotas

```json
{
  "name": "Mascotas y Servicios",
  "description": "Amigable y calido para el sector de mascotas",
  "niche": "mascotas-servicios",
  "colors": {
    "primary": "#8D6E63",
    "secondary": "#A1887F",
    "accent": "#FFCC80",
    "background": "#FFF8F0",
    "surface": "#FFFFFF",
    "textPrimary": "#3E2723",
    "textSecondary": "#6D5A4E",
    "success": "#66BB6A",
    "error": "#EF5350"
  }
}
```

#### 13. Marketing y Agencias (`marketing-agencias`)

**Nicho**: Agencias de marketing, publicidad, branding

```json
{
  "name": "Marketing y Agencias",
  "description": "Audaz y creativo para agencias de marketing",
  "niche": "marketing-agencias",
  "colors": {
    "primary": "#FF6D00",
    "secondary": "#FFA726",
    "accent": "#FFD54F",
    "background": "#1A1A2E",
    "surface": "#222240",
    "textPrimary": "#F0F0F0",
    "textSecondary": "#A0A0C0",
    "success": "#00E676",
    "error": "#FF5252"
  }
}
```

#### 14. Bodas y Eventos (`bodas-eventos`)

**Nicho**: Wedding planners, salones de eventos, catering

```json
{
  "name": "Bodas y Eventos",
  "description": "Romantico y elegante para el sector de eventos",
  "niche": "bodas-eventos",
  "colors": {
    "primary": "#AD8B73",
    "secondary": "#CEAB93",
    "accent": "#E3CAA5",
    "background": "#FFFBF5",
    "surface": "#FFFFFF",
    "textPrimary": "#2C1810",
    "textSecondary": "#7A6555",
    "success": "#81C784",
    "error": "#E57373"
  }
}
```

#### 15. Servicios Legales (`servicios-legales`)

**Nicho**: Abogados, despachos, consultoria legal

```json
{
  "name": "Servicios Legales",
  "description": "Serio y confiable para el sector juridico",
  "niche": "servicios-legales",
  "colors": {
    "primary": "#37474F",
    "secondary": "#546E7A",
    "accent": "#B0BEC5",
    "background": "#FAFAFA",
    "surface": "#FFFFFF",
    "textPrimary": "#1A2328",
    "textSecondary": "#607D8B",
    "success": "#388E3C",
    "error": "#D32F2F"
  }
}
```

#### 16. Infantil y Familia (`infantil-familia`)

**Nicho**: Guarderias, tiendas infantiles, actividades familiares

```json
{
  "name": "Infantil y Familia",
  "description": "Alegre y colorido para el publico infantil y familiar",
  "niche": "infantil-familia",
  "colors": {
    "primary": "#FF7043",
    "secondary": "#FFB74D",
    "accent": "#FFF176",
    "background": "#FFFEF5",
    "surface": "#FFFFFF",
    "textPrimary": "#33261A",
    "textSecondary": "#7A6A55",
    "success": "#66BB6A",
    "error": "#EF5350"
  }
}
```

#### 17. Automotriz y Mecanica (`automotriz-mecanica`)

**Nicho**: Concesionarios, talleres, autopartes

```json
{
  "name": "Automotriz y Mecanica",
  "description": "Fuerte y confiable para el sector automotriz",
  "niche": "automotriz-mecanica",
  "colors": {
    "primary": "#D32F2F",
    "secondary": "#EF5350",
    "accent": "#FF8A80",
    "background": "#121212",
    "surface": "#1D1D1D",
    "textPrimary": "#EEEEEE",
    "textSecondary": "#9E9E9E",
    "success": "#4CAF50",
    "error": "#FF5252"
  }
}
```

#### 18. Arte y Fotografia (`arte-fotografia`)

**Nicho**: Fotografos, artistas, galerias, portfolios creativos

```json
{
  "name": "Arte y Fotografia",
  "description": "Minimalista y elegante para creativos y artistas",
  "niche": "arte-fotografia",
  "colors": {
    "primary": "#212121",
    "secondary": "#424242",
    "accent": "#BDBDBD",
    "background": "#FFFFFF",
    "surface": "#FAFAFA",
    "textPrimary": "#1A1A1A",
    "textSecondary": "#757575",
    "success": "#4CAF50",
    "error": "#F44336"
  }
}
```

#### 19. Podcast y Creadores (`podcast-creadores`)

**Nicho**: Podcasters, YouTubers, creadores de contenido

```json
{
  "name": "Podcast y Creadores",
  "description": "Vibrante y moderno para creadores de contenido digital",
  "niche": "podcast-creadores",
  "colors": {
    "primary": "#9C27B0",
    "secondary": "#BA68C8",
    "accent": "#E1BEE7",
    "background": "#0A0014",
    "surface": "#1A0A28",
    "textPrimary": "#F3E5F5",
    "textSecondary": "#B39DDB",
    "success": "#69F0AE",
    "error": "#FF5252"
  }
}
```

#### 20. Psicologia y Coaching (`psicologia-coaching`)

**Nicho**: Psicologos, coaches, terapeutas, bienestar mental

```json
{
  "name": "Psicologia y Coaching",
  "description": "Calido y acogedor para profesionales del bienestar mental",
  "niche": "psicologia-coaching",
  "colors": {
    "primary": "#7B68AE",
    "secondary": "#9E8CC4",
    "accent": "#C5B3E3",
    "background": "#FAF8FF",
    "surface": "#FFFFFF",
    "textPrimary": "#2D2240",
    "textSecondary": "#6B5F80",
    "success": "#66BB6A",
    "error": "#EF5350"
  }
}
```

### 3.2 Insercion en Base de Datos (Seed)

```typescript
// src/lib/setup/seed-palettes.ts

import type { PaletteColors } from '@/lib/theme/types'

interface PaletteSeed {
  name: string
  description: string
  niche: string
  colors: PaletteColors
  is_predefined: boolean
}

export const SEED_PALETTES: PaletteSeed[] = [
  // Las 20 paletas listadas arriba
  // Todas con is_predefined: true
]
```

---

## 4. CSS Custom Properties

### 4.1 Inyeccion de Variables

Las CSS variables se inyectan en `:root` mediante un componente ThemeProvider que genera un `<style>` tag dinamico:

```typescript
// src/lib/theme/ThemeProvider.tsx

'use client';

import { type FC, type ReactNode, useMemo } from 'react';
import type { PaletteColors, ThemeConfig } from './types';

interface ThemeProviderProps {
  children: ReactNode;
  paletteColors: PaletteColors;
  customColors: Partial<PaletteColors>;
  headingFont: string;
  bodyFont: string;
  spacingPreset: string;
  borderRadius: string;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  paletteColors,
  customColors,
  headingFont,
  bodyFont,
  spacingPreset,
  borderRadius,
}) => {
  // Merge: custom overrides toman precedencia sobre la paleta
  const resolvedColors = useMemo(() => ({
    ...paletteColors,
    ...Object.fromEntries(
      Object.entries(customColors).filter(([_, v]) => v != null && v !== '')
    ),
  }), [paletteColors, customColors]);

  // Mapeo de spacing preset a valores
  const spacingValues = useMemo(() => {
    switch (spacingPreset) {
      case 'compact':
        return { sectionPadding: '3rem', cardPadding: '1rem', gap: '0.75rem' };
      case 'spacious':
        return { sectionPadding: '6rem', cardPadding: '2rem', gap: '1.5rem' };
      default: // comfortable
        return { sectionPadding: '4.5rem', cardPadding: '1.5rem', gap: '1rem' };
    }
  }, [spacingPreset]);

  // Mapeo de border radius
  const radiusValue = useMemo(() => {
    switch (borderRadius) {
      case 'none': return '0px';
      case 'small': return '4px';
      case 'large': return '16px';
      case 'full': return '9999px';
      default: return '8px'; // medium
    }
  }, [borderRadius]);

  const cssVariables = `
    :root {
      /* Colores */
      --color-primary: ${resolvedColors.primary};
      --color-secondary: ${resolvedColors.secondary};
      --color-accent: ${resolvedColors.accent};
      --color-background: ${resolvedColors.background};
      --color-surface: ${resolvedColors.surface};
      --color-text-primary: ${resolvedColors.textPrimary};
      --color-text-secondary: ${resolvedColors.textSecondary};
      --color-success: ${resolvedColors.success};
      --color-error: ${resolvedColors.error};

      /* Colores derivados (con opacidad) */
      --color-primary-hover: ${resolvedColors.primary}DD;
      --color-primary-light: ${resolvedColors.primary}20;
      --color-surface-hover: ${resolvedColors.surface}CC;

      /* Tipografia */
      --font-heading: '${headingFont}', sans-serif;
      --font-body: '${bodyFont}', sans-serif;

      /* Espaciado */
      --spacing-section: ${spacingValues.sectionPadding};
      --spacing-card: ${spacingValues.cardPadding};
      --spacing-gap: ${spacingValues.gap};

      /* Bordes */
      --radius: ${radiusValue};
    }

    body {
      background-color: var(--color-background);
      color: var(--color-text-primary);
      font-family: var(--font-body);
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      {children}
    </>
  );
};
```

### 4.2 Lista Completa de CSS Variables

| Variable                 | Descripcion                   | Ejemplo                 |
| ------------------------ | ----------------------------- | ----------------------- |
| `--color-primary`        | Color principal de la marca   | `#6366F1`               |
| `--color-secondary`      | Color secundario              | `#818CF8`               |
| `--color-accent`         | Color de acento               | `#A78BFA`               |
| `--color-background`     | Fondo de la pagina            | `#0F0F23`               |
| `--color-surface`        | Fondo de tarjetas/secciones   | `#1A1A3E`               |
| `--color-text-primary`   | Texto principal               | `#E8E8F0`               |
| `--color-text-secondary` | Texto secundario              | `#9CA3C0`               |
| `--color-success`        | Estado exitoso                | `#34D399`               |
| `--color-error`          | Estado de error               | `#F87171`               |
| `--color-primary-hover`  | Primary con hover (opacidad)  | `#6366F1DD`             |
| `--color-primary-light`  | Primary con transparencia     | `#6366F120`             |
| `--color-surface-hover`  | Surface con hover             | `#1A1A3ECC`             |
| `--font-heading`         | Fuente de titulos             | `'Poppins', sans-serif` |
| `--font-body`            | Fuente de cuerpo              | `'Lato', sans-serif`    |
| `--spacing-section`      | Padding vertical de secciones | `4.5rem`                |
| `--spacing-card`         | Padding de tarjetas           | `1.5rem`                |
| `--spacing-gap`          | Gap entre elementos           | `1rem`                  |
| `--radius`               | Radio de bordes               | `8px`                   |

---

## 5. Integracion con Tailwind CSS 4

### 5.1 Configuracion

Tailwind CSS 4 usa una configuracion basada en CSS. Las custom properties se integran como colores del tema:

```css
/* src/app/globals.css */

@import 'tailwindcss';

@theme {
  /* Colores del tema mapeados desde CSS variables */
  --color-primary: var(--color-primary);
  --color-secondary: var(--color-secondary);
  --color-accent: var(--color-accent);
  --color-background: var(--color-background);
  --color-surface: var(--color-surface);
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-success: var(--color-success);
  --color-error: var(--color-error);

  /* Aliases semanticos */
  --color-foreground: var(--color-text-primary);
  --color-muted: var(--color-text-secondary);
  --color-muted-foreground: var(--color-text-secondary);
  --color-card: var(--color-surface);
  --color-card-foreground: var(--color-text-primary);
  --color-destructive: var(--color-error);

  /* Tipografia */
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);

  /* Bordes */
  --radius-default: var(--radius);
}
```

### 5.2 Uso en Componentes

Con esta configuracion, los desarrolladores pueden usar las clases de Tailwind directamente:

```html
<!-- Color de fondo -->
<div class="bg-primary">...</div>
<div class="bg-secondary">...</div>
<div class="bg-background">...</div>
<div class="bg-surface">...</div>

<!-- Color de texto -->
<h1 class="text-primary">...</h1>
<p class="text-foreground">...</p>
<span class="text-muted">...</span>

<!-- Bordes -->
<div class="border-primary/20 border">...</div>

<!-- Tipografia -->
<h1 class="font-heading text-4xl">...</h1>
<p class="font-body text-base">...</p>

<!-- Hover states -->
<button class="bg-primary hover:bg-primary/90 text-background">Click me</button>

<!-- Combinaciones -->
<div class="bg-surface rounded-[var(--radius)] p-[var(--spacing-card)]">
  <h2 class="font-heading text-primary">Titulo</h2>
  <p class="font-body text-foreground">Contenido</p>
</div>
```

### 5.3 Convencion: Nunca Hardcodear Colores

**REGLA**: Los componentes de la landing page NUNCA deben usar colores hardcodeados (como `bg-blue-500` o `text-[#FF0000]`). Siempre deben usar las variables del tema:

```typescript
// MAL - colores hardcodeados
<button className="bg-blue-600 text-white">Click</button>

// BIEN - usa variables del tema
<button className="bg-primary text-background">Click</button>
```

**Excepcion**: El panel admin puede usar colores hardcodeados propios (grises del admin layout) ya que no cambia con el tema.

---

## 6. Tipografia

### 6.1 Google Fonts

Las fuentes se cargan desde Google Fonts usando `next/font/google`:

```typescript
// src/lib/theme/fonts.ts

// Fuentes precargadas (las mas comunes)
// Se cargan todas como fallback y se activa la seleccionada via CSS variable

import {
  Poppins,
  Lato,
  Inter,
  Roboto,
  Montserrat,
  Open_Sans,
  Playfair_Display,
  Raleway,
  Nunito,
  Source_Sans_3,
} from 'next/font/google'

export const fontMap = {
  Poppins: Poppins({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
    variable: '--font-poppins',
  }),
  Lato: Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' }),
  Inter: Inter({ subsets: ['latin'], variable: '--font-inter' }),
  Roboto: Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-roboto' }),
  Montserrat: Montserrat({ subsets: ['latin'], variable: '--font-montserrat' }),
  'Open Sans': Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' }),
  'Playfair Display': Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' }),
  Raleway: Raleway({ subsets: ['latin'], variable: '--font-raleway' }),
  Nunito: Nunito({ subsets: ['latin'], variable: '--font-nunito' }),
  'Source Sans 3': Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans' }),
}

export const AVAILABLE_FONTS = Object.keys(fontMap)
```

### 6.2 Jerarquia Tipografica

| Elemento | Variable         | Tamano Default                                       | Peso Default   |
| -------- | ---------------- | ---------------------------------------------------- | -------------- |
| H1       | `--font-heading` | `text-4xl` (2.25rem) / `md:text-5xl` / `lg:text-6xl` | 700 (bold)     |
| H2       | `--font-heading` | `text-3xl` (1.875rem) / `md:text-4xl`                | 600 (semibold) |
| H3       | `--font-heading` | `text-2xl` (1.5rem) / `md:text-3xl`                  | 600 (semibold) |
| H4       | `--font-heading` | `text-xl` (1.25rem) / `md:text-2xl`                  | 600 (semibold) |
| Body     | `--font-body`    | `text-base` (1rem) / `md:text-lg`                    | 400 (normal)   |
| Small    | `--font-body`    | `text-sm` (0.875rem)                                 | 400 (normal)   |
| Caption  | `--font-body`    | `text-xs` (0.75rem)                                  | 400 (normal)   |

### 6.3 Configuracion desde el Admin

El admin puede seleccionar:

- **Fuente de titulos** (`headingFont`): se aplica a todos los `<h1>`-`<h6>` y elementos con clase `font-heading`
- **Fuente de cuerpo** (`bodyFont`): se aplica al `<body>` y elementos con clase `font-body`

Ambas se pueden elegir de la lista precargada (10 fuentes) o, en el futuro, buscar entre todas las Google Fonts.

---

## 7. Per-Module Style Overrides

### 7.1 Mecanismo

Cada modulo tiene un campo `styles` (JSONB) en `page_modules` que permite sobreescribir los colores del tema para esa seccion especifica.

```typescript
interface ModuleStyles {
  backgroundColor?: string | null // Override de fondo
  textColor?: string | null // Override de texto
  backgroundImage?: string | null // Imagen de fondo
  backgroundOverlayOpacity?: number // Opacidad del overlay
  paddingY?: 'none' | 'small' | 'medium' | 'large' | 'xlarge'
  paddingX?: 'none' | 'small' | 'medium' | 'large'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  custom?: Record<string, unknown> // Estilos libres
}
```

### 7.2 Aplicacion de Overrides

Los overrides se aplican como `style` inline en el `<section>` del modulo, tomando precedencia sobre las CSS variables:

```typescript
// Dentro de cada componente de modulo
<section
  id={moduleId}
  data-module={key}
  style={{
    backgroundColor: styles.backgroundColor ?? undefined,
    color: styles.textColor ?? undefined,
    paddingTop: paddingMap[styles.paddingY ?? 'large'],
    paddingBottom: paddingMap[styles.paddingY ?? 'large'],
  }}
>
  {/* Contenido */}
</section>
```

### 7.3 Mapa de Valores de Padding

```typescript
const paddingYMap: Record<string, string> = {
  none: '0',
  small: '2rem',
  medium: '3rem',
  large: '4.5rem', // Usa --spacing-section del tema
  xlarge: '6rem',
}

const paddingXMap: Record<string, string> = {
  none: '0',
  small: '1rem',
  medium: '1.5rem',
  large: '2rem',
}

const maxWidthMap: Record<string, string> = {
  narrow: '768px',
  default: '1152px',
  wide: '1400px',
  full: '100%',
}
```

### 7.4 Edicion de Estilos por Modulo

En modo edicion inline, cada modulo muestra una barra de herramientas de estilo (module admin bar) con:

- Color picker para cambiar fondo
- Color picker para cambiar texto
- Boton para seleccionar imagen de fondo
- Slider para opacidad del overlay
- Los cambios se aplican en tiempo real (preview) y se guardan con el boton "Guardar"

---

## 8. Dark/Light Mode

### 8.1 Deteccion Automatica

El sistema determina automaticamente si la paleta es "dark" o "light" basandose en la luminosidad del color de fondo:

```typescript
// src/lib/theme/utils.ts

/**
 * Calcula la luminosidad relativa de un color hex.
 * Retorna un valor entre 0 (negro) y 1 (blanco).
 */
export function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const [rLinear, gLinear, bLinear] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  )

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * Determina si una paleta es dark o light basandose en el color de fondo.
 */
export function isDarkPalette(backgroundColor: string): boolean {
  return getLuminance(backgroundColor) < 0.5
}
```

### 8.2 Aplicacion

```typescript
// En el ThemeProvider
const isDark = isDarkPalette(resolvedColors.background);

// Agregar data attribute al body
<body data-theme={isDark ? 'dark' : 'light'}>
```

### 8.3 Uso

Las paletas predefinidas ya tienen colores de texto que contrastan correctamente con su fondo. No se necesita un "toggle" de dark mode en la v1.

**Futuro (v2)**: Se podria implementar un toggle de dark/light mode que invierta ciertos roles de color (background <-> surface, textPrimary <-> background, etc.), generando una version "invertida" de la paleta actual.

---

## 9. Marketplace-Ready Format

### 9.1 Formato de Exportacion/Importacion de Paleta

```json
{
  "format": "orion-palette",
  "version": "1.0",
  "palette": {
    "name": "Mi Paleta Personalizada",
    "description": "Descripcion de la paleta",
    "niche": "custom",
    "author": "Nombre del autor",
    "license": "MIT",
    "tags": ["dark", "tech", "modern"],
    "colors": {
      "primary": "#6366F1",
      "secondary": "#818CF8",
      "accent": "#A78BFA",
      "background": "#0F0F23",
      "surface": "#1A1A3E",
      "textPrimary": "#E8E8F0",
      "textSecondary": "#9CA3C0",
      "success": "#34D399",
      "error": "#F87171"
    },
    "previewImage": null,
    "createdAt": "2026-04-04T12:00:00Z"
  }
}
```

### 9.2 Validacion de Importacion

Al importar una paleta, se valida:

1. **Formato**: Debe tener `format: "orion-palette"` y `version: "1.0"`
2. **Colores obligatorios**: Todos los 9 roles de color deben estar presentes
3. **Formato hex**: Cada color debe ser un hex valido de 6 digitos (#RRGGBB)
4. **Contraste minimo**: Se verifica que textPrimary tenga suficiente contraste con background (ratio >= 4.5:1 para accesibilidad AA)
5. **Nombre unico**: No puede coincidir con una paleta predefinida existente

### 9.3 API de Paletas Personalizadas

```typescript
// POST /api/palettes — Crear paleta personalizada
// PUT /api/palettes/[id] — Editar paleta personalizada
// DELETE /api/palettes/[id] — Eliminar paleta personalizada (no predefinidas)
// POST /api/palettes/import — Importar paleta desde JSON
// GET /api/palettes/[id]/export — Exportar paleta como JSON
```

---

## 10. Preview System

### 10.1 Preview en Vivo en el Admin

Cuando el admin selecciona una paleta o modifica colores en `/admin/design`, se muestra un preview en tiempo real antes de aplicar los cambios.

### 10.2 Implementacion

**Opcion A — Inline Preview (elegida)**:

- Un componente de preview embebido que renderiza una version miniatura de los modulos principales (hero, value_prop, CTA) con los colores seleccionados
- Se actualiza en tiempo real al cambiar la paleta o overrides
- No requiere iframe ni recarga

```typescript
// src/components/admin/ThemePreview.tsx

'use client';

import { type FC } from 'react';
import type { PaletteColors } from '@/lib/theme/types';

interface ThemePreviewProps {
  colors: PaletteColors;
  headingFont: string;
  bodyFont: string;
}

export const ThemePreview: FC<ThemePreviewProps> = ({
  colors,
  headingFont,
  bodyFont,
}) => {
  return (
    <div
      className="rounded-lg overflow-hidden border border-gray-200 shadow-lg"
      style={{
        backgroundColor: colors.background,
        color: colors.textPrimary,
        fontFamily: `'${bodyFont}', sans-serif`,
      }}
    >
      {/* Mini Hero */}
      <div className="p-6">
        <div
          className="text-xs px-2 py-0.5 rounded-full inline-block mb-2"
          style={{ backgroundColor: colors.primary + '20', color: colors.primary }}
        >
          Badge
        </div>
        <h3
          className="text-lg font-bold mb-1"
          style={{ fontFamily: `'${headingFont}', sans-serif` }}
        >
          Titulo Principal
        </h3>
        <p
          className="text-xs mb-3"
          style={{ color: colors.textSecondary }}
        >
          Este es un subtitulo de ejemplo
        </p>
        <button
          className="px-3 py-1 rounded text-xs font-bold"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          Boton CTA
        </button>
      </div>

      {/* Mini Cards */}
      <div className="px-6 pb-6 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3 rounded"
            style={{ backgroundColor: colors.surface }}
          >
            <div
              className="w-6 h-6 rounded-full mb-2 flex items-center justify-center text-xs"
              style={{ backgroundColor: colors.primary + '20', color: colors.primary }}
            >
              {i}
            </div>
            <div className="text-xs font-bold mb-1" style={{ fontFamily: `'${headingFont}', sans-serif` }}>
              Card {i}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Descripcion
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 10.3 Flujo de Aplicacion

```
Admin selecciona paleta en el grid
       |
       v
Preview se actualiza inmediatamente (state local)
       |
       v
Admin ajusta overrides de color (opcional)
       |
       v
Preview refleja los overrides en tiempo real
       |
       v
Admin hace clic en "Aplicar Tema"
       |
       v
PUT /api/design/theme
       |
       v
ThemeProvider en la landing recibe los nuevos colores
       |
       v
CSS variables se actualizan en :root
       |
       v
Toda la pagina refleja el nuevo tema
```

---

## Apendice A: Tabla `theme_config` en Supabase

```sql
CREATE TABLE theme_config (
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
```

**Nota**: Solo existe una fila en `theme_config`. Es una tabla de una sola fila (single-row config pattern).

## Apendice B: Tabla `color_palettes` en Supabase

```sql
CREATE TABLE color_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  niche TEXT,
  colors JSONB NOT NULL,
  is_predefined BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Apendice C: Migracion de Paleta

Si en el futuro se agregan nuevos roles de color (por ejemplo, `warning`, `info`), las paletas existentes que no tengan estos roles usaran valores derivados automaticamente:

```typescript
function resolvePaletteColors(palette: Partial<PaletteColors>): PaletteColors {
  return {
    primary: palette.primary ?? '#6366F1',
    secondary: palette.secondary ?? palette.primary ?? '#818CF8',
    accent: palette.accent ?? palette.primary ?? '#A78BFA',
    background: palette.background ?? '#FFFFFF',
    surface: palette.surface ?? '#F5F5F5',
    textPrimary: palette.textPrimary ?? '#1A1A1A',
    textSecondary: palette.textSecondary ?? '#666666',
    success: palette.success ?? '#4CAF50',
    error: palette.error ?? '#F44336',
    // Futuros roles con fallback
    // warning: palette.warning ?? '#FFC107',
    // info: palette.info ?? '#2196F3',
  }
}
```
