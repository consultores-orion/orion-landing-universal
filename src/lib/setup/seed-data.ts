// ============================================================================
// Orion Landing Universal — Seed Data as TypeScript exports
// Source: supabase/seed.sql
// ============================================================================

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

export interface SeedPalette {
  id: string
  name: string
  description: string
  niche: string
  colors: PaletteColors
  is_predefined: boolean
}

export interface SeedLanguage {
  code: string
  name: string
  native_name: string
  is_default: boolean
  is_active: boolean
  flag_emoji: string
  sort_order: number
}

export interface SeedThemeConfig {
  palette_id: string
  custom_colors: Record<string, string>
  typography: { font_heading: string; font_body: string; base_size: string; scale_ratio: number }
  spacing: { section_padding: string; container_max_width: string; element_gap: string }
  border_radius: string
}

export interface SeedSeoConfig {
  page_key: string
  meta_title: Record<string, string>
  meta_description: Record<string, string>
  robots: string
}

export interface SeedSiteConfig {
  id: string
  site_name: string
  setup_completed: boolean
}

export interface SeedIntegration {
  type: string
  config: Record<string, unknown>
  is_active: boolean
}

// ============================================================================
// 1. COLOR PALETTES (20 predefined)
// ============================================================================

export const SEED_PALETTES: SeedPalette[] = [
  {
    id: 'professional-blue',
    name: 'Azul Profesional',
    description:
      'Paleta corporativa clasica con azul como color principal. Transmite confianza y profesionalismo.',
    niche: 'corporativo',
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#3b82f6',
      background: '#ffffff',
      surface: '#f0f4ff',
      text_primary: '#0f172a',
      text_secondary: '#475569',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: '#dbeafe',
    },
    is_predefined: true,
  },
  {
    id: 'corporate-gray',
    name: 'Gris Corporativo',
    description: 'Paleta neutra y sobria para entornos empresariales. Elegancia sin distracciones.',
    niche: 'corporativo',
    colors: {
      primary: '#374151',
      secondary: '#1f2937',
      accent: '#6b7280',
      background: '#ffffff',
      surface: '#f9fafb',
      text_primary: '#111827',
      text_secondary: '#6b7280',
      success: '#059669',
      error: '#dc2626',
      warning: '#d97706',
      info: '#2563eb',
      border: '#e5e7eb',
    },
    is_predefined: true,
  },
  {
    id: 'emerald-health',
    name: 'Esmeralda Salud',
    description: 'Paleta verde esmeralda ideal para salud, bienestar y naturaleza.',
    niche: 'salud',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#ecfdf5',
      text_primary: '#064e3b',
      text_secondary: '#6b7280',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: '#d1fae5',
    },
    is_predefined: true,
  },
  {
    id: 'sunset-warm',
    name: 'Atardecer Calido',
    description: 'Tonos calidos de naranja y ambar. Ideal para gastronomia y hospitalidad.',
    niche: 'gastronomia',
    colors: {
      primary: '#ea580c',
      secondary: '#c2410c',
      accent: '#f97316',
      background: '#fffbeb',
      surface: '#fff7ed',
      text_primary: '#431407',
      text_secondary: '#78716c',
      success: '#16a34a',
      error: '#dc2626',
      warning: '#eab308',
      info: '#0284c7',
      border: '#fed7aa',
    },
    is_predefined: true,
  },
  {
    id: 'royal-purple',
    name: 'Purpura Real',
    description: 'Paleta purpura sofisticada para marcas premium y creativas.',
    niche: 'creativo',
    colors: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#a78bfa',
      background: '#ffffff',
      surface: '#f5f3ff',
      text_primary: '#1e1b4b',
      text_secondary: '#6b7280',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: '#ddd6fe',
    },
    is_predefined: true,
  },
  {
    id: 'ocean-deep',
    name: 'Oceano Profundo',
    description: 'Azules y cianes oceanicos. Ideal para turismo, tecnologia marina y bienestar.',
    niche: 'turismo',
    colors: {
      primary: '#0891b2',
      secondary: '#0e7490',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#ecfeff',
      text_primary: '#083344',
      text_secondary: '#64748b',
      success: '#10b981',
      error: '#f43f5e',
      warning: '#f59e0b',
      info: '#0ea5e9',
      border: '#cffafe',
    },
    is_predefined: true,
  },
  {
    id: 'rose-elegance',
    name: 'Rosa Elegante',
    description: 'Paleta rosa para marcas femeninas, moda y belleza.',
    niche: 'moda',
    colors: {
      primary: '#e11d48',
      secondary: '#be123c',
      accent: '#fb7185',
      background: '#ffffff',
      surface: '#fff1f2',
      text_primary: '#1c1917',
      text_secondary: '#78716c',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: '#fecdd3',
    },
    is_predefined: true,
  },
  {
    id: 'forest-natural',
    name: 'Bosque Natural',
    description: 'Verdes profundos del bosque. Ideal para agricultura, ecologia y outdoors.',
    niche: 'ecologia',
    colors: {
      primary: '#166534',
      secondary: '#14532d',
      accent: '#4ade80',
      background: '#fefefe',
      surface: '#f0fdf4',
      text_primary: '#052e16',
      text_secondary: '#6b7280',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#eab308',
      info: '#0284c7',
      border: '#bbf7d0',
    },
    is_predefined: true,
  },
  {
    id: 'slate-minimal',
    name: 'Pizarra Minimalista',
    description: 'Paleta minimalista en tonos pizarra. Para portafolios y diseno editorial.',
    niche: 'minimalista',
    colors: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#94a3b8',
      background: '#ffffff',
      surface: '#f8fafc',
      text_primary: '#0f172a',
      text_secondary: '#64748b',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: '#e2e8f0',
    },
    is_predefined: true,
  },
  {
    id: 'golden-luxury',
    name: 'Dorado de Lujo',
    description: 'Dorados y ambares para marcas de lujo, joyeria y servicios premium.',
    niche: 'lujo',
    colors: {
      primary: '#b45309',
      secondary: '#92400e',
      accent: '#fbbf24',
      background: '#fffbeb',
      surface: '#fef3c7',
      text_primary: '#1c1917',
      text_secondary: '#78716c',
      success: '#16a34a',
      error: '#dc2626',
      warning: '#f59e0b',
      info: '#0284c7',
      border: '#fde68a',
    },
    is_predefined: true,
  },
  {
    id: 'electric-startup',
    name: 'Electrico Startup',
    description: 'Combinacion vibrante de purpura, azul y cian. Para startups y tech.',
    niche: 'tecnologia',
    colors: {
      primary: '#7c3aed',
      secondary: '#2563eb',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#faf5ff',
      text_primary: '#0f172a',
      text_secondary: '#6b7280',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: '#e0e7ff',
    },
    is_predefined: true,
  },
  {
    id: 'terracotta-artisan',
    name: 'Terracota Artesanal',
    description: 'Tonos tierra y ocres para marcas artesanales, ceramica y productos organicos.',
    niche: 'artesanal',
    colors: {
      primary: '#b45309',
      secondary: '#a16207',
      accent: '#d97706',
      background: '#fefce8',
      surface: '#fef9c3',
      text_primary: '#422006',
      text_secondary: '#78716c',
      success: '#16a34a',
      error: '#dc2626',
      warning: '#eab308',
      info: '#0284c7',
      border: '#fde047',
    },
    is_predefined: true,
  },
  {
    id: 'navy-legal',
    name: 'Azul Marino Legal',
    description: 'Azul marino formal para bufetes, consultoras y servicios financieros.',
    niche: 'legal',
    colors: {
      primary: '#1e3a5f',
      secondary: '#172554',
      accent: '#3b82f6',
      background: '#ffffff',
      surface: '#eff6ff',
      text_primary: '#0c1524',
      text_secondary: '#64748b',
      success: '#059669',
      error: '#dc2626',
      warning: '#d97706',
      info: '#2563eb',
      border: '#bfdbfe',
    },
    is_predefined: true,
  },
  {
    id: 'coral-creative',
    name: 'Coral Creativo',
    description: 'Coral y naranja vibrante para agencias creativas y marketing.',
    niche: 'creativo',
    colors: {
      primary: '#f43f5e',
      secondary: '#e11d48',
      accent: '#fb923c',
      background: '#ffffff',
      surface: '#fff1f2',
      text_primary: '#1c1917',
      text_secondary: '#6b7280',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: '#fecdd3',
    },
    is_predefined: true,
  },
  {
    id: 'sky-education',
    name: 'Cielo Educativo',
    description: 'Azul cielo claro para educacion, e-learning y formacion.',
    niche: 'educacion',
    colors: {
      primary: '#0284c7',
      secondary: '#0369a1',
      accent: '#38bdf8',
      background: '#ffffff',
      surface: '#f0f9ff',
      text_primary: '#0c4a6e',
      text_secondary: '#64748b',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#0ea5e9',
      border: '#bae6fd',
    },
    is_predefined: true,
  },
  {
    id: 'charcoal-industrial',
    name: 'Carbon Industrial',
    description: 'Gris carbon con acento naranja. Para industria, ingenieria y manufactura.',
    niche: 'industrial',
    colors: {
      primary: '#374151',
      secondary: '#1f2937',
      accent: '#f97316',
      background: '#ffffff',
      surface: '#f3f4f6',
      text_primary: '#111827',
      text_secondary: '#6b7280',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: '#d1d5db',
    },
    is_predefined: true,
  },
  {
    id: 'mint-fresh',
    name: 'Menta Fresca',
    description: 'Verde menta refrescante para spa, bienestar y productos naturales.',
    niche: 'bienestar',
    colors: {
      primary: '#0d9488',
      secondary: '#0f766e',
      accent: '#2dd4bf',
      background: '#ffffff',
      surface: '#f0fdfa',
      text_primary: '#134e4a',
      text_secondary: '#64748b',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: '#ccfbf1',
    },
    is_predefined: true,
  },
  {
    id: 'dark-mode',
    name: 'Modo Oscuro',
    description: 'Paleta oscura con acentos brillantes. Para apps, SaaS y productos digitales.',
    niche: 'tecnologia',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      text_primary: '#f1f5f9',
      text_secondary: '#94a3b8',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#38bdf8',
      border: '#334155',
    },
    is_predefined: true,
  },
  {
    id: 'burgundy-wine',
    name: 'Borgona Vino',
    description: 'Tonos borgona y vino para bodegas, gastronomia gourmet y eventos.',
    niche: 'gastronomia',
    colors: {
      primary: '#881337',
      secondary: '#701a75',
      accent: '#e11d48',
      background: '#ffffff',
      surface: '#fff1f2',
      text_primary: '#1c1917',
      text_secondary: '#78716c',
      success: '#16a34a',
      error: '#dc2626',
      warning: '#eab308',
      info: '#2563eb',
      border: '#fecdd3',
    },
    is_predefined: true,
  },
  {
    id: 'pastel-soft',
    name: 'Pastel Suave',
    description: 'Pasteles suaves y delicados. Para bodas, maternidad y productos infantiles.',
    niche: 'lifestyle',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#f472b6',
      background: '#fefefe',
      surface: '#faf5ff',
      text_primary: '#1e1b4b',
      text_secondary: '#6b7280',
      success: '#34d399',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#60a5fa',
      border: '#e9d5ff',
    },
    is_predefined: true,
  },
]

// ============================================================================
// 2. DEFAULT LANGUAGES
// ============================================================================

export const SEED_LANGUAGES: SeedLanguage[] = [
  {
    code: 'es',
    name: 'Spanish',
    native_name: 'Español',
    is_default: true,
    is_active: true,
    flag_emoji: '🇪🇸',
    sort_order: 1,
  },
  {
    code: 'en',
    name: 'English',
    native_name: 'English',
    is_default: false,
    is_active: true,
    flag_emoji: '🇺🇸',
    sort_order: 2,
  },
]

// ============================================================================
// 3. DEFAULT THEME CONFIG
// ============================================================================

export const SEED_THEME_CONFIG: SeedThemeConfig = {
  palette_id: 'professional-blue',
  custom_colors: {},
  typography: {
    font_heading: 'Inter',
    font_body: 'Inter',
    base_size: '16px',
    scale_ratio: 1.25,
  },
  spacing: {
    section_padding: '80px',
    container_max_width: '1200px',
    element_gap: '24px',
  },
  border_radius: '8px',
}

// ============================================================================
// 4. DEFAULT SEO CONFIG
// ============================================================================

export const SEED_SEO_CONFIG: SeedSeoConfig[] = [
  {
    page_key: 'home',
    meta_title: { es: 'Mi Sitio Web', en: 'My Website' },
    meta_description: { es: 'Bienvenido a mi sitio web', en: 'Welcome to my website' },
    robots: 'index, follow',
  },
]

// ============================================================================
// 5. DEFAULT SITE CONFIG
// ============================================================================

export const SEED_SITE_CONFIG: SeedSiteConfig = {
  id: 'main',
  site_name: 'Mi Sitio',
  setup_completed: false,
}

// ============================================================================
// 6. DEFAULT INTEGRATIONS
// ============================================================================

export const SEED_INTEGRATIONS: SeedIntegration[] = [
  {
    type: 'google_analytics',
    config: { measurement_id: '' },
    is_active: false,
  },
  {
    type: 'meta_pixel',
    config: { pixel_id: '' },
    is_active: false,
  },
  {
    type: 'whatsapp',
    config: { phone_number: '', default_message: '' },
    is_active: false,
  },
  {
    type: 'calendly',
    config: { url: '' },
    is_active: false,
  },
  {
    type: 'smtp',
    config: { host: '', port: 587, user: '', password: '', from_name: '', from_email: '' },
    is_active: false,
  },
  {
    type: 'custom_scripts',
    config: { head_scripts: '', body_scripts: '' },
    is_active: false,
  },
]

// ============================================================================
// 7. PAGE MODULES (initial content for each section)
// ============================================================================

export interface SeedPageModule {
  section_key: string
  display_name?: Record<string, string>
  content: Record<string, unknown>
  styles: Record<string, unknown>
  display_order: number
  is_visible: boolean
  is_system: boolean
}

export interface SeedModuleSchema {
  section_key: string
  fields: Record<string, unknown>[]
  default_content: Record<string, unknown>
  default_styles: Record<string, unknown>
}

export const SEED_PAGE_MODULES: SeedPageModule[] = [
  {
    section_key: 'hero',
    display_name: { es: 'Inicio', en: 'Home' },
    content: {
      title: {
        es: 'Transforma tu negocio con soluciones inteligentes',
        en: 'Transform your business with intelligent solutions',
      },
      subtitle: {
        es: 'La herramienta que tu empresa necesita para crecer en el mundo digital',
        en: 'The tool your business needs to grow in the digital world',
      },
      primaryButton: {
        label: { es: 'Comenzar ahora', en: 'Get started' },
        url: '#contact',
        variant: 'primary',
      },
      secondaryButton: {
        label: { es: 'Saber más', en: 'Learn more' },
        url: '#features',
        variant: 'secondary',
      },
      layout: 'centered',
    },
    styles: { paddingY: 'xlarge', paddingX: 'medium', maxWidth: 'wide' },
    display_order: 1,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'value_prop',
    display_name: { es: 'Beneficios', en: 'Benefits' },
    content: {
      title: { es: '¿Por qué elegirnos?', en: 'Why choose us?' },
      items: [
        {
          icon: 'Zap',
          title: { es: 'Rápido y eficiente', en: 'Fast and efficient' },
          description: {
            es: 'Resultados inmediatos desde el primer día',
            en: 'Immediate results from day one',
          },
        },
        {
          icon: 'Shield',
          title: { es: 'Seguro y confiable', en: 'Secure and reliable' },
          description: { es: 'Tu información siempre protegida', en: 'Your data always protected' },
        },
        {
          icon: 'Star',
          title: { es: 'Calidad garantizada', en: 'Guaranteed quality' },
          description: {
            es: 'Satisfacción 100% o te devolvemos tu dinero',
            en: '100% satisfaction or your money back',
          },
        },
      ],
      columns: 3,
    },
    styles: { paddingY: 'large', paddingX: 'medium', maxWidth: 'default' },
    display_order: 2,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'how_it_works',
    display_name: { es: 'Cómo Funciona', en: 'How It Works' },
    content: {
      title: { es: '¿Cómo funciona?', en: 'How it works?' },
      steps: [
        {
          number: 1,
          title: { es: 'Regístrate', en: 'Sign up' },
          description: {
            es: 'Crea tu cuenta gratis en segundos',
            en: 'Create your free account in seconds',
          },
        },
        {
          number: 2,
          title: { es: 'Configura', en: 'Configure' },
          description: {
            es: 'Personaliza según tus necesidades',
            en: 'Customize to fit your needs',
          },
        },
        {
          number: 3,
          title: { es: 'Lanza', en: 'Launch' },
          description: { es: 'Publica y empieza a crecer', en: 'Publish and start growing' },
        },
      ],
      layout: 'horizontal',
    },
    styles: { paddingY: 'large', paddingX: 'medium', maxWidth: 'default' },
    display_order: 3,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'social_proof',
    display_name: { es: 'Testimonios', en: 'Testimonials' },
    content: {
      title: { es: 'Lo que dicen nuestros clientes', en: 'What our customers say' },
      testimonials: [
        {
          id: '1',
          quote: {
            es: 'Increíble herramienta, transformó completamente nuestro proceso.',
            en: 'Incredible tool, it completely transformed our process.',
          },
          authorName: 'María García',
          authorRole: { es: 'CEO, TechStartup', en: 'CEO, TechStartup' },
          rating: 5,
        },
        {
          id: '2',
          quote: {
            es: 'El mejor ROI que hemos tenido con cualquier software.',
            en: 'Best ROI we have ever seen from any software.',
          },
          authorName: 'Carlos López',
          authorRole: { es: 'Director de Marketing', en: 'Marketing Director' },
          rating: 5,
        },
        {
          id: '3',
          quote: {
            es: 'Simple, intuitivo y poderoso. Lo recomiendo ampliamente.',
            en: 'Simple, intuitive, and powerful. Highly recommend.',
          },
          authorName: 'Ana Martínez',
          authorRole: { es: 'Fundadora, AgenciaDigital', en: 'Founder, DigitalAgency' },
          rating: 5,
        },
      ],
    },
    styles: { paddingY: 'large', paddingX: 'medium', maxWidth: 'default' },
    display_order: 4,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'client_logos',
    display_name: { es: 'Clientes', en: 'Clients' },
    content: {
      title: { es: 'Empresas que confían en nosotros', en: 'Companies that trust us' },
      logos: [
        {
          id: '1',
          name: 'Empresa Alpha',
          logoImage: { url: '', alt: { es: 'Logo Empresa Alpha', en: 'Empresa Alpha Logo' } },
        },
        {
          id: '2',
          name: 'Corp Beta',
          logoImage: { url: '', alt: { es: 'Logo Corp Beta', en: 'Corp Beta Logo' } },
        },
        {
          id: '3',
          name: 'Grupo Gamma',
          logoImage: { url: '', alt: { es: 'Logo Grupo Gamma', en: 'Grupo Gamma Logo' } },
        },
        {
          id: '4',
          name: 'Delta Inc',
          logoImage: { url: '', alt: { es: 'Logo Delta Inc', en: 'Delta Inc Logo' } },
        },
        {
          id: '5',
          name: 'Epsilon SA',
          logoImage: { url: '', alt: { es: 'Logo Epsilon SA', en: 'Epsilon SA Logo' } },
        },
        {
          id: '6',
          name: 'Zeta Group',
          logoImage: { url: '', alt: { es: 'Logo Zeta Group', en: 'Zeta Group Logo' } },
        },
      ],
      speed: 'normal',
      showTitle: true,
    },
    styles: { paddingY: 'medium', paddingX: 'medium', maxWidth: 'full' },
    display_order: 5,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'offer_form',
    display_name: { es: 'Contacto', en: 'Contact' },
    content: {
      title: { es: 'Contáctanos hoy', en: 'Contact us today' },
      subtitle: {
        es: 'Estamos listos para ayudarte a alcanzar tus objetivos',
        en: 'We are ready to help you achieve your goals',
      },
      fields: [
        {
          key: 'name',
          type: 'text',
          label: { es: 'Nombre', en: 'Name' },
          placeholder: { es: 'Tu nombre completo', en: 'Your full name' },
          required: true,
        },
        {
          key: 'email',
          type: 'email',
          label: { es: 'Email', en: 'Email' },
          placeholder: { es: 'tu@email.com', en: 'you@email.com' },
          required: true,
        },
        {
          key: 'phone',
          type: 'tel',
          label: { es: 'Teléfono', en: 'Phone' },
          placeholder: { es: '+52 (55) 1234-5678', en: '+1 (555) 123-4567' },
          required: false,
        },
        {
          key: 'message',
          type: 'textarea',
          label: { es: 'Mensaje', en: 'Message' },
          placeholder: { es: '¿En qué podemos ayudarte?', en: 'How can we help you?' },
          required: false,
        },
      ],
      submitLabel: { es: 'Enviar mensaje', en: 'Send message' },
      successMessage: {
        es: '¡Gracias! Te contactaremos pronto.',
        en: 'Thank you! We will contact you soon.',
      },
      sourceModule: 'offer_form',
    },
    styles: { paddingY: 'large', paddingX: 'medium', maxWidth: 'narrow' },
    display_order: 6,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'faq',
    display_name: { es: 'Preguntas Frecuentes', en: 'FAQ' },
    content: {
      title: { es: 'Preguntas frecuentes', en: 'Frequently Asked Questions' },
      items: [
        {
          id: '1',
          question: { es: '¿Cómo empiezo?', en: 'How do I get started?' },
          answer: {
            es: 'Simplemente regístrate y sigue el asistente de configuración paso a paso.',
            en: 'Simply sign up and follow the step-by-step configuration wizard.',
          },
        },
        {
          id: '2',
          question: { es: '¿Hay un período de prueba gratuito?', en: 'Is there a free trial?' },
          answer: {
            es: 'Sí, ofrecemos 14 días de prueba gratuita sin necesidad de tarjeta de crédito.',
            en: 'Yes, we offer a 14-day free trial with no credit card required.',
          },
        },
        {
          id: '3',
          question: { es: '¿Puedo cancelar en cualquier momento?', en: 'Can I cancel anytime?' },
          answer: {
            es: 'Por supuesto. Puedes cancelar tu suscripción cuando quieras, sin penalizaciones.',
            en: 'Of course. You can cancel your subscription at any time with no penalties.',
          },
        },
        {
          id: '4',
          question: { es: '¿Ofrecen soporte técnico?', en: 'Do you offer technical support?' },
          answer: {
            es: 'Sí, nuestro equipo está disponible 24/7 por chat y email.',
            en: 'Yes, our team is available 24/7 via chat and email.',
          },
        },
        {
          id: '5',
          question: { es: '¿Es seguro para mis datos?', en: 'Is my data secure?' },
          answer: {
            es: 'Absolutamente. Usamos encriptación de nivel bancario y cumplimos con GDPR.',
            en: 'Absolutely. We use bank-level encryption and comply with GDPR.',
          },
        },
      ],
      layout: 'single',
    },
    styles: { paddingY: 'large', paddingX: 'medium', maxWidth: 'default' },
    display_order: 7,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'final_cta',
    display_name: { es: 'Empezar', en: 'Get Started' },
    content: {
      title: { es: '¿Listo para empezar?', en: 'Ready to get started?' },
      subtitle: {
        es: 'Únete a más de 500 empresas que ya confían en nosotros',
        en: 'Join over 500 companies that already trust us',
      },
      primaryButton: {
        label: { es: 'Empieza gratis hoy', en: 'Start for free today' },
        url: '#contact',
      },
      secondaryButton: { label: { es: 'Ver demo', en: 'Watch demo' }, url: '#video' },
      backgroundStyle: 'gradient',
    },
    styles: { paddingY: 'xlarge', paddingX: 'medium', maxWidth: 'default' },
    display_order: 8,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'footer',
    display_name: { es: 'Pie de Página', en: 'Footer' },
    content: {
      columns: [
        {
          title: { es: 'Producto', en: 'Product' },
          links: [
            { label: { es: 'Características', en: 'Features' }, url: '#features' },
            { label: { es: 'Precios', en: 'Pricing' }, url: '#pricing' },
          ],
        },
        {
          title: { es: 'Empresa', en: 'Company' },
          links: [
            { label: { es: 'Acerca de', en: 'About' }, url: '#about' },
            { label: { es: 'Contacto', en: 'Contact' }, url: '#contact' },
          ],
        },
      ],
      copyright: {
        es: '© 2026 Tu Empresa. Todos los derechos reservados.',
        en: '© 2026 Your Company. All rights reserved.',
      },
      showSocialLinks: true,
      socialLinks: { facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
      legalLinks: [
        { label: { es: 'Privacidad', en: 'Privacy' }, url: '#' },
        { label: { es: 'Términos', en: 'Terms' }, url: '#' },
      ],
    },
    styles: { paddingY: 'large', paddingX: 'medium', maxWidth: 'full' },
    display_order: 9,
    is_visible: true,
    is_system: true,
  },
  {
    section_key: 'stats',
    display_name: { es: 'Estadísticas', en: 'Statistics' },
    content: {
      title: { es: 'Nuestros números hablan', en: 'Our numbers speak' },
      items: [
        {
          id: '1',
          value: 500,
          suffix: '+',
          label: { es: 'Clientes activos', en: 'Active clients' },
        },
        {
          id: '2',
          value: 98,
          suffix: '%',
          label: { es: 'Tasa de satisfacción', en: 'Satisfaction rate' },
        },
        {
          id: '3',
          value: 10000,
          suffix: '+',
          label: { es: 'Proyectos entregados', en: 'Projects delivered' },
        },
        {
          id: '4',
          value: 5,
          prefix: '★',
          label: { es: 'Calificación promedio', en: 'Average rating' },
        },
      ],
    },
    styles: {
      paddingY: 'large',
      paddingX: 'medium',
      maxWidth: 'default',
      backgroundColor: 'var(--color-surface)',
    },
    display_order: 10,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'pricing',
    display_name: { es: 'Precios', en: 'Pricing' },
    content: {
      title: { es: 'Planes que se adaptan a ti', en: 'Plans that adapt to you' },
      subtitle: {
        es: 'Sin contratos. Sin sorpresas. Cancela en cualquier momento.',
        en: 'No contracts. No surprises. Cancel anytime.',
      },
      toggle_monthly_label: { es: 'Mensual', en: 'Monthly' },
      toggle_annual_label: { es: 'Anual', en: 'Annual' },
      annual_savings_label: { es: 'Ahorra 20%', en: 'Save 20%' },
      plans: [
        {
          id: 'plan-basic',
          name: { es: 'Básico', en: 'Basic' },
          description: {
            es: 'Todo lo que necesitas para empezar.',
            en: 'Everything you need to get started.',
          },
          price_monthly: 29,
          price_annual: 23,
          currency: '$',
          period_monthly: { es: '/mes', en: '/month' },
          period_annual: { es: '/mes, facturado anual', en: '/month, billed annually' },
          is_highlighted: false,
          cta_label: { es: 'Empezar gratis', en: 'Start for free' },
          cta_url: '#',
          features: [
            {
              id: 'b-f1',
              text: { es: '5 proyectos activos', en: '5 active projects' },
              included: true,
            },
            { id: 'b-f2', text: { es: 'Hasta 3 usuarios', en: 'Up to 3 users' }, included: true },
            {
              id: 'b-f3',
              text: { es: '10 GB de almacenamiento', en: '10 GB storage' },
              included: true,
            },
            { id: 'b-f4', text: { es: 'Soporte por email', en: 'Email support' }, included: true },
            {
              id: 'b-f5',
              text: { es: 'Analytics avanzados', en: 'Advanced analytics' },
              included: false,
            },
            { id: 'b-f6', text: { es: 'API personalizada', en: 'Custom API' }, included: false },
          ],
        },
        {
          id: 'plan-pro',
          name: { es: 'Pro', en: 'Pro' },
          description: {
            es: 'Para equipos que quieren crecer más rápido.',
            en: 'For teams that want to grow faster.',
          },
          price_monthly: 79,
          price_annual: 63,
          currency: '$',
          period_monthly: { es: '/mes', en: '/month' },
          period_annual: { es: '/mes, facturado anual', en: '/month, billed annually' },
          is_highlighted: true,
          badge: { es: 'Más popular', en: 'Most popular' },
          cta_label: { es: 'Comenzar ahora', en: 'Get started' },
          cta_url: '#',
          features: [
            {
              id: 'p-f1',
              text: { es: 'Proyectos ilimitados', en: 'Unlimited projects' },
              included: true,
            },
            { id: 'p-f2', text: { es: 'Hasta 15 usuarios', en: 'Up to 15 users' }, included: true },
            {
              id: 'p-f3',
              text: { es: '100 GB de almacenamiento', en: '100 GB storage' },
              included: true,
            },
            {
              id: 'p-f4',
              text: { es: 'Soporte prioritario', en: 'Priority support' },
              included: true,
            },
            {
              id: 'p-f5',
              text: { es: 'Analytics avanzados', en: 'Advanced analytics' },
              included: true,
            },
            { id: 'p-f6', text: { es: 'API personalizada', en: 'Custom API' }, included: false },
          ],
        },
        {
          id: 'plan-enterprise',
          name: { es: 'Enterprise', en: 'Enterprise' },
          description: {
            es: 'Soluciones a medida para grandes organizaciones.',
            en: 'Custom solutions for large organizations.',
          },
          price_monthly: 199,
          price_annual: 159,
          currency: '$',
          period_monthly: { es: '/mes', en: '/month' },
          period_annual: { es: '/mes, facturado anual', en: '/month, billed annually' },
          is_highlighted: false,
          cta_label: { es: 'Contactar ventas', en: 'Contact sales' },
          cta_url: '#contact',
          features: [
            {
              id: 'e-f1',
              text: { es: 'Proyectos ilimitados', en: 'Unlimited projects' },
              included: true,
            },
            {
              id: 'e-f2',
              text: { es: 'Usuarios ilimitados', en: 'Unlimited users' },
              included: true,
            },
            {
              id: 'e-f3',
              text: { es: 'Almacenamiento ilimitado', en: 'Unlimited storage' },
              included: true,
            },
            {
              id: 'e-f4',
              text: { es: 'Soporte 24/7 dedicado', en: 'Dedicated 24/7 support' },
              included: true,
            },
            {
              id: 'e-f5',
              text: { es: 'Analytics avanzados', en: 'Advanced analytics' },
              included: true,
            },
            { id: 'e-f6', text: { es: 'API personalizada', en: 'Custom API' }, included: true },
          ],
        },
      ],
    },
    styles: { paddingY: 'large', maxWidth: 'wide' },
    display_order: 11,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'video',
    display_name: { es: 'Video', en: 'Video' },
    content: {
      title: { es: 'Míranos en acción', en: 'Watch us in action' },
      subtitle: {
        es: 'Un vistazo rápido a lo que hacemos y cómo lo hacemos.',
        en: 'A quick look at what we do and how we do it.',
      },
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      video_type: 'youtube',
      aspect_ratio: '16/9',
      poster_image_url: '',
      autoplay: false,
      caption: { es: 'Video demostrativo — 2 minutos', en: 'Demo video — 2 minutes' },
    },
    styles: { paddingY: 'large', maxWidth: 'default' },
    display_order: 12,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'team',
    display_name: { es: 'Equipo', en: 'Team' },
    content: {
      title: { es: 'Conoce a nuestro equipo', en: 'Meet our team' },
      subtitle: {
        es: 'Personas apasionadas construyendo el futuro juntas.',
        en: 'Passionate people building the future together.',
      },
      layout: 'grid',
      columns: 4,
      members: [
        {
          id: 'member-1',
          name: 'Ana García',
          role: { es: 'CEO & Cofundadora', en: 'CEO & Co-founder' },
          bio: {
            es: 'Más de 10 años liderando equipos de producto en startups de alto crecimiento.',
            en: 'Over 10 years leading product teams at high-growth startups.',
          },
          avatar_url: '',
          social: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' },
        },
        {
          id: 'member-2',
          name: 'Carlos Mendoza',
          role: { es: 'CTO & Cofundador', en: 'CTO & Co-founder' },
          bio: {
            es: 'Arquitecto de software con experiencia en sistemas distribuidos a gran escala.',
            en: 'Software architect with experience in large-scale distributed systems.',
          },
          avatar_url: '',
          social: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
        },
        {
          id: 'member-3',
          name: 'Laura Martínez',
          role: { es: 'Directora de Diseño', en: 'Design Director' },
          bio: {
            es: 'Diseñadora de producto centrada en experiencias que los usuarios aman desde el primer clic.',
            en: 'Product designer focused on experiences users love from the first click.',
          },
          avatar_url: '',
          social: { twitter: 'https://twitter.com', instagram: 'https://instagram.com' },
        },
        {
          id: 'member-4',
          name: 'Diego Rojas',
          role: { es: 'Head of Growth', en: 'Head of Growth' },
          bio: {
            es: 'Especialista en crecimiento orgánico y estrategias de adquisición data-driven.',
            en: 'Specialist in organic growth and data-driven acquisition strategies.',
          },
          avatar_url: '',
          social: { linkedin: 'https://linkedin.com', website: 'https://example.com' },
        },
      ],
    },
    styles: { paddingY: 'large', maxWidth: 'wide' },
    display_order: 13,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'gallery',
    display_name: { es: 'Galería', en: 'Gallery' },
    content: {
      title: { es: 'Nuestra galería', en: 'Our Gallery' },
      subtitle: {
        es: 'Una muestra de nuestro trabajo y proyectos destacados.',
        en: 'A showcase of our work and featured projects.',
      },
      layout: 'grid',
      columns: 3,
      show_captions: true,
      images: [
        {
          id: 'img-1',
          url: 'https://placehold.co/600x400/3b82f6/ffffff?text=Proyecto+1',
          alt: { es: 'Proyecto 1', en: 'Project 1' },
          caption: { es: 'Diseño de interfaz moderna', en: 'Modern interface design' },
          category: 'design',
        },
        {
          id: 'img-2',
          url: 'https://placehold.co/600x800/8b5cf6/ffffff?text=Proyecto+2',
          alt: { es: 'Proyecto 2', en: 'Project 2' },
          caption: { es: 'Aplicación móvil responsiva', en: 'Responsive mobile app' },
          category: 'mobile',
        },
        {
          id: 'img-3',
          url: 'https://placehold.co/600x400/10b981/ffffff?text=Proyecto+3',
          alt: { es: 'Proyecto 3', en: 'Project 3' },
          caption: { es: 'Panel de administración', en: 'Admin dashboard' },
          category: 'web',
        },
        {
          id: 'img-4',
          url: 'https://placehold.co/800x600/f59e0b/ffffff?text=Proyecto+4',
          alt: { es: 'Proyecto 4', en: 'Project 4' },
          caption: { es: 'Identidad de marca completa', en: 'Complete brand identity' },
          category: 'branding',
        },
        {
          id: 'img-5',
          url: 'https://placehold.co/600x600/ef4444/ffffff?text=Proyecto+5',
          alt: { es: 'Proyecto 5', en: 'Project 5' },
          caption: { es: 'E-commerce de alto rendimiento', en: 'High-performance e-commerce' },
          category: 'web',
        },
        {
          id: 'img-6',
          url: 'https://placehold.co/600x400/06b6d4/ffffff?text=Proyecto+6',
          alt: { es: 'Proyecto 6', en: 'Project 6' },
          caption: { es: 'Plataforma educativa online', en: 'Online educational platform' },
          category: 'web',
        },
      ],
    },
    styles: { paddingY: 'large', paddingX: 'medium', maxWidth: 'wide' },
    display_order: 14,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'features_grid',
    display_name: { es: 'Características', en: 'Features' },
    content: {
      title: { es: 'Todo lo que necesitas', en: 'Everything you need' },
      subtitle: {
        es: 'Herramientas y funcionalidades diseñadas para hacer crecer tu negocio.',
        en: 'Tools and features designed to grow your business.',
      },
      columns: 3,
      show_icon_background: true,
      features: [
        {
          id: 'feat-1',
          icon: 'zap',
          title: { es: 'Ultra rápido', en: 'Ultra fast' },
          description: {
            es: 'Rendimiento optimizado para que tus usuarios tengan la mejor experiencia posible.',
            en: 'Optimized performance so your users have the best possible experience.',
          },
        },
        {
          id: 'feat-2',
          icon: 'shield',
          title: { es: 'Seguridad total', en: 'Total security' },
          description: {
            es: 'Protección avanzada con cifrado de extremo a extremo y autenticación robusta.',
            en: 'Advanced protection with end-to-end encryption and robust authentication.',
          },
        },
        {
          id: 'feat-3',
          icon: 'globe',
          title: { es: 'Alcance global', en: 'Global reach' },
          description: {
            es: 'Llega a tu audiencia en cualquier parte del mundo con soporte multilingüe.',
            en: 'Reach your audience anywhere in the world with multilingual support.',
          },
        },
        {
          id: 'feat-4',
          icon: 'chart',
          title: { es: 'Analíticas en tiempo real', en: 'Real-time analytics' },
          description: {
            es: 'Monitorea el rendimiento de tu sitio con dashboards detallados e intuitivos.',
            en: 'Monitor your site performance with detailed and intuitive dashboards.',
          },
        },
        {
          id: 'feat-5',
          icon: 'settings',
          title: { es: 'Totalmente personalizable', en: 'Fully customizable' },
          description: {
            es: 'Adapta cada aspecto de tu landing page sin escribir una sola línea de código.',
            en: 'Adapt every aspect of your landing page without writing a single line of code.',
          },
        },
        {
          id: 'feat-6',
          icon: 'cloud',
          title: { es: 'En la nube', en: 'Cloud-powered' },
          description: {
            es: 'Infraestructura escalable que crece con tu negocio sin preocupaciones técnicas.',
            en: 'Scalable infrastructure that grows with your business without technical worries.',
          },
        },
      ],
    },
    styles: { paddingY: 'large', paddingX: 'medium', maxWidth: 'wide' },
    display_order: 15,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'countdown',
    display_name: { es: 'Cuenta Regresiva', en: 'Countdown' },
    content: {
      title: { es: '¡La oferta termina pronto!', en: 'The offer ends soon!' },
      subtitle: {
        es: 'No pierdas esta oportunidad única. El tiempo se acaba.',
        en: "Don't miss this unique opportunity. Time is running out.",
      },
      target_date: '2026-07-04T00:00:00',
      expired_message: {
        es: 'Esta oferta ha expirado. ¡Contáctanos para más información!',
        en: 'This offer has expired. Contact us for more information!',
      },
      expired_action_url: '#contact',
      expired_action_label: { es: 'Contáctanos', en: 'Contact us' },
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      days_label: { es: 'Días', en: 'Days' },
      hours_label: { es: 'Horas', en: 'Hours' },
      minutes_label: { es: 'Minutos', en: 'Minutes' },
      seconds_label: { es: 'Segundos', en: 'Seconds' },
    },
    styles: {
      paddingY: 'large',
      paddingX: 'medium',
      maxWidth: 'default',
      backgroundColor: 'var(--color-surface)',
    },
    display_order: 16,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'comparison',
    display_name: { es: 'Comparación', en: 'Comparison' },
    content: {
      title: { es: 'Compara nuestros planes', en: 'Compare our plans' },
      subtitle: {
        es: 'Elige el plan que mejor se adapta a tus necesidades.',
        en: 'Choose the plan that best fits your needs.',
      },
      columns: [
        { id: 'col-basic', name: { es: 'Básico', en: 'Basic' }, is_highlighted: false },
        {
          id: 'col-pro',
          name: { es: 'Pro', en: 'Pro' },
          is_highlighted: true,
          badge: { es: 'Recomendado', en: 'Recommended' },
        },
        {
          id: 'col-enterprise',
          name: { es: 'Enterprise', en: 'Enterprise' },
          is_highlighted: false,
        },
      ],
      rows: [
        {
          id: 'row-1',
          feature: { es: 'Usuarios incluidos', en: 'Included users' },
          values: {
            'col-basic': { type: 'text', value: { es: '1 usuario', en: '1 user' } },
            'col-pro': { type: 'text', value: { es: '5 usuarios', en: '5 users' } },
            'col-enterprise': { type: 'text', value: { es: 'Ilimitados', en: 'Unlimited' } },
          },
        },
        {
          id: 'row-2',
          feature: { es: 'Almacenamiento', en: 'Storage' },
          values: {
            'col-basic': { type: 'text', value: { es: '5 GB', en: '5 GB' } },
            'col-pro': { type: 'text', value: { es: '50 GB', en: '50 GB' } },
            'col-enterprise': { type: 'text', value: { es: '500 GB', en: '500 GB' } },
          },
        },
        {
          id: 'row-3',
          feature: { es: 'Soporte prioritario', en: 'Priority support' },
          values: {
            'col-basic': { type: 'cross', value: false },
            'col-pro': { type: 'check', value: true },
            'col-enterprise': { type: 'check', value: true },
          },
        },
        {
          id: 'row-4',
          feature: { es: 'API personalizada', en: 'Custom API' },
          values: {
            'col-basic': { type: 'cross', value: false },
            'col-pro': { type: 'cross', value: false },
            'col-enterprise': { type: 'check', value: true },
          },
        },
        {
          id: 'row-5',
          feature: { es: 'Análisis avanzados', en: 'Advanced analytics' },
          values: {
            'col-basic': { type: 'cross', value: false },
            'col-pro': { type: 'check', value: true },
            'col-enterprise': { type: 'check', value: true },
          },
        },
        {
          id: 'row-6',
          feature: { es: 'SLA garantizado', en: 'Guaranteed SLA' },
          values: {
            'col-basic': { type: 'cross', value: false },
            'col-pro': { type: 'text', value: { es: '99.9%', en: '99.9%' } },
            'col-enterprise': { type: 'text', value: { es: '99.99%', en: '99.99%' } },
          },
        },
      ],
    },
    styles: { paddingY: 'large', paddingX: 'medium', maxWidth: 'wide' },
    display_order: 17,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'newsletter',
    display_name: { es: 'Boletín', en: 'Newsletter' },
    content: {
      title: { es: 'Mantente al día', en: 'Stay up to date' },
      subtitle: {
        es: 'Suscríbete para recibir novedades, recursos y ofertas exclusivas directamente en tu bandeja de entrada.',
        en: 'Subscribe to receive news, resources, and exclusive offers directly to your inbox.',
      },
      placeholder_email: { es: 'tu@email.com', en: 'your@email.com' },
      button_label: { es: 'Suscribirme', en: 'Subscribe' },
      success_title: { es: '¡Listo! Te has suscrito', en: 'You are subscribed!' },
      success_message: {
        es: 'Gracias por suscribirte. Pronto recibirás nuestras novedades.',
        en: 'Thank you for subscribing. You will hear from us soon.',
      },
      privacy_text: {
        es: 'No enviamos spam. Puedes darte de baja en cualquier momento.',
        en: 'We do not send spam. You can unsubscribe at any time.',
      },
    },
    styles: {
      paddingY: 'large',
      paddingX: 'medium',
      maxWidth: 'default',
      backgroundColor: 'var(--color-surface)',
    },
    display_order: 18,
    is_visible: true,
    is_system: false,
  },
  {
    section_key: 'map_location',
    display_name: { es: 'Ubicación', en: 'Location' },
    content: {
      title: { es: 'Encuéntranos', en: 'Find us' },
      address: {
        es: 'Av. Paseo de la Reforma 222, Cuauhtémoc, 06600 Ciudad de México, CDMX',
        en: '222 Paseo de la Reforma Ave, Cuauhtémoc, 06600 Mexico City, CDMX',
      },
      map_embed_url:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.4!2d-99.1332!3d19.4284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI1JzQyLjMiTiA5OcKwMDcnNTkuNSJX!5e0!3m2!1ses!2smx!4v1234567890',
      aspect_ratio: '16/9',
      show_info_panel: true,
      phone: '+52 55 1234 5678',
      email: 'contacto@empresa.com',
      hours: [
        {
          day: { es: 'Lunes – Viernes', en: 'Monday – Friday' },
          hours: '9:00 – 18:00',
          closed: false,
        },
        { day: { es: 'Sábado', en: 'Saturday' }, hours: '10:00 – 14:00', closed: false },
        { day: { es: 'Domingo', en: 'Sunday' }, hours: '', closed: true },
      ],
    },
    styles: { paddingY: 'large', paddingX: 'medium', maxWidth: 'wide' },
    display_order: 19,
    is_visible: true,
    is_system: false,
  },
]

// ============================================================================
// 8. MODULE SCHEMAS (field definitions for each section)
// ============================================================================

export const SEED_MODULE_SCHEMAS: SeedModuleSchema[] = [
  {
    section_key: 'hero',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: true },
      { key: 'subtitle', type: 'text', isMultilingual: true, required: false },
    ],
    default_content: {},
    default_styles: { paddingY: 'xlarge' },
  },
  {
    section_key: 'value_prop',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: true },
      { key: 'items', type: 'list', isMultilingual: false, required: true },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'how_it_works',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: true },
      { key: 'steps', type: 'list', isMultilingual: false, required: true },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'social_proof',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: true },
      { key: 'testimonials', type: 'list', isMultilingual: false, required: true },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'client_logos',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: false },
      { key: 'logos', type: 'list', isMultilingual: false, required: true },
    ],
    default_content: {},
    default_styles: { paddingY: 'medium' },
  },
  {
    section_key: 'offer_form',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: true },
      { key: 'fields', type: 'list', isMultilingual: false, required: true },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'faq',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: true },
      { key: 'items', type: 'list', isMultilingual: false, required: true },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'final_cta',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: true },
      { key: 'primaryButton', type: 'text', isMultilingual: false, required: true },
    ],
    default_content: {},
    default_styles: { paddingY: 'xlarge' },
  },
  {
    section_key: 'footer',
    fields: [
      { key: 'columns', type: 'list', isMultilingual: false, required: true },
      { key: 'copyright', type: 'text', isMultilingual: true, required: true },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'stats',
    fields: [{ key: 'items', type: 'list', isMultilingual: false, required: true }],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'pricing',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: false },
      { key: 'plans', type: 'list', isMultilingual: false, required: true },
      { key: 'toggle_monthly_label', type: 'text', isMultilingual: true, required: false },
      { key: 'toggle_annual_label', type: 'text', isMultilingual: true, required: false },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'video',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: false },
      { key: 'video_url', type: 'text', isMultilingual: false, required: true },
      { key: 'video_type', type: 'text', isMultilingual: false, required: true },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'team',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: false },
      { key: 'members', type: 'list', isMultilingual: false, required: true },
      { key: 'columns', type: 'number', isMultilingual: false, required: false },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'gallery',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: false },
      { key: 'images', type: 'list', isMultilingual: false, required: true },
      { key: 'layout', type: 'text', isMultilingual: false, required: false },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'features_grid',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: false },
      { key: 'features', type: 'list', isMultilingual: false, required: true },
      { key: 'columns', type: 'number', isMultilingual: false, required: false },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'countdown',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: false },
      { key: 'target_date', type: 'text', isMultilingual: false, required: true },
      { key: 'expired_message', type: 'text', isMultilingual: true, required: false },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'comparison',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: false },
      { key: 'columns', type: 'list', isMultilingual: false, required: true },
      { key: 'rows', type: 'list', isMultilingual: false, required: true },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'newsletter',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: false },
      { key: 'button_label', type: 'text', isMultilingual: true, required: true },
      { key: 'placeholder_email', type: 'text', isMultilingual: true, required: false },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
  {
    section_key: 'map_location',
    fields: [
      { key: 'title', type: 'text', isMultilingual: true, required: false },
      { key: 'map_embed_url', type: 'text', isMultilingual: false, required: true },
      { key: 'address', type: 'text', isMultilingual: true, required: false },
      { key: 'hours', type: 'list', isMultilingual: false, required: false },
    ],
    default_content: {},
    default_styles: { paddingY: 'large' },
  },
]
