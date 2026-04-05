import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { MapLocationContent } from './map-location.types'

type MapLocationModuleProps = ModuleProps<MapLocationContent>

const PADDING_MAP: Record<'16/9' | '4/3' | '1/1', string> = {
  '16/9': '56.25%',
  '4/3': '75%',
  '1/1': '100%',
}

export default function MapLocationModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: MapLocationModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const ratio = content.aspect_ratio ?? '16/9'
  const paddingBottom = PADDING_MAP[ratio]
  const showPanel = content.show_info_panel ?? true
  const hours = content.hours ?? []

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="map_location" styles={styles}>
      {/* Section title */}
      {content.title && (
        <h2
          className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: 'var(--color-foreground)' }}
        >
          {t(content.title)}
        </h2>
      )}

      {/* Main layout */}
      <div className={showPanel ? 'grid grid-cols-1 gap-8 lg:grid-cols-2' : undefined}>
        {/* Map */}
        <div>
          {content.map_embed_url ? (
            <div
              className="overflow-hidden rounded-xl"
              style={{
                position: 'relative',
                paddingBottom,
                border: '1px solid var(--color-border)',
              }}
            >
              <iframe
                src={content.map_embed_url}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t(content.title) || 'Map'}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                backgroundColor: 'var(--color-surface)',
                aspectRatio: '16/9',
                border: '1px dashed var(--color-border)',
              }}
            >
              <p style={{ color: 'var(--color-muted-foreground)' }}>
                {language === 'es' ? 'Configura la URL del mapa' : 'Configure the map URL'}
              </p>
            </div>
          )}
        </div>

        {/* Info panel */}
        {showPanel && (
          <div
            className="flex flex-col gap-6 rounded-xl p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Address */}
            {content.address && (
              <div className="flex gap-3">
                <span className="mt-0.5 text-xl" aria-hidden="true">
                  📍
                </span>
                <div>
                  <p
                    className="mb-0.5 text-xs font-semibold tracking-wide uppercase"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    {language === 'es' ? 'Dirección' : 'Address'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                    {t(content.address)}
                  </p>
                </div>
              </div>
            )}

            {/* Phone */}
            {content.phone && (
              <div className="flex gap-3">
                <span className="mt-0.5 text-xl" aria-hidden="true">
                  📞
                </span>
                <div>
                  <p
                    className="mb-0.5 text-xs font-semibold tracking-wide uppercase"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    {language === 'es' ? 'Teléfono' : 'Phone'}
                  </p>
                  <a
                    href={`tel:${content.phone}`}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {content.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Email */}
            {content.email && (
              <div className="flex gap-3">
                <span className="mt-0.5 text-xl" aria-hidden="true">
                  ✉️
                </span>
                <div>
                  <p
                    className="mb-0.5 text-xs font-semibold tracking-wide uppercase"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    {language === 'es' ? 'Email' : 'Email'}
                  </p>
                  <a
                    href={`mailto:${content.email}`}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {content.email}
                  </a>
                </div>
              </div>
            )}

            {/* Business hours */}
            {hours.length > 0 && (
              <div className="flex gap-3">
                <span className="mt-0.5 text-xl" aria-hidden="true">
                  🕐
                </span>
                <div className="flex-1">
                  <p
                    className="mb-2 text-xs font-semibold tracking-wide uppercase"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    {language === 'es' ? 'Horario' : 'Hours'}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {hours.map((h, i) => (
                      <li key={i} className="flex items-center justify-between gap-4 text-sm">
                        <span
                          style={{
                            color: h.closed
                              ? 'var(--color-muted-foreground)'
                              : 'var(--color-foreground)',
                          }}
                        >
                          {t(h.day)}
                        </span>
                        <span
                          style={{
                            color: h.closed
                              ? 'var(--color-muted-foreground)'
                              : 'var(--color-foreground)',
                          }}
                        >
                          {h.closed ? (language === 'es' ? 'Cerrado' : 'Closed') : h.hours}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ModuleWrapper>
  )
}
