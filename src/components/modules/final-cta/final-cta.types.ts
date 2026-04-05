import type { MultilingualText } from '@/lib/modules/types'

export interface FinalCtaContent {
  title: MultilingualText
  subtitle?: MultilingualText
  description?: MultilingualText
  primaryButton: {
    label: MultilingualText
    url: string
  }
  secondaryButton?: {
    label: MultilingualText
    url: string
  }
  backgroundStyle?: 'gradient' | 'solid' | 'transparent'
}
