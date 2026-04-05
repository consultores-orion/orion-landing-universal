import type { MultilingualText } from '@/lib/modules/types'

export interface NewsletterContent {
  title?: MultilingualText
  subtitle?: MultilingualText
  placeholder_email?: MultilingualText
  button_label?: MultilingualText
  success_title?: MultilingualText
  success_message?: MultilingualText
  privacy_text?: MultilingualText
}
