'use client'

import Script from 'next/script'

interface CalendlyWidgetProps {
  url: string
}

/**
 * Loads the Calendly external widget script.
 * The actual popup is triggered by adding `data-url` attributes to Calendly links,
 * or by calling `Calendly.initPopupWidget({ url })` in JavaScript.
 * This component only loads the script — the module component handles the button UI.
 */
export function CalendlyWidget({ url }: CalendlyWidgetProps) {
  if (!url) return null

  return (
    <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
  )
}
