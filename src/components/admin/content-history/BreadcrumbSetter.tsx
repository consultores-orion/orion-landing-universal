'use client'

import { useEffect } from 'react'
import { useAdminStore } from '@/stores/admin-store'

export function BreadcrumbSetter() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Admin', href: '/admin/dashboard' },
      { label: 'Historial', href: '/admin/content-history' },
    ])
    return () => setBreadcrumbs([])
  }, [setBreadcrumbs])

  return null
}
