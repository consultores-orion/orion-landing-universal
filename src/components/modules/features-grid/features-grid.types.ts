import type { MultilingualText } from '@/lib/modules/types'

export type FeatureIconName =
  | 'zap'
  | 'shield'
  | 'star'
  | 'check'
  | 'rocket'
  | 'heart'
  | 'globe'
  | 'lock'
  | 'chart'
  | 'users'
  | 'settings'
  | 'cpu'
  | 'code'
  | 'database'
  | 'cloud'
  | 'mobile'
  | 'mail'
  | 'bell'

export interface Feature {
  id: string
  icon: FeatureIconName
  title: MultilingualText
  description: MultilingualText
  color?: string
}

export type GridColumns = 2 | 3 | 4

export interface FeaturesGridContent {
  title?: MultilingualText
  subtitle?: MultilingualText
  columns?: GridColumns
  features: Feature[]
  show_icon_background?: boolean
}
