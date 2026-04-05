import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const patchSchema = z.object({
  is_visible: z.boolean().optional(),
})

// PATCH /api/modules/[id] — general-purpose patch for module fields
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

  const result = patchSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 },
    )
  }

  const updates: { is_visible?: boolean; updated_at: string } = {
    updated_at: new Date().toISOString(),
  }

  if (result.data.is_visible !== undefined) {
    updates.is_visible = result.data.is_visible
  }

  const { error } = await supabase.from('page_modules').update(updates).eq('id', id)

  if (error) {
    console.error('[PATCH /api/modules/[id]] Supabase error:', error)
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
