'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Howl } from 'howler'
import ProtectedRoute from '@/components/ProtectedRoute'
import { authAPI } from '@/lib/api'
import sweetBonanzaAPI from '@/lib/api/sweetBonanza.api'
import { log } from '@/utils/logger'
import { updateUserData } from '@/utils/auth'

// Win Celebration Component - High Fidelity
const WinCelebration = ({ amount, betAmount }) => {
  const [showText, setShowText] = useState(false)
  const canvasRef = useRef(null)

  const getWinTier = () => {
    const ratio = amount / betAmount
    if (ratio >= 100) return { text: 'JACKPOT!', color: 'from-amber-300 via-yellow-500 to-amber-600', count: 120 }
    if (ratio >= 50) return { text: 'SENSATIONAL!', color: 'from-orange-300 via-red-500 to-orange-600', count: 100 }
    if (ratio >= 25) return { text: 'ULTRA WIN!', color: 'from-purple-300 via-pink-500 to-purple-600', count: 80 }
    if (ratio >= 10) return { text: 'MEGA WIN!', color: 'from-blue-300 via-indigo-500 to-blue-600', count: 60 }
    return { text: 'BIG WIN!', color: 'from-pink-200 via-pink-500 to-purple-600', count: 40 }
  }

  const tier = getWinTier()

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 100)

    // Canvas Coin Rain Logic
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const coins = []
    const COIN_EMOJI = '🪙'

    class Coin {
      constructor() {
        this.reset()
        this.y = Math.random() * -canvas.height // Start scattered above
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = -100
        this.size = Math.random() * 40 + 30
        this.speedY = Math.random() * 8 + 5
        this.rotation = Math.random() * 360
        this.rotationSpeed = Math.random() * 10 - 5
        this.opacity = 1
      }
      update() {
        this.y += this.speedY
        this.rotation += this.rotationSpeed
        if (this.y > canvas.height) {
          this.reset()
        }
      }
      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate((this.rotation * Math.PI) / 180)
        ctx.font = `${this.size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        // Add shadow for glow
        ctx.shadowBlur = 15
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)'
        ctx.fillText(COIN_EMOJI, 0, 0)
        ctx.restore()
      }
    }

    // Initialize coins
    for (let i = 0; i < tier.count; i++) {
      coins.push(new Coin())
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      coins.forEach(coin => {
        coin.update()
        coin.draw()
      })
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [tier.count])

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" />

      {/* Synchronized Fireworks */}
      <Fireworks />

      {/* Sunburst Rays */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[300vw] h-[300vw] bg-[conic-gradient(from_0deg,transparent_0deg_10deg,rgba(255,215,0,0.3)_15deg_25deg,transparent_30deg_40deg,rgba(255,105,180,0.3)_45deg_55deg,transparent_60deg)] animate-spin-slow opacity-40" />
      </div>

      {/* Floating Sparkles - Keep limited for performance */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute animate-sparkle" style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            fontSize: `${Math.random() * 20 + 10}px`
          }}>✨</div>
        ))}
      </div>

      {/* Canvas Coin Rain */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Centered Tier Content */}
      {showText && (
        <div className="relative z-50 flex flex-col items-center animate-bounce-in">
          <div className="relative mb-4">
            <h2 className={`text-6xl md:text-9xl font-black italic tracking-tighter leading-none text-center
                bg-gradient-to-b ${tier.color} bg-clip-text text-transparent
                drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] animate-pulse-glow w-full filter brightness-150
            `}>
              {tier.text}
            </h2>
            <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full -z-10 animate-pulse" />
          </div>

          <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-[3px] rounded-[3rem] shadow-[0_0_60px_rgba(255,165,0,0.6)] animate-scale-up">
            <div className="bg-[#1a0f2e] px-8 md:px-16 py-4 md:py-8 rounded-[2.8rem] flex flex-col items-center">
              <span className="text-white text-5xl md:text-8xl font-black italic drop-shadow-lg tracking-tighter flex items-center gap-4 md:gap-6">
                <span className="text-yellow-400 animate-bounce">₺</span>
                {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.2); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: brightness(1.2) drop-shadow(0 0 30px rgba(255,215,0,0.6)); }
          50% { filter: brightness(1.6) drop-shadow(0 0 60px rgba(255,105,180,0.9)); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1.4); }
        }
        @keyframes scale-up {
          from { transform: scale(0.5) translateY(50px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .animate-scale-up { animation: scale-up 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  )
}

// Fireworks Component - Simplified for performance
const Fireworks = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    const particles = []
    const colors = ['#FF1493', '#FFD700', '#FF69B4', '#00BFFF', '#ADFF2F']

    class Particle {
      constructor(x, y) {
        this.x = x; this.y = y
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 5 + 2
        this.vx = Math.cos(angle) * speed
        this.vy = Math.sin(angle) * speed
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.alpha = 1
        this.decay = Math.random() * 0.02 + 0.01
        this.size = Math.random() * 3 + 1
      }
      update() {
        this.x += this.vx; this.y += this.vy
        this.vy += 0.12; this.alpha -= this.decay
      }
      draw() {
        ctx.globalAlpha = this.alpha
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.size, this.size)
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (Math.random() < 0.05) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height * 0.5
        for (let i = 0; i < 30; i++) particles.push(new Particle(x, y))
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update()
        particles[i].draw()
        if (particles[i].alpha <= 0) particles.splice(i, 1)
      }
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]" />
}

export default function SweetBonanza({ isLauncher = false, gameInfo }) {
  const router = useRouter()

  // Allow body scroll for game
  // useEffect(() => {
  //   document.body.style.overflow = 'auto'
  //   document.documentElement.style.overflow = 'auto'
  //   return () => {
  //     document.body.style.overflow = 'unset'
  //     document.documentElement.style.overflow = 'unset'
  //   }
  // }, [])

  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [betAmount, setBetAmount] = useState('10')
  const [spinning, setSpinning] = useState(false)
  // 6 columns x 5 rows grid (matching original game)
  const [reels, setReels] = useState(
    Array(6).fill(null).map(() => Array(5).fill('🍇'))
  )
  const [winAmount, setWinAmount] = useState(0)
  const [gameHistory, setGameHistory] = useState([])
  const [autoSpin, setAutoSpin] = useState(false)
  const [autoSpinCount, setAutoSpinCount] = useState(0)
  const [isWinning, setIsWinning] = useState(false)
  const [winningSymbols, setWinningSymbols] = useState([])
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  const [showLossAnimation, setShowLossAnimation] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [balanceHistory, setBalanceHistory] = useState([]) // Track balance changes with percentages
  const [reelSpeeds, setReelSpeeds] = useState([0, 0, 0, 0, 0, 0]) // Individual reel speeds for realistic spinning
  const reelRefs = useRef([])
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showGameRules, setShowGameRules] = useState(false)
  const [gameScale, setGameScale] = useState(1)

  // Responsive Scaling Logic
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Target dimensions for scaling
      const targetWidth = 1200
      const targetHeight = 900

      const scaleW = width / targetWidth
      const scaleH = height / targetHeight

      // Calculate final scale ensuring game fits both directions
      let finalScale = Math.min(scaleW, scaleH)

      // Mobile tweaks
      if (width < 768) {
        finalScale = Math.min(width / 400, height / 800)
      }

      setGameScale(Math.min(1.2, finalScale))
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const symbols = ['🍇', '🍊', '🍋', '🍉', '🍌', '🍎', '🍓', '⭐', '💎']
  // Weighted symbols for more realistic gameplay (lower value = more common)
  const symbolWeights = {
    '🍇': 30, '🍊': 25, '🍋': 20, '🍉': 15, '🍌': 12,
    '🍎': 8, '🍓': 5, '⭐': 3, '💎': 2
  }
  const quickBetAmounts = ['10', '50', '100', '500', '1000']

  // Helper function to play sound with Howler
  const playSound = (soundKey, volume = 0.7) => {
    if (!soundEnabled) return
    const sound = sounds.current[soundKey]
    if (sound) {
      sound.volume(volume)
      sound.play()
    }
  }

  // Helper for button clicks
  const playClickSound = () => {
    playSound('click', 0.4)
  }

  // Initialize sounds using Howler
  const sounds = useRef({})
  useEffect(() => {
    try {
      sounds.current = {
        bgm: new Howl({
          src: ['https://assets.mixkit.co/music/preview/mixkit-sweet-and-happy-1122.mp3'],
          loop: true,
          volume: 0.15,
          html5: true
        }),
        win: new Howl({
          src: ['https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'],
          volume: 0.6
        }),
        bigWin: new Howl({
          src: ['https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-complete-or-victory-notification-205.mp3'],
          volume: 0.8
        }),
        loss: new Howl({
          src: ['https://assets.mixkit.co/sfx/preview/mixkit-negative-answer-2046.mp3'],
          volume: 0.4
        }),
        spin: new Howl({
          src: ['https://assets.mixkit.co/sfx/preview/mixkit-retro-game-notification-212.mp3'],
          volume: 0.3
        }),
        click: new Howl({
          src: ['https://assets.mixkit.co/sfx/preview/mixkit-selection-click-1109.mp3'],
          volume: 0.2
        })
      }

      // Unlock audio on first interaction
      const unlockAudio = () => {
        if (musicEnabled && sounds.current.bgm) {
          sounds.current.bgm.play()
        }
        window.removeEventListener('click', unlockAudio)
        window.removeEventListener('touchstart', unlockAudio)
      }

      window.addEventListener('click', unlockAudio)
      window.addEventListener('touchstart', unlockAudio)

      return () => {
        Object.values(sounds.current).forEach(sound => sound.unload())
        window.removeEventListener('click', unlockAudio)
        window.removeEventListener('touchstart', unlockAudio)
      }
    } catch (error) {
      console.error('Error initializing audio:', error)
    }
  }, [])

  // Handle music toggle
  useEffect(() => {
    if (sounds.current.bgm) {
      if (musicEnabled) {
        if (!sounds.current.bgm.playing()) {
          sounds.current.bgm.play()
        }
      } else {
        sounds.current.bgm.pause()
      }
    }
  }, [musicEnabled])

  useEffect(() => {
    // Try to get balance from localStorage first (faster initial load)
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser?.balance !== undefined && storedUser.balance !== null) {
        const initialBalance = parseFloat(storedUser.balance) || 0
        setBalance(initialBalance)
        setUser(storedUser)
        if (process.env.NODE_ENV === 'development') {
          console.log('Sweet Bonanza - Initial balance from localStorage:', initialBalance)
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    // Then fetch fresh data from server
    fetchUserData()

    // Listen for balance updates from other components
    const handleUserDataUpdate = (event) => {
      if (event.detail?.balance !== undefined && event.detail.balance !== null) {
        const newBalance = parseFloat(event.detail.balance) || 0
        setBalance(newBalance)
        setUser(event.detail)
        if (process.env.NODE_ENV === 'development') {
          console.log('Sweet Bonanza - Balance updated from event:', newBalance)
        }
      }
    }

    window.addEventListener('userDataUpdated', handleUserDataUpdate)

    // Also poll for balance updates periodically (every 3 seconds)
    const balanceInterval = setInterval(() => {
      fetchUserData()
    }, 3000)

    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate)
      clearInterval(balanceInterval)
    }
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await authAPI.me()

      // Debug: Log the full response structure
      if (process.env.NODE_ENV === 'development') {
        console.log('Sweet Bonanza - Full API response:', response)
        console.log('Sweet Bonanza - Response data:', response?.data)
      }

      // Handle different response structures
      // Backend returns user directly, axios wraps it in response.data
      const userData = response?.data || response || null

      if (userData) {
        setUser(userData)
        // Get balance - check multiple possible locations
        const userBalance = userData.balance !== undefined ? userData.balance :
          (userData.user?.balance !== undefined ? userData.user.balance : 0)

        setBalance(userBalance)

        // Update localStorage to sync with navbar
        updateUserData(userData)

        if (process.env.NODE_ENV === 'development') {
          console.log('Sweet Bonanza - User data:', userData)
          console.log('Sweet Bonanza - User balance set to:', userBalance)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Sweet Bonanza - No user data received from API')
        }
        // Try to get balance from localStorage as fallback
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
          if (storedUser?.balance !== undefined) {
            setBalance(storedUser.balance)
            setUser(storedUser)
            if (process.env.NODE_ENV === 'development') {
              console.log('Sweet Bonanza - Using balance from localStorage:', storedUser.balance)
            }
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    } catch (err) {
      log.apiError('/auth/me', err)
      if (process.env.NODE_ENV === 'development') {
        console.error('Sweet Bonanza - Error fetching user data:', err)
        console.error('Sweet Bonanza - Error response:', err.response)
      }

      // Try to get balance from localStorage as fallback
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (storedUser?.balance !== undefined) {
          setBalance(storedUser.balance)
          setUser(storedUser)
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    } finally {
      setLoading(false)
    }
  }

  // Get weighted random symbol
  const getWeightedSymbol = () => {
    const totalWeight = Object.values(symbolWeights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight

    for (const [symbol, weight] of Object.entries(symbolWeights)) {
      random -= weight
      if (random <= 0) {
        return symbol
      }
    }
    return '🍇' // Fallback
  }

  // Calculate financial flow with percentages
  const calculateFinancialFlow = (initialBalance, betAmount, winAmount) => {
    const netChange = winAmount - betAmount
    const newBalance = initialBalance + netChange
    const percentageChange = initialBalance > 0 ? (netChange / initialBalance) * 100 : 0

    return {
      initialBalance,
      betAmount,
      winAmount,
      netChange,
      newBalance,
      percentageChange,
      isWin: netChange > 0,
      isLoss: netChange < 0
    }
  }

  // Track balance history with percentages
  const addToBalanceHistory = (flow) => {
    const historyEntry = {
      id: Date.now(),
      timestamp: new Date(),
      ...flow,
      gameType: 'sweet-bonanza'
    }

    setBalanceHistory(prev => {
      const updated = [historyEntry, ...prev].slice(0, 20) // Keep last 20 entries

      // Calculate cumulative statistics
      if (updated.length > 0) {
        const totalGames = updated.length
        const wins = updated.filter(e => e.isWin).length
        const losses = updated.filter(e => e.isLoss).length
        const totalWinAmount = updated.filter(e => e.isWin).reduce((sum, e) => sum + e.winAmount, 0)
        const totalLossAmount = updated.filter(e => e.isLoss).reduce((sum, e) => sum + Math.abs(e.netChange), 0)
        const winRate = (wins / totalGames) * 100

        if (process.env.NODE_ENV === 'development') {
          console.log('Game Statistics:', {
            totalGames,
            wins,
            losses,
            winRate: winRate.toFixed(2) + '%',
            totalWinAmount,
            totalLossAmount,
            netProfit: totalWinAmount - totalLossAmount
          })
        }
      }

      return updated
    })
  }

  const calculateWin = (reelResult) => {
    const symbolCounts = {}
    reelResult.forEach((reel, reelIndex) => {
      reel.forEach((symbol, symbolIndex) => {
        const key = `${symbolIndex}-${symbol}`
        if (!symbolCounts[key]) {
          symbolCounts[key] = { symbol, position: symbolIndex, count: 0, positions: [] }
        }
        symbolCounts[key].count++
        symbolCounts[key].positions.push({ reel: reelIndex, position: symbolIndex })
      })
    })

    let totalWin = 0
    const bet = parseFloat(betAmount) || 0
    const winningPositions = []

    Object.values(symbolCounts).forEach(({ symbol, position, count, positions }) => {
      if (count >= 3) {
        const multipliers = {
          '💎': 100,
          '⭐': 50,
          '🍓': 20,
          '🍎': 15,
          '🍌': 12,
          '🍉': 10,
          '🍋': 8,
          '🍊': 6,
          '🍇': 5
        }
        const baseMultiplier = multipliers[symbol] || 5
        const multiplier = baseMultiplier * (count - 2)
        const win = bet * multiplier
        totalWin += win
        winningPositions.push(...positions)
      }
    })

    const scatterCount = reelResult.flat().filter(s => s === '⭐' || s === '💎').length
    if (scatterCount >= 3) {
      const scatterMultiplier = scatterCount === 3 ? 2 : scatterCount === 4 ? 5 : scatterCount >= 5 ? 10 : 0
      totalWin += bet * scatterMultiplier
    }

    setWinningSymbols(winningPositions)
    return totalWin
  }

  const spinReels = async () => {
    if (spinning) return

    const bet = parseFloat(betAmount) || 0

    // Validate bet amount
    if (!betAmount || betAmount === '' || betAmount === null) {
      setError('Please enter a bet amount')
      return
    }

    if (isNaN(bet) || !isFinite(bet)) {
      setError('Invalid bet amount format')
      return
    }

    if (bet <= 0) {
      setError('Bet amount must be greater than 0')
      return
    }

    if (bet < 1) {
      setError('Minimum bet amount is ₺1')
      return
    }

    const currentBalance = parseFloat(balance) || 0
    if (bet > currentBalance) {
      setError('Insufficient balance')
      return
    }

    setSpinning(true)
    setError('')
    setSuccess('')
    setWinAmount(0)
    setIsWinning(false)
    setShowWinAnimation(false)
    setWinningSymbols([])

    // Play spin sound
    playSound('spin', 0.4)
    playClickSound()

    const initialBalance = balance

    // Optimized Spinning Animation Logic
    const baseSpinDuration = 2000
    const reelStopDelays = [0, 200, 400, 600, 800, 1000]
    const startTime = Date.now()

    setReelSpeeds([100, 100, 100, 100, 100, 100])

    const intervalId = setInterval(() => {
      const now = Date.now()
      const elapsed = now - startTime

      setReels(prevReels => {
        let changed = false
        const newReels = [...prevReels]

        for (let i = 0; i < 6; i++) {
          const reelTargetDuration = baseSpinDuration + reelStopDelays[i]
          if (elapsed < reelTargetDuration) {
            newReels[i] = Array(5).fill(null).map(() => getWeightedSymbol())
            changed = true
          }
        }

        return changed ? newReels : prevReels
      })

      // Update reel speeds
      setReelSpeeds(prevSpeeds => {
        const newSpeeds = [...prevSpeeds]
        let changed = false
        for (let i = 0; i < 6; i++) {
          const reelTargetDuration = baseSpinDuration + reelStopDelays[i]
          if (elapsed >= reelTargetDuration && newSpeeds[i] !== 0) {
            newSpeeds[i] = 0
            changed = true
          }
        }
        return changed ? newSpeeds : prevSpeeds
      })

      // Check if all reels stopped
      if (elapsed > baseSpinDuration + 1000) {
        clearInterval(intervalId)
      }
    }, 60) // Slightly slower interval for performance, still looks smooth

    try {
      // Call backend API to play game
      const response = await sweetBonanzaAPI.playGame(bet)
      const gameData = response.data?.data || response.data

      // Ensure we wait at least for the maximum Reel stop delay
      await new Promise(resolve => setTimeout(resolve, baseSpinDuration + 1000))

      // Set final reels from backend
      const finalReels = gameData.reels || []
      const formattedReels = finalReels.length === 6 && finalReels.every(reel => Array.isArray(reel) && reel.length === 5)
        ? finalReels
        : Array(6).fill(null).map(() => Array(5).fill(null).map(() => getWeightedSymbol()))

      setReels(formattedReels)
      setReelSpeeds([0, 0, 0, 0, 0, 0])

      const win = gameData.winAmount || 0
      const netChange = gameData.netChange || 0
      const percentageChange = gameData.percentageChange || 0
      // Get updated main balance from server (this is the deposited balance)
      const newBalance = gameData.userBalance || gameData.newBalance || balance

      setWinAmount(win)
      setBalance(newBalance) // Update local state with main balance
      setWinningSymbols(gameData.winningPositions || [])

      // Calculate financial flow
      const flow = calculateFinancialFlow(initialBalance, bet, win)
      addToBalanceHistory(flow)

      if (win > 0) {
        setSuccess(`🎉 You won ₺${win.toFixed(2)}! (+${percentageChange.toFixed(2)}%)`)
        setIsWinning(true)
        setShowWinAnimation(true)
        setShowFireworks(true)

        // Play win sound
        if (win >= bet * 10) {
          playSound('bigWin', 0.8)
        } else {
          playSound('win', 0.6)
        }

        setGameHistory(prev => [{
          id: Date.now(),
          bet,
          win,
          result: finalReels,
          timestamp: new Date(),
          percentageChange: percentageChange
        }, ...prev].slice(0, 10))

        setTimeout(() => {
          setIsWinning(false)
          setShowWinAnimation(false)
          setShowFireworks(false)
        }, 5000)
      } else {
        setError('Better luck next time!')
        setShowLossAnimation(true)
        // Play loss sound
        playSound('loss', 0.5)

        setTimeout(() => {
          setShowLossAnimation(false)
        }, 3000)
      }

      // Update user data with new main balance (from deposits)
      // This syncs with navbar and other components
      if (user) {
        const updatedUser = { ...user, balance: newBalance }
        updateUserData(updatedUser) // Updates localStorage and triggers navbar update
        setUser(updatedUser)
      }

      // Refresh user data from server to ensure sync with main balance
      // This ensures the balance displayed is the actual deposited balance
      // Use setTimeout to prevent race conditions and allow UI to update first
      setTimeout(async () => {
        try {
          await fetchUserData()
        } catch (fetchErr) {
          // Silently handle fetch errors - balance is already updated from game response
          if (process.env.NODE_ENV === 'development') {
            console.warn('Sweet Bonanza - Error refreshing user data:', fetchErr)
          }
        }
      }, 500)
    } catch (err) {
      // Stop animations on error
      setReelSpeeds([0, 0, 0, 0, 0, 0])

      // Handle different error types
      let errorMessage = 'Failed to play game'

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }

      // Handle specific error codes
      if (err.response?.status === 400) {
        // Bad request - validation error
        errorMessage = errorMessage || 'Invalid request. Please check your bet amount.'
      } else if (err.response?.status === 401) {
        // Unauthorized - session expired
        errorMessage = 'Session expired. Please log in again.'
        // Optionally redirect to login
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else if (err.response?.status === 403) {
        // Forbidden - account not active
        errorMessage = errorMessage || 'Account is not active'
      } else if (err.response?.status === 404) {
        // Not found
        errorMessage = 'User not found'
      } else if (err.response?.status === 500) {
        // Server error
        errorMessage = 'Server error. Please try again later.'
      } else if (!err.response) {
        // Network error
        errorMessage = 'Network error. Please check your connection.'
      }

      setError(errorMessage)

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sweet Bonanza - Game error:', err)
        console.error('Sweet Bonanza - Error response:', err.response)
      }

      log.apiError('/sweet-bonanza/play', err)

      // Refresh balance on error to ensure sync
      try {
        await fetchUserData()
      } catch (fetchErr) {
        // Ignore fetch errors on error recovery
        if (process.env.NODE_ENV === 'development') {
          console.error('Sweet Bonanza - Error fetching user data after game error:', fetchErr)
        }
      }
    } finally {
      setSpinning(false)
    }
  }

  useEffect(() => {
    if (autoSpin && autoSpinCount > 0 && !spinning) {
      const timer = setTimeout(() => {
        // Check balance before auto-spinning
        const currentBalance = parseFloat(balance) || 0
        const bet = parseFloat(betAmount) || 0

        if (currentBalance < bet) {
          setAutoSpin(false)
          setAutoSpinCount(0)
          setError('Insufficient balance for auto-spin')
          return
        }

        spinReels()
        setAutoSpinCount(prev => Math.max(0, prev - 1))
      }, 3500) // Wait for animation to complete
      return () => clearTimeout(timer)
    } else if (autoSpinCount === 0 && autoSpin) {
      setAutoSpin(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpin, autoSpinCount, spinning, balance, betAmount])

  const handleQuickBet = (amount) => {
    setBetAmount(amount)
  }

  const handleAutoSpin = (count) => {
    if (spinning) return
    playClickSound()
    setAutoSpinCount(count)
    setAutoSpin(true)
    spinReels()
  }

  const isWinningPosition = (reelIndex, symbolIndex) => {
    return winningSymbols.some(pos => pos.reel === reelIndex && pos.position === symbolIndex)
  }

  if (loading) {
    return (
      <div className={`relative flex w-full flex-col bg-gradient-to-b from-[#0a0514] via-[#1a0f2e] to-[#0a0514] ${isLauncher ? '' : 'min-h-auto'}`}>
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ff6b9d] border-r-transparent"></div>
            <p className="text-white/70 text-lg">Loading Sweet Bonanza...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex w-full flex-col overflow-hidden" style={{
      background: 'linear-gradient(to bottom, #87CEEB 0%, #E0B0FF 50%, #FFB6C1 100%)',
      height: '100dvh',
      width: '100vw'
    }}>
      {/* Candy-Themed Background - Exact Match from Screenshot */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Deep blue sky with stars - Exact Match */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, #4169E1 0%, #9370DB 40%, #DA70D6 70%, #FFB6C1 100%)'
        }}></div>

        {/* Clouds */}
        <div className="absolute top-10 left-10 w-32 h-20 bg-white/30 rounded-full blur-xl opacity-60"></div>
        <div className="absolute top-20 right-20 w-40 h-24 bg-white/25 rounded-full blur-xl opacity-50"></div>
        <div className="absolute top-32 left-1/3 w-36 h-22 bg-white/20 rounded-full blur-xl opacity-40"></div>

        {/* Stars scattered */}
        <div className="absolute top-24 left-16 text-xl text-white opacity-70">⭐</div>
        <div className="absolute top-36 right-28 text-lg text-white opacity-60">⭐</div>
        <div className="absolute top-48 left-1/3 text-base text-white opacity-50">⭐</div>
        <div className="absolute top-28 right-1/4 text-lg text-white opacity-65">⭐</div>

        {/* Candy hills with frosting - Exact Match */}
        <div className="absolute bottom-0 left-0 right-0 h-80" style={{
          background: 'linear-gradient(to top, #90EE90 0%, #98FB98 15%, #FFD700 35%, #FFB6C1 55%, #FF69B4 75%, #FF1493 100%)',
          borderRadius: '60% 60% 0 0',
          transform: 'scaleX(1.3)',
          boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.2)'
        }}></div>

        {/* Scattered candies and fruits at bottom - Exact positions from screenshot */}
        <div className="absolute  bottom-20 left-16 text-8xl" style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))', zIndex: 5 }}>🍎</div>
        <div className="absolute bottom-24 right-28 text-7xl" style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))', zIndex: 5 }}>🍌</div>
        <div className="absolute bottom-28 left-1/4 text-6xl" style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))', zIndex: 5 }}>🍉</div>
        <div className="absolute bottom-22 right-1/3 text-7xl" style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))', zIndex: 5 }}>🍓</div>
        <div className="absolute bottom-26 left-1/2 text-6xl" style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))', zIndex: 5 }}>💎</div>
        <div className="absolute bottom-20 left-2/3 text-5xl" style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))', zIndex: 5 }}>🍇</div>
        <div className="absolute bottom-24 right-16 text-6xl" style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))', zIndex: 5 }}>🍊</div>
        <div className="absolute bottom-18 left-3/4 text-5xl" style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))', zIndex: 5 }}>🍋</div>

        {/* Large lollipop/swirl candy at bottom center - Exact Match */}
        <div className="absolute bottom-0 left-1/2 text-9xl" style={{
          filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))',
          transform: 'translateX(-50%) translateY(30px)',
          zIndex: 6
        }}>🍭</div>

        {/* Swirling pink and white candy structures */}
        <div className="absolute bottom-32 left-1/5 w-16 h-32 bg-gradient-to-b from-pink-200 via-white to-pink-200 rounded-full transform rotate-12 opacity-80" style={{
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
        }}></div>
        <div className="absolute bottom-36 right-1/5 w-16 h-32 bg-gradient-to-b from-pink-200 via-white to-pink-200 rounded-full transform -rotate-12 opacity-80" style={{
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
        }}></div>

        {/* Candy canes */}
        <div className="absolute bottom-0 left-1/4 w-12 h-48" style={{
          background: 'repeating-linear-gradient(to bottom, #FF0000 0%, #FF0000 12.5%, #FFFFFF 12.5%, #FFFFFF 25%)',
          transform: 'rotate(15deg)',
          borderRadius: '6px',
          filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))',
          zIndex: 4
        }}></div>
        <div className="absolute bottom-0 right-1/4 w-12 h-48" style={{
          background: 'repeating-linear-gradient(to bottom, #FF0000 0%, #FF0000 12.5%, #FFFFFF 12.5%, #FFFFFF 25%)',
          transform: 'rotate(-15deg)',
          borderRadius: '6px',
          filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))',
          zIndex: 4
        }}></div>
      </div>


      <main className="relative flex-1 flex flex-col items-center justify-center z-10 w-full overflow-hidden">
        {/* Win Celebration Animation */}
        {showWinAnimation && winAmount > 0 && (
          <WinCelebration amount={winAmount} betAmount={parseFloat(betAmount)} />
        )}

        {/* Loss Animation */}
        {showLossAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"></div>
            <div className="relative text-center animate-bounce">
              <div className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl" style={{
                textShadow: '0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.3)'
              }}>
                Better Luck <br className="md:hidden" /> Next Time!
              </div>
              <div className="mt-6 text-6xl md:text-8xl animate-pulse">
                🍀
              </div>
            </div>
          </div>
        )}

        {/* Game Title - SWEET BONANZA - Exact Match from Screenshot */}
        <div className="w-full max-w-[1400px] mb-2 text-center relative z-20 px-2 md:px-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-1 leading-tight" style={{
            fontFamily: 'Arial Black, sans-serif',
            fontWeight: 900,
            textShadow: '3px 3px 0px #FFFFFF, 5px 5px 0px rgba(0,0,0,0.2), 0 0 15px rgba(255,255,255,0.6)',
            background: 'linear-gradient(135deg, #FF1493 0%, #FFD700 20%, #FF69B4 40%, #FFD700 60%, #FF1493 80%, #FFD700 100%)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 4s ease infinite',
            letterSpacing: '1px',
            lineHeight: '1.1'
          }}>
            SWEET BONANZA
          </h1>
        </div>

        {/* Error/Success Messages - Minimal */}
        {error && (
          <div className="w-full max-w-[59%] mb-4 animate-fade-in relative z-30 px-4">
            <div className="rounded-lg bg-red-600 backdrop-blur-sm border-2 border-red-700 p-3 shadow-xl">
              <p className="text-white text-center font-bold text-sm">{error}</p>
            </div>
          </div>
        )}
        {success && !showWinAnimation && (
          <div className="w-full max-w-[1400px] mb-4 animate-fade-in relative z-30 px-4">
            <div className="rounded-lg bg-green-600 backdrop-blur-sm border-2 border-green-700 p-3 shadow-xl">
              <p className="text-white text-center font-bold text-sm">{success}</p>
            </div>
          </div>
        )}


        <div className="w-full relative z-20 flex-1 flex flex-col items-center justify-center min-h-0" style={{ transform: `scale(${gameScale})`, transformOrigin: 'center center' }}>
          <div className="relative flex flex-col items-center flex-1 justify-center min-h-0 w-full max-w-[1400px]">
            {/* Reels Area - Full Width */}
            <div className="w-full flex flex-col items-center min-h-0">
              {/* Multiplier Banner - Exact Match */}
              <div className="mb-2 w-full max-w-[800px] rounded-xl p-2 md:p-3 text-center shadow-2xl" style={{
                background: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 30%, #FF69B4 60%, #FFD700 100%)',
                border: '2px solid #FFFFFF',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.4)'
              }}>
                <p className="text-white font-black text-sm md:text-xl uppercase" style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                  letterSpacing: '0.5px'
                }}>
                  RANDOM MULTIPLIER UP TO 100X IN FREE SPINS
                </p>
              </div>

              {/* Reels Container */}
              <div className="relative rounded-2xl p-2 md:p-4 shadow-2xl w-full max-w-[850px]" style={{
                background: 'linear-gradient(135deg, #E8D5F7 0%, #F5EBFF 30%, #E8D5F7 60%, #F0E0FF 100%)',
                border: '4px solid #FFFFFF',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.6)',
              }}>
                <div className="grid grid-cols-6 gap-2 relative z-10 w-full" style={{
                  aspectRatio: '6/5'
                }}>
                  {reels.map((reel, reelIndex) =>
                    reel.map((symbol, symbolIndex) => {
                      const isWinning = isWinningPosition(reelIndex, symbolIndex)
                      const isReelSpinning = spinning && reelSpeeds[reelIndex] > 0
                      return (
                        <div
                          key={`${reelIndex}-${symbolIndex}`}
                          className={`aspect-square flex items-center justify-center rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${isReelSpinning
                            ? 'bg-purple-300'
                            : isWinning
                              ? 'bg-yellow-400 border-yellow-600 scale-110 z-20'
                              : 'bg-white border-gray-200'
                            }`}
                          style={{
                            boxShadow: isWinning ? '0 0 25px rgba(255, 215, 0, 1)' : '0 4px 8px rgba(0,0,0,0.1)',
                            willChange: 'transform',
                            transform: isWinning ? 'scale(1.1) translateZ(0)' : 'translateZ(0)'
                          }}
                        >
                          <span className={`${isReelSpinning ? 'animate-reel-spin' : ''} ${isWinning ? 'animate-pop' : ''}`} style={{
                            fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
                            filter: isReelSpinning ? 'blur(2px)' : 'none'
                          }}>
                            {symbol}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* WIN OVER 21,100X BET */}
              <div className="mt-4 text-center">
                <p className="text-white font-black text-xl md:text-4xl italic" style={{
                  textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
                  letterSpacing: '2px'
                }}>
                  WIN OVER 21,100X BET
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Volatility Indicator - Exact Match */}
        {/* <div className="mt-4 rounded-lg p-3 md:p-4 flex items-center gap-3" style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span className="text-white font-bold text-sm uppercase tracking-wide">VOLATILITY</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="text-yellow-400 text-xl md:text-2xl" style={{ filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.8))' }}>⚡</span>
                    ))}
                  </div>
                </div> */}

        {/* Bottom Controls Bar - Exact Match from Screenshot */}
        <div className="mt-2 md:mt-1 flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-2 px-2 md:px-2 py-2 md:py-1.5" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(5px)',
          borderRadius: '6px'
        }}>
          {/* Left Side - Credit, Bet, Icons - Exact Match */}
          <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center md:justify-start">
            {/* Pragmatic Play Logo */}
            <div className="text-white text-xs font-bold opacity-80 hidden md:block">PRAGMATIC PLAY</div>

            {/* Info and Sound Icons */}
            <button
              onClick={() => {
                playClickSound()
                setShowGameRules(true)
              }}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              title="Game Rules"
            >
              <span className="material-symbols-outlined text-white text-base md:text-lg">info</span>
            </button>
            <button
              onClick={() => {
                if (!soundEnabled) {
                  // If we are unmuting, play click sound AFTER enabling
                  setSoundEnabled(true)
                  setMusicEnabled(true)
                  setTimeout(playClickSound, 50)
                } else {
                  // If we are muting, play click sound BEFORE disabling
                  playClickSound()
                  setTimeout(() => {
                    setSoundEnabled(false)
                    setMusicEnabled(false)
                  }, 50)
                }

                if (bgMusicRef.current) {
                  if (!soundEnabled) {
                    bgMusicRef.current.play().catch(() => { })
                  } else {
                    bgMusicRef.current.pause()
                  }
                }
              }}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              title={soundEnabled && musicEnabled ? 'Mute' : 'Unmute'}
            >
              <span className="material-symbols-outlined text-white text-base md:text-lg">
                {soundEnabled && musicEnabled ? 'volume_up' : 'volume_off'}
              </span>
            </button>

            {/* Credit/Balance */}
            <div className="text-white font-bold">
              <div className="text-xs opacity-80">KREDİ</div>
              <div className="text-xs md:text-sm">₺{typeof balance === 'number' && !isNaN(balance) ? balance.toFixed(2) : '0.00'}</div>
            </div>

            {/* Bet Amount */}
            <div className="text-white font-bold">
              <div className="text-xs opacity-80">BAHİS</div>
              <div className="text-xs md:text-sm">₺{parseFloat(betAmount) || 0}.00</div>
            </div>
          </div>

          {/* Center - Turbo Spin Instruction - Exact Match */}
          <div className="flex-1 text-center hidden md:block">
            <p className="text-white text-xs font-medium opacity-90">
              TURBO SPİN İÇİN BOŞLUK TUŞUNA BASILI TUTUN
            </p>
          </div>

          {/* Right Side - Spin Button with +/- and Auto Play - Exact Match */}
          <div className="flex flex-col items-center gap-2">
            {/* Spin Button with +/- buttons */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Minus Button */}
              <button
                onClick={() => {
                  playClickSound()
                  const currentBet = parseFloat(betAmount) || 0
                  const newBet = Math.max(1, currentBet - 1)
                  setBetAmount(newBet.toString())
                }}
                disabled={spinning || parseFloat(betAmount) <= 1}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center hover:scale-110 active:scale-95"
                title="Decrease Bet"
              >
                -
              </button>

              {/* Large Circular Spin Button - Exact Match */}
              <button
                onClick={spinReels}
                disabled={spinning || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > balance}
                className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full font-black transition-all transform overflow-hidden group ${spinning
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-black hover:scale-110 active:scale-95 text-white'
                  }`}
                style={{
                  boxShadow: spinning ? 'none' : '0 8px 25px rgba(0,0,0,0.5)',
                  border: '2px solid #FFFFFF',
                  background: spinning ? '#6B7280' : 'linear-gradient(135deg, #000000 0%, #1F2937 50%, #000000 100%)'
                }}
              >
                {spinning ? (
                  <span className="flex items-center justify-center h-full">
                    <span className="inline-block w-4 h-4 md:w-5 md:h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center h-full text-2xl">🔄</span>
                )}
              </button>

              {/* Plus Button */}
              <button
                onClick={() => {
                  playClickSound()
                  const currentBet = parseFloat(betAmount) || 0
                  const currentBalance = parseFloat(balance) || 0
                  const newBet = Math.min(currentBalance, currentBet + 1)
                  setBetAmount(newBet.toString())
                }}
                disabled={spinning || parseFloat(betAmount) >= parseFloat(balance)}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center hover:scale-110 active:scale-95"
                title="Increase Bet"
              >
                +
              </button>
            </div>

            {/* Auto Play Button - Below Spin Button */}
            <button
              onClick={() => {
                if (autoSpin) {
                  playClickSound()
                  setAutoSpin(false)
                  setAutoSpinCount(0)
                } else {
                  handleAutoSpin(10)
                }
              }}
              disabled={spinning || autoSpin || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > balance}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-white font-bold text-xs transition-all ${autoSpin
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
            >
              {autoSpin ? 'DURDUR' : 'OTOMATİK'}
            </button>
          </div>
        </div>
      </main>

      {/* Game Rules Modal */}
      {showGameRules && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowGameRules(false)}>
          <div className="bg-gradient-to-br from-[#1a0f2e] via-[#2d1b4e] to-[#1a0f2e] rounded-2xl p-6 md:p-8 max-w-2xl w-full border-2 border-white/20 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                GAME RULES
              </h2>
              <button onClick={() => setShowGameRules(false)} className="text-white">Close</button>
            </div>
            <div className="text-white space-y-4">
              <p>Match 8+ symbols to win. Tumble feature applies on all wins. Ultra, Mega, and Big wins depend on payout size relative to bet.</p>
            </div>
          </div>
        </div>
      )}

      {/* Optimized Styles */}
      <style jsx>{`
        @keyframes pop {
          0% { transform: scale(1) translateZ(0); }
          50% { transform: scale(1.25) translateZ(0); }
          100% { transform: scale(1) translateZ(0); }
        }
        .animate-pop {
          animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          will-change: transform;
        }
        @keyframes reel-spin {
          0% { transform: translateY(-4px) translateZ(0); }
          50% { transform: translateY(4px) translateZ(0); }
          100% { transform: translateY(-4px) translateZ(0); }
        }
        .animate-reel-spin {
          animation: reel-spin 0.08s linear infinite;
          will-change: transform;
        }
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
      `}</style>
    </div>
  )
}

// export default SweetBonanzaPage
