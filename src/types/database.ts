/**
 * Supabase database types — auto-generated placeholder.
 *
 * Run `pnpm db:types` to regenerate from the live Supabase schema.
 * Until then, this file provides the base type structure for development.
 *
 * IMPORTANT: Each table MUST include a `Relationships` array to satisfy
 * the GenericTable constraint in @supabase/postgrest-js >= 2.x.
 * Without it, insert/update/upsert generics resolve to `never`.
 */

export interface Database {
  public: {
    Tables: {
      site_config: {
        Row: {
          id: string
          site_name: string
          site_description: string
          favicon_url: string
          logo_url: string
          logo_dark_url: string
          primary_contact_email: string
          social_links: Record<string, string>
          analytics_ids: Record<string, string>
          custom_css: string
          custom_head_scripts: string
          setup_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_name?: string
          site_description?: string
          favicon_url?: string
          logo_url?: string
          logo_dark_url?: string
          primary_contact_email?: string
          social_links?: Record<string, string>
          analytics_ids?: Record<string, string>
          custom_css?: string
          custom_head_scripts?: string
          setup_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_name?: string
          site_description?: string
          favicon_url?: string
          logo_url?: string
          logo_dark_url?: string
          primary_contact_email?: string
          social_links?: Record<string, string>
          analytics_ids?: Record<string, string>
          custom_css?: string
          custom_head_scripts?: string
          setup_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          name: string
          native_name: string
          is_default: boolean
          is_active: boolean
          flag_emoji: string
          sort_order: number
          created_at: string
        }
        Insert: {
          code: string
          name: string
          native_name: string
          is_default: boolean
          is_active: boolean
          flag_emoji: string
          sort_order: number
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          native_name?: string
          is_default?: boolean
          is_active?: boolean
          flag_emoji?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      page_modules: {
        Row: {
          id: string
          section_key: string
          display_name: Record<string, string>
          content: Record<string, unknown>
          styles: Record<string, unknown>
          display_order: number
          is_visible: boolean
          is_system: boolean
          schema_version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_key: string
          display_name?: Record<string, string>
          content?: Record<string, unknown>
          styles?: Record<string, unknown>
          display_order?: number
          is_visible?: boolean
          is_system?: boolean
          schema_version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_key?: string
          display_name?: Record<string, string>
          content?: Record<string, unknown>
          styles?: Record<string, unknown>
          display_order?: number
          is_visible?: boolean
          is_system?: boolean
          schema_version?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_schemas: {
        Row: {
          section_key: string
          fields: unknown[]
          default_content: Record<string, unknown>
          default_styles: Record<string, unknown>
          created_at: string
        }
        Insert: {
          section_key: string
          fields: unknown[]
          default_content: Record<string, unknown>
          default_styles: Record<string, unknown>
          created_at?: string
        }
        Update: {
          section_key?: string
          fields?: unknown[]
          default_content?: Record<string, unknown>
          default_styles?: Record<string, unknown>
          created_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
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
        Insert: {
          id?: string
          name?: string
          email: string
          phone?: string
          message?: string
          preferred_date?: string | null
          preferred_time?: string | null
          source_module?: string
          metadata?: Record<string, unknown>
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          message?: string
          preferred_date?: string | null
          preferred_time?: string | null
          source_module?: string
          metadata?: Record<string, unknown>
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          file_name: string
          file_path: string
          public_url: string
          mime_type: string
          file_size: number
          alt_text: Record<string, string>
          folder: string
          width: number | null
          height: number | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_path: string
          public_url: string
          mime_type: string
          file_size: number
          alt_text?: Record<string, string>
          folder?: string
          width?: number | null
          height?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_path?: string
          public_url?: string
          mime_type?: string
          file_size?: number
          alt_text?: Record<string, string>
          folder?: string
          width?: number | null
          height?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      theme_config: {
        Row: {
          id: string
          palette_id: string
          custom_colors: Record<string, string>
          typography: Record<string, string | number>
          spacing: Record<string, string>
          border_radius: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          palette_id?: string
          custom_colors?: Record<string, string>
          typography?: Record<string, string | number>
          spacing?: Record<string, string>
          border_radius?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          palette_id?: string
          custom_colors?: Record<string, string>
          typography?: Record<string, string | number>
          spacing?: Record<string, string>
          border_radius?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      color_palettes: {
        Row: {
          id: string
          name: string
          description: string
          niche: string
          colors: Record<string, string>
          is_predefined: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description: string
          niche: string
          colors: Record<string, string>
          is_predefined: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          niche?: string
          colors?: Record<string, string>
          is_predefined?: boolean
          created_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          id: string
          type: string
          config: Record<string, unknown>
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          config?: Record<string, unknown>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          config?: Record<string, unknown>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_config: {
        Row: {
          id: string
          page_key: string
          meta_title: Record<string, string>
          meta_description: Record<string, string>
          og_image_url: string
          canonical_url: string
          robots: string
          structured_data: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_key?: string
          meta_title?: Record<string, string>
          meta_description?: Record<string, string>
          og_image_url?: string
          canonical_url?: string
          robots?: string
          structured_data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page_key?: string
          meta_title?: Record<string, string>
          meta_description?: Record<string, string>
          og_image_url?: string
          canonical_url?: string
          robots?: string
          structured_data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_changes: {
        Row: {
          id: string
          user_id: string | null
          section_key: string
          field_path: string
          lang: string | null
          old_value: string | null
          new_value: string
          changed_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          section_key: string
          field_path: string
          lang?: string | null
          old_value?: string | null
          new_value: string
          changed_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          section_key?: string
          field_path?: string
          lang?: string | null
          old_value?: string | null
          new_value?: string
          changed_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
