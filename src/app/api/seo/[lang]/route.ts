import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────

const seoSchema = z.object({
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  og_image_url: z.string().url().optional().or(z.literal('')),
  canonical_url: z.string().url().optional().or(z.literal('')),
  robots: z.enum(['index,follow', 'noindex,follow', 'noindex,nofollow']).optional(),
  json_ld: z.string().optional(),
})

// ─────────────────────────────────────────────
// GET /api/seo/[lang]
// ─────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string }> },
) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { lang } = await params

  // Validate that the language exists and is active
  const { data: language, error: langError } = await supabase
    .from('languages')
    .select('code, name')
    .eq('code', lang)
    .eq('is_active', true)
    .maybeSingle()

  if (langError || !language) {
    return NextResponse.json({ error: 'Language not found' }, { status: 404 })
  }

  // Fetch the single seo_config row for the main page
  const { data, error } = await supabase
    .from('seo_config')
    .select('*')
    .eq('page_key', 'home')
    .maybeSingle()

  if (error) {
    console.error('[GET /api/seo/[lang]] Supabase error:', error)
    return NextResponse.json({ error: 'Failed to fetch SEO config' }, { status: 500 })
  }

  // Extract per-language values from JSONB fields
  const metaTitle = data?.meta_title?.[lang] ?? ''
  const metaDescription = data?.meta_description?.[lang] ?? ''

  return NextResponse.json({
    data: {
      meta_title: metaTitle,
      meta_description: metaDescription,
      og_image_url: data?.og_image_url ?? '',
      canonical_url: data?.canonical_url ?? '',
      robots: data?.robots ?? 'index,follow',
      structured_data: data?.structured_data ?? {},
    },
  })
}

// ─────────────────────────────────────────────
// PUT /api/seo/[lang]
// ─────────────────────────────────────────────

export async function PUT(request: NextRequest, { params }: { params: Promise<{ lang: string }> }) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { lang } = await params

  // Validate that the language exists and is active
  const { data: language, error: langError } = await supabase
    .from('languages')
    .select('code')
    .eq('code', lang)
    .eq('is_active', true)
    .maybeSingle()

  if (langError || !language) {
    return NextResponse.json({ error: 'Language not found' }, { status: 404 })
  }

  // Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = seoSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 },
    )
  }

  const validated = result.data

  // Fetch the current seo_config row to merge JSONB fields
  const { data: current } = await supabase
    .from('seo_config')
    .select('id, meta_title, meta_description, structured_data')
    .eq('page_key', 'home')
    .maybeSingle()

  // Merge the per-language title and description into the existing JSONB objects
  const currentMetaTitle = (current?.meta_title as Record<string, string>) ?? {}
  const currentMetaDesc = (current?.meta_description as Record<string, string>) ?? {}

  const updatedMetaTitle = {
    ...currentMetaTitle,
    ...(validated.meta_title !== undefined ? { [lang]: validated.meta_title } : {}),
  }
  const updatedMetaDesc = {
    ...currentMetaDesc,
    ...(validated.meta_description !== undefined ? { [lang]: validated.meta_description } : {}),
  }

  // Parse JSON-LD if provided
  let structuredData: Record<string, unknown> =
    (current?.structured_data as Record<string, unknown>) ?? {}
  if (validated.json_ld !== undefined && validated.json_ld.trim() !== '') {
    try {
      structuredData = JSON.parse(validated.json_ld) as Record<string, unknown>
    } catch {
      return NextResponse.json(
        { error: 'JSON-LD inválido — no es un JSON válido' },
        { status: 400 },
      )
    }
  }

  // Build the upsert payload
  const upsertPayload = {
    page_key: 'home',
    meta_title: updatedMetaTitle,
    meta_description: updatedMetaDesc,
    ...(validated.og_image_url !== undefined && {
      og_image_url: validated.og_image_url,
    }),
    ...(validated.canonical_url !== undefined && {
      canonical_url: validated.canonical_url,
    }),
    ...(validated.robots !== undefined && { robots: validated.robots }),
    structured_data: structuredData,
    updated_at: new Date().toISOString(),
  }

  const { error: upsertError } = await supabase
    .from('seo_config')
    .upsert(upsertPayload, { onConflict: 'page_key' })

  if (upsertError) {
    console.error('[PUT /api/seo/[lang]] Supabase error:', upsertError)
    return NextResponse.json({ error: 'Failed to save SEO config' }, { status: 500 })
  }

  // Revalidate the public page so SEO tags are updated on next request
  revalidatePath('/')

  return NextResponse.json({ success: true })
}
