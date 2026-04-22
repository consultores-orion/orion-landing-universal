'use client'

import { format } from 'date-fns'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { ContentChange } from './types'

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const MAX_VALUE_LENGTH = 60

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function truncate(value: string | null, max: number): string {
  if (!value) return '—'
  return value.length > max ? `${value.slice(0, max)}…` : value
}

// ─────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableCell key={i}>
          <div className="bg-muted h-4 animate-pulse rounded" />
        </TableCell>
      ))}
    </TableRow>
  )
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ContentChangesTableProps {
  changes: ContentChange[]
  total: number
  page: number
  loading: boolean
  onPageChange: (page: number) => void
  limit: number
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function ContentChangesTable({
  changes,
  total,
  page,
  loading,
  onPageChange,
  limit,
}: ContentChangesTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Fecha/Hora</TableHead>
              <TableHead className="w-32">Sección</TableHead>
              <TableHead>Campo</TableHead>
              <TableHead className="w-20">Idioma</TableHead>
              <TableHead>Valor Anterior</TableHead>
              <TableHead>Valor Nuevo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : changes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="text-muted-foreground flex flex-col items-center gap-2 py-10">
                    <History className="size-8 opacity-40" aria-hidden="true" />
                    <span className="text-sm">No hay cambios registrados</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              changes.map((row) => (
                <TableRow key={row.id}>
                  {/* Fecha/Hora */}
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {format(new Date(row.changed_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>

                  {/* Sección */}
                  <TableCell className="font-mono text-xs">{row.section_key}</TableCell>

                  {/* Campo */}
                  <TableCell className="font-mono text-xs">{row.field_path}</TableCell>

                  {/* Idioma */}
                  <TableCell className={cn('text-xs', !row.lang && 'text-muted-foreground')}>
                    {row.lang ?? '—'}
                  </TableCell>

                  {/* Valor Anterior */}
                  <TableCell
                    className={cn('max-w-xs text-xs', !row.old_value && 'text-muted-foreground')}
                    title={row.old_value ?? undefined}
                  >
                    {truncate(row.old_value, MAX_VALUE_LENGTH)}
                  </TableCell>

                  {/* Valor Nuevo */}
                  <TableCell className="max-w-xs text-xs" title={row.new_value}>
                    {truncate(row.new_value, MAX_VALUE_LENGTH)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Página {page} de {totalPages} · {total} registro{total !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
