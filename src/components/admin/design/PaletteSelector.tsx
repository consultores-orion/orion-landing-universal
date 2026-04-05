'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ColorPalette } from '@/lib/themes/types'

interface PaletteSelectorProps {
  palettes: ColorPalette[]
  activePaletteId: string | null
  onSelect: (paletteId: string) => void
}

const PREVIEW_COLOR_KEYS: Array<keyof ColorPalette['colors']> = [
  'primary',
  'secondary',
  'accent',
  'background',
  'text_primary',
]

export function PaletteSelector({ palettes, activePaletteId, onSelect }: PaletteSelectorProps) {
  if (palettes.length === 0) {
    return <p className="text-muted-foreground text-sm">No hay paletas disponibles.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {palettes.map((palette) => {
        const isActive = palette.id === activePaletteId

        return (
          <button
            key={palette.id}
            type="button"
            onClick={() => onSelect(palette.id)}
            className={cn(
              'group focus-visible:ring-ring relative flex cursor-pointer flex-col gap-2 rounded-lg border-2 p-3 text-left transition-all duration-150 hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none',
              isActive
                ? 'border-primary ring-primary shadow-md ring-2'
                : 'border-border hover:border-primary/50',
            )}
          >
            {/* Selected check */}
            {isActive && (
              <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full">
                <Check className="h-3 w-3" />
              </span>
            )}

            {/* Color circles */}
            <div className="flex gap-1">
              {PREVIEW_COLOR_KEYS.map((key) => (
                <div
                  key={key}
                  className="h-6 w-6 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: palette.colors[key] }}
                  title={key}
                />
              ))}
            </div>

            {/* Name & niche */}
            <div className="min-w-0">
              <p className="text-foreground truncate text-xs leading-tight font-semibold">
                {palette.name}
              </p>
              <p className="text-muted-foreground truncate text-xs">{palette.niche}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
