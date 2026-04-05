'use client'

import Link from 'next/link'
import { useAdminStore } from '@/stores/admin-store'

export function AdminBreadcrumbs() {
  const breadcrumbs = useAdminStore((s) => s.breadcrumbs)

  if (breadcrumbs.length === 0) {
    return <span className="text-foreground text-sm font-medium">Admin</span>
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <Link
        href="/admin"
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        Admin
      </Link>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        return (
          <span key={crumb.href} className="flex items-center">
            <span className="text-muted-foreground mx-1 text-xs">/</span>
            {isLast ? (
              <span className="text-foreground text-sm font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
