'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useEditorStore } from '@/stores/editor.store'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import { MediaPicker } from '@/components/admin/media/MediaPicker'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface EditableImageProps {
  sectionKey: string
  fieldPath: string
  lang?: string
  src: string | null
  alt?: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
}

// ─────────────────────────────────────────────
// Save status badge
// ─────────────────────────────────────────────

function SaveBadge({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (status === 'idle') return null

  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        'pointer-events-none absolute top-2 right-2 z-50 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
        status === 'saving' ? 'bg-muted text-muted-foreground' : '',
        status === 'saved' ? 'bg-green-50 text-green-600' : '',
        status === 'error' ? 'bg-red-50 text-red-600' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {status === 'saving' && (
        <>
          <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Guardando...
        </>
      )}
      {status === 'saved' && '✓'}
      {status === 'error' && '✗ Error'}
    </span>
  )
}

// ─────────────────────────────────────────────
// Camera icon
// ─────────────────────────────────────────────

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-8"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────
// MediaPicker trigger bridge
// Strategy: keep MediaPicker always rendered (hidden) in editing mode.
// The picker has its own internal dialog. We need to programmatically open it.
// We do this by forwarding a ref to the "Seleccionar" button inside MediaPicker
// and calling click() on it when the user clicks the image overlay.
// ─────────────────────────────────────────────

interface PickerBridgeProps {
  value: string
  onChange: (url: string) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

function PickerBridge({ value, onChange, triggerRef }: PickerBridgeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Forward the "Seleccionar" button reference after mount
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // The last <button type="button"> inside MediaPicker is "Seleccionar"
    const buttons = container.querySelectorAll<HTMLButtonElement>('button[type="button"]')
    const selectBtn = buttons[buttons.length - 1]
    if (selectBtn) {
      triggerRef.current = selectBtn
    }
  }, [triggerRef])

  return (
    <div ref={containerRef} className="hidden" aria-hidden="true">
      <MediaPicker value={value} onChange={onChange} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────

export function EditableImage({
  sectionKey,
  fieldPath,
  lang,
  src,
  alt = '',
  className = '',
  width,
  height,
  fill = false,
}: EditableImageProps) {
  const isEditing = useEditorStore((s) => s.isEditing)
  const { saveStatus, save } = useInlineEdit({ sectionKey, fieldPath, lang })

  // Optimistic preview
  const [previewSrc, setPreviewSrc] = useState<string | null>(src)
  const pickerTriggerRef = useRef<HTMLButtonElement | null>(null)

  const handleOverlayClick = useCallback(() => {
    pickerTriggerRef.current?.click()
  }, [])

  const handleOverlayKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      pickerTriggerRef.current?.click()
    }
  }, [])

  const handlePickerChange = useCallback(
    async (url: string) => {
      const previous = previewSrc
      setPreviewSrc(url) // optimistic

      try {
        await save(url)
      } catch {
        setPreviewSrc(previous) // rollback
      }
    },
    [previewSrc, save],
  )

  // ── Static mode ──────────────────────────────
  if (!isEditing) {
    if (!src) return null
    if (fill) {
      return <Image src={src} alt={alt} fill className={className} />
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={width ?? 800}
        height={height ?? 600}
        className={className}
      />
    )
  }

  // ── Edit mode ────────────────────────────────
  const displaySrc = previewSrc

  return (
    <>
      {/* Clickable image wrapper */}
      <div
        className={['group relative cursor-pointer', fill ? 'h-full w-full' : 'inline-block'].join(
          ' ',
        )}
        role="button"
        tabIndex={0}
        aria-label="Cambiar imagen"
        onClick={handleOverlayClick}
        onKeyDown={handleOverlayKeyDown}
      >
        {/* Image or empty placeholder */}
        {displaySrc ? (
          fill ? (
            <Image
              src={displaySrc}
              alt={alt}
              fill
              className={['object-cover', className].join(' ')}
            />
          ) : (
            <Image
              src={displaySrc}
              alt={alt}
              width={width ?? 800}
              height={height ?? 600}
              className={className}
            />
          )
        ) : (
          <div
            className={[
              'bg-muted text-muted-foreground flex items-center justify-center rounded',
              fill ? 'h-full w-full' : 'aspect-video w-full',
            ].join(' ')}
            style={!fill && width ? { width, height: height ?? 'auto' } : undefined}
          >
            <CameraIcon />
          </div>
        )}

        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded bg-black/40 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <CameraIcon />
          <span className="text-sm font-medium">Cambiar imagen</span>
        </div>

        {/* Save badge */}
        <SaveBadge status={saveStatus} />
      </div>

      {/* Hidden MediaPicker — bridge to its internal dialog trigger */}
      <PickerBridge
        value={displaySrc ?? ''}
        onChange={handlePickerChange}
        triggerRef={pickerTriggerRef}
      />
    </>
  )
}
