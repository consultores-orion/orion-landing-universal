'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2, Copy, ExternalLink, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

import { WizardProgress } from '@/components/setup/WizardProgress'
import { WizardStep } from '@/components/setup/WizardStep'
import { WizardNavigation } from '@/components/setup/WizardNavigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TableStatus = 'pending' | 'loading' | 'success' | 'error'

interface TableInfo {
  name: string
  label: string
  status: TableStatus
  error?: string
}

interface TableResult {
  table: string
  status: 'success' | 'error'
  error?: string
}

const INITIAL_TABLES: TableInfo[] = [
  { name: 'site_config', label: 'Configuracion global', status: 'pending' },
  { name: 'languages', label: 'Idiomas', status: 'pending' },
  { name: 'color_palettes', label: 'Paletas de colores', status: 'pending' },
  { name: 'theme_config', label: 'Configuracion del tema', status: 'pending' },
  { name: 'module_schemas', label: 'Esquemas de modulos', status: 'pending' },
  { name: 'page_modules', label: 'Modulos de pagina', status: 'pending' },
  { name: 'leads', label: 'Captura de leads', status: 'pending' },
  { name: 'media', label: 'Biblioteca de medios', status: 'pending' },
  { name: 'integrations', label: 'Integraciones', status: 'pending' },
  { name: 'seo_config', label: 'Configuracion SEO', status: 'pending' },
]

export default function TablesPage() {
  const router = useRouter()

  const [tables, setTables] = useState<TableInfo[]>(INITIAL_TABLES)
  const [isCreating, setIsCreating] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [stepStatus, setStepStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Manual fallback state
  const [manualFallback, setManualFallback] = useState(false)
  const [sqlScript, setSqlScript] = useState('')
  const [sqlEditorUrl, setSqlEditorUrl] = useState('')
  const [isPolling, setIsPolling] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  const checkTablesExist = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/setup/create-tables', { method: 'POST' })
      const data = await res.json()
      return data.method === 'skipped'
    } catch {
      return false
    }
  }, [])

  function startPolling() {
    setIsPolling(true)
    pollingRef.current = setInterval(async () => {
      const exist = await checkTablesExist()
      if (exist) {
        if (pollingRef.current) clearInterval(pollingRef.current)
        pollingRef.current = null
        setIsPolling(false)
        setManualFallback(false)
        setIsDone(true)
        setStepStatus('success')
        setTables((prev) => prev.map((t) => ({ ...t, status: 'success' as const })))
        toast.success('Tablas detectadas correctamente.')
      }
    }, 5000)
  }

  async function handleCopySQL() {
    try {
      await navigator.clipboard.writeText(sqlScript)
      toast.success('SQL copiado al portapapeles.')
    } catch {
      toast.error('No se pudo copiar. Selecciona y copia manualmente.')
    }
  }

  async function handleCreateTables() {
    setIsCreating(true)
    setStepStatus('loading')
    setErrorMessage('')
    setManualFallback(false)

    // Set all tables to loading
    setTables((prev) => prev.map((t) => ({ ...t, status: 'loading' as const })))

    try {
      const res = await fetch('/api/setup/create-tables', { method: 'POST' })
      const data = await res.json()

      if (data.method === 'skipped') {
        // Tables already exist
        setTables((prev) => prev.map((t) => ({ ...t, status: 'success' as const })))
        setIsDone(true)
        setStepStatus('success')
        toast.success('Las tablas ya existen.')
        return
      }

      if (data.method?.startsWith('direct_connection')) {
        // Map results to table list
        const resultMap = new Map<string, TableResult>()
        if (data.results) {
          for (const r of data.results as TableResult[]) {
            resultMap.set(r.table, r)
          }
        }

        setTables((prev) =>
          prev.map((t) => {
            const result = resultMap.get(t.name)
            if (result) {
              return {
                ...t,
                status: result.status,
                error: result.error,
              }
            }
            // If not in results, assume success if overall success
            return {
              ...t,
              status: data.success ? 'success' : 'pending',
            }
          }),
        )

        if (data.success) {
          setIsDone(true)
          setStepStatus('success')
          toast.success(data.message)
        } else {
          setStepStatus('error')
          setErrorMessage(data.message ?? 'Algunas tablas no se pudieron crear.')
        }
        return
      }

      if (data.method === 'manual_fallback') {
        setManualFallback(true)
        setSqlScript(data.sqlScript ?? '')
        setSqlEditorUrl(data.supabaseSqlEditorUrl ?? 'https://supabase.com/dashboard')
        setTables((prev) => prev.map((t) => ({ ...t, status: 'pending' as const })))
        setStepStatus('idle')
        toast.warning('Se requiere creacion manual de tablas.')
        startPolling()
        return
      }

      // Unknown method or error
      setStepStatus('error')
      setErrorMessage(data.error ?? data.message ?? 'Error desconocido.')
      setTables((prev) => prev.map((t) => ({ ...t, status: 'error' as const })))
    } catch {
      setStepStatus('error')
      setErrorMessage('Error de red. Verifica que el servidor este activo.')
      setTables((prev) => prev.map((t) => ({ ...t, status: 'error' as const })))
    } finally {
      setIsCreating(false)
    }
  }

  function handleNext() {
    router.push('/setup/seed')
  }

  function handlePrev() {
    router.push('/setup/connect')
  }

  function renderStatusIcon(status: TableStatus) {
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
      <WizardProgress currentStep="tables" />

      <WizardStep
        title="Creando tu Base de Datos"
        description="Se crearan las 10 tablas necesarias para tu landing page."
        status={stepStatus}
        errorMessage={errorMessage}
      >
        <div className="space-y-4">
          {/* Table list */}
          <div className="space-y-1.5">
            {tables.map((table) => (
              <div
                key={table.name}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
                  table.status === 'success' && 'border-green-200 bg-green-50/50',
                  table.status === 'error' && 'border-red-200 bg-red-50/50',
                  table.status === 'loading' && 'border-primary/20 bg-primary/5',
                )}
              >
                {renderStatusIcon(table.status)}
                <span className="text-muted-foreground font-mono text-xs">{table.name}</span>
                <span className="text-muted-foreground">&mdash;</span>
                <span>{table.label}</span>
                {table.error && <span className="ml-auto text-xs text-red-500">{table.error}</span>}
              </div>
            ))}
          </div>

          {/* Create button */}
          {!isDone && !manualFallback && (
            <Button size="lg" onClick={handleCreateTables} disabled={isCreating} className="w-full">
              {isCreating ? (
                <>
                  <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" />
                  Creando tablas...
                </>
              ) : (
                'Crear Tablas'
              )}
            </Button>
          )}

          {/* Manual fallback */}
          {manualFallback && (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800">Creacion manual requerida</p>
                  <p className="text-xs text-amber-700">
                    No fue posible crear las tablas automaticamente. Copia el SQL a continuacion y
                    ejecutalo en el SQL Editor de Supabase.
                  </p>
                </div>
              </div>

              {/* SQL Script */}
              <div className="relative">
                <pre className="max-h-64 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                  {sqlScript}
                </pre>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopySQL}
                  className="absolute top-2 right-2"
                >
                  <Copy data-icon="inline-start" className="h-3 w-3" />
                  Copiar SQL
                </Button>
              </div>

              {/* Open SQL Editor link */}
              <a
                href={sqlEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              >
                Abrir SQL Editor de Supabase
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              {/* Polling indicator */}
              {isPolling && (
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Verificando cada 5 segundos si las tablas fueron creadas...
                </div>
              )}
            </div>
          )}
        </div>
      </WizardStep>

      <WizardNavigation
        currentStep="tables"
        onNext={handleNext}
        onPrev={handlePrev}
        isNextDisabled={!isDone}
      />
    </>
  )
}
