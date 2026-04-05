import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Redact SMTP password before sending to the client */
function redactSensitiveConfig(
  integrations: Array<{
    id: string
    type: string
    config: Record<string, unknown>
    is_active: boolean
    created_at: string
    updated_at: string
  }>,
) {
  return integrations.map((integration) => {
    if (
      integration.type === 'smtp' &&
      integration.config['password'] !== undefined &&
      integration.config['password'] !== ''
    ) {
      return {
        ...integration,
        config: { ...integration.config, password: '***' },
      }
    }
    return integration
  })
}

// ─────────────────────────────────────────────────────────────
// GET — list all integrations (auth required)
// ─────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase.from('integrations').select('*').order('type')

  if (error) {
    console.error('[GET /api/integrations] Supabase error:', error)
    return NextResponse.json({ error: 'Error al obtener integraciones' }, { status: 500 })
  }

  const safe = redactSensitiveConfig(data ?? [])

  return NextResponse.json({ data: safe })
}

// ─────────────────────────────────────────────────────────────
// PUT — update one integration (auth required)
// ─────────────────────────────────────────────────────────────

const updateSchema = z.object({
  id: z.string().uuid(),
  is_active: z.boolean(),
  config: z.record(z.string(), z.unknown()),
})

export async function PUT(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Validate
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: result.error.flatten() },
      { status: 400 },
    )
  }

  const { id, is_active, config } = result.data

  // If the incoming config has password === '***', preserve the existing one
  let finalConfig: Record<string, unknown> = config
  if (config['password'] === '***') {
    const { data: existing } = await supabase
      .from('integrations')
      .select('config, type')
      .eq('id', id)
      .single()

    if (existing?.type === 'smtp') {
      const existingPassword = existing.config['password']
      finalConfig = { ...config, password: existingPassword }
    }
  }

  const { data, error } = await supabase
    .from('integrations')
    .update({ is_active, config: finalConfig })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[PUT /api/integrations] Supabase error:', error)
    return NextResponse.json({ error: 'Error al actualizar integración' }, { status: 500 })
  }

  // Revalidate landing page so scripts are re-injected
  revalidatePath('/')

  // Redact sensitive data before returning
  const safe =
    data.type === 'smtp' && data.config['password'] !== undefined && data.config['password'] !== ''
      ? { ...data, config: { ...data.config, password: '***' } }
      : data

  return NextResponse.json({ data: safe })
}
