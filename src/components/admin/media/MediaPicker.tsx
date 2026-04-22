'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ImageOff, FolderOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface MediaItem {
  id: string
  file_name: string
  public_url: string
  mime_type: string
  file_size: number
  alt_text: Record<string, string>
  folder: string
  width: number | null
  height: number | null
}

interface MediaPickerProps {
  value?: string
  onChange: (url: string) => void
  placeholder?: string
}

// ─────────────────────────────────────────────
// Mini grid item
// ─────────────────────────────────────────────

function PickerItem({
  item,
  selected,
  onSelect,
}: {
  item: MediaItem
  selected: boolean
  onSelect: () => void
}) {
  const [imgError, setImgError] = useState(false)
  const isImage = item.mime_type.startsWith('image/')

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Seleccionar imagen: ${item.file_name}${selected ? ' (seleccionada)' : ''}`}
      aria-pressed={selected}
      className={[
        'relative aspect-square overflow-hidden rounded-lg border-2 transition-all',
        selected
          ? 'border-primary ring-primary/30 ring-2'
          : 'border-border hover:border-primary/60',
      ].join(' ')}
    >
      <div className="bg-muted relative flex h-full w-full items-center justify-center">
        {isImage && !imgError ? (
          <Image
            src={item.public_url}
            alt={item.file_name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 25vw, 80px"
            onError={() => setImgError(true)}
          />
        ) : (
          <ImageOff className="text-muted-foreground/50 size-5" />
        )}
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export function MediaPicker({
  value,
  onChange,
  placeholder = 'Sin imagen seleccionada',
}: MediaPickerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/media?limit=40&sort=created_at')
      const json = (await res.json()) as { data?: MediaItem[] }
      setItems(json.data ?? [])
    } catch {
      // keep empty
    } finally {
      setLoading(false)
    }
  }

  // Fetch when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      setSelectedUrl(value ?? null)
      void fetchItems()
    }
  }, [dialogOpen, value])

  function handleConfirm() {
    if (selectedUrl !== null) {
      onChange(selectedUrl)
    }
    setDialogOpen(false)
  }

  function handleClear() {
    onChange('')
  }

  return (
    <>
      <div className="flex gap-2">
        <Input
          readOnly
          value={value ?? ''}
          placeholder={placeholder}
          className="h-9 flex-1 font-mono text-xs"
        />
        {value && value !== '' && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={handleClear}
            title="Limpiar imagen"
          >
            <X className="size-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0"
          onClick={() => setDialogOpen(true)}
        >
          <FolderOpen className="mr-1.5 size-4" />
          Seleccionar
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seleccionar imagen</DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-sm">Cargando archivos…</p>
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <ImageOff className="text-muted-foreground size-8" />
                <p className="text-muted-foreground text-sm">No hay imágenes en la biblioteca</p>
              </div>
            )}

            {!loading && items.length > 0 && (
              <div className="grid grid-cols-4 gap-2 p-1 sm:grid-cols-6">
                {items.map((item) => (
                  <PickerItem
                    key={item.id}
                    item={item}
                    selected={selectedUrl === item.public_url}
                    onSelect={() => setSelectedUrl(item.public_url)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-border mt-2 flex items-center justify-between border-t pt-3">
            <p className="text-muted-foreground max-w-xs truncate text-xs">
              {selectedUrl ?? 'Ninguna imagen seleccionada'}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button size="sm" disabled={selectedUrl === null} onClick={handleConfirm}>
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
