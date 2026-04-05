import { SiteHeaderClient } from './SiteHeaderClient'

interface SiteHeaderProps {
  siteName: string
  logoUrl?: string | null
  /**
   * Visible page modules. display_name is a JSONB object keyed by language code,
   * e.g. { es: 'Inicio', en: 'Home' }.
   */
  modules: Array<{
    section_key: string
    display_name?: Record<string, string> | null
  }>
  /** ISO language code used to pick the nav label. Falls back to 'es' then first key. */
  currentLang?: string
}

/** Server Component — transforms module list into nav items and delegates rendering to the client. */
export function SiteHeader({ siteName, logoUrl, modules, currentLang = 'es' }: SiteHeaderProps) {
  // Build nav items, skipping 'footer' (not a navigable section)
  const navItems = modules
    .filter((m) => m.section_key !== 'footer')
    .map((m) => {
      const names = m.display_name ?? {}
      const label = names[currentLang] ?? names['es'] ?? Object.values(names)[0] ?? m.section_key
      return { section_key: m.section_key, label }
    })

  return <SiteHeaderClient siteName={siteName} logoUrl={logoUrl} navItems={navItems} />
}
