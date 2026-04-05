import type { MultilingualText, MultilingualImage } from '@/lib/modules/types'

export interface ClientLogo {
  id: string
  name: string
  logoImage: MultilingualImage
}

export interface ClientLogosContent {
  title?: MultilingualText
  logos: ClientLogo[]
  speed?: 'slow' | 'normal' | 'fast'
  showTitle?: boolean
}
