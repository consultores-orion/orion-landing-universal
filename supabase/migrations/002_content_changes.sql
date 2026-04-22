-- ============================================================================
-- Orion Landing Universal — Content Change Log
-- Version: 1.0.0
-- Date: 2026-04-05
-- Description: Audit log table for inline-edit operations (who changed what and when).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: content_changes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_changes (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
    section_key VARCHAR(50)   NOT NULL,
    field_path  VARCHAR(200)  NOT NULL,
    lang        VARCHAR(10),
    old_value   TEXT,
    new_value   TEXT          NOT NULL,
    changed_at  TIMESTAMPTZ   DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
ALTER TABLE content_changes ENABLE ROW LEVEL SECURITY;

-- Authenticated admins can read all change entries
CREATE POLICY "content_changes_admin_select"
    ON content_changes FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated users can insert change entries (logged in inline-edit API)
CREATE POLICY "content_changes_admin_insert"
    ON content_changes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated admins can delete entries (cleanup)
CREATE POLICY "content_changes_admin_delete"
    ON content_changes FOR DELETE
    USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- Indices
-- ----------------------------------------------------------------------------
CREATE INDEX idx_content_changes_section_key ON content_changes (section_key);
CREATE INDEX idx_content_changes_changed_at  ON content_changes (changed_at DESC);
CREATE INDEX idx_content_changes_user_id     ON content_changes (user_id);
CREATE INDEX idx_content_changes_field       ON content_changes (section_key, field_path);

-- ============================================================================
-- End of migration 002_content_changes
-- ============================================================================
