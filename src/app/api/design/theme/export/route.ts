import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ColorPalette } from '@/lib/themes/types'

// ─────────────────────────────────────────────
// GET /api/design/theme/export
// Downloads the complete active theme as a JSON file
// ─────────────────────────────────────────────

export async function GET() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch theme_config
  const { data: themeRow, error: themeError } = await supabase
    .from('theme_config')
    .select('*')
    .maybeSingle()

  if (themeError) {
    console.error('[GET /api/design/theme/export] theme_config error:', themeError)
    return NextResponse.json({ error: 'Failed to fetch theme config' }, { status: 500 })
  }

  if (!themeRow) {
    return NextResponse.json({ error: 'No theme config found' }, { status: 404 })
  }

  // Fetch the active palette to include its colors in the export
  let palette: ColorPalette | null = null
  if (themeRow.palette_id) {
    const { data: paletteRow } = await supabase
      .from('color_palettes')
      .select('*')
      .eq('id', themeRow.palette_id)
      .maybeSingle()

    if (paletteRow) {
      palette = {
        id: paletteRow.id,
        name: paletteRow.name,
        description: paletteRow.description,
        niche: paletteRow.niche,
        colors: paletteRow.colors as unknown as ColorPalette['colors'],
        is_predefined: paletteRow.is_predefined,
      }
    }
  }

  const exportData = {
    version: '1',
    palette: palette
      ? {
          name: palette.name,
          colors: palette.colors,
        }
      : null,
    typography: {
      font_heading: (themeRow.typography?.['font_heading'] as string | undefined) ?? 'Inter',
      font_body: (themeRow.typography?.['font_body'] as string | undefined) ?? 'Inter',
      base_size: (themeRow.typography?.['base_size'] as string | undefined) ?? '16px',
      scale_ratio: (themeRow.typography?.['scale_ratio'] as number | undefined) ?? 1.25,
    },
    spacing: {
      section_padding:
        (themeRow.spacing?.['section_padding'] as string | undefined) ?? 'comfortable',
      container_max_width:
        (themeRow.spacing?.['container_max_width'] as string | undefined) ?? '1200px',
      element_gap: (themeRow.spacing?.['element_gap'] as string | undefined) ?? '16px',
    },
    borderRadius: themeRow.border_radius ?? 'medium',
    customColors: (themeRow.custom_colors ?? {}) as Record<string, string>,
    createdAt: new Date().toISOString(),
  }

  const date = new Date().toISOString().split('T')[0]
  const filename = `orion-theme-${date}.json`

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
