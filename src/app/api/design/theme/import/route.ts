import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────

const paletteColorsSchema = z.object({
  primary: z.string().min(1),
  secondary: z.string().min(1),
  accent: z.string().min(1),
  background: z.string().min(1),
  surface: z.string().min(1),
  text_primary: z.string().min(1),
  text_secondary: z.string().min(1),
  success: z.string().min(1),
  error: z.string().min(1),
  warning: z.string().min(1),
  info: z.string().min(1),
  border: z.string().min(1),
})

const themeImportSchema = z.object({
  version: z.string().optional(),
  palette: z
    .object({
      name: z.string().min(1).max(100),
      colors: paletteColorsSchema,
    })
    .nullable()
    .optional(),
  typography: z
    .object({
      font_heading: z.string().min(1),
      font_body: z.string().min(1),
      base_size: z.string().min(1),
      scale_ratio: z.number().positive(),
    })
    .optional(),
  spacing: z
    .object({
      section_padding: z.enum(['compact', 'comfortable', 'spacious']),
      container_max_width: z.string().min(1),
      element_gap: z.string().min(1),
    })
    .optional(),
  borderRadius: z.enum(['none', 'small', 'medium', 'large', 'full']).optional(),
  customColors: z.record(z.string(), z.string()).optional(),
  createdAt: z.string().optional(),
})

// ─────────────────────────────────────────────
// POST /api/design/theme/import
// Imports a full theme JSON and applies it
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
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

  const parsed = themeImportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { palette, typography, spacing, borderRadius, customColors } = parsed.data

  // ── Create or find the custom palette if provided ───────
  let paletteId: string | null = null

  if (palette) {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const { data: insertedPalette, error: paletteError } = await supabase
      .from('color_palettes')
      .insert({
        id,
        name: palette.name,
        description: `Importada el ${new Date().toLocaleDateString('es-ES')}`,
        niche: 'custom',
        colors: palette.colors,
        is_predefined: false,
      })
      .select('id')
      .single()

    if (paletteError) {
      console.error('[POST /api/design/theme/import] palette insert error:', paletteError)
      return NextResponse.json({ error: 'Failed to save palette' }, { status: 500 })
    }

    paletteId = insertedPalette.id
  }

  // ── Fetch existing theme_config ──────────────────────────
  const { data: existing, error: fetchError } = await supabase
    .from('theme_config')
    .select('id, typography, spacing')
    .maybeSingle()

  if (fetchError) {
    console.error('[POST /api/design/theme/import] fetch error:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch existing theme config' }, { status: 500 })
  }

  // ── Build update payload ─────────────────────────────────
  const existingTypography = (existing?.typography ?? {}) as Record<string, string | number>
  const updatedTypography: Record<string, string | number> = typography
    ? {
        font_heading: typography.font_heading,
        font_body: typography.font_body,
        base_size: typography.base_size,
        scale_ratio: typography.scale_ratio,
      }
    : existingTypography

  const existingSpacing = (existing?.spacing ?? {}) as Record<string, string>
  const updatedSpacing: Record<string, string> = spacing
    ? {
        section_padding: spacing.section_padding,
        container_max_width: spacing.container_max_width,
        element_gap: spacing.element_gap,
      }
    : existingSpacing

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
    ...(paletteId !== null ? { palette_id: paletteId } : {}),
    ...(borderRadius !== undefined ? { border_radius: borderRadius } : {}),
    ...(customColors !== undefined ? { custom_colors: customColors } : {}),
  }

  // ── Upsert ───────────────────────────────────────────────
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
        palette_id: paletteId ?? 'professional-blue',
        border_radius: borderRadius ?? 'medium',
      })
      .select()
      .single()
  }

  if (result.error) {
    console.error('[POST /api/design/theme/import] upsert error:', result.error)
    return NextResponse.json({ error: 'Failed to apply theme' }, { status: 500 })
  }

  revalidatePath('/')

  return NextResponse.json({ success: true, data: result.data })
}
