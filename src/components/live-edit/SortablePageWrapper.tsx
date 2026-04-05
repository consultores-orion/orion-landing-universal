'use client'

import React, { useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/stores/editor.store'

export interface SortableModule {
  id: string
  section_key: string
  display_order: number
  display_name: string
  is_visible: boolean
}

export interface SortablePageWrapperProps {
  modules: SortableModule[]
  children: React.ReactNode
  isAdmin: boolean
}

export function SortablePageWrapper({
  modules: initialModules,
  children,
  isAdmin,
}: SortablePageWrapperProps) {
  const isEditing = useEditorStore((s) => s.isEditing)
  const router = useRouter()

  // Local state tracks the current order for SortableContext IDs.
  // We keep this in sync with drag events so the context reflects the
  // optimistic reorder immediately.
  const [moduleIds, setModuleIds] = useState<string[]>(() => initialModules.map((m) => m.id))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = moduleIds.indexOf(active.id as string)
    const newIndex = moduleIds.indexOf(over.id as string)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(moduleIds, oldIndex, newIndex)
    setModuleIds(reordered)

    const order = reordered.map((id, index) => ({
      id,
      display_order: index + 1,
    }))

    try {
      const res = await fetch('/api/modules/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      })

      if (!res.ok) {
        console.error('[SortablePageWrapper] Reorder failed:', await res.text())
        // Revert optimistic update on error
        setModuleIds(moduleIds)
        return
      }

      router.refresh()
    } catch (err) {
      console.error('[SortablePageWrapper] Reorder error:', err)
      setModuleIds(moduleIds)
    }
  }

  // Not in edit mode or not an admin — render children with zero overhead
  if (!isEditing || !isAdmin) {
    return <>{children}</>
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}
