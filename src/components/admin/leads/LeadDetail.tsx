'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MailCheck, MailX, Trash2, Mail, Phone, Calendar, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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

interface LeadDetailProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkRead: (id: string, isRead: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function MetaEntry({ label, value }: { label: string; value: unknown }) {
  const display =
    typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '')

  if (!display) return null

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <span className="text-foreground text-sm break-words">{display}</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function LeadDetail({ lead, open, onOpenChange, onMarkRead, onDelete }: LeadDetailProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!lead) return null

  const displayName = lead.name || lead.email

  const metadataEntries = Object.entries(lead.metadata ?? {}).filter(
    ([, val]) => val !== null && val !== undefined && val !== '',
  )

  const hasAdditionalDetails = lead.preferred_date || lead.preferred_time

  async function handleMarkRead() {
    if (!lead) return
    setLoading(true)
    try {
      await onMarkRead(lead.id, !lead.is_read)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!lead) return
    setLoading(true)
    try {
      await onDelete(lead.id)
      setDeleteConfirmOpen(false)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[480px]"
        >
          {/* Header */}
          <SheetHeader className="border-b px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <SheetTitle className="truncate text-lg font-semibold">{displayName}</SheetTitle>
              </div>
              {lead.is_read ? (
                <Badge variant="outline" className="shrink-0">
                  Leído
                </Badge>
              ) : (
                <Badge className="shrink-0 bg-blue-500 text-white hover:bg-blue-600">Nuevo</Badge>
              )}
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {/* Contact section */}
            <section>
              <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
                Datos de contacto
              </h3>
              <div className="space-y-3">
                {lead.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
                    <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                      {lead.email}
                    </a>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
                    <a href={`tel:${lead.phone}`} className="text-foreground hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground">
                    {format(new Date(lead.created_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Tag className="text-muted-foreground h-4 w-4 shrink-0" />
                  <Badge variant="secondary">{lead.source_module}</Badge>
                </div>
              </div>
            </section>

            {/* Message section */}
            {lead.message && (
              <>
                <Separator />
                <section>
                  <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
                    Mensaje
                  </h3>
                  <p className="text-foreground text-sm whitespace-pre-wrap">{lead.message}</p>
                </section>
              </>
            )}

            {/* Additional metadata */}
            {metadataEntries.length > 0 && (
              <>
                <Separator />
                <section>
                  <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
                    Datos adicionales
                  </h3>
                  <div className="space-y-2">
                    {metadataEntries.map(([key, val]) => (
                      <MetaEntry key={key} label={key} value={val} />
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Technical details (collapsible) */}
            {hasAdditionalDetails && (
              <>
                <Separator />
                <details className="group">
                  <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-semibold tracking-wider uppercase select-none">
                    Detalles técnicos
                  </summary>
                  <div className="mt-3 space-y-2">
                    {lead.preferred_date && (
                      <MetaEntry label="Fecha preferida" value={lead.preferred_date} />
                    )}
                    {lead.preferred_time && (
                      <MetaEntry label="Hora preferida" value={lead.preferred_time} />
                    )}
                  </div>
                </details>
              </>
            )}
          </div>

          {/* Footer actions */}
          <div className="border-t px-6 py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={handleMarkRead}
                disabled={loading}
              >
                {lead.is_read ? (
                  <>
                    <MailX className="h-4 w-4" />
                    Marcar no leído
                  </>
                ) : (
                  <>
                    <MailCheck className="h-4 w-4" />
                    Marcar como leído
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar lead</DialogTitle>
            <DialogDescription>
              Estás a punto de eliminar el lead de <strong>{displayName}</strong> de forma
              permanente. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
