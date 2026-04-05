interface CustomScriptsProps {
  headScripts?: string
  bodyScripts?: string
}

/**
 * HeadScripts — render inside <head> via layout.
 * Uses dangerouslySetInnerHTML to inject raw script content.
 */
export function HeadScripts({ headScripts }: Pick<CustomScriptsProps, 'headScripts'>) {
  if (!headScripts || headScripts.trim() === '') return null

  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional for admin-controlled custom scripts
    <div
      id="custom-head-scripts"
      style={{ display: 'none' }}
      dangerouslySetInnerHTML={{ __html: headScripts }}
    />
  )
}

/**
 * BodyScripts — render at top of <body> via layout.
 * Uses dangerouslySetInnerHTML to inject raw script content.
 */
export function BodyScripts({ bodyScripts }: Pick<CustomScriptsProps, 'bodyScripts'>) {
  if (!bodyScripts || bodyScripts.trim() === '') return null

  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional for admin-controlled custom scripts
    <div
      id="custom-body-scripts"
      style={{ display: 'none' }}
      dangerouslySetInnerHTML={{ __html: bodyScripts }}
    />
  )
}

/**
 * CustomScripts — convenience wrapper that renders both head and body scripts.
 * Split into HeadScripts / BodyScripts for placement flexibility.
 */
export function CustomScripts({ headScripts, bodyScripts }: CustomScriptsProps) {
  const hasHead = headScripts && headScripts.trim() !== ''
  const hasBody = bodyScripts && bodyScripts.trim() !== ''

  if (!hasHead && !hasBody) return null

  return (
    <>
      {hasHead && <HeadScripts headScripts={headScripts} />}
      {hasBody && <BodyScripts bodyScripts={bodyScripts} />}
    </>
  )
}
