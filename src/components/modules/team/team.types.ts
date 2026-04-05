import type { MultilingualText } from '@/lib/modules/types'

export interface TeamMemberSocial {
  twitter?: string
  linkedin?: string
  github?: string
  instagram?: string
  website?: string
}

export interface TeamMember {
  id: string
  name: string
  role: MultilingualText
  bio?: MultilingualText
  avatar_url?: string
  social?: TeamMemberSocial
}

export type TeamLayout = 'grid' | 'centered'

export interface TeamContent {
  title?: MultilingualText
  subtitle?: MultilingualText
  layout?: TeamLayout
  columns?: 2 | 3 | 4
  members: TeamMember[]
}
