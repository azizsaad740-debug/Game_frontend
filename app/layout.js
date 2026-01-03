import './globals.css'
import { Providers } from '@/components/Providers'
import ErrorBoundary from '@/components/ErrorBoundary'
import AuthInitializer from "@/components/AuthInitializer" // 🔥 auto-loads session from cookies
import { Suspense } from "react"

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'),
  title: 'Garbet - Online Casino & Sports Betting',
  description: 'Online Casino & Sports Betting Platform',
  keywords: 'casino, sports betting, online gambling, slots, live casino',
  authors: [{ name: 'Garbet' }],
  openGraph: {
    title: 'Garbet - Online Casino & Sports Betting',
    description: 'Online Casino & Sports Betting Platform',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#151328',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap"
          rel="stylesheet"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>

      <body className="bg-background-light dark:bg-background-dark font-display text-primary-text">
        <ErrorBoundary>
          <Providers>
            {/* 🔥 Restore user session from httpOnly cookies */}
            <Suspense fallback={null}>
              <AuthInitializer />
            </Suspense>

            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
