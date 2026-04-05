import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/security/rate-limit'

// ─────────────────────────────────────────────
// GET /api/leads — list with filters (admin only)
// ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const status = searchParams.get('status') // 'all' | 'read' | 'unread'
  const source = searchParams.get('source') // source_module filter
  const search = searchParams.get('search') // búsqueda en name/email
  const dateFrom = searchParams.get('dateFrom') // ISO string
  const dateTo = searchParams.get('dateTo') // ISO string

  let query = supabase.from('leads').select('*', { count: 'exact' })

  if (status === 'read') query = query.eq('is_read', true)
  else if (status === 'unread') query = query.eq('is_read', false)
  if (source && source !== 'all') query = query.eq('source_module', source)
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
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

// ─────────────────────────────────────────────
// Shared schema + rate limiting for POST
// ─────────────────────────────────────────────

const leadSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  message: z.string().max(2000).optional(),
  source_module: z.string().min(1).max(50),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests/minute per IP
  const ip = getClientIp(request)
  const rl = rateLimit(`leads:${ip}`, { windowMs: 60_000, max: 5 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate
  const result = leadSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 },
    )
  }

  const supabase = await createServerClient()

  const { error } = await supabase.from('leads').insert({
    email: result.data.email,
    name: result.data.name ?? undefined,
    phone: result.data.phone ?? undefined,
    message: result.data.message ?? undefined,
    source_module: result.data.source_module,
    metadata: (result.data.metadata ?? {}) as Record<string, unknown>,
    is_read: false,
  })

  if (error) {
    console.error('[POST /api/leads] Supabase error:', error)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
