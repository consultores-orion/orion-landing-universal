'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface RichTextFieldProps {
  value: string
  onChange: (html: string) => void
  label: string
}

interface ToolbarAction {
  command: string
  label: string
  title: string
  className?: string
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { command: 'bold', label: 'B', title: 'Negrita', className: 'font-bold' },
  { command: 'italic', label: 'I', title: 'Cursiva', className: 'italic' },
  { command: 'insertUnorderedList', label: '≡', title: 'Lista' },
]

export function RichTextField({ value, onChange, label }: RichTextFieldProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isFocusedRef = useRef(false)

  // Sync external value into the editor only when not focused
  useEffect(() => {
    const el = editorRef.current
    if (!el || isFocusedRef.current) return
    if (el.innerHTML !== value) {
      el.innerHTML = value
    }
  }, [value])

  function execFormat(command: string) {
    // Ensure editor is focused so execCommand applies to its selection
    editorRef.current?.focus()

    document.execCommand(command, false)
  }

  function handleLink() {
    const url = window.prompt('URL del enlace:', 'https://')
    if (url) {
      editorRef.current?.focus()

      document.execCommand('createLink', false, url)
    }
  }

  return (
    <div className="border-input bg-background focus-within:ring-ring focus-within:ring-offset-background overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-offset-2">
      {/* Toolbar */}
      <div className="border-input flex items-center gap-0.5 border-b px-2 py-1">
        {TOOLBAR_ACTIONS.map(({ command, label: btnLabel, title, className }) => (
          <button
            key={command}
            type="button"
            title={title}
            aria-label={title}
            onMouseDown={(e) => {
              // Prevent blur on the editor before execCommand runs
              e.preventDefault()
              execFormat(command)
            }}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded text-sm transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'text-muted-foreground',
              className,
            )}
          >
            {btnLabel}
          </button>
        ))}

        {/* Link button */}
        <button
          type="button"
          title="Insertar enlace"
          aria-label="Insertar enlace"
          onMouseDown={(e) => {
            e.preventDefault()
            handleLink()
          }}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-7 w-7 items-center justify-center rounded text-xs transition-colors"
        >
          🔗
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        aria-label={label}
        role="textbox"
        aria-multiline="true"
        onFocus={() => {
          isFocusedRef.current = true
        }}
        onBlur={() => {
          isFocusedRef.current = false
        }}
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
          }
        }}
        className="text-foreground placeholder:text-muted-foreground min-h-[120px] w-full px-3 py-2 text-sm outline-none"
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  )
}
