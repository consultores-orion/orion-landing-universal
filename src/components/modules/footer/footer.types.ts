import type { MultilingualText } from '@/lib/modules/types'

export interface FooterLink {
  label: MultilingualText
  url: string
}

export interface FooterColumn {
  title: MultilingualText
  links: FooterLink[]
}

export interface FooterContent {
  columns: FooterColumn[]
  copyright: MultilingualText
  showSocialLinks?: boolean
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
    tiktok?: string
  }
  legalLinks?: FooterLink[]
}
