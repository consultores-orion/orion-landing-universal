'use client'

import { useEffect } from 'react'
import { useAdminStore } from '@/stores/admin-store'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbSetterProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbSetter({ items }: BreadcrumbSetterProps) {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs)

  useEffect(() => {
    setBreadcrumbs(items)
    return () => setBreadcrumbs([])
  }, [setBreadcrumbs]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
