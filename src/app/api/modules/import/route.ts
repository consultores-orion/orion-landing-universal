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
  // dry_run: if true, return what would change without applying anything
  dry_run: z.boolean().optional().default(false),
})

type ModuleChange = {
  section_key: string
  display_order: { from: number; to: number } | null
  is_visible: { from: boolean; to: boolean } | null
}

// ─────────────────────────────────────────────
// POST /api/modules/import
// Imports a layout JSON and applies order + visibility via smart merge.
//
// Smart merge behaviour:
//   - Only updates modules that exist in the DB (unknown keys are skipped)
//   - Only updates fields that actually differ from current DB state
//   - dry_run=true returns the diff without applying any changes
//   - Always returns a detailed diff: changes, unchanged, skipped
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

  const { modules: importedModules, dry_run } = parsed.data

  // Fetch current state from DB (id + current values for comparison)
  const { data: existingRows, error: fetchError } = await supabase
    .from('page_modules')
    .select('id, section_key, display_order, is_visible')

  if (fetchError) {
    console.error('[POST /api/modules/import] fetch error:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch existing modules' }, { status: 500 })
  }

  // Build a map of section_key → current DB row for quick lookup
  type DbRow = { id: string; section_key: string; display_order: number; is_visible: boolean }
  const existingMap = new Map<string, DbRow>(
    (existingRows ?? []).map((row) => [row.section_key, row as DbRow]),
  )

  // Compute diff: what would change vs current DB state
  const changes: ModuleChange[] = []
  const unchanged: string[] = []
  const skipped: string[] = []

  for (const imported of importedModules) {
    const current = existingMap.get(imported.section_key)

    if (!current) {
      skipped.push(imported.section_key)
      continue
    }

    const orderDiff =
      current.display_order !== imported.display_order
        ? { from: current.display_order, to: imported.display_order }
        : null

    const visibilityDiff =
      current.is_visible !== imported.is_visible
        ? { from: current.is_visible, to: imported.is_visible }
        : null

    if (orderDiff !== null || visibilityDiff !== null) {
      changes.push({
        section_key: imported.section_key,
        display_order: orderDiff,
        is_visible: visibilityDiff,
      })
    } else {
      unchanged.push(imported.section_key)
    }
  }

  // If dry run, return diff without touching the DB
  if (dry_run) {
    return NextResponse.json({
      success: true,
      dry_run: true,
      changes,
      unchanged,
      skipped,
    })
  }

  // Apply only the modules that actually differ (smart merge)
  const updates = changes.map((change) => {
    const current = existingMap.get(change.section_key)!
    const patch: { display_order?: number; is_visible?: boolean } = {}
    if (change.display_order !== null) patch.display_order = change.display_order.to
    if (change.is_visible !== null) patch.is_visible = change.is_visible.to

    return supabase.from('page_modules').update(patch).eq('id', current.id)
  })

  if (updates.length > 0) {
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
  }

  return NextResponse.json({
    success: true,
    dry_run: false,
    changes,
    unchanged,
    skipped,
  })
}
