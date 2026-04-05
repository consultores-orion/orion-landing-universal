import type { SVGProps } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { TeamContent, TeamMember, TeamMemberSocial } from './team.types'

type TeamModuleProps = ModuleProps<TeamContent>

const COLUMN_CLASS_MAP: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
}

// --- Social icon components ---

type IconProps = SVGProps<SVGSVGElement>

function TwitterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function WebsiteIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

// --- Social links sub-component ---

interface SocialLinksProps {
  social: TeamMemberSocial
  memberName: string
}

function SocialLinks({ social, memberName }: SocialLinksProps) {
  const links: Array<{
    key: keyof TeamMemberSocial
    url: string | undefined
    label: string
    Icon: (props: IconProps) => React.ReactElement | null
  }> = [
    { key: 'twitter', url: social.twitter, label: `${memberName} on Twitter`, Icon: TwitterIcon },
    {
      key: 'linkedin',
      url: social.linkedin,
      label: `${memberName} on LinkedIn`,
      Icon: LinkedInIcon,
    },
    { key: 'github', url: social.github, label: `${memberName} on GitHub`, Icon: GitHubIcon },
    {
      key: 'instagram',
      url: social.instagram,
      label: `${memberName} on Instagram`,
      Icon: InstagramIcon,
    },
    { key: 'website', url: social.website, label: `${memberName}'s website`, Icon: WebsiteIcon },
  ]

  const activeLinks = links.filter((l) => !!l.url)
  if (activeLinks.length === 0) return null

  return (
    <div className="mt-4 flex justify-center gap-3">
      {activeLinks.map(({ key, url, label, Icon }) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  )
}

// --- Member card sub-component ---

interface MemberCardProps {
  member: TeamMember
  t: (field: Record<string, string> | string | null | undefined) => string
}

function MemberCard({ member, t }: MemberCardProps) {
  return (
    <div
      className="flex flex-col items-center rounded-2xl border p-6 text-center"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Avatar */}
      <img
        src={member.avatar_url || '/placeholder-avatar.svg'}
        alt={member.name}
        className="mx-auto h-24 w-24 rounded-full object-cover"
        loading="lazy"
      />

      {/* Name */}
      <h3 className="mt-4 text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
        {member.name}
      </h3>

      {/* Role */}
      <p className="mt-1 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
        {t(member.role)}
      </p>

      {/* Bio */}
      {member.bio && (
        <p
          className="mt-3 text-xs leading-relaxed"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          {t(member.bio)}
        </p>
      )}

      {/* Social links */}
      {member.social && <SocialLinks social={member.social} memberName={member.name} />}
    </div>
  )
}

// --- Main module ---

export default function TeamModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: TeamModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const members = content.members ?? []
  const columns = (content.columns ?? 3) as 2 | 3 | 4
  const colClass = COLUMN_CLASS_MAP[columns] ?? COLUMN_CLASS_MAP[3]

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="team" styles={styles}>
      {/* Header */}
      {(content.title ?? content.subtitle) ? (
        <div className="mb-10 text-center">
          {content.title && (
            <h2
              className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: 'var(--color-foreground)' }}
            >
              {t(content.title)}
            </h2>
          )}
          {content.subtitle && (
            <p className="text-base sm:text-lg" style={{ color: 'var(--color-muted-foreground)' }}>
              {t(content.subtitle)}
            </p>
          )}
        </div>
      ) : null}

      {/* Members grid */}
      <div className={`grid gap-6 ${colClass}`}>
        {members.map((member) => (
          <MemberCard key={member.id} member={member} t={t} />
        ))}
      </div>
    </ModuleWrapper>
  )
}
