import { describe, it, expect } from 'vitest'
import { paletteToCSSVars, themeConfigToCSSVars, loadGoogleFont } from '@/lib/themes/utils'
import type { PaletteColors, ThemeConfig } from '@/lib/themes/types'

const BASE_COLORS: PaletteColors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#f59e0b',
  background: '#ffffff',
  surface: '#f8fafc',
  text_primary: '#0f172a',
  text_secondary: '#475569',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f97316',
  info: '#06b6d4',
  border: '#e2e8f0',
}

describe('paletteToCSSVars', () => {
  it('generates all 13 CSS custom properties from a full palette', () => {
    const result = paletteToCSSVars(BASE_COLORS)
    expect(result).toContain('--color-primary: #3b82f6')
    expect(result).toContain('--color-secondary: #64748b')
    expect(result).toContain('--color-accent: #f59e0b')
    expect(result).toContain('--color-background: #ffffff')
    expect(result).toContain('--color-surface: #f8fafc')
    expect(result).toContain('--color-text-primary: #0f172a')
    expect(result).toContain('--color-text-secondary: #475569')
    expect(result).toContain('--color-success: #22c55e')
    expect(result).toContain('--color-error: #ef4444')
    expect(result).toContain('--color-warning: #f97316')
    expect(result).toContain('--color-info: #06b6d4')
    expect(result).toContain('--color-border: #e2e8f0')
    // foreground mirrors text_primary
    expect(result).toContain('--color-foreground: #0f172a')
  })

  it('custom colors override the base palette values', () => {
    const custom: Partial<PaletteColors> = { primary: '#ff0000', accent: '#00ff00' }
    const result = paletteToCSSVars(BASE_COLORS, custom)
    expect(result).toContain('--color-primary: #ff0000')
    expect(result).toContain('--color-accent: #00ff00')
    // Non-overridden values remain
    expect(result).toContain('--color-secondary: #64748b')
  })

  it('returns a non-empty string when no custom colors are passed', () => {
    const result = paletteToCSSVars(BASE_COLORS)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('empty customColors object leaves palette unchanged', () => {
    const result = paletteToCSSVars(BASE_COLORS, {})
    expect(result).toContain('--color-primary: #3b82f6')
  })
})

describe('themeConfigToCSSVars', () => {
  const config: ThemeConfig = {
    id: 'test-theme',
    palette_id: 'palette-1',
    custom_colors: {},
    typography: {
      font_heading: 'Inter',
      font_body: 'Open Sans',
      base_size: '16px',
      scale_ratio: 1.25,
    },
    spacing: {
      section_padding: 'comfortable',
      container_max_width: '1200px',
      element_gap: '1rem',
    },
    border_radius: 'medium',
  }

  it('includes font CSS variables from typography config', () => {
    const result = themeConfigToCSSVars(config, BASE_COLORS)
    expect(result).toContain("--font-heading: 'Inter', sans-serif")
    expect(result).toContain("--font-body: 'Open Sans', sans-serif")
    expect(result).toContain('--font-size-base: 16px')
  })

  it('resolves spacing preset correctly for "comfortable"', () => {
    const result = themeConfigToCSSVars(config, BASE_COLORS)
    expect(result).toContain('--section-padding: 4.5rem')
    expect(result).toContain('--container-max-width: 1200px')
    expect(result).toContain('--element-gap: 1rem')
  })

  it('resolves border radius correctly for "medium"', () => {
    const result = themeConfigToCSSVars(config, BASE_COLORS)
    expect(result).toContain('--border-radius: 8px')
  })

  it('falls back to "comfortable" spacing for unknown preset', () => {
    const badConfig = { ...config, spacing: { ...config.spacing, section_padding: 'unknown' } }
    const result = themeConfigToCSSVars(badConfig, BASE_COLORS)
    expect(result).toContain('--section-padding: 4.5rem')
  })
})

describe('loadGoogleFont', () => {
  it('generates correct Google Fonts URL for a single-word font', () => {
    const url = loadGoogleFont('Inter')
    expect(url).toBe(
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    )
  })

  it('replaces spaces with "+" in multi-word font names', () => {
    const url = loadGoogleFont('Open Sans')
    expect(url).toContain('family=Open+Sans')
  })
})
