import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────

const moduleLayoutSchema = z.object({
  section_key: z.string().min(1),
  display_order: z.number().int().positive(),
  is_visible: z.boolean(),
  display_name: z.unknown().optional(),
})

const layoutImportSchema = z.object({
  version: z.string().optional(),
  modules: z.array(moduleLayoutSchema).min(1),
  createdAt: z.string().optional(),
})

// ─────────────────────────────────────────────
// POST /api/modules/import
// Imports a layout JSON and applies order + visibility
// Only updates modules that already exist in the DB
// Never creates new modules
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

  const parsed = layoutImportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { modules: importedModules } = parsed.data

  // Fetch existing section_keys from DB
  const { data: existingRows, error: fetchError } = await supabase
    .from('page_modules')
    .select('id, section_key')

  if (fetchError) {
    console.error('[POST /api/modules/import] fetch error:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch existing modules' }, { status: 500 })
  }

  // Build a map of section_key → id for quick lookup
  const existingMap = new Map<string, string>(
    (existingRows ?? []).map((row) => [row.section_key, row.id]),
  )

  // Update each module that exists in DB — ignore unknown section_keys
  const updates = importedModules
    .filter((m) => existingMap.has(m.section_key))
    .map((m) => {
      const id = existingMap.get(m.section_key)!
      return supabase
        .from('page_modules')
        .update({
          display_order: m.display_order,
          is_visible: m.is_visible,
        })
        .eq('id', id)
    })

  const results = await Promise.all(updates)

  const errors = results.filter((r) => r.error)
  if (errors.length > 0) {
    console.error('[POST /api/modules/import] update errors:', errors)
    return NextResponse.json(
      { error: `Failed to update ${errors.length} module(s)` },
      { status: 500 },
    )
  }

  revalidatePath('/')

  return NextResponse.json({
    success: true,
    updated: results.length,
    skipped: importedModules.length - results.length,
  })
}
