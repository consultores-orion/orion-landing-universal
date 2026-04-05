'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PasswordFormValues {
  password: string
  confirmPassword: string
}

interface PasswordChangeFormProps {
  userId: string
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function PasswordChangeForm({ userId }: PasswordChangeFormProps) {
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    defaultValues: { password: '', confirmPassword: '' },
  })

  const passwordValue = watch('password')

  async function onSubmit(values: PasswordFormValues) {
    if (values.password.length < 8) {
      setError('password', {
        message: 'La contraseña debe tener al menos 8 caracteres',
      })
      return
    }
    if (values.password !== values.confirmPassword) {
      setError('confirmPassword', { message: 'Las contraseñas no coinciden' })
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/settings/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.password }),
      })

      if (!response.ok) {
        const err = (await response.json()) as { error?: string }
        throw new Error(err.error ?? 'Error al cambiar contraseña')
      }

      toast.success('Contraseña cambiada correctamente')
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar contraseña')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar contraseña</CardTitle>
        <CardDescription>
          Actualiza la contraseña de acceso al panel de administración.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
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

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Confirma la contraseña',
                validate: (val) => val === passwordValue || 'Las contraseñas no coinciden',
              })}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Cambiar contraseña
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
