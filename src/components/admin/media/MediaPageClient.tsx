'use client'

import { useState } from 'react'
import { MediaUploader } from './MediaUploader'
import { MediaGrid } from './MediaGrid'

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

interface MediaPageClientProps {
  initialData: { data: MediaItem[]; total: number }
  languages: Array<{ code: string; name: string }>
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function MediaPageClient({ initialData, languages }: MediaPageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <MediaUploader onUploadComplete={() => setRefreshKey((k) => k + 1)} />
      <MediaGrid key={refreshKey} initialData={initialData} languages={languages} />
    </div>
  )
}
