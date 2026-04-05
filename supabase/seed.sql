-- ============================================================================
-- Orion Landing Universal — Seed Data
-- Version: 1.0.0
-- Date: 2026-04-05
-- Description: Default seed data including 20 color palettes, default
--              languages, theme config, SEO config, and site config.
-- Author: Luis Enrique Gutierrez Campos — Orion AI Society
-- ============================================================================

-- ============================================================================
-- 1. COLOR PALETTES (20 predefined palettes)
-- ============================================================================

INSERT INTO color_palettes (id, name, description, niche, colors, is_predefined) VALUES

-- 1. professional-blue
('professional-blue', 'Azul Profesional', 'Paleta corporativa clasica con azul como color principal. Transmite confianza y profesionalismo.', 'corporativo', '{
    "primary": "#2563eb",
    "secondary": "#1e40af",
    "accent": "#3b82f6",
    "background": "#ffffff",
    "surface": "#f0f4ff",
    "text_primary": "#0f172a",
    "text_secondary": "#475569",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6",
    "border": "#dbeafe"
}'::jsonb, true),

-- 2. corporate-gray
('corporate-gray', 'Gris Corporativo', 'Paleta neutra y sobria para entornos empresariales. Elegancia sin distracciones.', 'corporativo', '{
    "primary": "#374151",
    "secondary": "#1f2937",
    "accent": "#6b7280",
    "background": "#ffffff",
    "surface": "#f9fafb",
    "text_primary": "#111827",
    "text_secondary": "#6b7280",
    "success": "#059669",
    "error": "#dc2626",
    "warning": "#d97706",
    "info": "#2563eb",
    "border": "#e5e7eb"
}'::jsonb, true),

-- 3. emerald-health
('emerald-health', 'Esmeralda Salud', 'Paleta verde esmeralda ideal para salud, bienestar y naturaleza.', 'salud', '{
    "primary": "#059669",
    "secondary": "#047857",
    "accent": "#10b981",
    "background": "#ffffff",
    "surface": "#ecfdf5",
    "text_primary": "#064e3b",
    "text_secondary": "#6b7280",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6",
    "border": "#d1fae5"
}'::jsonb, true),

-- 4. sunset-warm
('sunset-warm', 'Atardecer Calido', 'Tonos calidos de naranja y ambar. Ideal para gastronomia y hospitalidad.', 'gastronomia', '{
    "primary": "#ea580c",
    "secondary": "#c2410c",
    "accent": "#f97316",
    "background": "#fffbeb",
    "surface": "#fff7ed",
    "text_primary": "#431407",
    "text_secondary": "#78716c",
    "success": "#16a34a",
    "error": "#dc2626",
    "warning": "#eab308",
    "info": "#0284c7",
    "border": "#fed7aa"
}'::jsonb, true),

-- 5. royal-purple
('royal-purple', 'Purpura Real', 'Paleta purpura sofisticada para marcas premium y creativas.', 'creativo', '{
    "primary": "#7c3aed",
    "secondary": "#6d28d9",
    "accent": "#a78bfa",
    "background": "#ffffff",
    "surface": "#f5f3ff",
    "text_primary": "#1e1b4b",
    "text_secondary": "#6b7280",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6",
    "border": "#ddd6fe"
}'::jsonb, true),

-- 6. ocean-deep
('ocean-deep', 'Oceano Profundo', 'Azules y cianes oceanicos. Ideal para turismo, tecnologia marina y bienestar.', 'turismo', '{
    "primary": "#0891b2",
    "secondary": "#0e7490",
    "accent": "#06b6d4",
    "background": "#ffffff",
    "surface": "#ecfeff",
    "text_primary": "#083344",
    "text_secondary": "#64748b",
    "success": "#10b981",
    "error": "#f43f5e",
    "warning": "#f59e0b",
    "info": "#0ea5e9",
    "border": "#cffafe"
}'::jsonb, true),

-- 7. rose-elegance
('rose-elegance', 'Rosa Elegante', 'Paleta rosa para marcas femeninas, moda y belleza.', 'moda', '{
    "primary": "#e11d48",
    "secondary": "#be123c",
    "accent": "#fb7185",
    "background": "#ffffff",
    "surface": "#fff1f2",
    "text_primary": "#1c1917",
    "text_secondary": "#78716c",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6",
    "border": "#fecdd3"
}'::jsonb, true),

-- 8. forest-natural
('forest-natural', 'Bosque Natural', 'Verdes profundos del bosque. Ideal para agricultura, ecologia y outdoors.', 'ecologia', '{
    "primary": "#166534",
    "secondary": "#14532d",
    "accent": "#4ade80",
    "background": "#fefefe",
    "surface": "#f0fdf4",
    "text_primary": "#052e16",
    "text_secondary": "#6b7280",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#eab308",
    "info": "#0284c7",
    "border": "#bbf7d0"
}'::jsonb, true),

-- 9. slate-minimal
('slate-minimal', 'Pizarra Minimalista', 'Paleta minimalista en tonos pizarra. Para portafolios y diseno editorial.', 'minimalista', '{
    "primary": "#0f172a",
    "secondary": "#1e293b",
    "accent": "#94a3b8",
    "background": "#ffffff",
    "surface": "#f8fafc",
    "text_primary": "#0f172a",
    "text_secondary": "#64748b",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6",
    "border": "#e2e8f0"
}'::jsonb, true),

-- 10. golden-luxury
('golden-luxury', 'Dorado de Lujo', 'Dorados y ambares para marcas de lujo, joyeria y servicios premium.', 'lujo', '{
    "primary": "#b45309",
    "secondary": "#92400e",
    "accent": "#fbbf24",
    "background": "#fffbeb",
    "surface": "#fef3c7",
    "text_primary": "#1c1917",
    "text_secondary": "#78716c",
    "success": "#16a34a",
    "error": "#dc2626",
    "warning": "#f59e0b",
    "info": "#0284c7",
    "border": "#fde68a"
}'::jsonb, true),

-- 11. electric-startup
('electric-startup', 'Electrico Startup', 'Combinacion vibrante de purpura, azul y cian. Para startups y tech.', 'tecnologia', '{
    "primary": "#7c3aed",
    "secondary": "#2563eb",
    "accent": "#06b6d4",
    "background": "#ffffff",
    "surface": "#faf5ff",
    "text_primary": "#0f172a",
    "text_secondary": "#6b7280",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6",
    "border": "#e0e7ff"
}'::jsonb, true),

-- 12. terracotta-artisan
('terracotta-artisan', 'Terracota Artesanal', 'Tonos tierra y ocres para marcas artesanales, ceramica y productos organicos.', 'artesanal', '{
    "primary": "#b45309",
    "secondary": "#a16207",
    "accent": "#d97706",
    "background": "#fefce8",
    "surface": "#fef9c3",
    "text_primary": "#422006",
    "text_secondary": "#78716c",
    "success": "#16a34a",
    "error": "#dc2626",
    "warning": "#eab308",
    "info": "#0284c7",
    "border": "#fde047"
}'::jsonb, true),

-- 13. navy-legal
('navy-legal', 'Azul Marino Legal', 'Azul marino formal para bufetes, consultoras y servicios financieros.', 'legal', '{
    "primary": "#1e3a5f",
    "secondary": "#172554",
    "accent": "#3b82f6",
    "background": "#ffffff",
    "surface": "#eff6ff",
    "text_primary": "#0c1524",
    "text_secondary": "#64748b",
    "success": "#059669",
    "error": "#dc2626",
    "warning": "#d97706",
    "info": "#2563eb",
    "border": "#bfdbfe"
}'::jsonb, true),

-- 14. coral-creative
('coral-creative', 'Coral Creativo', 'Coral y naranja vibrante para agencias creativas y marketing.', 'creativo', '{
    "primary": "#f43f5e",
    "secondary": "#e11d48",
    "accent": "#fb923c",
    "background": "#ffffff",
    "surface": "#fff1f2",
    "text_primary": "#1c1917",
    "text_secondary": "#6b7280",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6",
    "border": "#fecdd3"
}'::jsonb, true),

-- 15. sky-education
('sky-education', 'Cielo Educativo', 'Azul cielo claro para educacion, e-learning y formacion.', 'educacion', '{
    "primary": "#0284c7",
    "secondary": "#0369a1",
    "accent": "#38bdf8",
    "background": "#ffffff",
    "surface": "#f0f9ff",
    "text_primary": "#0c4a6e",
    "text_secondary": "#64748b",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#0ea5e9",
    "border": "#bae6fd"
}'::jsonb, true),

-- 16. charcoal-industrial
('charcoal-industrial', 'Carbon Industrial', 'Gris carbon con acento naranja. Para industria, ingenieria y manufactura.', 'industrial', '{
    "primary": "#374151",
    "secondary": "#1f2937",
    "accent": "#f97316",
    "background": "#ffffff",
    "surface": "#f3f4f6",
    "text_primary": "#111827",
    "text_secondary": "#6b7280",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6",
    "border": "#d1d5db"
}'::jsonb, true),

-- 17. mint-fresh
('mint-fresh', 'Menta Fresca', 'Verde menta refrescante para spa, bienestar y productos naturales.', 'bienestar', '{
    "primary": "#0d9488",
    "secondary": "#0f766e",
    "accent": "#2dd4bf",
    "background": "#ffffff",
    "surface": "#f0fdfa",
    "text_primary": "#134e4a",
    "text_secondary": "#64748b",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6",
    "border": "#ccfbf1"
}'::jsonb, true),

-- 18. dark-mode
('dark-mode', 'Modo Oscuro', 'Paleta oscura con acentos brillantes. Para apps, SaaS y productos digitales.', 'tecnologia', '{
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "accent": "#06b6d4",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text_primary": "#f1f5f9",
    "text_secondary": "#94a3b8",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#38bdf8",
    "border": "#334155"
}'::jsonb, true),

-- 19. burgundy-wine
('burgundy-wine', 'Borgona Vino', 'Tonos borgona y vino para bodegas, gastronomia gourmet y eventos.', 'gastronomia', '{
    "primary": "#881337",
    "secondary": "#701a75",
    "accent": "#e11d48",
    "background": "#ffffff",
    "surface": "#fff1f2",
    "text_primary": "#1c1917",
    "text_secondary": "#78716c",
    "success": "#16a34a",
    "error": "#dc2626",
    "warning": "#eab308",
    "info": "#2563eb",
    "border": "#fecdd3"
}'::jsonb, true),

-- 20. pastel-soft
('pastel-soft', 'Pastel Suave', 'Pasteles suaves y delicados. Para bodas, maternidad y productos infantiles.', 'lifestyle', '{
    "primary": "#8b5cf6",
    "secondary": "#a78bfa",
    "accent": "#f472b6",
    "background": "#fefefe",
    "surface": "#faf5ff",
    "text_primary": "#1e1b4b",
    "text_secondary": "#6b7280",
    "success": "#34d399",
    "error": "#f87171",
    "warning": "#fbbf24",
    "info": "#60a5fa",
    "border": "#e9d5ff"
}'::jsonb, true)

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. DEFAULT LANGUAGES
-- ============================================================================

INSERT INTO languages (code, name, native_name, is_default, is_active, flag_emoji, sort_order) VALUES
('es', 'Spanish', 'Español', true, true, '🇪🇸', 1),
('en', 'English', 'English', false, true, '🇺🇸', 2)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. DEFAULT THEME CONFIG (professional-blue)
-- ============================================================================

INSERT INTO theme_config (palette_id, custom_colors, typography, spacing, border_radius) VALUES
(
    'professional-blue',
    '{}'::jsonb,
    '{"font_heading":"Inter","font_body":"Inter","base_size":"16px","scale_ratio":1.25}'::jsonb,
    '{"section_padding":"80px","container_max_width":"1200px","element_gap":"24px"}'::jsonb,
    '8px'
);

-- ============================================================================
-- 4. DEFAULT SEO CONFIG
-- ============================================================================

INSERT INTO seo_config (page_key, meta_title, meta_description, robots) VALUES
(
    'home',
    '{"es":"Mi Sitio Web","en":"My Website"}'::jsonb,
    '{"es":"Bienvenido a mi sitio web","en":"Welcome to my website"}'::jsonb,
    'index, follow'
)
ON CONFLICT (page_key) DO NOTHING;

-- ============================================================================
-- 5. DEFAULT SITE CONFIG
-- ============================================================================

INSERT INTO site_config (id, site_name, setup_completed) VALUES
('main', 'Mi Sitio', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- End of seed data
-- ============================================================================
