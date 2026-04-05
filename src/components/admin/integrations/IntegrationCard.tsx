'use client'

import { useState } from 'react'
import {
  BarChart3,
  Tag,
  Share2,
  MessageCircle,
  CalendarDays,
  Mail,
  Code2,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface Integration {
  id: string
  type: string
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

interface IntegrationCardProps {
  integration: Integration
  onToggle: (id: string, isActive: boolean) => Promise<void>
  onConfigure: (integration: Integration) => void
}

// ─────────────────────────────────────────────────────────────
// Metadata map
// ─────────────────────────────────────────────────────────────

interface IntegrationMeta {
  label: string
  description: string
  icon: LucideIcon
}

const INTEGRATION_META: Record<string, IntegrationMeta> = {
  ga4: {
    label: 'Google Analytics 4',
    description: 'Rastrea visitas y eventos de tu landing.',
    icon: BarChart3,
  },
  gtm: {
    label: 'Google Tag Manager',
    description: 'Gestiona todos tus scripts desde un solo lugar.',
    icon: Tag,
  },
  meta_pixel: {
    label: 'Meta Pixel',
    description: 'Mide conversiones de tus anuncios de Meta.',
    icon: Share2,
  },
  whatsapp: {
    label: 'WhatsApp',
    description: 'Botón flotante de contacto por WhatsApp.',
    icon: MessageCircle,
  },
  calendly: {
    label: 'Calendly',
    description: 'Permite agendar citas directamente.',
    icon: CalendarDays,
  },
  smtp: {
    label: 'Notificaciones SMTP',
    description: 'Recibe emails al capturar nuevos leads.',
    icon: Mail,
  },
  custom_scripts: {
    label: 'Scripts Personalizados',
    description: 'Inyecta scripts en head o body.',
    icon: Code2,
  },
}

const DEFAULT_META: IntegrationMeta = {
  label: 'Integración',
  description: '',
  icon: Code2,
}

// ─────────────────────────────────────────────────────────────
// isConfigured
// ─────────────────────────────────────────────────────────────

function isConfigured(integration: Integration): boolean {
  const c = integration.config
  switch (integration.type) {
    case 'ga4': {
      const val = c['measurement_id']
      return typeof val === 'string' && val !== ''
    }
    case 'gtm': {
      const val = c['container_id']
      return typeof val === 'string' && val !== ''
    }
    case 'meta_pixel': {
      const val = c['pixel_id']
      return typeof val === 'string' && val !== ''
    }
    case 'whatsapp': {
      const val = c['phone_number']
      return typeof val === 'string' && val !== ''
    }
    case 'calendly': {
      const val = c['url']
      return typeof val === 'string' && val !== ''
    }
    case 'smtp': {
      const host = c['host']
      const email = c['from_email']
      return typeof host === 'string' && host !== '' && typeof email === 'string' && email !== ''
    }
    case 'custom_scripts': {
      const head = c['head_scripts']
      const body = c['body_scripts']
      return (typeof head === 'string' && head !== '') || (typeof body === 'string' && body !== '')
    }
    default:
      return false
  }
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function IntegrationCard({ integration, onToggle, onConfigure }: IntegrationCardProps) {
  const [isToggling, setIsToggling] = useState(false)

  const meta = INTEGRATION_META[integration.type] ?? DEFAULT_META
  const Icon = meta.icon
  const configured = isConfigured(integration)
  const switchId = `toggle-${integration.id}`

  async function handleToggle(checked: boolean) {
    setIsToggling(true)
    try {
      await onToggle(integration.id, checked)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Icon className="text-muted-foreground h-5 w-5" />
            </div>
            <CardTitle className="text-base leading-tight">{meta.label}</CardTitle>
          </div>
          <Badge
            variant={integration.is_active ? 'default' : 'secondary'}
            className="shrink-0 text-xs"
          >
            {integration.is_active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-muted-foreground text-sm">{meta.description}</p>
        <div className="mt-3">
          <Badge
            variant={configured ? 'outline' : 'outline'}
            className={
              configured
                ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
                : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
            }
          >
            {configured ? 'Configurado' : 'Sin configurar'}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex items-center gap-2">
          <Switch
            id={switchId}
            checked={integration.is_active}
            onCheckedChange={handleToggle}
            disabled={isToggling}
            aria-label={`${integration.is_active ? 'Desactivar' : 'Activar'} ${meta.label}`}
          />
          <Label htmlFor={switchId} className="cursor-pointer text-sm">
            {integration.is_active ? 'Activado' : 'Desactivado'}
          </Label>
        </div>
        <Button variant="outline" size="sm" onClick={() => onConfigure(integration)}>
          Configurar
        </Button>
      </CardFooter>
    </Card>
  )
}
