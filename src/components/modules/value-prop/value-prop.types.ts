import type { MultilingualText } from '@/lib/modules/types'

export interface ValuePropItem {
  icon: string
  title: MultilingualText
  description: MultilingualText
}

export interface ValuePropContent {
  title: MultilingualText
  subtitle?: MultilingualText
  items: ValuePropItem[]
  columns?: 2 | 3 | 4
  layout?: 'cards' | 'minimal' | 'icons-top'
}
