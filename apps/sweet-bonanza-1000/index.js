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
            <div className="mb-8 px-4 py-8">
                <div className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-pulse"
                    style={{ fontFamily: "'Enchanted Land', cursive", lineHeight: '1.4', padding: '0.2em 0' }}>
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
    const [balance, setBalance] = useState(0)
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
    const [showSpinMessage, setShowSpinMessage] = useState(false)
    const [currentSpinMessage, setCurrentSpinMessage] = useState('')

    const playerSpinMessages = [
        "LET'S BEGIN!",
        "GOOD LUCK!",
        "LET'S WIN!",
        "BIG WIN AWAITS!",
        "SPIN AND WIN!",
        "FEEL THE LUCK!",
        "HERE WE GO!",
        "SWEET SUCCESS!",
        "CANDY FEVER!",
        "GO FOR GOLD!"
    ]

    const spectatorSpinMessages = [
        "JUST WATCHING?",
        "JOIN THE ACTION!",
        "WHO WILL WIN?",
        "NEXT ROUND IS YOURS!",
        "FEEL THE VIBE!"
    ]

    // Lobby / Universal Session state
    const [lobbyPhase, setLobbyPhase] = useState('BETTING')
    const [lobbyTimeLeft, setLobbyTimeLeft] = useState(10)
    const [lobbyRoundId, setLobbyRoundId] = useState(null)
    const [userBetSide, setUserBetSide] = useState(null)
    const [hasBetInCurrentRound, setHasBetInCurrentRound] = useState(false)
    const [lastProcessedRoundId, setLastProcessedRoundId] = useState(null)
    const [lobbyViewersCount, setLobbyViewersCount] = useState(0)
    const [lobbyBetsTotals, setLobbyBetsTotals] = useState({ win: 0, loss: 0 })
    const [lobbyTopWinners, setLobbyTopWinners] = useState([])
    const [lobbyRoundCycle, setLobbyRoundCycle] = useState(1)
    const [lobbyBetsCount, setLobbyBetsCount] = useState(0)
    const [lobbyAdminDecision, setLobbyAdminDecision] = useState(null)

    // Refs for stable access in intervals (Crucial for avoiding stale closures)
    const lobbyRoundIdRef = useRef(null)
    const lastProcessedRoundIdRef = useRef(null)
    const lobbyPhaseRef = useRef('BETTING')
    const spinningRoundIdRef = useRef(null)
    const userBetSideRef = useRef(null)
    const betAmountRef = useRef(3.50)
    const hasBetInCurrentRoundRef = useRef(false)

    // Audio refs
    const sounds = useRef({
        bgm: null,
        win: null,
        loss: null,
        spin: null,
        countdown: null
    })

    // Initialize sounds
    useEffect(() => {
        sounds.current.bgm = new Howl({
            src: ['/assets/bgm/sweet-bonanza-bgm-1.mp3'],
            loop: true,
            volume: 0.3,
            html5: true
        })
        sounds.current.win = new Howl({
            src: ['/assets/bgm/sweet-bonanza-win-sound-effect.mp3'],
            volume: 0.66,
            loop: true,
            html5: false
        })
        sounds.current.loss = new Howl({
            src: ['/assets/bgm/sweet-bonanza-loss-sound-effect.mp3'],
            volume: 0.66,
            html5: false
        })
        sounds.current.spin = new Howl({
            src: ['/assets/bgm/sweet-bonanza-slot-scroll-sound-effect.mp3'],
            loop: true,
            volume: 0.44,
            html5: false
        })
        sounds.current.countdown = new Howl({
            src: ['/assets/bgm/sweet-bonanza-countdown-sound-effect.mp3'],
            volume: 0.44,
            html5: false
        })

        const playBgm = () => {
            if (sounds.current.bgm && !sounds.current.bgm.playing()) {
                sounds.current.bgm.play()
            }
        }
        document.addEventListener('click', playBgm, { once: true })

        return () => {
            document.removeEventListener('click', playBgm)
            Object.values(sounds.current).forEach(sound => {
                if (sound) sound.unload()
            })
        }
    }, [])

    // Slot scrolling sound
    useEffect(() => {
        if (isSpinning) {
            sounds.current.spin?.play()
        } else {
            sounds.current.spin?.stop()
        }
    }, [isSpinning])

    // Win/Loss sounds
    useEffect(() => {
        if (showFireworks) {
            sounds.current.win?.play()
        } else {
            sounds.current.win?.stop()
        }
    }, [showFireworks])

    useEffect(() => {
        if (showLossAnimation) {
            sounds.current.loss?.play()
        }
    }, [showLossAnimation])

    // Countdown sound logic
    useEffect(() => {
        if (lobbyPhase === 'BETTING') {
            // Ticks all the time during betting
            sounds.current.countdown?.play()
        } else if (lobbyTimeLeft <= 3 && lobbyTimeLeft > 0) {
            // Last 2-3 seconds during other phases
            sounds.current.countdown?.play()
        }
    }, [lobbyTimeLeft, lobbyPhase])

    useEffect(() => {
        lobbyRoundIdRef.current = lobbyRoundId
    }, [lobbyRoundId])

    useEffect(() => {
        lastProcessedRoundIdRef.current = lastProcessedRoundId
    }, [lastProcessedRoundId])

    useEffect(() => {
        lobbyPhaseRef.current = lobbyPhase
    }, [lobbyPhase])

    useEffect(() => {
        userBetSideRef.current = userBetSide
    }, [userBetSide])

    useEffect(() => {
        betAmountRef.current = betAmount
    }, [betAmount])

    useEffect(() => {
        hasBetInCurrentRoundRef.current = hasBetInCurrentRound
    }, [hasBetInCurrentRound])
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
                console.log('[DEBUG] Fetched User Balance:', userData.balance);
                console.log('[DEBUG] User Role:', userData.role);
                console.log('[DEBUG] Full User Data:', userData);
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

        // Background Music is now handled by Howl refs above

        fetchUserData()
        const balanceInterval = setInterval(fetchUserData, 5000)

        // Lobby Polling (Stable Interval)
        const pollLobby = async () => {
            try {
                const response = await sweetBonanzaAPI.getSession();
                const session = response.data.data;

                if (!session) return;

                setLobbyPhase(session.phase);
                console.log('[DEBUG] Lobby Phase:', session.phase);
                setLobbyTimeLeft(session.timeLeft);
                setLobbyViewersCount(session.viewersCount || 0);
                setLobbyBetsTotals(session.betsTotals || { win: 0, loss: 0 });
                setLobbyRoundCycle(session.roundCycle || 1);
                setLobbyBetsCount(session.betsCount || 0);
                setLobbyAdminDecision(session.adminDecision || null);

                // Always sync Round ID to avoid getting "stuck" when joining mid-game
                if (session.roundId !== lobbyRoundIdRef.current) {
                    if (session.phase === 'BETTING') {
                        // Reset state for new round
                        setHasBetInCurrentRound(false);
                        hasBetInCurrentRoundRef.current = false;
                        setUserBetSide(null);
                        userBetSideRef.current = null;
                        setWinningSymbols([]);
                        setShowFireworks(false);
                        setShowLossAnimation(false);
                        setWinAmount(0);
                        setLobbyTopWinners([]);
                    }
                    setLobbyRoundId(session.roundId);
                    lobbyRoundIdRef.current = session.roundId;
                }

                if (session.phase === 'SPINNING') {
                    if (session.roundId !== spinningRoundIdRef.current && session.roundId !== lastProcessedRoundIdRef.current) {
                        spinningRoundIdRef.current = session.roundId;
                        startLobbySpin();
                    }
                }

                if (session.phase === 'RESULT' && session.result && session.roundId !== lastProcessedRoundIdRef.current) {
                    processLobbyResult(session.result, session.roundId);
                } else if (session.phase === 'RESULT' && !session.result && isSpinning) {
                    // Safety: stop spinning if server is in result but has no result data yet
                    setIsSpinning(false);
                    setReelSpeeds([0, 0, 0, 0, 0, 0]);
                }

            } catch (err) {
                console.error('Lobby poll error:', err);
            }
        };

        const lobbyInterval = setInterval(pollLobby, 1000);
        pollLobby();

        return () => {
            clearInterval(interval)
            clearInterval(balanceInterval)
            clearInterval(lobbyInterval)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const startLobbySpin = () => {
        setIsSpinning(true);
        setReelSpeeds([1, 1, 1, 1, 1, 1]);
        reelSpeedsRef.current = [1, 1, 1, 1, 1, 1];

        // Trigger random spin message - use Ref for latest value
        const messages = hasBetInCurrentRoundRef.current ? playerSpinMessages : spectatorSpinMessages;
        setCurrentSpinMessage(messages[Math.floor(Math.random() * messages.length)]);
        setShowSpinMessage(true);
        setTimeout(() => setShowSpinMessage(false), 1200);
    };

    const processLobbyResult = async (result, roundId) => {
        const currentBetSide = userBetSideRef.current;
        const currentBetAmount = betAmountRef.current;

        console.log('[RESULT] CRITICAL CHECK:', {
            roundId,
            serverOutcome: result.outcome,
            localUserBetSide: currentBetSide,
            match: currentBetSide === result.outcome
        });

        setLastProcessedRoundId(roundId);
        lastProcessedRoundIdRef.current = roundId; // Update ref immediately
        setLobbyTopWinners(result.topWinners || []);

        // Sync reels
        const finalFlatGrid = Array(30).fill(null);
        for (let c = 0; c < 6; c++) {
            for (let r = 0; r < 5; r++) {
                const symId = result.reels[c][r];
                finalFlatGrid[r * 6 + c] = symbols.find(s => s.id === symId) || symbols[0];
            }
        }
        setGrid(finalFlatGrid);

        // Stop reels sequentially
        for (let i = 0; i < 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 300 + i * 100)); // Adjusted delay
            reelSpeedsRef.current[i] = 0;
            setReelSpeeds([...reelSpeedsRef.current]);
        }

        setTimeout(() => {
            setIsSpinning(false);

            if (currentBetSide === result.outcome) {
                console.log('[RESULT] => TRIGGERING WIN SCREEN');
                setWinAmount(currentBetAmount * 2);
                setShowFireworks(true);
                fetchUserData(); // Refresh balance
                setTimeout(() => setShowFireworks(false), 9000); // Adjusted duration
            } else if (currentBetSide) {
                console.log('[RESULT] => TRIGGERING LOSS SCREEN');
                setShowLossAnimation(true);
                setTimeout(() => setShowLossAnimation(false), 9000); // Adjusted duration
            } else {
                console.log('[RESULT] => VIEWER ONLY (NO BET)');
            }
        }, 500);
    };

    const handlePlaceLobbyBet = async (side) => {
        console.log('[BET] Attempting to place bet:', { side, hasBetInCurrentRound, lobbyPhase, balance, betAmount });

        if (lobbyPhase !== 'BETTING') {
            console.log('[BET] Bet blocked: Not in BETTING phase');
            return;
        }

        // Allow re-choice: check if balance is enough (adding back old bet if exists)
        // Note: we'll use a simplified check here, server does the strict check
        if (balance < betAmount && !hasBetInCurrentRound) {
            console.log('[BET] Bet blocked: Insufficient balance');
            alert('Insufficient balance');
            return;
        }

        try {
            console.log('[BET] Sending bet to server:', { betAmount, side });
            const response = await sweetBonanzaAPI.placeLobbyBet(betAmount, side);

            console.log('[BET] Bet successful:', response.data);
            setUserBetSide(side);
            setHasBetInCurrentRound(true);
            fetchUserData(); // Immediate balance refresh
        } catch (err) {
            console.error('[BET] Bet error:', err);
            alert(err.response?.data?.message || 'Failed to place bet');
        }
    };

    const handleAdminDecision = async (decision) => {
        try {
            await sweetBonanzaAPI.submitAdminDecision(decision);
            console.log(`Admin decision sent: ${decision}`);
        } catch (err) {
            console.error('Admin decision failed:', err);
            alert('Failed to send admin decision');
        }
    }

    const handleSpin = () => {
        // Disabled for lobby mode
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
        setBetAmount(prev => Math.max(0.20, Math.min(1000, prev + delta)))
    }

    if (pageLoading) return <PragmaticLoading progress={loadingProgress} />

    return (
        <div className="h-screen h-[100dvh] overflow-hidden bg-[#0f172a] text-white flex flex-col font-sans select-none relative">
            {/* Background */}
            <div className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-60 scale-110"
                style={{ backgroundImage: 'url("/games/sweet-bonanza-1000/background.png")' }} />

            {/* Admin Popup (Only for admins during spinning) */}
            {user?.role === 'admin' && lobbyPhase === 'SPINNING' && (
                <div className="fixed top-20 right-4 z-[200] bg-black/90 backdrop-blur-xl p-6 rounded-3xl border-2 border-yellow-400 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-80 animate-in slide-in-from-right duration-500">
                    <div className="flex flex-col gap-4">
                        <div className="text-center">
                            <h3 className="text-yellow-400 font-black italic text-xl">ADMIN CONTROL</h3>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Select Round Outcome</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/10">
                            <div className="text-center">
                                <p className="text-green-400 font-black text-lg">₺ {lobbyBetsTotals.win.toLocaleString()}</p>
                                <p className="text-[8px] text-white/50">WIN SIDE BETS</p>
                            </div>
                            <div className="text-center">
                                <p className="text-red-400 font-black text-lg">₺ {lobbyBetsTotals.loss.toLocaleString()}</p>
                                <p className="text-[8px] text-white/50">LOSS SIDE BETS</p>
                            </div>
                        </div>

                        <div className="flex justify-between text-[10px] font-bold text-white/60">
                            <span>PLAYERS: {lobbyBetsCount}</span>
                            <span>WATCHING: {lobbyViewersCount}</span>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => handleAdminDecision('win')}
                                className={`flex-1 py-3 rounded-xl font-black italic shadow-lg transition-all hover:scale-105 border-2 ${lobbyAdminDecision === 'win'
                                    ? 'bg-green-500 border-white text-white scale-105 shadow-green-500/50'
                                    : 'bg-green-600 border-transparent hover:bg-green-500 text-white/80'
                                    }`}
                            >
                                {lobbyAdminDecision === 'win' ? 'WIN ✓' : 'WIN'}
                            </button>
                            <button
                                onClick={() => handleAdminDecision('loss')}
                                className={`flex-1 py-3 rounded-xl font-black italic shadow-lg transition-all hover:scale-105 border-2 ${lobbyAdminDecision === 'loss'
                                    ? 'bg-red-500 border-white text-white scale-105 shadow-red-500/50'
                                    : 'bg-red-600 border-transparent hover:bg-red-500 text-white/80'
                                    }`}
                            >
                                {lobbyAdminDecision === 'loss' ? 'LOSS ✓' : 'LOSS'}
                            </button>
                        </div>

                        <div className="text-center mt-2">
                            <p className="text-[10px] text-yellow-500/80 font-bold">
                                {lobbyRoundCycle === 1 ? 'ALGO: ENFORCING MAJORITY LOSS (R1)' :
                                    lobbyRoundCycle === 5 ? 'ALGO: ENFORCING MAJORITY WIN (R5)' :
                                        'ALGO: ANTI-MAJORITY ACTIVE'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Viewer Screen: Live Winners List (Only for non-players) */}
            {lobbyPhase === 'RESULT' && !userBetSide && !isSpinning && lobbyTopWinners.length > 0 && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0f071a]/95 backdrop-blur-2xl animate-fade-in" />

                    <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#2d1b4e] to-[#12081d] rounded-[3rem] border-2 border-yellow-400/30 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in duration-500">
                        {/* Header Section */}
                        <div className="relative py-8 px-6 text-center border-b border-white/5 bg-white/2">
                            <div className="absolute top-4 left-6 flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Result</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-600 filter drop-shadow-xl">
                                LIVE WINNERS
                            </h2>
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                    <span className="material-symbols-outlined text-xs text-blue-400">group</span>
                                    <span className="text-[10px] font-bold text-white/60">{lobbyViewersCount} Watching</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                    <span className="material-symbols-outlined text-xs text-yellow-500">history</span>
                                    <span className="text-[10px] font-bold text-white/60">Round #{lobbyRoundId?.slice(-6)}</span>
                                </div>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="p-6 md:p-10">
                            <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {lobbyTopWinners.map((winner, idx) => (
                                    <div key={idx}
                                        className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${winner.isReal
                                            ? 'bg-yellow-400/10 border-yellow-400/30 hover:bg-yellow-400/15'
                                            : 'bg-white/2 border-white/5 hover:bg-white/5'
                                            }`}
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black italic shadow-inner ${idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-600 text-black' :
                                                idx === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black' :
                                                    idx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-black' :
                                                        'bg-white/5 text-white/40'
                                                }`}>
                                                #{idx + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-black tracking-tight ${winner.isReal ? 'text-yellow-400' : 'text-white/70'}`}>
                                                    {winner.id}
                                                </span>
                                                <span className="text-[8px] uppercase tracking-widest font-bold text-white/20">
                                                    {winner.isReal ? 'Verified Player' : 'Pro Player'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black italic text-green-400 tracking-tighter group-hover:scale-110 transition-transform">
                                                ₺ {winner.amount.toLocaleString()}
                                            </span>
                                            {winner.isReal && (
                                                <span className="text-[8px] text-yellow-500/50 font-black animate-pulse">BIG WIN</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => router.push('/deposit')}
                                className="w-full mt-10 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 py-5 rounded-[2rem] text-black font-black text-2xl italic shadow-[0_10px_40px_rgba(251,191,36,0.2)] hover:shadow-[0_15px_60px_rgba(251,191,36,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all group"
                            >
                                <span className="flex items-center justify-center gap-3">
                                    JOIN THE WINNERS!
                                    <span className="material-symbols-outlined font-black group-hover:translate-x-2 transition-transform">trending_up</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-pink-500/20 pointer-events-none" />

            {/* Top Section - Header (fixed height) */}
            <div className="flex-shrink-0 z-50 bg-transparent p-0"
                style={{
                    transform: 'scaleX(0.92) scaleY(0.828)', /* 0.92 * 0.9 = 0.828 for 10% height reduction */
                    transformOrigin: 'top center',
                    marginTop: '-8px' /* -5px from before + -3px as requested */
                }}>
                <div className="mx-auto w-[110%] md:w-[92%] lg:w-[102%] flex items-center justify-center m-0 p-0">
                    <div className="w-full overflow-visible font-['Enchanted_Land']">
                        <h1
                            className="game-header-text w-full text-center text-[2.8rem] sm:text-[3.5rem] md:text-[5.8rem] font-normal italic animate-pulse px-2"
                            style={{
                                fontFamily: "'Enchanted Land', cursive",
                                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(4px 4px 2px rgba(0, 0, 0, 0.8))',
                                lineHeight: '1.17',
                                padding: '0.15em 0',
                                position: 'relative'
                            }}
                        >
                            Sweet Bonanza
                        </h1>
                    </div>
                </div>
            </div>

            {/* Middle Section - Game Grid (with margins) */}
            <div className="flex-1 flex items-center justify-center py-2 px-2 sm:px-4 my-2 relative z-45 overflow-hidden max-h-full">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-10">

                        {/* Left Sidebar: Lobby Betting (Visible on all screens) */}
                        <div className="lobby-betting-controls flex flex-col gap-2 md:gap-3 w-full lg:w-48 px-4 lg:px-0">
                            <div className="text-center mb-1">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Select Outcome</span>
                            </div>
                            <div className="flex flex-row gap-2 w-full">
                                <button
                                    onClick={() => handlePlaceLobbyBet('win')}
                                    disabled={lobbyPhase !== 'BETTING'}
                                    className={`flex-1 relative overflow-hidden py-3 md:py-4 rounded-xl md:rounded-2xl transform transition-all duration-300 border-2 ${userBetSide === 'win'
                                        ? 'bg-green-600 border-green-400 font-bold shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                        : 'bg-green-900/40 border-green-500/30 hover:bg-green-800/60'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <span className="text-lg md:text-xl font-black text-white italic tracking-tighter">WIN</span>
                                    {userBetSide === 'win' && <div className="absolute top-0 right-1 text-[6px] font-black text-white bg-green-400 px-1 rounded">ACTIVE</div>}
                                </button>

                                <button
                                    onClick={() => handlePlaceLobbyBet('loss')}
                                    disabled={lobbyPhase !== 'BETTING'}
                                    className={`flex-1 relative overflow-hidden py-3 md:py-4 rounded-xl md:rounded-2xl transform transition-all duration-300 border-2 ${userBetSide === 'loss'
                                        ? 'bg-red-600 border-red-400 font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                        : 'bg-red-900/40 border-red-500/30 hover:bg-red-800/60'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <span className="text-lg md:text-xl font-black text-white italic tracking-tighter">LOSS</span>
                                    {userBetSide === 'loss' && <div className="absolute top-0 right-1 text-[6px] font-black text-white bg-red-400 px-1 rounded">ACTIVE</div>}
                                </button>
                            </div>

                            <div className="mt-2 md:mt-4 grid grid-cols-2 gap-2">
                                <button onClick={() => adjustBet(1)}
                                    className="bg-yellow-500/20 border border-yellow-500/50 py-2 rounded-lg md:rounded-xl text-yellow-500 font-bold hover:bg-yellow-500/40 transition-colors text-xs md:text-base">
                                    + ₺1
                                </button>
                                <button onClick={() => adjustBet(-1)}
                                    className="bg-yellow-500/20 border border-yellow-500/50 py-2 rounded-lg md:rounded-xl text-yellow-500 font-bold hover:bg-yellow-500/40 transition-colors text-xs md:text-base">
                                    - ₺1
                                </button>
                            </div>
                        </div>

                        {/* Center: Game Grid - Responsive Size (final optimization) */}
                        <div className="game-grid-container flex flex-col items-center w-full md:scale-[0.68] lg:scale-x-[0.76] lg:scale-y-[0.66]">
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

                            {/* Status Ticker Removed */}

                            {/* Mobile Buy Buttons removed for lobby mode */}
                        </div>

                        {/* Right Spacer to balance the layout and keep the grid centered in landscape/desktop */}
                        <div className="hidden lg:block w-48 flex-shrink-0" aria-hidden="true" />

                    </div>
                </div>
            </div>

            {/* Bottom Section - Footer (fixed height) */}
            <div className="game-footer flex-shrink-0 z-40 pointer-events-none">
                <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pointer-events-auto">
                    {/* Lobby Controls - Universal Session */}
                    <div className="flex flex-col items-center justify-center py-2 bg-black/95 backdrop-blur-xl rounded-t-2xl border-x border-t border-white/10 relative overflow-hidden group">
                        {/* Phase Indicators */}
                        <div className="flex gap-4 mb-3 relative z-10">
                            {['BETTING', 'SPINNING', 'RESULT'].map((phase) => (
                                <div key={phase} className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest transition-all duration-500 border ${lobbyPhase === phase
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-white/20 shadow-[0_0_15px_rgba(236,72,153,0.4)] scale-110'
                                    : 'bg-white/5 text-white/20 border-transparent'
                                    }`}>
                                    {phase === 'BETTING' && lobbyPhase === 'BETTING' && <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-ping" />}
                                    {phase}
                                </div>
                            ))}
                        </div>

                        {/* Timer & Bet Info */}
                        <div className="flex items-center gap-6 relative z-10">
                            <div className={`flex items-center gap-3 px-8 py-3 rounded-2xl border-2 transition-all duration-500 shadow-2xl ${lobbyPhase === 'BETTING'
                                ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                                : 'bg-black/40 border-white/10'
                                }`}>
                                <span className={`material-symbols-outlined text-2xl ${lobbyPhase === 'SPINNING' ? 'animate-spin-slow text-yellow-500' : 'text-blue-400'}`}>
                                    {lobbyPhase === 'BETTING' ? 'timer' : lobbyPhase === 'SPINNING' ? 'settings_backup_restore' : 'analytics'}
                                </span>
                                <span className="text-3xl font-black text-white italic tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                    00:{lobbyTimeLeft.toString().padStart(2, '0')}
                                </span>
                            </div>

                            {hasBetInCurrentRound && (
                                <div className="flex flex-col items-center animate-bounce-premium border-l border-white/10 pl-6">
                                    <span className="text-[8px] font-black text-pink-400 uppercase tracking-widest mb-1">CURRENT BET</span>
                                    <div className={`px-4 py-1 rounded-lg border-2 font-black italic text-lg ${userBetSide === 'win' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'
                                        }`}>
                                        {userBetSide?.toUpperCase()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Bar - Enlarged */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 py-4 border-t border-white/5 bg-black/95 backdrop-blur-md rounded-b-xl">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <span className="text-yellow-400/90 font-black text-[10px] sm:text-[12px] uppercase tracking-[2px]">KREDİ</span>
                            <span className="text-white font-black font-mono text-base sm:text-lg md:text-xl">₺ {balance.toLocaleString()}</span>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="flex items-center gap-2 sm:gap-4">
                            <span className="text-yellow-400/90 font-black text-[10px] sm:text-[12px] uppercase tracking-[2px]">BAHİS</span>
                            <span className="text-white font-black font-mono text-lg sm:text-xl md:text-2xl">₺ {betAmount.toLocaleString()}</span>
                        </div>
                    </div>


                </div>
            </div>

            {showSpinMessage && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
                    <div className="text-5xl md:text-8xl font-black italic text-white animate-spin-msg drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] px-10 py-5 bg-gradient-to-r from-transparent via-pink-500/40 to-transparent backdrop-blur-sm border-y-2 border-white/20">
                        {currentSpinMessage}
                    </div>
                </div>
            )}

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

                @keyframes spin-msg {
                    0% { transform: scale(0.5); opacity: 0; filter: blur(10px); }
                    20% { transform: scale(1.1); opacity: 1; filter: blur(0); }
                    80% { transform: scale(1); opacity: 1; filter: blur(0); }
                    100% { transform: scale(1.5); opacity: 0; filter: blur(20px); }
                }
                .animate-spin-msg { animation: spin-msg 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; }

                .game-header-text {
                    letter-spacing: 15px;
                    left: -20.6px;
                    top: 25.7px;
                }
                @media (max-width: 768px) and (orientation: portrait) {
                    .h-screen.h-\[100dvh\] {
                        margin-top: calc(-10px - 15px - 8px - 12px) !important;
                    }
                    .game-header-text {
                        font-size: calc(2.8rem + 3px + 10px + 5px + 3px + 2px) !important;
                        letter-spacing: 4px !important;
                        left: calc(-10px - 2px) !important;
                        top: calc(15px + 10px + 10px + 15px + 15px) !important;
                        margin-top: -10px !important;
                        margin-bottom: 2px !important;
                    }
                    .lobby-betting-controls {
                        margin-top: -10px !important;
                    }
                    .lobby-betting-controls button {
                        font-size: calc(1.125rem - 5px) !important; /* text-lg is 1.125rem */
                    }
                    .game-grid-container {
                        margin-top: -10px !important;
                    }
                    .game-footer {
                        margin-top: -15px !important;
                    }
                }
            `}</style>
        </div>
    )
}
