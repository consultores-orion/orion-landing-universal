'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SiteInfoForm, AdvancedSettings } from './SiteInfoForm'
import { UsersManager } from './UsersManager'
import { BackupRestore } from './BackupRestore'
import { SystemInfo } from './SystemInfo'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface SiteConfig {
  id: string
  site_name: string
  site_description: string
  favicon_url: string
  logo_url: string
  logo_dark_url: string
  primary_contact_email: string
  social_links: Record<string, string>
  analytics_ids: Record<string, string>
  custom_css: string
  custom_head_scripts: string
  setup_completed: boolean
  created_at: string
  updated_at: string
}

interface AdminUser {
  id: string
  email?: string
  created_at: string
  last_sign_in_at: string | null
}

interface SettingsPageClientProps {
  config: SiteConfig | null
  users: AdminUser[]
  currentUserId: string
  supabaseUrl: string
  nodeEnv: string
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function SettingsPageClient({
  config,
  users,
  currentUserId,
  supabaseUrl,
  nodeEnv,
}: SettingsPageClientProps) {
  return (
    <Tabs defaultValue="site" className="space-y-6">
      <TabsList className="flex-wrap">
        <TabsTrigger value="site">Sitio</TabsTrigger>
        <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        <TabsTrigger value="users">Usuarios</TabsTrigger>
        <TabsTrigger value="backup">Backup</TabsTrigger>
        <TabsTrigger value="system">Sistema</TabsTrigger>
      </TabsList>

      <TabsContent value="site">
        <SiteInfoForm config={config} />
      </TabsContent>

      <TabsContent value="advanced">
        <AdvancedSettings config={config} />
      </TabsContent>

      <TabsContent value="users">
        <UsersManager users={users} currentUserId={currentUserId} />
      </TabsContent>

      <TabsContent value="backup">
        <BackupRestore />
      </TabsContent>

      <TabsContent value="system">
        <SystemInfo supabaseUrl={supabaseUrl} nodeEnv={nodeEnv} />
      </TabsContent>
    </Tabs>
  )
}
