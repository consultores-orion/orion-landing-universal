export interface PaletteColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text_primary: string
  text_secondary: string
  success: string
  error: string
  warning: string
  info: string
  border: string
}

export interface ColorPalette {
  id: string
  name: string
  description: string
  niche: string
  colors: PaletteColors
  is_predefined: boolean
}

export interface ThemeConfig {
  id: string
  palette_id: string
  custom_colors: Partial<PaletteColors>
  typography: {
    font_heading: string
    font_body: string
    base_size: string
    scale_ratio: number
  }
  spacing: {
    section_padding: string
    container_max_width: string
    element_gap: string
  }
  border_radius: string
}
