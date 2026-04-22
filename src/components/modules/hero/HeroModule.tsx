import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import { EditableText } from '@/components/live-edit/EditableText'
import type { HeroContent, HeroButton } from './hero.types'

export default function HeroModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: ModuleProps<HeroContent>) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const layout = content.layout ?? 'centered'
  const hasBackground = !!(content.backgroundImage?.url || content.backgroundVideo)
  const overlayOpacity = content.overlayOpacity ?? 0.5

  const alignClass =
    layout === 'centered'
      ? 'items-center text-center'
      : layout === 'left'
        ? 'items-start text-left'
        : 'items-start text-left md:items-center md:text-center'

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="hero" styles={styles}>
      {/* Video background */}
      {content.backgroundVideo && (
        <div className="absolute inset-0 overflow-hidden">
          <video
            src={content.backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
          />
        </div>
      )}

      {/* Image background overlay (when no video and image exists) */}
      {!content.backgroundVideo && content.backgroundImage?.url && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        />
      )}

      {/* Content */}
      <div
        className={`relative flex flex-col gap-6 ${alignClass} ${
          layout === 'split' ? 'md:flex-row md:justify-between md:gap-12' : ''
        }`}
      >
        <div
          className={`flex flex-col gap-6 ${
            layout === 'centered' ? 'items-center' : 'items-start'
          } ${layout === 'split' ? 'md:max-w-xl' : 'mx-auto max-w-4xl'}`}
        >
          {/* Title */}
          <EditableText
            as="h1"
            sectionKey="hero"
            fieldPath="title"
            lang={language}
            value={t(content.title)}
            className="text-5xl leading-tight font-bold tracking-tight md:text-7xl"
            style={{ color: hasBackground ? '#ffffff' : 'var(--color-text-primary)' }}
            placeholder="Título principal"
          />

          {/* Subtitle */}
          {content.subtitle && (
            <EditableText
              as="p"
              sectionKey="hero"
              fieldPath="subtitle"
              lang={language}
              value={t(content.subtitle)}
              className="text-xl md:text-2xl"
              style={{
                color: hasBackground ? 'rgba(255,255,255,0.85)' : 'var(--color-text-secondary)',
              }}
              placeholder="Subtítulo"
            />
          )}

          {/* Description */}
          {content.description && (
            <EditableText
              as="p"
              sectionKey="hero"
              fieldPath="description"
              lang={language}
              value={t(content.description)}
              className="max-w-2xl text-base"
              style={{
                color: hasBackground ? 'rgba(255,255,255,0.75)' : 'var(--color-text-secondary)',
              }}
              placeholder="Descripción"
            />
          )}

          {/* Buttons */}
          {(content.primaryButton ?? content.secondaryButton) && (
            <div
              className={`flex flex-wrap gap-4 ${
                layout === 'centered' ? 'justify-center' : 'justify-start'
              }`}
            >
              {content.primaryButton && (
                <HeroButtonLink
                  button={content.primaryButton}
                  label={t(content.primaryButton.label)}
                />
              )}
              {content.secondaryButton && (
                <HeroButtonLink
                  button={content.secondaryButton}
                  label={t(content.secondaryButton.label)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </ModuleWrapper>
  )
}

function HeroButtonLink({ button, label }: { button: HeroButton; label: string }) {
  if (!label) return null

  const baseClass =
    'inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

  const variantStyles: Record<HeroButton['variant'], React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-primary-foreground)',
    },
    secondary: {
      backgroundColor: 'var(--color-secondary)',
      color: 'var(--color-secondary-foreground)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
      border: '2px solid var(--color-primary)',
    },
  }

  return (
    <a href={button.url || '#'} className={baseClass} style={variantStyles[button.variant]}>
      {label}
    </a>
  )
}
