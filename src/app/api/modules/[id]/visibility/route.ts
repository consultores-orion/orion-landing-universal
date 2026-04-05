import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const visibilitySchema = z.object({
  is_visible: z.boolean(),
})

// PATCH /api/modules/[id]/visibility — toggle module visibility
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = visibilitySchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 },
    )
  }

  const { is_visible } = result.data

  // Guard: fetch current module to check is_system
  const { data: moduleRow, error: fetchError } = await supabase
    .from('page_modules')
    .select('is_system, is_visible')
    .eq('id', id)
    .single()

  if (fetchError || !moduleRow) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  // Prevent deactivating system modules
  if (moduleRow.is_system && !is_visible) {
    return NextResponse.json(
      { error: 'Los módulos del sistema no se pueden desactivar' },
      { status: 400 },
    )
  }

  const { error: updateError } = await supabase
    .from('page_modules')
    .update({ is_visible, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    console.error('[PATCH /api/modules/[id]/visibility] Supabase error:', updateError)
    return NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
