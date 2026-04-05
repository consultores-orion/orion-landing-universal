'use client'

import { useState, useMemo } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface Language {
  code: string
  name: string
  native_name: string
  is_default: boolean
  is_active: boolean
  flag_emoji: string
  sort_order: number
}

interface AddLanguageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingCodes: string[]
  onLanguageAdded: (language: Language) => void
}

// ─────────────────────────────────────────────────────────────
// Common languages catalog
// ─────────────────────────────────────────────────────────────

const COMMON_LANGUAGES = [
  { code: 'es', name: 'Spanish', native_name: 'Español', flag_emoji: '🇪🇸' },
  { code: 'en', name: 'English', native_name: 'English', flag_emoji: '🇺🇸' },
  { code: 'fr', name: 'French', native_name: 'Français', flag_emoji: '🇫🇷' },
  { code: 'de', name: 'German', native_name: 'Deutsch', flag_emoji: '🇩🇪' },
  { code: 'it', name: 'Italian', native_name: 'Italiano', flag_emoji: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', native_name: 'Português', flag_emoji: '🇧🇷' },
  { code: 'zh', name: 'Chinese', native_name: '中文', flag_emoji: '🇨🇳' },
  { code: 'ja', name: 'Japanese', native_name: '日本語', flag_emoji: '🇯🇵' },
  { code: 'ko', name: 'Korean', native_name: '한국어', flag_emoji: '🇰🇷' },
  { code: 'ar', name: 'Arabic', native_name: 'العربية', flag_emoji: '🇸🇦' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', flag_emoji: '🇮🇳' },
  { code: 'ru', name: 'Russian', native_name: 'Русский', flag_emoji: '🇷🇺' },
  { code: 'nl', name: 'Dutch', native_name: 'Nederlands', flag_emoji: '🇳🇱' },
  { code: 'pl', name: 'Polish', native_name: 'Polski', flag_emoji: '🇵🇱' },
  { code: 'tr', name: 'Turkish', native_name: 'Türkçe', flag_emoji: '🇹🇷' },
  { code: 'sv', name: 'Swedish', native_name: 'Svenska', flag_emoji: '🇸🇪' },
  { code: 'id', name: 'Indonesian', native_name: 'Bahasa Indonesia', flag_emoji: '🇮🇩' },
  { code: 'vi', name: 'Vietnamese', native_name: 'Tiếng Việt', flag_emoji: '🇻🇳' },
] as const

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function AddLanguageDialog({
  open,
  onOpenChange,
  existingCodes,
  onLanguageAdded,
}: AddLanguageDialogProps) {
  const [search, setSearch] = useState('')
  const [addingCode, setAddingCode] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return COMMON_LANGUAGES.filter((lang) => {
      if (existingCodes.includes(lang.code)) return false
      if (!q) return true
      return (
        lang.name.toLowerCase().includes(q) ||
        lang.native_name.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
      )
    })
  }, [search, existingCodes])

  async function handleAdd(lang: (typeof COMMON_LANGUAGES)[number]) {
    setAddingCode(lang.code)
    try {
      const response = await fetch('/api/i18n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: lang.code,
          name: lang.name,
          native_name: lang.native_name,
          flag_emoji: lang.flag_emoji,
        }),
      })

      if (!response.ok) {
        const err = (await response.json()) as { error?: string }
        toast.error(err.error ?? 'Error al agregar el idioma')
        return
      }

      const { data } = (await response.json()) as { data: Language }
      toast.success(`Idioma "${lang.native_name}" agregado`)
      onLanguageAdded(data)
      onOpenChange(false)
      setSearch('')
    } catch {
      toast.error('Error de conexión al agregar el idioma')
    } finally {
      setAddingCode(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Idioma</DialogTitle>
          <DialogDescription>
            Selecciona un idioma para activarlo en tu landing page.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar idioma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border py-2 pr-3 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>

        {/* Language list */}
        <div className="divide-border border-border max-h-64 divide-y overflow-y-auto rounded-md border">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              {search
                ? 'No se encontraron idiomas'
                : 'Todos los idiomas disponibles ya están activos'}
            </p>
          ) : (
            filtered.map((lang) => {
              const isAdding = addingCode === lang.code

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleAdd(lang)}
                  disabled={addingCode !== null}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                  )}
                >
                  <span className="text-xl" aria-hidden="true">
                    {lang.flag_emoji}
                  </span>
                  <span className="flex-1">
                    <span className="font-medium">{lang.native_name}</span>
                    <span className="text-muted-foreground ml-1">({lang.code.toUpperCase()})</span>
                  </span>
                  {isAdding && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}
                </button>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
