'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Lead {
  id: string
  name: string
  email: string
  created_at: string
  is_read: boolean
}

interface RecentLeadsTableProps {
  leads: Lead[]
}

export function RecentLeadsTable({ leads }: RecentLeadsTableProps) {
  return (
    <Card className="h-full">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base font-semibold">Leads Recientes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {leads.length === 0 ? (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
            No hay leads registrados aún.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="text-muted-foreground hidden px-4 py-3 text-left font-medium sm:table-cell">
                    Email
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-muted/30 border-b transition-colors last:border-0"
                  >
                    <td className="text-foreground px-4 py-3 font-medium">{lead.name || '—'}</td>
                    <td className="text-muted-foreground hidden px-4 py-3 sm:table-cell">
                      {lead.email}
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {formatDistanceToNow(new Date(lead.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {lead.is_read ? (
                        <Badge variant="outline">Leído</Badge>
                      ) : (
                        <Badge variant="default">Nuevo</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer link */}
        <div className="border-t px-4 py-3">
          <Link href="/admin/leads" className="text-primary text-sm font-medium hover:underline">
            Ver todos los leads →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
