// ============================================================================
// Orion Landing Universal — Migration SQL as TypeScript exports
// Source: supabase/migrations/001_initial_schema.sql
// ============================================================================

export const SHARED_FUNCTIONS_SQL = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`

export interface MigrationTable {
  name: string
  description: string
  sql: string
}

export const MIGRATION_TABLES: MigrationTable[] = [
  {
    name: 'site_config',
    description: "Singleton configuration — one row with id='main'",
    sql: `
CREATE TABLE IF NOT EXISTS site_config (
    id                    VARCHAR(10)   PRIMARY KEY DEFAULT 'main',
    site_name             VARCHAR(255)  NOT NULL DEFAULT 'Mi Sitio',
    site_description      TEXT          DEFAULT '',
    favicon_url           VARCHAR(500)  DEFAULT '',
    logo_url              VARCHAR(500)  DEFAULT '',
    logo_dark_url         VARCHAR(500)  DEFAULT '',
    primary_contact_email VARCHAR(255)  DEFAULT '',
    social_links          JSONB         DEFAULT '{}'::jsonb,
    analytics_ids         JSONB         DEFAULT '{}'::jsonb,
    custom_css            TEXT          DEFAULT '',
    custom_head_scripts   TEXT          DEFAULT '',
    setup_completed       BOOLEAN       DEFAULT false,
    created_at            TIMESTAMPTZ   DEFAULT now(),
    updated_at            TIMESTAMPTZ   DEFAULT now(),

    CONSTRAINT site_config_singleton CHECK (id = 'main')
);`,
  },
  {
    name: 'languages',
    description: 'Supported languages with default/active flags',
    sql: `
CREATE TABLE IF NOT EXISTS languages (
    code        VARCHAR(10)  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    is_default  BOOLEAN      DEFAULT false,
    is_active   BOOLEAN      DEFAULT true,
    flag_emoji  VARCHAR(10)  DEFAULT '',
    sort_order  INTEGER      DEFAULT 0,
    created_at  TIMESTAMPTZ  DEFAULT now()
);`,
  },
  {
    name: 'page_modules',
    description: 'Landing page sections with JSONB content and styles',
    sql: `
CREATE TABLE IF NOT EXISTS page_modules (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key    VARCHAR(50)  NOT NULL UNIQUE,
    display_name   JSONB        NOT NULL DEFAULT '{}'::jsonb,
    content        JSONB        NOT NULL DEFAULT '{}'::jsonb,
    styles         JSONB        DEFAULT '{}'::jsonb,
    display_order  INTEGER      NOT NULL DEFAULT 0,
    is_visible     BOOLEAN      DEFAULT true,
    is_system      BOOLEAN      DEFAULT false,
    schema_version INTEGER      DEFAULT 1,
    created_at     TIMESTAMPTZ  DEFAULT now(),
    updated_at     TIMESTAMPTZ  DEFAULT now()
);`,
  },
  {
    name: 'module_schemas',
    description: 'Field definitions and defaults for each module type',
    sql: `
CREATE TABLE IF NOT EXISTS module_schemas (
    section_key     VARCHAR(50) PRIMARY KEY,
    fields          JSONB       NOT NULL DEFAULT '[]'::jsonb,
    default_content JSONB       NOT NULL DEFAULT '{}'::jsonb,
    default_styles  JSONB       DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT now()
);`,
  },
  {
    name: 'leads',
    description: 'Captured leads from forms',
    sql: `
CREATE TABLE IF NOT EXISTS leads (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) DEFAULT '',
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50)  DEFAULT '',
    message         TEXT         DEFAULT '',
    preferred_date  DATE,
    preferred_time  TIME,
    source_module   VARCHAR(50)  DEFAULT 'offer_form',
    metadata        JSONB        DEFAULT '{}'::jsonb,
    is_read         BOOLEAN      DEFAULT false,
    created_at      TIMESTAMPTZ  DEFAULT now()
);`,
  },
  {
    name: 'media',
    description: 'Uploaded media files with metadata',
    sql: `
CREATE TABLE IF NOT EXISTS media (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    public_url  VARCHAR(500) NOT NULL,
    mime_type   VARCHAR(100) NOT NULL,
    file_size   INTEGER      NOT NULL DEFAULT 0,
    alt_text    JSONB        DEFAULT '{}'::jsonb,
    folder      VARCHAR(100) DEFAULT 'general',
    width       INTEGER,
    height      INTEGER,
    uploaded_by UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ  DEFAULT now()
);`,
  },
  {
    name: 'theme_config',
    description: 'Theme settings — palette, typography, spacing',
    sql: `
CREATE TABLE IF NOT EXISTS theme_config (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    palette_id    VARCHAR(50) NOT NULL DEFAULT 'professional-blue',
    custom_colors JSONB       DEFAULT '{}'::jsonb,
    typography    JSONB       DEFAULT '{"font_heading":"Inter","font_body":"Inter","base_size":"16px","scale_ratio":1.25}'::jsonb,
    spacing       JSONB       DEFAULT '{"section_padding":"80px","container_max_width":"1200px","element_gap":"24px"}'::jsonb,
    border_radius VARCHAR(20) DEFAULT '8px',
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);`,
  },
  {
    name: 'color_palettes',
    description: 'Predefined and custom color palettes',
    sql: `
CREATE TABLE IF NOT EXISTS color_palettes (
    id            VARCHAR(50)  PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    description   TEXT         DEFAULT '',
    niche         VARCHAR(100) DEFAULT 'general',
    colors        JSONB        NOT NULL,
    is_predefined BOOLEAN      DEFAULT false,
    created_at    TIMESTAMPTZ  DEFAULT now()
);`,
  },
  {
    name: 'integrations',
    description: 'Third-party integration configurations',
    sql: `
CREATE TABLE IF NOT EXISTS integrations (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type       VARCHAR(50) NOT NULL UNIQUE,
    config     JSONB       DEFAULT '{}'::jsonb,
    is_active  BOOLEAN     DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);`,
  },
  {
    name: 'seo_config',
    description: 'SEO metadata per page',
    sql: `
CREATE TABLE IF NOT EXISTS seo_config (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key         VARCHAR(50)  NOT NULL UNIQUE DEFAULT 'home',
    meta_title       JSONB        DEFAULT '{}'::jsonb,
    meta_description JSONB        DEFAULT '{}'::jsonb,
    og_image_url     VARCHAR(500) DEFAULT '',
    canonical_url    VARCHAR(500) DEFAULT '',
    robots           VARCHAR(100) DEFAULT 'index, follow',
    structured_data  JSONB        DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ  DEFAULT now(),
    updated_at       TIMESTAMPTZ  DEFAULT now()
);`,
  },
]

export const TRIGGERS_SQL = `
CREATE TRIGGER trg_site_config_updated_at
    BEFORE UPDATE ON site_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_page_modules_updated_at
    BEFORE UPDATE ON page_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_theme_config_updated_at
    BEFORE UPDATE ON theme_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_seo_config_updated_at
    BEFORE UPDATE ON seo_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`

export const RLS_POLICIES_SQL = `
-- Enable RLS on ALL tables
ALTER TABLE site_config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_modules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE media          ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_config     ENABLE ROW LEVEL SECURITY;

-- site_config — Pattern A (public read, admin write)
CREATE POLICY "site_config_public_read"
    ON site_config FOR SELECT
    USING (true);

CREATE POLICY "site_config_admin_write"
    ON site_config FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- languages — Pattern A (public read, admin write)
CREATE POLICY "languages_public_read"
    ON languages FOR SELECT
    USING (true);

CREATE POLICY "languages_admin_write"
    ON languages FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- page_modules — Special policies
CREATE POLICY "page_modules_public_read"
    ON page_modules FOR SELECT
    USING (is_visible = true);

CREATE POLICY "page_modules_admin_read"
    ON page_modules FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "page_modules_admin_insert"
    ON page_modules FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "page_modules_admin_update"
    ON page_modules FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "page_modules_admin_delete"
    ON page_modules FOR DELETE
    USING (auth.role() = 'authenticated' AND is_system = false);

-- module_schemas — Pattern A (public read, admin write)
CREATE POLICY "module_schemas_public_read"
    ON module_schemas FOR SELECT
    USING (true);

CREATE POLICY "module_schemas_admin_write"
    ON module_schemas FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- leads — Special policies (public insert, admin manage)
CREATE POLICY "leads_public_insert"
    ON leads FOR INSERT
    WITH CHECK (true);

CREATE POLICY "leads_admin_select"
    ON leads FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "leads_admin_update"
    ON leads FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "leads_admin_delete"
    ON leads FOR DELETE
    USING (auth.role() = 'authenticated');

-- media — Special policies (public read, admin CRUD)
CREATE POLICY "media_public_read"
    ON media FOR SELECT
    USING (true);

CREATE POLICY "media_admin_insert"
    ON media FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "media_admin_update"
    ON media FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "media_admin_delete"
    ON media FOR DELETE
    USING (auth.role() = 'authenticated');

-- theme_config — Pattern A (public read, admin write)
CREATE POLICY "theme_config_public_read"
    ON theme_config FOR SELECT
    USING (true);

CREATE POLICY "theme_config_admin_write"
    ON theme_config FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- color_palettes — Special policies
CREATE POLICY "color_palettes_public_read"
    ON color_palettes FOR SELECT
    USING (true);

CREATE POLICY "color_palettes_admin_insert"
    ON color_palettes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "color_palettes_admin_update"
    ON color_palettes FOR UPDATE
    USING (auth.role() = 'authenticated' AND is_predefined = false)
    WITH CHECK (auth.role() = 'authenticated' AND is_predefined = false);

CREATE POLICY "color_palettes_admin_delete"
    ON color_palettes FOR DELETE
    USING (auth.role() = 'authenticated' AND is_predefined = false);

-- integrations — NO public access (admin only)
CREATE POLICY "integrations_admin_read"
    ON integrations FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "integrations_admin_write"
    ON integrations FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- seo_config — Pattern A (public read, admin write)
CREATE POLICY "seo_config_public_read"
    ON seo_config FOR SELECT
    USING (true);

CREATE POLICY "seo_config_admin_write"
    ON seo_config FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
`

export const INDICES_SQL = `
-- page_modules
CREATE INDEX IF NOT EXISTS idx_page_modules_display_order ON page_modules (display_order);
CREATE INDEX IF NOT EXISTS idx_page_modules_visible       ON page_modules (is_visible) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_page_modules_section_key   ON page_modules (section_key);

-- leads
CREATE INDEX IF NOT EXISTS idx_leads_created_at    ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_is_read       ON leads (is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_leads_email         ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_source_module ON leads (source_module);

-- media
CREATE INDEX IF NOT EXISTS idx_media_folder     ON media (folder);
CREATE INDEX IF NOT EXISTS idx_media_mime_type  ON media (mime_type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media (created_at DESC);

-- integrations
CREATE INDEX IF NOT EXISTS idx_integrations_type   ON integrations (type);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations (is_active) WHERE is_active = true;

-- seo_config
CREATE INDEX IF NOT EXISTS idx_seo_config_page_key ON seo_config (page_key);

-- languages — ensure only one default language at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_languages_single_default ON languages (is_default) WHERE is_default = true;
`

/**
 * Returns the full migration SQL in the correct execution order:
 * 1. Shared functions
 * 2. Tables (in dependency order)
 * 3. Triggers
 * 4. RLS policies
 * 5. Indices
 */
export function getFullMigrationSQL(): string {
  const tablesSql = MIGRATION_TABLES.map((t) => t.sql).join('\n')

  return [
    '-- Shared functions',
    SHARED_FUNCTIONS_SQL,
    '-- Tables',
    tablesSql,
    '-- Triggers',
    TRIGGERS_SQL,
    '-- RLS policies',
    RLS_POLICIES_SQL,
    '-- Indices',
    INDICES_SQL,
  ].join('\n')
}
