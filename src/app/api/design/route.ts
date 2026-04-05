import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ThemeConfig, ColorPalette } from '@/lib/themes/types'

export async function GET() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [themeResult, palettesResult] = await Promise.all([
    supabase.from('theme_config').select('*').maybeSingle(),
    supabase.from('color_palettes').select('*').order('name'),
  ])

  if (themeResult.error) {
    console.error('[GET /api/design] theme_config error:', themeResult.error)
    return NextResponse.json({ error: 'Failed to fetch theme config' }, { status: 500 })
  }

  if (palettesResult.error) {
    console.error('[GET /api/design] color_palettes error:', palettesResult.error)
    return NextResponse.json({ error: 'Failed to fetch palettes' }, { status: 500 })
  }

  const dbRow = themeResult.data
  const themeConfig: ThemeConfig | null = dbRow
    ? {
        id: dbRow.id,
        palette_id: dbRow.palette_id,
        custom_colors: (dbRow.custom_colors ?? {}) as ThemeConfig['custom_colors'],
        typography: {
          font_heading: (dbRow.typography?.['font_heading'] as string | undefined) ?? 'Inter',
          font_body: (dbRow.typography?.['font_body'] as string | undefined) ?? 'Inter',
          base_size: (dbRow.typography?.['base_size'] as string | undefined) ?? '16px',
          scale_ratio: (dbRow.typography?.['scale_ratio'] as number | undefined) ?? 1.25,
        },
        spacing: {
          section_padding:
            (dbRow.spacing?.['section_padding'] as string | undefined) ?? 'comfortable',
          container_max_width:
            (dbRow.spacing?.['container_max_width'] as string | undefined) ?? '1200px',
          element_gap: (dbRow.spacing?.['element_gap'] as string | undefined) ?? '16px',
        },
        border_radius: dbRow.border_radius ?? 'medium',
      }
    : null

  const palettes: ColorPalette[] = (palettesResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    niche: row.niche,
    colors: row.colors as unknown as ColorPalette['colors'],
    is_predefined: row.is_predefined,
  }))

  return NextResponse.json({ themeConfig, palettes })
}
