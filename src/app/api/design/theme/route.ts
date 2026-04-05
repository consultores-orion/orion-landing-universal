import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────

const spacingPresetSchema = z.enum(['compact', 'comfortable', 'spacious'])
const borderRadiusSchema = z.enum(['none', 'small', 'medium', 'large', 'full'])

const updateThemeSchema = z.object({
  active_palette_id: z.string().min(1).optional(),
  heading_font: z.string().min(1).optional(),
  body_font: z.string().min(1).optional(),
  spacing_preset: spacingPresetSchema.optional(),
  border_radius: borderRadiusSchema.optional(),
  custom_colors: z.record(z.string(), z.string()).optional(),
})

// ─────────────────────────────────────────────
// PUT /api/design/theme
// ─────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateThemeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const {
    active_palette_id,
    heading_font,
    body_font,
    spacing_preset,
    border_radius,
    custom_colors,
  } = parsed.data

  // ── Fetch existing row first ────────────────
  const { data: existing, error: fetchError } = await supabase
    .from('theme_config')
    .select('id, typography, spacing')
    .maybeSingle()

  if (fetchError) {
    console.error('[PUT /api/design/theme] fetch error:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch existing theme config' }, { status: 500 })
  }

  // ── Build update payload ────────────────────

  // Merge typography fields — preserve existing values not being updated
  const existingTypography = (existing?.typography ?? {}) as Record<string, string | number>
  const updatedTypography: Record<string, string | number> = {
    ...existingTypography,
    ...(heading_font !== undefined ? { font_heading: heading_font } : {}),
    ...(body_font !== undefined ? { font_body: body_font } : {}),
  }

  // Merge spacing fields — store spacing_preset under section_padding key
  const existingSpacing = (existing?.spacing ?? {}) as Record<string, string>
  const updatedSpacing: Record<string, string> = {
    ...existingSpacing,
    ...(spacing_preset !== undefined ? { section_padding: spacing_preset } : {}),
  }

  const updatePayload: {
    updated_at: string
    typography: Record<string, string | number>
    spacing: Record<string, string>
    palette_id?: string
    border_radius?: string
    custom_colors?: Record<string, string>
  } = {
    updated_at: new Date().toISOString(),
    typography: updatedTypography,
    spacing: updatedSpacing,
    ...(active_palette_id !== undefined ? { palette_id: active_palette_id } : {}),
    ...(border_radius !== undefined ? { border_radius } : {}),
    ...(custom_colors !== undefined ? { custom_colors } : {}),
  }

  // ── Upsert — update if exists, insert if not ─

  let result

  if (existing) {
    result = await supabase
      .from('theme_config')
      .update(updatePayload)
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('theme_config')
      .insert({
        ...updatePayload,
        palette_id: active_palette_id ?? 'professional-blue',
        border_radius: border_radius ?? 'medium',
      })
      .select()
      .single()
  }

  if (result.error) {
    console.error('[PUT /api/design/theme] upsert error:', result.error)
    return NextResponse.json({ error: 'Failed to update theme config' }, { status: 500 })
  }

  // Revalidate public landing page so CSS variables are refreshed
  revalidatePath('/')

  return NextResponse.json({ success: true, data: result.data })
}
