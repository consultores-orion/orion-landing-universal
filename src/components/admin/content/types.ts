export interface FieldDefinition {
  key: string
  type: string
  label: string | Record<string, string>
  isMultilingual?: boolean
  required?: boolean
  selectOptions?: Array<{ value: string; label: string | Record<string, string> }>
  listItemSchema?: FieldDefinition[]
  min?: number
  max?: number
}

/**
 * Resolve a multilingual label to a plain string.
 * The schema stores labels as `MultilingualText` objects ({ es: '...', en: '...' })
 * OR as plain strings (legacy). This helper normalises both.
 */
export function resolveLabel(label: string | Record<string, string>, lang = 'es'): string {
  if (typeof label === 'string') return label
  return label[lang] ?? label['es'] ?? label['en'] ?? Object.values(label)[0] ?? ''
}
