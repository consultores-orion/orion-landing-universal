import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/security/rate-limit'

const inlineEditSchema = z.object({
  sectionKey: z.string().min(1),
  fieldPath: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
  lang: z.string().optional(),
})

// PUT /api/inline-edit
// Performs a surgical single-field update on a module's content JSONB column.
// Supports only one level of dot-notation (e.g. "title", not "items.0.text").
export async function PUT(request: NextRequest) {
  // Rate limiting: 30 requests/minute per IP (live editing can be frequent)
  const ip = getClientIp(request)
  const rl = rateLimit(`inline-edit:${ip}`, { windowMs: 60_000, max: 30 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

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

  const result = inlineEditSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 },
    )
  }

  const { sectionKey, fieldPath, value, lang } = result.data

  // Fetch current content
  const { data: moduleRow, error: fetchError } = await supabase
    .from('page_modules')
    .select('content')
    .eq('section_key', sectionKey)
    .single()

  if (fetchError || !moduleRow) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  // Build updated content with surgical field update (single-level dot-notation only)
  const currentContent = (moduleRow.content ?? {}) as Record<string, unknown>
  const newContent: Record<string, unknown> = { ...currentContent }

  if (lang !== undefined && lang !== '') {
    // Multilingual field: update newContent[lang][fieldPath]
    const langBlock = (newContent[lang] ?? {}) as Record<string, unknown>
    newContent[lang] = { ...langBlock, [fieldPath]: value }
  } else {
    // Direct field: update newContent[fieldPath]
    newContent[fieldPath] = value
  }

  const { error: updateError } = await supabase
    .from('page_modules')
    .update({ content: newContent, updated_at: new Date().toISOString() })
    .eq('section_key', sectionKey)

  if (updateError) {
    console.error('[PUT /api/inline-edit] Supabase error:', updateError)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }

  revalidatePath('/')

  return NextResponse.json({ success: true })
}
