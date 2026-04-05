'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WIZARD_STEPS, type WizardStep } from '@/types/setup'

interface WizardProgressProps {
  currentStep: WizardStep
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep)

  return (
    <nav aria-label="Wizard progress" className="mb-6">
      <ol className="flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isActive = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <li key={step.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isCompleted && 'bg-success text-white',
                    isActive && 'bg-primary text-primary-foreground ring-primary/30 ring-2',
                    isUpcoming && 'border-muted-foreground/30 text-muted-foreground border-2',
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.number}
                </div>

                {/* Label — hidden on small screens, visible on md+ */}
                <span
                  className={cn(
                    'mt-1.5 text-center text-xs',
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hidden md:block',
                    isActive && 'block',
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1',
                    index < currentIndex ? 'bg-success' : 'bg-muted-foreground/20',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
