'use client'

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface WizardStepProps {
  title: string
  description?: string
  children: React.ReactNode
  status?: 'idle' | 'loading' | 'success' | 'error'
  errorMessage?: string
}

export function WizardStep({
  title,
  description,
  children,
  status = 'idle',
  errorMessage,
}: WizardStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-2xl font-bold">{title}</h1>
          {status === 'loading' && <Loader2 className="text-primary h-5 w-5 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="text-success h-5 w-5" />}
        </div>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </CardHeader>

      <CardContent>
        {children}

        {status === 'error' && errorMessage && (
          <div
            className={cn(
              'border-error/30 bg-error/10 text-error mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm',
            )}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
