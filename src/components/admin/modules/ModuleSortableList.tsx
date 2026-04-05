'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { cn } from '@/lib/utils'
import { ModuleCard } from '@/components/admin/modules/ModuleCard'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ModuleData {
  id: string
  section_key: string
  is_visible: boolean
  is_system: boolean
  display_order: number
  displayName: string
}

interface ModuleSortableListProps {
  initialModules: ModuleData[]
}

// ─────────────────────────────────────────────────────────────
// SortableModuleCard — inner wrapper using useSortable
// ─────────────────────────────────────────────────────────────

function SortableModuleCard({
  module,
  onVisibilityChange,
}: {
  module: ModuleData
  onVisibilityChange: (id: string, visible: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('bg-card rounded-lg border', isDragging && 'ring-primary/20 shadow-lg ring-1')}
    >
      <ModuleCard
        id={module.id}
        sectionKey={module.section_key}
        displayName={module.displayName}
        isVisible={module.is_visible}
        isSystem={module.is_system}
        sortableListeners={listeners}
        sortableAttributes={attributes}
        onVisibilityChange={onVisibilityChange}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────

async function saveOrder(newModules: ModuleData[]): Promise<void> {
  const order = newModules.map((m, i) => ({ id: m.id, display_order: i + 1 }))
  const res = await fetch('/api/modules/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  })
  if (!res.ok) {
    toast.error('Error al guardar el orden')
  }
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function ModuleSortableList({ initialModules }: ModuleSortableListProps) {
  const [modules, setModules] = useState<ModuleData[]>(initialModules)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setModules((prev) => {
      const oldIndex = prev.findIndex((m) => m.id === active.id)
      const newIndex = prev.findIndex((m) => m.id === over.id)
      const newModules = arrayMove(prev, oldIndex, newIndex)

      // Fire and forget — optimistic update already applied
      void saveOrder(newModules)

      return newModules
    })
  }

  const handleVisibilityChange = async (id: string, isVisible: boolean) => {
    // Optimistic update
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, is_visible: isVisible } : m)))

    const res = await fetch(`/api/modules/${id}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: isVisible }),
    })

    if (!res.ok) {
      // Rollback
      setModules((prev) => prev.map((m) => (m.id === id ? { ...m, is_visible: !isVisible } : m)))
      toast.error('Error al actualizar la visibilidad')
    } else {
      toast.success(isVisible ? 'Módulo activado' : 'Módulo desactivado')
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {modules.map((module) => (
            <SortableModuleCard
              key={module.id}
              module={module}
              onVisibilityChange={handleVisibilityChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
