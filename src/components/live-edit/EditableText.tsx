'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '@/stores/editor.store'
import { useInlineEdit } from '@/hooks/useInlineEdit'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface EditableTextProps {
  sectionKey: string
  fieldPath: string
  lang?: string
  value: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div'
  className?: string
  placeholder?: string
}

// ─────────────────────────────────────────────
// Save status badge
// ─────────────────────────────────────────────

function SaveBadge({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (status === 'idle') return null

  return (
    <span
      className={[
        'pointer-events-none absolute -top-6 right-0 z-50 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
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
// Editable wrapper — renders a contentEditable element of the requested tag
// ─────────────────────────────────────────────

interface EditableCoreProps {
  tag: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div'
  initialValue: string
  placeholder: string
  className: string
  onInput: (text: string) => void
  onBlur: (text: string) => void
  onSaveNow: (text: string) => void
}

function EditableCore({
  tag: Tag,
  initialValue,
  placeholder,
  className,
  onInput,
  onBlur,
  onSaveNow,
}: EditableCoreProps) {
  const ref = useRef<HTMLElement>(null)

  // Set initial content imperatively to avoid React/contentEditable conflicts
  useEffect(() => {
    if (ref.current && ref.current.textContent !== initialValue) {
      ref.current.textContent = initialValue
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount

  // Sync when value changes externally and element is not focused
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (document.activeElement === el) return
    if (el.textContent !== initialValue) {
      el.textContent = initialValue
    }
  }, [initialValue])

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      onInput(e.currentTarget.textContent ?? '')
    },
    [onInput],
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      e.currentTarget.classList.remove('outline-primary')
      e.currentTarget.classList.add('outline-primary/40')
      onBlur(e.currentTarget.textContent ?? '')
    },
    [onBlur],
  )

  const handleFocus = useCallback((e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.classList.remove('outline-primary/40')
    e.currentTarget.classList.add('outline-primary')
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        onSaveNow(e.currentTarget.textContent ?? '')
      }
    },
    [onSaveNow],
  )

  // We use a type assertion here because React's JSX types don't easily
  // model dynamic polymorphic tags while keeping ref typing clean.
  const props = {
    ref,
    contentEditable: true as const,
    suppressContentEditableWarning: true,
    'data-placeholder': placeholder,
    className: [
      className,
      'outline outline-2 outline-offset-2 outline-primary/40 rounded cursor-text',
      'focus:outline-primary transition-[outline-color]',
      'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none',
    ].join(' '),
    onInput: handleInput,
    onBlur: handleBlur,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
  }

  if (Tag === 'span') return <span {...props} ref={ref as React.RefObject<HTMLSpanElement>} />
  if (Tag === 'p') return <p {...props} ref={ref as React.RefObject<HTMLParagraphElement>} />
  if (Tag === 'h1') return <h1 {...props} ref={ref as React.RefObject<HTMLHeadingElement>} />
  if (Tag === 'h2') return <h2 {...props} ref={ref as React.RefObject<HTMLHeadingElement>} />
  if (Tag === 'h3') return <h3 {...props} ref={ref as React.RefObject<HTMLHeadingElement>} />
  if (Tag === 'h4') return <h4 {...props} ref={ref as React.RefObject<HTMLHeadingElement>} />
  return <div {...props} ref={ref as React.RefObject<HTMLDivElement>} />
}

// ─────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────

export function EditableText({
  sectionKey,
  fieldPath,
  lang,
  value,
  as: Tag = 'span',
  className = '',
  placeholder = 'Escribe aquí...',
}: EditableTextProps) {
  const isEditing = useEditorStore((s) => s.isEditing)
  const { saveStatus, save, debouncedSave } = useInlineEdit({ sectionKey, fieldPath, lang })

  if (!isEditing) {
    const StaticTag = Tag
    return <StaticTag className={className}>{value}</StaticTag>
  }

  return (
    <span className="relative inline-block">
      <SaveBadge status={saveStatus} />
      <EditableCore
        tag={Tag}
        initialValue={value}
        placeholder={placeholder}
        className={className}
        onInput={debouncedSave}
        onBlur={(text) => {
          void save(text)
        }}
        onSaveNow={(text) => {
          void save(text)
        }}
      />
    </span>
  )
}
