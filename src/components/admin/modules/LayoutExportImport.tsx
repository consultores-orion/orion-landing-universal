'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Download, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─────────────────────────────────────────────
// LayoutExportImport
// Buttons to export/import the modules layout (order + visibility)
// ─────────────────────────────────────────────

export function LayoutExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const router = useRouter()

  // ── Export ─────────────────────────────────

  async function handleExport() {
    setIsExporting(true)
    try {
      const res = await fetch('/api/modules/export')
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(json?.error ?? 'Error al exportar el layout')
      }

      const blob = await res.blob()
      const contentDisposition = res.headers.get('Content-Disposition') ?? ''
      const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition)
      const filename = filenameMatch?.[1] ?? 'orion-layout.json'

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)

      toast.success('Layout exportado correctamente')
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

      const res = await fetch('/api/modules/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(json?.error ?? 'Error al importar el layout')
      }

      const result = (await res.json()) as { updated?: number; skipped?: number }
      toast.success(
        `Layout importado: ${result.updated ?? 0} módulos actualizados${result.skipped ? `, ${result.skipped} ignorados` : ''}`,
      )

      // Refresh the page to reflect the new order/visibility
      router.refresh()
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
        {isExporting ? 'Exportando...' : 'Exportar layout'}
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
        {isImporting ? 'Importando...' : 'Importar layout'}
      </Button>
    </div>
  )
}
