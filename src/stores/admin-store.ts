import { create } from 'zustand'

type BadgeKey = 'activeLanguagesCount' | 'activeIntegrationsCount' | 'unreadLeadsCount'

interface AdminStore {
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  breadcrumbs: Array<{ label: string; href: string }>
  unreadLeadsCount: number
  activeLanguagesCount: number
  activeIntegrationsCount: number
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href: string }>) => void
  setUnreadLeadsCount: (count: number) => void
  setActiveLanguagesCount: (count: number) => void
  setActiveIntegrationsCount: (count: number) => void
}

export const useAdminStore = create<AdminStore>()((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  breadcrumbs: [],
  unreadLeadsCount: 0,
  activeLanguagesCount: 0,
  activeIntegrationsCount: 0,

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

  setUnreadLeadsCount: (count) => set({ unreadLeadsCount: count }),

  setActiveLanguagesCount: (count) => set({ activeLanguagesCount: count }),

  setActiveIntegrationsCount: (count) => set({ activeIntegrationsCount: count }),
}))

export type { BadgeKey }
