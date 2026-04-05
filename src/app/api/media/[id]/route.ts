import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

const updateSchema = z.object({
  alt_text: z.record(z.string(), z.string()).optional(),
  folder: z.string().optional(),
})

// ─────────────────────────────────────────────
// GET /api/media/[id]
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

  const { data, error } = await supabase.from('media').select('*').eq('id', id).single()

  if (error) {
    return NextResponse.json({ error: 'Medio no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// ─────────────────────────────────────────────
// PUT /api/media/[id]
// ─────────────────────────────────────────────

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.alt_text !== undefined) updates['alt_text'] = parsed.data.alt_text
  if (parsed.data.folder !== undefined) updates['folder'] = parsed.data.folder

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('media')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[PUT /api/media/[id]] Supabase error:', error)
    return NextResponse.json({ error: 'Error al actualizar medio' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// ─────────────────────────────────────────────
// DELETE /api/media/[id]
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

  // Fetch record first to get file_path
  const { data: record, error: fetchError } = await supabase
    .from('media')
    .select('file_path')
    .eq('id', id)
    .single()

  if (fetchError || !record) {
    return NextResponse.json({ error: 'Medio no encontrado' }, { status: 404 })
  }

  // Best-effort: delete from Storage
  const { error: storageError } = await supabase.storage.from('media').remove([record.file_path])

  if (storageError) {
    console.warn('[DELETE /api/media/[id]] Storage removal warning:', storageError)
  }

  // Delete from DB
  const { error: dbError } = await supabase.from('media').delete().eq('id', id)

  if (dbError) {
    console.error('[DELETE /api/media/[id]] DB delete error:', dbError)
    return NextResponse.json({ error: 'Error al eliminar registro' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
