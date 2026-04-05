import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────

const siteConfigSchema = z.object({
  site_name: z.string().min(1).max(100).optional(),
  site_description: z.string().max(500).optional(),
  favicon_url: z.string().url().optional().or(z.literal('')),
  logo_url: z.string().url().optional().or(z.literal('')),
  logo_dark_url: z.string().url().optional().or(z.literal('')),
  primary_contact_email: z.string().email().optional().or(z.literal('')),
  social_links: z.record(z.string(), z.string()).optional(),
  custom_css: z.string().max(50000).optional(),
  custom_head_scripts: z.string().max(50000).optional(),
})

// ─────────────────────────────────────────────
// GET /api/settings — Obtener site_config
// ─────────────────────────────────────────────

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase.from('site_config').select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// ─────────────────────────────────────────────
// PUT /api/settings — Actualizar site_config
// ─────────────────────────────────────────────

export async function PUT(request: NextRequest) {
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

  const parsed = siteConfigSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  // Obtener el ID existente
  const { data: existing, error: fetchError } = await supabase
    .from('site_config')
    .select('id')
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Configuración no encontrada' }, { status: 404 })
  }

  const updateData = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('site_config')
    .update(updateData)
    .eq('id', existing.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')
  revalidatePath('/admin')

  return NextResponse.json({ data })
}
