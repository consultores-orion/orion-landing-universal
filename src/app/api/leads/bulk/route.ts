import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['mark_read', 'mark_unread', 'delete']),
})

// ─────────────────────────────────────────────
// PATCH /api/leads/bulk
// ─────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = bulkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { ids, action } = parsed.data

  let dbError: { message: string } | null = null

  switch (action) {
    case 'mark_read': {
      const { error } = await supabase.from('leads').update({ is_read: true }).in('id', ids)
      dbError = error
      break
    }
    case 'mark_unread': {
      const { error } = await supabase.from('leads').update({ is_read: false }).in('id', ids)
      dbError = error
      break
    }
    case 'delete': {
      const { error } = await supabase.from('leads').delete().in('id', ids)
      dbError = error
      break
    }
  }

  if (dbError) {
    console.error('[PATCH /api/leads/bulk] Supabase error:', dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  // Return updated unread count
  const { count: unreadCount } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)

  return NextResponse.json({ success: true, unreadCount: unreadCount ?? 0 })
}
