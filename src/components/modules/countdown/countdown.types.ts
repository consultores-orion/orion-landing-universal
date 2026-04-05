import type { MultilingualText } from '@/lib/modules/types'

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface CountdownContent {
  title?: MultilingualText
  subtitle?: MultilingualText
  target_date: string
  expired_message?: MultilingualText
  expired_action_url?: string
  expired_action_label?: MultilingualText
  show_days?: boolean
  show_hours?: boolean
  show_minutes?: boolean
  show_seconds?: boolean
  days_label?: MultilingualText
  hours_label?: MultilingualText
  minutes_label?: MultilingualText
  seconds_label?: MultilingualText
}
