import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BreadcrumbSetter } from '@/components/admin/settings/BreadcrumbSetter'
import { SettingsPageClient } from '@/components/admin/settings/SettingsPageClient'

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export const metadata = { title: 'Configuración — Admin' }

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function SettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminClient = createAdminClient()

  const [configResult, usersResult] = await Promise.all([
    supabase.from('site_config').select('*').single(),
    adminClient.auth.admin.listUsers(),
  ])

  const users = (usersResult.data?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }))

  return (
    <>
      <BreadcrumbSetter />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gestiona la configuración general de tu sitio.
        </p>
      </div>

      <SettingsPageClient
        config={configResult.data ?? null}
        users={users}
        currentUserId={user?.id ?? ''}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}
        nodeEnv={process.env.NODE_ENV}
      />
    </>
  )
}
