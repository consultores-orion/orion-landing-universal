import type { MultilingualText } from '@/lib/modules/types'

export interface ComparisonColumn {
  id: string
  name: MultilingualText
  is_highlighted?: boolean
  badge?: MultilingualText
}

export type CellValue =
  | { type: 'check'; value: true }
  | { type: 'cross'; value: false }
  | { type: 'text'; value: MultilingualText }

export interface ComparisonRow {
  id: string
  feature: MultilingualText
  values: Record<string, CellValue>
}

export interface ComparisonContent {
  title?: MultilingualText
  subtitle?: MultilingualText
  columns: ComparisonColumn[]
  rows: ComparisonRow[]
}
