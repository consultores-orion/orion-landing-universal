'use client'

import React from 'react'
import Link from 'next/link'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Settings } from 'lucide-react'
import { useEditorStore } from '@/stores/editor.store'

export interface ModuleToolbarProps {
  moduleId: string
  sectionKey: string
  isVisible: boolean
  displayOrder: number
  displayName: string
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleVisibility: () => void
  /** Forwarded from useSortable — attaches the drag activator node */
  dragHandleRef?: (node: HTMLElement | null) => void
  dragHandleAttributes?: DraggableAttributes
  dragHandleListeners?: DraggableSyntheticListeners
}

export function ModuleToolbar({
  displayName,
  isVisible,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  dragHandleRef,
  dragHandleAttributes,
  dragHandleListeners,
}: ModuleToolbarProps) {
  const isEditing = useEditorStore((s) => s.isEditing)

  if (!isEditing) return null

  return (
    <div
      className="bg-primary/10 border-primary/20 flex items-center gap-1 border-b px-2 py-1 select-none"
      aria-label={`Barra de herramientas: ${displayName}`}
    >
      {/* Drag handle — wired to dnd-kit activator when props provided */}
      <button
        type="button"
        ref={dragHandleRef}
        {...dragHandleAttributes}
        {...dragHandleListeners}
        className="text-primary/50 hover:text-primary/80 hover:bg-primary/15 flex h-7 w-7 cursor-grab items-center justify-center rounded transition-colors active:cursor-grabbing"
        aria-label="Arrastrar para reordenar"
        title="Arrastrar para reordenar"
      >
        <GripVertical size={16} />
      </button>

      {/* Module name */}
      <span className="text-primary/70 max-w-[160px] truncate text-xs font-medium">
        {displayName}
      </span>

      <span className="flex-1" />

      {/* Move up */}
      <button
        type="button"
        onClick={onMoveUp}
        className="hover:bg-primary/15 text-primary/60 hover:text-primary flex h-7 w-7 items-center justify-center rounded transition-colors"
        aria-label="Mover módulo arriba"
        title="Mover arriba"
      >
        <ArrowUp size={14} />
      </button>

      {/* Move down */}
      <button
        type="button"
        onClick={onMoveDown}
        className="hover:bg-primary/15 text-primary/60 hover:text-primary flex h-7 w-7 items-center justify-center rounded transition-colors"
        aria-label="Mover módulo abajo"
        title="Mover abajo"
      >
        <ArrowDown size={14} />
      </button>

      {/* Toggle visibility */}
      <button
        type="button"
        onClick={onToggleVisibility}
        className="hover:bg-primary/15 text-primary/60 hover:text-primary flex h-7 w-7 items-center justify-center rounded transition-colors"
        aria-label={isVisible ? 'Ocultar módulo' : 'Mostrar módulo'}
        title={isVisible ? 'Ocultar' : 'Mostrar'}
      >
        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>

      {/* Settings link */}
      <Link
        href="/admin/content"
        className="hover:bg-primary/15 text-primary/60 hover:text-primary flex h-7 w-7 items-center justify-center rounded transition-colors"
        aria-label="Ir a configuración de contenido"
        title="Configurar en admin"
      >
        <Settings size={14} />
      </Link>
    </div>
  )
}
