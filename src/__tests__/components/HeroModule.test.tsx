import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import type { ModuleStyles } from '@/lib/modules/types'
import type { HeroContent } from '@/components/modules/hero/hero.types'

// ── Mocks ────────────────────────────────────────────────────────────────────

// next/navigation is imported transitively by some shared helpers
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}))

// next/image → simple <img> so jsdom can render it
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} src={String(props.src ?? '')} />
  },
}))

// next/link → simple <a> tag
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

// Zustand editor store — isEditing = false so EditableText renders static tags
vi.mock('@/stores/editor.store', () => ({
  useEditorStore: vi.fn((selector: (s: { isEditing: boolean }) => unknown) =>
    selector({ isEditing: false }),
  ),
}))

// useInlineEdit is only exercised in edit mode; stub it to avoid fetch calls
vi.mock('@/hooks/useInlineEdit', () => ({
  useInlineEdit: vi.fn(() => ({
    saveStatus: 'idle' as const,
    save: vi.fn(),
    debouncedSave: vi.fn(),
  })),
}))

// ── Import component AFTER mocks ─────────────────────────────────────────────
import HeroModule from '@/components/modules/hero/HeroModule'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const DEFAULT_STYLES: ModuleStyles = {}

const MINIMAL_CONTENT: HeroContent = {
  title: { es: 'Bienvenido', en: 'Welcome' },
  subtitle: { es: 'Tu plataforma todo en uno', en: 'Your all-in-one platform' },
}

const FULL_CONTENT: HeroContent = {
  title: { es: 'Título principal', en: 'Main title' },
  subtitle: { es: 'Subtítulo descriptivo', en: 'Descriptive subtitle' },
  description: { es: 'Descripción larga del producto.', en: 'Long product description.' },
  primaryButton: {
    label: { es: 'Empezar ahora', en: 'Get started' },
    url: 'https://example.com/start',
    variant: 'primary',
  },
  secondaryButton: {
    label: { es: 'Ver demo', en: 'View demo' },
    url: 'https://example.com/demo',
    variant: 'outline',
  },
  layout: 'centered',
}

function renderHero(content: HeroContent = MINIMAL_CONTENT, styles: ModuleStyles = DEFAULT_STYLES) {
  return render(
    <HeroModule
      content={content}
      styles={styles}
      moduleId="hero-1"
      isEditing={false}
      language="es"
      defaultLanguage="es"
    />,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('HeroModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing with minimal props', () => {
    expect(() => renderHero()).not.toThrow()
  })

  it('renders the section with the correct module id', () => {
    const { container } = renderHero()
    const section = container.querySelector('section#hero-1')
    expect(section).toBeInTheDocument()
  })

  it('displays the title from JSONB content in the active language', () => {
    renderHero()
    expect(screen.getByRole('heading', { level: 1, name: 'Bienvenido' })).toBeInTheDocument()
  })

  it('displays the title in the requested language (en)', () => {
    render(
      <HeroModule
        content={MINIMAL_CONTENT}
        styles={DEFAULT_STYLES}
        moduleId="hero-en"
        isEditing={false}
        language="en"
        defaultLanguage="es"
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome' })).toBeInTheDocument()
  })

  it('displays the subtitle', () => {
    renderHero()
    expect(screen.getByText('Tu plataforma todo en uno')).toBeInTheDocument()
  })

  it('renders the primary CTA button with a valid href', () => {
    renderHero(FULL_CONTENT)
    const link = screen.getByRole('link', { name: 'Empezar ahora' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com/start')
  })

  it('renders the secondary CTA button with a valid href', () => {
    renderHero(FULL_CONTENT)
    const link = screen.getByRole('link', { name: 'Ver demo' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com/demo')
  })

  it('does not render buttons when neither primaryButton nor secondaryButton is set', () => {
    renderHero(MINIMAL_CONTENT)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders description when provided', () => {
    renderHero(FULL_CONTENT)
    expect(screen.getByText('Descripción larga del producto.')).toBeInTheDocument()
  })

  it('renders a video element when backgroundVideo is provided', () => {
    const content: HeroContent = {
      ...MINIMAL_CONTENT,
      backgroundVideo: 'https://example.com/video.mp4',
    }
    const { container } = renderHero(content)
    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', 'https://example.com/video.mp4')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderHero(FULL_CONTENT)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
