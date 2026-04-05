import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar, Tag } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  message: string
  preferred_date: string | null
  preferred_time: string | null
  source_module: string
  metadata: Record<string, unknown>
  is_read: boolean
  created_at: string
}

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `Lead ${id.slice(0, 8)}… — Admin` }
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
// Page
// ─────────────────────────────────────────────

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data, error } = await supabase.from('leads').select('*').eq('id', id).single()

  if (error || !data) {
    notFound()
  }

  const lead = data as Lead
  const displayName = lead.name || lead.email

  const metadataEntries = Object.entries(lead.metadata ?? {}).filter(
    ([, val]) => val !== null && val !== undefined && val !== '',
  )

  const hasAdditionalDetails = lead.preferred_date || lead.preferred_time

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/leads"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-2 pl-0')}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Leads
        </Link>
      </div>

      {/* Header card */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-xl">{displayName}</CardTitle>
            </div>
            {lead.is_read ? (
              <Badge variant="outline" className="shrink-0">
                Leído
              </Badge>
            ) : (
              <Badge className="shrink-0 bg-blue-500 text-white hover:bg-blue-600">Nuevo</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-5">
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
        </CardContent>
      </Card>

      {/* Message */}
      {lead.message && (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Mensaje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-foreground text-sm whitespace-pre-wrap">{lead.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Additional metadata */}
      {metadataEntries.length > 0 && (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Datos adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {metadataEntries.map(([key, val]) => (
                <MetaEntry key={key} label={key} value={val} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical details */}
      {hasAdditionalDetails && (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Detalles técnicos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {lead.preferred_date && (
                <MetaEntry label="Fecha preferida" value={lead.preferred_date} />
              )}
              {lead.preferred_time && (
                <MetaEntry label="Hora preferida" value={lead.preferred_time} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ID footer */}
      <Separator />
      <p className="text-muted-foreground text-center text-xs">ID: {lead.id}</p>
    </div>
  )
}
