'use client'

import { useState } from 'react'
import { Trash2, Check, Loader2, Plus, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAdminStore } from '@/stores/admin-store'
import { TranslationStatus } from './TranslationStatus'
import { AddLanguageDialog, type Language } from './AddLanguageDialog'

export type { Language }

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface LanguageListProps {
  languages: Language[]
  translationProgress: Record<string, number>
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function LanguageList({
  languages: initialLanguages,
  translationProgress,
}: LanguageListProps) {
  const setActiveLanguagesCount = useAdminStore((s) => s.setActiveLanguagesCount)

  const [languages, setLanguages] = useState<Language[]>(initialLanguages)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeletingCode, setIsDeletingCode] = useState<string | null>(null)
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null)
  const [deleteConfirmCode, setDeleteConfirmCode] = useState<string | null>(null)

  // ── Set as default ───────────────────────────────────────────

  async function handleSetDefault(code: string) {
    setIsSettingDefault(code)
    try {
      const response = await fetch(`/api/i18n/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      })

      if (!response.ok) {
        const err = (await response.json()) as { error?: string }
        toast.error(err.error ?? 'Error al cambiar el idioma predeterminado')
        return
      }

      setLanguages((prev) =>
        prev.map((lang) => ({
          ...lang,
          is_default: lang.code === code,
        })),
      )

      setActiveLanguagesCount(languages.filter((l) => l.is_active).length)

      toast.success('Idioma predeterminado actualizado')
    } catch {
      toast.error('Error de conexión')
    } finally {
      setIsSettingDefault(null)
    }
  }

  // ── Delete language ──────────────────────────────────────────

  async function handleDelete(code: string) {
    setIsDeletingCode(code)
    setDeleteConfirmCode(null)
    try {
      const response = await fetch(`/api/i18n/${code}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const err = (await response.json()) as { error?: string }
        toast.error(err.error ?? 'Error al eliminar el idioma')
        return
      }

      const updated = languages.filter((l) => l.code !== code)
      setLanguages(updated)
      setActiveLanguagesCount(updated.filter((l) => l.is_active).length)
      toast.success('Idioma eliminado')
    } catch {
      toast.error('Error de conexión')
    } finally {
      setIsDeletingCode(null)
    }
  }

  // ── Language added callback ──────────────────────────────────

  function handleLanguageAdded(newLang: Language) {
    const updated = [...languages, newLang]
    setLanguages(updated)
    setActiveLanguagesCount(updated.filter((l) => l.is_active).length)
  }

  // ── Render ───────────────────────────────────────────────────

  const langToDelete = deleteConfirmCode
    ? languages.find((l) => l.code === deleteConfirmCode)
    : null

  return (
    <>
      {/* Language cards */}
      <div className="space-y-3">
        {languages.length === 0 ? (
          <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Globe className="text-muted-foreground mb-3 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              No hay idiomas configurados. Agrega el primero.
            </p>
          </div>
        ) : (
          languages.map((lang) => (
            <div
              key={lang.code}
              className="border-border bg-card flex flex-col gap-3 rounded-lg border px-4 py-4 shadow-sm sm:flex-row sm:items-center"
            >
              {/* Flag + name + code */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {lang.flag_emoji}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground font-medium">{lang.native_name}</span>
                    <span className="text-muted-foreground text-xs uppercase">({lang.code})</span>
                    {lang.is_default && (
                      <Badge variant="default" className="text-xs">
                        Predeterminado
                      </Badge>
                    )}
                    {!lang.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  {/* Translation progress */}
                  <div className="mt-2 w-full max-w-xs">
                    <p className="text-muted-foreground mb-1 text-xs">Traducción</p>
                    <TranslationStatus progress={translationProgress[lang.code] ?? 0} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                {/* Set as default */}
                {!lang.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(lang.code)}
                    disabled={isSettingDefault !== null || isDeletingCode !== null}
                    className="text-xs"
                  >
                    {isSettingDefault === lang.code ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Establecer como predeterminado
                  </Button>
                )}

                {/* Delete */}
                {!lang.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmCode(lang.code)}
                    disabled={isDeletingCode !== null || isSettingDefault !== null}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label={`Eliminar idioma ${lang.native_name}`}
                  >
                    {isDeletingCode === lang.code ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add language button */}
      <div className="mt-6">
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Idioma
        </Button>
      </div>

      {/* Add language dialog */}
      <AddLanguageDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        existingCodes={languages.map((l) => l.code)}
        onLanguageAdded={handleLanguageAdded}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmCode !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmCode(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar idioma</DialogTitle>
            <DialogDescription>
              {langToDelete ? (
                <>
                  ¿Confirmas que deseas eliminar{' '}
                  <strong>
                    {langToDelete.flag_emoji} {langToDelete.native_name}
                  </strong>
                  ? El contenido traducido a este idioma no se eliminará automáticamente de los
                  módulos.
                </>
              ) : (
                '¿Confirmas que deseas eliminar este idioma?'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmCode(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirmCode) handleDelete(deleteConfirmCode)
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
