import { Palette } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { BreadcrumbSetter } from '@/components/admin/design/BreadcrumbSetter'
import { DesignEditor } from '@/components/admin/design/DesignEditor'
import type { ThemeConfig, ColorPalette } from '@/lib/themes/types'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface DesignPageData {
  themeConfig: ThemeConfig | null
  palettes: ColorPalette[]
}

// ─────────────────────────────────────────────
// Data fetching
// ─────────────────────────────────────────────

async function fetchDesignData(): Promise<DesignPageData> {
  const supabase = await createServerClient()

  const [themeResult, palettesResult] = await Promise.all([
    supabase.from('theme_config').select('*').maybeSingle(),
    supabase.from('color_palettes').select('*').order('name'),
  ])

  // Map DB row → ThemeConfig domain type
  const dbRow = themeResult.data
  const themeConfig: ThemeConfig | null = dbRow
    ? {
        id: dbRow.id,
        palette_id: dbRow.palette_id,
        custom_colors: (dbRow.custom_colors ?? {}) as ThemeConfig['custom_colors'],
        typography: {
          font_heading: (dbRow.typography?.['font_heading'] as string | undefined) ?? 'Inter',
          font_body: (dbRow.typography?.['font_body'] as string | undefined) ?? 'Inter',
          base_size: (dbRow.typography?.['base_size'] as string | undefined) ?? '16px',
          scale_ratio: (dbRow.typography?.['scale_ratio'] as number | undefined) ?? 1.25,
        },
        spacing: {
          section_padding:
            (dbRow.spacing?.['section_padding'] as string | undefined) ?? 'comfortable',
          container_max_width:
            (dbRow.spacing?.['container_max_width'] as string | undefined) ?? '1200px',
          element_gap: (dbRow.spacing?.['element_gap'] as string | undefined) ?? '16px',
        },
        border_radius: dbRow.border_radius ?? 'medium',
      }
    : null

  // Map DB rows → ColorPalette domain type
  const palettes: ColorPalette[] = (palettesResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    niche: row.niche,
    colors: row.colors as unknown as ColorPalette['colors'],
    is_predefined: row.is_predefined,
  }))

  return { themeConfig, palettes }
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function DesignPage() {
  const { themeConfig, palettes } = await fetchDesignData()

  return (
    <>
      <BreadcrumbSetter items={[{ label: 'Diseño', href: '/admin/design' }]} />

      {/* Page header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Palette className="text-primary h-5 w-5" />
        </div>
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Editor de Diseño</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Personaliza la apariencia de tu landing page
          </p>
        </div>
      </div>

      {/* Design editor */}
      <DesignEditor themeConfig={themeConfig} palettes={palettes} />
    </>
  )
}
