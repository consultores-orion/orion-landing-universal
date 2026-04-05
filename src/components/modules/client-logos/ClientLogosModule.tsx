import type { CSSProperties } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { ClientLogosContent, ClientLogo } from './client-logos.types'

const SPEED_DURATION: Record<string, string> = {
  slow: '40s',
  normal: '25s',
  fast: '12s',
}

const marqueeKeyframes = `
@keyframes orion-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
`

export default function ClientLogosModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: ModuleProps<ClientLogosContent>) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const logos: ClientLogo[] = Array.isArray(content.logos) ? content.logos : []
  const speed = content.speed ?? 'normal'
  const duration = SPEED_DURATION[speed] ?? SPEED_DURATION['normal']
  const showTitle = content.showTitle !== false

  // Duplicate logos so the animation loops seamlessly
  const doubledLogos = [...logos, ...logos]

  const trackStyle: CSSProperties = {
    display: 'flex',
    gap: '3rem',
    alignItems: 'center',
    // Total width: 2× the content, so we can slide exactly -50% and loop
    width: 'max-content',
    animation: `orion-marquee ${duration} linear infinite`,
  }

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="client_logos" styles={styles}>
      {/* Inject keyframes once */}
      <style dangerouslySetInnerHTML={{ __html: marqueeKeyframes }} />

      {/* Title */}
      {showTitle && content.title && (
        <p
          className="mb-8 text-center text-sm font-semibold tracking-widest uppercase"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {t(content.title)}
        </p>
      )}

      {/* Marquee track container — overflow hidden to mask the repeat */}
      <div
        className="overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div style={trackStyle}>
          {doubledLogos.map((logo, index) => (
            <LogoItem key={`${logo.id}-${index}`} logo={logo} />
          ))}
        </div>
      </div>
    </ModuleWrapper>
  )
}

function LogoItem({ logo }: { logo: ClientLogo }) {
  const hasImage = !!logo.logoImage.url

  if (hasImage) {
    return (
      <div
        className="shrink-0 transition-all duration-300"
        style={{ filter: 'grayscale(100%)', opacity: 0.6 }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.filter = 'grayscale(0%)'
          el.style.opacity = '1'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.filter = 'grayscale(100%)'
          el.style.opacity = '0.6'
        }}
      >
        <img
          src={logo.logoImage.url}
          alt={logo.logoImage.alt?.['en'] ?? logo.name}
          className="h-10 w-auto max-w-[160px] object-contain"
          loading="lazy"
        />
      </div>
    )
  }

  // Placeholder when no image URL is provided
  return (
    <div
      className="flex h-10 shrink-0 items-center justify-center rounded-lg px-5 py-2 transition-all duration-300"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)',
        opacity: 0.7,
        minWidth: '120px',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.opacity = '1'
        el.style.color = 'var(--color-text-primary)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.opacity = '0.7'
        el.style.color = 'var(--color-text-secondary)'
      }}
    >
      <span className="text-sm font-semibold tracking-wide">{logo.name}</span>
    </div>
  )
}
