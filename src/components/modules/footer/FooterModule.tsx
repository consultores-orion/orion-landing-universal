import type { CSSProperties, SVGProps, ReactElement } from 'react'
import type { ModuleProps, ModuleStyles } from '@/lib/modules/types'
import { getContentForLang } from '@/lib/i18n/utils'
import { cn } from '@/lib/utils'
import type { FooterContent } from './footer.types'

type FooterModuleProps = ModuleProps<FooterContent>

const PADDING_Y_MAP: Record<NonNullable<ModuleStyles['paddingY']>, string> = {
  none: 'py-0',
  small: 'py-8',
  medium: 'py-16',
  large: 'py-24',
  xlarge: 'py-32',
}

const PADDING_X_MAP: Record<NonNullable<ModuleStyles['paddingX']>, string> = {
  none: 'px-0',
  small: 'px-4',
  medium: 'px-6',
  large: 'px-8',
}

const MAX_WIDTH_MAP: Record<NonNullable<ModuleStyles['maxWidth']>, string> = {
  narrow: 'max-w-2xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-full',
}

type IconProps = SVGProps<SVGSVGElement>

function FacebookIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
      aria-hidden="true"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function TwitterIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
      aria-hidden="true"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="18"
      height="18"
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function LinkedinIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function YoutubeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
      aria-hidden="true"
      {...props}
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  )
}

function TiktokIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
      aria-hidden="true"
      {...props}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.13a4.85 4.85 0 0 1-1-.44z" />
    </svg>
  )
}

type SocialKey = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok'

const SOCIAL_ICON_MAP: Record<SocialKey, (props: IconProps) => ReactElement> = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
}

export default function FooterModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: FooterModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const columns = content.columns ?? []
  const legalLinks = content.legalLinks ?? []

  const paddingY = PADDING_Y_MAP[styles.paddingY ?? 'large']
  const paddingX = PADDING_X_MAP[styles.paddingX ?? 'medium']
  const maxWidth = MAX_WIDTH_MAP[styles.maxWidth ?? 'default']

  const footerStyle: CSSProperties = {}
  if (styles.backgroundColor) footerStyle.backgroundColor = styles.backgroundColor
  if (styles.textColor) footerStyle.color = styles.textColor

  return (
    <footer
      id={moduleId}
      data-module="footer"
      style={footerStyle}
      className="w-full border-t"
      aria-label="Site footer"
    >
      <div
        className={cn('relative mx-auto', paddingY, paddingX, maxWidth)}
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Link columns grid */}
        {columns.length > 0 && (
          <div
            className={cn(
              'grid gap-8',
              columns.length === 1 && 'grid-cols-1',
              columns.length === 2 && 'grid-cols-2',
              columns.length === 3 && 'grid-cols-2 md:grid-cols-3',
              columns.length >= 4 && 'grid-cols-2 md:grid-cols-4',
            )}
          >
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-3">
                <h3
                  className="text-sm font-semibold tracking-wider uppercase"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {t(col.title)}
                </h3>
                <ul className="flex flex-col gap-2">
                  {(col.links ?? []).map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href={link.url}
                        className="text-sm transition-colors hover:underline"
                        style={{ color: 'var(--color-muted-foreground)' }}
                      >
                        {t(link.label)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div
          className="my-8 border-t"
          style={{ borderColor: 'var(--color-border)' }}
          aria-hidden="true"
        />

        {/* Bottom row: copyright + social + legal */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Copyright */}
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {t(content.copyright)}
          </p>

          {/* Social links */}
          {content.showSocialLinks && content.socialLinks && (
            <div className="flex items-center gap-4">
              {(Object.entries(content.socialLinks) as [SocialKey, string | undefined][]).map(
                ([key, url]) => {
                  if (!url) return null
                  const Icon = SOCIAL_ICON_MAP[key]
                  if (!Icon) return null
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key.charAt(0).toUpperCase() + key.slice(1)}
                      className="transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-muted-foreground)' }}
                    >
                      <Icon aria-hidden="true" />
                    </a>
                  )
                },
              )}
            </div>
          )}

          {/* Legal links */}
          {legalLinks.length > 0 && (
            <nav aria-label="Legal links" className="flex flex-wrap gap-4">
              {legalLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  className="text-xs transition-colors hover:underline"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {t(link.label)}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}
