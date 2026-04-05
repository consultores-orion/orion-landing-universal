import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

const patchSchema = z.object({
  is_read: z.boolean().optional(),
})

// ─────────────────────────────────────────────
// GET /api/leads/[id]
// ─────────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const { data, error } = await supabase.from('leads').select('*').eq('id', id).single()

  if (error || !data) {
    return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// ─────────────────────────────────────────────
// PATCH /api/leads/[id]
// ─────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.is_read !== undefined) updates['is_read'] = parsed.data.is_read

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[PATCH /api/leads/[id]] Supabase error:', error)
    return NextResponse.json({ error: 'Error al actualizar lead' }, { status: 500 })
  }

  // Return updated lead + current unread count
  const { count: unreadCount } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)

  return NextResponse.json({ data, unreadCount: unreadCount ?? 0 })
}

// ─────────────────────────────────────────────
// DELETE /api/leads/[id]
// ─────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const { error } = await supabase.from('leads').delete().eq('id', id)

  if (error) {
    console.error('[DELETE /api/leads/[id]] Supabase error:', error)
    return NextResponse.json({ error: 'Error al eliminar lead' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
