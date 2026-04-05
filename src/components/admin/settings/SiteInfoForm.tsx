'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SocialLinksEditor } from './SocialLinksEditor'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface SiteConfig {
  id: string
  site_name: string
  site_description: string
  favicon_url: string
  logo_url: string
  logo_dark_url: string
  primary_contact_email: string
  social_links: Record<string, string>
  analytics_ids: Record<string, string>
  custom_css: string
  custom_head_scripts: string
  setup_completed: boolean
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────
// SiteInfoForm
// ─────────────────────────────────────────────

interface SiteInfoFormValues {
  site_name: string
  site_description: string
  primary_contact_email: string
  logo_url: string
  logo_dark_url: string
  favicon_url: string
}

interface SiteInfoFormProps {
  config: SiteConfig | null
}

export function SiteInfoForm({ config }: SiteInfoFormProps) {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(config?.social_links ?? {})
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SiteInfoFormValues>({
    defaultValues: {
      site_name: config?.site_name ?? '',
      site_description: config?.site_description ?? '',
      primary_contact_email: config?.primary_contact_email ?? '',
      logo_url: config?.logo_url ?? '',
      logo_dark_url: config?.logo_dark_url ?? '',
      favicon_url: config?.favicon_url ?? '',
    },
  })

  const logoUrlValue = watch('logo_url')
  const faviconUrlValue = watch('favicon_url')

  async function onSubmit(values: SiteInfoFormValues) {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, social_links: socialLinks }),
      })

      if (!response.ok) {
        const err = (await response.json()) as { error?: string }
        throw new Error(err.error ?? 'Error al guardar')
      }

      toast.success('Configuración guardada correctamente')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del sitio</CardTitle>
          <CardDescription>Datos principales que identifican tu sitio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Nombre del sitio */}
          <div className="space-y-1.5">
            <Label htmlFor="site_name">
              Nombre del sitio <span className="text-destructive">*</span>
            </Label>
            <Input
              id="site_name"
              {...register('site_name', {
                required: 'El nombre es requerido',
                maxLength: {
                  value: 100,
                  message: 'Máximo 100 caracteres',
                },
              })}
              placeholder="Mi empresa"
            />
            {errors.site_name && (
              <p className="text-destructive text-xs">{errors.site_name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="site_description">Descripción del sitio</Label>
            <Textarea
              id="site_description"
              {...register('site_description', {
                maxLength: { value: 500, message: 'Máximo 500 caracteres' },
              })}
              placeholder="Descripción breve de tu sitio..."
              rows={3}
            />
            {errors.site_description && (
              <p className="text-destructive text-xs">{errors.site_description.message}</p>
            )}
          </div>

          {/* Email de contacto */}
          <div className="space-y-1.5">
            <Label htmlFor="primary_contact_email">Email de contacto</Label>
            <Input
              id="primary_contact_email"
              type="email"
              {...register('primary_contact_email', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email inválido',
                },
              })}
              placeholder="contacto@miempresa.com"
            />
            {errors.primary_contact_email && (
              <p className="text-destructive text-xs">{errors.primary_contact_email.message}</p>
            )}
          </div>

          <Separator />

          {/* Logo */}
          <div className="space-y-1.5">
            <Label htmlFor="logo_url">Logo (URL)</Label>
            <Input
              id="logo_url"
              type="url"
              {...register('logo_url')}
              placeholder="https://cdn.ejemplo.com/logo.png"
            />
            {errors.logo_url && (
              <p className="text-destructive text-xs">{errors.logo_url.message}</p>
            )}
            {logoUrlValue && logoUrlValue.startsWith('http') && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrlValue}
                  alt="Preview logo"
                  className="h-12 max-w-[200px] rounded border object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <span className="text-muted-foreground text-xs">Preview</span>
              </div>
            )}
          </div>

          {/* Logo modo oscuro */}
          <div className="space-y-1.5">
            <Label htmlFor="logo_dark_url">Logo modo oscuro (URL)</Label>
            <Input
              id="logo_dark_url"
              type="url"
              {...register('logo_dark_url')}
              placeholder="https://cdn.ejemplo.com/logo-dark.png"
            />
            {errors.logo_dark_url && (
              <p className="text-destructive text-xs">{errors.logo_dark_url.message}</p>
            )}
          </div>

          {/* Favicon */}
          <div className="space-y-1.5">
            <Label htmlFor="favicon_url">Favicon (URL)</Label>
            <Input
              id="favicon_url"
              type="url"
              {...register('favicon_url')}
              placeholder="https://cdn.ejemplo.com/favicon.ico"
            />
            {errors.favicon_url && (
              <p className="text-destructive text-xs">{errors.favicon_url.message}</p>
            )}
            {faviconUrlValue && faviconUrlValue.startsWith('http') && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={faviconUrlValue}
                  alt="Preview favicon"
                  className="h-8 w-8 rounded border object-contain p-0.5"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <span className="text-muted-foreground text-xs">Preview</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Redes sociales */}
          <SocialLinksEditor value={socialLinks} onChange={setSocialLinks} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────
// Advanced Settings (Custom CSS / Scripts)
// ─────────────────────────────────────────────

interface AdvancedFormValues {
  custom_css: string
  custom_head_scripts: string
}

interface AdvancedSettingsProps {
  config: SiteConfig | null
}

export function AdvancedSettings({ config }: AdvancedSettingsProps) {
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit } = useForm<AdvancedFormValues>({
    defaultValues: {
      custom_css: config?.custom_css ?? '',
      custom_head_scripts: config?.custom_head_scripts ?? '',
    },
  })

  async function onSubmit(values: AdvancedFormValues) {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const err = (await response.json()) as { error?: string }
        throw new Error(err.error ?? 'Error al guardar')
      }

      toast.success('Código personalizado guardado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Código personalizado</CardTitle>
          <CardDescription>
            CSS y scripts que se añaden globalmente al sitio. Usar con precaución.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="custom_css">CSS personalizado</Label>
            <Textarea
              id="custom_css"
              {...register('custom_css')}
              placeholder="/* Escribe tu CSS aquí */"
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-muted-foreground text-xs">
              Se inyecta en un tag &lt;style&gt; en el &lt;head&gt; del sitio.
            </p>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="custom_head_scripts">Scripts en &lt;head&gt;</Label>
            <Textarea
              id="custom_head_scripts"
              {...register('custom_head_scripts')}
              placeholder="<!-- Scripts personalizados -->"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-muted-foreground text-xs">
              Se insertan al final del &lt;head&gt;. Incluye tags &lt;script&gt; completos.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar código
        </Button>
      </div>
    </form>
  )
}
