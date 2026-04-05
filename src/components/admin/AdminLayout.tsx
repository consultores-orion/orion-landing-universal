'use client'

import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'

import { cn } from '@/lib/utils'
import { useAdminStore } from '@/stores/admin-store'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

interface AdminLayoutProps {
  user: User
  children: ReactNode
}

export function AdminLayout({ user, children }: AdminLayoutProps) {
  const sidebarCollapsed = useAdminStore((s) => s.sidebarCollapsed)
  const sidebarOpen = useAdminStore((s) => s.sidebarOpen)
  const setSidebarCollapsed = useAdminStore((s) => s.setSidebarCollapsed)
  const setSidebarOpen = useAdminStore((s) => s.setSidebarOpen)

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <AdminTopBar user={user} onToggleSidebar={handleToggleSidebar} />
      <AdminSidebar collapsed={sidebarCollapsed} />
      <main
        className={cn(
          'min-h-[calc(100vh-4rem)] p-6 pt-16 transition-all duration-200',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64',
        )}
      >
        {children}
      </main>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
