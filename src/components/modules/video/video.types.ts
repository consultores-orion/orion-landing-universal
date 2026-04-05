import type { MultilingualText } from '@/lib/modules/types'

export type VideoType = 'youtube' | 'vimeo' | 'file'
export type AspectRatio = '16/9' | '4/3' | '1/1'

export interface VideoContent {
  title?: MultilingualText
  subtitle?: MultilingualText
  caption?: MultilingualText
  video_url: string
  video_type: VideoType
  poster_image_url?: string
  aspect_ratio?: AspectRatio
  autoplay?: boolean
}
