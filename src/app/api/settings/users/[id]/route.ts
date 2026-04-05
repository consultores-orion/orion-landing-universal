import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────
// DELETE /api/settings/users/[id] — Eliminar usuario
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

  // No puede eliminarse a sí mismo
  if (id === user.id) {
    return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  // Verificar que no es el último usuario
  const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers()
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }

  if ((usersData.users ?? []).length <= 1) {
    return NextResponse.json(
      { error: 'No puedes eliminar el único usuario admin' },
      { status: 400 },
    )
  }

  const { error } = await adminSupabase.auth.admin.deleteUser(id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ─────────────────────────────────────────────
// PUT /api/settings/users/[id] — Cambiar contraseña
// ─────────────────────────────────────────────

const changePasswordSchema = z.object({
  password: z.string().min(8),
})

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

  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  if (id === user.id) {
    // Cambiar la propia contraseña
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Cambiar contraseña de otro usuario
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.auth.admin.updateUserById(id, {
      password: parsed.data.password,
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
