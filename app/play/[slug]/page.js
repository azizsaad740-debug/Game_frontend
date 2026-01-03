'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import DynamicGameLoader from '@/components/DynamicGameLoader'

/**
 * Dynamic Game Page Content
 * This component handles the game loading with search params
 */
function GamePageContent({ params }) {
    const searchParams = useSearchParams()
    const isLauncher = searchParams.get('launcher') === 'true'
    const gameSlug = params.slug

    return (
        <DynamicGameLoader
            gameSlug={gameSlug}
            isLauncher={isLauncher}
        />
    )
}

/**
 * Dynamic Game Page
 * This page dynamically loads any game from the apps folder
 * based on the slug parameter
 */
export default function GamePage({ params }) {
    return (
        <ProtectedRoute>
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-background-dark">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
                        <p className="text-white text-lg font-semibold">Loading...</p>
                    </div>
                </div>
            }>
                <GamePageContent params={params} />
            </Suspense>
        </ProtectedRoute>
    )
}
