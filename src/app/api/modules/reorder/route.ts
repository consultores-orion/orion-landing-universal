import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const reorderSchema = z.object({
  order: z.array(
    z.object({
      id: z.string().uuid(),
      display_order: z.number().int().positive(),
    }),
  ),
})

// PATCH /api/modules/reorder — updates display_order for each module
export async function PATCH(request: NextRequest) {
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

  const result = reorderSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 },
    )
  }

  const { order } = result.data

  try {
    await Promise.all(
      order.map(({ id, display_order }) =>
        supabase
          .from('page_modules')
          .update({ display_order, updated_at: new Date().toISOString() })
          .eq('id', id),
      ),
    )
  } catch (err) {
    console.error('[PATCH /api/modules/reorder] Error:', err)
    return NextResponse.json({ error: 'Failed to reorder modules' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
