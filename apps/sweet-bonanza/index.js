'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { authAPI } from '@/lib/api'
import sweetBonanzaAPI from '@/lib/api/sweetBonanza.api'
import { log } from '@/utils/logger'
import { updateUserData } from '@/utils/auth'

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
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8
        }
        this.alpha = 1
        this.decay = Math.random() * 0.015 + 0.015
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
      }

      update() {
        this.velocity.y += 0.05 // gravity
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Randomly create fireworks
      if (Math.random() < 0.05) {
        createFirework(
          Math.random() * canvas.width,
          Math.random() * (canvas.height * 0.5)
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
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
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
  const bgMusicRef = useRef(null)
  const winSoundRef = useRef(null)
  const bigWinSoundRef = useRef(null)
  const lossSoundRef = useRef(null)
  const spinSoundRef = useRef(null)
  const clickSoundRef = useRef(null)
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showGameRules, setShowGameRules] = useState(false)

  const symbols = ['🍇', '🍊', '🍋', '🍉', '🍌', '🍎', '🍓', '⭐', '💎']
  // Weighted symbols for more realistic gameplay (lower value = more common)
  const symbolWeights = {
    '🍇': 30, '🍊': 25, '🍋': 20, '🍉': 15, '🍌': 12,
    '🍎': 8, '🍓': 5, '⭐': 3, '💎': 2
  }
  const quickBetAmounts = ['10', '50', '100', '500', '1000']

  // Helper function to create beep sound using Web Audio API
  const createBeepSound = (frequency, duration, type = 'sine') => {
    if (!soundEnabled || typeof window === 'undefined' || !window.AudioContext && !window.webkitAudioContext) {
      return
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      console.error('Error creating beep sound:', error)
    }
  }

  // Helper function to play sound
  const playSound = (soundRef, volume = 0.7, useBeep = false, beepFreq = 800) => {
    if (!soundEnabled) return

    if (useBeep) {
      // Use Web Audio API beep as fallback
      createBeepSound(beepFreq, 0.3)
      return
    }

    if (!soundRef?.current) return

    try {
      // Reset and play audio
      soundRef.current.currentTime = 0
      soundRef.current.volume = volume

      const playPromise = soundRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // console.log('Audio play failed:', error)
          // Silent catch for autoplay restrictions
        })
      }
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }

  // Helper for button clicks
  const playClickSound = () => {
    playSound(clickSoundRef, 0.4)
  }

  // Initialize audio
  useEffect(() => {
    // Create audio elements for sounds
    try {
      // Background music - Sweet/Upbeat theme
      bgMusicRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-sweet-and-happy-1122.mp3')
      bgMusicRef.current.loop = true
      bgMusicRef.current.volume = 0.2
      bgMusicRef.current.preload = 'auto'

      // Win sound - Bright and sparkly
      winSoundRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3')
      winSoundRef.current.volume = 0.6
      winSoundRef.current.preload = 'auto'

      // Big Win sound - Celebratory crowd/victory
      bigWinSoundRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-complete-or-victory-notification-205.mp3')
      bigWinSoundRef.current.volume = 0.7
      bigWinSoundRef.current.preload = 'auto'

      // Loss sound - Short and subtle
      lossSoundRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-negative-answer-2046.mp3')
      lossSoundRef.current.volume = 0.5
      lossSoundRef.current.preload = 'auto'

      // Spin sound - Reel whoosh or start
      spinSoundRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-retro-game-notification-212.mp3')
      spinSoundRef.current.volume = 0.4
      spinSoundRef.current.preload = 'auto'

      // Click sound - Soft pop
      clickSoundRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-selection-click-1109.mp3')
      clickSoundRef.current.volume = 0.3
      clickSoundRef.current.preload = 'auto'

      // Start background music if enabled
      if (musicEnabled && bgMusicRef.current) {
        bgMusicRef.current.play().catch((err) => {
          console.log('Background music autoplay blocked. Will play on first interaction.')
        })
      }
    } catch (error) {
      console.error('Error initializing audio:', error)
    }

    return () => {
      // Cleanup audio on unmount
      [bgMusicRef, winSoundRef, bigWinSoundRef, lossSoundRef, spinSoundRef, clickSoundRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause()
          ref.current = null
        }
      })
    }
  }, [])

  // Handle music toggle
  useEffect(() => {
    if (bgMusicRef.current) {
      if (musicEnabled) {
        bgMusicRef.current.play().catch(() => { })
      } else {
        bgMusicRef.current.pause()
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
    playSound(spinSoundRef, 0.4)
    playClickSound()

    const initialBalance = balance

    // Show spinning animation first
    const baseSpinDuration = 2000
    const reelStopDelays = [0, 200, 400, 600, 800, 1000]
    const spinInterval = 50

    setReelSpeeds([100, 100, 100, 100, 100, 100])

    const reelAnimations = reelStopDelays.map((delay, reelIndex) => {
      return new Promise((resolve) => {
        let currentSpin = 0
        const spins = Math.floor((baseSpinDuration + delay) / spinInterval)

        const interval = setInterval(() => {
          setReels(prevReels => {
            const newReels = [...prevReels]
            newReels[reelIndex] = Array(5).fill(null).map(() => getWeightedSymbol())
            return newReels
          })

          setReelSpeeds(prevSpeeds => {
            const newSpeeds = [...prevSpeeds]
            const progress = currentSpin / spins
            newSpeeds[reelIndex] = 100 * (1 - progress * 0.8)
            return newSpeeds
          })

          currentSpin++

          if (currentSpin >= spins) {
            clearInterval(interval)
            setReelSpeeds(prevSpeeds => {
              const newSpeeds = [...prevSpeeds]
              newSpeeds[reelIndex] = 0
              return newSpeeds
            })
            resolve()
          }
        }, spinInterval)
      })
    })

    try {
      // Call backend API to play game
      const response = await sweetBonanzaAPI.playGame(bet)
      const gameData = response.data?.data || response.data

      // Wait for animation to complete
      await Promise.all(reelAnimations)

      // Set final reels from backend
      const finalReels = gameData.reels || []
      // Ensure reels are properly formatted as 6 columns with 5 rows each
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

        // Play win sound (Big Win fallback)
        if (win >= bet * 10) {
          playSound(bigWinSoundRef, 0.7)
        } else {
          playSound(winSoundRef, 0.6)
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
        playSound(lossSoundRef, 0.5)

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
    <div className="relative flex w-full flex-col" style={{
      background: 'linear-gradient(to bottom, #87CEEB 0%, #E0B0FF 50%, #FFB6C1 100%)',
      minHeight: isLauncher ? 'auto' : '100vh',
      width: '100%',
      overflow: 'auto'
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


      <main className="relative flex flex-col items-center justify-center z-10 w-full" style={{ paddingTop: '5px', paddingBottom: '5px', overflow: 'visible', minHeight: '100vh' }}>
        {/* Win Celebration Animation */}
        {showWinAnimation && winAmount > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 animate-pulse"></div>
            {showFireworks && <Fireworks />}
            <div className="relative text-center z-10">
              <div className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-bounce">
                🎉
              </div>
              <div className="mt-4 text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-pulse">
                BIG WIN!
              </div>
              <div className="mt-2 text-3xl md:text-5xl font-black text-yellow-400 animate-pulse">
                ₺{winAmount.toFixed(2)}
              </div>
            </div>
          </div>
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


        {/* Game Area - Exact Layout Match from Screenshot */}
        <div className="w-full max-w-[95%] md:max-w-[70%] lg:max-w-[55%] xl:max-w-[60%] relative z-20 px-2 md:px-4 flex-1 flex flex-col min-h-0 game-area-laptop" style={{ transform: 'scale(1)', transformOrigin: 'center top' }}>
          <div className="relative flex flex-col items-center flex-1 justify-between min-h-0 w-full">
            {/* Reels Area - Full Width */}
            <div className="w-full flex-1 flex flex-col min-h-0" style={{ minHeight: '0' }}>
              {/* Multiplier Banner - Exact Match */}
              <div className="mb-2 md:mb-3 rounded-lg md:rounded-xl p-2 md:p-3 text-center shadow-xl md:shadow-2xl" style={{
                background: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 30%, #FF69B4 60%, #FFD700 100%)',
                border: '2px solid #FFFFFF',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -1px 3px rgba(0,0,0,0.2)'
              }}>
                <p className="text-white font-black text-xs md:text-sm lg:text-base xl:text-lg" style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 10px rgba(255,255,255,0.4)',
                  letterSpacing: '0.5px',
                  fontWeight: 900
                }}>
                  RANDOM MULTIPLIER UP TO 100X IN FREE SPINS
                </p>
              </div>

              {/* Reels Container - 6 columns x 5 rows Grid - Light Purple/Cloudy Background - Exact Match */}
              <div className="relative rounded-xl md:rounded-2xl p-1 md:p-2 lg:p-3 shadow-xl md:shadow-2xl mx-auto w-2/3" style={{
                background: 'linear-gradient(135deg, #E8D5F7 0%, #F5EBFF 30%, #E8D5F7 60%, #F0E0FF 100%)',
                border: '3px solid #FFFFFF',
                boxShadow: '0 6px 20px rgba(0,0,0,0.25), inset 0 2px 8px rgba(255,255,255,0.6)',
                position: 'relative',
                overflow: 'visible'
              }}>
                {/* Cloudy effect overlay */}
                <div className="absolute inset-0 opacity-30 pointer-events-none rounded-xl md:rounded-2xl" style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                }}></div>
                <div className="grid grid-cols-6 gap-1 md:gap-2 relative z-10 w-full" style={{
                  aspectRatio: '6/5'
                }}>
                  {reels.map((reel, reelIndex) =>
                    reel.map((symbol, symbolIndex) => {
                      const isWinning = isWinningPosition(reelIndex, symbolIndex)
                      const reelSpeed = reelSpeeds[reelIndex] || 0
                      return (
                        <div
                          key={`${reelIndex}-${symbolIndex}`}
                          className={`aspect-square flex items-center justify-center rounded-lg md:rounded-xl border-2 md:border-3 transition-all duration-300 relative overflow-hidden ${spinning && reelSpeed > 0
                            ? 'bg-gradient-to-b from-purple-300 to-purple-400 border-purple-500'
                            : isWinning
                              ? 'bg-gradient-to-b from-yellow-300 to-yellow-400 border-yellow-600 shadow-xl md:shadow-2xl shadow-yellow-500/70'
                              : 'bg-white border-gray-300'
                            }`}
                          style={{
                            boxShadow: isWinning
                              ? '0 0 20px rgba(255, 215, 0, 1), inset 0 2px 8px rgba(255,255,255,0.8)'
                              : spinning && reelSpeed > 0
                                ? '0 2px 6px rgba(147, 51, 234, 0.3)'
                                : '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.9)',
                            borderWidth: '2px',
                            borderColor: isWinning ? '#F59E0B' : spinning ? '#9333EA' : '#D1D5DB',
                            animation: isWinning ? 'winningGlow 0.6s ease-in-out infinite' : undefined,
                            background: !spinning && !isWinning ? 'linear-gradient(to bottom, #FFFFFF 0%, #F9FAFB 100%)' : undefined,
                            fontSize: 'clamp(1rem, 4vw, 2.5rem)',
                            filter: spinning && reelSpeed > 0 ? 'blur(2px)' : 'none'
                          }}
                        >
                          <span className={`transition-all duration-300 relative z-10 ${isWinning ? 'scale-125' : ''}`} style={{
                            filter: isWinning ? 'drop-shadow(0 0 8px rgba(255,215,0,0.8))' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))',
                            display: 'block'
                          }}>
                            {symbol}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* WIN OVER 21,100X BET - Exact Match from Screenshot */}
              <div className="mt-2 text-center">
                <p className="text-white font-black text-lg md:text-xl lg:text-2xl" style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(255,255,255,0.3)',
                  letterSpacing: '1px'
                }}>
                  WIN OVER 21,100X BET
                </p>
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
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}
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
                        boxShadow: spinning
                          ? 'none'
                          : '0 8px 25px rgba(0,0,0,0.5), inset 0 2px 12px rgba(255,255,255,0.15), inset 0 -2px 8px rgba(0,0,0,0.3)',
                        border: '2px solid #FFFFFF',
                        background: spinning ? '#6B7280' : 'linear-gradient(135deg, #000000 0%, #1F2937 50%, #000000 100%)'
                      }}
                    >
                      {spinning ? (
                        <span className="flex items-center justify-center h-full">
                          <span className="inline-block w-4 h-4 md:w-5 md:h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                        </span>
                      ) : (
                        <>
                          <span className="relative z-10 flex items-center justify-center h-full">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </>
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
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}
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
                    {autoSpin ? 'OTOMATİK OYUN DURDUR' : 'OTOMATİK OYUN'}
                  </button>
                  {autoSpin && autoSpinCount > 0 && (
                    <div className="text-white text-xs">
                      {autoSpinCount} kalan
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>


      {/* Game Rules Modal */}
      {showGameRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4" onClick={() => setShowGameRules(false)}>
          <div className="bg-gradient-to-br from-[#1a0f2e] via-[#2d1b4e] to-[#1a0f2e] rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 max-w-2xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border-2 border-white/20 shadow-2xl custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 pr-2">
                SWEET BONANZA - GAME RULES
              </h2>
              <button
                onClick={() => {
                  playClickSound()
                  setShowGameRules(false)
                }}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all flex-shrink-0"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-white text-lg md:text-xl">close</span>
              </button>
            </div>

            <div className="space-y-4 md:space-y-6 text-white">
              {/* Game Overview */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-yellow-400">Game Overview</h3>
                <p className="text-white/80 leading-relaxed text-sm md:text-base">
                  Sweet Bonanza is a 6-reel, 5-row slot game with a cluster pays mechanic. Match symbols horizontally or vertically to win!
                </p>
              </div>

              {/* How to Play */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-yellow-400">How to Play</h3>
                <ul className="space-y-2 text-white/80 list-disc list-inside text-sm md:text-base">
                  <li>Set your bet amount using the +/- buttons or quick bet options</li>
                  <li>Click the SPIN button to start the game</li>
                  <li>Match 8 or more identical symbols anywhere on the reels to win</li>
                  <li>Symbols can connect horizontally or vertically</li>
                  <li>More symbols = Higher multiplier!</li>
                </ul>
              </div>

              {/* Symbol Multipliers */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-yellow-400">Symbol Multipliers</h3>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <div className="bg-white/10 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <span className="text-2xl md:text-3xl">💎</span>
                    <span className="font-bold text-yellow-400 text-sm md:text-base">100x</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <span className="text-2xl md:text-3xl">⭐</span>
                    <span className="font-bold text-yellow-400 text-sm md:text-base">50x</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <span className="text-2xl md:text-3xl">🍓</span>
                    <span className="font-bold text-pink-400 text-sm md:text-base">20x</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <span className="text-2xl md:text-3xl">🍎</span>
                    <span className="font-bold text-red-400 text-sm md:text-base">15x</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <span className="text-2xl md:text-3xl">🍌</span>
                    <span className="font-bold text-yellow-300 text-sm md:text-base">12x</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <span className="text-2xl md:text-3xl">🍉</span>
                    <span className="font-bold text-green-400 text-sm md:text-base">10x</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <span className="text-2xl md:text-3xl">🍊</span>
                    <span className="font-bold text-orange-400 text-sm md:text-base">8x</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <span className="text-2xl md:text-3xl">🍋</span>
                    <span className="font-bold text-yellow-300 text-sm md:text-base">6x</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <span className="text-2xl md:text-3xl">🍇</span>
                    <span className="font-bold text-purple-400 text-sm md:text-base">5x</span>
                  </div>
                </div>
              </div>

              {/* Special Features */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-yellow-400">Special Features</h3>
                <ul className="space-y-2 text-white/80 text-sm md:text-base">
                  <li><strong className="text-white">Scatter Symbols (⭐ and 💎):</strong> Can appear anywhere and count towards cluster wins</li>
                  <li><strong className="text-white">Free Spins:</strong> Triggered by 3+ scatter symbols</li>
                  <li><strong className="text-white">Random Multiplier:</strong> Up to 100x multiplier in free spins</li>
                  <li><strong className="text-white">Tumble Feature:</strong> Winning symbols disappear and new ones fall down</li>
                </ul>
              </div>

              {/* Winning Rules */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-yellow-400">Winning Rules</h3>
                <ul className="space-y-2 text-white/80 list-disc list-inside text-sm md:text-base">
                  <li>Minimum 8 matching symbols required for a win</li>
                  <li>Symbols must be adjacent (horizontally or vertically)</li>
                  <li>Wins are calculated based on symbol multiplier × bet amount</li>
                  <li>Multiple clusters can win simultaneously</li>
                  <li>Maximum win: 21,100x your bet!</li>
                </ul>
              </div>

              {/* Volatility */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-yellow-400">Volatility</h3>
                <p className="text-white/80 text-sm md:text-base">
                  This game has <strong className="text-yellow-400">HIGH VOLATILITY</strong> (5/5).
                  This means wins may be less frequent but can be significantly larger when they occur.
                </p>
              </div>
            </div>

            <div className="mt-4 md:mt-6 flex justify-end">
              <button
                onClick={() => {
                  playClickSound()
                  setShowGameRules(false)
                }}
                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-lg transition-all text-sm md:text-base min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
          @keyframes winningGlow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 40px rgba(255, 215, 0, 1);
              transform: scale(1.1);
            }
          }
          
          @keyframes gradientShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ff6b9d, #9333ea);
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #ff8fb3, #a855f7);
          }
          
          /* Mobile Optimizations */
          @media (max-width: 640px) {
            /* Ensure touch targets are at least 44x44px */
            button {
              min-height: 44px;
              min-width: 44px;
            }
            
            /* Improve readability on small screens */
            body {
              -webkit-text-size-adjust: 100%;
              -moz-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
            
            /* Prevent horizontal scroll */
            * {
              max-width: 100%;
            }
            
            /* Optimize animations for mobile performance */
            .animate-spin,
            .animate-pulse,
            .animate-bounce {
              will-change: transform;
            }
          }
          
          /* Tablet optimizations */
          @media (min-width: 641px) and (max-width: 1024px) {
            /* Adjust spacing for tablets */
            .game-container {
              padding: 1rem;
            }
          }
          
          /* Laptop optimizations - Make game smaller */
          @media (min-width: 1025px) and (max-width: 1440px) {
            /* Scale down game area for laptop screens */
            .game-area-laptop {
              transform: scale(0.85) !important;
              transform-origin: center top;
            }
          }
          
          /* Prevent text selection on game elements */
          .game-area * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          
          /* Improve touch interactions */
          @media (hover: none) and (pointer: coarse) {
            button:active {
              transform: scale(0.95);
            }
          }
        `}</style>
    </div>
  )
}

// export default SweetBonanzaPage
