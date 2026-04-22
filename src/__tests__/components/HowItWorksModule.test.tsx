import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import type { ModuleStyles } from '@/lib/modules/types'
import type { HowItWorksContent } from '@/components/modules/how-it-works/how-it-works.types'

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
import HowItWorksModule from '@/components/modules/how-it-works/HowItWorksModule'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const DEFAULT_STYLES: ModuleStyles = {}

const THREE_STEPS: HowItWorksContent = {
  title: { es: 'Cómo funciona', en: 'How it works' },
  subtitle: { es: 'En tres simples pasos', en: 'In three simple steps' },
  layout: 'horizontal',
  steps: [
    {
      number: 1,
      title: { es: 'Regístrate', en: 'Sign up' },
      description: { es: 'Crea tu cuenta en segundos', en: 'Create your account in seconds' },
    },
    {
      number: 2,
      title: { es: 'Configura', en: 'Configure' },
      description: { es: 'Ajusta la plataforma a tu gusto', en: 'Customize the platform' },
    },
    {
      number: 3,
      title: { es: 'Lanza', en: 'Launch' },
      description: {
        es: 'Publica y comparte con el mundo',
        en: 'Publish and share with the world',
      },
    },
  ],
}

const MINIMAL_CONTENT: HowItWorksContent = {
  title: { es: 'Proceso', en: 'Process' },
  steps: [],
}

function renderHowItWorks(
  content: HowItWorksContent = THREE_STEPS,
  styles: ModuleStyles = DEFAULT_STYLES,
) {
  return render(
    <HowItWorksModule
      content={content}
      styles={styles}
      moduleId="hiw-1"
      isEditing={false}
      language="es"
      defaultLanguage="es"
    />,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('HowItWorksModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing with minimal props', () => {
    expect(() => renderHowItWorks(MINIMAL_CONTENT)).not.toThrow()
  })

  it('renders the section with the correct module id', () => {
    const { container } = renderHowItWorks()
    expect(container.querySelector('section#hiw-1')).toBeInTheDocument()
  })

  it('displays the section title', () => {
    renderHowItWorks()
    expect(screen.getByRole('heading', { level: 2, name: 'Cómo funciona' })).toBeInTheDocument()
  })

  it('displays the subtitle when provided', () => {
    renderHowItWorks()
    expect(screen.getByText('En tres simples pasos')).toBeInTheDocument()
  })

  it('renders all step titles as headings', () => {
    renderHowItWorks()
    expect(screen.getByRole('heading', { level: 3, name: 'Regístrate' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Configura' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Lanza' })).toBeInTheDocument()
  })

  it('renders all step descriptions', () => {
    renderHowItWorks()
    expect(screen.getByText('Crea tu cuenta en segundos')).toBeInTheDocument()
    expect(screen.getByText('Ajusta la plataforma a tu gusto')).toBeInTheDocument()
    expect(screen.getByText('Publica y comparte con el mundo')).toBeInTheDocument()
  })

  it('renders step numbers in the circles', () => {
    const { container } = renderHowItWorks()
    // Step numbers are rendered as <span>{number}</span> inside the circle divs
    const stepNumbers = container.querySelectorAll('[class*="rounded-full"] span')
    const stepNumberTexts = Array.from(stepNumbers).map((el) => el.textContent)
    expect(stepNumberTexts).toContain('1')
    expect(stepNumberTexts).toContain('2')
    expect(stepNumberTexts).toContain('3')
  })

  it('renders with empty steps gracefully', () => {
    renderHowItWorks(MINIMAL_CONTENT)
    expect(screen.getByRole('heading', { level: 2, name: 'Proceso' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('renders vertical layout without errors', () => {
    const content: HowItWorksContent = { ...THREE_STEPS, layout: 'vertical' }
    expect(() => renderHowItWorks(content)).not.toThrow()
    expect(screen.getByRole('heading', { level: 3, name: 'Regístrate' })).toBeInTheDocument()
  })

  it('renders alternating layout without errors', () => {
    const content: HowItWorksContent = { ...THREE_STEPS, layout: 'alternating' }
    expect(() => renderHowItWorks(content)).not.toThrow()
    expect(screen.getByRole('heading', { level: 3, name: 'Regístrate' })).toBeInTheDocument()
  })

  it('renders steps with icons instead of numbers', () => {
    const content: HowItWorksContent = {
      ...THREE_STEPS,
      steps: [
        {
          number: 1,
          title: { es: 'Paso con ícono', en: 'Step with icon' },
          description: { es: 'Descripción', en: 'Description' },
          icon: 'UserPlus',
        },
      ],
    }
    expect(() => renderHowItWorks(content)).not.toThrow()
    expect(screen.getByRole('heading', { level: 3, name: 'Paso con ícono' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderHowItWorks()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
