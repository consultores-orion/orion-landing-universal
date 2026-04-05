import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────

const addLanguageSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1).max(100),
  native_name: z.string().min(1).max(100),
  flag_emoji: z.string().min(1).max(10),
})

// ─────────────────────────────────────────────────────────────
// GET /api/i18n — all languages ordered by sort_order
// ─────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[GET /api/i18n] Supabase error:', error)
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// ─────────────────────────────────────────────────────────────
// POST /api/i18n — add new language
// ─────────────────────────────────────────────────────────────

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

  const result = addLanguageSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 },
    )
  }

  // Check if the language code already exists
  const { data: existing } = await supabase
    .from('languages')
    .select('code')
    .eq('code', result.data.code)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Language already exists' }, { status: 409 })
  }

  // Determine sort_order = current count
  const { count } = await supabase.from('languages').select('code', { count: 'exact', head: true })

  const sortOrder = count ?? 0

  const { data: inserted, error: insertError } = await supabase
    .from('languages')
    .insert({
      code: result.data.code,
      name: result.data.name,
      native_name: result.data.native_name,
      flag_emoji: result.data.flag_emoji,
      sort_order: sortOrder,
      is_default: false,
      is_active: true,
    })
    .select()
    .single()

  if (insertError) {
    console.error('[POST /api/i18n] Supabase error:', insertError)
    return NextResponse.json({ error: 'Failed to add language' }, { status: 500 })
  }

  return NextResponse.json({ data: inserted }, { status: 201 })
}
