import type { PaletteColors, ThemeConfig } from './types'

const SPACING_PRESETS = {
  compact: { sectionPadding: '3rem', containerMax: '1100px', elementGap: '0.75rem' },
  comfortable: { sectionPadding: '4.5rem', containerMax: '1200px', elementGap: '1rem' },
  spacious: { sectionPadding: '6rem', containerMax: '1400px', elementGap: '1.5rem' },
} as const

const BORDER_RADIUS_MAP = {
  none: '0px',
  small: '4px',
  medium: '8px',
  large: '16px',
  full: '9999px',
} as const

/**
 * Convierte una paleta de colores a un string de CSS custom properties.
 */
export function paletteToCSSVars(
  colors: PaletteColors,
  customColors: Partial<PaletteColors> = {},
): string {
  const merged = { ...colors, ...customColors }
  return `
    --color-primary: ${merged.primary};
    --color-secondary: ${merged.secondary};
    --color-accent: ${merged.accent};
    --color-background: ${merged.background};
    --color-surface: ${merged.surface};
    --color-text-primary: ${merged.text_primary};
    --color-text-secondary: ${merged.text_secondary};
    --color-success: ${merged.success};
    --color-error: ${merged.error};
    --color-warning: ${merged.warning};
    --color-info: ${merged.info};
    --color-border: ${merged.border};
    --color-foreground: ${merged.text_primary};
  `.trim()
}

/**
 * Genera el bloque de CSS variables completo desde la configuración del tema.
 */
export function themeConfigToCSSVars(config: ThemeConfig, colors: PaletteColors): string {
  const spacingKey = config.spacing.section_padding as keyof typeof SPACING_PRESETS
  const spacing = SPACING_PRESETS[spacingKey] ?? SPACING_PRESETS.comfortable
  const radiusKey = config.border_radius as keyof typeof BORDER_RADIUS_MAP
  const radius = BORDER_RADIUS_MAP[radiusKey] ?? BORDER_RADIUS_MAP.medium

  const colorVars = paletteToCSSVars(colors, config.custom_colors)

  return `
    ${colorVars}
    --font-heading: '${config.typography.font_heading}', sans-serif;
    --font-body: '${config.typography.font_body}', sans-serif;
    --font-size-base: ${config.typography.base_size};
    --section-padding: ${spacing.sectionPadding};
    --container-max-width: ${spacing.containerMax};
    --element-gap: ${spacing.elementGap};
    --border-radius: ${radius};
  `.trim()
}

/**
 * Genera el tag link de Google Fonts para una familia tipográfica.
 */
export function loadGoogleFont(fontFamily: string): string {
  const family = fontFamily.replace(/\s+/g, '+')
  return `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;500;600;700&display=swap`
}
