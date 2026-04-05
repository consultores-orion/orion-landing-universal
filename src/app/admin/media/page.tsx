import { createServerClient } from '@/lib/supabase/server'
import { BreadcrumbSetter } from '@/components/admin/media/BreadcrumbSetter'
import { MediaPageClient } from '@/components/admin/media/MediaPageClient'

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export const metadata = { title: 'Biblioteca de Medios — Admin' }

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface MediaItem {
  id: string
  file_name: string
  file_path: string
  public_url: string
  mime_type: string
  file_size: number
  alt_text: Record<string, string>
  folder: string
  width: number | null
  height: number | null
  uploaded_by: string | null
  created_at: string
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function MediaPage() {
  const supabase = await createServerClient()

  const [mediaResult, langsResult] = await Promise.all([
    supabase
      .from('media')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 39),
    supabase
      .from('languages')
      .select('code, name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  const mediaItems = (mediaResult.data ?? []) as MediaItem[]
  const total = mediaResult.count ?? 0
  const languages = (langsResult.data ?? []) as Array<{ code: string; name: string }>

  return (
    <>
      <BreadcrumbSetter />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Medios</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gestiona las imágenes de tu landing page.
        </p>
      </div>

      {/* Client shell — handles upload + grid refresh */}
      <MediaPageClient initialData={{ data: mediaItems, total }} languages={languages} />
    </>
  )
}
