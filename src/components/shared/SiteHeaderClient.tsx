'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LanguageSelector } from './LanguageSelector'
import { useI18n } from '@/lib/i18n/hooks'

interface SiteHeaderClientProps {
  siteName: string
  logoUrl?: string | null
  navItems: Array<{
    section_key: string
    display_name?: Record<string, string> | null
  }>
}

/** Multilingual fallback labels for nav items when display_name is empty in DB. */
const SECTION_KEY_LABELS: Record<string, Record<string, string>> = {
  hero: { es: 'Inicio', en: 'Home', fr: 'Accueil', pt: 'Início' },
  value_prop: { es: 'Beneficios', en: 'Benefits', fr: 'Avantages', pt: 'Benefícios' },
  how_it_works: {
    es: 'Cómo Funciona',
    en: 'How It Works',
    fr: 'Comment ça marche',
    pt: 'Como Funciona',
  },
  social_proof: { es: 'Testimonios', en: 'Testimonials', fr: 'Témoignages', pt: 'Depoimentos' },
  client_logos: { es: 'Clientes', en: 'Clients', fr: 'Clients', pt: 'Clientes' },
  offer_form: { es: 'Contacto', en: 'Contact', fr: 'Contact', pt: 'Contato' },
  faq: { es: 'FAQ', en: 'FAQ', fr: 'FAQ', pt: 'FAQ' },
  final_cta: { es: 'Empezar', en: 'Get Started', fr: 'Commencer', pt: 'Começar' },
  stats: { es: 'Estadísticas', en: 'Statistics', fr: 'Statistiques', pt: 'Estatísticas' },
  pricing: { es: 'Precios', en: 'Pricing', fr: 'Tarifs', pt: 'Preços' },
  video: { es: 'Video', en: 'Video', fr: 'Vidéo', pt: 'Vídeo' },
  team: { es: 'Equipo', en: 'Team', fr: 'Équipe', pt: 'Equipe' },
  gallery: { es: 'Galería', en: 'Gallery', fr: 'Galerie', pt: 'Galeria' },
  features_grid: { es: 'Características', en: 'Features', fr: 'Fonctionnalités', pt: 'Recursos' },
  countdown: {
    es: 'Cuenta Regresiva',
    en: 'Countdown',
    fr: 'Compte à rebours',
    pt: 'Contagem Regressiva',
  },
  comparison: { es: 'Comparación', en: 'Comparison', fr: 'Comparaison', pt: 'Comparação' },
  newsletter: { es: 'Boletín', en: 'Newsletter', fr: 'Bulletin', pt: 'Boletim' },
  map_location: { es: 'Ubicación', en: 'Location', fr: 'Emplacement', pt: 'Localização' },
}

export function SiteHeaderClient({ siteName, logoUrl, navItems }: SiteHeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLElement>(null)
  const { currentLang, defaultLang } = useI18n()

  // Resolve nav labels client-side using the user's selected language
  const resolvedNavItems = navItems.map((item) => {
    const names = item.display_name ?? {}
    const fallback = SECTION_KEY_LABELS[item.section_key] ?? {}
    const label =
      names[currentLang] ??
      names[defaultLang] ??
      fallback[currentLang] ??
      fallback[defaultLang] ??
      fallback['es'] ??
      item.section_key
    return { section_key: item.section_key, label }
  })

  // Focus first focusable element when menu opens
  useEffect(() => {
    if (!isMenuOpen) return
    const menuEl = menuRef.current
    if (!menuEl) return
    const focusable = menuEl.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    focusable[0]?.focus()
  }, [isMenuOpen])

  // Escape to close + Tab focus trap
  useEffect(() => {
    if (!isMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const menuEl = menuRef.current
      if (!menuEl) return
      const focusable = menuEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <header className="bg-background/80 border-border sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo / Site name */}
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={siteName}>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={siteName}
              width={160}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          ) : (
            <span className="text-text-primary text-lg font-bold">{siteName}</span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegación principal">
          {resolvedNavItems.map((item) => (
            <a
              key={item.section_key}
              href={`#${item.section_key}`}
              className="text-text-secondary hover:text-primary focus-visible:ring-primary rounded text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right side: language selector + hamburger */}
        <div className="flex items-center gap-3">
          <LanguageSelector variant="buttons" size="sm" />

          {/* Hamburger — only on mobile */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="text-text-secondary hover:bg-surface flex h-8 w-8 items-center justify-center rounded transition-colors md:hidden"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              // X icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <nav
          ref={menuRef}
          id="mobile-menu"
          className="border-border bg-background border-t px-4 pt-2 pb-4 md:hidden"
          aria-label="Navegación móvil"
        >
          <ul className="flex flex-col gap-1">
            {resolvedNavItems.map((item) => (
              <li key={item.section_key}>
                <a
                  href={`#${item.section_key}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-text-secondary hover:bg-surface hover:text-primary focus-visible:ring-primary block rounded px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
