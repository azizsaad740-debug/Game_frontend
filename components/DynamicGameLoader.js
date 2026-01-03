'use client'

import { Suspense } from 'react'
import { getGameBySlug } from '@/lib/games-registry'
import { getGameComponent } from '@/lib/game-components-map'

/**
 * Dynamic Game Loader
 * 
 * This component dynamically loads game components from the /apps directory
 * based on the game slug from the registry.
 * 
 * @param {string} gameSlug - The slug of the game to load
 * @param {object} props - Props to pass to the game component
 */

// Loading component
const GameLoading = () => (
    <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
            <p className="text-white text-lg font-semibold">Loading game...</p>
        </div>
    </div>
)

// Error component
const GameError = ({ error, gameSlug }) => (
    <div className="flex items-center justify-center min-h-screen bg-background-dark p-4">
        <div className="max-w-md w-full bg-surface/50 rounded-lg p-8 text-center border border-red-500/30">
            <div className="mb-4">
                <span className="material-symbols-outlined text-red-500 text-6xl">error</span>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Game Not Found</h2>
            <p className="text-text-secondary mb-4">
                The game &quot;{gameSlug}&quot; could not be loaded.
            </p>
            {error && (
                <p className="text-red-400 text-sm mb-4 font-mono bg-black/30 p-3 rounded">
                    {error.message}
                </p>
            )}
            <a
                href="/"
                className="inline-block px-6 py-3 bg-primary text-background-dark font-bold rounded-lg hover:bg-yellow-400 transition-colors"
            >
                Back to Home
            </a>
        </div>
    </div>
)

// Game not active component
const GameInactive = ({ gameName }) => (
    <div className="flex items-center justify-center min-h-screen bg-background-dark p-4">
        <div className="max-w-md w-full bg-surface/50 rounded-lg p-8 text-center border border-yellow-500/30">
            <div className="mb-4">
                <span className="material-symbols-outlined text-yellow-500 text-6xl">construction</span>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Game Under Maintenance</h2>
            <p className="text-text-secondary mb-4">
                {gameName} is currently unavailable. Please check back later.
            </p>
            <a
                href="/"
                className="inline-block px-6 py-3 bg-primary text-background-dark font-bold rounded-lg hover:bg-yellow-400 transition-colors"
            >
                Back to Home
            </a>
        </div>
    </div>
)

export default function DynamicGameLoader({ gameSlug, ...props }) {
    // Get game info from registry
    const gameInfo = getGameBySlug(gameSlug)

    // Game not found in registry
    if (!gameInfo) {
        return <GameError gameSlug={gameSlug} error={{ message: 'Game not registered' }} />
    }

    // Game is not active
    if (!gameInfo.active) {
        return <GameInactive gameName={gameInfo.name} />
    }

    // Get the game component from the map
    const GameComponent = getGameComponent(gameInfo.componentPath)

    if (!GameComponent) {
        return <GameError gameSlug={gameSlug} error={{ message: `Component not found: ${gameInfo.componentPath}` }} />
    }

    // Standard game interface callbacks
    const handleWin = (amount) => {
        console.log(`[Game ${gameSlug}] Win: ${amount}`)
        // TODO: Trigger confetti or global win notification
    }

    const handleLoss = (amount) => {
        console.log(`[Game ${gameSlug}] Loss: ${amount}`)
    }

    const handleBalanceUpdate = (newBalance) => {
        // TODO: Update global user context balance
    }

    return (
        <Suspense fallback={<GameLoading />}>
            <GameComponent
                {...props}
                gameInfo={gameInfo}
                onWin={handleWin}
                onLoss={handleLoss}
                updateBalance={handleBalanceUpdate}
            />
        </Suspense>
    )
}
