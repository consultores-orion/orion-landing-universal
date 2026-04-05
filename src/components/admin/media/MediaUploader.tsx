'use client'

import { useState, useRef } from 'react'
import { Upload, ChevronDown, ChevronUp, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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

type FileStatus = 'pending' | 'uploading' | 'success' | 'error'

interface FileEntry {
  id: string
  file: File
  status: FileStatus
  progress: number
  errorMessage?: string
}

interface MediaUploaderProps {
  onUploadComplete: () => void
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

export function MediaUploader({ onUploadComplete }: MediaUploaderProps) {
  const [expanded, setExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [folder, setFolder] = useState('general')
  const [files, setFiles] = useState<FileEntry[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFiles(incoming: File[]) {
    const valid = incoming
      .filter((f) => {
        if (!ALLOWED_MIME_TYPES.includes(f.type)) {
          toast.error(`Tipo no permitido: ${f.name}`)
          return false
        }
        if (f.size > MAX_FILE_SIZE) {
          toast.error(`Demasiado grande (>5MB): ${f.name}`)
          return false
        }
        return true
      })
      .slice(0, 10) // max 10

    if (valid.length === 0) return

    const entries: FileEntry[] = valid.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      status: 'pending',
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...entries])
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  function clearCompleted() {
    setFiles((prev) => prev.filter((f) => f.status === 'pending' || f.status === 'uploading'))
  }

  async function uploadFile(entry: FileEntry, targetFolder: string): Promise<void> {
    const formData = new FormData()
    formData.append('file', entry.file)
    formData.append('folder', targetFolder)

    // Mark as uploading
    setFiles((prev) =>
      prev.map((f) => (f.id === entry.id ? { ...f, status: 'uploading', progress: 30 } : f)),
    )

    const res = await fetch('/api/media', { method: 'POST', body: formData })

    if (!res.ok) {
      const err = (await res.json()) as { error?: string }
      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id
            ? { ...f, status: 'error', progress: 0, errorMessage: err.error ?? 'Error al subir' }
            : f,
        ),
      )
      throw new Error(err.error ?? 'Upload failed')
    }

    setFiles((prev) =>
      prev.map((f) => (f.id === entry.id ? { ...f, status: 'success', progress: 100 } : f)),
    )
  }

  async function handleUploadAll() {
    const pending = files.filter((f) => f.status === 'pending')
    if (pending.length === 0) {
      toast.error('No hay archivos pendientes')
      return
    }

    setUploading(true)
    let successCount = 0
    let errorCount = 0

    for (const entry of pending) {
      try {
        await uploadFile(entry, folder)
        successCount++
      } catch {
        errorCount++
      }
    }

    setUploading(false)

    if (successCount > 0) {
      toast.success(
        `${successCount} archivo${successCount > 1 ? 's' : ''} subido${successCount > 1 ? 's' : ''} correctamente`,
      )
      onUploadComplete()
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} archivo${errorCount > 1 ? 's fallaron' : ' falló'}`)
    }
  }

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const hasCompleted = files.some((f) => f.status === 'success' || f.status === 'error')

  return (
    <div className="border-border bg-card rounded-xl border">
      {/* Header / Toggle */}
      <button
        type="button"
        className="hover:bg-muted/50 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Upload className="text-muted-foreground size-4" />
          <span>Subir archivos</span>
          {pendingCount > 0 && (
            <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 py-0.5 text-xs leading-none">
              {pendingCount}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="text-muted-foreground size-4" />
        ) : (
          <ChevronDown className="text-muted-foreground size-4" />
        )}
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="border-border space-y-4 border-t px-4 pt-4 pb-4">
          {/* Folder selector */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground shrink-0 text-xs">Carpeta destino:</span>
            <Select
              value={folder}
              onValueChange={(v) => {
                if (v !== null) setFolder(v)
              }}
            >
              <SelectTrigger className="h-8 w-40">
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
          </div>

          {/* Drop zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={[
              'relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30',
            ].join(' ')}
          >
            <Upload className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-center text-sm">
              <span className="text-foreground font-medium">Haz clic</span> o arrastra archivos aquí
            </p>
            <p className="text-muted-foreground text-xs">
              JPG, PNG, WebP, GIF, SVG, ICO · máx. 5 MB · hasta 10 archivos
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_MIME_TYPES.join(',')}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(Array.from(e.target.files))
                e.target.value = ''
              }}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">
                  Archivos ({files.length})
                </span>
                {hasCompleted && (
                  <button
                    type="button"
                    onClick={clearCompleted}
                    className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                  >
                    Limpiar completados
                  </button>
                )}
              </div>

              <div className="max-h-48 space-y-1.5 overflow-y-auto">
                {files.map((entry) => (
                  <FileRow key={entry.id} entry={entry} onRemove={removeFile} />
                ))}
              </div>
            </div>
          )}

          {/* Upload button */}
          {pendingCount > 0 && (
            <Button className="w-full" onClick={handleUploadAll} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Subiendo…
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Subir {pendingCount} archivo{pendingCount > 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// File row sub-component
// ─────────────────────────────────────────────

function FileRow({ entry, onRemove }: { entry: FileEntry; onRemove: (id: string) => void }) {
  return (
    <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
      {/* Status icon */}
      <div className="shrink-0">
        {entry.status === 'pending' && (
          <div className="border-muted-foreground size-4 rounded-full border-2" />
        )}
        {entry.status === 'uploading' && <Loader2 className="text-primary size-4 animate-spin" />}
        {entry.status === 'success' && <CheckCircle2 className="size-4 text-green-500" />}
        {entry.status === 'error' && <AlertCircle className="text-destructive size-4" />}
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{entry.file.name}</p>
        {entry.status === 'error' && entry.errorMessage ? (
          <p className="text-destructive truncate text-xs">{entry.errorMessage}</p>
        ) : (
          <p className="text-muted-foreground text-xs">{formatFileSize(entry.file.size)}</p>
        )}
        {entry.status === 'uploading' && <Progress value={entry.progress} className="mt-1 h-1" />}
      </div>

      {/* Remove button — only for pending / error */}
      {(entry.status === 'pending' || entry.status === 'error') && (
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
          title="Quitar"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
