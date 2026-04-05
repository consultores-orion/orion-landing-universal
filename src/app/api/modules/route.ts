import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/modules — returns all page_modules ordered by display_order
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
    .select('id, section_key, display_name, is_visible, is_system, display_order')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[GET /api/modules] Supabase error:', error)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
