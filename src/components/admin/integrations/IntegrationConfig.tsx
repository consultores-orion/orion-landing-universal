'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { Integration } from './IntegrationCard'

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface IntegrationConfigProps {
  integration: Integration | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, config: Record<string, unknown>) => Promise<void>
}

// ─────────────────────────────────────────────────────────────
// Form value types per integration
// ─────────────────────────────────────────────────────────────

interface GA4Values {
  measurement_id: string
}

interface GTMValues {
  container_id: string
}

interface MetaPixelValues {
  pixel_id: string
}

interface WhatsAppValues {
  phone_number: string
  message: string
  position: 'left' | 'right'
}

interface CalendlyValues {
  url: string
  button_text: string
}

interface SMTPValues {
  host: string
  port: string
  username: string
  password: string
  from_email: string
  from_name: string
}

interface CustomScriptsValues {
  head_scripts: string
  body_scripts: string
}

// ─────────────────────────────────────────────────────────────
// Sub-forms
// ─────────────────────────────────────────────────────────────

function GA4Form({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: GA4Values
  onSubmit: (v: GA4Values) => void
  isSubmitting: boolean
}) {
  const { register, handleSubmit } = useForm<GA4Values>({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="measurement_id">Measurement ID</Label>
        <Input id="measurement_id" placeholder="G-XXXXXXXXXX" {...register('measurement_id')} />
        <p className="text-muted-foreground text-xs">
          Encuéntralo en Google Analytics → Admin → Flujo de datos.
        </p>
      </div>
      <FormFooter isSubmitting={isSubmitting} />
    </form>
  )
}

function GTMForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: GTMValues
  onSubmit: (v: GTMValues) => void
  isSubmitting: boolean
}) {
  const { register, handleSubmit } = useForm<GTMValues>({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="container_id">Container ID</Label>
        <Input id="container_id" placeholder="GTM-XXXXXXX" {...register('container_id')} />
        <p className="text-muted-foreground text-xs">
          Encuéntralo en Google Tag Manager → tu contenedor.
        </p>
      </div>
      <FormFooter isSubmitting={isSubmitting} />
    </form>
  )
}

function MetaPixelForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: MetaPixelValues
  onSubmit: (v: MetaPixelValues) => void
  isSubmitting: boolean
}) {
  const { register, handleSubmit } = useForm<MetaPixelValues>({
    defaultValues,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pixel_id">Pixel ID</Label>
        <Input id="pixel_id" placeholder="1234567890123456" {...register('pixel_id')} />
        <p className="text-muted-foreground text-xs">
          Encuéntralo en Meta Business Suite → Eventos → Píxeles.
        </p>
      </div>
      <FormFooter isSubmitting={isSubmitting} />
    </form>
  )
}

function WhatsAppForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: WhatsAppValues
  onSubmit: (v: WhatsAppValues) => void
  isSubmitting: boolean
}) {
  const { register, handleSubmit, watch, setValue } = useForm<WhatsAppValues>({
    defaultValues,
  })
  const position = watch('position')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone_number">Número de teléfono</Label>
        <Input id="phone_number" placeholder="+521234567890" {...register('phone_number')} />
        <p className="text-muted-foreground text-xs">
          Incluye código de país sin espacios (ej: +521234567890).
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Mensaje predefinido</Label>
        <Input
          id="message"
          placeholder="Hola, me gustaría obtener más información."
          {...register('message')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">Posición del botón</Label>
        <Select value={position} onValueChange={(v) => setValue('position', v as 'left' | 'right')}>
          <SelectTrigger id="position">
            <SelectValue placeholder="Seleccionar posición" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Izquierda</SelectItem>
            <SelectItem value="right">Derecha</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <FormFooter isSubmitting={isSubmitting} />
    </form>
  )
}

function CalendlyForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: CalendlyValues
  onSubmit: (v: CalendlyValues) => void
  isSubmitting: boolean
}) {
  const { register, handleSubmit } = useForm<CalendlyValues>({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">URL de Calendly</Label>
        <Input id="url" placeholder="https://calendly.com/tu-usuario/30min" {...register('url')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="button_text">Texto del botón</Label>
        <Input id="button_text" placeholder="Agendar cita" {...register('button_text')} />
      </div>
      <FormFooter isSubmitting={isSubmitting} />
    </form>
  )
}

function SMTPForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: SMTPValues
  onSubmit: (v: SMTPValues) => void
  isSubmitting: boolean
}) {
  const { register, handleSubmit } = useForm<SMTPValues>({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="host">Host SMTP</Label>
          <Input id="host" placeholder="smtp.gmail.com" {...register('host')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Puerto</Label>
          <Input id="port" type="number" placeholder="587" {...register('port')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input id="username" placeholder="correo@dominio.com" {...register('username')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Dejar vacío para mantener la actual"
          {...register('password')}
        />
        <p className="text-muted-foreground text-xs">
          Si dejas este campo vacío, la contraseña actual no se modificará.
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="from_email">Email remitente</Label>
          <Input id="from_email" placeholder="noreply@dominio.com" {...register('from_email')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="from_name">Nombre remitente</Label>
          <Input id="from_name" placeholder="Mi Empresa" {...register('from_name')} />
        </div>
      </div>
      <FormFooter isSubmitting={isSubmitting} />
    </form>
  )
}

function CustomScriptsForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: CustomScriptsValues
  onSubmit: (v: CustomScriptsValues) => void
  isSubmitting: boolean
}) {
  const { register, handleSubmit } = useForm<CustomScriptsValues>({
    defaultValues,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="head_scripts">Scripts en &lt;head&gt;</Label>
        <Textarea
          id="head_scripts"
          placeholder={'<!-- Ej: Google Fonts, scripts de analytics -->\n<script>...</script>'}
          rows={6}
          className="font-mono text-sm"
          {...register('head_scripts')}
        />
        <p className="text-muted-foreground text-xs">
          Se inyecta dentro de la etiqueta &lt;head&gt;.
        </p>
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="body_scripts">Scripts en &lt;body&gt;</Label>
        <Textarea
          id="body_scripts"
          placeholder={'<!-- Ej: chat widgets, noscript tags -->\n<script>...</script>'}
          rows={6}
          className="font-mono text-sm"
          {...register('body_scripts')}
        />
        <p className="text-muted-foreground text-xs">Se inyecta al inicio del &lt;body&gt;.</p>
      </div>
      <FormFooter isSubmitting={isSubmitting} />
    </form>
  )
}

// ─────────────────────────────────────────────────────────────
// Shared footer
// ─────────────────────────────────────────────────────────────

function FormFooter({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar cambios
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Helpers to extract typed defaults from Integration config
// ─────────────────────────────────────────────────────────────

function getString(c: Record<string, unknown>, key: string): string {
  const v = c[key]
  return typeof v === 'string' ? v : ''
}

function getNumber(c: Record<string, unknown>, key: string): string {
  const v = c[key]
  return typeof v === 'number' ? String(v) : ''
}

// ─────────────────────────────────────────────────────────────
// Main dialog component
// ─────────────────────────────────────────────────────────────

// Title map
const TITLES: Record<string, string> = {
  ga4: 'Configurar Google Analytics 4',
  gtm: 'Configurar Google Tag Manager',
  meta_pixel: 'Configurar Meta Pixel',
  whatsapp: 'Configurar WhatsApp',
  calendly: 'Configurar Calendly',
  smtp: 'Configurar SMTP',
  custom_scripts: 'Configurar Scripts Personalizados',
}

export function IntegrationConfig({
  integration,
  open,
  onOpenChange,
  onSave,
}: IntegrationConfigProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // formKey forces sub-form re-mount (and thus reset) when integration changes
  const formKey = integration?.id ?? 'none'

  async function handleSave(config: Record<string, unknown>) {
    if (!integration) return
    setIsSubmitting(true)
    try {
      await onSave(integration.id, config)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = integration ? (TITLES[integration.type] ?? 'Configurar integración') : ''
  const c = integration?.config ?? {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Los cambios se aplican de inmediato en la landing page.
          </DialogDescription>
        </DialogHeader>

        {integration?.type === 'ga4' && (
          <GA4Form
            key={formKey}
            defaultValues={{ measurement_id: getString(c, 'measurement_id') }}
            onSubmit={(v) => handleSave({ measurement_id: v.measurement_id })}
            isSubmitting={isSubmitting}
          />
        )}

        {integration?.type === 'gtm' && (
          <GTMForm
            key={formKey}
            defaultValues={{ container_id: getString(c, 'container_id') }}
            onSubmit={(v) => handleSave({ container_id: v.container_id })}
            isSubmitting={isSubmitting}
          />
        )}

        {integration?.type === 'meta_pixel' && (
          <MetaPixelForm
            key={formKey}
            defaultValues={{ pixel_id: getString(c, 'pixel_id') }}
            onSubmit={(v) => handleSave({ pixel_id: v.pixel_id })}
            isSubmitting={isSubmitting}
          />
        )}

        {integration?.type === 'whatsapp' && (
          <WhatsAppForm
            key={formKey}
            defaultValues={{
              phone_number: getString(c, 'phone_number'),
              message: getString(c, 'message'),
              position:
                c['position'] === 'left' || c['position'] === 'right' ? c['position'] : 'right',
            }}
            onSubmit={(v) =>
              handleSave({
                phone_number: v.phone_number,
                message: v.message,
                position: v.position,
              })
            }
            isSubmitting={isSubmitting}
          />
        )}

        {integration?.type === 'calendly' && (
          <CalendlyForm
            key={formKey}
            defaultValues={{
              url: getString(c, 'url'),
              button_text: getString(c, 'button_text') || 'Agendar cita',
            }}
            onSubmit={(v) => handleSave({ url: v.url, button_text: v.button_text })}
            isSubmitting={isSubmitting}
          />
        )}

        {integration?.type === 'smtp' && (
          <SMTPForm
            key={formKey}
            defaultValues={{
              host: getString(c, 'host'),
              port: getNumber(c, 'port') || '587',
              username: getString(c, 'username'),
              password: '',
              from_email: getString(c, 'from_email'),
              from_name: getString(c, 'from_name'),
            }}
            onSubmit={(v) => {
              const config: Record<string, unknown> = {
                host: v.host,
                port: parseInt(v.port, 10) || 587,
                username: v.username,
                from_email: v.from_email,
                from_name: v.from_name,
              }
              // Only include password if the user typed something
              if (v.password !== '') {
                config['password'] = v.password
              } else {
                // Preserve existing redacted/real password
                config['password'] = c['password'] ?? ''
              }
              return handleSave(config)
            }}
            isSubmitting={isSubmitting}
          />
        )}

        {integration?.type === 'custom_scripts' && (
          <CustomScriptsForm
            key={formKey}
            defaultValues={{
              head_scripts: getString(c, 'head_scripts'),
              body_scripts: getString(c, 'body_scripts'),
            }}
            onSubmit={(v) =>
              handleSave({
                head_scripts: v.head_scripts,
                body_scripts: v.body_scripts,
              })
            }
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
