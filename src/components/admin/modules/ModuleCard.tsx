'use client'

import type { LucideIcon } from 'lucide-react'
import {
  GripVertical,
  Sparkles,
  Star,
  List,
  MessageSquare,
  Building2,
  Mail,
  HelpCircle,
  Megaphone,
  Layout,
  BarChart3,
  Tag,
  Video,
  Users,
  Image,
  Grid3X3,
  Timer,
  Table2,
  Send,
  MapPin,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { useSortable } from '@dnd-kit/sortable'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// ─────────────────────────────────────────────────────────────
// Icon mapping
// ─────────────────────────────────────────────────────────────

const MODULE_ICONS: Record<string, LucideIcon> = {
  hero: Sparkles,
  value_prop: Star,
  how_it_works: List,
  social_proof: MessageSquare,
  client_logos: Building2,
  offer_form: Mail,
  faq: HelpCircle,
  final_cta: Megaphone,
  footer: Layout,
  stats: BarChart3,
  pricing: Tag,
  video: Video,
  team: Users,
  gallery: Image,
  features_grid: Grid3X3,
  countdown: Timer,
  comparison: Table2,
  newsletter: Send,
  map_location: MapPin,
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface ModuleCardProps {
  id: string
  sectionKey: string
  displayName: string
  isVisible: boolean
  isSystem: boolean
  sortableListeners?: ReturnType<typeof useSortable>['listeners']
  sortableAttributes?: ReturnType<typeof useSortable>['attributes']
  onVisibilityChange: (id: string, isVisible: boolean) => void
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function ModuleCard({
  id,
  sectionKey,
  displayName,
  isVisible,
  isSystem,
  sortableListeners,
  sortableAttributes,
  onVisibilityChange,
}: ModuleCardProps) {
  const Icon = MODULE_ICONS[sectionKey] ?? Layout

  const isDisabled = isSystem && isVisible

  const handleToggle = () => {
    if (isDisabled) return
    onVisibilityChange(id, !isVisible)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Drag handle */}
      <span
        {...(sortableAttributes as React.HTMLAttributes<HTMLElement>)}
        {...(sortableListeners as React.HTMLAttributes<HTMLElement>)}
        className={cn(
          'text-muted-foreground hover:text-foreground flex shrink-0 cursor-grab touch-none items-center rounded p-1 transition-colors active:cursor-grabbing',
        )}
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </span>

      {/* Module icon */}
      <span className="bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-md p-1.5">
        <Icon className="h-4 w-4" />
      </span>

      {/* Name */}
      <span className="text-foreground flex-1 truncate text-sm font-medium">{displayName}</span>

      {/* System badge */}
      {isSystem && (
        <Badge variant="secondary" className="shrink-0">
          Sistema
        </Badge>
      )}

      {/* Visibility toggle */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isDisabled}
        title={
          isDisabled
            ? 'Los módulos del sistema no se pueden desactivar'
            : isVisible
              ? 'Desactivar módulo'
              : 'Activar módulo'
        }
        className={cn(
          'focus-visible:ring-ring flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
          isVisible
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent'
            : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          isDisabled && 'cursor-not-allowed opacity-60',
        )}
        aria-pressed={isVisible}
      >
        {isVisible ? (
          <>
            <Eye className="h-3.5 w-3.5" />
            <span>ON</span>
          </>
        ) : (
          <>
            <EyeOff className="h-3.5 w-3.5" />
            <span>OFF</span>
          </>
        )}
      </button>
    </div>
  )
}
