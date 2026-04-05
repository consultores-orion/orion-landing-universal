import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function escapeCSV(val: string): string {
  return `"${val.replace(/"/g, '""')}"`
}

function toCSVRow(values: string[]): string {
  return values.map(escapeCSV).join(',')
}

// ─────────────────────────────────────────────
// GET /api/leads/export
// ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const source = searchParams.get('source')
  const search = searchParams.get('search')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  let query = supabase
    .from('leads')
    .select('id, name, email, phone, message, source_module, created_at, is_read')

  if (status === 'read') query = query.eq('is_read', true)
  else if (status === 'unread') query = query.eq('is_read', false)
  if (source && source !== 'all') query = query.eq('source_module', source)
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = data ?? []

  // UTF-8 BOM for Excel compatibility
  const header =
    '\uFEFF' +
    toCSVRow(['id', 'nombre', 'email', 'telefono', 'mensaje', 'fuente', 'fecha', 'leido'])

  const body = rows
    .map((row) =>
      toCSVRow([
        row.id ?? '',
        row.name ?? '',
        row.email ?? '',
        row.phone ?? '',
        row.message ?? '',
        row.source_module ?? '',
        row.created_at ?? '',
        String(row.is_read ?? false),
      ]),
    )
    .join('\n')

  const csvContent = body.length > 0 ? `${header}\n${body}` : header

  const date = new Date().toISOString().split('T').at(0) ?? 'export'

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads_${date}.csv"`,
    },
  })
}
