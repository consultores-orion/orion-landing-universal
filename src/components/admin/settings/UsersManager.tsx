'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PasswordChangeForm } from './PasswordChangeForm'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AdminUser {
  id: string
  email?: string
  created_at: string
  last_sign_in_at: string | null
}

interface UsersManagerProps {
  users: AdminUser[]
  currentUserId: string
}

interface CreateUserValues {
  email: string
  password: string
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function UsersManager({ users: initialUsers, currentUserId }: UsersManagerProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserValues>({
    defaultValues: { email: '', password: '' },
  })

  async function handleCreate(values: CreateUserValues) {
    setCreating(true)
    try {
      const res = await fetch('/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Error al crear usuario')
      }

      const json = (await res.json()) as { data: AdminUser }
      setUsers((prev) => [...prev, json.data])
      toast.success('Usuario creado correctamente')
      setDialogOpen(false)
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear usuario')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      )
    )
      return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/settings/users/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Error al eliminar usuario')
      }

      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('Usuario eliminado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar usuario')
    } finally {
      setDeletingId(null)
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Usuarios admin</CardTitle>
            <CardDescription>
              Gestiona los usuarios con acceso al panel de administración.
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Invitar admin
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear nuevo administrador</DialogTitle>
                <DialogDescription>
                  El usuario tendrá acceso completo al panel de administración.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    autoComplete="off"
                    {...register('email', {
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Email inválido',
                      },
                    })}
                    placeholder="admin@miempresa.com"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password">Contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 8,
                        message: 'La contraseña debe tener al menos 8 caracteres',
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="text-destructive text-xs">{errors.password.message}</p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      reset()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating} className="gap-2">
                    {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Crear usuario
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCircle className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">{u.email ?? '(sin email)'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(u.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(u.last_sign_in_at)}
                  </TableCell>
                  <TableCell>
                    {u.id === currentUserId ? (
                      <Badge variant="default">Tú</Badge>
                    ) : (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === u.id || u.id === currentUserId || users.length <= 1}
                      onClick={() => handleDelete(u.id)}
                      aria-label="Eliminar usuario"
                    >
                      {deletingId === u.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="text-destructive h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cambiar contraseña del usuario actual */}
      <PasswordChangeForm userId={currentUserId} />
    </div>
  )
}
