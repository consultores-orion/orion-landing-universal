import type { MultilingualText, MultilingualImage } from '@/lib/modules/types'

export interface Testimonial {
  id: string
  quote: MultilingualText
  authorName: string
  authorRole?: MultilingualText
  authorAvatar?: MultilingualImage
  rating?: 1 | 2 | 3 | 4 | 5
  company?: string
}

export interface SocialProofContent {
  title: MultilingualText
  subtitle?: MultilingualText
  testimonials: Testimonial[]
  layout?: 'carousel' | 'grid' | 'masonry'
}
