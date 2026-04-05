'use client'

import { useEffect } from 'react'
import { useAdminStore } from '@/stores/admin-store'

interface BreadcrumbItem {
  label: string
  href: string
}

export function BreadcrumbSetter({ items }: { items: BreadcrumbItem[] }) {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs)

  useEffect(() => {
    setBreadcrumbs(items)
    return () => setBreadcrumbs([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumbs])

  return null
}
