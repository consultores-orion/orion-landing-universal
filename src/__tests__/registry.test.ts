import { describe, it, expect, vi } from 'vitest'

// next/dynamic is a Next.js-only API — stub it before importing the registry
// so Vitest can load the module without a Next.js runtime.
vi.mock('next/dynamic', () => ({
  default: (_loader: unknown, _opts: unknown) => {
    // Return a minimal stub component; the registry only stores the reference.
    const Stub = () => null
    return Stub
  },
}))

// Import after mocking
const { getModuleDefinition, getAllModules, getModulesByCategory, registerModule } =
  await import('@/lib/modules/registry')

describe('getModuleDefinition', () => {
  it('returns the correct entry for a known module key', () => {
    const hero = getModuleDefinition('hero')
    expect(hero).toBeDefined()
    expect(hero?.key).toBe('hero')
    expect(hero?.displayName).toBe('Hero')
    expect(hero?.category).toBe('header')
  })

  it('returns undefined for an unknown module key', () => {
    expect(getModuleDefinition('does_not_exist')).toBeUndefined()
  })

  it('returns the footer module with isSystem set to true', () => {
    const footer = getModuleDefinition('footer')
    expect(footer).toBeDefined()
    expect(footer?.isSystem).toBe(true)
  })

  it('returns a module with a numeric defaultOrder', () => {
    const pricing = getModuleDefinition('pricing')
    expect(typeof pricing?.defaultOrder).toBe('number')
    expect(pricing?.defaultOrder).toBe(11)
  })
})

describe('getAllModules', () => {
  it('returns a non-empty array', () => {
    const modules = getAllModules()
    expect(Array.isArray(modules)).toBe(true)
    expect(modules.length).toBeGreaterThan(0)
  })

  it('contains all 19 registered modules', () => {
    const modules = getAllModules()
    expect(modules.length).toBe(19)
  })

  it('every entry has the required fields', () => {
    for (const m of getAllModules()) {
      expect(m).toHaveProperty('key')
      expect(m).toHaveProperty('displayName')
      expect(m).toHaveProperty('description')
      expect(m).toHaveProperty('component')
      expect(m).toHaveProperty('category')
      expect(typeof m.defaultOrder).toBe('number')
    }
  })
})

describe('getModulesByCategory', () => {
  it('filters modules by category correctly', () => {
    const conversion = getModulesByCategory('conversion')
    expect(conversion.length).toBeGreaterThan(0)
    for (const m of conversion) {
      expect(m.category).toBe('conversion')
    }
  })

  it('returns an empty array for a category with no modules', () => {
    expect(getModulesByCategory('nonexistent_category')).toHaveLength(0)
  })
})

describe('registerModule', () => {
  it('adds a new module that can be retrieved by getModuleDefinition', () => {
    registerModule({
      key: 'custom_test',
      displayName: 'Custom Test',
      description: 'Test module',
      component: (() => null) as never,
      category: 'content',
      isSystem: false,
      defaultOrder: 99,
    })
    const found = getModuleDefinition('custom_test')
    expect(found).toBeDefined()
    expect(found?.displayName).toBe('Custom Test')
  })
})
