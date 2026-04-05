-- ============================================================================
-- Orion Landing Universal — Initial Database Schema
-- Version: 1.0.0
-- Date: 2026-04-05
-- Description: Consolidated migration with all 10 tables, triggers, RLS
--              policies, and performance indices for Supabase PostgreSQL.
-- Author: Luis Enrique Gutierrez Campos — Orion AI Society
-- ============================================================================

-- ============================================================================
-- 1. SHARED FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 site_config (singleton — one row with id='main')
-- ----------------------------------------------------------------------------
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
);

-- ----------------------------------------------------------------------------
-- 2.2 languages
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS languages (
    code        VARCHAR(10)  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    is_default  BOOLEAN      DEFAULT false,
    is_active   BOOLEAN      DEFAULT true,
    flag_emoji  VARCHAR(10)  DEFAULT '',
    sort_order  INTEGER      DEFAULT 0,
    created_at  TIMESTAMPTZ  DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2.3 page_modules
-- ----------------------------------------------------------------------------
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
);

-- ----------------------------------------------------------------------------
-- 2.4 module_schemas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS module_schemas (
    section_key     VARCHAR(50) PRIMARY KEY,
    fields          JSONB       NOT NULL DEFAULT '[]'::jsonb,
    default_content JSONB       NOT NULL DEFAULT '{}'::jsonb,
    default_styles  JSONB       DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2.5 leads
-- ----------------------------------------------------------------------------
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
);

-- ----------------------------------------------------------------------------
-- 2.6 media
-- ----------------------------------------------------------------------------
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
);

-- ----------------------------------------------------------------------------
-- 2.7 theme_config (singleton-ish — typically one row)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS theme_config (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    palette_id    VARCHAR(50) NOT NULL DEFAULT 'professional-blue',
    custom_colors JSONB       DEFAULT '{}'::jsonb,
    typography    JSONB       DEFAULT '{"font_heading":"Inter","font_body":"Inter","base_size":"16px","scale_ratio":1.25}'::jsonb,
    spacing       JSONB       DEFAULT '{"section_padding":"80px","container_max_width":"1200px","element_gap":"24px"}'::jsonb,
    border_radius VARCHAR(20) DEFAULT '8px',
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2.8 color_palettes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS color_palettes (
    id            VARCHAR(50)  PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    description   TEXT         DEFAULT '',
    niche         VARCHAR(100) DEFAULT 'general',
    colors        JSONB        NOT NULL,
    is_predefined BOOLEAN      DEFAULT false,
    created_at    TIMESTAMPTZ  DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2.9 integrations
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integrations (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type       VARCHAR(50) NOT NULL UNIQUE,
    config     JSONB       DEFAULT '{}'::jsonb,
    is_active  BOOLEAN     DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2.10 seo_config
-- ----------------------------------------------------------------------------
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
);

-- ============================================================================
-- 3. TRIGGERS (update_updated_at)
-- ============================================================================

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

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

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

-- ----------------------------------------------------------------------------
-- 4.1 site_config — Pattern A (public read, admin write)
-- ----------------------------------------------------------------------------
CREATE POLICY "site_config_public_read"
    ON site_config FOR SELECT
    USING (true);

CREATE POLICY "site_config_admin_write"
    ON site_config FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 4.2 languages — Pattern A (public read, admin write)
-- ----------------------------------------------------------------------------
CREATE POLICY "languages_public_read"
    ON languages FOR SELECT
    USING (true);

CREATE POLICY "languages_admin_write"
    ON languages FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 4.3 page_modules — Special policies
-- ----------------------------------------------------------------------------

-- Public: can only read visible modules
CREATE POLICY "page_modules_public_read"
    ON page_modules FOR SELECT
    USING (is_visible = true);

-- Admin: can read ALL modules (including hidden)
CREATE POLICY "page_modules_admin_read"
    ON page_modules FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin: can insert new modules
CREATE POLICY "page_modules_admin_insert"
    ON page_modules FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Admin: can update any module
CREATE POLICY "page_modules_admin_update"
    ON page_modules FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Admin: can delete non-system modules only
CREATE POLICY "page_modules_admin_delete"
    ON page_modules FOR DELETE
    USING (auth.role() = 'authenticated' AND is_system = false);

-- ----------------------------------------------------------------------------
-- 4.4 module_schemas — Pattern A (public read, admin write)
-- ----------------------------------------------------------------------------
CREATE POLICY "module_schemas_public_read"
    ON module_schemas FOR SELECT
    USING (true);

CREATE POLICY "module_schemas_admin_write"
    ON module_schemas FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 4.5 leads — Special policies (public insert, admin manage)
-- ----------------------------------------------------------------------------

-- Public: anyone can submit a lead
CREATE POLICY "leads_public_insert"
    ON leads FOR INSERT
    WITH CHECK (true);

-- Admin: can view all leads
CREATE POLICY "leads_admin_select"
    ON leads FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin: can update leads (mark as read, etc.)
CREATE POLICY "leads_admin_update"
    ON leads FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Admin: can delete leads
CREATE POLICY "leads_admin_delete"
    ON leads FOR DELETE
    USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 4.6 media — Special policies (public read, admin CRUD)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 4.7 theme_config — Pattern A (public read, admin write)
-- ----------------------------------------------------------------------------
CREATE POLICY "theme_config_public_read"
    ON theme_config FOR SELECT
    USING (true);

CREATE POLICY "theme_config_admin_write"
    ON theme_config FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 4.8 color_palettes — Special policies
-- ----------------------------------------------------------------------------

-- Public: anyone can read palettes
CREATE POLICY "color_palettes_public_read"
    ON color_palettes FOR SELECT
    USING (true);

-- Admin: can insert new palettes
CREATE POLICY "color_palettes_admin_insert"
    ON color_palettes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Admin: can update only custom palettes (not predefined)
CREATE POLICY "color_palettes_admin_update"
    ON color_palettes FOR UPDATE
    USING (auth.role() = 'authenticated' AND is_predefined = false)
    WITH CHECK (auth.role() = 'authenticated' AND is_predefined = false);

-- Admin: can delete only custom palettes (not predefined)
CREATE POLICY "color_palettes_admin_delete"
    ON color_palettes FOR DELETE
    USING (auth.role() = 'authenticated' AND is_predefined = false);

-- ----------------------------------------------------------------------------
-- 4.9 integrations — NO public access (admin only)
-- ----------------------------------------------------------------------------
CREATE POLICY "integrations_admin_read"
    ON integrations FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "integrations_admin_write"
    ON integrations FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 4.10 seo_config — Pattern A (public read, admin write)
-- ----------------------------------------------------------------------------
CREATE POLICY "seo_config_public_read"
    ON seo_config FOR SELECT
    USING (true);

CREATE POLICY "seo_config_admin_write"
    ON seo_config FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- 5. PERFORMANCE INDICES
-- ============================================================================

-- page_modules
CREATE INDEX idx_page_modules_display_order ON page_modules (display_order);
CREATE INDEX idx_page_modules_visible       ON page_modules (is_visible) WHERE is_visible = true;
CREATE INDEX idx_page_modules_section_key   ON page_modules (section_key);

-- leads
CREATE INDEX idx_leads_created_at    ON leads (created_at DESC);
CREATE INDEX idx_leads_is_read       ON leads (is_read) WHERE is_read = false;
CREATE INDEX idx_leads_email         ON leads (email);
CREATE INDEX idx_leads_source_module ON leads (source_module);

-- media
CREATE INDEX idx_media_folder     ON media (folder);
CREATE INDEX idx_media_mime_type  ON media (mime_type);
CREATE INDEX idx_media_created_at ON media (created_at DESC);

-- integrations
CREATE INDEX idx_integrations_type   ON integrations (type);
CREATE INDEX idx_integrations_active ON integrations (is_active) WHERE is_active = true;

-- seo_config
CREATE INDEX idx_seo_config_page_key ON seo_config (page_key);

-- languages — ensure only one default language at a time
CREATE UNIQUE INDEX idx_languages_single_default ON languages (is_default) WHERE is_default = true;

-- ============================================================================
-- End of migration 001_initial_schema
-- ============================================================================
