import type { CSSProperties, ReactNode } from 'react'
import type { ModuleStyles } from '@/lib/modules/types'
import { cn } from '@/lib/utils'

interface ModuleWrapperProps {
  children: ReactNode
  moduleId: string
  sectionKey: string
  styles?: ModuleStyles
  className?: string
}

const PADDING_Y_MAP = {
  none: 'py-0',
  small: 'py-8',
  medium: 'py-16',
  large: 'py-24',
  xlarge: 'py-32',
} as const

const PADDING_X_MAP = {
  none: 'px-0',
  small: 'px-4',
  medium: 'px-6',
  large: 'px-8',
} as const

const MAX_WIDTH_MAP = {
  narrow: 'max-w-2xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-full',
} as const

export function ModuleWrapper({
  children,
  moduleId,
  sectionKey,
  styles = {},
  className,
}: ModuleWrapperProps) {
  const paddingY = PADDING_Y_MAP[styles.paddingY ?? 'medium']
  const paddingX = PADDING_X_MAP[styles.paddingX ?? 'medium']
  const maxWidth = MAX_WIDTH_MAP[styles.maxWidth ?? 'default']

  const inlineStyles: CSSProperties = {}
  if (styles.backgroundColor) inlineStyles.backgroundColor = styles.backgroundColor
  if (styles.textColor) inlineStyles.color = styles.textColor
  if (styles.backgroundImage) {
    inlineStyles.backgroundImage = `url(${styles.backgroundImage})`
    inlineStyles.backgroundSize = 'cover'
    inlineStyles.backgroundPosition = 'center'
  }

  return (
    <section
      id={moduleId}
      data-module={sectionKey}
      style={inlineStyles}
      className={cn('relative w-full', className)}
    >
      {styles.backgroundImage && styles.backgroundOverlayOpacity !== undefined && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0,0,0,${styles.backgroundOverlayOpacity})`,
          }}
        />
      )}
      <div className={cn('relative mx-auto', paddingY, paddingX, maxWidth)}>{children}</div>
    </section>
  )
}
