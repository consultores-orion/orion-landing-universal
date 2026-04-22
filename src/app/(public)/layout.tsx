import type { ReactNode } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { ThemeProvider } from '@/lib/themes/provider'
import { I18nProvider } from '@/lib/i18n/provider'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { getPaletteColors } from '@/lib/themes/palettes'
import type { ThemeConfig, PaletteColors } from '@/lib/themes/types'
import { EditModeToggle } from '@/components/live-edit/EditModeToggle'
import { HtmlLangUpdater } from '@/components/shared/HtmlLangUpdater'
import { WebVitalsReporter } from '@/components/shared/WebVitalsReporter'

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  id: 'default',
  palette_id: 'professional-blue',
  custom_colors: {},
  typography: {
    font_heading: 'Inter',
    font_body: 'Inter',
    base_size: '16px',
    scale_ratio: 1.25,
  },
  spacing: {
    section_padding: 'comfortable',
    container_max_width: '1200px',
    element_gap: '1rem',
  },
  border_radius: 'medium',
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient()

  // Fetch all required data in parallel.
  // theme_config and color_palettes are fetched as separate queries because
  // the auto-generated DB types have Relationships: [] which prevents
  // supabase-js from inferring the embedded join type at compile time.
  const [themeRes, langsRes, configRes, modulesRes, authRes] = await Promise.all([
    supabase.from('theme_config').select('*').single(),
    supabase.from('languages').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('site_config').select('site_name, logo_url, setup_completed').single(),
    supabase
      .from('page_modules')
      .select('section_key, display_name, is_visible, display_order')
      .eq('is_visible', true)
      .order('display_order', { ascending: true }),
    supabase.auth.getUser(),
  ])

  const rawTheme = themeRes.data
  const languages = langsRes.data ?? []
  const siteConfig = configRes.data
  const modules = modulesRes.data ?? []
  const user = authRes.data.user

  // Resolve palette colors: try the DB palette row first, fall back to PALETTE_MAP
  let paletteColors: PaletteColors

  if (rawTheme?.palette_id) {
    // Attempt to load the palette from DB so custom palettes are supported
    const { data: paletteRow } = await supabase
      .from('color_palettes')
      .select('colors')
      .eq('id', rawTheme.palette_id)
      .single()

    if (paletteRow?.colors) {
      paletteColors = paletteRow.colors as unknown as PaletteColors
    } else {
      paletteColors = getPaletteColors(rawTheme.palette_id)
    }
  } else {
    paletteColors = getPaletteColors('professional-blue')
  }

  // Build ThemeConfig for the provider — map DB row fields to ThemeConfig shape
  let themeConfig: ThemeConfig

  if (rawTheme) {
    themeConfig = {
      id: rawTheme.id,
      palette_id: rawTheme.palette_id,
      // DB stores custom_colors as Record<string, string> — assignable to Partial<PaletteColors>
      custom_colors: (rawTheme.custom_colors ?? {}) as Partial<PaletteColors>,
      typography: {
        font_heading: String(rawTheme.typography?.['font_heading'] ?? 'Inter'),
        font_body: String(rawTheme.typography?.['font_body'] ?? 'Inter'),
        base_size: String(rawTheme.typography?.['base_size'] ?? '16px'),
        scale_ratio: Number(rawTheme.typography?.['scale_ratio'] ?? 1.25),
      },
      spacing: {
        section_padding: String(rawTheme.spacing?.['section_padding'] ?? 'comfortable'),
        container_max_width: String(rawTheme.spacing?.['container_max_width'] ?? '1200px'),
        element_gap: String(rawTheme.spacing?.['element_gap'] ?? '1rem'),
      },
      border_radius: rawTheme.border_radius ?? 'medium',
    }
  } else {
    themeConfig = DEFAULT_THEME_CONFIG
  }

  const defaultLang = languages.find((l) => l.is_default)?.code ?? 'es'

  return (
    <ThemeProvider themeConfig={themeConfig} paletteColors={paletteColors}>
      <I18nProvider languages={languages} defaultLang={defaultLang}>
        <HtmlLangUpdater />
        <SiteHeader
          siteName={siteConfig?.site_name ?? 'Orion Landing'}
          logoUrl={siteConfig?.logo_url ?? null}
          modules={modules}
        />
        {children}
        <EditModeToggle isAdmin={!!user} />
        <WebVitalsReporter />
      </I18nProvider>
    </ThemeProvider>
  )
}
