'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { ContentChangesFilters } from './ContentChangesFilters'
import { ContentChangesTable } from './ContentChangesTable'
import type { ContentChange, ContentChangesApiResponse, ContentChangesFiltersState } from './types'

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ContentChangesClientProps {
  initialData: { data: ContentChange[]; total: number }
  sections: string[]
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function buildQueryString(page: number, filters: ContentChangesFiltersState): string {
  const params = new URLSearchParams()
  params.set('page', String(page))
  if (filters.sectionKey && filters.sectionKey !== 'all')
    params.set('section_key', filters.sectionKey)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  return params.toString()
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function ContentChangesClient({ initialData, sections }: ContentChangesClientProps) {
  const [changes, setChanges] = useState<ContentChange[]>(initialData.data)
  const [total, setTotal] = useState(initialData.total)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ContentChangesFiltersState>({
    sectionKey: '',
    dateFrom: '',
    dateTo: '',
  })
  const [loading, setLoading] = useState(false)

  // ── Fetch ────────────────────────────────────────────────────

  const fetchChanges = useCallback(
    async (nextPage: number, nextFilters: ContentChangesFiltersState) => {
      setLoading(true)
      try {
        const qs = buildQueryString(nextPage, nextFilters)
        const response = await fetch(`/api/content-changes?${qs}`)
        if (!response.ok) {
          toast.error('Error al cargar el historial')
          return
        }
        const json = (await response.json()) as ContentChangesApiResponse
        setChanges(json.data)
        setTotal(json.total)
        setPage(nextPage)
      } catch {
        toast.error('Error de conexión')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // ── Handlers ─────────────────────────────────────────────────

  function handleFiltersChange(newFilters: ContentChangesFiltersState) {
    setFilters(newFilters)
    void fetchChanges(1, newFilters)
  }

  function handlePageChange(nextPage: number) {
    void fetchChanges(nextPage, filters)
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <ContentChangesFilters
        filters={filters}
        sections={sections}
        onFiltersChange={handleFiltersChange}
      />

      <ContentChangesTable
        changes={changes}
        total={total}
        page={page}
        loading={loading}
        onPageChange={handlePageChange}
        limit={20}
      />
    </div>
  )
}
