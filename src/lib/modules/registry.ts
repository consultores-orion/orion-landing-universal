import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { ModuleProps, ModuleRegistryEntry } from './types'

// Helper to cast typed module components to the generic registry signature.
// Each module uses a concrete content type (e.g. HeroContent) which is a
// structural subtype of Record<string,unknown>, but TypeScript's ClassComponent
// contravariance on props prevents direct assignability. The cast is safe
// because the renderer always passes the correct content shape per section_key.
function asModule(
  loader: () => Promise<{ default: ComponentType<ModuleProps<never>> }>,
): ComponentType<ModuleProps<Record<string, unknown>>> {
  return dynamic(
    () =>
      loader().then((m) => ({
        default: m.default as unknown as ComponentType<ModuleProps<Record<string, unknown>>>,
      })),
    { ssr: true },
  )
}

const registry = new Map<string, ModuleRegistryEntry>([
  [
    'hero',
    {
      key: 'hero',
      displayName: 'Hero',
      description: 'Sección principal con título, subtítulo y CTAs',
      component: asModule(() => import('@/components/modules/hero') as never),
      category: 'header',
      isSystem: false,
      defaultOrder: 1,
    },
  ],
  [
    'value_prop',
    {
      key: 'value_prop',
      displayName: 'Propuesta de Valor',
      description: 'Propuesta de valor con beneficios e iconos',
      component: asModule(() => import('@/components/modules/value-prop') as never),
      category: 'content',
      isSystem: false,
      defaultOrder: 2,
    },
  ],
  [
    'how_it_works',
    {
      key: 'how_it_works',
      displayName: 'Cómo Funciona',
      description: 'Pasos del proceso explicados visualmente',
      component: asModule(() => import('@/components/modules/how-it-works') as never),
      category: 'content',
      isSystem: false,
      defaultOrder: 3,
    },
  ],
  [
    'social_proof',
    {
      key: 'social_proof',
      displayName: 'Prueba Social',
      description: 'Testimonios de clientes en carrusel',
      component: asModule(() => import('@/components/modules/social-proof') as never),
      category: 'social',
      isSystem: false,
      defaultOrder: 4,
    },
  ],
  [
    'client_logos',
    {
      key: 'client_logos',
      displayName: 'Logos de Clientes',
      description: 'Logos de clientes en marquee animado',
      component: asModule(() => import('@/components/modules/client-logos') as never),
      category: 'social',
      isSystem: false,
      defaultOrder: 5,
    },
  ],
  [
    'offer_form',
    {
      key: 'offer_form',
      displayName: 'Formulario de Contacto',
      description: 'Formulario de captura de leads configurable',
      component: asModule(() => import('@/components/modules/offer-form') as never),
      category: 'conversion',
      isSystem: false,
      defaultOrder: 6,
    },
  ],
  [
    'faq',
    {
      key: 'faq',
      displayName: 'Preguntas Frecuentes',
      description: 'Preguntas y respuestas en acordeón',
      component: asModule(() => import('@/components/modules/faq') as never),
      category: 'info',
      isSystem: false,
      defaultOrder: 7,
    },
  ],
  [
    'final_cta',
    {
      key: 'final_cta',
      displayName: 'CTA Final',
      description: 'Call to action final de alto impacto',
      component: asModule(() => import('@/components/modules/final-cta') as never),
      category: 'conversion',
      isSystem: false,
      defaultOrder: 8,
    },
  ],
  [
    'footer',
    {
      key: 'footer',
      displayName: 'Footer',
      description: 'Pie de página con enlaces, redes sociales y copyright',
      component: asModule(() => import('@/components/modules/footer') as never),
      category: 'footer',
      isSystem: true,
      defaultOrder: 9,
    },
  ],
  [
    'stats',
    {
      key: 'stats',
      displayName: 'Estadísticas',
      description: 'Métricas clave con animación de contador',
      component: asModule(() => import('@/components/modules/stats') as never),
      category: 'content',
      isSystem: false,
      defaultOrder: 10,
    },
  ],
  [
    'pricing',
    {
      key: 'pricing',
      displayName: 'Precios',
      description: 'Planes y precios con toggle mensual/anual',
      component: asModule(() => import('@/components/modules/pricing') as never),
      category: 'conversion',
      isSystem: false,
      defaultOrder: 11,
    },
  ],
  [
    'video',
    {
      key: 'video',
      displayName: 'Video',
      description: 'Video embebido responsivo (YouTube/Vimeo/archivo)',
      component: asModule(() => import('@/components/modules/video') as never),
      category: 'content',
      isSystem: false,
      defaultOrder: 12,
    },
  ],
  [
    'team',
    {
      key: 'team',
      displayName: 'Equipo',
      description: 'Grid de miembros del equipo con redes sociales',
      component: asModule(() => import('@/components/modules/team') as never),
      category: 'social',
      isSystem: false,
      defaultOrder: 13,
    },
  ],
  [
    'gallery',
    {
      key: 'gallery',
      displayName: 'Galería',
      description: 'Grid de imágenes con lightbox y soporte masonry',
      component: asModule(() => import('@/components/modules/gallery') as never),
      category: 'content',
      isSystem: false,
      defaultOrder: 14,
    },
  ],
  [
    'features_grid',
    {
      key: 'features_grid',
      displayName: 'Grid de Características',
      description: 'Grid responsivo de features con iconos y descripciones',
      component: asModule(() => import('@/components/modules/features-grid') as never),
      category: 'content',
      isSystem: false,
      defaultOrder: 15,
    },
  ],
  [
    'countdown',
    {
      key: 'countdown',
      displayName: 'Cuenta Regresiva',
      description: 'Temporizador con fecha objetivo configurable',
      component: asModule(() => import('@/components/modules/countdown') as never),
      category: 'conversion',
      isSystem: false,
      defaultOrder: 16,
    },
  ],
  [
    'comparison',
    {
      key: 'comparison',
      displayName: 'Tabla Comparativa',
      description: 'Tabla de comparación con checkmarks y columna destacada',
      component: asModule(() => import('@/components/modules/comparison') as never),
      category: 'content',
      isSystem: false,
      defaultOrder: 17,
    },
  ],
  [
    'newsletter',
    {
      key: 'newsletter',
      displayName: 'Newsletter',
      description: 'Formulario de suscripción de email simple',
      component: asModule(() => import('@/components/modules/newsletter') as never),
      category: 'conversion',
      isSystem: false,
      defaultOrder: 18,
    },
  ],
  [
    'map_location',
    {
      key: 'map_location',
      displayName: 'Mapa / Ubicación',
      description: 'Mapa embebido con dirección, horarios y datos de contacto',
      component: asModule(() => import('@/components/modules/map-location') as never),
      category: 'info',
      isSystem: false,
      defaultOrder: 19,
    },
  ],
])

export function getModuleDefinition(key: string): ModuleRegistryEntry | undefined {
  return registry.get(key)
}

export function getAllModules(): ModuleRegistryEntry[] {
  return Array.from(registry.values())
}

export function getModulesByCategory(category: string): ModuleRegistryEntry[] {
  return Array.from(registry.values()).filter((m) => m.category === category)
}

export function registerModule(entry: ModuleRegistryEntry): void {
  registry.set(entry.key, entry)
}
