'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

const PLATFORMS = [
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'github', label: 'GitHub' },
  { value: 'other', label: 'Otro' },
] as const

type Platform = (typeof PLATFORMS)[number]['value']

interface LinkEntry {
  key: string
  platform: Platform
  url: string
}

interface SocialLinksEditorProps {
  value: Record<string, string>
  onChange: (links: Record<string, string>) => void
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function recordToEntries(record: Record<string, string>): LinkEntry[] {
  return Object.entries(record).map(([platform, url]) => ({
    key: crypto.randomUUID(),
    platform: (PLATFORMS.some((p) => p.value === platform) ? platform : 'other') as Platform,
    url,
  }))
}

function entriesToRecord(entries: LinkEntry[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const entry of entries) {
    if (entry.url.trim()) {
      result[entry.platform] = entry.url.trim()
    }
  }
  return result
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function SocialLinksEditor({ value, onChange }: SocialLinksEditorProps) {
  const [entries, setEntries] = useState<LinkEntry[]>(() => recordToEntries(value))

  function handleAdd() {
    const updated = [
      ...entries,
      { key: crypto.randomUUID(), platform: 'other' as Platform, url: '' },
    ]
    setEntries(updated)
    onChange(entriesToRecord(updated))
  }

  function handleRemove(key: string) {
    const updated = entries.filter((e) => e.key !== key)
    setEntries(updated)
    onChange(entriesToRecord(updated))
  }

  function handlePlatformChange(key: string, platform: Platform) {
    const updated = entries.map((e) => (e.key === key ? { ...e, platform } : e))
    setEntries(updated)
    onChange(entriesToRecord(updated))
  }

  function handleUrlChange(key: string, url: string) {
    const updated = entries.map((e) => (e.key === key ? { ...e, url } : e))
    setEntries(updated)
    onChange(entriesToRecord(updated))
  }

  return (
    <div className="space-y-3">
      <Label>Redes sociales</Label>

      {entries.length === 0 && (
        <p className="text-muted-foreground text-sm">No hay redes sociales configuradas.</p>
      )}

      {entries.map((entry) => (
        <div key={entry.key} className="flex items-center gap-2">
          <Select
            value={entry.platform}
            onValueChange={(val) => handlePlatformChange(entry.key, val as Platform)}
          >
            <SelectTrigger className="w-[160px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="url"
            placeholder="https://..."
            value={entry.url}
            onChange={(e) => handleUrlChange(entry.key, e.target.value)}
            className="flex-1"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(entry.key)}
            aria-label="Eliminar red social"
          >
            <Trash2 className="text-destructive h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Agregar red social
      </Button>
    </div>
  )
}
