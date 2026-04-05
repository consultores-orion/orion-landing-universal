import type { MultilingualText, MultilingualImage } from '@/lib/modules/types'

export interface HeroButton {
  label: MultilingualText
  url: string
  variant: 'primary' | 'secondary' | 'outline'
}

export interface HeroContent {
  title: MultilingualText
  subtitle: MultilingualText
  description?: MultilingualText
  primaryButton?: HeroButton
  secondaryButton?: HeroButton
  backgroundImage?: MultilingualImage
  backgroundVideo?: string
  overlayOpacity?: number
  layout?: 'centered' | 'left' | 'split'
}
