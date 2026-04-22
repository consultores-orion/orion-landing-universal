import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Query params schema
// ─────────────────────────────────────────────

const querySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v ?? '1'))),
  section_key: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

// ─────────────────────────────────────────────
// GET /api/content-changes — list (admin only, paginated)
// ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)

  const parsed = querySchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    section_key: searchParams.get('section_key') ?? undefined,
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo: searchParams.get('dateTo') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { page, section_key, dateFrom, dateTo } = parsed.data
  const limit = 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase.from('content_changes').select('*', { count: 'exact' })

  if (section_key && section_key !== 'all') query = query.eq('section_key', section_key)
  if (dateFrom) query = query.gte('changed_at', dateFrom)
  if (dateTo) query = query.lte('changed_at', dateTo)

  const { data, count, error } = await query
    .order('changed_at', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  })
}
