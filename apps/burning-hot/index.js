'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI, betRoundAPI } from '@/lib/api'
import { log } from '@/utils/logger'
// Game Symbols Configuration
const SYMBOLS = [
    { id: 'cherry', icon: '🍒', value: 2 },
    { id: 'lemon', icon: '🍋', value: 2 },
    { id: 'orange', icon: '🍊', value: 3 },
    { id: 'plum', icon: '🫐', value: 3 },
    { id: 'grapes', icon: '🍇', value: 5 },
    { id: 'melon', icon: '🍉', value: 5 },
    { id: 'bell', icon: '🔔', value: 10 },
    { id: 'seven', icon: '7️⃣', value: 50 },
    { id: 'clover', icon: '🍀', value: 100 } // Wild/Jackpot
]

const ROWS = 3
const COLS = 5
const SPIN_DURATION = 2000

export default function BurningHot({ isLauncher = false, gameInfo }) {
    const router = useRouter()

    // State
    const [balance, setBalance] = useState(0)
    const [betAmount, setBetAmount] = useState('10')
    const [isSpinning, setIsSpinning] = useState(false)
    const [reels, setReels] = useState(
        Array(COLS).fill(Array(ROWS).fill(SYMBOLS[0]))
    )
    const [winAmount, setWinAmount] = useState(0)
    const [message, setMessage] = useState('')

    // Auto-fetch user data
    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            const res = await authAPI.me()
            setBalance(res.data.balance || 0)
        } catch (e) {
            console.error("Auth error", e)
        }
    }

    // Helper to get random symbol
    const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]

    // Initial Reel Setup
    useEffect(() => {
        const initialReels = Array(COLS).fill(0).map(() =>
            Array(ROWS).fill(0).map(() => getRandomSymbol())
        )
        setReels(initialReels)
    }, [])

    const handleSpin = async () => {
        if (isSpinning) return

        const amount = parseFloat(betAmount)
        if (isNaN(amount) || amount <= 0) {
            setMessage('Invalid bet amount')
            return
        }
        if (amount > balance) {
            setMessage('Insufficient balance')
            return
        }

        setIsSpinning(true)
        setMessage('')
        setWinAmount(0)

        // Deduct balance manually for UI responsiveness (sync with backend later)
        setBalance(prev => prev - amount)
        if (gameInfo && gameInfo.updateBalance) gameInfo.updateBalance(balance - amount)

        // Simulate API call and spinning
        try {
            // Generate result locally for now (Mocking Server Logic)
            // In a real app, this comes from the backend to prevent cheating
            const resultReels = Array(COLS).fill(0).map(() =>
                Array(ROWS).fill(0).map(() => getRandomSymbol())
            )

            // Spin Animation
            const intervalIds = []

            // Animate each reel stopping one by one
            for (let i = 0; i < COLS; i++) {
                // Start rapid spinning visual
                const interval = setInterval(() => {
                    setReels(prev => {
                        const newReels = [...prev]
                        newReels[i] = Array(ROWS).fill(0).map(() => getRandomSymbol())
                        return newReels
                    })
                }, 100)
                intervalIds.push(interval)
            }

            // Stop logic
            for (let i = 0; i < COLS; i++) {
                await new Promise(r => setTimeout(r, 300 + (i * 300)))
                clearInterval(intervalIds[i])
                setReels(prev => {
                    const newReels = [...prev]
                    newReels[i] = resultReels[i]
                    return newReels
                })
            }

            // Calculate Win (Simple logic: 3 adjacent same symbols on middle row)
            // Real logic would be complex paylines
            let win = 0
            const midRow = resultReels.map(col => col[1])

            // Check for matches starting from left
            let matchCount = 1
            let symbol = midRow[0]

            for (let i = 1; i < COLS; i++) {
                if (midRow[i].id === symbol.id || midRow[i].id === 'clover' || symbol.id === 'clover') {
                    if (symbol.id === 'clover' && midRow[i].id !== 'clover') symbol = midRow[i] // Resolve wild
                    matchCount++
                } else {
                    break
                }
            }

            if (matchCount >= 3) {
                win = amount * symbol.value * (matchCount - 2) // Simple multiplier
                setWinAmount(win)
                setBalance(prev => prev + win)
                setMessage(`WIN: ${win.toFixed(2)} TL!`)

                // Track win in backend
                try {
                    await betRoundAPI.placeBetRound({
                        gameId: 'burning-hot',
                        betAmount: amount,
                        winAmount: win,
                        result: { reels: resultReels }
                    })
                    // Report to website
                    if (gameInfo && gameInfo.onWin) gameInfo.onWin(win)
                    if (gameInfo && gameInfo.updateBalance) gameInfo.updateBalance(balance - amount + win)
                } catch (e) { console.error("API sync error", e) }

            } else {
                // Track loss
                try {
                    await betRoundAPI.placeBetRound({
                        gameId: 'burning-hot',
                        betAmount: amount,
                        winAmount: 0,
                        result: { reels: resultReels }
                    })
                    // Report to website
                    if (gameInfo && gameInfo.onLoss) gameInfo.onLoss(amount)
                } catch (e) { console.error("API sync error", e) }
            }

        } catch (error) {
            console.error(error)
            setMessage("Error occured")
        } finally {
            setIsSpinning(false)
        }
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-green-900 to-black flex flex-col items-center justify-start pt-[140px] md:pt-[160px] p-2 md:p-4 font-sans text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-800/40 via-transparent to-black pointer-events-none"></div>

            {/* Header / Info Bar */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-4 md:mb-8 bg-black/60 backdrop-blur-md p-3 md:p-4 rounded-xl border border-yellow-600/30 shadow-lg z-10">
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="bg-gradient-to-tr from-yellow-700 to-yellow-400 w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-3xl shadow-lg border-2 border-yellow-200">
                        🔥
                    </div>
                    <div>
                        <h1 className="text-lg md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 uppercase tracking-widest drop-shadow-sm">Burning Hot</h1>
                        <p className="text-[10px] md:text-xs text-yellow-500/80 tracking-widest font-bold">EGT INTERACTIVE</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] md:text-xs text-green-400 uppercase font-bold tracking-wider">Balance</p>
                    <p className="text-lg md:text-3xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                        {balance.toFixed(2)} <span className="text-sm md:text-lg text-green-500">TL</span>
                    </p>
                </div>
            </div>

            {/* Main Game Machine */}
            <div className="relative z-10 bg-gradient-to-b from-green-800 to-green-950 p-3 md:p-4 rounded-2xl md:rounded-[40px] border md:border-4 border-yellow-700 shadow-2xl w-[95%] lg:w-[85%] max-w-5xl mx-auto backdrop-blur-xl">
                {/* Decorative Frame Elements */}
                <div className="absolute inset-0 border md:border-2 border-yellow-400/20 rounded-2xl md:rounded-[38px] pointer-events-none"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Reels Column */}
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-5 gap-[4px] md:gap-[8px] bg-black/90 p-2 md:p-4 rounded-xl border-[3px] border-yellow-800 shadow-[inset_0_0_20px_rgba(0,0,0,1)] overflow-hidden relative">
                            {/* Payline Indicator (Center) */}
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-red-500/80 to-transparent z-10 pointer-events-none transform -translate-y-1/2"></div>

                            {reels.map((col, i) => (
                                <div key={i} className="flex flex-col gap-[4px] md:gap-[8px] relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 pointer-events-none z-20 rounded-sm"></div>
                                    {col.map((symbol, j) => (
                                        <div key={j} className={`
                                            w-full aspect-square bg-gradient-to-b from-gray-100 to-gray-300 rounded-md md:rounded-lg flex items-center justify-center 
                                            text-[5vw] lg:text-4xl shadow-inner border border-gray-400 relative overflow-hidden
                                            ${isSpinning ? 'blur-[1px] md:blur-sm scale-95' : 'scale-100'}
                                            ${j === 1 ? 'z-10 border-yellow-400 ring-2 lg:ring-4 ring-yellow-400/50 bg-gradient-to-b from-yellow-50 to-yellow-100 scale-105' : 'opacity-90'}
                                        `}>
                                            <span className="drop-shadow-md">{symbol.icon}</span>
                                            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 skew-y-12 origin-top-left pointer-events-none"></div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls Column */}
                    <div className="lg:col-span-4 space-y-4 md:space-y-6">
                        <div className="bg-black/40 p-4 rounded-2xl border border-yellow-600/20 backdrop-blur-md">
                            <label className="text-[10px] font-bold text-yellow-500 uppercase mb-2 block tracking-widest">Wager Amount</label>
                            <div className="flex items-center bg-black/60 rounded-xl border border-yellow-900/50 overflow-hidden mb-4">
                                <button
                                    onClick={() => setBetAmount(prev => Math.max(1, parseFloat(prev) - 10).toString())}
                                    className="px-5 py-4 bg-yellow-900/30 text-yellow-400 hover:bg-yellow-700/50 transition active:bg-yellow-600"
                                >
                                    <span className="font-bold text-xl">-</span>
                                </button>
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(e.target.value)}
                                    className="flex-1 bg-transparent text-center text-white font-mono font-bold text-2xl outline-none"
                                />
                                <button
                                    onClick={() => setBetAmount(prev => (parseFloat(prev) + 10).toString())}
                                    className="px-5 py-4 bg-yellow-900/30 text-yellow-400 hover:bg-yellow-700/50 transition active:bg-yellow-600"
                                >
                                    <span className="font-bold text-xl">+</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {[10, 50, 100, 500].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setBetAmount(val.toString())}
                                        className={`h-11 rounded-lg border text-xs font-black transition-all ${betAmount === val.toString() ? 'bg-green-600 border-green-400 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSpin}
                            disabled={isSpinning}
                            className={`
                                relative group overflow-hidden rounded-2xl w-full h-20 md:h-24 flex items-center justify-center 
                                shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95
                                ${isSpinning
                                    ? 'bg-gray-800 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 border-b-4 border-yellow-800 shadow-yellow-500/20'
                                }
                            `}
                        >
                            <span className="text-2xl md:text-3xl font-black italic text-yellow-950 uppercase tracking-tighter">
                                {isSpinning ? 'Spinning...' : 'Spin Reels'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Win Modal / Overlay */}
                {winAmount > 0 && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm rounded-2xl animate-in fade-in duration-300">
                        <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-[2px] rounded-2xl shadow-2xl animate-bounce-in">
                            <div className="bg-black/90 p-8 md:p-12 rounded-2xl text-center border-4 border-yellow-400/50 relative overflow-hidden">
                                {/* Rays Effect */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,215,0,0.1)_20deg,transparent_40deg,rgba(255,215,0,0.1)_60deg,transparent_80deg,rgba(255,215,0,0.1)_100deg,transparent_120deg)] animate-spin-slow pointer-events-none"></div>

                                <h2 className="text-4xl md:text-6xl font-black text-yellow-400 mb-2 drop-shadow-[0_2px_0_rgba(0,0,0,1)] uppercase">Big Win!</h2>
                                <div className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-xl tracking-tighter">
                                    {winAmount.toFixed(2)}
                                </div>
                                <button
                                    onClick={() => setWinAmount(0)}
                                    className="relative z-10 px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all text-lg"
                                >
                                    COLLECT
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message Toast */}
            {message && !winAmount && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-red-600/90 backdrop-blur text-white px-6 py-3 rounded-full font-bold shadow-xl border border-red-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">warning</span>
                        {message}
                    </div>
                </div>
            )}
        </div>
    )
}

