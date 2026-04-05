'use client'

import { Type } from 'lucide-react'
import { Label } from '@/components/ui/label'

const GOOGLE_FONTS = [
  'Poppins',
  'Lato',
  'Inter',
  'Roboto',
  'Montserrat',
  'Open Sans',
  'Playfair Display',
  'Raleway',
  'Nunito',
  'Source Sans 3',
  'Merriweather',
  'Oswald',
  'PT Sans',
  'Ubuntu',
  'Work Sans',
] as const

interface TypographyEditorProps {
  headingFont: string
  bodyFont: string
  onChange: (key: 'headingFont' | 'bodyFont', value: string) => void
}

export function TypographyEditor({ headingFont, bodyFont, onChange }: TypographyEditorProps) {
  return (
    <div className="space-y-8">
      {/* Heading font */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="text-muted-foreground h-4 w-4" />
          <Label htmlFor="heading-font" className="text-sm font-semibold">
            Fuente de Títulos
          </Label>
        </div>

        <select
          id="heading-font"
          value={headingFont}
          onChange={(e) => onChange('headingFont', e.target.value)}
          className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none"
        >
          {GOOGLE_FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        {/* Live preview */}
        <div
          className="bg-muted/30 rounded-md border p-3 text-lg"
          style={{ fontFamily: headingFont }}
        >
          Aa — The quick brown fox
        </div>

        <p className="text-muted-foreground text-xs">
          Se aplica a H1, H2, H3 y textos destacados de la landing page.
        </p>
      </div>

      {/* Body font */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="text-muted-foreground h-4 w-4" />
          <Label htmlFor="body-font" className="text-sm font-semibold">
            Fuente de Texto
          </Label>
        </div>

        <select
          id="body-font"
          value={bodyFont}
          onChange={(e) => onChange('bodyFont', e.target.value)}
          className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none"
        >
          {GOOGLE_FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        {/* Live preview */}
        <div
          className="bg-muted/30 rounded-md border p-3 text-base leading-relaxed"
          style={{ fontFamily: bodyFont }}
        >
          Aa — Párrafo de ejemplo. El texto de tu landing page usará esta tipografía para
          descripciones, cuerpo de texto y elementos de contenido general.
        </div>

        <p className="text-muted-foreground text-xs">
          Se aplica a párrafos, descripciones y textos de cuerpo.
        </p>
      </div>

      <p className="rounded-md border border-dashed border-yellow-400 bg-yellow-50 p-3 text-xs text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400">
        La vista previa usa fuentes del sistema como respaldo. Las fuentes Google se cargan
        completamente en la landing page pública.
      </p>
    </div>
  )
}
