import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/security/rate-limit'
import { pluginRegistry } from '@/lib/plugins'

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

  // Capture old value for change log
  let oldValue: unknown
  if (lang !== undefined && lang !== '') {
    // Multilingual field: update newContent[lang][fieldPath]
    const langBlock = (newContent[lang] ?? {}) as Record<string, unknown>
    oldValue = langBlock[fieldPath]
    newContent[lang] = { ...langBlock, [fieldPath]: value }
  } else {
    // Direct field: update newContent[fieldPath]
    oldValue = newContent[fieldPath]
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

  // Log the change — non-blocking: a failure here must not break the edit response
  supabase
    .from('content_changes')
    .insert({
      user_id: user.id,
      section_key: sectionKey,
      field_path: fieldPath,
      lang: lang !== '' ? lang : null,
      old_value: oldValue !== undefined ? String(oldValue) : null,
      new_value: String(value),
    })
    .then(({ error }) => {
      if (error) console.warn('[PUT /api/inline-edit] Change log insert failed:', error.message)
    })

  revalidatePath('/')

  // Emit plugin hook — errors in plugins are caught internally and never
  // propagate here, so the response to the user is always unaffected.
  await pluginRegistry.emit('onContentSaved', {
    moduleId: sectionKey,
    fieldPath,
    lang: lang !== '' ? lang : undefined,
    newValue: value,
  })

  return NextResponse.json({ success: true })
}
