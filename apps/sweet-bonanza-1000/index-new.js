'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Howl } from 'howler'
import axios from 'axios'
import { useTranslation } from '@/hooks/useTranslation'
import { authAPI, betRoundAPI } from '@/lib/api'
import { logger } from '@/utils/logger'
import { handleError } from '@/utils/errorHandler'

// Pragmatic-style loading screen component
const PragmaticLoading = ({ progress }) => (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-center">
            <div className="mb-8">
                <div className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-pulse">
                    SWEET BONANZA
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white/60 mt-2">1000</div>
            </div>
            <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
                <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-pink-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="text-white/40 mt-4 text-sm">Loading... {progress}%</div>
        </div>
    </div>
)

// Win celebration component
const WinCelebration = ({ amount }) => {
    const getWinLevel = (amt) => {
        if (amt >= 1000) return { text: 'MEGA WIN!', color: 'from-yellow-400 to-orange-500', size: 'text-7xl' }
        if (amt >= 500) return { text: 'BIG WIN!', color: 'from-pink-400 to-purple-500', size: 'text-6xl' }
        if (amt >= 100) return { text: 'GREAT WIN!', color: 'from-blue-400 to-cyan-500', size: 'text-5xl' }
        return { text: 'WIN!', color: 'from-green-400 to-emerald-500', size: 'text-4xl' }
    }

    const level = getWinLevel(amount)

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/70 animate-fade-in" />
            <div className="relative text-center animate-bounce-premium">
                <div className={`${level.size} font-black italic text-transparent bg-clip-text bg-gradient-to-r ${level.color} drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] mb-4`}>
                    {level.text}
                </div>
                <div className="text-5xl font-black text-white drop-shadow-lg">
                    ₺ {amount.toLocaleString()}
                </div>
                {/* Coin rain effect */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-4xl animate-fall"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        >
                            🪙
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function SweetBonanza1000() {
    const router = useRouter()
    const { t } = useTranslation()

    // Game state
    const [balance, setBalance] = useState(100000)
    const [betAmount, setBetAmount] = useState(3.50)
    const [grid, setGrid] = useState([])
    const [isSpinning, setIsSpinning] = useState(false)
    const [winAmount, setWinAmount] = useState(0)
    const [showFireworks, setShowFireworks] = useState(false)
    const [showLossAnimation, setShowLossAnimation] = useState(false)
    const [winningSymbols, setWinningSymbols] = useState([])
    const [droppingIndices, setDroppingIndices] = useState([])
    const [lastWinColor, setLastWinColor] = useState('#fbbf24')

    // Free spins state
    const [isFreeSpins, setIsFreeSpins] = useState(false)
    const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0)
    const [freeSpinType, setFreeSpinType] = useState(null)

    // UI state
    const [isDesktop, setIsDesktop] = useState(false)
    const [doubleChance, setDoubleChance] = useState(false)
    const [turboSpin, setTurboSpin] = useState(false)
    const [quickSpin, setQuickSpin] = useState(false)
    const [showAutoplayModal, setShowAutoplayModal] = useState(false)
    const [isAutoplayActive, setIsAutoplayActive] = useState(false)
    const [autoplayCount, setAutoplayCount] = useState(10)
    const [pageLoading, setPageLoading] = useState(true)
    const [loadingProgress, setLoadingProgress] = useState(0)

    // Symbols
    const symbols = [
        { id: 'candy', image: '/games/sweet-bonanza-1000/symbols/candy.png', multiplier: 2 },
        { id: 'grape', image: '/games/sweet-bonanza-1000/symbols/grape.png', multiplier: 3 },
        { id: 'watermelon', image: '/games/sweet-bonanza-1000/symbols/watermelon.png', multiplier: 4 },
        { id: 'apple', image: '/games/sweet-bonanza-1000/symbols/apple.png', multiplier: 5 },
        { id: 'plum', image: '/games/sweet-bonanza-1000/symbols/plum.png', multiplier: 6 },
        { id: 'banana', image: '/games/sweet-bonanza-1000/symbols/banana.png', multiplier: 8 },
        { id: 'heart', image: '/games/sweet-bonanza-1000/symbols/heart.png', multiplier: 10 },
        { id: 'scatter', image: '/games/sweet-bonanza-1000/symbols/scatter.png', multiplier: 0 }
    ]

    // Initialize grid
    useEffect(() => {
        const initialGrid = Array(36).fill(null).map(() => symbols[Math.floor(Math.random() * (symbols.length - 1))])
        setGrid(initialGrid)
    }, [])

    // Loading simulation
    useEffect(() => {
        let progress = 0
        const interval = setInterval(() => {
            progress += Math.random() * 15
            if (progress >= 100) {
                progress = 100
                setPageLoading(false)
                clearInterval(interval)
            }
            setLoadingProgress(Math.floor(progress))
        }, 100)
        return () => clearInterval(interval)
    }, [])

    // Simple responsive detection
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            setIsDesktop(width >= 1024)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', handleResize)
        }
    }, [])

    // Sound objects
    const sounds = useRef({})

    const playSound = (soundName) => {
        try {
            if (!sounds.current[soundName]) {
                const soundPaths = {
                    spin: '/games/sweet-bonanza-1000/sounds/spin.mp3',
                    win: '/games/sweet-bonanza-1000/sounds/win.mp3',
                    bigwin: '/games/sweet-bonanza-1000/sounds/bigwin.mp3',
                    click: '/games/sweet-bonanza-1000/sounds/click.mp3',
                    scatter: '/games/sweet-bonanza-1000/sounds/scatter.mp3'
                }
                if (soundPaths[soundName]) {
                    sounds.current[soundName] = new Howl({
                        src: [soundPaths[soundName]],
                        volume: 0.5
                    })
                }
            }
            sounds.current[soundName]?.play()
        } catch (error) {
            console.error('Sound error:', error)
        }
    }

    const handleSpin = async () => {
        if (isSpinning || balance < betAmount) return

        setIsSpinning(true)
        setWinningSymbols([])
        setShowFireworks(false)
        setShowLossAnimation(false)
        playSound('spin')

        // Deduct bet
        setBalance(prev => prev - betAmount)

        // Simulate spin with dropping animation
        const newGrid = Array(36).fill(null).map(() => symbols[Math.floor(Math.random() * symbols.length)])

        // Animate symbols dropping
        for (let i = 0; i < 36; i++) {
            setTimeout(() => {
                setDroppingIndices(prev => [...prev, i])
            }, i * 30)
        }

        setTimeout(() => {
            setGrid(newGrid)
            setDroppingIndices([])
            checkWin(newGrid)
        }, turboSpin ? 800 : 1500)
    }

    const checkWin = (currentGrid) => {
        const symbolCounts = {}
        currentGrid.forEach((symbol, idx) => {
            if (symbol) {
                if (!symbolCounts[symbol.id]) symbolCounts[symbol.id] = []
                symbolCounts[symbol.id].push(idx)
            }
        })

        let totalWin = 0
        let winIndices = []
        let scatterCount = symbolCounts['scatter']?.length || 0

        Object.entries(symbolCounts).forEach(([symbolId, indices]) => {
            if (indices.length >= 8 && symbolId !== 'scatter') {
                const symbol = symbols.find(s => s.id === symbolId)
                totalWin += betAmount * symbol.multiplier * indices.length
                winIndices.push(...indices)
            }
        })

        if (totalWin > 0) {
            setWinAmount(totalWin)
            setBalance(prev => prev + totalWin)
            setWinningSymbols(winIndices)
            setLastWinColor(totalWin >= 500 ? '#f59e0b' : '#10b981')

            setTimeout(() => {
                setShowFireworks(true)
                playSound(totalWin >= 500 ? 'bigwin' : 'win')
            }, 500)

            setTimeout(() => {
                setShowFireworks(false)
                setWinningSymbols([])
            }, 3000)
        } else {
            setTimeout(() => {
                setShowLossAnimation(true)
                setTimeout(() => setShowLossAnimation(false), 2000)
            }, 500)
        }

        // Check for free spins trigger
        if (scatterCount >= 4 && !isFreeSpins) {
            playSound('scatter')
            setIsFreeSpins(true)
            setFreeSpinsRemaining(10)
        }

        setIsSpinning(false)
    }

    const handleBuyFreeSpins = (type) => {
        const cost = type === 'regular' ? betAmount * 100 : betAmount * 500
        if (balance < cost) return

        playSound('click')
        setBalance(prev => prev - cost)
        setIsFreeSpins(true)
        setFreeSpinType(type)
        setFreeSpinsRemaining(type === 'regular' ? 10 : 15)
    }

    const adjustBet = (delta) => {
        if (isSpinning) return
        playSound('click')
        setBetAmount(prev => Math.max(0.20, Math.min(1000, prev + delta)))
    }

    if (pageLoading) return <PragmaticLoading progress={loadingProgress} />

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans select-none relative">
            {/* Background */}
            <div className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-60 scale-110"
                style={{ backgroundImage: 'url("/games/sweet-bonanza-1000/background.png")' }} />
            <div className="fixed inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-pink-500/20 pointer-events-none" />

            {/* Top Section - Header-like (sticky) */}
            <div className="sticky top-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
                    <div className="grid grid-cols-3 items-center gap-2 md:gap-4">
                        {/* Left: Free Spins / Scatter Info */}
                        <div className="flex flex-col gap-1 md:gap-2">
                            {isFreeSpins && (
                                <div className="bg-gradient-to-b from-purple-500 to-purple-800 rounded-lg md:rounded-xl p-2 md:p-3 border border-white/30 md:border-2 shadow-lg w-fit">
                                    <div className="text-[6px] sm:text-[7px] md:text-[8px] uppercase font-black text-white/60 tracking-widest text-center">Remaining Spins</div>
                                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-white italic text-center">{freeSpinsRemaining}</div>
                                </div>
                            )}
                            <div className="bg-black/60 backdrop-blur-md rounded-lg md:rounded-xl p-1.5 md:p-2 border border-pink-500/30 shadow-lg w-fit">
                                <span className="text-xs sm:text-sm md:text-base font-black text-pink-400 italic">4 X SCATTER</span>
                                <div className="text-[6px] sm:text-[7px] md:text-[8px] uppercase font-bold text-white/60">FREE SPINS</div>
                            </div>
                        </div>

                        {/* Center: Empty */}
                        <div />

                        {/* Right: Volatility */}
                        <div className="flex justify-end">
                            <div className="bg-black/60 backdrop-blur-md rounded-lg md:rounded-xl p-1.5 md:p-2 border border-blue-500/30 shadow-lg w-fit">
                                <span className="text-[6px] sm:text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-widest block text-right">{t('sweetBonanza.volatility')}</span>
                                <div className="flex gap-0.5 justify-end">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span key={i} className="material-symbols-outlined text-yellow-400 text-[10px] sm:text-xs leading-none animate-pulse">bolt</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section - Game Grid (naturally positioned) */}
            <div className="flex-1 flex items-center justify-center py-4 md:py-6 lg:py-8 px-2 sm:px-4 relative z-10">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-10">

                        {/* Left Sidebar: Buy Features (Desktop) */}
                        <div className="hidden lg:flex flex-col gap-3">
                            <button onClick={() => handleBuyFreeSpins('regular')} disabled={isSpinning || balance < (betAmount * 100)}
                                className="bg-[#b91c1c] border-2 border-[#fcd34d] px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all text-center min-w-[180px] disabled:opacity-50">
                                <span className="text-[10px] font-black text-white uppercase block mb-1">{t('sweetBonanza.buyFreeSpins')}</span>
                                <span className="text-2xl font-black text-white italic">₺ {(betAmount * 100).toLocaleString()}</span>
                            </button>
                            <button onClick={() => handleBuyFreeSpins('super')} disabled={isSpinning || balance < (betAmount * 500)}
                                className="bg-[#ea580c] border-2 border-[#fcd34d] px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all text-center min-w-[180px] disabled:opacity-50">
                                <span className="text-[10px] font-black text-white uppercase block mb-1">{t('sweetBonanza.buySuperFreeSpins')}</span>
                                <span className="text-2xl font-black text-white italic">₺ {(betAmount * 500).toLocaleString()}</span>
                            </button>
                        </div>

                        {/* Center: Game Grid */}
                        <div className="flex flex-col items-center">
                            <div className="relative bg-blue-400/20 backdrop-blur-xl rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 border-2 md:border-4 lg:border-6 border-white/30 shadow-2xl ring-1 ring-blue-400/50 animate-neon-pulsate">
                                <div className="grid grid-cols-6 gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 bg-black/70 rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-inner border border-white/10">
                                    {grid.map((symbol, idx) => (
                                        <div key={idx} className={`relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center transition-all duration-500 ${droppingIndices.includes(idx) ? 'animate-drop-in' : ''} ${winningSymbols.includes(idx) ? 'animate-match-pop z-20' : ''}`}>
                                            {symbol && (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <img src={symbol.image} alt={symbol.id} className={`w-[95%] h-[95%] object-contain drop-shadow-lg ${winningSymbols.includes(idx) ? 'animate-glow-pulse scale-110' : ''}`} />
                                                    {winningSymbols.includes(idx) && <div className="absolute inset-0 rounded-full animate-ping pointer-events-none opacity-40" style={{ backgroundColor: lastWinColor, boxShadow: `0 0 40px ${lastWinColor}` }} />}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Ticker */}
                            <div className="mt-3 md:mt-4 bg-black/60 backdrop-blur-md px-4 sm:px-6 md:px-8 py-1 sm:py-1.5 rounded-lg border border-white/10 shadow-xl skew-x-[-10deg]">
                                <span className="text-sm sm:text-base md:text-lg lg:text-xl font-black italic tracking-widest text-white uppercase">
                                    {isSpinning ? t('sweetBonanza.loading') : t('sweetBonanza.placeYourBets')}
                                </span>
                            </div>

                            {/* Mobile Buy Buttons */}
                            <div className="lg:hidden flex gap-2 w-full px-2 sm:px-4 mt-3 md:mt-4">
                                <button onClick={() => handleBuyFreeSpins('regular')} disabled={isSpinning || balance < (betAmount * 100)}
                                    className="bg-[#b91c1c] border border-[#fcd34d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex-1 min-w-[120px] disabled:opacity-50">
                                    <span className="text-[7px] sm:text-[8px] font-black text-white uppercase block">BUY FS</span>
                                    <span className="text-xs sm:text-sm font-black text-white italic">₺ {(betAmount * 100).toLocaleString()}</span>
                                </button>
                                <button onClick={() => handleBuyFreeSpins('super')} disabled={isSpinning || balance < (betAmount * 500)}
                                    className="bg-[#ea580c] border border-[#fcd34d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex-1 min-w-[120px] disabled:opacity-50">
                                    <span className="text-[7px] sm:text-[8px] font-black text-white uppercase block">SUPER BUY</span>
                                    <span className="text-xs sm:text-sm font-black text-white italic">₺ {(betAmount * 500).toLocaleString()}</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Sidebar: Double Chance (Desktop) */}
                        <div className="hidden lg:flex flex-col items-center">
                            <div className="bg-[#052e16] border-2 border-green-500/50 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-2xl">
                                <div className="text-center">
                                    <span className="text-sm font-black text-white tracking-widest block">{t('sweetBonanza.doubleWin').toUpperCase()}</span>
                                    <span className="text-green-300 font-bold text-[10px]">₺ {(betAmount * 0.25).toFixed(2)}</span>
                                </div>
                                <button onClick={() => setDoubleChance(!doubleChance)} className={`relative w-16 h-8 rounded-full transition-all duration-500 ${doubleChance ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-black/60'}`}>
                                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${doubleChance ? 'translate-x-8' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Section - Footer-like (sticky) */}
            <div className="sticky bottom-0 z-50 bg-gradient-to-t from-black/90 to-transparent backdrop-blur-md border-t border-white/10">
                <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
                    {/* Spin Controls */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 py-2 sm:py-3 md:py-4">
                        <button onClick={() => adjustBet(-0.50)} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/10 rounded-full border border-white/20 text-white hover:bg-white/30 transition-all active:scale-90">
                            <span className="material-symbols-outlined text-xl sm:text-2xl md:text-3xl font-black">remove</span>
                        </button>

                        <button onClick={handleSpin} disabled={isSpinning || balance < betAmount}
                            className={`relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all
                                ${isSpinning ? 'opacity-50' : 'hover:scale-110 active:scale-90 shadow-[0_0_40px_rgba(255,255,255,0.2)]'}
                                bg-gradient-to-b from-white via-slate-100 to-slate-400 border-2 sm:border-3 md:border-4 border-black/40`}
                            style={{ outline: '2px solid #10b981' }}>
                            <span className={`material-symbols-outlined text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black text-slate-800 transition-all duration-500 ${isSpinning ? 'rotate-[360deg] animate-spin-slow' : 'rotate-0'}`}>
                                sync
                            </span>
                        </button>

                        <button onClick={() => adjustBet(0.50)} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/10 rounded-full border border-white/20 text-white hover:bg-white/30 transition-all active:scale-90">
                            <span className="material-symbols-outlined text-xl sm:text-2xl md:text-3xl font-black">add</span>
                        </button>
                    </div>

                    {/* Control Bar */}
                    <div className="flex items-center justify-between py-2 sm:py-3 border-t border-white/5">
                        {/* Left Icons */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white/50 text-lg sm:text-xl md:text-2xl">info</span>
                            </button>
                            <button onClick={() => setShowAutoplayModal(true)} className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white/50 text-lg sm:text-xl md:text-2xl">autorenew</span>
                            </button>
                        </div>

                        {/* Center Toggles */}
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 bg-white/5 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-full border border-white/10">
                            <button onClick={() => setTurboSpin(!turboSpin)} className={`text-[8px] sm:text-[9px] md:text-xs font-black tracking-widest ${turboSpin ? 'text-yellow-400' : 'text-white/20'}`}>TURBO</button>
                            <div className="w-px h-2 sm:h-3 md:h-4 bg-white/20" />
                            <button onClick={() => setQuickSpin(!quickSpin)} className={`text-[8px] sm:text-[9px] md:text-xs font-black tracking-widest ${quickSpin ? 'text-green-400' : 'text-white/20'}`}>QUICK</button>
                        </div>

                        {/* Right Icon */}
                        <button className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-white/50 text-lg sm:text-xl md:text-2xl">menu</span>
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 py-2 sm:py-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-yellow-400/80 font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest">KREDİ</span>
                            <span className="text-white font-black font-mono text-sm sm:text-base md:text-lg">₺ {balance.toLocaleString()}</span>
                        </div>
                        <div className="w-px h-4 sm:h-5 bg-white/10" />
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-yellow-400/80 font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest">BAHİS</span>
                            <span className="text-white font-black font-mono text-sm sm:text-base md:text-lg">₺ {betAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="text-[6px] sm:text-[7px] md:text-[8px] text-white/10 font-bold uppercase tracking-wider text-center pb-2">
                        PRAGMATIC PLAY STYLE | ID: #75467157
                    </div>
                </div>
            </div>

            {/* Overlays */}
            {showLossAnimation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/50 animate-fade-in" />
                    <div className="relative text-center animate-bounce-premium">
                        <div className="text-4xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-200 to-blue-400">
                            BETTER LUCK<br />NEXT TIME!
                        </div>
                        <div className="mt-8 text-7xl md:text-9xl animate-pulse">🍀</div>
                    </div>
                </div>
            )}

            {showFireworks && <WinCelebration amount={winAmount} />}

            <style jsx>{`
                @keyframes drop-in {
                    0% { transform: translateY(-500%) scale(0.8); opacity: 0; }
                    80% { transform: translateY(5%) scale(1.02); opacity: 1; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                .animate-drop-in { animation: drop-in 0.4s ease-in forwards; }
                
                @keyframes match-pop {
                    0% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.6); filter: brightness(3) drop-shadow(0 0 30px white); }
                    100% { transform: scale(0); opacity: 0; }
                }
                .animate-match-pop { animation: match-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                
                @keyframes glow-pulse {
                    0% { filter: brightness(1) drop-shadow(0 0 5px rgba(255,255,255,0.2)); }
                    50% { filter: brightness(1.3) drop-shadow(0 0 20px rgba(255,255,255,0.6)); }
                    100% { filter: brightness(1) drop-shadow(0 0 5px rgba(255,255,255,0.2)); }
                }
                .animate-glow-pulse { animation: glow-pulse 1s ease-in-out infinite; }
                
                @keyframes neon-pulsate {
                    0%, 100% { border-color: rgba(255,255,255,0.3); box-shadow: 0 0 20px rgba(59,130,246,0.3); }
                    50% { border-color: rgba(59,130,246,0.8); box-shadow: 0 0 60px rgba(59,130,246,0.8), inset 0 0 20px rgba(59,130,246,0.5); }
                }
                .animate-neon-pulsate { animation: neon-pulsate 2s linear infinite; }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow { animation: spin-slow 1.5s linear infinite; }
                
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                
                @keyframes bounce-premium {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                .animate-bounce-premium { animation: bounce-premium 2s ease-in-out infinite; }
                
                @keyframes fall {
                    to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                }
                .animate-fall { animation: fall linear forwards; }
            `}</style>
        </div>
    )
}
