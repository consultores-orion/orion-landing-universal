import type { MultilingualText } from '@/lib/modules/types'

export interface FaqItem {
  id: string
  question: MultilingualText
  answer: MultilingualText
}

export interface FaqContent {
  title: MultilingualText
  subtitle?: MultilingualText
  items: FaqItem[]
  layout?: 'single' | 'two-columns'
}
