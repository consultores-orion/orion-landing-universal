'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { WizardProgress } from '@/components/setup/WizardProgress'
import { WizardStep } from '@/components/setup/WizardStep'
import { WizardNavigation } from '@/components/setup/WizardNavigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { adminSchema } from '@/lib/setup/validation'

type PasswordStrength = 'weak' | 'medium' | 'strong'

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak'

  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (hasUppercase && hasNumber) return 'strong'
  if (hasUppercase || hasNumber) return 'medium'
  return 'medium'
}

function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'Debil'
    case 'medium':
      return 'Media'
    case 'strong':
      return 'Fuerte'
  }
}

function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'strong':
      return 'bg-green-500'
  }
}

function getStrengthWidth(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'w-1/3'
    case 'medium':
      return 'w-2/3'
    case 'strong':
      return 'w-full'
  }
}

export default function AdminPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const passwordStrength = password.length > 0 ? getPasswordStrength(password) : null

  async function handleNext() {
    setFieldErrors({})

    // Client-side validation
    const parsed = adminSchema.safeParse({ email, password, confirmPassword })
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (field && typeof field === 'string' && !errors[field]) {
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword }),
      })

      const data = await res.json()

      if (!data.success) {
        const errorMsg = data.error ?? 'Error al crear la cuenta.'
        // Check if it's a validation error from the server
        if (data.details) {
          const errors: Record<string, string> = {}
          for (const issue of data.details as { path: (string | number)[]; message: string }[]) {
            const field = issue.path[0]
            if (field && typeof field === 'string' && !errors[field]) {
              errors[field] = issue.message
            }
          }
          setFieldErrors(errors)
        } else {
          toast.error(errorMsg)
        }
        return
      }

      toast.success('Cuenta de administrador creada exitosamente.')
      router.push('/setup/complete')
    } catch {
      toast.error('Error de red al crear la cuenta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handlePrev() {
    router.push('/setup/seed')
  }

  return (
    <>
      <WizardProgress currentStep="admin" />

      <WizardStep
        title="Crea tu Cuenta de Administrador"
        description="Esta cuenta te dara acceso al panel de administracion para gestionar tu landing page."
      >
        <div className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@tudominio.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) {
                  setFieldErrors((prev) => {
                    const next = { ...prev }
                    delete next.email
                    return next
                  })
                }
              }}
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Contrasena</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimo 8 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => {
                      const next = { ...prev }
                      delete next.password
                      return next
                    })
                  }
                }}
                className="pr-10"
                aria-invalid={!!fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded p-2"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}

            {/* Password strength indicator */}
            {passwordStrength && (
              <div className="space-y-1">
                <div className="bg-muted h-1.5 w-full rounded-full">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      getStrengthColor(passwordStrength),
                      getStrengthWidth(passwordStrength),
                    )}
                  />
                </div>
                <p
                  className={cn(
                    'text-xs',
                    passwordStrength === 'weak' && 'text-red-500',
                    passwordStrength === 'medium' && 'text-yellow-600',
                    passwordStrength === 'strong' && 'text-green-600',
                  )}
                >
                  Seguridad: {getStrengthLabel(passwordStrength)}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar Contrasena</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repite tu contrasena"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => {
                      const next = { ...prev }
                      delete next.confirmPassword
                      return next
                    })
                  }
                }}
                className="pr-10"
                aria-invalid={!!fieldErrors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded p-2"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Note */}
          <div className="border-primary/20 bg-primary/5 text-muted-foreground rounded-lg border p-3 text-sm">
            Guarda estas credenciales. Las necesitaras para acceder al panel de administracion.
          </div>
        </div>
      </WizardStep>

      <WizardNavigation
        currentStep="admin"
        onNext={handleNext}
        onPrev={handlePrev}
        nextLabel="Crear Cuenta"
        isLoading={isSubmitting}
      />
    </>
  )
}
