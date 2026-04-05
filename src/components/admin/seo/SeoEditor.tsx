'use client'

import { useState } from 'react'
import { Save, Loader2, Image } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { SerpPreview } from './SerpPreview'
import { SocialPreview } from './SocialPreview'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface SeoConfigRow {
  id: string
  page_key: string
  meta_title: Record<string, string>
  meta_description: Record<string, string>
  og_image_url: string
  canonical_url: string
  robots: string
  structured_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SeoEditorProps {
  /** Full seo_config row, or null if no row exists yet */
  seoConfig: SeoConfigRow | null
  /** Language code being edited (e.g. "es", "en") */
  languageCode: string
  /** Human-readable language name */
  languageName: string
}

type RobotsValue = 'index,follow' | 'noindex,follow' | 'noindex,nofollow'

const ROBOTS_OPTIONS: Array<{ value: RobotsValue; label: string }> = [
  { value: 'index,follow', label: 'Indexar y seguir enlaces (recomendado)' },
  { value: 'noindex,follow', label: 'No indexar, seguir enlaces' },
  { value: 'noindex,nofollow', label: 'No indexar, no seguir enlaces' },
]

// ─────────────────────────────────────────────
// Character counter helper
// ─────────────────────────────────────────────

function CharCounter({ value, max }: { value: string; max: number }) {
  const count = value.length
  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        count > max ? 'text-destructive font-medium' : 'text-muted-foreground',
      )}
    >
      {count}/{max} caracteres
    </span>
  )
}

// ─────────────────────────────────────────────
// SeoEditor
// ─────────────────────────────────────────────

export function SeoEditor({ seoConfig, languageCode, languageName }: SeoEditorProps) {
  // Per-language fields extracted from JSONB
  const [metaTitle, setMetaTitle] = useState(seoConfig?.meta_title?.[languageCode] ?? '')
  const [metaDescription, setMetaDescription] = useState(
    seoConfig?.meta_description?.[languageCode] ?? '',
  )

  // Shared fields (same for all languages)
  const [ogImageUrl, setOgImageUrl] = useState(seoConfig?.og_image_url ?? '')
  const [canonicalUrl, setCanonicalUrl] = useState(seoConfig?.canonical_url ?? '')
  const [robots, setRobots] = useState<RobotsValue>(
    (seoConfig?.robots as RobotsValue) ?? 'index,follow',
  )
  const [jsonLd, setJsonLd] = useState(
    seoConfig?.structured_data ? JSON.stringify(seoConfig.structured_data, null, 2) : '',
  )

  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/seo/${languageCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_title: metaTitle,
          meta_description: metaDescription,
          og_image_url: ogImageUrl,
          canonical_url: canonicalUrl,
          robots,
          json_ld: jsonLd,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Error desconocido')
      }

      toast.success('SEO actualizado', {
        description: `Configuración guardada para ${languageName}`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar'
      toast.error('Error al guardar', { description: message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* ── Meta Title ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="meta-title">Meta Título</Label>
          <CharCounter value={metaTitle} max={60} />
        </div>
        <Input
          id="meta-title"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          maxLength={80}
          placeholder="Título que aparece en Google..."
        />
        <p className="text-muted-foreground text-xs">
          Aparece en la pestaña del navegador y resultados de búsqueda
        </p>
      </div>

      {/* ── Meta Description ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="meta-description">Meta Descripción</Label>
          <CharCounter value={metaDescription} max={160} />
        </div>
        <Textarea
          id="meta-description"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="Resumen que aparece debajo del título en Google..."
        />
        <p className="text-muted-foreground text-xs">
          Resumen que aparece debajo del título en Google
        </p>
      </div>

      {/* ── SERP Preview ── */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Vista previa en buscadores</p>
        <SerpPreview title={metaTitle} description={metaDescription} />
      </div>

      {/* ── OG Image ── */}
      <div className="space-y-2">
        <Label htmlFor="og-image" className="flex items-center gap-2">
          <Image className="size-4" />
          Imagen Open Graph
        </Label>
        <Input
          id="og-image"
          type="url"
          value={ogImageUrl}
          onChange={(e) => setOgImageUrl(e.target.value)}
          placeholder="https://yoursite.com/og-image.jpg"
        />
        <p className="text-muted-foreground text-xs">
          Recomendado: 1200×630px. Aparece al compartir en redes sociales
        </p>
        {ogImageUrl && (
          <div className="mt-2">
            <SocialPreview title={metaTitle} description={metaDescription} imageUrl={ogImageUrl} />
          </div>
        )}
        {!ogImageUrl && (
          <div className="mt-2">
            <SocialPreview title={metaTitle} description={metaDescription} />
          </div>
        )}
      </div>

      {/* ── Canonical URL ── */}
      <div className="space-y-2">
        <Label htmlFor="canonical-url">URL Canónica</Label>
        <Input
          id="canonical-url"
          type="url"
          value={canonicalUrl}
          onChange={(e) => setCanonicalUrl(e.target.value)}
          placeholder="https://yoursite.com/"
        />
        <p className="text-muted-foreground text-xs">
          URL preferida para esta página (evita contenido duplicado)
        </p>
      </div>

      {/* ── Robots ── */}
      <div className="space-y-2">
        <Label htmlFor="robots">Robots</Label>
        <select
          id="robots"
          value={robots}
          onChange={(e) => setRobots(e.target.value as RobotsValue)}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          {ROBOTS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── JSON-LD ── */}
      <div className="space-y-2">
        <Label htmlFor="json-ld">Datos Estructurados (JSON-LD)</Label>
        <Textarea
          id="json-ld"
          value={jsonLd}
          onChange={(e) => setJsonLd(e.target.value)}
          rows={8}
          placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebPage"\n}'}
          className="font-mono text-sm"
        />
        <p className="text-muted-foreground text-xs">JSON-LD para Schema.org (avanzado)</p>
      </div>

      {/* ── Save button ── */}
      <div className="flex items-center gap-4 pt-2">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <p className="text-muted-foreground text-xs">
          Los campos OG Image, URL Canónica y Robots se comparten entre idiomas
        </p>
      </div>
    </div>
  )
}
