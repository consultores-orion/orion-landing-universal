'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Download, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface BackupPreview {
  version: string
  exported_at: string
  tables: string[]
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function BackupRestore() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<BackupPreview | null>(null)
  const [rawBackup, setRawBackup] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleExport() {
    window.location.href = '/api/settings/backup'
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.item(0)
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text !== 'string') return

      try {
        const parsed = JSON.parse(text) as Record<string, unknown>

        // Build preview
        const dataSection = parsed['data'] as Record<string, unknown> | undefined
        const tables = dataSection ? Object.keys(dataSection) : []

        setPreview({
          version: typeof parsed['version'] === 'string' ? parsed['version'] : 'desconocida',
          exported_at: typeof parsed['exported_at'] === 'string' ? parsed['exported_at'] : '',
          tables,
        })
        setRawBackup(text)
      } catch {
        toast.error('El archivo no es un backup válido')
        setPreview(null)
        setRawBackup(null)
        setFileName(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }

    reader.readAsText(file)
  }

  async function handleRestore() {
    if (!rawBackup) return

    setRestoring(true)
    try {
      const res = await fetch('/api/settings/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: rawBackup,
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Error al restaurar')
      }

      const json = (await res.json()) as {
        success: boolean
        restored: Record<string, number>
      }

      const summary = Object.entries(json.restored)
        .map(([table, count]) => `${table}: ${count}`)
        .join(', ')

      toast.success(`Backup restaurado correctamente. ${summary}`)
      setPreview(null)
      setRawBackup(null)
      setFileName(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al restaurar backup')
    } finally {
      setRestoring(false)
    }
  }

  function handleClearFile() {
    setPreview(null)
    setRawBackup(null)
    setFileName(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar backup</CardTitle>
          <CardDescription>
            Descarga toda la configuración del sitio en un archivo JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            El backup incluye: configuración del sitio, tema, módulos, idiomas, SEO, integraciones y
            paletas personalizadas. Las contraseñas SMTP se redactan por seguridad.
          </p>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar backup JSON
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle>Importar backup</CardTitle>
          <CardDescription>
            Restaura la configuración desde un archivo de backup exportado anteriormente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Atención:</strong> Esta acción reemplazará la configuración actual del sitio
              con los datos del backup.
            </AlertDescription>
          </Alert>

          {/* File input */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="backup-file-input"
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Seleccionar archivo
            </Button>
            {fileName && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{fileName}</Badge>
                <Button type="button" variant="ghost" size="sm" onClick={handleClearFile}>
                  Limpiar
                </Button>
              </div>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="space-y-3 pt-4">
                <p className="text-sm font-medium">Vista previa del backup</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Versión:</span>
                  <span>{preview.version}</span>
                  <span className="text-muted-foreground">Exportado el:</span>
                  <span>
                    {preview.exported_at ? new Date(preview.exported_at).toLocaleString('es') : '—'}
                  </span>
                  <span className="text-muted-foreground">Tablas incluidas:</span>
                  <div className="flex flex-wrap gap-1">
                    {preview.tables.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleRestore}
                  disabled={restoring}
                  variant="destructive"
                  className="mt-2 gap-2"
                >
                  {restoring && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirmar restauración
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
