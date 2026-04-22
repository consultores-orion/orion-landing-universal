'use client'

import type { ColorPalette } from '@/lib/themes/types'
import { checkPaletteContrast } from '@/lib/themes/contrast'
import { paletteToCSSVars } from '@/lib/themes/utils'

interface ThemePreviewPanelProps {
  palette: ColorPalette | null
}

/**
 * Inline preview of a palette's CSS variables — renders BEFORE the theme is saved.
 * Uses the palette's colors as scoped inline styles, so no DB call needed.
 */
export function ThemePreviewPanel({ palette }: ThemePreviewPanelProps) {
  if (!palette) return null

  const cssVars = paletteToCSSVars(palette.colors)
  const contrastChecks = checkPaletteContrast(palette.colors)
  const allPass = contrastChecks.every((c) => c.passes)

  // Convert the CSS var string to a React inline style object
  const styleVars = cssVars
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, declaration) => {
      const idx = declaration.indexOf(':')
      if (idx === -1) return acc
      const prop = declaration.slice(0, idx).trim()
      const val = declaration.slice(idx + 1).trim()
      acc[prop] = val
      return acc
    }, {})

  return (
    <div
      className="border-border mt-4 overflow-hidden rounded-xl border"
      role="region"
      aria-label={`Vista previa de la paleta ${palette.name}`}
    >
      {/* Header */}
      <div className="border-b px-4 py-2" style={{ borderColor: 'var(--preview-border)' }}>
        <p className="text-muted-foreground text-xs font-medium">
          Vista previa — <span className="font-semibold">{palette.name}</span>
        </p>
      </div>

      {/* Preview surface — all child elements use the palette's CSS vars */}
      <div
        className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2"
        style={styleVars as React.CSSProperties}
      >
        {/* Hero mock */}
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-lg p-6 text-center"
          style={{
            backgroundColor: 'var(--color-primary)',
            minHeight: '120px',
          }}
        >
          <div
            className="h-3 w-3/4 rounded-full"
            style={{ backgroundColor: 'var(--color-primary-foreground, #fff)', opacity: 0.9 }}
          />
          <div
            className="h-2 w-1/2 rounded-full"
            style={{ backgroundColor: 'var(--color-primary-foreground, #fff)', opacity: 0.6 }}
          />
          <div
            className="mt-2 rounded-lg px-4 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-foreground, #fff)',
            }}
          >
            CTA Button
          </div>
        </div>

        {/* Card mock */}
        <div
          className="flex flex-col gap-2 rounded-lg p-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            className="h-2.5 w-2/3 rounded-full"
            style={{ backgroundColor: 'var(--color-foreground)', opacity: 0.8 }}
          />
          <div
            className="h-2 w-full rounded-full"
            style={{
              backgroundColor: 'var(--color-muted-foreground, var(--color-text-secondary))',
              opacity: 0.5,
            }}
          />
          <div
            className="h-2 w-4/5 rounded-full"
            style={{
              backgroundColor: 'var(--color-muted-foreground, var(--color-text-secondary))',
              opacity: 0.5,
            }}
          />
          <div className="mt-2 flex gap-2">
            <div
              className="rounded-md px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-foreground, #fff)',
              }}
            >
              Primary
            </div>
            <div
              className="rounded-md px-3 py-1 text-xs font-medium"
              style={{
                border: '1px solid var(--color-primary)',
                color: 'var(--color-primary)',
                backgroundColor: 'transparent',
              }}
            >
              Outline
            </div>
          </div>
        </div>

        {/* Color swatches row */}
        <div className="col-span-1 flex flex-wrap gap-2 sm:col-span-2">
          {(
            [
              ['Primary', palette.colors.primary],
              ['Secondary', palette.colors.secondary],
              ['Accent', palette.colors.accent],
              ['Surface', palette.colors.surface],
              ['Border', palette.colors.border],
              ['Text', palette.colors.text_primary],
            ] as [string, string][]
          ).map(([label, color]) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className="h-8 w-8 rounded-full border shadow-sm"
                style={{ backgroundColor: color, borderColor: 'rgba(0,0,0,0.1)' }}
                title={`${label}: ${color}`}
              />
              <span className="text-muted-foreground text-[10px]">{label}</span>
            </div>
          ))}
        </div>

        {/* Contrast report */}
        <div className="col-span-1 sm:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>
              Contraste WCAG 2.1 AA
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${allPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {allPass ? '✓ Todo pasa' : '⚠ Revisar'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {contrastChecks.map((check) => (
              <div
                key={check.label}
                className="flex items-center justify-between rounded px-2 py-1 text-[11px]"
                style={{
                  backgroundColor: check.passes ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                }}
              >
                <span style={{ color: 'var(--color-foreground)', opacity: 0.8 }}>
                  {check.label}
                </span>
                <span
                  className="ml-2 shrink-0 font-mono font-bold"
                  style={{ color: check.passes ? '#16a34a' : '#dc2626' }}
                >
                  {check.ratio.toFixed(1)}:1
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
