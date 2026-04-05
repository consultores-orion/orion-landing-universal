'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ConnectionStatus = 'checking' | 'connected' | 'error'

interface SystemInfoProps {
  supabaseUrl: string
  nodeEnv: string
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return url
  }
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function SystemInfo({ supabaseUrl, nodeEnv }: SystemInfoProps) {
  const [status, setStatus] = useState<ConnectionStatus>('checking')

  useEffect(() => {
    let cancelled = false

    async function checkHealth() {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' })
        if (!cancelled) {
          setStatus(res.ok ? 'connected' : 'error')
        }
      } catch {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    void checkHealth()

    return () => {
      cancelled = true
    }
  }, [])

  const serverDate = new Date().toLocaleDateString('es', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del sistema</CardTitle>
        <CardDescription>Estado y configuración de la instalación actual.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[180px_1fr] items-center gap-x-4 gap-y-3 text-sm">
          <span className="text-muted-foreground font-medium">Versión</span>
          <span>v1.0.0</span>

          <Separator className="col-span-2" />

          <span className="text-muted-foreground font-medium">Supabase URL</span>
          <span className="font-mono text-xs">{extractDomain(supabaseUrl)}</span>

          <Separator className="col-span-2" />

          <span className="text-muted-foreground font-medium">Estado de conexión</span>
          <div>
            {status === 'checking' && <Badge variant="secondary">Verificando...</Badge>}
            {status === 'connected' && (
              <Badge className="bg-green-500 hover:bg-green-600">Conectado</Badge>
            )}
            {status === 'error' && <Badge variant="destructive">Error de conexión</Badge>}
          </div>

          <Separator className="col-span-2" />

          <span className="text-muted-foreground font-medium">Fecha</span>
          <span>{serverDate}</span>

          <Separator className="col-span-2" />

          <span className="text-muted-foreground font-medium">Entorno</span>
          <Badge variant={nodeEnv === 'production' ? 'default' : 'secondary'} className="w-fit">
            {nodeEnv}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
