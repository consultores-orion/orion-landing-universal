'use client'

import { useEffect } from 'react'
import { useAdminStore } from '@/stores/admin-store'

export function BreadcrumbSetter() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Admin', href: '/admin/dashboard' },
      { label: 'Medios', href: '/admin/media' },
    ])
    return () => setBreadcrumbs([])
  }, [setBreadcrumbs])

  return null
}
