'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseInlineEditOptions {
  sectionKey: string
  fieldPath: string
  lang?: string
  debounceMs?: number
}

export interface UseInlineEditReturn {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  save: (value: string) => Promise<void>
  debouncedSave: (value: string) => void
}

export function useInlineEdit({
  sectionKey,
  fieldPath,
  lang,
  debounceMs = 600,
}: UseInlineEditOptions): UseInlineEditReturn {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const save = useCallback(
    async (value: string) => {
      setSaveStatus('saving')
      try {
        const response = await fetch('/api/inline-edit', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionKey, fieldPath, value, lang }),
        })

        if (!response.ok) {
          setSaveStatus('error')
          return
        }

        setSaveStatus('saved')

        // Reset to idle after a short display window
        resetTimerRef.current = setTimeout(() => {
          resetTimerRef.current = null
          setSaveStatus('idle')
        }, 2000)
      } catch {
        setSaveStatus('error')
      }
    },
    [sectionKey, fieldPath, lang],
  )

  const debouncedSave = useCallback(
    (value: string) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        void save(value)
      }, debounceMs)
    },
    [save, debounceMs],
  )

  return { saveStatus, save, debouncedSave }
}
