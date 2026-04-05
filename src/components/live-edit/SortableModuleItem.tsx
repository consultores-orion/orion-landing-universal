'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SortableModuleWrapper } from './SortableModuleWrapper'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface SortableModuleItemProps {
  moduleId: string
  sectionKey: string
  isVisible: boolean
  displayOrder: number
  displayName: string
  totalModules: number
  children: React.ReactNode
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * SortableModuleItem — Client Component adapter for SortableModuleWrapper.
 *
 * Bridges the gap between Server Components (page.tsx) and the Client Component
 * SortableModuleWrapper. It encapsulates the API handlers internally so the
 * Server Component doesn't need to pass callbacks (which would break RSC rules).
 *
 * Handles optimistic updates: applies state change locally before the API call,
 * then reverts on failure.
 */
export function SortableModuleItem({
  moduleId,
  sectionKey,
  isVisible,
  displayOrder,
  displayName,
  totalModules,
  children,
}: SortableModuleItemProps) {
  const router = useRouter()
  const [optimisticVisible, setOptimisticVisible] = useState(isVisible)
  const [optimisticOrder, setOptimisticOrder] = useState(displayOrder)

  // ── Move Up ──────────────────────────────────────────────────────────────
  const handleMoveUp = useCallback(async () => {
    if (optimisticOrder <= 1) return

    const newOrder = optimisticOrder - 1
    setOptimisticOrder(newOrder)

    try {
      const res = await fetch('/api/modules/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: [{ id: moduleId, display_order: newOrder }],
        }),
      })

      if (!res.ok) {
        console.error('[SortableModuleItem] Move up failed:', await res.text())
        setOptimisticOrder(optimisticOrder)
        return
      }

      router.refresh()
    } catch (err) {
      console.error('[SortableModuleItem] Move up error:', err)
      setOptimisticOrder(optimisticOrder)
    }
  }, [moduleId, optimisticOrder, router])

  // ── Move Down ─────────────────────────────────────────────────────────────
  const handleMoveDown = useCallback(async () => {
    if (optimisticOrder >= totalModules) return

    const newOrder = optimisticOrder + 1
    setOptimisticOrder(newOrder)

    try {
      const res = await fetch('/api/modules/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: [{ id: moduleId, display_order: newOrder }],
        }),
      })

      if (!res.ok) {
        console.error('[SortableModuleItem] Move down failed:', await res.text())
        setOptimisticOrder(optimisticOrder)
        return
      }

      router.refresh()
    } catch (err) {
      console.error('[SortableModuleItem] Move down error:', err)
      setOptimisticOrder(optimisticOrder)
    }
  }, [moduleId, optimisticOrder, totalModules, router])

  // ── Toggle Visibility ─────────────────────────────────────────────────────
  const handleToggleVisibility = useCallback(async () => {
    const nextVisible = !optimisticVisible
    setOptimisticVisible(nextVisible)

    try {
      const res = await fetch(`/api/modules/${moduleId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: nextVisible }),
      })

      if (!res.ok) {
        console.error('[SortableModuleItem] Toggle visibility failed:', await res.text())
        setOptimisticVisible(optimisticVisible)
        return
      }

      router.refresh()
    } catch (err) {
      console.error('[SortableModuleItem] Toggle visibility error:', err)
      setOptimisticVisible(optimisticVisible)
    }
  }, [moduleId, optimisticVisible, router])

  return (
    <SortableModuleWrapper
      moduleId={moduleId}
      sectionKey={sectionKey}
      isVisible={optimisticVisible}
      displayOrder={optimisticOrder}
      displayName={displayName}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onToggleVisibility={handleToggleVisibility}
    >
      {children}
    </SortableModuleWrapper>
  )
}
