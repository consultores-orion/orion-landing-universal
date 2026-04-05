import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

// ─────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────

const backupSchema = z.object({
  version: z.string(),
  exported_at: z.string(),
  data: z.object({
    site_config: z.record(z.string(), z.unknown()).optional(),
    theme_config: z.record(z.string(), z.unknown()).optional(),
    page_modules: z.array(z.record(z.string(), z.unknown())).optional(),
    languages: z.array(z.record(z.string(), z.unknown())).optional(),
    seo_config: z.array(z.record(z.string(), z.unknown())).optional(),
    integrations: z.array(z.record(z.string(), z.unknown())).optional(),
    color_palettes: z.array(z.record(z.string(), z.unknown())).optional(),
  }),
})

// ─────────────────────────────────────────────
// Table insert type aliases
// ─────────────────────────────────────────────

type SiteConfigInsert = Database['public']['Tables']['site_config']['Insert']
type ThemeConfigInsert = Database['public']['Tables']['theme_config']['Insert']
type PageModuleInsert = Database['public']['Tables']['page_modules']['Insert']
type LanguageInsert = Database['public']['Tables']['languages']['Insert']
type SeoConfigInsert = Database['public']['Tables']['seo_config']['Insert']
type IntegrationInsert = Database['public']['Tables']['integrations']['Insert']
type ColorPaletteInsert = Database['public']['Tables']['color_palettes']['Insert']

// ─────────────────────────────────────────────
// POST /api/settings/restore — Importar backup JSON
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ error: 'Error leyendo el body' }, { status: 400 })
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = backupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Formato de backup inválido', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const { data } = parsed
  const counts: Record<string, number> = {}

  // site_config: upsert (solo 1 fila)
  if (data.data.site_config) {
    const { error } = await supabase
      .from('site_config')
      .upsert([data.data.site_config as SiteConfigInsert])
    if (error) {
      return NextResponse.json(
        { error: `Error restaurando site_config: ${error.message}` },
        { status: 500 },
      )
    }
    counts['site_config'] = 1
  }

  // theme_config: upsert (solo 1 fila)
  if (data.data.theme_config) {
    const { error } = await supabase
      .from('theme_config')
      .upsert([data.data.theme_config as ThemeConfigInsert])
    if (error) {
      return NextResponse.json(
        { error: `Error restaurando theme_config: ${error.message}` },
        { status: 500 },
      )
    }
    counts['theme_config'] = 1
  }

  // page_modules: upsert por section_key
  if (data.data.page_modules && data.data.page_modules.length > 0) {
    const { error } = await supabase
      .from('page_modules')
      .upsert(data.data.page_modules as PageModuleInsert[], {
        onConflict: 'section_key',
      })
    if (error) {
      return NextResponse.json(
        { error: `Error restaurando page_modules: ${error.message}` },
        { status: 500 },
      )
    }
    counts['page_modules'] = data.data.page_modules.length
  }

  // languages: upsert por code
  if (data.data.languages && data.data.languages.length > 0) {
    const { error } = await supabase
      .from('languages')
      .upsert(data.data.languages as LanguageInsert[], { onConflict: 'code' })
    if (error) {
      return NextResponse.json(
        { error: `Error restaurando languages: ${error.message}` },
        { status: 500 },
      )
    }
    counts['languages'] = data.data.languages.length
  }

  // seo_config: upsert por page_key
  if (data.data.seo_config && data.data.seo_config.length > 0) {
    const { error } = await supabase
      .from('seo_config')
      .upsert(data.data.seo_config as SeoConfigInsert[], {
        onConflict: 'page_key',
      })
    if (error) {
      return NextResponse.json(
        { error: `Error restaurando seo_config: ${error.message}` },
        { status: 500 },
      )
    }
    counts['seo_config'] = data.data.seo_config.length
  }

  // integrations: upsert por type — NO restaurar passwords SMTP ('***')
  if (data.data.integrations && data.data.integrations.length > 0) {
    const safeIntegrations = data.data.integrations.map((integration) => {
      const config = integration['config'] as Record<string, unknown> | undefined
      if (integration['type'] === 'smtp' && config !== undefined && config['password'] === '***') {
        const { password: _pwd, ...restConfig } = config
        return { ...integration, config: restConfig }
      }
      return integration
    })

    const { error } = await supabase
      .from('integrations')
      .upsert(safeIntegrations as IntegrationInsert[], { onConflict: 'type' })
    if (error) {
      return NextResponse.json(
        { error: `Error restaurando integrations: ${error.message}` },
        { status: 500 },
      )
    }
    counts['integrations'] = safeIntegrations.length
  }

  // color_palettes: upsert por id
  if (data.data.color_palettes && data.data.color_palettes.length > 0) {
    const { error } = await supabase
      .from('color_palettes')
      .upsert(data.data.color_palettes as ColorPaletteInsert[], {
        onConflict: 'id',
      })
    if (error) {
      return NextResponse.json(
        { error: `Error restaurando color_palettes: ${error.message}` },
        { status: 500 },
      )
    }
    counts['color_palettes'] = data.data.color_palettes.length
  }

  revalidatePath('/')

  return NextResponse.json({ success: true, restored: counts })
}
