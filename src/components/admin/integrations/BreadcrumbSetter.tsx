'use client'

import { useEffect } from 'react'
import { useAdminStore } from '@/stores/admin-store'

export function BreadcrumbSetter() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Admin', href: '/admin/dashboard' },
      { label: 'Integraciones', href: '/admin/integrations' },
    ])
    return () => setBreadcrumbs([])
  }, [setBreadcrumbs])

  return null
}
