import { Suspense } from 'react'
import { ModuleErrorBoundary } from '@/components/shared/ModuleErrorBoundary'
import { getModuleDefinition } from './registry'
import type { PageModule } from './types'

interface ModuleRendererProps {
  modules: PageModule[]
  language: string
  defaultLanguage: string
  isEditing?: boolean
  onContentChange?: (moduleId: string, path: string, value: unknown) => void
  onStyleChange?: (moduleId: string, path: string, value: unknown) => void
}

function ModuleSkeleton() {
  return <div className="bg-surface/30 min-h-[200px] animate-pulse" />
}

export function ModuleRenderer({
  modules,
  language,
  defaultLanguage,
  isEditing = false,
  onContentChange,
  onStyleChange,
}: ModuleRendererProps) {
  const visibleModules = modules
    .filter((m) => m.is_visible)
    .sort((a, b) => a.display_order - b.display_order)

  return (
    <>
      {visibleModules.map((module) => {
        const definition = getModuleDefinition(module.section_key)

        if (!definition) {
          console.warn(`[ModuleRenderer] Module not found in registry: "${module.section_key}"`)
          return null
        }

        const Component = definition.component

        const styles = (module.styles as Record<string, unknown>) ?? {}
        const content = (module.content as Record<string, unknown>) ?? {}

        return (
          <ModuleErrorBoundary key={module.id} moduleKey={module.section_key}>
            <Suspense fallback={<ModuleSkeleton />}>
              <Component
                content={content}
                styles={styles}
                moduleId={module.id}
                isEditing={isEditing}
                language={language}
                defaultLanguage={defaultLanguage}
                onContentChange={
                  onContentChange
                    ? (path, value) => onContentChange(module.id, path, value)
                    : undefined
                }
                onStyleChange={
                  onStyleChange ? (path, value) => onStyleChange(module.id, path, value) : undefined
                }
              />
            </Suspense>
          </ModuleErrorBoundary>
        )
      })}
    </>
  )
}
