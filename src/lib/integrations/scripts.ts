/**
 * Integration type definitions, type guards, and helper utilities.
 * Used by both admin UI and landing page injection components.
 */

// ─────────────────────────────────────────────────────────────
// Config interfaces per integration type
// ─────────────────────────────────────────────────────────────

export interface GA4Config {
  measurement_id: string
}

export interface GTMConfig {
  container_id: string
}

export interface MetaPixelConfig {
  pixel_id: string
}

export interface WhatsAppConfig {
  phone_number: string
  message: string
  position: 'left' | 'right'
}

export interface CalendlyConfig {
  url: string
  button_text: string
}

export interface SMTPConfig {
  host: string
  port: number
  username: string
  from_email: string
  from_name: string
}

export interface CustomScriptsConfig {
  head_scripts: string
  body_scripts: string
}

// ─────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────

export function isGA4Config(c: unknown): c is GA4Config {
  return (
    typeof c === 'object' &&
    c !== null &&
    typeof (c as Record<string, unknown>)['measurement_id'] === 'string'
  )
}

export function isGTMConfig(c: unknown): c is GTMConfig {
  return (
    typeof c === 'object' &&
    c !== null &&
    typeof (c as Record<string, unknown>)['container_id'] === 'string'
  )
}

export function isMetaPixelConfig(c: unknown): c is MetaPixelConfig {
  return (
    typeof c === 'object' &&
    c !== null &&
    typeof (c as Record<string, unknown>)['pixel_id'] === 'string'
  )
}

export function isWhatsAppConfig(c: unknown): c is WhatsAppConfig {
  return (
    typeof c === 'object' &&
    c !== null &&
    typeof (c as Record<string, unknown>)['phone_number'] === 'string' &&
    typeof (c as Record<string, unknown>)['message'] === 'string' &&
    ((c as Record<string, unknown>)['position'] === 'left' ||
      (c as Record<string, unknown>)['position'] === 'right')
  )
}

export function isCalendlyConfig(c: unknown): c is CalendlyConfig {
  return (
    typeof c === 'object' &&
    c !== null &&
    typeof (c as Record<string, unknown>)['url'] === 'string' &&
    typeof (c as Record<string, unknown>)['button_text'] === 'string'
  )
}

export function isSMTPConfig(c: unknown): c is SMTPConfig {
  return (
    typeof c === 'object' &&
    c !== null &&
    typeof (c as Record<string, unknown>)['host'] === 'string' &&
    typeof (c as Record<string, unknown>)['port'] === 'number' &&
    typeof (c as Record<string, unknown>)['username'] === 'string' &&
    typeof (c as Record<string, unknown>)['from_email'] === 'string' &&
    typeof (c as Record<string, unknown>)['from_name'] === 'string'
  )
}

export function isCustomScriptsConfig(c: unknown): c is CustomScriptsConfig {
  return (
    typeof c === 'object' &&
    c !== null &&
    typeof (c as Record<string, unknown>)['head_scripts'] === 'string' &&
    typeof (c as Record<string, unknown>)['body_scripts'] === 'string'
  )
}

// ─────────────────────────────────────────────────────────────
// Label / description helpers
// ─────────────────────────────────────────────────────────────

const INTEGRATION_LABELS: Record<string, string> = {
  ga4: 'Google Analytics 4',
  gtm: 'Google Tag Manager',
  meta_pixel: 'Meta Pixel',
  whatsapp: 'WhatsApp',
  calendly: 'Calendly',
  smtp: 'Notificaciones SMTP',
  custom_scripts: 'Scripts Personalizados',
}

const INTEGRATION_DESCRIPTIONS: Record<string, string> = {
  ga4: 'Rastrea visitas y eventos de tu landing.',
  gtm: 'Gestiona todos tus scripts desde un solo lugar.',
  meta_pixel: 'Mide conversiones de tus anuncios de Meta.',
  whatsapp: 'Botón flotante de contacto por WhatsApp.',
  calendly: 'Permite agendar citas directamente.',
  smtp: 'Recibe emails al capturar nuevos leads.',
  custom_scripts: 'Inyecta scripts en head o body.',
}

export function getIntegrationLabel(type: string): string {
  return INTEGRATION_LABELS[type] ?? type
}

export function getIntegrationDescription(type: string): string {
  return INTEGRATION_DESCRIPTIONS[type] ?? ''
}

// ─────────────────────────────────────────────────────────────
// isIntegrationConfigured — checks primary field presence
// ─────────────────────────────────────────────────────────────

export function isIntegrationConfigured(type: string, config: Record<string, unknown>): boolean {
  switch (type) {
    case 'ga4':
      return typeof config['measurement_id'] === 'string' && config['measurement_id'] !== ''
    case 'gtm':
      return typeof config['container_id'] === 'string' && config['container_id'] !== ''
    case 'meta_pixel':
      return typeof config['pixel_id'] === 'string' && config['pixel_id'] !== ''
    case 'whatsapp':
      return typeof config['phone_number'] === 'string' && config['phone_number'] !== ''
    case 'calendly':
      return typeof config['url'] === 'string' && config['url'] !== ''
    case 'smtp':
      return (
        typeof config['host'] === 'string' &&
        config['host'] !== '' &&
        typeof config['from_email'] === 'string' &&
        config['from_email'] !== ''
      )
    case 'custom_scripts': {
      const head = config['head_scripts']
      const body = config['body_scripts']
      return (typeof head === 'string' && head !== '') || (typeof body === 'string' && body !== '')
    }
    default:
      return false
  }
}
