'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Copy, Check, Trash2, Save, ImageOff } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface MediaItem {
  id: string
  file_name: string
  file_path: string
  public_url: string
  mime_type: string
  file_size: number
  alt_text: Record<string, string>
  folder: string
  width: number | null
  height: number | null
  uploaded_by: string | null
  created_at: string
}

interface MediaDetailProps {
  item: MediaItem | null
  languages: Array<{ code: string; name: string }>
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (id: string) => void
  onUpdated: (updated: MediaItem) => void
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const FOLDER_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'hero', label: 'Hero' },
  { value: 'team', label: 'Equipo' },
  { value: 'gallery', label: 'Galería' },
]

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function MediaDetail({
  item,
  languages,
  open,
  onOpenChange,
  onDeleted,
  onUpdated,
}: MediaDetailProps) {
  const [altText, setAltText] = useState<Record<string, string>>({})
  const [folder, setFolder] = useState<string>('general')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Sync local state when item changes
  const currentId = item?.id
  if (item && item.id !== currentId) {
    setAltText(item.alt_text ?? {})
    setFolder(item.folder ?? 'general')
    setImgError(false)
  }

  // Initialize on first render or when item changes
  // We use a simple approach: track the last synced item id
  const [syncedId, setSyncedId] = useState<string | null>(null)
  if (item && item.id !== syncedId) {
    setAltText(item.alt_text ?? {})
    setFolder(item.folder ?? 'general')
    setImgError(false)
    setSyncedId(item.id)
  }

  const isImage = item !== null && item.mime_type.startsWith('image/') === true

  async function handleSave() {
    if (!item) return
    setSaving(true)
    try {
      const res = await fetch(`/api/media/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt_text: altText, folder }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        toast.error(err.error ?? 'Error al guardar cambios')
        return
      }
      const json = (await res.json()) as { data: MediaItem }
      onUpdated(json.data)
      toast.success('Cambios guardados')
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!item) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/media/${item.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        toast.error(err.error ?? 'Error al eliminar')
        return
      }
      onDeleted(item.id)
      setConfirmDeleteOpen(false)
      onOpenChange(false)
      toast.success('Archivo eliminado')
    } catch {
      toast.error('Error de conexión')
    } finally {
      setDeleting(false)
    }
  }

  async function handleCopyUrl() {
    if (!item) return
    try {
      await navigator.clipboard.writeText(item.public_url)
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar la URL')
    }
  }

  if (!item) return null

  const activeLangs = languages.length > 0 ? languages : [{ code: 'es', name: 'Español' }]
  const firstLang = activeLangs[0]

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[420px] overflow-y-auto p-0 sm:max-w-[420px]">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="truncate pr-8 text-base">{item.file_name}</SheetTitle>
          </SheetHeader>

          <div className="space-y-5 p-4">
            {/* Image preview */}
            <div className="bg-muted border-border relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border">
              {isImage && !imgError ? (
                <Image
                  src={item.public_url}
                  alt={altText['es'] ?? altText[firstLang?.code ?? 'es'] ?? item.file_name}
                  fill
                  className="object-contain"
                  onError={() => setImgError(true)}
                  sizes="420px"
                />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                  <ImageOff className="size-10" />
                  <span className="text-xs">{item.mime_type}</span>
                </div>
              )}
            </div>

            {/* URL + copy */}
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">URL pública</Label>
              <div className="flex gap-2">
                <Input readOnly value={item.public_url} className="h-8 font-mono text-xs" />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0"
                  onClick={handleCopyUrl}
                  title="Copiar URL"
                >
                  {urlCopied ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Metadata row */}
            <div className="text-muted-foreground grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-foreground font-medium">Tamaño</p>
                <p>{formatFileSize(item.file_size)}</p>
              </div>
              <div>
                <p className="text-foreground font-medium">Dimensiones</p>
                <p>
                  {item.width !== null && item.height !== null
                    ? `${item.width}×${item.height}px`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-foreground font-medium">Subido</p>
                <p>{formatDate(item.created_at)}</p>
              </div>
            </div>

            {/* Alt text tabs */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Texto alternativo (alt)</Label>
              {activeLangs.length === 1 ? (
                <Input
                  placeholder={`Alt text en ${activeLangs[0]?.name ?? 'idioma'}`}
                  value={altText[activeLangs[0]?.code ?? 'es'] ?? ''}
                  onChange={(e) =>
                    setAltText((prev) => ({
                      ...prev,
                      [activeLangs[0]?.code ?? 'es']: e.target.value,
                    }))
                  }
                />
              ) : (
                <Tabs defaultValue={firstLang?.code ?? 'es'}>
                  <TabsList>
                    {activeLangs.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code}>
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {activeLangs.map((lang) => (
                    <TabsContent key={lang.code} value={lang.code} className="mt-2">
                      <Input
                        placeholder={`Alt text en ${lang.name}`}
                        value={altText[lang.code] ?? ''}
                        onChange={(e) =>
                          setAltText((prev) => ({
                            ...prev,
                            [lang.code]: e.target.value,
                          }))
                        }
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>

            {/* Folder */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Carpeta</Label>
              <Select
                value={folder}
                onValueChange={(v) => {
                  if (v !== null) setFolder(v)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar carpeta" />
                </SelectTrigger>
                <SelectContent>
                  {FOLDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                <Save className="mr-1.5 size-4" />
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setConfirmDeleteOpen(true)}
                title="Eliminar archivo"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar archivo</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            ¿Estás seguro de que deseas eliminar{' '}
            <span className="text-foreground font-medium">{item.file_name}</span>? Esta acción no se
            puede deshacer.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando…' : 'Sí, eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
