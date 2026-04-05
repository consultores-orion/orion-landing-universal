'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { WizardProgress } from '@/components/setup/WizardProgress'
import { WizardStep } from '@/components/setup/WizardStep'
import { WizardNavigation } from '@/components/setup/WizardNavigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface TestResults {
  anon: boolean
  serviceRole: boolean
  database: boolean
}

export default function ConnectPage() {
  const router = useRouter()

  // Form fields
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [serviceRoleKey, setServiceRoleKey] = useState('')
  const [databaseUrl, setDatabaseUrl] = useState('')

  // Visibility toggles
  const [showAnon, setShowAnon] = useState(false)
  const [showServiceRole, setShowServiceRole] = useState(false)
  const [showDatabase, setShowDatabase] = useState(false)

  // Test state
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResults | null>(null)
  const [testError, setTestError] = useState('')

  // Save state
  const [isSaving, setIsSaving] = useState(false)

  const allTestsPassed =
    testResults !== null && testResults.anon && testResults.serviceRole && testResults.database

  async function handleTestConnection() {
    setIsTesting(true)
    setTestResults(null)
    setTestError('')

    try {
      const res = await fetch('/api/setup/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseUrl, anonKey, serviceRoleKey, databaseUrl }),
      })

      const data = await res.json()

      if (res.status === 400 && data.details) {
        setTestError(data.details.map((d: { message: string }) => d.message).join(', '))
        return
      }

      setTestResults(data.tests)

      if (data.success) {
        toast.success('Todas las conexiones verificadas correctamente.')
      } else if (data.error) {
        setTestError(data.error)
      }
    } catch {
      setTestError('Error de red. Verifica que el servidor esté activo.')
    } finally {
      setIsTesting(false)
    }
  }

  async function handleNext() {
    setIsSaving(true)

    try {
      const res = await fetch('/api/setup/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseUrl, anonKey, serviceRoleKey, databaseUrl }),
      })

      const data = await res.json()

      if (!data.success) {
        toast.error(data.error ?? 'Error al guardar la configuración.')
        return
      }

      toast.success(data.message)
      router.push('/setup/tables')
    } catch {
      toast.error('Error de red al guardar la configuración.')
    } finally {
      setIsSaving(false)
    }
  }

  function renderTestIcon(passed: boolean | undefined) {
    if (passed === undefined) return null
    return passed ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <>
      <WizardProgress currentStep="connect" />

      <WizardStep
        title="Conecta tu Proyecto Supabase"
        description="Necesitamos las credenciales de tu proyecto Supabase para configurar la base de datos, autenticación y almacenamiento."
      >
        <div className="space-y-5">
          {/* Supabase URL */}
          <div className="space-y-1.5">
            <Label htmlFor="supabaseUrl">Supabase Project URL</Label>
            <Input
              id="supabaseUrl"
              type="text"
              placeholder="https://xxxxx.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Dashboard &gt; Settings &gt; API &gt; Project URL
            </p>
          </div>

          {/* Anon Key */}
          <div className="space-y-1.5">
            <Label htmlFor="anonKey">Anon Key</Label>
            <div className="relative">
              <Input
                id="anonKey"
                type={showAnon ? 'text' : 'password'}
                placeholder="eyJhbGciOi..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowAnon(!showAnon)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                tabIndex={-1}
              >
                {showAnon ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-muted-foreground text-xs">
              Dashboard &gt; Settings &gt; API &gt; anon public
            </p>
          </div>

          {/* Service Role Key */}
          <div className="space-y-1.5">
            <Label htmlFor="serviceRoleKey">Service Role Key</Label>
            <div className="relative">
              <Input
                id="serviceRoleKey"
                type={showServiceRole ? 'text' : 'password'}
                placeholder="eyJhbGciOi..."
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowServiceRole(!showServiceRole)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                tabIndex={-1}
              >
                {showServiceRole ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-muted-foreground text-xs">
              Dashboard &gt; Settings &gt; API &gt; service_role (mantener secreta)
            </p>
          </div>

          {/* Database URL */}
          <div className="space-y-1.5">
            <Label htmlFor="databaseUrl">Database URL</Label>
            <div className="relative">
              <Input
                id="databaseUrl"
                type={showDatabase ? 'text' : 'password'}
                placeholder="postgresql://..."
                value={databaseUrl}
                onChange={(e) => setDatabaseUrl(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowDatabase(!showDatabase)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                tabIndex={-1}
              >
                {showDatabase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-muted-foreground text-xs">
              Dashboard &gt; Settings &gt; Database &gt; Connection String &gt; URI
            </p>
          </div>

          {/* Test Connection Button */}
          <Button
            variant="secondary"
            size="lg"
            onClick={handleTestConnection}
            disabled={isTesting || !supabaseUrl || !anonKey || !serviceRoleKey || !databaseUrl}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" />
                Probando conexión...
              </>
            ) : (
              'Probar Conexión'
            )}
          </Button>

          {/* Test Results */}
          {testResults && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                {renderTestIcon(testResults.anon)}
                <span
                  className={cn('text-sm', testResults.anon ? 'text-green-600' : 'text-red-500')}
                >
                  Anon Key — {testResults.anon ? 'Conexión exitosa' : 'Falló'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderTestIcon(testResults.serviceRole)}
                <span
                  className={cn(
                    'text-sm',
                    testResults.serviceRole ? 'text-green-600' : 'text-red-500',
                  )}
                >
                  Service Role Key — {testResults.serviceRole ? 'Conexión exitosa' : 'Falló'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderTestIcon(testResults.database)}
                <span
                  className={cn(
                    'text-sm',
                    testResults.database ? 'text-green-600' : 'text-red-500',
                  )}
                >
                  Base de Datos — {testResults.database ? 'Conexión exitosa' : 'Falló'}
                </span>
              </div>
            </div>
          )}

          {/* Error message */}
          {testError && <p className="text-sm text-red-500">{testError}</p>}
        </div>
      </WizardStep>

      <WizardNavigation
        currentStep="connect"
        showPrev={false}
        onNext={handleNext}
        isLoading={isSaving}
        isNextDisabled={!allTestsPassed}
      />
    </>
  )
}
