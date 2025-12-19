import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '../components/providers'
import { Navigation } from '../components/navigation'
import { PageTransition } from '../components/page-transition'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tubertify - AI-Powered YouTube Learning Platform',
  description: 'Transform YouTube videos into structured courses with AI-powered summaries, tests, and certificates.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <PageTransition>
            {children}
          </PageTransition>
        </Providers>
      </body>
    </html>
  )
}