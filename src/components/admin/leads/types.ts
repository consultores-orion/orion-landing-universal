export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  message: string
  preferred_date: string | null
  preferred_time: string | null
  source_module: string
  metadata: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface LeadFiltersState {
  status: 'all' | 'read' | 'unread'
  source: string // 'all' or a source_module value
  search: string
  dateFrom: string // ISO date string or ''
  dateTo: string // ISO date string or ''
}

export interface LeadsApiResponse {
  data: Lead[]
  total: number
  page: number
  limit: number
  totalPages: number
}
