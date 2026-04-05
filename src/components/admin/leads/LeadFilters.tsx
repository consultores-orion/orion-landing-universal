'use client'

import { useCallback, useRef, useState } from 'react'
import { CalendarIcon, Download, Trash2, MailCheck, MailX } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { LeadFiltersState } from './types'

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface LeadFiltersProps {
  filters: LeadFiltersState
  sources: string[]
  onFiltersChange: (filters: LeadFiltersState) => void
  onExport: () => void
  selectedCount: number
  onBulkAction: (action: 'mark_read' | 'mark_unread' | 'delete') => void
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function LeadFilters({
  filters,
  sources,
  onFiltersChange,
  onExport,
  selectedCount,
  onBulkAction,
}: LeadFiltersProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search — input is fully controlled by filters.search from parent
  const handleSearchChange = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onFiltersChange({ ...filters, search: value })
      }, 300)
    },
    [filters, onFiltersChange],
  )

  // Date range from Calendar
  const dateRange: DateRange | undefined =
    filters.dateFrom || filters.dateTo
      ? {
          from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          to: filters.dateTo ? new Date(filters.dateTo) : undefined,
        }
      : undefined

  function handleDateRangeChange(range: DateRange | undefined) {
    onFiltersChange({
      ...filters,
      dateFrom: range?.from ? range.from.toISOString() : '',
      dateTo: range?.to ? range.to.toISOString() : '',
    })
  }

  function clearDateRange() {
    onFiltersChange({ ...filters, dateFrom: '', dateTo: '' })
  }

  const hasDateRange = Boolean(filters.dateFrom || filters.dateTo)

  const dateLabel = hasDateRange
    ? [
        filters.dateFrom ? format(new Date(filters.dateFrom), 'd MMM', { locale: es }) : null,
        filters.dateTo ? format(new Date(filters.dateTo), 'd MMM yy', { locale: es }) : null,
      ]
        .filter(Boolean)
        .join(' – ')
    : 'Fechas'

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter */}
        <Select
          value={filters.status}
          onValueChange={(val) =>
            onFiltersChange({
              ...filters,
              status: val as LeadFiltersState['status'],
            })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unread">Sin leer</SelectItem>
            <SelectItem value="read">Leídos</SelectItem>
          </SelectContent>
        </Select>

        {/* Source filter */}
        <Select
          value={filters.source}
          onValueChange={(val) => onFiltersChange({ ...filters, source: val ?? 'all' })}
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Fuente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fuentes</SelectItem>
            {sources.map((src) => (
              <SelectItem key={src} value={src}>
                {src}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <Input
          placeholder="Buscar nombre o email…"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-9 w-[220px]"
        />

        {/* Date range popover */}
        <Popover>
          <PopoverTrigger
            className={buttonVariants({
              variant: hasDateRange ? 'default' : 'outline',
              size: 'sm',
              className: 'h-9 gap-2',
            })}
          >
            <CalendarIcon className="h-4 w-4" />
            {dateLabel}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeChange}
              locale={es}
              numberOfMonths={2}
            />
            {hasDateRange && (
              <div className="border-t px-3 py-2">
                <Button variant="ghost" size="sm" className="w-full" onClick={clearDateRange}>
                  Limpiar rango
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Export */}
        <Button variant="outline" size="sm" className="ml-auto h-9 gap-2" onClick={onExport}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Bulk actions bar — only visible when items are selected */}
      {selectedCount > 0 && (
        <div className="border-primary/20 bg-primary/5 flex items-center gap-3 rounded-lg border px-4 py-2">
          <span className="text-foreground text-sm font-medium">
            {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => onBulkAction('mark_read')}
            >
              <MailCheck className="h-3.5 w-3.5" />
              Marcar como leídos
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => onBulkAction('mark_unread')}
            >
              <MailX className="h-3.5 w-3.5" />
              Marcar como no leídos
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar seleccionados
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar leads</DialogTitle>
            <DialogDescription>
              Estás a punto de eliminar{' '}
              <strong>
                {selectedCount} lead{selectedCount !== 1 ? 's' : ''}
              </strong>{' '}
              de forma permanente. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteConfirmOpen(false)
                onBulkAction('delete')
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
