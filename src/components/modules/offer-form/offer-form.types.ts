import type { MultilingualText } from '@/lib/modules/types'

export interface FormField {
  key: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  label: MultilingualText
  placeholder?: MultilingualText
  required: boolean
  options?: Array<{ value: string; label: MultilingualText }>
}

export interface OfferFormContent {
  title: MultilingualText
  subtitle?: MultilingualText
  fields: FormField[]
  submitLabel: MultilingualText
  successMessage: MultilingualText
  sourceModule?: string
}
