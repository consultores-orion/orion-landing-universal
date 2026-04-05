import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getSetupState } from '@/lib/setup/state'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/security/rate-limit'
import { seedStorageBuckets } from '@/lib/setup/storage-seed'
import {
  SEED_LANGUAGES,
  SEED_PALETTES,
  SEED_THEME_CONFIG,
  SEED_SITE_CONFIG,
  SEED_SEO_CONFIG,
  SEED_INTEGRATIONS,
  SEED_PAGE_MODULES,
  SEED_MODULE_SCHEMAS,
} from '@/lib/setup/seed-data'
import type { Database } from '@/types/database'

// Type aliases for Supabase insert operations
type LanguagesInsert = Database['public']['Tables']['languages']['Insert']
type ColorPalettesInsert = Database['public']['Tables']['color_palettes']['Insert']
type SiteConfigInsert = Database['public']['Tables']['site_config']['Insert']
type SeoConfigInsert = Database['public']['Tables']['seo_config']['Insert']
type IntegrationsInsert = Database['public']['Tables']['integrations']['Insert']

interface SeedResult {
  category: string
  status: 'success' | 'error' | 'skipped'
  error?: string
  count?: number
}

export async function POST(request: Request) {
  // Rate limiting: 10 requests/minute per IP
  const ip = getClientIp(request)
  const rl = rateLimit(`setup-seed:${ip}`, { windowMs: 60_000, max: 10 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  // Security: block if setup already complete
  try {
    const setupState = await getSetupState()
    if (setupState.isComplete) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 403 })
    }
  } catch {
    // May fail if env vars aren't loaded — but we need them for seeding
    return NextResponse.json(
      { error: 'Supabase environment variables not configured.' },
      { status: 500 },
    )
  }

  const supabase = createAdminClient()
  const results: SeedResult[] = []

  // Check if seed data already exists (idempotent)
  try {
    const { data } = await supabase.from('site_config').select('id').eq('id', 'main').single()

    if (data) {
      return NextResponse.json({
        success: true,
        method: 'skipped',
        message: 'Seed data already exists (site_config row found).',
        results: [],
      })
    }
  } catch {
    // Row doesn't exist — proceed with seeding
  }

  // 1. Storage Buckets
  try {
    const bucketResults = await seedStorageBuckets(supabase)
    const hasError = bucketResults.some((r) => r.status === 'error')
    results.push({
      category: 'storage_buckets',
      status: hasError ? 'error' : 'success',
      count: bucketResults.length,
      error: hasError
        ? bucketResults
            .filter((r) => r.status === 'error')
            .map((r) => `${r.bucket}: ${r.error}`)
            .join('; ')
        : undefined,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    results.push({ category: 'storage_buckets', status: 'error', error: message })
  }

  // 2. Languages
  try {
    const languageData: LanguagesInsert[] = SEED_LANGUAGES.map((lang) => ({
      code: lang.code,
      name: lang.name,
      native_name: lang.native_name,
      is_default: lang.is_default,
      is_active: lang.is_active,
      flag_emoji: lang.flag_emoji,
      sort_order: lang.sort_order,
    }))
    const { error } = await supabase.from('languages').upsert(languageData, { onConflict: 'code' })

    if (error) {
      results.push({ category: 'languages', status: 'error', error: error.message })
    } else {
      results.push({ category: 'languages', status: 'success', count: SEED_LANGUAGES.length })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    results.push({ category: 'languages', status: 'error', error: message })
  }

  // 3. Color Palettes
  try {
    const paletteData: ColorPalettesInsert[] = SEED_PALETTES.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      niche: p.niche,
      colors: { ...p.colors } as Record<string, string>,
      is_predefined: p.is_predefined,
    }))
    const { error } = await supabase.from('color_palettes').insert(paletteData)

    if (error) {
      // If palettes already exist (duplicate PK), treat as non-fatal
      if (error.message?.includes('duplicate') || error.code === '23505') {
        results.push({
          category: 'color_palettes',
          status: 'success',
          count: SEED_PALETTES.length,
          error: 'Some palettes already existed (duplicates ignored).',
        })
      } else {
        results.push({ category: 'color_palettes', status: 'error', error: error.message })
      }
    } else {
      results.push({ category: 'color_palettes', status: 'success', count: SEED_PALETTES.length })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    results.push({ category: 'color_palettes', status: 'error', error: message })
  }

  // 4. Theme Config — uses the palette_id from SEED_THEME_CONFIG (palettes inserted above)
  try {
    const { error } = await supabase.from('theme_config').insert({
      palette_id: SEED_THEME_CONFIG.palette_id,
      custom_colors: SEED_THEME_CONFIG.custom_colors,
      typography: SEED_THEME_CONFIG.typography,
      spacing: SEED_THEME_CONFIG.spacing,
      border_radius: SEED_THEME_CONFIG.border_radius,
    })

    if (error) {
      results.push({ category: 'theme_config', status: 'error', error: error.message })
    } else {
      results.push({ category: 'theme_config', status: 'success', count: 1 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    results.push({ category: 'theme_config', status: 'error', error: message })
  }

  // 5. Site Config (singleton with id='main')
  try {
    const siteConfigData: SiteConfigInsert[] = [
      {
        id: SEED_SITE_CONFIG.id,
        site_name: SEED_SITE_CONFIG.site_name,
        setup_completed: SEED_SITE_CONFIG.setup_completed,
      },
    ]
    const { error } = await supabase
      .from('site_config')
      .upsert(siteConfigData, { onConflict: 'id' })

    if (error) {
      results.push({ category: 'site_config', status: 'error', error: error.message })
    } else {
      results.push({ category: 'site_config', status: 'success', count: 1 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    results.push({ category: 'site_config', status: 'error', error: message })
  }

  // 6. SEO Config
  try {
    const seoData: SeoConfigInsert[] = SEED_SEO_CONFIG.map((seo) => ({
      page_key: seo.page_key,
      meta_title: seo.meta_title,
      meta_description: seo.meta_description,
      robots: seo.robots,
    }))
    const { error } = await supabase.from('seo_config').upsert(seoData, { onConflict: 'page_key' })

    if (error) {
      results.push({ category: 'seo_config', status: 'error', error: error.message })
    } else {
      results.push({ category: 'seo_config', status: 'success', count: SEED_SEO_CONFIG.length })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    results.push({ category: 'seo_config', status: 'error', error: message })
  }

  // 7. Integrations
  try {
    const integrationData: IntegrationsInsert[] = SEED_INTEGRATIONS.map((intg) => ({
      type: intg.type,
      config: intg.config,
      is_active: intg.is_active,
    }))
    const { error } = await supabase
      .from('integrations')
      .upsert(integrationData, { onConflict: 'type' })

    if (error) {
      results.push({ category: 'integrations', status: 'error', error: error.message })
    } else {
      results.push({
        category: 'integrations',
        status: 'success',
        count: SEED_INTEGRATIONS.length,
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    results.push({ category: 'integrations', status: 'error', error: message })
  }

  // 8. Page Modules
  try {
    const { error: modulesError } = await supabase.from('page_modules').upsert(
      SEED_PAGE_MODULES.map((m) => ({
        section_key: m.section_key,
        content: m.content,
        styles: m.styles,
        display_order: m.display_order,
        is_visible: m.is_visible,
        is_system: m.is_system,
      })),
      { onConflict: 'section_key', ignoreDuplicates: true },
    )

    if (modulesError) {
      console.error('Failed to seed page_modules:', modulesError)
      results.push({ category: 'page_modules', status: 'error', error: modulesError.message })
    } else {
      results.push({ category: 'page_modules', status: 'success', count: SEED_PAGE_MODULES.length })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    results.push({ category: 'page_modules', status: 'error', error: message })
  }

  // 9. Module Schemas
  try {
    const { error: schemasError } = await supabase.from('module_schemas').upsert(
      SEED_MODULE_SCHEMAS.map((s) => ({
        section_key: s.section_key,
        fields: s.fields,
        default_content: s.default_content,
        default_styles: s.default_styles,
      })),
      { onConflict: 'section_key', ignoreDuplicates: true },
    )

    if (schemasError) {
      console.error('Failed to seed module_schemas:', schemasError)
      results.push({ category: 'module_schemas', status: 'error', error: schemasError.message })
    } else {
      results.push({
        category: 'module_schemas',
        status: 'success',
        count: SEED_MODULE_SCHEMAS.length,
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    results.push({ category: 'module_schemas', status: 'error', error: message })
  }

  const hasErrors = results.some((r) => r.status === 'error')
  const successCount = results.filter((r) => r.status === 'success').length
  const errorCount = results.filter((r) => r.status === 'error').length

  return NextResponse.json({
    success: !hasErrors,
    results,
    seeded: {
      languages: SEED_LANGUAGES.length,
      color_palettes: SEED_PALETTES.length,
      integrations: SEED_INTEGRATIONS.length,
      page_modules: SEED_PAGE_MODULES.length,
      module_schemas: SEED_MODULE_SCHEMAS.length,
    },
    message: hasErrors
      ? `Seeding completed with errors: ${successCount} succeeded, ${errorCount} failed.`
      : `All ${successCount} categories seeded successfully.`,
  })
}
