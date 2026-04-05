import Script from 'next/script'

// Extend Window for GTM globals
declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

interface GTMProps {
  containerId: string
}

export function GoogleTagManager({ containerId }: GTMProps) {
  if (!containerId) return null

  return (
    <Script id="gtm-init" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${containerId}');
      `}
    </Script>
  )
}

/**
 * GTMNoScript — must be placed at the top of <body>.
 * Use this in the landing layout's body via dangerouslySetInnerHTML is NOT used here;
 * we use a regular noscript element rendered by React.
 */
export function GTMNoScript({ containerId }: GTMProps) {
  if (!containerId) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  )
}
