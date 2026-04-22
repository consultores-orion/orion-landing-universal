'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContentChangesFiltersState } from './types'

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ContentChangesFiltersProps {
  filters: ContentChangesFiltersState
  sections: string[]
  onFiltersChange: (filters: ContentChangesFiltersState) => void
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function ContentChangesFilters({
  filters,
  sections,
  onFiltersChange,
}: ContentChangesFiltersProps) {
  function handleSectionChange(value: string | null) {
    onFiltersChange({ ...filters, sectionKey: value ?? '' })
  }

  function handleDateFromChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFiltersChange({ ...filters, dateFrom: e.target.value })
  }

  function handleDateToChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFiltersChange({ ...filters, dateTo: e.target.value })
  }

  function handleClear() {
    onFiltersChange({ sectionKey: '', dateFrom: '', dateTo: '' })
  }

  const hasActiveFilters = Boolean(filters.sectionKey || filters.dateFrom || filters.dateTo)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Section filter */}
      <Select value={filters.sectionKey || 'all'} onValueChange={handleSectionChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Sección" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las secciones</SelectItem>
          {sections.map((section) => (
            <SelectItem key={section} value={section}>
              {section}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date from */}
      <div className="flex items-center gap-1">
        <label className="text-muted-foreground text-sm" htmlFor="date-from">
          Desde
        </label>
        <Input
          id="date-from"
          type="date"
          value={filters.dateFrom}
          onChange={handleDateFromChange}
          className="w-40"
        />
      </div>

      {/* Date to */}
      <div className="flex items-center gap-1">
        <label className="text-muted-foreground text-sm" htmlFor="date-to">
          Hasta
        </label>
        <Input
          id="date-to"
          type="date"
          value={filters.dateTo}
          onChange={handleDateToChange}
          className="w-40"
        />
      </div>

      {/* Clear button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Limpiar
        </Button>
      )}
    </div>
  )
}
