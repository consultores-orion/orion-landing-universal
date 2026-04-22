import '@testing-library/jest-dom'
import { configureAxe, toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'

// Register jest-axe matchers with Vitest's expect
expect.extend(toHaveNoViolations)

// Configure axe with sane defaults for jsdom environment.
// The color-contrast rule fires on elements that lack real CSS in jsdom,
// so we disable it globally to avoid false positives in unit tests.
configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
})
