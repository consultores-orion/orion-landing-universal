import type { MultilingualText } from '@/lib/modules/types'

export interface HowItWorksStep {
  number: number
  title: MultilingualText
  description: MultilingualText
  icon?: string
}

export interface HowItWorksContent {
  title: MultilingualText
  subtitle?: MultilingualText
  steps: HowItWorksStep[]
  layout?: 'horizontal' | 'vertical' | 'alternating'
}
