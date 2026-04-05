import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// GET /api/settings/backup — Exportar backup JSON
// ─────────────────────────────────────────────

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [
    siteConfigResult,
    themeConfigResult,
    pageModulesResult,
    languagesResult,
    seoConfigResult,
    integrationsResult,
    customPalettesResult,
  ] = await Promise.all([
    supabase.from('site_config').select('*').single(),
    supabase.from('theme_config').select('*').single(),
    supabase.from('page_modules').select('*').order('display_order'),
    supabase.from('languages').select('*').order('sort_order'),
    supabase.from('seo_config').select('*'),
    supabase.from('integrations').select('*').order('type'),
    supabase.from('color_palettes').select('*').eq('is_predefined', false),
  ])

  // Redactar passwords SMTP antes de exportar
  const integrations = (integrationsResult.data ?? []).map((integration) => {
    if (
      integration.type === 'smtp' &&
      integration.config['password'] !== undefined &&
      integration.config['password'] !== ''
    ) {
      return {
        ...integration,
        config: { ...integration.config, password: '***' },
      }
    }
    return integration
  })

  const backup = {
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    data: {
      site_config: siteConfigResult.data,
      theme_config: themeConfigResult.data,
      page_modules: pageModulesResult.data ?? [],
      languages: languagesResult.data ?? [],
      seo_config: seoConfigResult.data ?? [],
      integrations,
      color_palettes: customPalettesResult.data ?? [],
    },
  }

  const date = new Date().toISOString().split('T')[0] ?? 'backup'

  return new NextResponse(JSON.stringify(backup, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="orion-backup-${date}.json"`,
    },
  })
}
