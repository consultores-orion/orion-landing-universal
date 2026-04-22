'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Puzzle,
  Palette,
  Languages,
  Search,
  Image,
  Plug,
  Users,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAdminStore, type BadgeKey } from '@/stores/admin-store'

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  badgeKey: BadgeKey | null
}

const NAV_ITEMS: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/admin/dashboard',
    badgeKey: null,
  },
  {
    icon: FileText,
    label: 'Contenido',
    href: '/admin/content',
    badgeKey: null,
  },
  {
    icon: Puzzle,
    label: 'Módulos',
    href: '/admin/modules',
    badgeKey: null,
  },
  {
    icon: Palette,
    label: 'Diseño',
    href: '/admin/design',
    badgeKey: null,
  },
  {
    icon: Languages,
    label: 'Idiomas',
    href: '/admin/languages',
    badgeKey: 'activeLanguagesCount',
  },
  {
    icon: Search,
    label: 'SEO',
    href: '/admin/seo',
    badgeKey: null,
  },
  {
    icon: Image,
    label: 'Medios',
    href: '/admin/media',
    badgeKey: null,
  },
  {
    icon: Plug,
    label: 'Integraciones',
    href: '/admin/integrations',
    badgeKey: 'activeIntegrationsCount',
  },
  {
    icon: Users,
    label: 'Leads',
    href: '/admin/leads',
    badgeKey: 'unreadLeadsCount',
  },
  {
    icon: History,
    label: 'Historial',
    href: '/admin/content-history',
    badgeKey: null,
  },
  {
    icon: Settings,
    label: 'Configuración',
    href: '/admin/settings',
    badgeKey: null,
  },
]

interface AdminSidebarProps {
  collapsed: boolean
}

export function AdminSidebar({ collapsed }: AdminSidebarProps) {
  const pathname = usePathname()

  const sidebarOpen = useAdminStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAdminStore((s) => s.setSidebarOpen)
  const setSidebarCollapsed = useAdminStore((s) => s.setSidebarCollapsed)

  const unreadLeadsCount = useAdminStore((s) => s.unreadLeadsCount)
  const activeLanguagesCount = useAdminStore((s) => s.activeLanguagesCount)
  const activeIntegrationsCount = useAdminStore((s) => s.activeIntegrationsCount)

  const badgeCounts: Record<BadgeKey, number> = {
    unreadLeadsCount,
    activeLanguagesCount,
    activeIntegrationsCount,
  }

  return (
    <>
      {/* Desktop sidebar — visible lg+ */}
      <aside
        className={cn(
          'bg-background fixed top-16 bottom-0 left-0 z-40 hidden flex-col overflow-y-auto border-r transition-all duration-200 lg:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <nav className="flex-1 px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const badgeCount = item.badgeKey !== null ? badgeCounts[item.badgeKey] : 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative mb-0.5 flex items-center rounded-md py-2 transition-colors',
                  collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="relative shrink-0">
                  <item.icon className="size-5" />
                  {badgeCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-bold">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </span>
                {!collapsed && <span className="truncate text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Desktop footer: collapse toggle + version */}
        <div
          className={cn(
            'flex items-center border-t px-2 py-3',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {!collapsed && <span className="text-muted-foreground pl-1 text-xs">v0.1.0</span>}
          <button
            onClick={() => setSidebarCollapsed(!collapsed)}
            className="hover:bg-accent hover:text-accent-foreground flex size-8 items-center justify-center rounded-md transition-colors"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar drawer — visible below lg */}
      <aside
        className={cn(
          'bg-background fixed top-0 bottom-0 left-0 z-50 flex w-64 transform flex-col border-r transition-transform duration-200 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const badgeCount = item.badgeKey !== null ? badgeCounts[item.badgeKey] : 0

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'relative mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <span className="relative shrink-0">
                  <item.icon className="size-5" />
                  {badgeCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-bold">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </span>
                <span className="truncate text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
