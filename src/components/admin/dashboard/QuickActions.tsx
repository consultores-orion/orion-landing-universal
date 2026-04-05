'use client'

import Link from 'next/link'
import { Edit, Palette, Languages, Plug, ExternalLink, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuickAction {
  icon: React.ElementType
  title: string
  description: string
  href?: string
  onClick?: () => void
}

const actions: QuickAction[] = [
  {
    icon: Edit,
    title: 'Editar Hero',
    description: 'Modificar el banner principal',
    href: '/admin/content/hero',
  },
  {
    icon: Palette,
    title: 'Cambiar Paleta',
    description: 'Ajustar colores y tema visual',
    href: '/admin/design',
  },
  {
    icon: Languages,
    title: 'Agregar Idioma',
    description: 'Gestionar idiomas disponibles',
    href: '/admin/languages',
  },
  {
    icon: Plug,
    title: 'Integraciones',
    description: 'Analytics, Pixel, WhatsApp',
    href: '/admin/integrations',
  },
  {
    icon: ExternalLink,
    title: 'Ver Landing',
    description: 'Abrir el sitio público',
    onClick: () => window.open('/', '_blank'),
  },
  {
    icon: Download,
    title: 'Exportar Leads',
    description: 'Descargar leads en CSV',
    href: '/admin/leads',
  },
]

function ActionCard({ action }: { action: QuickAction }) {
  const { icon: Icon, title, description, href, onClick } = action

  const content = (
    <CardContent className="flex items-start gap-3 pt-4">
      <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-foreground font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </CardContent>
  )

  const cardClass = cn(
    'cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-primary/30 hover:shadow-sm active:scale-[0.98]',
  )

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        <Card className={cardClass}>{content}</Card>
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <Card className={cardClass}>{content}</Card>
    </button>
  )
}

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action) => (
            <ActionCard key={action.title} action={action} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
