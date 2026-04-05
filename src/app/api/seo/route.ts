import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/seo — Returns all seo_config records
export async function GET() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase.from('seo_config').select('*')

  if (error) {
    console.error('[GET /api/seo] Supabase error:', error)
    return NextResponse.json({ error: 'Failed to fetch SEO config' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
