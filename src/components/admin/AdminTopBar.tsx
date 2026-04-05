'use client'

import { useRouter } from 'next/navigation'
import { Menu, ExternalLink, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs'
import { createClient } from '@/lib/supabase/client'

interface AdminTopBarProps {
  user: User
  onToggleSidebar: () => void
}

function getInitials(email: string): string {
  const localPart = email.split('@')[0]
  if (!localPart || localPart.length === 0) return 'A'
  return localPart[0]!.toUpperCase()
}

export function AdminTopBar({ user, onToggleSidebar }: AdminTopBarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = getInitials(user.email ?? '')

  return (
    <header className="bg-background fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b px-4">
      {/* Left section */}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu />
        </Button>
        <span className="ml-2 text-lg font-semibold">Admin Panel</span>
      </div>

      {/* Center section */}
      <div className="hidden items-center md:flex">
        <AdminBreadcrumbs />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
          <ExternalLink className="mr-1.5 size-3.5" />
          Vista Previa
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5">
              <p className="text-muted-foreground max-w-[200px] truncate text-sm">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Mi Perfil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
