import type { PaletteColors } from './types'

/**
 * Parses a hex color (#rgb or #rrggbb) to [r, g, b] 0-255.
 * Returns null if the string is not a valid hex color.
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.trim().replace(/^#/, '')

  if (cleaned.length === 3) {
    const c0 = cleaned.charAt(0)
    const c1 = cleaned.charAt(1)
    const c2 = cleaned.charAt(2)
    const r = parseInt(c0 + c0, 16)
    const g = parseInt(c1 + c1, 16)
    const b = parseInt(c2 + c2, 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return [r, g, b]
  }

  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16)
    const g = parseInt(cleaned.slice(2, 4), 16)
    const b = parseInt(cleaned.slice(4, 6), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return [r, g, b]
  }

  return null
}

/**
 * Calculates relative luminance per WCAG 2.1 spec.
 * Input: r, g, b in 0-255 range.
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number): number => {
    const val = c / 255
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/**
 * Calculates contrast ratio between two hex colors.
 * Returns a value between 1 and 21.
 * If either hex is invalid, returns 1 (safe fallback).
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)

  if (!rgb1 || !rgb2) return 1

  const l1 = relativeLuminance(...rgb1)
  const l2 = relativeLuminance(...rgb2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * WCAG AA check for normal text (contrast ratio must be ≥ 4.5:1).
 */
export function passesWcagAA(hex1: string, hex2: string): boolean {
  return contrastRatio(hex1, hex2) >= 4.5
}

/**
 * WCAG AA check for large text / UI components (contrast ratio must be ≥ 3.0:1).
 */
export function passesWcagAALarge(hex1: string, hex2: string): boolean {
  return contrastRatio(hex1, hex2) >= 3.0
}

export interface ContrastCheck {
  /** Human-readable label, e.g. "Texto principal / Fondo" */
  label: string
  /** Contrast ratio rounded to 2 decimal places, e.g. 7.24 */
  ratio: number
  /** true if the pair passes the required WCAG level */
  passes: boolean
  /** Which WCAG AA level was checked */
  level: 'AA' | 'AA-large'
  /** Hex foreground color */
  fg: string
  /** Hex background color */
  bg: string
}

/**
 * Runs all key contrast checks for a palette.
 * Returns 5 ContrastCheck objects covering the critical pairs.
 */
export function checkPaletteContrast(colors: PaletteColors): ContrastCheck[] {
  const round2 = (n: number): number => Math.round(n * 100) / 100

  type CheckInput = Pick<ContrastCheck, 'label' | 'fg' | 'bg' | 'level'>

  const inputs: CheckInput[] = [
    {
      label: 'Texto principal / Fondo',
      fg: colors.text_primary,
      bg: colors.background,
      level: 'AA',
    },
    {
      label: 'Texto secundario / Fondo',
      fg: colors.text_secondary,
      bg: colors.background,
      level: 'AA',
    },
    {
      label: 'Texto principal / Superficie',
      fg: colors.text_primary,
      bg: colors.surface,
      level: 'AA',
    },
    {
      label: 'Blanco / Primario (botón)',
      fg: '#ffffff',
      bg: colors.primary,
      level: 'AA',
    },
    {
      label: 'Primario / Fondo (UI)',
      fg: colors.primary,
      bg: colors.background,
      level: 'AA-large',
    },
  ]

  return inputs.map((check): ContrastCheck => {
    const ratio = round2(contrastRatio(check.fg, check.bg))
    const passes = check.level === 'AA' ? ratio >= 4.5 : ratio >= 3.0
    return { ...check, ratio, passes }
  })
}
