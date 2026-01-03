'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { betRoundAPI, authAPI } from '@/lib/api'
import { log } from '@/utils/logger'

/**
 * Crash Game Component
 * 
 * This is a modular game component that can be loaded dynamically
 * from the games registry system.
 */
export default function CrashGame({ isLauncher = false }) {
    const { t } = useTranslation()
    const router = useRouter()
    const [betAmount, setBetAmount] = useState('')
    const [selectedBetAmount, setSelectedBetAmount] = useState('50')
    const [autoCashOut, setAutoCashOut] = useState('1.50x')
    const [user, setUser] = useState(null)
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(false)
    const [placingBet, setPlacingBet] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [recentRounds, setRecentRounds] = useState([])
    const [currentRound, setCurrentRound] = useState(1)
    const [currentMultiplier, setCurrentMultiplier] = useState('1.00x')

    // Fetch user data and recent rounds
    useEffect(() => {
        fetchUserData()
        fetchRecentRounds()
    }, [])

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

    const fetchRecentRounds = async () => {
        try {
            const response = await betRoundAPI.getBetRoundHistory({
                page: 1,
                limit: 12,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            })
            if (response.data?.betRounds) {
                setRecentRounds(response.data.betRounds)
                // Set current round number (last round + 1)
                if (response.data.betRounds.length > 0) {
                    const lastRound = response.data.betRounds[0]
                    setCurrentRound((lastRound.roundNumber || 0) + 1)
                }
            }
        } catch (err) {
            log.apiError('/bet-rounds/history', err)
        }
    }

    const formatMultiplier = (percentage) => {
        if (percentage > 0) {
            return `${(1 + percentage / 100).toFixed(2)}x`
        } else if (percentage < 0) {
            return 'Crashed'
        }
        return '1.00x'
    }

    const getMultiplierColor = (percentage) => {
        if (percentage > 0) {
            if (percentage >= 100) return 'bg-accent-blue/20 text-accent-blue'
            if (percentage >= 50) return 'bg-accent-teal/20 text-accent-teal'
            return 'bg-surface'
        }
        return 'bg-red-500/20 text-red-400'
    }

    const quickBetAmounts = ['10', '50', '100', '500']

    const handleBetAmountChange = (amount) => {
        setSelectedBetAmount(amount)
        setBetAmount(amount)
    }

    const decreaseBet = () => {
        const current = parseFloat(betAmount) || 0
        if (current > 0) {
            setBetAmount((current - 1).toFixed(2))
        }
    }

    const increaseBet = () => {
        const current = parseFloat(betAmount) || 0
        setBetAmount((current + 1).toFixed(2))
    }

    const handlePlaceBet = async () => {
        if (!betAmount || parseFloat(betAmount) <= 0) {
            setError('Please enter a valid bet amount')
            return
        }

        const amount = parseFloat(betAmount)
        if (amount > balance) {
            setError('Insufficient balance')
            return
        }

        setPlacingBet(true)
        setError('')
        setSuccess('')

        try {
            // For demo: Generate a random percentage (-50% to +200%)
            // In production, this would come from the game server
            const randomPercentage = (Math.random() * 250 - 50).toFixed(2)
            const percentage = parseFloat(randomPercentage)

            const response = await betRoundAPI.placeBetRound({
                roundNumber: currentRound,
                betAmount: amount,
                percentage: percentage
            })

            setSuccess(`Bet placed successfully! Result: ${percentage > 0 ? '+' : ''}${percentage}%`)
            setBetAmount('')
            setSelectedBetAmount('50')

            // Update balance
            if (response.data?.balance !== undefined) {
                setBalance(response.data.balance)
            }

            // Refresh user data and recent rounds
            await fetchUserData()
            await fetchRecentRounds()

            // Increment round number for next bet
            setCurrentRound(prev => prev + 1)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place bet')
            log.apiError('/bet-rounds/place', err)
        } finally {
            setPlacingBet(false)
        }
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <main className="flex-grow p-4 lg:p-8">
                {/* Hero Section */}
                {!isLauncher && (
                    <div className="mb-8">
                        <div
                            className="flex min-h-[240px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-center p-8 md:p-12 text-left"
                            style={{
                                backgroundImage: `linear-gradient(90deg, rgba(26, 26, 46, 0.85) 0%, rgba(26, 26, 46, 0.3) 100%), url("https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`
                            }}
                        >
                            <div className="flex flex-col gap-4 max-w-lg">
                                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">{t('crash.title')}</h1>
                                <p className="text-white/80 text-lg font-medium">{t('crash.subtitle')}</p>
                                <div className="flex gap-3">
                                    <button className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-yellow-400 transition-all">
                                        <span className="truncate">{t('crash.playNow')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                    <aside className="col-span-12 lg:col-span-2 order-2 lg:order-1">
                        <div className="bg-surface/50 rounded-lg p-3 h-full">
                            <h3 className="text-text-secondary font-semibold text-sm px-1 mb-3">Recent Results</h3>
                            <div className="flex flex-row lg:flex-col gap-2 flex-wrap">
                                {recentRounds.length > 0 ? (
                                    recentRounds.slice(0, 12).map((round, index) => (
                                        <div key={round.id || index} className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-3 text-sm font-medium ${getMultiplierColor(round.percentage)}`}>
                                            {formatMultiplier(round.percentage)}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-text-secondary text-xs">No recent rounds</p>
                                )}
                            </div>
                        </div>
                    </aside>

                    <div className="col-span-12 lg:col-span-7 order-1 lg:order-2">
                        <div className="relative w-full aspect-[16/10] bg-surface/30 rounded-lg overflow-hidden flex items-center justify-center p-8 shadow-inner">
                            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                            <div className="z-10 text-center">
                                <p className="text-sm font-medium text-primary">Game in Progress</p>
                                <p className="text-6xl sm:text-7xl font-bold tracking-tighter my-2 text-accent-teal">4.51x</p>
                                <p className="text-text-secondary text-sm">Waiting for next round...</p>
                            </div>
                            <div className="absolute bottom-0 left-0 h-3/4 w-full bg-gradient-to-t from-accent-teal/20 to-transparent"></div>
                        </div>
                    </div>

                    <aside className="col-span-12 lg:col-span-3 order-3 lg:order-3">
                        <div className="bg-surface/50 rounded-lg p-4 space-y-4 h-full">
                            <label className="flex flex-col">
                                <p className="text-text-secondary text-sm font-medium pb-2">{t('crash.betAmount')}</p>
                                <div className="flex w-full items-stretch rounded-lg">
                                    <input
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-surface h-14 placeholder:text-text-secondary p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                                        placeholder="0.00"
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(e.target.value)}
                                        type="text"
                                    />
                                    <div className="flex items-center bg-surface rounded-r-lg px-2">
                                        <button onClick={decreaseBet} className="text-text-secondary hover:text-white transition-colors p-1">
                                            <span className="material-symbols-outlined text-lg">remove</span>
                                        </button>
                                        <button onClick={increaseBet} className="text-text-secondary hover:text-white transition-colors p-1">
                                            <span className="material-symbols-outlined text-lg">add</span>
                                        </button>
                                    </div>
                                </div>
                            </label>

                            <div className="flex h-10 w-full items-center justify-center rounded-lg bg-surface p-1">
                                {quickBetAmounts.map((amount) => (
                                    <label key={amount} className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 has-[:checked]:bg-background-dark has-[:checked]:shadow-sm has-[:checked]:text-white text-text-secondary text-sm font-medium transition-colors">
                                        <span className="truncate">{amount} TL</span>
                                        <input
                                            className="invisible w-0"
                                            name="bet-amount"
                                            type="radio"
                                            value={amount}
                                            checked={selectedBetAmount === amount}
                                            onChange={() => handleBetAmountChange(amount)}
                                        />
                                    </label>
                                ))}
                            </div>

                            <label className="flex flex-col">
                                <p className="text-text-secondary text-sm font-medium pb-2">{t('crash.autoCashout')}</p>
                                <div className="flex w-full items-stretch rounded-lg">
                                    <input
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-surface h-14 placeholder:text-text-secondary p-4 text-base font-normal leading-normal"
                                        placeholder="1.50x"
                                        value={autoCashOut}
                                        onChange={(e) => setAutoCashOut(e.target.value)}
                                        type="text"
                                    />
                                </div>
                            </label>

                            {error && (
                                <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="rounded-lg bg-teal-500/20 border border-teal-500/50 p-3">
                                    <p className="text-sm text-teal-400">{success}</p>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">Balance:</span>
                                <span className="text-white font-bold">{balance.toFixed(2)} TL</span>
                            </div>
                            <button
                                onClick={handlePlaceBet}
                                disabled={placingBet || !betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > balance}
                                className="w-full flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-primary text-background-dark text-base font-bold leading-normal tracking-wide hover:bg-yellow-400 transition-colors shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="truncate">
                                    {placingBet ? 'Placing Bet...' : t('crash.placeBet')}
                                </span>
                            </button>
                        </div>
                    </aside>

                    <div className="col-span-12 order-4 mt-4">
                        <div className="bg-surface/50 rounded-lg p-4">
                            <h3 className="text-text-secondary font-semibold text-lg mb-4">{t('crash.recentBets')}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs text-text-secondary uppercase border-b border-surface">
                                        <tr>
                                            <th className="px-6 py-3" scope="col">{t('crash.player')}</th>
                                            <th className="px-6 py-3" scope="col">{t('crash.bet')}</th>
                                            <th className="px-6 py-3" scope="col">{t('crash.multiplier')}</th>
                                            <th className="px-6 py-3 text-right" scope="col">{t('crash.profit')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentRounds.length > 0 ? (
                                            recentRounds.slice(0, 10).map((round, index) => {
                                                const isCrashed = round.percentage < 0
                                                const profit = round.amountChange
                                                const profitColor = profit >= 0 ? 'text-accent-teal' : 'text-red-400'
                                                const profitText = profit >= 0 ? `+${profit.toFixed(2)} TL` : `${profit.toFixed(2)} TL`

                                                return (
                                                    <tr key={round.id || index} className={index < recentRounds.length - 1 ? "border-b border-surface/50" : ""}>
                                                        <th className="px-6 py-4 font-medium text-white whitespace-nowrap" scope="row">
                                                            {user?.username || 'You'}
                                                        </th>
                                                        <td className="px-6 py-4">{round.betAmount.toFixed(2)} TL</td>
                                                        <td className={`px-6 py-4 ${isCrashed ? 'text-red-400' : ''}`}>
                                                            {isCrashed ? t('crash.crashed') : formatMultiplier(round.percentage)}
                                                        </td>
                                                        <td className={`px-6 py-4 text-right ${profitColor}`}>{profitText}</td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                                                    No betting history yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
