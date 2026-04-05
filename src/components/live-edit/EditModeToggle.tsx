'use client'

import { Check, Pencil } from 'lucide-react'
import { useEditorStore } from '@/stores/editor.store'

export interface EditModeToggleProps {
  isAdmin: boolean
}

export function EditModeToggle({ isAdmin }: EditModeToggleProps) {
  const isEditing = useEditorStore((s) => s.isEditing)
  const setEditing = useEditorStore((s) => s.setEditing)

  if (!isAdmin) return null

  return (
    <button
      type="button"
      onClick={() => setEditing(!isEditing)}
      className={[
        'fixed right-6 bottom-6 z-50',
        'rounded-full px-4 py-2 text-sm font-medium shadow-lg',
        'flex items-center gap-2 transition-colors',
        isEditing
          ? 'animate-pulse bg-green-500 text-white ring-2 ring-green-400 ring-offset-2'
          : 'bg-blue-600 text-white hover:bg-blue-700',
      ].join(' ')}
      aria-pressed={isEditing}
      aria-label={isEditing ? 'Desactivar modo edición' : 'Activar modo edición'}
    >
      {isEditing ? (
        <>
          <Check size={16} aria-hidden="true" />
          <span>Editando</span>
        </>
      ) : (
        <>
          <Pencil size={16} aria-hidden="true" />
          <span>Editar</span>
        </>
      )}
    </button>
  )
}
