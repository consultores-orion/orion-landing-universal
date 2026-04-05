# Modelo de Datos — Orion Landing Universal

**Versión**: 1.0.0  
**Fecha**: 2026-04-04  
**Autor**: Luis Enrique Gutiérrez Campos  
**Motor de Base de Datos**: PostgreSQL (vía Supabase)

---

## 1. Visión General del Modelo

El modelo de datos está diseñado para soportar una landing page completamente configurable desde el navegador. Los principios clave son:

- **JSONB para contenido multilingüe**: Todo texto editable se almacena como JSONB con claves de código de idioma (`es`, `en`, `fr`, etc.), evitando tablas de traducción separadas
- **Módulos autocontenidos**: Cada módulo tiene su contenido y estilos en una sola fila de `page_modules`
- **RLS (Row Level Security)**: Todas las tablas tienen políticas de seguridad a nivel de fila
- **Mínimas relaciones**: Diseño deliberadamente plano para simplicidad y rendimiento

---

## 2. Diagrama Entidad-Relación

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│ site_config │     │  languages   │     │ theme_config  │
│ (singleton) │     │              │     │ (singleton)   │
└─────────────┘     └──────────────┘     └───────┬───────┘
                                                  │
                                                  │ palette_id
                                                  ▼
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│page_modules │     │module_schemas│     │color_palettes │
│             │────>│              │     │               │
│  section_key│     │  section_key │     └───────────────┘
└─────────────┘     └──────────────┘

┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   leads     │     │    media     │     │ integrations  │
│             │     │              │     │               │
└─────────────┘     └──────────────┘     └───────────────┘

                    ┌──────────────┐
                    │  seo_config  │
                    │              │
                    └──────────────┘
```

---

## 3. Definición de Tablas

### 3.1 `site_config` — Configuración Global del Sitio

Tabla singleton que almacena la configuración general del sitio. Solo una fila, identificada por `id = 'main'`.

```sql
CREATE TABLE site_config (
    id VARCHAR(10) PRIMARY KEY DEFAULT 'main',
    site_name VARCHAR(255) NOT NULL DEFAULT 'Mi Sitio',
    site_description TEXT DEFAULT '',
    favicon_url VARCHAR(500) DEFAULT '',
    logo_url VARCHAR(500) DEFAULT '',
    logo_dark_url VARCHAR(500) DEFAULT '',
    primary_contact_email VARCHAR(255) DEFAULT '',
    social_links JSONB DEFAULT '{}'::jsonb,
    analytics_ids JSONB DEFAULT '{}'::jsonb,
    custom_css TEXT DEFAULT '',
    custom_head_scripts TEXT DEFAULT '',
    setup_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT site_config_singleton CHECK (id = 'main')
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_config_updated_at
    BEFORE UPDATE ON site_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Estructura JSONB — `social_links`**:

```json
{
  "facebook": "https://facebook.com/miempresa",
  "instagram": "https://instagram.com/miempresa",
  "twitter": "https://twitter.com/miempresa",
  "linkedin": "https://linkedin.com/company/miempresa",
  "youtube": "https://youtube.com/@miempresa",
  "tiktok": "",
  "whatsapp": "+521234567890"
}
```

**Estructura JSONB — `analytics_ids`**:

```json
{
  "google_analytics_id": "G-XXXXXXXXXX",
  "google_tag_manager_id": "GTM-XXXXXXX",
  "meta_pixel_id": "1234567890",
  "hotjar_id": ""
}
```

**RLS Policies**:

```sql
-- Lectura pública (el sitio necesita esta config para renderizar)
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_config_public_read" ON site_config
    FOR SELECT
    USING (true);

CREATE POLICY "site_config_admin_write" ON site_config
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

**Índices**:

```sql
-- No se requieren índices adicionales: tabla singleton, PK es suficiente
```

---

### 3.2 `languages` — Registro de Idiomas

Almacena los idiomas configurados para el sitio. Solo uno puede ser `is_default = true`.

```sql
CREATE TABLE languages (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    flag_emoji VARCHAR(10) DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Garantizar que solo un idioma sea el predeterminado
CREATE UNIQUE INDEX idx_languages_single_default
    ON languages (is_default)
    WHERE is_default = true;
```

**Datos semilla (seed)**:

```sql
INSERT INTO languages (code, name, native_name, is_default, is_active, flag_emoji, sort_order)
VALUES
    ('es', 'Spanish', 'Español', true, true, '🇪🇸', 1),
    ('en', 'English', 'English', false, true, '🇺🇸', 2);
```

**RLS Policies**:

```sql
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "languages_public_read" ON languages
    FOR SELECT
    USING (true);

CREATE POLICY "languages_admin_write" ON languages
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

---

### 3.3 `page_modules` — Módulos de Página y Contenido

Tabla central del sistema. Cada fila representa un módulo visible en la landing page, con su contenido multilingüe y estilos personalizados.

```sql
CREATE TABLE page_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key VARCHAR(50) NOT NULL UNIQUE,
    display_name JSONB NOT NULL DEFAULT '{}'::jsonb,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    styles JSONB DEFAULT '{}'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    schema_version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_page_modules_updated_at
    BEFORE UPDATE ON page_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Estructura JSONB — `display_name`** (nombre visible en el admin):

```json
{
  "es": "Hero / Banner Principal",
  "en": "Hero / Main Banner"
}
```

**Estructura JSONB — `content`** (contenido multilingüe del módulo):

```json
{
  "es": {
    "title": "Transformamos tu Negocio Digital",
    "subtitle": "Soluciones tecnológicas que impulsan resultados reales",
    "cta_text": "Solicitar Cotización",
    "cta_url": "#contacto",
    "background_image": "https://xxxxx.supabase.co/storage/v1/object/public/media/hero-bg.jpg",
    "overlay_opacity": 0.6
  },
  "en": {
    "title": "We Transform Your Digital Business",
    "subtitle": "Technology solutions that drive real results",
    "cta_text": "Request a Quote",
    "cta_url": "#contact",
    "background_image": "https://xxxxx.supabase.co/storage/v1/object/public/media/hero-bg.jpg",
    "overlay_opacity": 0.6
  }
}
```

**Estructura JSONB — `styles`** (estilos personalizados por módulo):

```json
{
  "background_color": "",
  "text_color": "",
  "padding_top": "80px",
  "padding_bottom": "80px",
  "max_width": "1200px",
  "custom_classes": "",
  "animation": "fade-up"
}
```

**Ejemplo completo de contenido — módulo `faq`**:

```json
{
  "es": {
    "title": "Preguntas Frecuentes",
    "subtitle": "Encuentra respuestas a las dudas más comunes",
    "items": [
      {
        "question": "¿Cuánto tiempo tarda el proceso?",
        "answer": "El proceso completo toma entre 2 y 4 semanas dependiendo de la complejidad."
      },
      {
        "question": "¿Ofrecen soporte post-implementación?",
        "answer": "Sí, incluimos 3 meses de soporte técnico gratuito."
      }
    ]
  },
  "en": {
    "title": "Frequently Asked Questions",
    "subtitle": "Find answers to the most common questions",
    "items": [
      {
        "question": "How long does the process take?",
        "answer": "The complete process takes between 2 and 4 weeks depending on complexity."
      },
      {
        "question": "Do you offer post-implementation support?",
        "answer": "Yes, we include 3 months of free technical support."
      }
    ]
  }
}
```

**Ejemplo completo de contenido — módulo `pricing`**:

```json
{
  "es": {
    "title": "Planes y Precios",
    "subtitle": "Elige el plan que mejor se adapte a tu negocio",
    "plans": [
      {
        "name": "Básico",
        "price": "$99",
        "period": "/mes",
        "description": "Ideal para emprendedores",
        "features": ["Hasta 1,000 visitantes/mes", "Soporte por email", "1 idioma"],
        "cta_text": "Comenzar",
        "is_featured": false
      },
      {
        "name": "Profesional",
        "price": "$249",
        "period": "/mes",
        "description": "Para negocios en crecimiento",
        "features": [
          "Hasta 10,000 visitantes/mes",
          "Soporte prioritario",
          "Idiomas ilimitados",
          "Integraciones avanzadas"
        ],
        "cta_text": "Comenzar",
        "is_featured": true
      }
    ]
  }
}
```

**RLS Policies**:

```sql
ALTER TABLE page_modules ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo módulos visibles
CREATE POLICY "page_modules_public_read" ON page_modules
    FOR SELECT
    USING (is_visible = true);

-- Admin: lectura completa (incluyendo módulos ocultos)
CREATE POLICY "page_modules_admin_read_all" ON page_modules
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin: escritura completa
CREATE POLICY "page_modules_admin_write" ON page_modules
    FOR INSERT
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "page_modules_admin_update" ON page_modules
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "page_modules_admin_delete" ON page_modules
    FOR DELETE
    USING (auth.role() = 'authenticated' AND is_system = false);
```

**Índices**:

```sql
CREATE INDEX idx_page_modules_display_order ON page_modules (display_order);
CREATE INDEX idx_page_modules_visible ON page_modules (is_visible) WHERE is_visible = true;
CREATE INDEX idx_page_modules_section_key ON page_modules (section_key);
```

---

### 3.4 `module_schemas` — Esquemas de Módulos

Define la estructura de campos editables para cada tipo de módulo. El admin panel usa estos esquemas para generar formularios de edición automáticamente.

```sql
CREATE TABLE module_schemas (
    section_key VARCHAR(50) PRIMARY KEY,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    default_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    default_styles JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Estructura JSONB — `fields`** (describe los campos editables):

```json
[
  {
    "key": "title",
    "type": "text",
    "label": { "es": "Título", "en": "Title" },
    "required": true,
    "max_length": 200,
    "placeholder": { "es": "Escribe el título principal", "en": "Write the main title" }
  },
  {
    "key": "subtitle",
    "type": "textarea",
    "label": { "es": "Subtítulo", "en": "Subtitle" },
    "required": false,
    "max_length": 500
  },
  {
    "key": "cta_text",
    "type": "text",
    "label": { "es": "Texto del botón CTA", "en": "CTA Button Text" },
    "required": true,
    "max_length": 50
  },
  {
    "key": "cta_url",
    "type": "url",
    "label": { "es": "URL del botón CTA", "en": "CTA Button URL" },
    "required": true
  },
  {
    "key": "background_image",
    "type": "image",
    "label": { "es": "Imagen de fondo", "en": "Background Image" },
    "required": false,
    "accepted_formats": ["jpg", "png", "webp"]
  },
  {
    "key": "overlay_opacity",
    "type": "range",
    "label": { "es": "Opacidad del overlay", "en": "Overlay Opacity" },
    "min": 0,
    "max": 1,
    "step": 0.1,
    "default": 0.6
  }
]
```

**Tipos de campo soportados**:

| Tipo       | Descripción                        | Uso típico                        |
| ---------- | ---------------------------------- | --------------------------------- |
| `text`     | Texto corto (input)                | Títulos, nombres, CTAs            |
| `textarea` | Texto largo                        | Subtítulos, descripciones         |
| `richtext` | Editor con formato                 | Párrafos, contenido extenso       |
| `image`    | Selector de imagen (media library) | Fondos, logos, fotos              |
| `url`      | Campo URL                          | Enlaces, CTAs                     |
| `color`    | Selector de color                  | Colores personalizados por módulo |
| `range`    | Slider numérico                    | Opacidad, tamaños                 |
| `select`   | Dropdown de opciones               | Variantes de layout               |
| `toggle`   | Switch booleano                    | Mostrar/ocultar elementos         |
| `array`    | Lista de items repetibles          | FAQs, testimonios, planes         |
| `number`   | Campo numérico                     | Contadores, estadísticas          |
| `date`     | Selector de fecha                  | Cuenta regresiva                  |
| `map`      | Selector de ubicación              | Mapa                              |

**RLS Policies**:

```sql
ALTER TABLE module_schemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "module_schemas_public_read" ON module_schemas
    FOR SELECT
    USING (true);

CREATE POLICY "module_schemas_admin_write" ON module_schemas
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

---

### 3.5 `leads` — Captura de Leads

Almacena los leads capturados a través de los formularios de contacto y newsletter de la landing page.

```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) DEFAULT '',
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    message TEXT DEFAULT '',
    preferred_date DATE,
    preferred_time TIME,
    source_module VARCHAR(50) DEFAULT 'offer_form',
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Estructura JSONB — `metadata`**:

```json
{
  "user_agent": "Mozilla/5.0 ...",
  "referrer": "https://google.com",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "spring_2026",
  "page_language": "es",
  "ip_country": "MX"
}
```

**RLS Policies**:

```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Inserción pública (cualquier visitante puede enviar un lead)
CREATE POLICY "leads_public_insert" ON leads
    FOR INSERT
    WITH CHECK (true);

-- Lectura y gestión solo para admin
CREATE POLICY "leads_admin_read" ON leads
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "leads_admin_update" ON leads
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "leads_admin_delete" ON leads
    FOR DELETE
    USING (auth.role() = 'authenticated');
```

**Índices**:

```sql
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX idx_leads_is_read ON leads (is_read) WHERE is_read = false;
CREATE INDEX idx_leads_email ON leads (email);
CREATE INDEX idx_leads_source_module ON leads (source_module);
```

---

### 3.6 `media` — Biblioteca de Medios

Gestiona todos los archivos multimedia subidos al sistema. Los archivos físicos se almacenan en Supabase Storage; esta tabla mantiene los metadatos.

```sql
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    public_url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0,
    alt_text JSONB DEFAULT '{}'::jsonb,
    folder VARCHAR(100) DEFAULT 'general',
    width INTEGER,
    height INTEGER,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Estructura JSONB — `alt_text`** (texto alternativo multilingüe):

```json
{
  "es": "Equipo de trabajo reunido en la oficina",
  "en": "Work team gathered at the office"
}
```

**RLS Policies**:

```sql
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Lectura pública (las imágenes se muestran en la landing)
CREATE POLICY "media_public_read" ON media
    FOR SELECT
    USING (true);

-- Escritura solo para admin
CREATE POLICY "media_admin_insert" ON media
    FOR INSERT
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "media_admin_update" ON media
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "media_admin_delete" ON media
    FOR DELETE
    USING (auth.role() = 'authenticated');
```

**Índices**:

```sql
CREATE INDEX idx_media_folder ON media (folder);
CREATE INDEX idx_media_mime_type ON media (mime_type);
CREATE INDEX idx_media_created_at ON media (created_at DESC);
```

---

### 3.7 `theme_config` — Configuración del Tema Activo

Tabla singleton que almacena la configuración visual activa del sitio.

```sql
CREATE TABLE theme_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    palette_id VARCHAR(50) NOT NULL DEFAULT 'professional-blue',
    custom_colors JSONB DEFAULT '{}'::jsonb,
    typography JSONB DEFAULT '{
        "font_heading": "Inter",
        "font_body": "Inter",
        "base_size": "16px",
        "scale_ratio": 1.25
    }'::jsonb,
    spacing JSONB DEFAULT '{
        "section_padding": "80px",
        "container_max_width": "1200px",
        "element_gap": "24px"
    }'::jsonb,
    border_radius VARCHAR(20) DEFAULT '8px',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_theme_config_updated_at
    BEFORE UPDATE ON theme_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Estructura JSONB — `custom_colors`** (sobreescrituras sobre la paleta seleccionada):

```json
{
  "primary": "#2563eb",
  "secondary": "#7c3aed"
}
```

Si `custom_colors` tiene valores, estos sobreescriben los colores correspondientes de la paleta seleccionada en `palette_id`.

**Estructura JSONB — `typography`**:

```json
{
  "font_heading": "Inter",
  "font_body": "Inter",
  "base_size": "16px",
  "scale_ratio": 1.25,
  "heading_weight": "700",
  "body_weight": "400"
}
```

**RLS Policies**:

```sql
ALTER TABLE theme_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "theme_config_public_read" ON theme_config
    FOR SELECT
    USING (true);

CREATE POLICY "theme_config_admin_write" ON theme_config
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

---

### 3.8 `color_palettes` — Paletas de Color

Almacena las 20 paletas predefinidas y las paletas personalizadas creadas por el usuario.

```sql
CREATE TABLE color_palettes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    niche VARCHAR(100) DEFAULT 'general',
    colors JSONB NOT NULL,
    is_predefined BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Estructura JSONB — `colors`**:

```json
{
  "primary": "#2563eb",
  "secondary": "#7c3aed",
  "accent": "#f59e0b",
  "background": "#ffffff",
  "surface": "#f8fafc",
  "text_primary": "#0f172a",
  "text_secondary": "#475569",
  "success": "#22c55e",
  "error": "#ef4444",
  "warning": "#f59e0b",
  "info": "#3b82f6",
  "border": "#e2e8f0"
}
```

**Datos semilla — 20 paletas predefinidas**:

```sql
INSERT INTO color_palettes (id, name, description, niche, colors, is_predefined) VALUES
('professional-blue', 'Azul Profesional', 'Paleta corporativa con tonos azules que transmiten confianza y profesionalismo', 'corporativo', '{"primary":"#2563eb","secondary":"#1e40af","accent":"#3b82f6","background":"#ffffff","surface":"#f0f4ff","text_primary":"#0f172a","text_secondary":"#475569","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#3b82f6","border":"#dbeafe"}', true),
('corporate-gray', 'Gris Corporativo', 'Tonos neutros sofisticados para empresas de consultoría y finanzas', 'consultoría', '{"primary":"#374151","secondary":"#1f2937","accent":"#6b7280","background":"#ffffff","surface":"#f9fafb","text_primary":"#111827","text_secondary":"#6b7280","success":"#059669","error":"#dc2626","warning":"#d97706","info":"#2563eb","border":"#e5e7eb"}', true),
('emerald-health', 'Esmeralda Salud', 'Verdes calmantes ideales para salud, bienestar y medio ambiente', 'salud', '{"primary":"#059669","secondary":"#047857","accent":"#10b981","background":"#ffffff","surface":"#ecfdf5","text_primary":"#064e3b","text_secondary":"#6b7280","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#3b82f6","border":"#d1fae5"}', true),
('sunset-warm', 'Atardecer Cálido', 'Tonos cálidos que generan cercanía y calidez humana', 'hospitalidad', '{"primary":"#ea580c","secondary":"#c2410c","accent":"#f97316","background":"#fffbeb","surface":"#fff7ed","text_primary":"#431407","text_secondary":"#78716c","success":"#16a34a","error":"#dc2626","warning":"#eab308","info":"#0284c7","border":"#fed7aa"}', true),
('royal-purple', 'Púrpura Real', 'Morados elegantes para marcas premium y creativas', 'lujo', '{"primary":"#7c3aed","secondary":"#6d28d9","accent":"#a78bfa","background":"#ffffff","surface":"#f5f3ff","text_primary":"#1e1b4b","text_secondary":"#6b7280","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#3b82f6","border":"#ddd6fe"}', true),
('ocean-deep', 'Océano Profundo', 'Azules profundos con toques turquesa para tecnología y SaaS', 'tecnología', '{"primary":"#0891b2","secondary":"#0e7490","accent":"#06b6d4","background":"#ffffff","surface":"#ecfeff","text_primary":"#083344","text_secondary":"#64748b","success":"#10b981","error":"#f43f5e","warning":"#f59e0b","info":"#0ea5e9","border":"#cffafe"}', true),
('rose-elegance', 'Rosa Elegante', 'Rosas sofisticados para moda, belleza y servicios femeninos', 'belleza', '{"primary":"#e11d48","secondary":"#be123c","accent":"#fb7185","background":"#ffffff","surface":"#fff1f2","text_primary":"#1c1917","text_secondary":"#78716c","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#3b82f6","border":"#fecdd3"}', true),
('forest-natural', 'Bosque Natural', 'Verdes terrosos para agricultura, eco-productos y naturaleza', 'ecológico', '{"primary":"#166534","secondary":"#14532d","accent":"#4ade80","background":"#fefefe","surface":"#f0fdf4","text_primary":"#052e16","text_secondary":"#6b7280","success":"#22c55e","error":"#ef4444","warning":"#eab308","info":"#0284c7","border":"#bbf7d0"}', true),
('slate-minimal', 'Pizarra Minimalista', 'Diseño ultraminimalista en grises y negro para portafolios y agencias', 'agencia', '{"primary":"#0f172a","secondary":"#1e293b","accent":"#94a3b8","background":"#ffffff","surface":"#f8fafc","text_primary":"#0f172a","text_secondary":"#64748b","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#3b82f6","border":"#e2e8f0"}', true),
('golden-luxury', 'Dorado Lujoso', 'Dorados con negro para joyería, inmobiliaria de lujo y eventos premium', 'lujo', '{"primary":"#b45309","secondary":"#92400e","accent":"#fbbf24","background":"#fffbeb","surface":"#fef3c7","text_primary":"#1c1917","text_secondary":"#78716c","success":"#16a34a","error":"#dc2626","warning":"#f59e0b","info":"#0284c7","border":"#fde68a"}', true),
('electric-startup', 'Eléctrico Startup', 'Colores vibrantes y energéticos para startups y productos digitales', 'startup', '{"primary":"#7c3aed","secondary":"#2563eb","accent":"#06b6d4","background":"#ffffff","surface":"#faf5ff","text_primary":"#0f172a","text_secondary":"#6b7280","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#3b82f6","border":"#e0e7ff"}', true),
('terracotta-artisan', 'Terracota Artesanal', 'Tierras cálidas para artesanías, gastronomía y comercio local', 'artesanal', '{"primary":"#b45309","secondary":"#a16207","accent":"#d97706","background":"#fefce8","surface":"#fef9c3","text_primary":"#422006","text_secondary":"#78716c","success":"#16a34a","error":"#dc2626","warning":"#eab308","info":"#0284c7","border":"#fde047"}', true),
('navy-legal', 'Azul Marino Legal', 'Azules oscuros formales para despachos legales, contables y financieros', 'legal', '{"primary":"#1e3a5f","secondary":"#172554","accent":"#3b82f6","background":"#ffffff","surface":"#eff6ff","text_primary":"#0c1524","text_secondary":"#64748b","success":"#059669","error":"#dc2626","warning":"#d97706","info":"#2563eb","border":"#bfdbfe"}', true),
('coral-creative', 'Coral Creativo', 'Coral vibrante con contrastes para agencias creativas y marketing', 'marketing', '{"primary":"#f43f5e","secondary":"#e11d48","accent":"#fb923c","background":"#ffffff","surface":"#fff1f2","text_primary":"#1c1917","text_secondary":"#6b7280","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#3b82f6","border":"#fecdd3"}', true),
('sky-education', 'Cielo Educativo', 'Azules claros amigables para educación, cursos y capacitación', 'educación', '{"primary":"#0284c7","secondary":"#0369a1","accent":"#38bdf8","background":"#ffffff","surface":"#f0f9ff","text_primary":"#0c4a6e","text_secondary":"#64748b","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#0ea5e9","border":"#bae6fd"}', true),
('charcoal-industrial', 'Carbón Industrial', 'Grises oscuros con acentos naranjas para industria y manufactura', 'industrial', '{"primary":"#374151","secondary":"#1f2937","accent":"#f97316","background":"#ffffff","surface":"#f3f4f6","text_primary":"#111827","text_secondary":"#6b7280","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#3b82f6","border":"#d1d5db"}', true),
('mint-fresh', 'Menta Fresca', 'Verdes menta refrescantes para alimentos, bebidas y bienestar', 'alimentos', '{"primary":"#0d9488","secondary":"#0f766e","accent":"#2dd4bf","background":"#ffffff","surface":"#f0fdfa","text_primary":"#134e4a","text_secondary":"#64748b","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#3b82f6","border":"#ccfbf1"}', true),
('dark-mode', 'Modo Oscuro', 'Tema oscuro elegante para tecnología y aplicaciones modernas', 'tecnología', '{"primary":"#3b82f6","secondary":"#8b5cf6","accent":"#06b6d4","background":"#0f172a","surface":"#1e293b","text_primary":"#f1f5f9","text_secondary":"#94a3b8","success":"#22c55e","error":"#ef4444","warning":"#f59e0b","info":"#38bdf8","border":"#334155"}', true),
('burgundy-wine', 'Borgoña Vino', 'Rojos profundos para restaurantes, vinos y gastronomía premium', 'gastronomía', '{"primary":"#881337","secondary":"#701a75","accent":"#e11d48","background":"#ffffff","surface":"#fff1f2","text_primary":"#1c1917","text_secondary":"#78716c","success":"#16a34a","error":"#dc2626","warning":"#eab308","info":"#2563eb","border":"#fecdd3"}', true),
('pastel-soft', 'Pastel Suave', 'Tonos pastel delicados para bienestar, spas y servicios personales', 'bienestar', '{"primary":"#8b5cf6","secondary":"#a78bfa","accent":"#f472b6","background":"#fefefe","surface":"#faf5ff","text_primary":"#1e1b4b","text_secondary":"#6b7280","success":"#34d399","error":"#f87171","warning":"#fbbf24","info":"#60a5fa","border":"#e9d5ff"}', true);
```

**RLS Policies**:

```sql
ALTER TABLE color_palettes ENABLE ROW LEVEL SECURITY;

-- Lectura pública (el sitio necesita la paleta activa)
CREATE POLICY "color_palettes_public_read" ON color_palettes
    FOR SELECT
    USING (true);

-- Admin puede crear paletas personalizadas
CREATE POLICY "color_palettes_admin_insert" ON color_palettes
    FOR INSERT
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Admin puede modificar solo paletas no predefinidas
CREATE POLICY "color_palettes_admin_update" ON color_palettes
    FOR UPDATE
    USING (auth.role() = 'authenticated' AND is_predefined = false)
    WITH CHECK (auth.role() = 'authenticated');

-- Admin puede eliminar solo paletas no predefinidas
CREATE POLICY "color_palettes_admin_delete" ON color_palettes
    FOR DELETE
    USING (auth.role() = 'authenticated' AND is_predefined = false);
```

---

### 3.9 `integrations` — Integraciones de Terceros

Almacena la configuración de servicios externos conectados al sitio.

```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL UNIQUE,
    config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Tipos de integración y estructura `config`**:

**Google Analytics**:

```json
{
  "type": "google_analytics",
  "config": {
    "measurement_id": "G-XXXXXXXXXX",
    "enable_enhanced_measurement": true
  }
}
```

**Meta Pixel**:

```json
{
  "type": "meta_pixel",
  "config": {
    "pixel_id": "1234567890",
    "track_page_view": true,
    "track_lead": true
  }
}
```

**WhatsApp**:

```json
{
  "type": "whatsapp",
  "config": {
    "phone_number": "+521234567890",
    "default_message": "Hola, me interesa obtener más información",
    "show_floating_button": true,
    "button_position": "bottom-right"
  }
}
```

**Calendly**:

```json
{
  "type": "calendly",
  "config": {
    "url": "https://calendly.com/empresa/consulta",
    "embed_type": "inline"
  }
}
```

**SMTP (notificaciones de leads por email)**:

```json
{
  "type": "smtp",
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": true,
    "user": "notificaciones@empresa.com",
    "pass": "encrypted_value",
    "from_name": "Mi Sitio Web",
    "notification_email": "admin@empresa.com"
  }
}
```

> **Nota de seguridad**: Los campos sensibles como contraseñas SMTP se almacenan cifrados. El cifrado se realiza en la API route del servidor antes de escribir a la base de datos. Nunca se exponen al cliente.

**RLS Policies**:

```sql
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Sin lectura pública — las integraciones contienen credenciales
-- La lectura se hace desde server-side con service_role key

CREATE POLICY "integrations_admin_read" ON integrations
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "integrations_admin_write" ON integrations
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

**Índices**:

```sql
CREATE INDEX idx_integrations_type ON integrations (type);
CREATE INDEX idx_integrations_active ON integrations (is_active) WHERE is_active = true;
```

---

### 3.10 `seo_config` — Configuración SEO

Almacena la configuración de SEO para la página principal y potencialmente para sub-páginas futuras.

```sql
CREATE TABLE seo_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key VARCHAR(50) NOT NULL UNIQUE DEFAULT 'home',
    meta_title JSONB DEFAULT '{}'::jsonb,
    meta_description JSONB DEFAULT '{}'::jsonb,
    og_image_url VARCHAR(500) DEFAULT '',
    canonical_url VARCHAR(500) DEFAULT '',
    robots VARCHAR(100) DEFAULT 'index, follow',
    structured_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_seo_config_updated_at
    BEFORE UPDATE ON seo_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Estructura JSONB — `meta_title`** (multilingüe):

```json
{
  "es": "Transformamos tu Negocio Digital | Mi Empresa",
  "en": "We Transform Your Digital Business | My Company"
}
```

**Estructura JSONB — `meta_description`** (multilingüe):

```json
{
  "es": "Soluciones tecnológicas que impulsan resultados reales. Consultoría, desarrollo y transformación digital para tu empresa.",
  "en": "Technology solutions that drive real results. Consulting, development and digital transformation for your business."
}
```

**Estructura JSONB — `structured_data`** (JSON-LD):

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mi Empresa",
  "url": "https://miempresa.com",
  "logo": "https://miempresa.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+521234567890",
    "contactType": "customer service",
    "availableLanguage": ["Spanish", "English"]
  },
  "sameAs": ["https://facebook.com/miempresa", "https://instagram.com/miempresa"]
}
```

**RLS Policies**:

```sql
ALTER TABLE seo_config ENABLE ROW LEVEL SECURITY;

-- Lectura pública (los meta tags se renderizan en el HTML público)
CREATE POLICY "seo_config_public_read" ON seo_config
    FOR SELECT
    USING (true);

CREATE POLICY "seo_config_admin_write" ON seo_config
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

**Índices**:

```sql
CREATE INDEX idx_seo_config_page_key ON seo_config (page_key);
```

---

## 4. Migración Completa

### 4.1 Archivo de Migración Consolidado

El archivo de migración completo se encuentra en:

```
src/lib/supabase/migrations/001_initial_schema.sql
```

Este archivo contiene, en orden:

1. Función `update_updated_at_column()`
2. Todas las tablas (`CREATE TABLE`)
3. Todos los triggers
4. Todas las políticas RLS
5. Todos los índices
6. Datos semilla para `color_palettes` y `languages`

### 4.2 Datos Semilla para Primera Ejecución

El wizard de configuración inicial (`/setup`) crea los siguientes registros durante el primer uso:

1. **`site_config`**: Una fila con `id = 'main'`, los datos que el usuario ingrese en el wizard, y `setup_completed = true`
2. **`languages`**: Al menos un idioma predeterminado (español por defecto, configurable en el wizard)
3. **`theme_config`**: Una fila con la paleta seleccionada en el wizard
4. **`page_modules`**: Una fila por cada módulo, con contenido por defecto tomado de `module_schemas.default_content`
5. **`module_schemas`**: Una fila por cada uno de los 19 módulos con sus campos editables y contenido por defecto
6. **`seo_config`**: Una fila para `page_key = 'home'` con meta tags básicos
7. **`color_palettes`**: Las 20 paletas predefinidas

---

## 5. Consideraciones de Rendimiento

### 5.1 Consultas Optimizadas

| Consulta                           | Frecuencia       | Optimización                               |
| ---------------------------------- | ---------------- | ------------------------------------------ |
| Obtener módulos visibles ordenados | Cada page view   | Índice en `display_order` + `is_visible`   |
| Obtener theme_config + palette     | Cada page view   | Singleton + JOIN simple                    |
| Insertar lead                      | Cada form submit | Escritura directa, sin índice en inserción |
| Buscar leads                       | Uso admin        | Índice en `created_at DESC` + `is_read`    |
| Obtener media por carpeta          | Uso admin        | Índice en `folder`                         |

### 5.2 Estrategia de Caché

- **Next.js ISR**: La página pública se cachea y se revalida cuando el admin guarda cambios (`revalidatePath('/')`)
- **Server Components**: Los datos se obtienen en el servidor, no hay roundtrips adicionales desde el cliente
- **No se usa caché de Supabase**: Las queries son simples y PostgreSQL las resuelve en microsegundos con los índices adecuados

### 5.3 Tamaño de JSONB

El contenido JSONB de los módulos puede crecer con cada idioma agregado. Para 19 módulos con 5 idiomas, el volumen estimado es:

- ~2-5 KB por módulo por idioma
- ~190-475 KB total para todo el contenido
- Bien dentro de los límites de PostgreSQL (1 GB por campo JSONB)

---

## 6. Evolución del Esquema

### 6.1 Versionado de Módulos

El campo `schema_version` en `page_modules` permite migraciones progresivas del contenido cuando se actualiza la estructura de un módulo:

```typescript
// Ejemplo: migrar hero de v1 a v2
if (module.schema_version === 1) {
  module.content = migrateHeroV1toV2(module.content)
  module.schema_version = 2
}
```

### 6.2 Agregar Nuevas Tablas

Para futuras funcionalidades (blog, tienda, analytics propios), se crearán nuevos archivos de migración:

```
src/lib/supabase/migrations/002_blog_tables.sql
src/lib/supabase/migrations/003_analytics_tables.sql
```

Cada migración es incremental y no destructiva.
