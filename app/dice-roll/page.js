'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import DynamicGameLoader from '@/components/DynamicGameLoader'

/**
 * Dice Roll Page
 * This page now uses the dynamic game loader system to load the PvP version
 * The actual game logic is in /apps/dice-roll-pvp/index.js
 */

function DiceRollContent() {
  const searchParams = useSearchParams()
  const isLauncher = searchParams.get('launcher') === 'true'

  return (
    <DynamicGameLoader
      gameSlug="dice-roll-pvp"
      isLauncher={isLauncher}
    />
  )
}

export default function DiceRollPageWrapper() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-background-dark">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
            <p className="text-white text-lg font-semibold">Loading Dice Roll...</p>
          </div>
        </div>
      }>
        <DiceRollContent />
      </Suspense>
    </ProtectedRoute>
  )
}
