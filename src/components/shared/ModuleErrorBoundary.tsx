'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  moduleKey?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class ModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ModuleErrorBoundary] Module "${this.props.moduleKey}" crashed:`, error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section
          className="bg-surface/50 flex min-h-[200px] items-center justify-center px-4 py-16"
          data-module-error={this.props.moduleKey}
        >
          <div className="text-center">
            <p className="text-text-secondary text-sm">
              Este módulo no está disponible temporalmente.
            </p>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}
