import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────

const paletteImportSchema = z.object({
  version: z.string().optional(),
  name: z.string().min(1).max(100),
  colors: z.object({
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
  }),
  createdAt: z.string().optional(),
})

// ─────────────────────────────────────────────
// POST /api/design/palette/import
// Imports a palette JSON and saves it as a custom palette
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

  const parsed = paletteImportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { name, colors } = parsed.data

  // Generate a unique id for the custom palette
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const { data, error } = await supabase
    .from('color_palettes')
    .insert({
      id,
      name,
      description: `Importada el ${new Date().toLocaleDateString('es-ES')}`,
      niche: 'custom',
      colors,
      is_predefined: false,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/design/palette/import] insert error:', error)
    return NextResponse.json({ error: 'Failed to save palette' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
