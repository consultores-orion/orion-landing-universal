'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MoreHorizontal, Eye, MailCheck, MailX, Trash2, Inbox } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Lead } from './types'

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface LeadsTableProps {
  leads: Lead[]
  total: number
  page: number
  loading: boolean
  selectedIds: Set<string>
  onSelectId: (id: string, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onLeadClick: (lead: Lead) => void
  onMarkRead: (id: string, isRead: boolean) => void
  onDelete: (id: string) => void
  onPageChange: (page: number) => void
  limit?: number
}

// ─────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableCell key={i}>
          <div className="bg-muted h-4 w-full animate-pulse rounded" />
        </TableCell>
      ))}
    </TableRow>
  )
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function LeadsTable({
  leads,
  total,
  page,
  loading,
  selectedIds,
  onSelectId,
  onSelectAll,
  onLeadClick,
  onMarkRead,
  onDelete,
  onPageChange,
  limit = 20,
}: LeadsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id))
  const someSelected = leads.some((l) => selectedIds.has(l.id)) && !allSelected

  function handleSelectAllChange(checked: boolean) {
    onSelectAll(checked)
  }

  function handleSelectIdChange(id: string, checked: boolean) {
    onSelectId(id, checked)
  }

  return (
    <div className="space-y-4">
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10 px-4">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={handleSelectAllChange}
                  aria-label="Seleccionar todos"
                />
              </TableHead>
              <TableHead className="w-24">Estado</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
              <TableHead className="hidden sm:table-cell">Fuente</TableHead>
              <TableHead className="hidden sm:table-cell">Fecha</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Inbox className="text-muted-foreground/40 mb-3 h-10 w-10" />
                    <p className="text-muted-foreground text-sm">
                      No hay leads que coincidan con los filtros.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className={
                    !lead.is_read
                      ? 'bg-primary/5 hover:bg-primary/10 font-medium'
                      : 'hover:bg-muted/30'
                  }
                >
                  <TableCell className="px-4">
                    <Checkbox
                      checked={selectedIds.has(lead.id)}
                      onCheckedChange={(checked) => handleSelectIdChange(lead.id, checked)}
                      aria-label={`Seleccionar lead ${lead.name || lead.email}`}
                    />
                  </TableCell>

                  <TableCell>
                    {lead.is_read ? (
                      <Badge variant="outline" className="text-xs">
                        Leído
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 text-xs text-white hover:bg-blue-600">
                        Nuevo
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <button
                      type="button"
                      className="text-foreground hover:text-primary text-left font-medium hover:underline"
                      onClick={() => onLeadClick(lead)}
                    >
                      {lead.name || '—'}
                    </button>
                  </TableCell>

                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {lead.email}
                  </TableCell>

                  <TableCell className="text-muted-foreground hidden lg:table-cell">
                    {lead.phone || '—'}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" className="text-xs">
                      {lead.source_module}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                    {formatDistanceToNow(new Date(lead.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={buttonVariants({
                          variant: 'ghost',
                          size: 'icon',
                          className: 'h-8 w-8',
                        })}
                        aria-label="Acciones"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onLeadClick(lead)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMarkRead(lead.id, !lead.is_read)}>
                          {lead.is_read ? (
                            <>
                              <MailX className="mr-2 h-4 w-4" />
                              Marcar como no leído
                            </>
                          ) : (
                            <>
                              <MailCheck className="mr-2 h-4 w-4" />
                              Marcar como leído
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(lead.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>
          Página {page} de {totalPages} · {total} lead{total !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Single delete confirmation dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar lead</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el lead de forma permanente. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget !== null) {
                  onDelete(deleteTarget)
                  setDeleteTarget(null)
                }
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
