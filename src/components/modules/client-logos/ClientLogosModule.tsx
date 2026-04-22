import type { CSSProperties } from 'react'
import Image from 'next/image'
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
@media (prefers-reduced-motion: reduce) {
  .orion-marquee-track { animation-play-state: paused !important; }
}
.orion-logo-img {
  filter: grayscale(100%);
  opacity: 0.6;
  transition: filter 0.3s ease, opacity 0.3s ease;
}
.orion-logo-img:hover { filter: grayscale(0%); opacity: 1; }
.orion-logo-text {
  opacity: 0.7;
  transition: opacity 0.3s ease, color 0.3s ease;
}
.orion-logo-text:hover { opacity: 1; color: var(--color-text-primary) !important; }
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

      {/* Visually hidden list for screen readers */}
      {logos.length > 0 && (
        <ul className="sr-only" aria-label="Clientes">
          {logos.map((logo) => (
            <li key={logo.id}>{logo.name}</li>
          ))}
        </ul>
      )}

      {/* Marquee is decorative — hidden from screen readers */}
      <div
        aria-hidden="true"
        className="overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div style={trackStyle} className="orion-marquee-track">
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
      <div className="orion-logo-img shrink-0">
        <Image
          src={logo.logoImage.url}
          alt={logo.logoImage.alt?.['en'] ?? logo.name}
          width={160}
          height={40}
          className="h-10 w-auto max-w-[160px] object-contain"
        />
      </div>
    )
  }

  // Placeholder when no image URL is provided
  return (
    <div
      className="orion-logo-text flex h-10 shrink-0 items-center justify-center rounded-lg px-5 py-2"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)',
        minWidth: '120px',
      }}
    >
      <span className="text-sm font-semibold tracking-wide">{logo.name}</span>
    </div>
  )
}
