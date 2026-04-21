import type { Metadata, Viewport } from 'next'
import { Oswald, Barlow } from 'next/font/google'
import './globals.css'

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  variable: '--font-barlow',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Krav Magá — Plataforma de Gestão',
  description: 'Gestão completa para academias de Krav Magá',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Krav Magá',
  },
}

export const viewport: Viewport = {
  themeColor: '#0B0B0C',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} ${barlow.variable}`}>
      <body className="bg-steel-900 text-white font-body antialiased">
        {children}
      </body>
    </html>
  )
}
