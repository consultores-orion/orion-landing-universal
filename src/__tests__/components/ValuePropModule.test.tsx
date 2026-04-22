import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import type { ModuleStyles } from '@/lib/modules/types'
import type { ValuePropContent } from '@/components/modules/value-prop/value-prop.types'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} src={String(props.src ?? '')} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('@/stores/editor.store', () => ({
  useEditorStore: vi.fn((selector: (s: { isEditing: boolean }) => unknown) =>
    selector({ isEditing: false }),
  ),
}))

vi.mock('@/hooks/useInlineEdit', () => ({
  useInlineEdit: vi.fn(() => ({
    saveStatus: 'idle' as const,
    save: vi.fn(),
    debouncedSave: vi.fn(),
  })),
}))

// ── Import component AFTER mocks ─────────────────────────────────────────────
import ValuePropModule from '@/components/modules/value-prop/ValuePropModule'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const DEFAULT_STYLES: ModuleStyles = {}

const CONTENT_THREE_CARDS: ValuePropContent = {
  title: { es: 'Nuestros beneficios', en: 'Our benefits' },
  subtitle: { es: 'Por qué elegirnos', en: 'Why choose us' },
  columns: 3,
  layout: 'cards',
  items: [
    {
      icon: 'Zap',
      title: { es: 'Rapidez', en: 'Speed' },
      description: { es: 'Procesamos en segundos', en: 'Processed in seconds' },
    },
    {
      icon: 'Shield',
      title: { es: 'Seguridad', en: 'Security' },
      description: { es: 'Tus datos protegidos', en: 'Your data protected' },
    },
    {
      icon: 'Star',
      title: { es: 'Calidad', en: 'Quality' },
      description: { es: 'Estándares de excelencia', en: 'Excellence standards' },
    },
  ],
}

const CONTENT_MINIMAL: ValuePropContent = {
  title: { es: 'Propuesta de valor', en: 'Value proposition' },
  items: [],
}

function renderValueProp(
  content: ValuePropContent = CONTENT_THREE_CARDS,
  styles: ModuleStyles = DEFAULT_STYLES,
) {
  return render(
    <ValuePropModule
      content={content}
      styles={styles}
      moduleId="value-prop-1"
      isEditing={false}
      language="es"
      defaultLanguage="es"
    />,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ValuePropModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing with minimal props', () => {
    expect(() => renderValueProp(CONTENT_MINIMAL)).not.toThrow()
  })

  it('renders the section with the correct module id', () => {
    const { container } = renderValueProp()
    expect(container.querySelector('section#value-prop-1')).toBeInTheDocument()
  })

  it('displays the section title', () => {
    renderValueProp()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nuestros beneficios' }),
    ).toBeInTheDocument()
  })

  it('displays the section subtitle when provided', () => {
    renderValueProp()
    expect(screen.getByText('Por qué elegirnos')).toBeInTheDocument()
  })

  it('renders all items from the items array', () => {
    renderValueProp()
    // Each item has an h3 heading with its title
    expect(screen.getByRole('heading', { level: 3, name: 'Rapidez' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Seguridad' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Calidad' })).toBeInTheDocument()
  })

  it('renders item descriptions', () => {
    renderValueProp()
    expect(screen.getByText('Procesamos en segundos')).toBeInTheDocument()
    expect(screen.getByText('Tus datos protegidos')).toBeInTheDocument()
    expect(screen.getByText('Estándares de excelencia')).toBeInTheDocument()
  })

  it('renders with no items gracefully (empty grid)', () => {
    renderValueProp(CONTENT_MINIMAL)
    // Title still renders, no item headings (h3)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Propuesta de valor' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('renders in icons-top layout without errors', () => {
    const content: ValuePropContent = {
      ...CONTENT_THREE_CARDS,
      layout: 'icons-top',
    }
    expect(() => renderValueProp(content)).not.toThrow()
    expect(screen.getByRole('heading', { level: 3, name: 'Rapidez' })).toBeInTheDocument()
  })

  it('renders in minimal layout without errors', () => {
    const content: ValuePropContent = {
      ...CONTENT_THREE_CARDS,
      layout: 'minimal',
    }
    expect(() => renderValueProp(content)).not.toThrow()
    expect(screen.getByRole('heading', { level: 3, name: 'Rapidez' })).toBeInTheDocument()
  })

  it('falls back to DefaultIcon for unknown icon names', () => {
    const content: ValuePropContent = {
      ...CONTENT_THREE_CARDS,
      items: [
        {
          icon: 'NonExistentIcon',
          title: { es: 'Item fallback', en: 'Fallback item' },
          description: { es: 'Desc', en: 'Desc' },
        },
      ],
    }
    expect(() => renderValueProp(content)).not.toThrow()
    expect(screen.getByRole('heading', { level: 3, name: 'Item fallback' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderValueProp()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
