import type { MultilingualText } from '@/lib/modules/types'

export interface PricingFeature {
  id: string
  text: MultilingualText
  included: boolean
}

export interface PricingPlan {
  id: string
  name: MultilingualText
  description?: MultilingualText
  price_monthly: number
  price_annual: number
  currency: string
  period_monthly: MultilingualText
  period_annual: MultilingualText
  features: PricingFeature[]
  is_highlighted: boolean
  badge?: MultilingualText
  cta_label: MultilingualText
  cta_url: string
}

export interface PricingContent {
  title?: MultilingualText
  subtitle?: MultilingualText
  plans: PricingPlan[]
  toggle_monthly_label?: MultilingualText
  toggle_annual_label?: MultilingualText
  annual_savings_label?: MultilingualText
}
