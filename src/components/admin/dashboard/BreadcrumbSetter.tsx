'use client'

import { useEffect } from 'react'
import { useAdminStore } from '@/stores/admin-store'

export function BreadcrumbSetter() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs)

  useEffect(() => {
    setBreadcrumbs([{ label: 'Dashboard', href: '/admin/dashboard' }])
    return () => setBreadcrumbs([])
  }, [setBreadcrumbs])

  return null
}
