'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Download, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─────────────────────────────────────────────
// ThemeExportImport
// Buttons to export/import the full theme (palette + typography + spacing)
// ─────────────────────────────────────────────

interface ThemeExportImportProps {
  /** Called after a successful import so the parent can reflect changes */
  onImportSuccess: () => void
}

export function ThemeExportImport({ onImportSuccess }: ThemeExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // ── Export ─────────────────────────────────

  async function handleExport() {
    setIsExporting(true)
    try {
      const res = await fetch('/api/design/theme/export')
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(json?.error ?? 'Error al exportar el tema')
      }

      const blob = await res.blob()
      const contentDisposition = res.headers.get('Content-Disposition') ?? ''
      const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition)
      const filename = filenameMatch?.[1] ?? 'orion-theme.json'

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)

      toast.success('Tema exportado correctamente')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al exportar'
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }

  // ── Import ─────────────────────────────────

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset so the same file can be re-selected
    e.target.value = ''

    setIsImporting(true)
    try {
      const text = await file.text()
      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        throw new Error('El archivo no es un JSON válido')
      }

      const res = await fetch('/api/design/theme/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(json?.error ?? 'Error al importar el tema')
      }

      toast.success('Tema importado y aplicado correctamente')
      onImportSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al importar'
      toast.error(message)
    } finally {
      setIsImporting(false)
    }
  }

  // ── Render ─────────────────────────────────

  return (
    <div className="flex items-center gap-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting || isImporting}
      >
        {isExporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isExporting ? 'Exportando...' : 'Exportar tema completo'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        disabled={isExporting || isImporting}
      >
        {isImporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isImporting ? 'Importando...' : 'Importar tema completo'}
      </Button>
    </div>
  )
}
