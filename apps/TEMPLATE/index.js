'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { authAPI, betRoundAPI } from '@/lib/api'
import { log } from '@/utils/logger'

/**
 * [GAME_NAME] Game Component
 * 
 * TODO: Add game description here
 * 
 * @param {boolean} isLauncher - Whether the game is in launcher mode (no header/footer)
 * @param {object} gameInfo - Game information from registry
 */
export default function [GAME_NAME]({ isLauncher = false, gameInfo }) {
    const { t } = useTranslation()
    const router = useRouter()

    // State management
    const [user, setUser] = useState(null)
    const [balance, setBalance] = useState(0)
    const [betAmount, setBetAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Fetch user data on mount
    useEffect(() => {
        fetchUserData()
    }, [])

    /**
     * Fetch user data from API
     */
    const fetchUserData = async () => {
        try {
            const response = await authAPI.me()
            setUser(response.data)
            setBalance(response.data.balance || 0)
        } catch (err) {
            if (err.response?.status === 401) {
                router.push('/auth/login')
            } else {
                log.apiError('/auth/me', err)
            }
        }
    }

    /**
     * Handle bet placement
     */
    const handlePlaceBet = async () => {
        // Validate bet amount
        if (!betAmount || parseFloat(betAmount) <= 0) {
            setError('Please enter a valid bet amount')
            return
        }

        const amount = parseFloat(betAmount)
        if (amount > balance) {
            setError('Insufficient balance')
            return
        }

        if (amount < gameInfo.minBet || amount > gameInfo.maxBet) {
            setError(`Bet must be between ${gameInfo.minBet} and ${gameInfo.maxBet}`)
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            // TODO: Implement your game logic here
            // This is just a template - replace with actual game logic

            const response = await betRoundAPI.placeBetRound({
                roundNumber: 1,
                betAmount: amount,
                percentage: 0 // Replace with actual game result
            })

            setSuccess('Bet placed successfully!')
            setBetAmount('')

            // Update balance
            if (response.data?.balance !== undefined) {
                setBalance(response.data.balance)
            }

            // Refresh user data
            await fetchUserData()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place bet')
            log.apiError('/bet-rounds/place', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background-dark">
            {/* Hero Section - Only show if not in launcher mode */}
            {!isLauncher && (
                <div className="relative">
                    <div
                        className="flex min-h-[240px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-center p-8 md:p-12 text-left m-4 lg:m-8"
                        style={{
                            backgroundImage: `linear-gradient(90deg, rgba(26, 26, 46, 0.85) 0%, rgba(26, 26, 46, 0.3) 100%), url("${gameInfo?.banner || ''}")`
                        }}
                    >
                        <div className="flex flex-col gap-4 max-w-lg">
                            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                                {gameInfo?.name || '[GAME_NAME]'}
                            </h1>
                            <p className="text-white/80 text-lg font-medium">
                                {gameInfo?.description?.en || 'Game description'}
                            </p>
                            <div className="flex gap-3">
                                <button className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-yellow-400 transition-all">
                                    <span className="truncate">Play Now</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Game Area */}
            <div className="max-w-7xl mx-auto p-4 lg:p-8">
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                    {/* Game Display Area */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-surface/50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                            {/* TODO: Add your game display here */}
                            <div className="text-center">
                                <p className="text-white text-2xl font-bold mb-4">Game Display Area</p>
                                <p className="text-text-secondary">Implement your game UI here</p>
                            </div>
                        </div>
                    </div>

                    {/* Betting Panel */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="bg-surface/50 rounded-lg p-4 space-y-4">
                            {/* Balance Display */}
                            <div className="flex items-center justify-between p-3 bg-background-dark/50 rounded-lg">
                                <span className="text-text-secondary text-sm">Balance:</span>
                                <span className="text-white font-bold text-lg">{balance.toFixed(2)} TL</span>
                            </div>

                            {/* Bet Amount Input */}
                            <label className="flex flex-col">
                                <p className="text-text-secondary text-sm font-medium pb-2">Bet Amount</p>
                                <input
                                    className="w-full bg-surface text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10"
                                    placeholder="0.00"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(e.target.value)}
                                    type="number"
                                    min={gameInfo?.minBet || 0}
                                    max={gameInfo?.maxBet || 10000}
                                />
                                <p className="text-text-secondary text-xs mt-1">
                                    Min: {gameInfo?.minBet || 0} TL - Max: {gameInfo?.maxBet || 10000} TL
                                </p>
                            </label>

                            {/* Quick Bet Amounts */}
                            <div className="grid grid-cols-4 gap-2">
                                {[10, 50, 100, 500].map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setBetAmount(amount.toString())}
                                        className="px-3 py-2 bg-surface hover:bg-surface/70 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="rounded-lg bg-teal-500/20 border border-teal-500/50 p-3">
                                    <p className="text-sm text-teal-400">{success}</p>
                                </div>
                            )}

                            {/* Place Bet Button */}
                            <button
                                onClick={handlePlaceBet}
                                disabled={loading || !betAmount || parseFloat(betAmount) <= 0}
                                className="w-full px-6 py-3 bg-primary text-background-dark font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Placing Bet...' : 'Place Bet'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Game Info Section */}
                {!isLauncher && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* How to Play */}
                        <div className="bg-surface/50 rounded-lg p-6">
                            <h3 className="text-white text-xl font-bold mb-4">How to Play</h3>
                            <ul className="space-y-2">
                                {gameInfo?.metadata?.rules?.en?.map((rule, index) => (
                                    <li key={index} className="text-text-secondary flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        <span>{rule}</span>
                                    </li>
                                )) || (
                                        <li className="text-text-secondary">Rules will appear here</li>
                                    )}
                            </ul>
                        </div>

                        {/* Game Features */}
                        <div className="bg-surface/50 rounded-lg p-6">
                            <h3 className="text-white text-xl font-bold mb-4">Features</h3>
                            <ul className="space-y-2">
                                {gameInfo?.metadata?.features?.map((feature, index) => (
                                    <li key={index} className="text-text-secondary flex items-start gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                        <span>{feature}</span>
                                    </li>
                                )) || (
                                        <li className="text-text-secondary">Features will appear here</li>
                                    )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
