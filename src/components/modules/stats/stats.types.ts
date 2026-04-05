import type { MultilingualText } from '@/lib/modules/types'

export interface StatItem {
  id: string
  value: number
  suffix?: string
  prefix?: string
  label: MultilingualText
  description?: MultilingualText
}

export interface StatsContent {
  title?: MultilingualText
  subtitle?: MultilingualText
  items: StatItem[]
  layout?: 'row' | 'grid'
}
