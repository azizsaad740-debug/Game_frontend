'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { authAPI, betRoundAPI } from '@/lib/api'
import { log } from '@/utils/logger'
import { Howl, Howler } from 'howler'

const SOUND_URLS = {
    bgm: 'https://cdn.pixabay.com/audio/2025/06/24/audio_9d2cd30c6d.mp3',
    spin: 'https://cdn.pixabay.com/audio/2022/03/10/audio_b9fdf9041f.mp3',
    win: 'https://cdn.pixabay.com/audio/2021/08/09/audio_3047f54f23.mp3',
    pop: 'https://cdn.pixabay.com/audio/2025/09/18/audio_37de472eec.mp3',
    click: 'https://cdn.pixabay.com/audio/2025/07/30/audio_c13eb537ea.mp3'
}

const SYMBOLS = [
    { id: 'heart', image: '/games/sweet-bonanza-1000/heart_premium.png', value: 10 },
    { id: 'square', image: '/games/sweet-bonanza-1000/square.png', value: 8 },
    { id: 'pentagon', image: '/games/sweet-bonanza-1000/pentagon.png', value: 5 },
    { id: 'oval', image: '/games/sweet-bonanza-1000/oval.png', value: 4 },
    { id: 'apple', image: '/games/sweet-bonanza-1000/apple.png', value: 2 },
    { id: 'plum', image: '/games/sweet-bonanza-1000/plum.png', value: 1.5 },
    { id: 'watermelon', image: '/games/sweet-bonanza-1000/watermelon.png', value: 1.2 },
    { id: 'grapes', image: '/games/sweet-bonanza-1000/grapes.png', value: 1 },
    { id: 'banana', image: '/games/sweet-bonanza-1000/banana.png', value: 0.8 },
]

const SCATTER = { id: 'scatter', image: '/games/sweet-bonanza-1000/scatter.png', value: 100 }
const MULTIPLIER = { id: 'multiplier', image: '/games/sweet-bonanza-1000/multiplier.png' }

const GRID_COLS = 6
const GRID_ROWS = 5

const SYMBOL_COLORS = {
    heart: 'rgba(236, 72, 153, 0.6)', // Pink
    square: 'rgba(168, 85, 247, 0.6)', // Purple
    pentagon: 'rgba(34, 197, 94, 0.6)', // Green
    oval: 'rgba(59, 130, 246, 0.6)', // Blue
    apple: 'rgba(239, 68, 68, 0.6)', // Red
    plum: 'rgba(139, 92, 246, 0.6)', // Violet
    watermelon: 'rgba(132, 204, 22, 0.6)', // Lime
    grapes: 'rgba(107, 33, 168, 0.6)', // Purple
    banana: 'rgba(234, 179, 8, 0.6)', // Yellow
    scatter: 'rgba(255, 255, 255, 0.8)', // White/Rainbow
    multiplier: 'rgba(251, 191, 36, 0.8)', // Gold
}

// Pragmatic Play Loading Screen
const PragmaticLoading = ({ progress }) => {
    return (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center">
            <div className="relative mb-8">
                {/* Logo Placeholder - Matches Image 0 */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-white text-4xl font-black tracking-tight">PRAGMATIC</span>
                        <div className="relative">
                            <span className="text-[#ff7b00] text-4xl font-black tracking-tight border-2 border-[#ff7b00] rounded-full px-2 py-0">PLAY</span>
                            <div className="absolute -top-4 -right-2 transform translate-x-1 -translate-y-1">
                                <span className="text-[#ff7b00] text-xl">👑</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden border border-white/5">
                <div
                    className="h-full bg-gradient-to-r from-[#ff7b00] to-[#ffaa00] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,123,0,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="mt-4 text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
                Loading ... {Math.round(progress)}%
            </div>
        </div>
    )
}

// Fireworks Component for Win Celebration
const Fireworks = () => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let animationFrameId

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const particles = []
        const particleCount = 150
        const colors = ['#FF1493', '#FFD700', '#FF69B4', '#00BFFF', '#ADFF2F', '#FF4500']

        class Particle {
            constructor(x, y, color) {
                this.x = x
                this.y = y
                this.color = color
                this.radius = Math.random() * 3 + 1
                this.velocity = {
                    x: (Math.random() - 0.5) * 12,
                    y: (Math.random() - 0.5) * 12
                }
                this.alpha = 1
                this.decay = Math.random() * 0.01 + 0.015
            }

            draw() {
                ctx.save()
                ctx.globalAlpha = this.alpha
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
                ctx.fillStyle = this.color
                ctx.shadowBlur = 10
                ctx.shadowColor = this.color
                ctx.fill()
                ctx.restore()
            }

            update() {
                this.velocity.y += 0.1 // gravity
                this.x += this.velocity.x
                this.y += this.velocity.y
                this.alpha -= this.decay
            }
        }

        const createFirework = (x, y) => {
            const color = colors[Math.floor(Math.random() * colors.length)]
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(x, y, color))
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (Math.random() < 0.08) {
                createFirework(
                    Math.random() * canvas.width,
                    Math.random() * (canvas.height * 0.6)
                )
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update()
                particles[i].draw()
                if (particles[i].alpha <= 0) {
                    particles.splice(i, 1)
                }
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)

        return () => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[100]"
            style={{ mixBlendMode: 'screen' }}
        />
    )
}

const WinCelebration = ({ amount }) => {
    const [coins, setCoins] = useState([])

    useEffect(() => {
        const interval = setInterval(() => {
            if (coins.length < 40) {
                setCoins(prev => [...prev, {
                    id: Math.random(),
                    x: Math.random() * 100,
                    y: -100,
                    size: Math.random() * 40 + 60,
                    rotation: Math.random() * 360,
                    duration: Math.random() * 1.5 + 1,
                    delay: Math.random() * 0.3
                }])
            }
        }, 80)
        return () => clearInterval(interval)
    }, [coins])

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex items-center justify-center">
            {/* Dark Backdrop - Blurred only if not autoplay */}
            <div className="absolute inset-0 bg-black/60 animate-fade-in" />

            {/* Neon Flickering Tubes - Pure CSS replace for "image" lights */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[90%] h-[80%] border-4 border-pink-500 rounded-[3rem] animate-neon-flicker-pink opacity-80" />
                <div className="absolute top-[12%] left-[7%] w-[86%] h-[76%] border-4 border-blue-500 rounded-[2.5rem] animate-neon-flicker-blue opacity-80" />
            </div>

            {/* Sunburst Rays - Procedural Neon Rays */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-[150vw] h-[150vw] bg-[conic-gradient(from_0deg,transparent_0deg_10deg,rgba(59,130,246,0.3)_15deg_25deg,transparent_30deg_40deg,rgba(236,72,153,0.3)_45deg_55deg,transparent_60deg)] animate-spin-slow" />
            </div>

            {/* Glowing Orbs */}
            <div className="absolute w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute w-[400px] h-[400px] bg-blue-500/30 rounded-full blur-[80px] animate-pulse delay-75" />

            {/* Falling Glossy Coins */}
            {coins.map(coin => (
                <div
                    key={coin.id}
                    className="absolute animate-fall"
                    style={{
                        left: `${coin.x}%`,
                        top: '-100px',
                        width: `${coin.size}px`,
                        height: `${coin.size}px`,
                        animationDuration: `${coin.duration}s`,
                        animationDelay: `${coin.delay}s`,
                        transform: `rotate(${coin.rotation}deg)`
                    }}
                >
                    <img
                        src="/assets/graphics/coin.png"
                        alt="coin"
                        className="w-full h-full object-contain brightness-125 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"
                        style={{ mixBlendMode: 'screen' }}
                    />
                </div>
            ))}

            {/* Stylized Jackpot Text Container */}
            <div className="relative z-50 flex flex-col items-center animate-match-pop">
                {/* 3D Stylized Tiered Win Text */}
                <div className="relative group flex flex-col items-center">
                    <h2 className={`text-[100px] md:text-[180px] font-black italic tracking-tighter leading-none px-12 py-6 text-center
                        bg-gradient-to-b ${amount > 500 ? 'from-yellow-100 via-yellow-400 to-red-600' : 'from-pink-100 via-pink-400 to-purple-600'} bg-clip-text text-transparent
                        drop-shadow-[0_10px_0_#991b1b] animate-neon-glow-text w-full
                    `}>
                        {amount > 2000 ? 'ULTRA WIN' : amount > 1000 ? 'MEGA WIN' : amount > 500 ? 'BIG WIN' : 'JACKPOT'}
                    </h2>

                    {amount > 1000 && (
                        <div className="absolute -top-20 animate-bounce">
                            <span className="text-8xl">💎</span>
                        </div>
                    )}

                    {/* Glowing Outline */}
                    <div className="absolute inset-0 -z-10 bg-yellow-400/20 blur-[60px] rounded-full scale-125 animate-pulse" />
                </div>

                {/* Win Amount with Glossy Plate */}
                <div className="mt-[-20px] bg-gradient-to-b from-pink-500 to-pink-700 px-12 py-4 rounded-3xl border-4 border-white/20 shadow-2xl flex flex-col items-center skew-x-[-10deg]">
                    <span className="text-white text-4xl md:text-6xl font-black italic drop-shadow-lg tracking-tighter flex items-center gap-4">
                        <span className="text-yellow-400">₺</span>
                        {amount.toLocaleString()}
                    </span>
                </div>
            </div>

            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg) scale(0.5); opacity: 0; }
                    20% { opacity: 1; transform: translateY(20vh) rotate(72deg) scale(1); }
                    100% { transform: translateY(120vh) rotate(360deg) scale(0.8); opacity: 0; }
                }
                .animate-fall {
                    animation: fall linear forwards;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    )
}


export default function SweetBonanza1000({ isLauncher = false, gameInfo }) {
    const { t, i18n } = useTranslation()
    const router = useRouter()

    // State management
    const [user, setUser] = useState(null)
    const [balance, setBalance] = useState(100000)
    const [betAmount, setBetAmount] = useState(2.50)
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [error, setError] = useState('')
    const [grid, setGrid] = useState([])
    const [isSpinning, setIsSpinning] = useState(false)
    const [isFalling, setIsFalling] = useState(false)
    const [droppingIndices, setDroppingIndices] = useState([])
    const [winAmount, setWinAmount] = useState(0)
    const [tumbleCount, setTumbleCount] = useState(0)
    const [winningSymbols, setWinningSymbols] = useState([])
    const [lastWinColor, setLastWinColor] = useState('rgba(255, 255, 255, 0.5)')
    const [isBigWin, setIsBigWin] = useState(false)
    const [multiplier, setMultiplier] = useState(1)
    const [showLossAnimation, setShowLossAnimation] = useState(false)
    const [showFireworks, setShowFireworks] = useState(false)
    const [doubleChance, setDoubleChance] = useState(true)
    const [showAutoplayModal, setShowAutoplayModal] = useState(false)
    const [autoplayCount, setAutoplayCount] = useState(100)
    const [isAutoplayActive, setIsAutoplayActive] = useState(false)
    const [turboSpin, setTurboSpin] = useState(false)
    const [quickSpin, setQuickSpin] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [gameScale, setGameScale] = useState(1)
    const [isFreeSpins, setIsFreeSpins] = useState(false)
    const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0)
    const [totalFreeSpinWin, setTotalFreeSpinWin] = useState(0)

    // Autoplay effect to handle sequence
    useEffect(() => {
        let timer
        if (isAutoplayActive && !isSpinning && autoplayCount > 0) {
            timer = setTimeout(() => {
                handleSpin()
            }, 1000)
        } else if (autoplayCount === 0) {
            setIsAutoplayActive(false)
        }
        return () => clearTimeout(timer)
    }, [isAutoplayActive, isSpinning, autoplayCount])

    // Responsive scaling effect
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            const height = window.innerHeight

            // Desktop view optimization: If height is small, scale down.
            // But don't force mobile-like narrowness on large screens.
            const availableHeight = height - 40 // Compact margin
            const gameOriginalHeight = 850 // More realistic height for desktop grid + controls

            if (width >= 1024) {
                // For desktop, we want to maximize the grid
                const scaleH = Math.min(1.1, availableHeight / gameOriginalHeight)
                setGameScale(scaleH)
            } else {
                // Mobile scaling
                const scaleH = Math.min(1, availableHeight / gameOriginalHeight)
                const scaleW = Math.min(1, (width - 20) / 450)
                setGameScale(Math.min(scaleH, scaleW))
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Sound objects ref
    const sounds = useRef({
        bgm: null,
        spin: null,
        win: null,
        pop: null,
        click: null
    })

    // Initialize sounds
    useEffect(() => {
        sounds.current.bgm = new Howl({ src: [SOUND_URLS.bgm], loop: true, volume: 0.3 })
        sounds.current.spin = new Howl({ src: [SOUND_URLS.spin], volume: 0.5 })
        sounds.current.win = new Howl({ src: [SOUND_URLS.win], volume: 0.6 })
        sounds.current.pop = new Howl({ src: [SOUND_URLS.pop], volume: 0.4 })
        sounds.current.click = new Howl({ src: [SOUND_URLS.click], volume: 0.4 })

        return () => {
            Object.values(sounds.current).forEach(s => s?.stop())
        }
    }, [])

    // BGM control
    useEffect(() => {
        if (!pageLoading && !isMuted) {
            sounds.current.bgm?.play()
        } else {
            sounds.current.bgm?.pause()
        }
    }, [pageLoading, isMuted])

    const playSound = (type) => {
        if (!isMuted && sounds.current[type]) {
            sounds.current[type].play()
        }
    }

    const stopSound = (type) => {
        if (sounds.current[type]) {
            sounds.current[type].stop()
        }
    }

    const toggleMute = () => {
        setIsMuted(prev => !prev)
        Howler.mute(!isMuted)
    }

    // Initial load effect
    useEffect(() => {
        let interval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(() => setPageLoading(false), 500)
                    return 100
                }
                return prev + (Math.random() * 10)
            })
        }, 150)
        return () => clearInterval(interval)
    }, [])

    // Fetch user data on mount
    useEffect(() => {
        fetchUserData()
        initGrid()
    }, [])

    const fetchUserData = async () => {
        try {
            const response = await authAPI.me()
            setUser(response.data)
            setBalance(response.data.balance || 0)
        } catch (err) {
            log.apiError('/auth/me', err)
        }
    }

    const initGrid = () => {
        const newGrid = Array(GRID_COLS * GRID_ROWS).fill(null).map(() => getRandomSymbol())
        setGrid(newGrid)
    }

    const getRandomSymbol = () => {
        const rand = Math.random()
        if (rand < 0.02) return SCATTER
        if (rand < 0.05) return MULTIPLIER
        return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    }

    const handleSpin = async () => {
        if (loading || isSpinning || balance < betAmount) return

        playSound('click')
        setLoading(true)
        setIsSpinning(true)
        setWinAmount(0)
        setTumbleCount(0)
        setWinningSymbols([])
        setMultiplier(1)
        setError('')

        try {
            setBalance(prev => prev - betAmount)
            playSound('spin')

            // Step 1: Empty the grid (Gravity effect start) - Matches user request
            setGrid(prev => prev.map(() => null))
            await new Promise(resolve => setTimeout(resolve, 300))

            // Step 2: Drop symbols from top column by column
            // Adjusted Win Probability - 70% chance to force a win (at least 10 matching symbols)
            let finalGrid = []
            const forceWin = Math.random() < 0.7

            if (forceWin) {
                const winningSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
                finalGrid = Array(GRID_COLS * GRID_ROWS).fill(null).map(() => getRandomSymbol())
                const indices = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => i)
                for (let i = 0; i < 10; i++) {
                    const randIdx = indices.splice(Math.floor(Math.random() * indices.length), 1)[0]
                    finalGrid[randIdx] = winningSym
                }
            } else {
                finalGrid = Array(GRID_COLS * GRID_ROWS).fill(null).map(() => getRandomSymbol())
            }

            // Step 2: Drop symbols simultaneously with random speeds
            const fillSpeeds = Array(GRID_COLS).fill(0).map(() => Math.random() * 100 + 50)

            await Promise.all(Array.from({ length: GRID_COLS }).map(async (_, col) => {
                // Stagger each column slightly
                await new Promise(resolve => setTimeout(resolve, Math.random() * 200))

                for (let row = 0; row < GRID_ROWS; row++) {
                    const idx = row * GRID_COLS + col
                    setDroppingIndices(prev => [...prev, idx])
                    setGrid(prev => {
                        const next = [...prev]
                        next[idx] = finalGrid[idx]
                        return next
                    })
                    playSound('pop')
                    if (!turboSpin) await new Promise(resolve => setTimeout(resolve, quickSpin ? 30 : 60))
                }
            }))

            setDroppingIndices([])
            stopSound('spin')

            // Small pause before checking wins
            await new Promise(resolve => setTimeout(resolve, 300))
            checkWins(finalGrid, 1)
        } catch (err) {
            setError('Failed to process spin')
            // Don't refund if the error happened AFTER deduction and spin animation started
            // Only refund if deduction failed or something before that
            setIsSpinning(false)
        } finally {
            setLoading(false)
        }
    }

    const handleBuyFreeSpins = async (type = 'regular') => {
        const cost = type === 'super' ? betAmount * 500 : betAmount * 100
        if (loading || isSpinning || balance < cost) return

        playSound('click')
        setLoading(true)
        setIsSpinning(true)
        setBalance(prev => prev - cost)

        try {
            // Log the purchase
            await betRoundAPI.placeBetRound({
                roundNumber: Date.now(),
                betAmount: cost,
                percentage: -100, // Initial deduction
                gameId: 'sweet-bonanza-1000',
                metadata: { type: 'buy_free_spins', fsType: type }
            })

            setIsFreeSpins(true)
            setFreeSpinsRemaining(10)
            setTotalFreeSpinWin(0)

            // Trigger first spin automatically
            setTimeout(() => handleSpin(), 1000)
        } catch (err) {
            console.error('Buy Free Spins error:', err)
            // Even if API fails, we continue the logic for UX if balance was deducted
            setIsFreeSpins(true)
            setFreeSpinsRemaining(10)
            setTotalFreeSpinWin(0)
            setTimeout(() => handleSpin(), 1000)
        } finally {
            setLoading(false)
        }
    }

    const checkWins = async (currentGrid, currentMultiplier) => {
        const counts = {}
        currentGrid.forEach((sym, idx) => {
            if (!sym || sym.id === 'multiplier') return
            counts[sym.id] = (counts[sym.id] || 0) + 1
        })

        const wins = []
        let totalWin = 0
        let scattCount = counts['scatter'] || 0

        Object.keys(counts).forEach(id => {
            if (id === 'scatter') return
            if (counts[id] >= 8) {
                const symInfo = SYMBOLS.find(s => s.id === id)
                const payout = (counts[id] * symInfo.value * betAmount) / 10
                totalWin += payout
                wins.push(id)
            }
        })

        if (scattCount >= 4) {
            totalWin += betAmount * 10
            wins.push('scatter')
        }

        if (wins.length > 0) {
            playSound('pop')
            const winIndices = currentGrid
                .map((sym, idx) => sym && wins.includes(sym.id) ? idx : -1)
                .filter(idx => idx !== -1)

            if (winIndices.length > 0) {
                const firstWinSym = currentGrid[winIndices[0]]?.id
                setLastWinColor(SYMBOL_COLORS[firstWinSym] || 'rgba(255, 255, 255, 0.5)')
            }

            setWinningSymbols(winIndices)

            let activeMultiplier = currentMultiplier
            currentGrid.forEach(sym => {
                if (sym && sym.id === 'multiplier') {
                    activeMultiplier += (Math.floor(Math.random() * 99) + 2)
                }
            })
            setMultiplier(activeMultiplier)

            if (totalWin * activeMultiplier > betAmount * 50) {
                setIsBigWin(true)
                setTimeout(() => setIsBigWin(false), 2000)
            }

            await new Promise(resolve => setTimeout(resolve, 800))
            setWinAmount(prev => prev + totalWin)

            // Tumble logic
            const nextGrid = [...currentGrid]
            winIndices.forEach(idx => {
                nextGrid[idx] = null
            })

            // Shift symbols down
            for (let col = 0; col < GRID_COLS; col++) {
                let emptySpots = 0
                for (let row = GRID_ROWS - 1; row >= 0; row--) {
                    const idx = row * GRID_COLS + col
                    if (nextGrid[idx] === null) {
                        emptySpots++
                    } else if (emptySpots > 0) {
                        nextGrid[(row + emptySpots) * GRID_COLS + col] = nextGrid[idx]
                        nextGrid[idx] = null
                    }
                }
                for (let row = 0; row < emptySpots; row++) {
                    nextGrid[row * GRID_COLS + col] = getRandomSymbol()
                }
            }

            setGrid(nextGrid)
            setWinningSymbols([])
            setTumbleCount(prev => prev + 1)

            await new Promise(resolve => setTimeout(resolve, 500))
            checkWins(nextGrid, activeMultiplier)
        } else {
            const finalWin = winAmount * multiplier
            if (finalWin > 0) {
                setWinAmount(finalWin)
                setShowFireworks(true)
                playSound('win')
                const celebrationTime = isAutoplayActive ? 2500 : 5000
                setTimeout(() => setShowFireworks(false), celebrationTime)

                try {
                    const response = await betRoundAPI.placeBetRound({
                        roundNumber: Date.now(),
                        betAmount: betAmount,
                        percentage: (finalWin / betAmount) * 100,
                        gameId: 'sweet-bonanza-1000'
                    })
                    if (response.data?.balance) setBalance(response.data.balance)
                } catch (err) {
                    setBalance(prev => prev + finalWin)
                }
            } else {
                setShowLossAnimation(true)
                const lossTime = isAutoplayActive ? 800 : 1500
                setTimeout(() => setShowLossAnimation(false), lossTime)
            }
            setIsSpinning(false)

            if (isAutoplayActive && autoplayCount > 0) {
                setAutoplayCount(prev => prev - 1)
            }

            if (isFreeSpins) {
                setFreeSpinsRemaining(prev => prev - 1)
                setTotalFreeSpinWin(prev => prev + finalWin)
                if (freeSpinsRemaining > 1) {
                    setTimeout(() => handleSpin(), 1500)
                } else {
                    setIsFreeSpins(false)
                    // Show total free spin win if notable
                }
            }
        }
    }

    const adjustBet = (delta) => {
        if (isSpinning) return
        playSound('click')
        setBetAmount(prev => Math.max(0.20, Math.min(1000, prev + delta)))
    }

    if (pageLoading) return <PragmaticLoading progress={loadingProgress} />

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans overflow-hidden select-none">
            {/* Background Decor - Matches Candy/Sweet landscape in images */}
            <div
                className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-60 scale-110"
                style={{ backgroundImage: 'url("/games/sweet-bonanza-1000/background.png")' }}
            />

            {/* Gradient Overlay for atmosphere */}
            <div className="fixed inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-pink-500/20 pointer-events-none" />

            {/* Header Bar - Removed for maximum space */}

            {/* Main Game Area */}
            <div className={`relative z-10 h-full flex flex-col items-center p-2 md:p-6 pb-0 overflow-hidden w-full`}
                style={{ transform: `scale(${gameScale})`, transformOrigin: 'top center' }}>

                {/* Top Banner - Logo & Info (Image 2) */}
                <div className="w-full max-w-[1600px] grid grid-cols-3 items-start px-10">
                    {/* Left: Ticker/Multiplier info */}
                    <div className="flex flex-col gap-2">
                        {isFreeSpins && (
                            <div className="bg-gradient-to-b from-purple-500 to-purple-800 rounded-xl p-3 border-2 border-white/30 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-bounce-premium w-fit">
                                <div className="text-[8px] uppercase font-black text-white/60 tracking-widest mb-0.5 text-center">Remaining Spins</div>
                                <div className="text-3xl font-black text-white italic text-center drop-shadow-md">{freeSpinsRemaining}</div>
                            </div>
                        )}
                        <div className="bg-black/60 backdrop-blur-md rounded-xl p-2 border border-pink-500/30 shadow-xl w-fit">
                            <span className="text-pink-400 font-black text-lg italic tracking-tighter">4 X SCATTER</span>
                            <div className="text-[8px] uppercase font-bold text-white/60 tracking-widest">FREE SPINS KAZANDIRIR</div>
                        </div>
                    </div>

                    {/* Center: Removed for clean look */}
                    <div className="flex-1" />

                    {/* Right: Volatility Check (Image 4) */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-black/60 backdrop-blur-md rounded-xl p-2 border border-blue-500/30 shadow-xl flex flex-col items-end w-fit">
                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-0.5">{t('sweetBonanza.volatility')}</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span key={i} className="material-symbols-outlined text-yellow-400 text-xs leading-none animate-pulse">bolt</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area: Grid + Sidebars for space efficiency on Desktop */}
                <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 overflow-hidden my-auto">

                    {/* Left Sidebar: Buy Features */}
                    <div className="hidden lg:flex flex-col gap-3">
                        <button onClick={() => handleBuyFreeSpins('regular')} disabled={isSpinning || balance < (betAmount * 100)} className="group relative bg-[#b91c1c] border-2 border-[#fcd34d] px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all text-center min-w-[180px]">
                            <span className="text-[10px] font-black text-white uppercase block mb-1">{t('sweetBonanza.buyFreeSpins')}</span>
                            <span className="text-2xl font-black text-white italic">₺ {(betAmount * 100).toLocaleString()}</span>
                        </button>
                        <button onClick={() => handleBuyFreeSpins('super')} disabled={isSpinning || balance < (betAmount * 500)} className="group relative bg-[#ea580c] border-2 border-[#fcd34d] px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all text-center min-w-[180px]">
                            <span className="text-[10px] font-black text-white uppercase block mb-1">{t('sweetBonanza.buySuperFreeSpins')}</span>
                            <span className="text-2xl font-black text-white italic">₺ {(betAmount * 500).toLocaleString()}</span>
                        </button>
                    </div>

                    {/* Central Area: Grid */}
                    <div className="flex flex-col items-center shrink min-h-0 scale-105 lg:scale-110">
                        {/* Central Grid Container */}
                        <div className="relative bg-blue-400/20 backdrop-blur-xl rounded-[3rem] p-4 md:p-8 border-4 border-white/30 shadow-2xl ring-1 ring-blue-400/50 animate-neon-pulsate shrink min-h-0">
                            <div className="grid grid-cols-6 gap-3 md:gap-5 bg-black/70 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-inner border border-white/10 shrink min-h-0" style={{ width: '453px', height: '414px' }}>
                                {grid.map((symbol, idx) => (
                                    <div key={idx} className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-500 ${droppingIndices.includes(idx) ? 'animate-drop-in' : ''} ${winningSymbols.includes(idx) ? 'animate-match-pop z-20' : ''}`}>
                                        {symbol && (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <img src={symbol.image} alt={symbol.id} className={`w-[98%] h-[98%] object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)] ${winningSymbols.includes(idx) ? 'animate-glow-pulse scale-110' : ''}`} />
                                                {winningSymbols.includes(idx) && <div className="absolute inset-0 rounded-full animate-ping pointer-events-none opacity-40" style={{ backgroundColor: lastWinColor, boxShadow: `0 0 40px ${lastWinColor}` }} />}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mid Ticker - Compact */}
                        <div className="mt-4 bg-black/60 backdrop-blur-md px-10 py-1.5 rounded-lg border border-white/10 shadow-xl skew-x-[-10deg]">
                            <span className="text-xl md:text-2xl font-black italic tracking-widest text-white uppercase">
                                {isSpinning ? t('sweetBonanza.loading') : t('sweetBonanza.placeYourBets')}
                            </span>
                        </div>
                    </div>

                    {/* Mobile Only: Buy Actions Row */}
                    <div className="lg:hidden flex gap-2 w-full px-4 overflow-x-auto pb-2">
                        <button onClick={() => handleBuyFreeSpins('regular')} className="bg-[#b91c1c] border border-[#fcd34d] px-4 py-2 rounded-xl flex-1 shrink-0 min-w-[140px]" style={{ width: '187px', height: '36px' }}>
                            <span className="text-[8px] font-black text-white uppercase block mb-0.5">BUY FS</span>
                            <span className="text-sm font-black text-white italic">₺ {(betAmount * 100).toLocaleString()}</span>
                        </button>
                        <button onClick={() => handleBuyFreeSpins('super')} className="bg-[#ea580c] border border-[#fcd34d] px-4 py-2 rounded-xl flex-1 shrink-0 min-w-[140px]" style={{ width: '187px', height: '36px' }}>
                            <span className="text-[8px] font-black text-white uppercase block mb-0.5">SUPER BUY</span>
                            <span className="text-sm font-black text-white italic">₺ {(betAmount * 500).toLocaleString()}</span>
                        </button>
                    </div>

                    {/* Right Sidebar: Double Chance */}
                    <div className="hidden lg:flex flex-col items-center">
                        <div className="bg-[#052e16] border-2 border-green-500/50 rounded-[2rem] p-4 flex flex-col items-center gap-3 shadow-2xl">
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

                {/* Bottom Consolidated Section: Exact Reference Layout (Reduced size by 25%) */}
                <div className="w-full shrink-0 flex flex-col items-center bg-black/25 backdrop-blur-3xl border-t border-white/10 mt-auto scale-90 lg:scale-[0.8] origin-bottom">

                    {/* Spin Row with +/- */}
                    <div className="flex items-center justify-center gap-4 py-3 md:py-4 w-full">
                        <button onClick={() => adjustBet(-0.50)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full border border-white/20 text-white hover:bg-white/30 transition-all active:scale-90">
                            <span className="material-symbols-outlined text-2xl font-black">remove</span>
                        </button>

                        <button
                            onClick={handleSpin}
                            disabled={isSpinning || balance < betAmount}
                            className={`
                                relative w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center transition-all transform
                                ${isSpinning ? 'opacity-50' : 'hover:scale-110 active:scale-90 shadow-[0_0_40px_rgba(255,255,255,0.2)]'}
                                bg-gradient-to-b from-white via-slate-100 to-slate-400 border-4 md:border-6 border-black/40
                            `}
                        >
                            <span className={`material-symbols-outlined text-4xl md:text-5xl font-black text-slate-800 transition-all duration-500 ${isSpinning ? 'rotate-[360deg] animate-spin-slow' : 'rotate-0'}`}>
                                sync
                            </span>
                        </button>

                        <button onClick={() => adjustBet(0.50)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full border border-white/20 text-white hover:bg-white/30 transition-all active:scale-90">
                            <span className="material-symbols-outlined text-2xl font-black">add</span>
                        </button>
                    </div>

                    {/* Bottom Control Bar Bar */}
                    <div className="w-full max-w-6xl mx-auto flex flex-col px-4 pb-2" style={{ borderRadius: '16px', fontSize: '11px', borderWidth: '0px', borderStyle: 'solid' }}>

                        <div className="flex items-center justify-between mb-1">
                            {/* Icons Column 1 */}
                            <div className="flex items-center gap-2">
                                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <span className="material-symbols-outlined text-white/50 text-xl">info</span>
                                </button>
                                <button onClick={() => setShowAutoplayModal(true)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <span className="material-symbols-outlined text-white/50 text-xl">autorenew</span>
                                </button>
                            </div>

                            {/* Middle Feature Toggles */}
                            <div className="flex items-center gap-3 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                <button onClick={() => setTurboSpin(!turboSpin)} className={`text-[9px] font-black tracking-widest ${turboSpin ? 'text-yellow-400' : 'text-white/20'}`}>TURBO</button>
                                <div className="w-px h-2 bg-white/20" />
                                <button onClick={() => setQuickSpin(!quickSpin)} className={`text-[9px] font-black tracking-widest ${quickSpin ? 'text-green-400' : 'text-white/20'}`}>QUICK</button>
                                <div className="w-px h-2 bg-white/20" />
                                <button className="material-symbols-outlined text-white/40 text-lg">payments</button>
                            </div>

                            {/* Icons Column 2 */}
                            <div>
                                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <span className="material-symbols-outlined text-white/50 text-xl">menu</span>
                                </button>
                            </div>
                        </div>

                        {/* Financial Stats Bar */}
                        <div className="flex items-center justify-center gap-6 py-1 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-400/80 font-black text-[10px] uppercase">KREDİ</span>
                                <span className="text-white font-black font-mono text-base">₺ {balance.toLocaleString()}</span>
                            </div>
                            <div className="w-px h-3 bg-white/10" />
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-400/80 font-black text-[10px] uppercase">BAHİS</span>
                                <span className="text-white font-black font-mono text-base">₺ {betAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="text-[7px] text-white/10 font-bold uppercase tracking-[0.4em] text-center mt-1">
                            PRAGMATIC PLAY STYLE | ID: #75467157
                        </div>
                    </div>
                </div>
            </div>

            {/* Autoplay Modal (Matches Image 1) */}
            {showAutoplayModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAutoplayModal(false)} />
                    <div className="relative bg-[#0f172a] w-full max-w-lg rounded-3xl border border-white/10 shadow-3xl overflow-hidden flex flex-col p-6 animate-match-pop">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black italic tracking-tighter text-yellow-400 uppercase">{t('sweetBonanza.autoplay')}</h2>
                            <button onClick={() => {
                                playSound('click')
                                setShowAutoplayModal(false)
                            }} className="text-white/40 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Settings Checkboxes */}
                        <div className="grid grid-cols-3 gap-4 mb-10">
                            {[
                                { id: 'turbo', label: t('sweetBonanza.turbo'), state: turboSpin, set: setTurboSpin },
                                { id: 'quick', label: t('sweetBonanza.quick'), state: quickSpin, set: setQuickSpin },
                                { id: 'skip', label: t('sweetBonanza.skipScreens'), state: true, set: () => { } }
                            ].map((item) => (
                                <div key={item.id} className="flex flex-col items-center gap-2">
                                    <div
                                        onClick={() => item.set(!item.state)}
                                        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${item.state ? 'bg-green-500 border-green-400 shadow-[0_0_10px_#22c55e]' : 'bg-black/40 border-white/10'}`}
                                    >
                                        {item.state && <span className="material-symbols-outlined text-white text-xl">check</span>}
                                    </div>
                                    <span className="text-[8px] font-black text-center leading-tight tracking-widest text-white/60">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Slider (Image 1 style) */}
                        <div className="mb-10 px-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t('sweetBonanza.autospinCount')}</span>
                                <span className="text-2xl font-black italic text-white">{autoplayCount}</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="1000"
                                step="10"
                                value={autoplayCount}
                                onChange={(e) => setAutoplayCount(parseInt(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={() => {
                                setIsAutoplayActive(true)
                                setShowAutoplayModal(false)
                                handleSpin()
                            }}
                            className="bg-green-500 hover:bg-green-400 py-4 rounded-2xl text-lg font-black italic tracking-widest text-white shadow-[0_10px_20px_rgba(34,197,94,0.3)] transition-all active:scale-95"
                        >
                            {t('sweetBonanza.startAutoplay')} ({autoplayCount})
                        </button>

                        {/* Hyperplay Section (Image 1 Bottom) */}
                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center">
                            <span className="text-orange-400 font-black italic text-lg tracking-tighter mb-2">{t('sweetBonanza.hyperplayTitle')}</span>
                            <p className="text-[8px] text-white/40 text-center font-bold tracking-widest mb-4">{t('sweetBonanza.hyperplayDesc')}</p>
                            <button className="bg-orange-500/10 border border-orange-500/20 px-6 py-2 rounded-xl text-orange-400 text-[10px] font-bold tracking-widest hover:bg-orange-500/20 transition-all">
                                {t('sweetBonanza.goToHyperplay')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Better Luck Next Time Overlay */}
            {showLossAnimation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/50 animate-fade-in"></div>
                    <div className="relative text-center animate-bounce-premium">
                        <div className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-200 to-blue-400 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                            BETTER LUCK <br /> NEXT TIME!
                        </div>
                        <div className="mt-8 text-7xl md:text-9xl animate-pulse filter drop-shadow-lg">
                            🍀
                        </div>
                    </div>
                </div>
            )}

            {/* Win Celebration / Fireworks Overlay */}
            {showFireworks && <WinCelebration amount={winAmount} />}

            <style jsx>{`
                .outline-text {
                    -webkit-text-stroke: 1.5px rgba(0,0,0,0.8);
                }
                @keyframes drop-in {
                    0% { transform: translateY(-500%) scale(0.8); opacity: 0; }
                    80% { transform: translateY(5%) scale(1.02); opacity: 1; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                .animate-drop-in {
                    animation: drop-in 0.4s ease-in forwards;
                }
                @keyframes match-pop {
                    0% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.6); filter: brightness(3) drop-shadow(0 0 30px white); }
                    100% { transform: scale(0); opacity: 0; }
                }
                .animate-match-pop {
                    animation: match-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes glow-pulse {
                    0% { filter: brightness(1) drop-shadow(0 0 5px rgba(255,255,255,0.2)); }
                    50% { filter: brightness(1.3) drop-shadow(0 0 20px rgba(255,255,255,0.6)); }
                    100% { filter: brightness(1) drop-shadow(0 0 5px rgba(255,255,255,0.2)); }
                }
                .animate-glow-pulse {
                    animation: glow-pulse 1s ease-in-out infinite;
                }
                @keyframes neon-pulsate {
                    0%, 100% { border-color: rgba(255,255,255,0.3); box-shadow: 0 0 20px rgba(59,130,246,0.3); }
                    50% { border-color: rgba(59,130,246,0.8); box-shadow: 0 0 60px rgba(59,130,246,0.8), inset 0 0 20px rgba(59,130,246,0.5); }
                }
                .animate-neon-pulsate {
                    animation: neon-pulsate 2s linear infinite;
                }
                @keyframes neon-flicker-pink {
                    0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 0.99; box-shadow: 0 0 10px #ec4899, 0 0 20px #ec4899; }
                    20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.4; box-shadow: none; }
                }
                @keyframes neon-flicker-blue {
                    0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 0.99; box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6; }
                    20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.2; box-shadow: none; }
                }
                .animate-neon-flicker-pink { animation: neon-flicker-pink 4s infinite; }
                .animate-neon-flicker-blue { animation: neon-flicker-blue 5s infinite; }
                @keyframes neon-glow-text {
                    from { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #facc15, 0 0 40px #facc15; }
                    to { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #facc15, 0 0 20px #facc15; }
                }
                .animate-neon-glow-text { animation: neon-glow-text 1s ease-in-out infinite alternate; }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 1.5s linear infinite;
                }
                @keyframes flash {
                    0% { opacity: 0; }
                    10% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .animate-flash {
                    animation: flash 0.5s ease-out 3;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                @keyframes bounce-premium {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                .animate-bounce-premium {
                    animation: bounce-premium 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
