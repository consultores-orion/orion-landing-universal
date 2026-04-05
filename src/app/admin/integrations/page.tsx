import { Plug } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { BreadcrumbSetter } from '@/components/admin/integrations/BreadcrumbSetter'
import { IntegrationsGrid } from '@/components/admin/integrations/IntegrationsGrid'
import type { Integration } from '@/components/admin/integrations/IntegrationCard'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function redactPasswords(integrations: Integration[]): Integration[] {
  return integrations.map((integration) => {
    if (
      integration.type === 'smtp' &&
      integration.config['password'] !== undefined &&
      integration.config['password'] !== ''
    ) {
      return {
        ...integration,
        config: { ...integration.config, password: '***' },
      }
    }
    return integration
  })
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function IntegrationsPage() {
  const supabase = await createServerClient()

  const { data } = await supabase.from('integrations').select('*').order('type')

  const safe = redactPasswords((data ?? []) as Integration[])

  return (
    <>
      <BreadcrumbSetter />

      {/* Page header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Plug className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Integraciones</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Conecta tu landing con herramientas externas. Activa o desactiva cada integración sin
            modificar código.
          </p>
        </div>
      </div>

      <IntegrationsGrid integrations={safe} />
    </>
  )
}
