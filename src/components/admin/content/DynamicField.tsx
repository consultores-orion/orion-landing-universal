'use client'

import { cn } from '@/lib/utils'
import type { FieldDefinition } from './types'
import { resolveLabel } from './types'
import { ArrayField } from './ArrayField'
import { ImageField } from './ImageField'
import { RichTextField } from './RichTextField'

interface DynamicFieldProps {
  field: FieldDefinition
  value: unknown
  onChange: (value: unknown) => void
}

const inputBase =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const textareaBase =
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y'

export function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  const label =
    resolveLabel(field.label) ||
    field.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const strValue =
    typeof value === 'string' ? value : value !== null && value !== undefined ? String(value) : ''
  const numValue = typeof value === 'number' ? value : parseFloat(strValue) || 0

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm leading-none font-medium">
        {label}
        {field.required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <FieldInput
        field={field}
        value={value}
        strValue={strValue}
        numValue={numValue}
        onChange={onChange}
        label={label}
      />
    </div>
  )
}

interface FieldInputProps {
  field: FieldDefinition
  value: unknown
  strValue: string
  numValue: number
  onChange: (value: unknown) => void
  label: string
}

function FieldInput({ field, value, strValue, numValue, onChange, label }: FieldInputProps) {
  switch (field.type) {
    case 'text':
    case 'url':
    case 'map':
    case 'link':
      return (
        <input
          type="text"
          className={inputBase}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          aria-label={label}
        />
      )

    case 'image':
      return <ImageField value={strValue} onChange={(url) => onChange(url)} label={label} />

    case 'textarea':
      return (
        <textarea
          className={textareaBase}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          aria-label={label}
          rows={4}
        />
      )

    case 'richtext':
      return <RichTextField value={strValue} onChange={(html) => onChange(html)} label={label} />

    case 'number':
      return (
        <input
          type="number"
          className={inputBase}
          value={strValue}
          min={field.min}
          max={field.max}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          aria-label={label}
        />
      )

    case 'date':
      return (
        <input
          type="date"
          className={inputBase}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
      )

    case 'color':
      return (
        <div className="flex items-center gap-3">
          <input
            type="color"
            className="border-input h-10 w-20 cursor-pointer rounded-md border p-1"
            value={strValue || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
          />
          <input
            type="text"
            className={cn(inputBase, 'flex-1')}
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            aria-label={`${label} hex`}
          />
        </div>
      )

    case 'range':
      return (
        <div className="flex items-center gap-3">
          <input
            type="range"
            className="accent-primary h-2 flex-1 rounded-md"
            value={numValue}
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.max !== undefined && field.max <= 1 ? 0.01 : 1}
            onChange={(e) => onChange(e.target.valueAsNumber)}
            aria-label={label}
          />
          <span className="text-muted-foreground w-12 text-right text-sm tabular-nums">
            {numValue}
          </span>
        </div>
      )

    case 'boolean':
    case 'toggle': {
      const checked = Boolean(value)
      return (
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              aria-label={label}
            />
            <div
              className={cn(
                'h-6 w-11 rounded-full transition-colors',
                checked ? 'bg-primary' : 'bg-input',
              )}
            />
            <div
              className={cn(
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                checked ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </div>
          <span className="text-muted-foreground text-sm">
            {checked ? 'Activado' : 'Desactivado'}
          </span>
        </label>
      )
    }

    case 'select': {
      const options = field.selectOptions ?? []
      return (
        <select
          className={cn(inputBase, 'bg-background cursor-pointer appearance-none')}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        >
          <option value="">Seleccionar...</option>
          {options.map((opt) => {
            const optLabel =
              typeof opt.label === 'string'
                ? opt.label
                : (opt.label['es'] ?? opt.label['en'] ?? opt.value)
            return (
              <option key={opt.value} value={opt.value}>
                {optLabel}
              </option>
            )
          })}
        </select>
      )
    }

    case 'array':
    case 'list':
      return (
        <ArrayField field={field} value={Array.isArray(value) ? value : []} onChange={onChange} />
      )

    default:
      // Fallback for unknown types — render as text
      return (
        <input
          type="text"
          className={inputBase}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          aria-label={label}
        />
      )
  }
}
