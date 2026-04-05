'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Palette, Type, Ruler, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ThemeConfig, ColorPalette } from '@/lib/themes/types'
import { PaletteSelector } from './PaletteSelector'
import { TypographyEditor } from './TypographyEditor'
import { SpacingEditor } from './SpacingEditor'
import { PaletteExportImport } from './PaletteExportImport'
import { ThemeExportImport } from './ThemeExportImport'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ActiveTab = 'palette' | 'typography' | 'spacing'

type SpacingPreset = 'compact' | 'comfortable' | 'spacious'
type BorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full'

interface LocalTheme {
  palette_id: string
  heading_font: string
  body_font: string
  spacing_preset: SpacingPreset
  border_radius: BorderRadius
}

interface DesignEditorProps {
  themeConfig: ThemeConfig | null
  palettes: ColorPalette[]
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function isSpacingPreset(value: string): value is SpacingPreset {
  return ['compact', 'comfortable', 'spacious'].includes(value)
}

function isBorderRadius(value: string): value is BorderRadius {
  return ['none', 'small', 'medium', 'large', 'full'].includes(value)
}

function buildInitialTheme(themeConfig: ThemeConfig | null): LocalTheme {
  const spacingRaw = themeConfig?.spacing?.section_padding ?? 'comfortable'
  const radiusRaw = themeConfig?.border_radius ?? 'medium'

  return {
    palette_id: themeConfig?.palette_id ?? 'professional-blue',
    heading_font: themeConfig?.typography?.font_heading ?? 'Inter',
    body_font: themeConfig?.typography?.font_body ?? 'Inter',
    spacing_preset: isSpacingPreset(spacingRaw) ? spacingRaw : 'comfortable',
    border_radius: isBorderRadius(radiusRaw) ? radiusRaw : 'medium',
  }
}

// ─────────────────────────────────────────────
// Tab config
// ─────────────────────────────────────────────

const TABS: Array<{ id: ActiveTab; label: string; Icon: typeof Palette }> = [
  { id: 'palette', label: 'Paleta de Colores', Icon: Palette },
  { id: 'typography', label: 'Tipografía', Icon: Type },
  { id: 'spacing', label: 'Espaciado y Bordes', Icon: Ruler },
]

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function DesignEditor({ themeConfig, palettes }: DesignEditorProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('palette')
  const [localTheme, setLocalTheme] = useState<LocalTheme>(() => buildInitialTheme(themeConfig))
  const [isSaving, setIsSaving] = useState(false)

  // ── Handlers ──────────────────────────────

  function handlePaletteSelect(paletteId: string) {
    setLocalTheme((prev) => ({ ...prev, palette_id: paletteId }))
  }

  function handleTypographyChange(key: 'headingFont' | 'bodyFont', value: string) {
    setLocalTheme((prev) => ({
      ...prev,
      heading_font: key === 'headingFont' ? value : prev.heading_font,
      body_font: key === 'bodyFont' ? value : prev.body_font,
    }))
  }

  function handleSpacingChange(key: 'spacingPreset' | 'borderRadius', value: string) {
    if (key === 'spacingPreset' && isSpacingPreset(value)) {
      setLocalTheme((prev) => ({ ...prev, spacing_preset: value }))
    } else if (key === 'borderRadius' && isBorderRadius(value)) {
      setLocalTheme((prev) => ({ ...prev, border_radius: value }))
    }
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const body = {
        active_palette_id: localTheme.palette_id,
        heading_font: localTheme.heading_font,
        body_font: localTheme.body_font,
        spacing_preset: localTheme.spacing_preset,
        border_radius: localTheme.border_radius,
      }

      const res = await fetch('/api/design/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(json?.error ?? 'Error al guardar el tema')
      }

      toast.success('Diseño guardado correctamente')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al guardar'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Render ────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="border-border bg-muted/40 flex gap-1 rounded-lg border p-1">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'focus-visible:ring-ring flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:outline-none',
              activeTab === id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
        {activeTab === 'palette' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-foreground text-sm font-semibold">
                  Selecciona una paleta de colores
                </h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Define la identidad visual de tu landing page. Puedes personalizarla después.
                </p>
              </div>
              <PaletteExportImport
                onImportSuccess={() => {
                  toast.info('Paleta importada. Recarga la página para verla en la lista.')
                }}
              />
            </div>
            <PaletteSelector
              palettes={palettes}
              activePaletteId={localTheme.palette_id}
              onSelect={handlePaletteSelect}
            />
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-foreground text-sm font-semibold">Tipografía</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Elige las fuentes para títulos y texto de tu landing page.
              </p>
            </div>
            <TypographyEditor
              headingFont={localTheme.heading_font}
              bodyFont={localTheme.body_font}
              onChange={handleTypographyChange}
            />
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-foreground text-sm font-semibold">Espaciado y Bordes</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Controla el ritmo visual y las esquinas de los elementos.
              </p>
            </div>
            <SpacingEditor
              spacingPreset={localTheme.spacing_preset}
              borderRadius={localTheme.border_radius}
              onChange={handleSpacingChange}
            />
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
        <ThemeExportImport
          onImportSuccess={() => {
            toast.info('Tema importado. Recarga la página para ver los cambios reflejados.')
          }}
        />
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-xs">
            Los cambios se aplican inmediatamente en la landing page pública.
          </p>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  )
}
