'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditorStore } from '@/stores/editor.store'
import { useInlineEdit } from '@/hooks/useInlineEdit'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface EditableRichTextProps {
  sectionKey: string
  fieldPath: string
  lang?: string
  value: string // HTML string
  className?: string
  minHeight?: string // default '3rem'
}

// ─────────────────────────────────────────────
// Save status badge (identical shape to EditableText)
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
// Floating toolbar
// ─────────────────────────────────────────────

interface ToolbarProps {
  visible: boolean
}

function RichTextToolbar({ visible }: ToolbarProps) {
  const exec = useCallback((command: string) => {
    document.execCommand(command, false)
  }, [])

  if (!visible) return null

  return (
    <div
      className={[
        'absolute -top-9 left-0 flex items-center gap-0.5 px-1 py-0.5',
        'bg-popover border-border z-50 rounded-md border shadow-md',
        'transition-opacity duration-150',
      ].join(' ')}
      // Prevent mousedown from stealing focus away from the editable
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolbarButton title="Negrita (Ctrl+B)" onClick={() => exec('bold')}>
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton title="Cursiva (Ctrl+I)" onClick={() => exec('italic')}>
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton title="Lista" onClick={() => exec('insertUnorderedList')}>
        <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden="true">
          <circle cx="2" cy="4" r="1.5" />
          <rect x="5" y="3" width="9" height="2" rx="1" />
          <circle cx="2" cy="8" r="1.5" />
          <rect x="5" y="7" width="9" height="2" rx="1" />
          <circle cx="2" cy="12" r="1.5" />
          <rect x="5" y="11" width="9" height="2" rx="1" />
        </svg>
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({
  title,
  onClick,
  children,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="text-foreground hover:bg-accent hover:text-accent-foreground flex size-6 items-center justify-center rounded text-xs transition-colors"
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────

export function EditableRichText({
  sectionKey,
  fieldPath,
  lang,
  value,
  className = '',
  minHeight = '3rem',
}: EditableRichTextProps) {
  const isEditing = useEditorStore((s) => s.isEditing)
  const { saveStatus, save, debouncedSave } = useInlineEdit({ sectionKey, fieldPath, lang })

  const contentRef = useRef<HTMLDivElement>(null)
  const [toolbarVisible, setToolbarVisible] = useState(false)

  // Set initial HTML imperatively to avoid React/contentEditable conflicts
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount

  // Sync when value changes externally and element is not focused
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    if (document.activeElement === el) return
    if (el.innerHTML !== value) {
      el.innerHTML = value
    }
  }, [value])

  const handleInput = useCallback(() => {
    debouncedSave(contentRef.current?.innerHTML ?? '')
  }, [debouncedSave])

  const handleBlur = useCallback(() => {
    setToolbarVisible(false)
    void save(contentRef.current?.innerHTML ?? '')
  }, [save])

  const handleFocus = useCallback(() => {
    setToolbarVisible(true)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setToolbarVisible(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (document.activeElement !== contentRef.current) {
      setToolbarVisible(false)
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        void save(contentRef.current?.innerHTML ?? '')
      }
    },
    [save],
  )

  if (!isEditing) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: value }} />
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <SaveBadge status={saveStatus} />
      <RichTextToolbar visible={toolbarVisible} />
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        className={[
          className,
          'outline-primary/40 cursor-text rounded outline outline-2 outline-offset-2',
          'focus:outline-primary transition-[outline-color]',
        ].join(' ')}
        style={{ minHeight }}
        onInput={handleInput}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
