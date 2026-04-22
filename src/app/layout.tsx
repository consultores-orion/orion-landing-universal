import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Orion Landing Universal',
  description: 'Open-source landing page template with full CMS admin panel',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
