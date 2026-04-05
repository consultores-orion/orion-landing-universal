import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ColorPalette } from '@/lib/themes/types'

// ─────────────────────────────────────────────
// GET /api/design/palette/export
// Downloads the active palette as a JSON file
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

  // Fetch the active theme to get the palette_id
  const { data: themeRow, error: themeError } = await supabase
    .from('theme_config')
    .select('palette_id')
    .maybeSingle()

  if (themeError) {
    console.error('[GET /api/design/palette/export] theme_config error:', themeError)
    return NextResponse.json({ error: 'Failed to fetch theme config' }, { status: 500 })
  }

  if (!themeRow?.palette_id) {
    return NextResponse.json({ error: 'No active palette found' }, { status: 404 })
  }

  // Fetch the active palette
  const { data: paletteRow, error: paletteError } = await supabase
    .from('color_palettes')
    .select('*')
    .eq('id', themeRow.palette_id)
    .single()

  if (paletteError || !paletteRow) {
    console.error('[GET /api/design/palette/export] color_palettes error:', paletteError)
    return NextResponse.json({ error: 'Failed to fetch active palette' }, { status: 500 })
  }

  const palette: ColorPalette = {
    id: paletteRow.id,
    name: paletteRow.name,
    description: paletteRow.description,
    niche: paletteRow.niche,
    colors: paletteRow.colors as unknown as ColorPalette['colors'],
    is_predefined: paletteRow.is_predefined,
  }

  const exportData = {
    version: '1',
    name: palette.name,
    colors: palette.colors,
    createdAt: new Date().toISOString(),
  }

  const date = new Date().toISOString().split('T')[0]
  const filename = `orion-palette-${date}.json`

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
