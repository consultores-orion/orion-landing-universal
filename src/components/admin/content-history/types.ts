export interface ContentChange {
  id: string
  user_id: string | null
  section_key: string
  field_path: string
  lang: string | null
  old_value: string | null
  new_value: string
  changed_at: string
}

export interface ContentChangesFiltersState {
  sectionKey: string
  dateFrom: string
  dateTo: string
}

export interface ContentChangesApiResponse {
  data: ContentChange[]
  total: number
  page: number
  limit: number
  totalPages: number
}
