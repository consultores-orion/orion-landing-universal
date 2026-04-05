import type { MultilingualText } from '@/lib/modules/types'

export interface BusinessHours {
  day: MultilingualText
  hours: string
  closed?: boolean
}

export interface MapLocationContent {
  title?: MultilingualText
  address?: MultilingualText
  map_embed_url?: string
  aspect_ratio?: '16/9' | '4/3' | '1/1'
  hours?: BusinessHours[]
  phone?: string
  email?: string
  show_info_panel?: boolean
}
