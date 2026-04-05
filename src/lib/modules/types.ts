import type { ComponentType } from 'react'
import type { Database } from '@/types/database'

export type PageModule = Database['public']['Tables']['page_modules']['Row']
export type ModuleSchema = Database['public']['Tables']['module_schemas']['Row']

export type MultilingualText = Record<string, string>
export type MultilingualRichText = Record<string, string>

export interface MultilingualImage {
  url: string
  alt: MultilingualText
  width?: number
  height?: number
}

export type ModuleCategory = 'header' | 'content' | 'social' | 'conversion' | 'info' | 'footer'

export interface ModuleStyles {
  backgroundColor?: string | null
  textColor?: string | null
  backgroundImage?: string | null
  backgroundOverlayOpacity?: number
  paddingY?: 'none' | 'small' | 'medium' | 'large' | 'xlarge'
  paddingX?: 'none' | 'small' | 'medium' | 'large'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  custom?: Record<string, unknown>
}

export interface ModuleProps<T = Record<string, unknown>> {
  content: T
  styles: ModuleStyles
  moduleId: string
  isEditing: boolean
  language: string
  defaultLanguage: string
  onContentChange?: (path: string, value: unknown) => void
  onStyleChange?: (path: string, value: unknown) => void
}

export interface SchemaField {
  key: string
  type:
    | 'text'
    | 'textarea'
    | 'richtext'
    | 'image'
    | 'list'
    | 'number'
    | 'boolean'
    | 'color'
    | 'link'
    | 'date'
    | 'select'
  label: MultilingualText
  description?: MultilingualText
  isMultilingual: boolean
  required: boolean
  defaultValue?: unknown
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
  listItemSchema?: SchemaField[]
  selectOptions?: Array<{ value: string; label: MultilingualText }>
  group?: string
  order?: number
}

export interface ModuleSchemaDef {
  key: string
  name: MultilingualText
  description: MultilingualText
  fields: SchemaField[]
  styleFields?: SchemaField[]
  version: number
}

export interface ModuleSeed {
  key: string
  content: Record<string, unknown>
  styles: ModuleStyles
  defaultOrder: number
  defaultEnabled: boolean
}

export interface ModuleRegistryEntry {
  key: string
  displayName: string
  description: string
  component: ComponentType<ModuleProps<Record<string, unknown>>>
  category: ModuleCategory
  isSystem: boolean
  defaultOrder: number
}

export type SectionKey =
  | 'hero'
  | 'value_prop'
  | 'how_it_works'
  | 'social_proof'
  | 'client_logos'
  | 'offer_form'
  | 'faq'
  | 'final_cta'
  | 'footer'
  | 'stats'
  | 'pricing'
  | 'video'
  | 'team'
  | 'gallery'
  | 'features_grid'
  | 'countdown'
  | 'comparison'
  | 'newsletter'
  | 'map_location'
