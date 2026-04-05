'use client'

import { useState } from 'react'
import { LanguageSelector } from './LanguageSelector'

interface NavItem {
  section_key: string
  label: string
}

interface SiteHeaderClientProps {
  siteName: string
  logoUrl?: string | null
  navItems: NavItem[]
}

export function SiteHeaderClient({ siteName, logoUrl, navItems }: SiteHeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-background/80 border-border sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo / Site name */}
        <a href="#" className="flex shrink-0 items-center gap-2" aria-label={siteName}>
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-text-primary text-lg font-bold">{siteName}</span>
          )}
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegación principal">
          {navItems.map((item) => (
            <a
              key={item.section_key}
              href={`#${item.section_key}`}
              className="text-text-secondary hover:text-primary text-sm font-medium transition-colors"
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
          id="mobile-menu"
          className="border-border bg-background border-t px-4 pt-2 pb-4 md:hidden"
          aria-label="Navegación móvil"
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.section_key}>
                <a
                  href={`#${item.section_key}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-text-secondary hover:bg-surface hover:text-primary block rounded px-3 py-2 text-sm font-medium transition-colors"
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
