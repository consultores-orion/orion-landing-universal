import type { MultilingualText } from '@/lib/modules/types'

export type GalleryLayout = 'grid' | 'masonry'
export type GalleryColumns = 2 | 3 | 4

export interface GalleryImage {
  id: string
  url: string
  alt: MultilingualText
  caption?: MultilingualText
  category?: string
}

export interface GalleryContent {
  title?: MultilingualText
  subtitle?: MultilingualText
  layout?: GalleryLayout
  columns?: GalleryColumns
  images: GalleryImage[]
  show_captions?: boolean
}
