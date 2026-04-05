'use client'

import { Ruler } from 'lucide-react'
import { cn } from '@/lib/utils'

type SpacingPreset = 'compact' | 'comfortable' | 'spacious'
type BorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full'

interface SpacingEditorProps {
  spacingPreset: SpacingPreset
  borderRadius: BorderRadius
  onChange: (key: 'spacingPreset' | 'borderRadius', value: string) => void
}

const SPACING_OPTIONS: Array<{
  value: SpacingPreset
  label: string
  description: string
}> = [
  { value: 'compact', label: 'Compacto', description: 'Menos espacio' },
  {
    value: 'comfortable',
    label: 'Cómodo',
    description: 'Espaciado normal',
  },
  { value: 'spacious', label: 'Amplio', description: 'Más espacio' },
]

const RADIUS_OPTIONS: Array<{
  value: BorderRadius
  label: string
  px: string
}> = [
  { value: 'none', label: 'Ninguno', px: '0px' },
  { value: 'small', label: 'Pequeño', px: '4px' },
  { value: 'medium', label: 'Mediano', px: '8px' },
  { value: 'large', label: 'Grande', px: '16px' },
  { value: 'full', label: 'Completo', px: '9999px' },
]

export function SpacingEditor({ spacingPreset, borderRadius, onChange }: SpacingEditorProps) {
  return (
    <div className="space-y-8">
      {/* Spacing presets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Ruler className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-semibold">Espaciado de Secciones</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {SPACING_OPTIONS.map((option) => {
            const isActive = spacingPreset === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange('spacingPreset', option.value)}
                className={cn(
                  'focus-visible:ring-ring flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-4 text-center transition-all focus-visible:ring-2 focus-visible:outline-none',
                  isActive
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50',
                )}
              >
                {/* Visual spacer representation */}
                <div className="flex flex-col gap-1">
                  {option.value === 'compact' && (
                    <>
                      <div className="h-1 w-8 rounded-full bg-current opacity-60" />
                      <div className="h-1 w-8 rounded-full bg-current opacity-60" />
                      <div className="h-1 w-8 rounded-full bg-current opacity-60" />
                    </>
                  )}
                  {option.value === 'comfortable' && (
                    <>
                      <div className="h-1 w-8 rounded-full bg-current opacity-60" />
                      <div className="h-2" />
                      <div className="h-1 w-8 rounded-full bg-current opacity-60" />
                      <div className="h-2" />
                      <div className="h-1 w-8 rounded-full bg-current opacity-60" />
                    </>
                  )}
                  {option.value === 'spacious' && (
                    <>
                      <div className="h-1 w-8 rounded-full bg-current opacity-60" />
                      <div className="h-4" />
                      <div className="h-1 w-8 rounded-full bg-current opacity-60" />
                      <div className="h-4" />
                      <div className="h-1 w-8 rounded-full bg-current opacity-60" />
                    </>
                  )}
                </div>
                <span className="text-xs font-semibold">{option.label}</span>
                <span className="text-muted-foreground text-xs">{option.description}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Border radius */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Ruler className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-semibold">Radio de Esquinas</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((option) => {
            const isActive = borderRadius === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange('borderRadius', option.value)}
                className={cn(
                  'focus-visible:ring-ring rounded-md border-2 px-4 py-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:outline-none',
                  isActive
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        {/* Visual preview of border radius options */}
        <div className="mt-4 flex flex-wrap gap-3">
          {RADIUS_OPTIONS.map((option) => {
            const isActive = borderRadius === option.value
            return (
              <div
                key={option.value}
                className={cn(
                  'flex h-12 w-12 items-center justify-center border-2 transition-all',
                  isActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/30',
                )}
                style={{ borderRadius: option.px }}
                title={option.label}
              >
                <span className="text-muted-foreground text-xs">{option.label.slice(0, 1)}</span>
              </div>
            )
          })}
        </div>

        <p className="text-muted-foreground text-xs">
          Afecta a botones, cards, inputs y demás elementos de la landing page.
        </p>
      </div>
    </div>
  )
}
