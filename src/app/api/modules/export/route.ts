import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// GET /api/modules/export
// Downloads the current layout (order + visibility) as JSON
// Does NOT include module content — only structure
// ─────────────────────────────────────────────

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
    .from('page_modules')
    .select('section_key, display_order, is_visible, display_name')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[GET /api/modules/export] Supabase error:', error)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }

  const exportData = {
    version: '1',
    modules: (data ?? []).map((row) => ({
      section_key: row.section_key,
      display_order: row.display_order,
      is_visible: row.is_visible,
      display_name: row.display_name,
    })),
    createdAt: new Date().toISOString(),
  }

  const date = new Date().toISOString().split('T')[0]
  const filename = `orion-layout-${date}.json`

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
