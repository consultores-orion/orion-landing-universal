'use client'

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WizardStep } from '@/types/setup'

interface WizardNavigationProps {
  currentStep: WizardStep
  onNext?: () => void
  onPrev?: () => void
  nextLabel?: string
  isLoading?: boolean
  isNextDisabled?: boolean
  showPrev?: boolean
}

export function WizardNavigation({
  currentStep,
  onNext,
  onPrev,
  nextLabel,
  isLoading = false,
  isNextDisabled = false,
  showPrev,
}: WizardNavigationProps) {
  const showPrevButton = showPrev ?? currentStep !== 'connect'

  return (
    <div className="mt-6 flex items-center justify-between">
      {showPrevButton ? (
        <Button variant="secondary" size="lg" onClick={onPrev}>
          <ChevronLeft data-icon="inline-start" className="h-4 w-4" />
          Anterior
        </Button>
      ) : (
        <div />
      )}

      <Button size="lg" onClick={onNext} disabled={isLoading || isNextDisabled}>
        {isLoading ? (
          <>
            <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" />
            {nextLabel ?? 'Siguiente'}
          </>
        ) : (
          <>
            {nextLabel ?? 'Siguiente'}
            <ChevronRight data-icon="inline-end" className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}
