'use client'

interface TranslationStatusProps {
  progress: number
  label?: string
}

export function TranslationStatus({ progress, label }: TranslationStatusProps) {
  const clamped = Math.min(Math.max(progress, 0), 100)

  return (
    <div className="flex items-center gap-2">
      <div className="bg-secondary h-2 flex-1 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-muted-foreground min-w-[3rem] text-right text-xs">
        {label ?? `${clamped}%`}
      </span>
    </div>
  )
}
