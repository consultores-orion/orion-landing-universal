'use client'

import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import type { FieldDefinition } from './types'
import { DynamicField } from './DynamicField'

interface ArrayFieldProps {
  field: FieldDefinition
  value: unknown[]
  onChange: (items: unknown[]) => void
}

export function ArrayField({ field, value, onChange }: ArrayFieldProps) {
  const items = Array.isArray(value) ? value : []
  const subFields = field.listItemSchema ?? []

  const handleAddItem = () => {
    const newItem: Record<string, unknown> = {}
    subFields.forEach((subField) => {
      newItem[subField.key] = subField.type === 'boolean' ? false : ''
    })
    onChange([...items, subFields.length > 0 ? newItem : ''])
  }

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, value: unknown) => {
    const updated = [...items]
    updated[index] = value
    onChange(updated)
  }

  const handleSubFieldChange = (itemIndex: number, subKey: string, subValue: unknown) => {
    const updated = [...items]
    const currentItem =
      typeof updated[itemIndex] === 'object' && updated[itemIndex] !== null
        ? (updated[itemIndex] as Record<string, unknown>)
        : {}
    updated[itemIndex] = { ...currentItem, [subKey]: subValue }
    onChange(updated)
  }

  const getSubFieldValue = (item: unknown, subKey: string): unknown => {
    if (typeof item === 'object' && item !== null) {
      return (item as Record<string, unknown>)[subKey] ?? ''
    }
    return ''
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-muted-foreground text-sm italic">
          Sin elementos. Haz clic en &quot;Agregar item&quot; para comenzar.
        </p>
      )}

      {items.map((item, index) => (
        <div key={index} className="border-border bg-muted/30 space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">Item {index + 1}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleRemoveItem(index)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              type="button"
            >
              <Trash2 />
              <span className="sr-only">Eliminar item {index + 1}</span>
            </Button>
          </div>

          {subFields.length > 0 ? (
            subFields.map((subField) => (
              <div key={subField.key} className="space-y-1">
                <DynamicField
                  field={subField}
                  value={getSubFieldValue(item, subField.key)}
                  onChange={(val) => handleSubFieldChange(index, subField.key, val)}
                />
              </div>
            ))
          ) : (
            <DynamicField
              field={{ ...field, type: 'text', listItemSchema: undefined }}
              value={typeof item === 'string' ? item : String(item ?? '')}
              onChange={(val) => handleItemChange(index, val)}
            />
          )}
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={handleAddItem} type="button" className="w-full">
        <Plus />
        Agregar item
      </Button>
    </div>
  )
}
