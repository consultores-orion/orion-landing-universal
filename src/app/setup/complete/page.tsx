'use client'

import Link from 'next/link'
import { CheckCircle2, Check } from 'lucide-react'

import { WizardProgress } from '@/components/setup/WizardProgress'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const SUMMARY_ITEMS = [
  'Base de datos conectada',
  '10 tablas creadas',
  '20 paletas de colores cargadas',
  '19 modulos configurados',
  '2 idiomas (Espanol, English)',
  'Cuenta de administrador creada',
]

export default function CompletePage() {
  return (
    <>
      <WizardProgress currentStep="complete" />

      <div className="flex flex-col items-center text-center">
        {/* Success icon */}
        <CheckCircle2 className="h-16 w-16 text-green-500" />

        {/* Title */}
        <h1 className="text-foreground mt-4 text-2xl font-bold">Tu Landing Page esta Lista!</h1>

        {/* Description */}
        <p className="text-muted-foreground mt-2 text-sm">
          Has completado toda la configuracion. Tu sitio esta listo para ser personalizado desde el
          panel de administracion.
        </p>

        {/* Summary card */}
        <Card className="mt-6 w-full text-left">
          <CardContent>
            <ul className="space-y-2">
              {SUMMARY_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className={cn(buttonVariants({ size: 'lg' }), 'flex-1 sm:min-w-[200px] sm:flex-none')}
          >
            Ver mi Landing Page
          </Link>
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'flex-1 sm:min-w-[200px] sm:flex-none',
            )}
          >
            Ir al Panel Admin
          </Link>
        </div>
      </div>
    </>
  )
}
