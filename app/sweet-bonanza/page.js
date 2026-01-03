'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import DynamicGameLoader from '@/components/DynamicGameLoader'

/**
 * Sweet Bonanza Page
 * This page now uses the dynamic game loader system
 * The actual game logic is in /apps/sweet-bonanza/index.js
 */

function SweetBonanzaContent() {
  const searchParams = useSearchParams()
  const isLauncher = searchParams.get('launcher') === 'true'

  return (
    <DynamicGameLoader
      gameSlug="sweet-bonanza"
      isLauncher={isLauncher}
    />
  )
}

export default function SweetBonanzaPageWrapper() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-background-dark">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
            <p className="text-white text-lg font-semibold">Loading Sweet Bonanza...</p>
          </div>
        </div>
      }>
        <SweetBonanzaContent />
      </Suspense>
    </ProtectedRoute>
  )
}
