import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────

const patchLanguageSchema = z.object({
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

// ─────────────────────────────────────────────────────────────
// GET /api/i18n/[code] — single language
// ─────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await params

  const { data, error } = await supabase.from('languages').select('*').eq('code', code).single()

  if (error) {
    return NextResponse.json({ error: 'Language not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/i18n/[code] — update language (set as default, toggle active)
// ─────────────────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = patchLanguageSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 },
    )
  }

  // If setting is_default: true, clear is_default on all other languages first
  if (result.data.is_default === true) {
    const { error: clearError } = await supabase
      .from('languages')
      .update({ is_default: false })
      .neq('code', code)

    if (clearError) {
      console.error('[PATCH /api/i18n] Failed to clear default flags:', clearError)
      return NextResponse.json({ error: 'Failed to update default language' }, { status: 500 })
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('languages')
    .update(result.data)
    .eq('code', code)
    .select()
    .single()

  if (updateError) {
    console.error('[PATCH /api/i18n] Supabase error:', updateError)
    return NextResponse.json({ error: 'Failed to update language' }, { status: 500 })
  }

  return NextResponse.json({ data: updated })
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/i18n/[code] — remove language
// ─────────────────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await params

  // Fetch the language to validate before deleting
  const { data: language, error: fetchError } = await supabase
    .from('languages')
    .select('code, is_default')
    .eq('code', code)
    .single()

  if (fetchError || !language) {
    return NextResponse.json({ error: 'Language not found' }, { status: 404 })
  }

  if (language.is_default) {
    return NextResponse.json(
      { error: 'Cannot delete the default language. Set another language as default first.' },
      { status: 400 },
    )
  }

  const { error: deleteError } = await supabase.from('languages').delete().eq('code', code)

  if (deleteError) {
    console.error('[DELETE /api/i18n] Supabase error:', deleteError)
    return NextResponse.json({ error: 'Failed to delete language' }, { status: 500 })
  }

  // TODO: Cascade-delete JSONB keys from page_modules.content for the removed language code.
  // This requires iterating all modules and stripping `content[code]` keys — deferred for now
  // to avoid expensive JSONB mutation on each delete. Implement in a future background job.

  return NextResponse.json({ success: true })
}
