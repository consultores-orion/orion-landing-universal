import { create } from 'zustand'

interface EditorStore {
  isEditing: boolean
  editingModuleId: string | null
  pendingChanges: Map<string, unknown>
  setEditing: (editing: boolean) => void
  setEditingModule: (id: string | null) => void
  addChange: (moduleId: string, data: unknown) => void
  clearChanges: () => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  isEditing: false,
  editingModuleId: null,
  pendingChanges: new Map(),
  setEditing: (editing) => set({ isEditing: editing }),
  setEditingModule: (id) => set({ editingModuleId: id }),
  addChange: (moduleId, data) =>
    set((state) => {
      const next = new Map(state.pendingChanges)
      next.set(moduleId, data)
      return { pendingChanges: next }
    }),
  clearChanges: () => set({ pendingChanges: new Map() }),
}))
