'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEditorStore } from '@/stores/editor.store'
import { ModuleToolbar } from './ModuleToolbar'

export interface SortableModuleWrapperProps {
  moduleId: string
  sectionKey: string
  isVisible: boolean
  displayOrder: number
  displayName: string
  children: React.ReactNode
  /** Called by toolbar arrow buttons — parent provides pre-computed handlers */
  onMoveUp: () => void
  onMoveDown: () => void
  /** Called by toolbar eye button — parent handles the PATCH */
  onToggleVisibility: () => void
}

export function SortableModuleWrapper({
  moduleId,
  sectionKey,
  isVisible,
  displayOrder,
  displayName,
  children,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
}: SortableModuleWrapperProps) {
  const isEditing = useEditorStore((s) => s.isEditing)

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: moduleId })

  // When not editing: render children with zero overhead
  if (!isEditing) {
    return <>{children}</>
  }

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative"
      data-module-id={moduleId}
      data-section-key={sectionKey}
    >
      {/*
        ModuleToolbar receives setActivatorNodeRef so the GripVertical icon
        inside it becomes the actual dnd-kit drag handle.
        The {...attributes} and {...listeners} are also forwarded so dnd-kit
        can track pointer events on that element.
      */}
      <ModuleToolbar
        moduleId={moduleId}
        sectionKey={sectionKey}
        isVisible={isVisible}
        displayOrder={displayOrder}
        displayName={displayName}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onToggleVisibility={onToggleVisibility}
        dragHandleRef={setActivatorNodeRef}
        dragHandleAttributes={attributes}
        dragHandleListeners={listeners}
      />

      {children}
    </div>
  )
}
