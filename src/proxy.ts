import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow static assets, API setup routes, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/setup') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next()
  }

  // Check if Supabase env vars are configured
  const hasEnvVars = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // If no env vars, redirect everything to /setup (except /setup itself)
  if (!hasEnvVars) {
    if (!pathname.startsWith('/setup')) {
      return NextResponse.redirect(new URL('/setup/connect', request.url))
    }
    return NextResponse.next()
  }

  // Env vars exist — we can safely create Supabase client
  const { supabaseResponse, user, supabase } = await updateSession(request)

  // Check if setup is completed
  let setupCompleted = false
  try {
    const { data: siteConfig } = await supabase
      .from('site_config')
      .select('setup_completed')
      .eq('id', 'main')
      .single()
    setupCompleted = siteConfig?.setup_completed ?? false
  } catch {
    // Table doesn't exist or query failed — setup not complete
    setupCompleted = false
  }

  // If setup not complete, redirect to /setup (except /setup routes)
  if (!setupCompleted && !pathname.startsWith('/setup') && !pathname.startsWith('/api/setup')) {
    return NextResponse.redirect(new URL('/setup', request.url))
  }

  // If setup complete, block /setup access
  if (setupCompleted && pathname.startsWith('/setup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Block /api/setup/* after setup is complete
  if (setupCompleted && pathname.startsWith('/api/setup')) {
    return NextResponse.json({ error: 'Setup already completed' }, { status: 403 })
  }

  // Protect /admin/* — require authenticated user
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If authenticated and visiting /login, redirect to admin
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
