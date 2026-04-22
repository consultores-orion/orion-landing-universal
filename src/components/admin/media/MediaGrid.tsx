'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { LayoutGrid, List, Search, ImageOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { MediaDetail } from './MediaDetail'

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

interface MediaGridProps {
  initialData: { data: MediaItem[]; total: number }
  languages: Array<{ code: string; name: string }>
}

type SortOption = 'created_at' | 'file_name' | 'file_size'

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
  { value: 'all', label: 'Todas las carpetas' },
  { value: 'general', label: 'General' },
  { value: 'hero', label: 'Hero' },
  { value: 'team', label: 'Equipo' },
  { value: 'gallery', label: 'Galería' },
]

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'created_at', label: 'Más reciente' },
  { value: 'file_name', label: 'Nombre A-Z' },
  { value: 'file_size', label: 'Tamaño' },
]

// ─────────────────────────────────────────────
// Grid card
// ─────────────────────────────────────────────

function MediaCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  const [imgError, setImgError] = useState(false)
  const isImage = item.mime_type.startsWith('image/')

  return (
    <button
      type="button"
      onClick={onClick}
      className="group border-border bg-muted hover:border-primary/60 relative overflow-hidden rounded-lg border text-left transition-all hover:shadow-sm"
    >
      {/* Thumbnail */}
      <div className="bg-muted relative flex aspect-square w-full items-center justify-center">
        {isImage && !imgError ? (
          <Image
            src={item.public_url}
            alt={item.file_name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <ImageOff className="text-muted-foreground/50 size-8" />
        )}
      </div>

      {/* Caption */}
      <div className="p-1.5">
        <p className="truncate text-xs font-medium">{item.file_name}</p>
        <p className="text-muted-foreground text-xs">{formatFileSize(item.file_size)}</p>
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export function MediaGrid({ initialData, languages }: MediaGridProps) {
  const [items, setItems] = useState<MediaItem[]>(initialData.data)
  const [total, setTotal] = useState(initialData.total)
  const [folder, setFolder] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('created_at')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: '1',
      limit: '40',
      sort: sortBy,
    })
    if (folder !== 'all') params.set('folder', folder)
    if (search.trim() !== '') params.set('search', search.trim())

    try {
      const res = await fetch(`/api/media?${params.toString()}`)
      const json = (await res.json()) as { data?: MediaItem[]; total?: number }
      setItems(json.data ?? [])
      setTotal(json.total ?? 0)
    } catch {
      // keep previous data
    } finally {
      setLoading(false)
    }
  }, [folder, sortBy, search])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchMedia()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchMedia])

  function handleItemClick(item: MediaItem) {
    setSelectedItem(item)
    setDetailOpen(true)
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    setTotal((prev) => Math.max(0, prev - 1))
    setSelectedItem(null)
  }

  function handleUpdated(updated: MediaItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    setSelectedItem(updated)
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Folder filter */}
        <Select
          value={folder}
          onValueChange={(v) => {
            if (v !== null) setFolder(v)
          }}
        >
          <SelectTrigger className="h-8 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FOLDER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative min-w-40 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8"
          />
        </div>

        {/* Sort */}
        <Select
          value={sortBy}
          onValueChange={(v) => {
            if (v !== null) setSortBy(v as SortOption)
          }}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="border-border flex overflow-hidden rounded-lg border">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8 rounded-none border-0"
            onClick={() => setViewMode('grid')}
            aria-label="Vista cuadrícula"
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8 rounded-none border-0"
            onClick={() => setViewMode('list')}
            aria-label="Vista lista"
            aria-pressed={viewMode === 'list'}
          >
            <List className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Total count */}
      <p role="status" aria-live="polite" className="text-muted-foreground text-xs">
        {loading ? 'Cargando…' : `${total} archivo${total !== 1 ? 's' : ''}`}
      </p>

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <ImageOff className="text-muted-foreground mb-4 size-10" />
          <p className="text-muted-foreground text-sm">
            {search || folder !== 'all'
              ? 'No se encontraron archivos con los filtros actuales'
              : 'Aún no has subido ningún archivo'}
          </p>
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && items.length > 0 && (
        <div
          className={[
            'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
            loading ? 'pointer-events-none opacity-60' : '',
          ].join(' ')}
        >
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && items.length > 0 && (
        <div className={loading ? 'pointer-events-none opacity-60' : ''}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Vista</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Carpeta</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <MediaListRow key={item.id} item={item} onClick={() => handleItemClick(item)} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail sheet */}
      <MediaDetail
        item={selectedItem}
        languages={languages}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDeleted={handleDeleted}
        onUpdated={handleUpdated}
      />
    </>
  )
}

// ─────────────────────────────────────────────
// List row sub-component
// ─────────────────────────────────────────────

function MediaListRow({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  const [imgError, setImgError] = useState(false)
  const isImage = item.mime_type.startsWith('image/')

  return (
    <TableRow className="cursor-pointer" onClick={onClick}>
      {/* Thumbnail */}
      <TableCell>
        <div className="bg-muted border-border relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border">
          {isImage && !imgError ? (
            <Image
              src={item.public_url}
              alt={item.file_name}
              fill
              className="object-cover"
              sizes="40px"
              onError={() => setImgError(true)}
            />
          ) : (
            <ImageOff className="text-muted-foreground/50 size-4" />
          )}
        </div>
      </TableCell>

      {/* Name */}
      <TableCell>
        <p className="max-w-64 truncate text-sm font-medium">{item.file_name}</p>
        <p className="text-muted-foreground text-xs">{item.mime_type}</p>
      </TableCell>

      {/* Folder */}
      <TableCell>
        <span className="text-xs capitalize">{item.folder}</span>
      </TableCell>

      {/* Size */}
      <TableCell>
        <span className="text-xs">{formatFileSize(item.file_size)}</span>
      </TableCell>

      {/* Date */}
      <TableCell>
        <span className="text-muted-foreground text-xs">{formatDate(item.created_at)}</span>
      </TableCell>

      {/* Action */}
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          Ver
        </Button>
      </TableCell>
    </TableRow>
  )
}
