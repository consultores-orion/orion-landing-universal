'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useAdminStore } from '@/stores/admin-store'
import { IntegrationCard, type Integration } from './IntegrationCard'
import { IntegrationConfig } from './IntegrationConfig'

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface IntegrationsGridProps {
  integrations: Integration[]
}

// ─────────────────────────────────────────────────────────────
// Response shape from the API
// ─────────────────────────────────────────────────────────────

interface ApiResponse {
  data?: Integration
  error?: string
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function IntegrationsGrid({ integrations: initialIntegrations }: IntegrationsGridProps) {
  const setActiveIntegrationsCount = useAdminStore((s) => s.setActiveIntegrationsCount)

  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [configOpen, setConfigOpen] = useState(false)

  // ── Helpers ─────────────────────────────────────────────────

  function updateActiveCount(list: Integration[]) {
    setActiveIntegrationsCount(list.filter((i) => i.is_active).length)
  }

  function findIntegration(id: string): Integration | undefined {
    return integrations.find((i) => i.id === id)
  }

  // ── Toggle active state ──────────────────────────────────────

  async function handleToggle(id: string, newIsActive: boolean) {
    const integration = findIntegration(id)
    if (!integration) return

    // Optimistic update
    const updated = integrations.map((i) => (i.id === id ? { ...i, is_active: newIsActive } : i))
    setIntegrations(updated)
    updateActiveCount(updated)

    try {
      const response = await fetch('/api/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_active: newIsActive,
          config: integration.config,
        }),
      })

      const json = (await response.json()) as ApiResponse

      if (!response.ok) {
        // Revert on failure
        setIntegrations(integrations)
        updateActiveCount(integrations)
        toast.error(json.error ?? 'Error al actualizar la integración')
        return
      }

      if (json.data) {
        const reverted = integrations.map((i) =>
          i.id === id ? { ...i, ...(json.data as Integration) } : i,
        )
        setIntegrations(reverted)
        updateActiveCount(reverted)
      }

      toast.success(newIsActive ? 'Integración activada' : 'Integración desactivada')
    } catch {
      // Revert on network error
      setIntegrations(integrations)
      updateActiveCount(integrations)
      toast.error('Error de conexión')
    }
  }

  // ── Save config ──────────────────────────────────────────────

  async function handleSave(id: string, newConfig: Record<string, unknown>): Promise<void> {
    const integration = findIntegration(id)
    if (!integration) return

    try {
      const response = await fetch('/api/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_active: integration.is_active,
          config: newConfig,
        }),
      })

      const json = (await response.json()) as ApiResponse

      if (!response.ok) {
        toast.error(json.error ?? 'Error al guardar la configuración')
        return
      }

      if (json.data) {
        const updated = integrations.map((i) =>
          i.id === id ? { ...i, ...(json.data as Integration) } : i,
        )
        setIntegrations(updated)
        // Update selectedIntegration so the modal reflects new values
        setSelectedIntegration((prev) =>
          prev?.id === id ? { ...prev, ...(json.data as Integration) } : prev,
        )
      }

      toast.success('Configuración guardada')
    } catch {
      toast.error('Error de conexión')
    }
  }

  // ── Open config modal ────────────────────────────────────────

  function handleConfigure(integration: Integration) {
    setSelectedIntegration(integration)
    setConfigOpen(true)
  }

  // ── Render ───────────────────────────────────────────────────

  if (integrations.length === 0) {
    return (
      <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <p className="text-muted-foreground text-sm">
          No hay integraciones configuradas en la base de datos.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onToggle={handleToggle}
            onConfigure={handleConfigure}
          />
        ))}
      </div>

      <IntegrationConfig
        integration={selectedIntegration}
        open={configOpen}
        onOpenChange={setConfigOpen}
        onSave={handleSave}
      />
    </>
  )
}
