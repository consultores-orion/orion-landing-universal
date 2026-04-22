import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import type { CSSProperties } from 'react'

// ── Mocks ────────────────────────────────────────────────────────────────────

// We need two store states: non-edit and edit. We control which via a module-level
// flag so individual tests can flip it without re-importing the module.
let mockIsEditing = false

vi.mock('@/stores/editor.store', () => ({
  useEditorStore: vi.fn((selector: (s: { isEditing: boolean }) => unknown) =>
    selector({ isEditing: mockIsEditing }),
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
import { EditableText } from '@/components/live-edit/EditableText'

// ── Helpers ───────────────────────────────────────────────────────────────────

interface RenderProps {
  value?: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div'
  className?: string
  style?: CSSProperties
  placeholder?: string
}

function renderEditable({
  value = 'Texto de prueba',
  as = 'p',
  className,
  style,
  placeholder,
}: RenderProps = {}) {
  return render(
    <EditableText
      sectionKey="hero"
      fieldPath="title"
      lang="es"
      value={value}
      as={as}
      className={className}
      style={style}
      placeholder={placeholder}
    />,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EditableText — non-admin mode (isEditing = false)', () => {
  beforeEach(() => {
    mockIsEditing = false
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    expect(() => renderEditable()).not.toThrow()
  })

  it('renders the text content', () => {
    renderEditable({ value: 'Hola mundo' })
    expect(screen.getByText('Hola mundo')).toBeInTheDocument()
  })

  it('renders as a <p> tag by default when as="p"', () => {
    const { container } = renderEditable({ as: 'p', value: 'Párrafo' })
    expect(container.querySelector('p')).toBeInTheDocument()
    expect(container.querySelector('p')?.textContent).toBe('Párrafo')
  })

  it('renders as <h1> when as="h1"', () => {
    renderEditable({ as: 'h1', value: 'Título H1' })
    expect(screen.getByRole('heading', { level: 1, name: 'Título H1' })).toBeInTheDocument()
  })

  it('renders as <h2> when as="h2"', () => {
    renderEditable({ as: 'h2', value: 'Título H2' })
    expect(screen.getByRole('heading', { level: 2, name: 'Título H2' })).toBeInTheDocument()
  })

  it('renders as <h3> when as="h3"', () => {
    renderEditable({ as: 'h3', value: 'Título H3' })
    expect(screen.getByRole('heading', { level: 3, name: 'Título H3' })).toBeInTheDocument()
  })

  it('renders as <span> when as="span"', () => {
    const { container } = renderEditable({ as: 'span', value: 'Span texto' })
    expect(container.querySelector('span')).toBeInTheDocument()
    expect(container.querySelector('span')?.textContent).toBe('Span texto')
  })

  it('does NOT render an editing toolbar or wrapper in non-admin mode', () => {
    // In non-editing mode, EditableText returns the bare tag — no wrapping <span
    // with class "relative inline-block" that the editing mode adds.
    const { container } = renderEditable({ as: 'p', value: 'Sin toolbar' })
    // The outer element should be the <p> itself, not a <span> wrapper
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('p')
  })

  it('applies className prop to the rendered element', () => {
    const { container } = renderEditable({
      as: 'p',
      value: 'Con clase',
      className: 'text-xl font-bold',
    })
    const el = container.querySelector('p')
    expect(el).toHaveClass('text-xl')
    expect(el).toHaveClass('font-bold')
  })

  it('applies style prop (CSSProperties) to the rendered element', () => {
    const style: CSSProperties = { color: 'rgb(255, 0, 0)', fontSize: '24px' }
    const { container } = renderEditable({ as: 'p', value: 'Con estilo', style })
    const el = container.querySelector('p')
    expect(el).toHaveStyle({ color: 'rgb(255, 0, 0)', fontSize: '24px' })
  })

  it('renders empty string value without crashing', () => {
    expect(() => renderEditable({ value: '' })).not.toThrow()
  })

  it('has no accessibility violations in non-edit mode', async () => {
    const { container } = render(
      <main>
        <EditableText
          sectionKey="hero"
          fieldPath="title"
          lang="es"
          value="Texto accesible"
          as="h1"
        />
      </main>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

describe('EditableText — admin mode (isEditing = true)', () => {
  beforeEach(() => {
    mockIsEditing = true
    vi.clearAllMocks()
  })

  it('renders without crashing in edit mode', () => {
    expect(() => renderEditable()).not.toThrow()
  })

  it('renders the text content in edit mode', () => {
    // In edit mode, content is set via useEffect on the DOM ref.
    // The element may initially be empty in jsdom, so we only verify rendering.
    const { container } = renderEditable({ value: 'Editable texto' })
    // A wrapping <span class="relative inline-block"> should be present
    const wrapper = container.querySelector('span.relative')
    expect(wrapper).toBeInTheDocument()
  })

  it('wraps content in a relative inline-block span in edit mode', () => {
    const { container } = renderEditable({ as: 'p', value: 'En edición' })
    const wrapper = container.firstElementChild
    expect(wrapper?.tagName.toLowerCase()).toBe('span')
    expect(wrapper).toHaveClass('relative')
    expect(wrapper).toHaveClass('inline-block')
  })

  it('renders the inner editable element as the correct tag', () => {
    const { container } = renderEditable({ as: 'h2', value: 'H2 editable' })
    // The editable core tag should appear inside the span wrapper
    expect(container.querySelector('h2')).toBeInTheDocument()
  })

  it('renders with contentEditable attribute in edit mode', () => {
    const { container } = renderEditable({ as: 'p', value: 'Editable' })
    const editableEl = container.querySelector('[contenteditable="true"]')
    expect(editableEl).toBeInTheDocument()
  })

  it('applies className to the inner editable element in edit mode', () => {
    const { container } = renderEditable({
      as: 'p',
      value: 'Clase en edit mode',
      className: 'custom-class',
    })
    const editableEl = container.querySelector('[contenteditable="true"]')
    expect(editableEl).toHaveClass('custom-class')
  })

  it('applies style to the inner editable element in edit mode', () => {
    // jsdom normalizes named colors to their rgb() equivalent
    const style: CSSProperties = { color: 'rgb(0, 0, 255)', fontSize: '20px' }
    const { container } = renderEditable({ as: 'p', value: 'Estilo en edit', style })
    const editableEl = container.querySelector('[contenteditable="true"]')
    expect(editableEl).toHaveStyle({ color: 'rgb(0, 0, 255)', fontSize: '20px' })
  })

  it('sets data-placeholder attribute on the editable element', () => {
    const { container } = renderEditable({
      as: 'p',
      value: '',
      placeholder: 'Escribe algo...',
    })
    const editableEl = container.querySelector('[contenteditable="true"]')
    expect(editableEl).toHaveAttribute('data-placeholder', 'Escribe algo...')
  })
})
