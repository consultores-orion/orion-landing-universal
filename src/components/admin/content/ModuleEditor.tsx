'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DynamicField } from './DynamicField'
import type { FieldDefinition } from './types'
import { resolveLabel } from './types'

interface Language {
  code: string
  name: string
  native_name: string
  is_default: boolean
}

export interface ModuleEditorProps {
  module: {
    id: string
    section_key: string
    content: Record<string, unknown>
    is_visible: boolean
  }
  schema: { fields: FieldDefinition[] }
  languages: Language[]
  sectionKey: string
}

export function ModuleEditor({ module, schema, languages, sectionKey }: ModuleEditorProps) {
  const [activeLanguage, setActiveLanguage] = useState<string>(
    languages.find((l) => l.is_default)?.code ?? languages[0]?.code ?? 'es',
  )
  const [formData, setFormData] = useState<Record<string, unknown>>(module.content)
  const [isSaving, setIsSaving] = useState(false)

  const fields = schema.fields ?? []

  // Separate multilingual fields from shared fields
  const multilingualFields = fields.filter((f) => f.isMultilingual)
  const sharedFields = fields.filter((f) => !f.isMultilingual)

  const getFieldValue = (field: FieldDefinition, lang: string): unknown => {
    if (field.isMultilingual) {
      const langData = formData[lang]
      if (typeof langData === 'object' && langData !== null) {
        return (langData as Record<string, unknown>)[field.key] ?? ''
      }
      return ''
    }
    return formData[field.key] ?? ''
  }

  const setFieldValue = (field: FieldDefinition, lang: string, value: unknown) => {
    if (field.isMultilingual) {
      setFormData((prev) => ({
        ...prev,
        [lang]: {
          ...(typeof prev[lang] === 'object' && prev[lang] !== null
            ? (prev[lang] as Record<string, unknown>)
            : {}),
          [field.key]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field.key]: value }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/content/${sectionKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formData }),
      })
      if (res.ok) {
        toast.success('Cambios guardados correctamente')
      } else {
        const body = await res.json().catch(() => ({}))
        toast.error((body as { error?: string }).error ?? 'Error al guardar los cambios')
      }
    } catch {
      toast.error('Error de conexión al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const hasMultipleLanguages = languages.length > 1

  return (
    <div className="flex flex-col gap-6">
      {/* Language tabs — only shown when there are multilingual fields and multiple languages */}
      {hasMultipleLanguages && multilingualFields.length > 0 && (
        <div className="border-border bg-muted/30 flex w-fit items-center gap-1 rounded-lg border p-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveLanguage(lang.code)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                activeLanguage === lang.code
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {lang.native_name}
            </button>
          ))}
        </div>
      )}

      {/* Multilingual fields — shown for the active language */}
      {multilingualFields.length > 0 && (
        <section className="space-y-4">
          {hasMultipleLanguages && (
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Contenido en{' '}
              {languages.find((l) => l.code === activeLanguage)?.native_name ?? activeLanguage}
            </h3>
          )}
          <div className="grid gap-4">
            {multilingualFields.map((field) => (
              <DynamicField
                key={`${field.key}-${activeLanguage}`}
                field={field}
                value={getFieldValue(field, activeLanguage)}
                onChange={(val) => setFieldValue(field, activeLanguage, val)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Shared (non-multilingual) fields */}
      {sharedFields.length > 0 && (
        <section className="space-y-4">
          {multilingualFields.length > 0 && (
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Configuración general
            </h3>
          )}
          <div className="grid gap-4">
            {sharedFields.map((field) => (
              <DynamicField
                key={field.key}
                field={field}
                value={getFieldValue(field, activeLanguage)}
                onChange={(val) => setFieldValue(field, activeLanguage, val)}
              />
            ))}
          </div>
        </section>
      )}

      {fields.length === 0 && (
        <p className="text-muted-foreground text-sm italic">
          Este módulo no tiene campos configurables.
        </p>
      )}

      {/* Sticky save bar */}
      <div className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 z-10 -mx-6 border-t px-6 py-4 backdrop-blur">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Re-export resolveLabel for convenience
export { resolveLabel }
