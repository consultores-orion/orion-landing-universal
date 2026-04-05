'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2, Clock } from 'lucide-react'
import { toast } from 'sonner'

import { WizardProgress } from '@/components/setup/WizardProgress'
import { WizardStep } from '@/components/setup/WizardStep'
import { WizardNavigation } from '@/components/setup/WizardNavigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SeedStatus = 'pending' | 'loading' | 'success' | 'error'

interface SeedCategory {
  key: string
  label: string
  detail: string
  status: SeedStatus
  error?: string
}

interface SeedResult {
  category: string
  status: 'success' | 'error' | 'skipped'
  error?: string
  count?: number
}

const INITIAL_CATEGORIES: SeedCategory[] = [
  {
    key: 'storage_buckets',
    label: 'Storage Buckets',
    detail: 'page_images, avatars',
    status: 'pending',
  },
  { key: 'languages', label: 'Idiomas', detail: 'Espanol, English', status: 'pending' },
  { key: 'color_palettes', label: 'Paletas de colores', detail: '20 paletas', status: 'pending' },
  {
    key: 'theme_config',
    label: 'Configuracion del tema',
    detail: 'Tema por defecto',
    status: 'pending',
  },
  {
    key: 'site_config',
    label: 'Configuracion del sitio',
    detail: 'Datos principales',
    status: 'pending',
  },
  {
    key: 'seo_config',
    label: 'Configuracion SEO',
    detail: 'Meta tags por defecto',
    status: 'pending',
  },
  {
    key: 'integrations',
    label: 'Integraciones',
    detail: 'GA4, Meta Pixel, etc.',
    status: 'pending',
  },
]

export default function SeedPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<SeedCategory[]>(INITIAL_CATEGORIES)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [stepStatus, setStepStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSeed() {
    setIsSeeding(true)
    setStepStatus('loading')
    setErrorMessage('')

    // Set all to loading
    setCategories((prev) =>
      prev.map((c) => ({ ...c, status: 'loading' as const, error: undefined })),
    )

    try {
      const res = await fetch('/api/setup/seed', { method: 'POST' })
      const data = await res.json()

      if (data.method === 'skipped') {
        setCategories((prev) => prev.map((c) => ({ ...c, status: 'success' as const })))
        setIsDone(true)
        setStepStatus('success')
        toast.success('Los datos iniciales ya existen.')
        return
      }

      if (data.error && !data.results) {
        setStepStatus('error')
        setErrorMessage(data.error)
        setCategories((prev) => prev.map((c) => ({ ...c, status: 'error' as const })))
        return
      }

      // Map results to categories
      const resultMap = new Map<string, SeedResult>()
      if (data.results) {
        for (const r of data.results as SeedResult[]) {
          resultMap.set(r.category, r)
        }
      }

      setCategories((prev) =>
        prev.map((c) => {
          const result = resultMap.get(c.key)
          if (result) {
            return {
              ...c,
              status: result.status === 'skipped' ? ('success' as const) : result.status,
              error: result.error,
            }
          }
          return { ...c, status: data.success ? ('success' as const) : ('pending' as const) }
        }),
      )

      if (data.success) {
        setIsDone(true)
        setStepStatus('success')
        toast.success(data.message)
      } else {
        setStepStatus('error')
        setErrorMessage(data.message ?? 'Algunos datos no se pudieron cargar.')
      }
    } catch {
      setStepStatus('error')
      setErrorMessage('Error de red. Verifica que el servidor este activo.')
      setCategories((prev) => prev.map((c) => ({ ...c, status: 'error' as const })))
    } finally {
      setIsSeeding(false)
    }
  }

  function handleNext() {
    router.push('/setup/admin')
  }

  function handlePrev() {
    router.push('/setup/tables')
  }

  function renderStatusIcon(status: SeedStatus) {
    switch (status) {
      case 'pending':
        return <Clock className="text-muted-foreground h-4 w-4" />
      case 'loading':
        return <Loader2 className="text-primary h-4 w-4 animate-spin" />
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />
      case 'error':
        return <X className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <>
      <WizardProgress currentStep="seed" />

      <WizardStep
        title="Preparando tu Contenido"
        description="Se cargaran los datos iniciales: idiomas, paletas, tema, configuracion y mas."
        status={stepStatus}
        errorMessage={errorMessage}
      >
        <div className="space-y-4">
          {/* Category list */}
          <div className="space-y-1.5">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
                  cat.status === 'success' && 'border-green-200 bg-green-50/50',
                  cat.status === 'error' && 'border-red-200 bg-red-50/50',
                  cat.status === 'loading' && 'border-primary/20 bg-primary/5',
                )}
              >
                {renderStatusIcon(cat.status)}
                <span className="font-medium">{cat.label}</span>
                <span className="text-muted-foreground text-xs">({cat.detail})</span>
                {cat.error && <span className="ml-auto text-xs text-red-500">{cat.error}</span>}
              </div>
            ))}
          </div>

          {/* Seed button */}
          {!isDone && (
            <Button size="lg" onClick={handleSeed} disabled={isSeeding} className="w-full">
              {isSeeding ? (
                <>
                  <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" />
                  Cargando datos iniciales...
                </>
              ) : (
                'Cargar Datos Iniciales'
              )}
            </Button>
          )}
        </div>
      </WizardStep>

      <WizardNavigation
        currentStep="seed"
        onNext={handleNext}
        onPrev={handlePrev}
        isNextDisabled={!isDone}
      />
    </>
  )
}
