'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAdminStore } from '@/stores/admin-store'
import { LeadFilters } from './LeadFilters'
import { LeadsTable } from './LeadsTable'
import { LeadDetail } from './LeadDetail'
import type { Lead, LeadFiltersState, LeadsApiResponse } from './types'

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface LeadsPageClientProps {
  initialData: { data: Lead[]; total: number }
  unreadCount: number
  sources: string[]
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function buildQueryString(page: number, filters: LeadFiltersState): string {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', '20')
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.source !== 'all') params.set('source', filters.source)
  if (filters.search) params.set('search', filters.search)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  return params.toString()
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function LeadsPageClient({
  initialData,
  unreadCount: initialUnreadCount,
  sources,
}: LeadsPageClientProps) {
  const setUnreadLeadsCount = useAdminStore((s) => s.setUnreadLeadsCount)

  const [leads, setLeads] = useState<Lead[]>(initialData.data)
  const [total, setTotal] = useState(initialData.total)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<LeadFiltersState>({
    status: 'all',
    source: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sync initial unread count to store on mount
  useEffect(() => {
    setUnreadLeadsCount(initialUnreadCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch leads ──────────────────────────────────────────────

  const fetchLeads = useCallback(async (nextPage: number, nextFilters: LeadFiltersState) => {
    setLoading(true)
    try {
      const qs = buildQueryString(nextPage, nextFilters)
      const response = await fetch(`/api/leads?${qs}`)
      if (!response.ok) {
        toast.error('Error al cargar los leads')
        return
      }
      const json = (await response.json()) as LeadsApiResponse
      setLeads(json.data)
      setTotal(json.total)
      setPage(nextPage)
      setSelectedIds(new Set())
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Filters change ───────────────────────────────────────────

  function handleFiltersChange(newFilters: LeadFiltersState) {
    setFilters(newFilters)
    void fetchLeads(1, newFilters)
  }

  // ── Page change ──────────────────────────────────────────────

  function handlePageChange(nextPage: number) {
    void fetchLeads(nextPage, filters)
  }

  // ── Select ───────────────────────────────────────────────────

  function handleSelectId(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(leads.map((l) => l.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  // ── Mark read (single) ────────────────────────────────────────

  async function handleMarkRead(id: string, isRead: boolean): Promise<void> {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: isRead }),
      })

      if (!response.ok) {
        toast.error('Error al actualizar el lead')
        return
      }

      const json = (await response.json()) as { data: Lead; unreadCount: number }

      // Update lead in list
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, is_read: isRead } : l)))

      // Update selected lead in detail panel
      setSelectedLead((prev) => (prev?.id === id ? { ...prev, is_read: isRead } : prev))

      // Sync unread count
      setUnreadLeadsCount(json.unreadCount)

      toast.success(isRead ? 'Marcado como leído' : 'Marcado como no leído')
    } catch {
      toast.error('Error de conexión')
    }
  }

  // ── Delete (single) ───────────────────────────────────────────

  async function handleDelete(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' })

      if (!response.ok) {
        toast.error('Error al eliminar el lead')
        return
      }

      setLeads((prev) => prev.filter((l) => l.id !== id))
      setTotal((prev) => Math.max(0, prev - 1))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      toast.success('Lead eliminado')
    } catch {
      toast.error('Error de conexión')
    }
  }

  // ── Bulk action ───────────────────────────────────────────────

  async function handleBulkAction(action: 'mark_read' | 'mark_unread' | 'delete') {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    try {
      const response = await fetch('/api/leads/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      })

      if (!response.ok) {
        toast.error('Error al procesar la acción masiva')
        return
      }

      const json = (await response.json()) as {
        success: boolean
        unreadCount: number
      }

      // Sync unread count
      setUnreadLeadsCount(json.unreadCount)

      if (action === 'delete') {
        setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)))
        setTotal((prev) => Math.max(0, prev - ids.length))
        toast.success(
          `${ids.length} lead${ids.length !== 1 ? 's' : ''} eliminado${ids.length !== 1 ? 's' : ''}`,
        )
      } else {
        const isRead = action === 'mark_read'
        setLeads((prev) => prev.map((l) => (selectedIds.has(l.id) ? { ...l, is_read: isRead } : l)))
        toast.success(
          isRead
            ? `${ids.length} lead${ids.length !== 1 ? 's' : ''} marcado${ids.length !== 1 ? 's' : ''} como leído${ids.length !== 1 ? 's' : ''}`
            : `${ids.length} lead${ids.length !== 1 ? 's' : ''} marcado${ids.length !== 1 ? 's' : ''} como no leído${ids.length !== 1 ? 's' : ''}`,
        )
      }

      setSelectedIds(new Set())
    } catch {
      toast.error('Error de conexión')
    }
  }

  // ── Export ───────────────────────────────────────────────────

  function handleExport() {
    const params = new URLSearchParams()
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.source !== 'all') params.set('source', filters.source)
    if (filters.search) params.set('search', filters.search)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    const qs = params.toString()
    window.location.href = `/api/leads/export${qs ? `?${qs}` : ''}`
  }

  // ── Lead detail ───────────────────────────────────────────────

  function handleLeadClick(lead: Lead) {
    setSelectedLead(lead)
    setDetailOpen(true)
    // Auto-mark as read when opening
    if (!lead.is_read) {
      void handleMarkRead(lead.id, true)
    }
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        <LeadFilters
          filters={filters}
          sources={sources}
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
          selectedCount={selectedIds.size}
          onBulkAction={handleBulkAction}
        />

        <LeadsTable
          leads={leads}
          total={total}
          page={page}
          loading={loading}
          selectedIds={selectedIds}
          onSelectId={handleSelectId}
          onSelectAll={handleSelectAll}
          onLeadClick={handleLeadClick}
          onMarkRead={(id, isRead) => void handleMarkRead(id, isRead)}
          onDelete={(id) => void handleDelete(id)}
          onPageChange={handlePageChange}
          limit={20}
        />
      </div>

      <LeadDetail
        lead={selectedLead}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onMarkRead={handleMarkRead}
        onDelete={handleDelete}
      />
    </>
  )
}
