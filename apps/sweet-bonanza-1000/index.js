'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Howl } from 'howler'
import axios from 'axios'
import { useTranslation } from '@/hooks/useTranslation'
import { authAPI, betRoundAPI } from '@/lib/api'
import sweetBonanzaAPI from '@/lib/api/sweetBonanza.api'
import { logger, log } from '@/utils/logger'
import { handleError } from '@/utils/errorHandler'

// Pragmatic-style loading screen component
const PragmaticLoading = ({ progress }) => (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-center">
            <div className="mb-8">
                <div className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-pulse">
                    SWEET BONANZA
                </div>
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

// New Premium Win Screen integration
const WinCelebration = ({ amount }) => {
    const [coins, setCoins] = useState([]);
    const [show, setShow] = useState(false);
    const [rays, setRays] = useState([]);

    useEffect(() => {
        setTimeout(() => setShow(true), 100);

        // Generate rays
        const newRays = Array.from({ length: 16 }, (_, i) => ({
            id: i,
            angle: (360 / 16) * i
        }));
        setRays(newRays);

        // Generate coins
        const coinInterval = setInterval(() => {
            const batch = Array.from({ length: 3 }, () => ({
                id: Math.random(),
                left: Math.random() * 100,
                delay: Math.random() * 0.3,
                duration: 2.5 + Math.random() * 1.5,
                size: 40 + Math.random() * 30,
                spin: Math.random() > 0.5 ? 'spin' : 'spinReverse'
            }));
            setCoins(prev => [...prev, ...batch]);
        }, 200);

        const cleanupInterval = setInterval(() => {
            setCoins(prev => prev.slice(-50));
        }, 4000);

        return () => {
            clearInterval(coinInterval);
            clearInterval(cleanupInterval);
        };
    }, []);

    const getWinText = (amt) => {
        if (amt >= 1000) return 'MEGA WIN!';
        if (amt >= 500) return 'BIG WIN!';
        if (amt >= 100) return 'GREAT WIN!';
        return 'WIN!';
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden pointer-events-none">
            {/* Blurred background overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"></div>

            {/* Rotating rays */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full animate-rotate-slow">
                    {rays.map(ray => (
                        <div
                            key={ray.id}
                            className="absolute top-1/2 left-1/2 origin-left"
                            style={{
                                transform: `rotate(${ray.angle}deg)`,
                                width: '100%',
                                height: '8px'
                            }}
                        >
                            <div className="w-full h-full bg-gradient-to-r from-yellow-300/30 to-transparent"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Colorful particles */}
            <div className="absolute inset-0">
                {[...Array(40)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float-random"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    >
                        <div
                            className="rounded-full blur-sm"
                            style={{
                                width: `${8 + Math.random() * 16}px`,
                                height: `${8 + Math.random() * 16}px`,
                                backgroundColor: ['#ff6b9d', '#ffd93d', '#6bcf7f', '#a78bfa', '#60a5fa'][Math.floor(Math.random() * 5)],
                                opacity: 0.6
                            }}
                        ></div>
                    </div>
                ))}
            </div>

            {/* Confetti burst */}
            {show && [...Array(30)].map((_, i) => (
                <div
                    key={`confetti-${i}`}
                    className="absolute top-1/2 left-1/2 w-3 h-8 animate-confetti-burst"
                    style={{
                        backgroundColor: ['#ff6b9d', '#ffd93d', '#6bcf7f', '#a78bfa', '#60a5fa', '#f87171'][Math.floor(Math.random() * 6)],
                        transform: `rotate(${Math.random() * 360}deg)`,
                        animationDelay: `${Math.random() * 0.3}s`,
                        '--burst-x': `${(Math.random() - 0.5) * 800}px`,
                        '--burst-y': `${(Math.random() - 0.5) * 800}px`,
                        '--rotation': `${Math.random() * 720}deg`
                    }}
                ></div>
            ))}

            {/* Falling coins using coin.png */}
            {coins.map(coin => (
                <div
                    key={coin.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${coin.left}%`,
                        top: '-100px',
                        animation: `fall ${coin.duration}s linear forwards`,
                        animationDelay: `${coin.delay}s`,
                        width: `${coin.size}px`,
                        height: `${coin.size}px`
                    }}
                >
                    <div
                        className="w-full h-full flex items-center justify-center animate-spin"
                        style={{ animationDuration: '2s' }}
                    >
                        <img src="/games/sweet-bonanza-1000/coin.png" alt="coin" className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                </div>
            ))}

            {/* Main content - Centered text */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
                {/* Glow effect behind text */}
                <div className="absolute inset-0 blur-3xl opacity-60">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-300 animate-pulse-slow"></div>
                </div>

                <h1
                    className={`relative text-[8rem] md:text-[22rem] font-black mb-4 leading-none transform transition-all duration-700 ${show ? 'scale-100 translate-y-0 opacity-100' : 'scale-150 -translate-y-10 opacity-0'}`}
                    style={{
                        fontFamily: "'Pacifico', 'Permanent Marker', cursive",
                        background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(8px 8px 0px rgba(0, 0, 0, 0.9)) drop-shadow(-4px -4px 0px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 40px rgba(255, 215, 0, 1))',
                        letterSpacing: '0.02em',
                        animation: 'float-text 3s ease-in-out infinite'
                    }}
                >
                    {getWinText(amount)}
                </h1>

                {/* Win amount */}
                <div className={`relative transform transition-all duration-700 delay-300 ${show ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                    <div className="flex items-center justify-center gap-4 md:gap-8">
                        <img src="/games/sweet-bonanza-1000/coin.png" className="w-16 h-16 md:w-32 md:h-32 animate-bounce-coin" />
                        <span
                            className="text-7xl md:text-[10rem] font-black animate-pulse-gold leading-none"
                            style={{
                                fontFamily: "'Fredoka One', 'Arial Black', sans-serif",
                                background: 'linear-gradient(180deg, #FFE55C 0%, #FFD700 30%, #FFA500 70%, #FF8C00 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: 'drop-shadow(6px 6px 0px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 40px rgba(255, 215, 0, 1))',
                                letterSpacing: '0.05em'
                            }}
                        >
                            ₺ {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                        <img src="/games/sweet-bonanza-1000/coin.png" className="w-16 h-16 md:w-32 md:h-32 animate-bounce-coin" style={{ animationDelay: '0.2s' }} />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Permanent+Marker&family=Fredoka+One&display=swap');

                @keyframes rotate-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes float-random {
                    0%, 100% { transform: translate(0, 0); opacity: 0.6; }
                    50% { transform: translate(20px, -30px); opacity: 1; }
                }

                @keyframes confetti-burst {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
                    100% { transform: translate(var(--burst-x, 100px), var(--burst-y, -100px)) rotate(var(--rotation, 360deg)); opacity: 0; }
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }

                @keyframes pulse-gold {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                @keyframes float-text {
                    0%, 100% { transform: translateY(0px) rotate(-1deg); }
                    50% { transform: translateY(-20px) rotate(1deg); }
                }

                .animate-rotate-slow { animation: rotate-slow 20s linear infinite; }
                .animate-float-random { animation: float-random 2s ease-in-out infinite; }
                .animate-confetti-burst { animation: confetti-burst 2s ease-out forwards; }
                .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
                .animate-pulse-gold { animation: pulse-gold 1s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

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
    const [reelSpeeds, setReelSpeeds] = useState([0, 0, 0, 0, 0, 0])
    const reelSpeedsRef = useRef([0, 0, 0, 0, 0, 0])
    const [waitingForAdmin, setWaitingForAdmin] = useState(false)
    const [user, setUser] = useState(null)

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

    // Symbols - Corrected to match actual file names
    const symbols = [
        { id: 'oval', image: '/games/sweet-bonanza-1000/oval.png', multiplier: 2 },
        { id: 'grapes', image: '/games/sweet-bonanza-1000/grapes.png', multiplier: 3 },
        { id: 'watermelon', image: '/games/sweet-bonanza-1000/watermelon.png', multiplier: 4 },
        { id: 'apple', image: '/games/sweet-bonanza-1000/apple.png', multiplier: 5 },
        { id: 'plum', image: '/games/sweet-bonanza-1000/plum.png', multiplier: 6 },
        { id: 'banana', image: '/games/sweet-bonanza-1000/banana.png', multiplier: 8 },
        { id: 'heart', image: '/games/sweet-bonanza-1000/heart.png', multiplier: 10 },
        { id: 'scatter', image: '/games/sweet-bonanza-1000/scatter.png', multiplier: 0 }
    ]

    // Initialize grid (6 columns × 5 rows = 30 symbols)
    useEffect(() => {
        const initialGrid = Array(30).fill(null).map(() => symbols[Math.floor(Math.random() * (symbols.length - 1))])
        setGrid(initialGrid)
    }, [])

    // Unified user data fetching and loading simulation
    const fetchUserData = async () => {
        try {
            const response = await authAPI.me()
            const userData = response?.data || response || null
            if (userData) {
                setUser(userData)
                const userBalance = userData.balance !== undefined ? userData.balance :
                    (userData.user?.balance !== undefined ? userData.user.balance : 0)
                setBalance(userBalance)
                try { localStorage.setItem('user', JSON.stringify(userData)) } catch (e) { }
            }
        } catch (err) {
            console.error('Error fetching user data:', err)
        }
    }

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

        const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
        handleResize()
        window.addEventListener('resize', handleResize)

        fetchUserData()
        const balanceInterval = setInterval(fetchUserData, 5000)

        return () => {
            clearInterval(interval)
            clearInterval(balanceInterval)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const handleSpin = async () => {
        if (isSpinning || balance < betAmount) return

        setIsSpinning(true)
        setWinningSymbols([])
        setShowFireworks(false)
        setShowLossAnimation(false)
        setWaitingForAdmin(false)

        // Deduct bet
        setBalance(prev => prev - betAmount)

        // Reset and start all reels spinning
        reelSpeedsRef.current = [1, 1, 1, 1, 1, 1]
        setReelSpeeds([...reelSpeedsRef.current])

        try {
            let gameData;
            const isMock = localStorage.getItem('token')?.startsWith('mock');

            if (isMock) {
                setWaitingForAdmin(true)
                // --- REAL-TIME MOCK WAITING FOR ADMIN ---
                localStorage.setItem('mock-spin-request', JSON.stringify({
                    _id: 'mock-spin-' + Date.now(),
                    username: user?.username || 'MockUser',
                    betAmount: betAmount,
                    gameType: 'sweet-bonanza',
                    createdAt: new Date().toISOString()
                }))

                localStorage.removeItem('mock-game-decision')

                let decision = null
                const pollStartTime = Date.now()
                // Poll for up to 30 seconds
                while (!decision && Date.now() - pollStartTime < 30000) {
                    await new Promise(resolve => setTimeout(resolve, 500))
                    decision = localStorage.getItem('mock-game-decision')
                }

                localStorage.removeItem('mock-game-decision')
                localStorage.removeItem('mock-spin-request')
                setWaitingForAdmin(false)

                // Generate result based on decision
                const resultSymbols = ['heart', 'apple', 'banana', 'grapes', 'plum', 'watermelon', 'oval', 'pentagon', 'square'];
                let finalWinningIndices = []
                let localWinAmount = 0

                // 2D Reels [6 columns][5 rows]
                let finalReels = Array(6).fill(null).map(() => Array(5).fill(null).map(() => symbols[Math.floor(Math.random() * (symbols.length - 1))].id))

                if (decision === 'win') {
                    localWinAmount = betAmount * (Math.floor(Math.random() * 8) + 3)
                    const winSymbolId = resultSymbols[Math.floor(Math.random() * 7)] // Avoid scatter for simplicity in mock win
                    const winCount = Math.floor(Math.random() * 5) + 8;
                    for (let i = 0; i < winCount; i++) {
                        const r = Math.floor(Math.random() * 6);
                        const s = Math.floor(Math.random() * 5);
                        finalReels[r][s] = winSymbolId;
                    }
                }

                gameData = {
                    reels: finalReels,
                    winAmount: localWinAmount
                }
            } else {
                // Real API Call
                setWaitingForAdmin(true)
                const response = await sweetBonanzaAPI.playGame(betAmount);
                gameData = response.data?.data || response.data;
                setWaitingForAdmin(false)
            }

            // Sync symbols from API result (strings) back to symbol objects
            const apiReels = gameData.reels; // Expecting [6][5]
            const finalFlatGrid = Array(30).fill(null);

            // Map 2D API reels back to flat grid Row-major (as SB1000 renders)
            // API: reels[col][row] -> Grid: grid[row*6 + col]
            for (let c = 0; c < 6; c++) {
                for (let r = 0; r < 5; r++) {
                    const symId = apiReels[c][r];
                    finalFlatGrid[r * 6 + c] = symbols.find(s => s.id === symId) || symbols[0];
                }
            }

            // --- STAGGERED STOP ANIMATION (Fast to Slow feel) ---
            for (let i = 0; i < 6; i++) {
                // Small delay between reel stops for "fast to slow" sequential stopping
                await new Promise(resolve => setTimeout(resolve, 400 + i * 100));

                reelSpeedsRef.current[i] = 0;
                setReelSpeeds([...reelSpeedsRef.current]);

                // Update only this reel's symbols in the main grid
                setGrid(prev => {
                    const next = [...prev];
                    return next;
                });
            }

            setTimeout(() => {
                setIsSpinning(false);
                setWinAmount(gameData.winAmount);
                if (gameData.winAmount > 0) {
                    setBalance(prev => prev + gameData.winAmount);
                    checkWinAfterStop(gameData, finalFlatGrid);
                } else {
                    setShowLossAnimation(true);
                    setTimeout(() => setShowLossAnimation(false), 2000);
                }
            }, 500);

        } catch (error) {
            console.error('Spin error:', error);
            setIsSpinning(false);
            setReelSpeeds([0, 0, 0, 0, 0, 0]);
            reelSpeedsRef.current = [0, 0, 0, 0, 0, 0];
        }
    }

    const checkWinAfterStop = (gameData, finalGrid) => {
        // Calculate which items to highlight based on counts >= 8
        const symbolCounts = {}
        finalGrid.forEach((symbol, idx) => {
            if (symbol) {
                if (!symbolCounts[symbol.id]) symbolCounts[symbol.id] = []
                symbolCounts[symbol.id].push(idx)
            }
        })

        let winIndices = []
        Object.entries(symbolCounts).forEach(([symbolId, indices]) => {
            if (indices.length >= 8 && symbolId !== 'scatter') {
                winIndices.push(...indices)
            }
        })

        if (winIndices.length > 0 || gameData.winAmount > 0) {
            setWinningSymbols(winIndices)
            setLastWinColor(gameData.winAmount >= betAmount * 5 ? '#f59e0b' : '#10b981')
            setShowFireworks(true)
            setTimeout(() => setShowFireworks(false), 3000)
        }
    }

    const handleBuyFreeSpins = (type) => {
        const cost = type === 'regular' ? betAmount * 100 : betAmount * 500
        if (balance < cost) return

        setBalance(prev => prev - cost)
        setIsFreeSpins(true)
        setFreeSpinType(type)
        setFreeSpinsRemaining(type === 'regular' ? 10 : 15)
    }

    const adjustBet = (delta) => {
        if (isSpinning) return
        setBetAmount(prev => Math.max(0.20, Math.min(1000, prev + delta)))
    }

    if (pageLoading) return <PragmaticLoading progress={loadingProgress} />

    return (
        <div className="h-screen overflow-hidden bg-[#0f172a] text-white flex flex-col font-sans select-none relative">
            {/* Background */}
            <div className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-60 scale-110"
                style={{ backgroundImage: 'url("/games/sweet-bonanza-1000/background.png")' }} />
            <div className="fixed inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-pink-500/20 pointer-events-none" />

            {/* Top Section - Header (fixed height) */}
            <div className="flex-shrink-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
                    <div className="grid grid-cols-3 items-center gap-2 md:gap-4">
                        {/* Left: Scatter Info */}
                        <div className="flex flex-col gap-1 md:gap-2">
                            <div className="bg-black/60 backdrop-blur-md rounded-lg md:rounded-xl p-1.5 md:p-2 border border-pink-500/30 shadow-lg w-fit">
                                <span className="text-xs sm:text-sm md:text-base font-black text-pink-400 italic">4 X SCATTER</span>
                                <div className="text-[6px] sm:text-[7px] md:text-[8px] uppercase font-bold text-white/60">FREE SPINS</div>
                            </div>
                        </div>

                        {/* Center: Remaining Spins */}
                        <div className="flex justify-center">
                            {isFreeSpins && (
                                <div className="bg-gradient-to-b from-purple-500 to-purple-800 rounded-lg md:rounded-xl p-2 md:p-3 border border-white/30 md:border-2 shadow-lg">
                                    <div className="text-[6px] sm:text-[7px] md:text-[8px] uppercase font-black text-white/60 tracking-widest text-center">Remaining Spins</div>
                                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-white italic text-center">{freeSpinsRemaining}</div>
                                </div>
                            )}
                        </div>

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

            {/* Middle Section - Game Grid (with margins) */}
            <div className="flex-1 flex items-center justify-center py-4 px-2 sm:px-4 my-4 relative z-30 overflow-hidden">
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

                        {/* Center: Game Grid - Responsive Size (final optimization) */}
                        <div className="flex flex-col items-center w-full md:scale-[0.68] lg:scale-x-[0.76] lg:scale-y-[0.66]">
                            <div className="relative bg-blue-400/20 backdrop-blur-xl rounded-2xl md:rounded-3xl p-1 sm:p-1 md:p-2 lg:p-2 border-[0.5px] md:border-[1px] lg:border-[1.2px] border-white/30 shadow-2xl ring-1 ring-blue-400/50 animate-neon-pulsate">
                                {/* Admin Waiting Overlay */}
                                {(waitingForAdmin || (isSpinning && reelSpeeds[0] > 0 && !grid[0]?.image)) && (
                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl md:rounded-3xl pointer-events-none">
                                        <div className="bg-black/80 p-4 md:p-8 rounded-3xl border-2 border-yellow-400/50 animate-pulse shadow-[0_0_50px_rgba(255,215,0,0.3)]">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-yellow-400 font-black text-xl md:text-3xl italic tracking-widest text-center">HOLD TIGHT!</span>
                                                <span className="text-white font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] text-center opacity-80">Fruits and Candies are being ready for you... 🍭</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5 bg-black/70 rounded-xl md:rounded-2xl p-1 sm:p-1 md:p-2 lg:p-2 shadow-inner border border-white/10 overflow-hidden aspect-[6/5] w-fit">
                                    {[0, 1, 2, 3, 4, 5].map(colIdx => (
                                        <div key={colIdx} className="h-full relative overflow-hidden">
                                            <div className={`flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-5 ${reelSpeeds[colIdx] > 0 ? 'animate-reel-scroll' : ''}`}>
                                                {/* In spinning mode, we show duplicated sets for infinite loop feel */}
                                                {(reelSpeeds[colIdx] > 0 ?
                                                    [...Array(3)].flatMap(() => [0, 1, 2, 3, 4].map(r => grid[r * 6 + colIdx])) :
                                                    [0, 1, 2, 3, 4].map(r => grid[r * 6 + colIdx])
                                                ).map((symbol, rowIdx) => {
                                                    const actualIdx = (rowIdx % 5) * 6 + colIdx
                                                    const isWinning = winningSymbols.includes(actualIdx) && reelSpeeds[colIdx] === 0
                                                    return (
                                                        <div key={rowIdx} className={`relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 flex items-center justify-center transition-all duration-500 ${isWinning ? 'animate-match-pop z-20' : ''}`}>
                                                            {symbol && (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <img src={symbol.image} alt={symbol.id} className={`w-[95%] h-[95%] object-contain drop-shadow-lg ${isWinning ? 'animate-glow-pulse scale-110' : ''}`} />
                                                                    {isWinning && <div className="absolute inset-0 rounded-full animate-ping pointer-events-none opacity-40" style={{ backgroundColor: lastWinColor, boxShadow: `0 0 40px ${lastWinColor}` }} />}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
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

            {/* Bottom Section - Footer (fixed height with margin) */}
            <div className="flex-shrink-0 z-40 pointer-events-none mb-2">
                <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pointer-events-auto">
                    {/* Spin Controls - Ultra Compact */}
                    <div className="flex items-center justify-center gap-1 sm:gap-2 py-0.5 bg-black/90 backdrop-blur-md rounded-t-xl">
                        <button onClick={() => adjustBet(-0.50)} className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex items-center justify-center bg-white/10 rounded-full border border-white/20 text-white hover:bg-white/30 transition-all active:scale-90">
                            <span className="material-symbols-outlined text-base sm:text-lg md:text-xl font-black">remove</span>
                        </button>

                        <button onClick={handleSpin} disabled={isSpinning || balance < betAmount}
                            className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all
                                ${isSpinning ? 'opacity-50' : 'hover:scale-110 active:scale-90 shadow-[0_0_20px_rgba(255,255,255,0.2)]'}
                                bg-gradient-to-b from-white via-slate-100 to-slate-400 border-2 border-black/40`}
                            style={{ outline: '1px solid #10b981' }}>
                            <span className={`material-symbols-outlined text-2xl sm:text-3xl md:text-3xl font-black text-slate-800 transition-all duration-500 ${isSpinning ? 'rotate-[360deg] animate-spin-slow' : 'rotate-0'}`}>
                                sync
                            </span>
                        </button>

                        <button onClick={() => adjustBet(0.50)} className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex items-center justify-center bg-white/10 rounded-full border border-white/20 text-white hover:bg-white/30 transition-all active:scale-90">
                            <span className="material-symbols-outlined text-base sm:text-lg md:text-xl font-black">add</span>
                        </button>
                    </div>

                    {/* Control Bar - Minimal */}
                    <div className="flex items-center justify-between py-0.5 border-t border-white/5 bg-black/90 backdrop-blur-md">
                        <div className="flex items-center gap-1">
                            <button className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white/50 text-sm sm:text-base md:text-lg">info</span>
                            </button>
                            <button onClick={() => setShowAutoplayModal(true)} className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white/50 text-sm sm:text-base md:text-lg">autorenew</span>
                            </button>
                        </div>

                        {/* Center Toggles */}
                        <div className="flex items-center gap-1 sm:gap-2 bg-white/5 px-1.5 sm:px-2 py-0.5 rounded-full border border-white/10">
                            <button onClick={() => setTurboSpin(!turboSpin)} className={`text-[7px] sm:text-[8px] font-black tracking-widest ${turboSpin ? 'text-yellow-400' : 'text-white/20'}`}>TURBO</button>
                            <div className="w-px h-2 bg-white/20" />
                            <button onClick={() => setQuickSpin(!quickSpin)} className={`text-[7px] sm:text-[8px] font-black tracking-widest ${quickSpin ? 'text-green-400' : 'text-white/20'}`}>QUICK</button>
                        </div>

                        {/* Right Icon */}
                        <button className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-white/50 text-sm sm:text-base md:text-lg">menu</span>
                        </button>
                    </div>

                    {/* Stats Bar - Minimal */}
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-0.5 border-t border-white/5 bg-black/90 backdrop-blur-md rounded-b-xl">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            <span className="text-yellow-400/80 font-black text-[6px] sm:text-[7px] uppercase tracking-widest">KREDİ</span>
                            <span className="text-white font-black font-mono text-[10px] sm:text-xs">₺ {balance.toLocaleString()}</span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            <span className="text-yellow-400/80 font-black text-[6px] sm:text-[7px] uppercase tracking-widest">BAHİS</span>
                            <span className="text-white font-black font-mono text-xs sm:text-sm">₺ {betAmount.toLocaleString()}</span>
                        </div>
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
                @keyframes reel-scroll {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-33.33%); }
                }
                .animate-reel-scroll { 
                    animation: reel-scroll 0.5s linear infinite; 
                    will-change: transform;
                }
                
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

                @keyframes bounce-coin {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }
                .animate-bounce-coin { animation: bounce-coin 1s ease-in-out infinite; }
            `}</style>
        </div>
    )
}
