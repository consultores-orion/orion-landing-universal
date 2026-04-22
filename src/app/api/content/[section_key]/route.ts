import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const updateSchema = z.object({
  content: z.record(z.string(), z.unknown()),
})

// GET /api/content/[section_key]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ section_key: string }> },
) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { section_key } = await params

  const [moduleResult, schemaResult] = await Promise.all([
    supabase.from('page_modules').select('*').eq('section_key', section_key).single(),
    supabase.from('module_schemas').select('*').eq('section_key', section_key).single(),
  ])

  if (moduleResult.error) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  return NextResponse.json({
    module: moduleResult.data,
    schema: schemaResult.data ?? null,
  })
}

// PUT /api/content/[section_key]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section_key: string }> },
) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { section_key } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 },
    )
  }

  const { error } = await supabase
    .from('page_modules')
    .update({ content: result.data.content, updated_at: new Date().toISOString() })
    .eq('section_key', section_key)

  if (error) {
    console.error('[PUT /api/content] Supabase error:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }

  revalidatePath('/')
  return NextResponse.json({ success: true })
}
