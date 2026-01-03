'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useTranslation } from '@/hooks/useTranslation'
import DiceAnimation from '@/components/DiceAnimation'
import { diceRollGameAPI, diceRollBetAPI, authAPI } from '@/lib/api'
import { log } from '@/utils/logger'

export default function DiceRollPvP({ isLauncher = false, gameInfo }) {
  const { t } = useTranslation()
  const router = useRouter()
  const [activeGame, setActiveGame] = useState(null)
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [placingBet, setPlacingBet] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [betAmount, setBetAmount] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)
  const [gameHistory, setGameHistory] = useState([])
  const [myBets, setMyBets] = useState([])
  const [refreshInterval, setRefreshInterval] = useState(null)
  const [liveBets, setLiveBets] = useState([])
  const [livePlayers, setLivePlayers] = useState([])
  const [gameMode, setGameMode] = useState(null) // 'play' or 'bet'
  const [matchmakingStatus, setMatchmakingStatus] = useState(null)
  const [myGame, setMyGame] = useState(null) // Player vs player game
  const [matchmakingInterval, setMatchmakingInterval] = useState(null)
  const [pvpGames, setPvpGames] = useState([]) // Active PvP games for betting
  const [gameSessionEnded, setGameSessionEnded] = useState(false) // Flag to prevent auto-restore after ending session

  const quickBetAmounts = ['10', '50', '100', '500', '1000']

  useEffect(() => {
    fetchUserData()
    fetchActiveGame()
    fetchGameHistory()
    fetchMyBets()
    checkForActiveGame() // Check if user is already in a PvP game

    // Refresh active game every 3 seconds
    const interval = setInterval(() => {
      if (!placingBet) {
        fetchActiveGame()
      }
      // Only check for PvP games if session hasn't been ended
      if (!gameSessionEnded) {
        checkForActiveGame()
      }
    }, 3000) // Reduced to 3 seconds for better real-time updates
    setRefreshInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkForActiveGame = async () => {
    // dont check if user just ended a session
    if (gameSessionEnded) return

    try {
      const response = await diceRollGameAPI.getMatchmakingStatus()
      const data = response.data?.data || response.data

      // Only set game if it exists, is matched, and is NOT completed or waiting-for-admin
      if (data.matched && data.game && data.game.status !== 'completed' && data.game.status !== 'waiting-for-admin') {
        // Only set if we dont already have a game or if it's a different game
        if (!myGame || myGame._id !== data.game._id) {
          setMyGame(data.game)
          setGameMode('play') // Set to play mode if game found
          // Refresh user data to get updated balance
          await fetchUserData()
        }
      } else if (data.matched && data.game && (data.game.status === 'completed' || data.game.status === 'waiting-for-admin')) {
        // If game is completed or waiting for admin, dont auto-restore it
        // Only clear if it's the same game and we're not in a session-ended state
        if (myGame && myGame._id === data.game._id && !gameSessionEnded) {
          setMyGame(null)
          setGameMode(null)
        }
      } else if (!data.matched && !data.inQueue) {
        // No active game or queue - clear completed games
        if (myGame && (myGame.status === 'completed' || myGame.status === 'waiting-for-admin') && !gameSessionEnded) {
          setMyGame(null)
          setGameMode(null)
        }
      }
    } catch (err) {
      // Ignore errors
    }
  }

  const fetchUserData = async () => {
    try {
      const response = await authAPI.me()
      if (response?.data) {
        setUser(response.data)
        setBalance(response.data.balance || 0)

        // Update localStorage
        try {
          const { updateUserData } = await import('@/utils/auth')
          updateUserData(response.data)
        } catch (err) {
          // Silently fail
          if (process.env.NODE_ENV === 'development') {
            console.error('Error updating user data:', err)
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        router.push('/auth/login')
      } else {
        if (process.env.NODE_ENV === 'development') {
          log.apiError('/auth/me', err)
        }
      }
    }
  }

  const fetchActiveGame = async () => {
    try {
      const response = await diceRollGameAPI.getActiveGame()
      // API returns: { success: true, data: { game, bets, betStats, pvpGames } }
      const responseData = response.data
      const gameData = responseData?.data?.game || responseData?.game || null
      const pvpGamesData = responseData?.data?.pvpGames || []

      if (gameData) {
        const betStats = responseData?.data?.betStats || responseData?.betStats
        const bets = responseData?.data?.bets || []

        setActiveGame({
          ...gameData,
          betStats: betStats
        })

        // Update live bets (most recent first, limit to 20)
        const recentBets = bets.slice(0, 20).map(bet => ({
          id: bet._id,
          username: bet.user?.username || 'Anonymous',
          amount: bet.betAmount,
          option: bet.selectedOption,
          time: new Date(bet.createdAt)
        }))
        setLiveBets(recentBets)

        // Get unique players who have bet
        const uniquePlayers = new Map()
        bets.forEach(bet => {
          const username = bet.user?.username || 'Anonymous'
          if (!uniquePlayers.has(username)) {
            uniquePlayers.set(username, {
              username,
              player1Bets: 0,
              player2Bets: 0,
              totalAmount: 0
            })
          }
          const player = uniquePlayers.get(username)
          if (bet.selectedOption === 'player1') {
            player.player1Bets++
          } else {
            player.player2Bets++
          }
          player.totalAmount += bet.betAmount
        })
        setLivePlayers(Array.from(uniquePlayers.values()))
      } else {
        setActiveGame(null)
        setLiveBets([])
        setLivePlayers([])
      }

      // Set PvP games for betting
      setPvpGames(pvpGamesData)
    } catch (err) {
      // If 404, no active game exists - that's fine
      if (err.response?.status !== 404) {
        log.apiError('/dice-roll-games/active', err)
      }
      setActiveGame(null)
      setLiveBets([])
      setLivePlayers([])
      setPvpGames([])
    } finally {
      setLoading(false)
    }
  }

  const fetchGameHistory = async () => {
    try {
      const response = await diceRollGameAPI.getAllGames({
        status: 'completed',
        limit: 10
      })
      const data = response.data?.data || response.data
      setGameHistory(data?.games || [])
    } catch (err) {
      log.apiError('/dice-roll-games', err)
    }
  }

  const fetchMyBets = async () => {
    try {
      const response = await diceRollBetAPI.getMyBets({ limit: 10 })
      const data = response.data?.data || response.data
      setMyBets(data?.bets || [])
    } catch (err) {
      log.apiError('/dice-roll-bets/my-bets', err)
    }
  }

  const handleBetAmountChange = (amount) => {
    setBetAmount(amount)
  }

  const handlePlaceBet = async () => {
    if (!activeGame) {
      setError('No active game available')
      return
    }

    if (!selectedOption) {
      setError('Please select Player 1 or Player 2')
      return
    }

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
      // Use the nested route: /api/dice-roll-games/:gameId/bets
      const response = await diceRollGameAPI.placeBet(activeGame._id, {
        selectedOption,
        betAmount: amount
      })

      setSuccess('Bet placed successfully!')
      setBetAmount('')
      setSelectedOption(null)

      // Update balance from response
      const responseData = response.data?.data || response.data
      if (responseData?.userBalance !== undefined) {
        setBalance(responseData.userBalance)
      }

      // Refresh data
      await Promise.all([
        fetchActiveGame(),
        fetchMyBets(),
        fetchUserData()
      ])

      // If betting on PvP game, reset active game to show betting game again
      if (activeGame.gameType === 'player-vs-player') {
        setActiveGame(null)
        await fetchActiveGame()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bet')
      log.apiError('/dice-roll-bets', err)
    } finally {
      setPlacingBet(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepting-bets': return 'bg-green-500/20 text-green-400'
      case 'closed': return 'bg-yellow-500/20 text-yellow-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getWinnerColor = (winner, option) => {
    if (winner === option) return 'bg-green-500/30 border-green-500'
    return 'bg-gray-500/10 border-gray-500/30'
  }

  return (
    <div className={`relative flex w-full flex-col bg-[#151328] ${isLauncher ? '' : 'min-h-screen'}`}>
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
              <div className="relative">
                <DiceAnimation value={null} isRolling={true} size="medium" />
                <div className="absolute inset-0 bg-[#0dccf2] opacity-20 blur-2xl rounded-full"></div>
              </div>
              <div>
                <h1 className="text-white text-5xl font-black mb-2 bg-gradient-to-r from-[#0dccf2] to-white bg-clip-text text-transparent">
                  Dice Roll
                </h1>
                <p className="text-white/60 text-base">Play against other players or place bets on matches!</p>
              </div>
            </div>
          </div>

          {/* Game Mode Selection */}
          {!gameMode && !myGame && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setGameMode('play')}
                className="group relative bg-gradient-to-br from-[#111718] to-[#0dccf2]/10 rounded-2xl border-2 border-[#0dccf2] p-8 hover:border-[#0dccf2] hover:shadow-2xl hover:shadow-[#0dccf2]/30 transition-all transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0dccf2]/0 to-[#0dccf2]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-[#0dccf2]/20 rounded-xl">
                      <span className="material-symbols-outlined text-5xl text-[#0dccf2]">person</span>
                    </div>
                    <h2 className="text-white text-3xl font-black">Play</h2>
                  </div>
                  <p className="text-white/70 text-base leading-relaxed">Match with another player and roll dice. Winner takes all the pot!</p>
                  <div className="mt-4 flex items-center gap-2 text-[#0dccf2] text-sm font-semibold">
                    <span>Start Playing</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setGameMode('bet')}
                className="group relative bg-gradient-to-br from-[#111718] to-purple-500/10 rounded-2xl border-2 border-purple-500 p-8 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/30 transition-all transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <span className="material-symbols-outlined text-5xl text-purple-400">casino</span>
                    </div>
                    <h2 className="text-white text-3xl font-black">Place Bet</h2>
                  </div>
                  <p className="text-white/70 text-base leading-relaxed">Bet on existing matches and watch the action unfold in real-time!</p>
                  <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-semibold">
                    <span>View Matches</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Back Button */}
          {(gameMode || myGame) && (
            <button
              onClick={() => {
                setGameMode(null)
                setMyGame(null)
                setMatchmakingStatus(null)
              }}
              className="mb-4 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back to Options</span>
            </button>
          )}

          {/* Balance Card */}
          <div className="mb-6 bg-[#111718] rounded-xl border border-[#3b5054] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Your Balance</p>
                <p className="text-white text-2xl font-bold">₺{balance.toFixed(2)}</p>
              </div>
              <button
                onClick={() => router.push('/deposit')}
                className="px-4 py-2 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors"
              >
                Deposit
              </button>
            </div>
          </div>

          {/* Play Mode - Matchmaking */}
          {gameMode === 'play' && !myGame && (
            <div className="mb-6">
              <PlayModeComponent
                balance={balance}
                matchmakingStatus={matchmakingStatus}
                setMatchmakingStatus={setMatchmakingStatus}
                setMyGame={setMyGame}
                setError={setError}
                setSuccess={setSuccess}
                fetchUserData={fetchUserData}
                setGameMode={setGameMode}
              />
            </div>
          )}

          {/* My Game - Player vs Player */}
          {myGame && (
            <div className="mb-6">
              <PlayerVsPlayerGame
                game={myGame}
                user={user}
                setMyGame={setMyGame}
                setError={setError}
                setSuccess={setSuccess}
                fetchUserData={fetchUserData}
                setGameMode={setGameMode}
                setMatchmakingStatus={setMatchmakingStatus}
                authAPI={authAPI}
                diceRollGameAPI={diceRollGameAPI}
              />
            </div>
          )}

          {/* Bet Mode - Existing Betting Interface */}
          {gameMode === 'bet' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Game Section */}
              <div className="lg:col-span-2">
                {loading ? (
                  <div className="bg-[#111718] rounded-xl border border-[#3b5054] p-8 text-center">
                    <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent mx-auto"></div>
                    <p className="text-white/60 mt-4">Loading game...</p>
                  </div>
                ) : !activeGame ? (
                  <div className="bg-[#111718] rounded-xl border border-[#3b5054] p-8 text-center">
                    <span className="material-symbols-outlined text-6xl text-white/40 mb-4">casino</span>
                    <p className="text-white text-xl font-bold mb-2">No Active Game</p>
                    <p className="text-white/60">Wait for admin to create a new game</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Game Card */}
                    <div className="bg-[#111718] rounded-xl border border-[#3b5054] overflow-hidden">
                      {/* Game Header */}
                      <div className="bg-[#1b2527] px-6 py-4 border-b border-[#3b5054]">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-white text-xl font-bold">Game #{activeGame.gameNumber}</h2>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(activeGame.status)}`}>
                              {activeGame.status === 'accepting-bets' ? 'Accepting Bets' : activeGame.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-white/60 text-sm">Total Bets</p>
                            <p className="text-white text-lg font-bold">{activeGame.totalBets || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* Players Section */}
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          {/* Player 1 */}
                          <div
                            className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${selectedOption === 'player1'
                              ? 'bg-[#0dccf2]/20 border-[#0dccf2]'
                              : 'bg-[#1b2527] border-[#3b5054] hover:border-[#0dccf2]/50'
                              }`}
                            onClick={() => (activeGame.status === 'accepting-bets' || (activeGame.gameType === 'player-vs-player' && activeGame.status === 'in-progress')) && setSelectedOption('player1')}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-white font-bold text-lg">{activeGame.options?.player1?.name || 'Player 1'}</h3>
                              {selectedOption === 'player1' && (
                                <span className="material-symbols-outlined text-[#0dccf2]">check_circle</span>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Dice Range:</span>
                                <span className="text-white font-semibold">1-3</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Bets:</span>
                                <span className="text-white font-semibold">{activeGame.options?.player1?.betCount || 0}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Total:</span>
                                <span className="text-white font-semibold">₺{(activeGame.options?.player1?.totalBetAmount || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Player 2 */}
                          <div
                            className={`rounded-xl border-2 p-5 cursor-pointer transition-all transform hover:scale-105 ${selectedOption === 'player2'
                              ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/30'
                              : 'bg-[#1b2527] border-[#3b5054] hover:border-purple-500/50'
                              }`}
                            onClick={() => (activeGame.status === 'accepting-bets' || (activeGame.gameType === 'player-vs-player' && activeGame.status === 'in-progress')) && setSelectedOption('player2')}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400">person_outline</span>
                                {activeGame.options?.player2?.name || 'Player 2'}
                              </h3>
                              {selectedOption === 'player2' && (
                                <span className="material-symbols-outlined text-purple-400 animate-pulse">check_circle</span>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm bg-purple-500/10 rounded-lg p-2">
                                <span className="text-white/60">Dice Range:</span>
                                <span className="text-purple-400 font-bold">4-6</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Bets:</span>
                                <span className="text-white font-semibold">{activeGame.options?.player2?.betCount || 0}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Total:</span>
                                <span className="text-purple-400 font-bold">₺{(activeGame.options?.player2?.totalBetAmount || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Betting Interface */}
                        {(activeGame.status === 'accepting-bets' || (activeGame.gameType === 'player-vs-player' && activeGame.status === 'in-progress')) && (
                          <div className="bg-[#1b2527] rounded-lg p-4 border border-[#3b5054]">
                            <p className="text-white/60 text-sm mb-3">Bet Amount</p>

                            {/* Quick Bet Buttons */}
                            <div className="flex gap-2 mb-4 flex-wrap">
                              {quickBetAmounts.map(amount => (
                                <button
                                  key={amount}
                                  onClick={() => handleBetAmountChange(amount)}
                                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${betAmount === amount
                                    ? 'bg-[#0dccf2] text-black'
                                    : 'bg-[#283639] text-white hover:bg-[#3b5054]'
                                    }`}
                                >
                                  ₺{amount}
                                </button>
                              ))}
                            </div>

                            {/* Custom Amount Input */}
                            <div className="mb-4">
                              <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)}
                                placeholder="Enter custom amount"
                                className="w-full h-12 px-4 bg-[#283639] text-white rounded-lg border-none focus:ring-2 focus:ring-[#0dccf2]"
                                min="1"
                                step="0.01"
                              />
                            </div>

                            {/* Place Bet Button */}
                            <button
                              onClick={handlePlaceBet}
                              disabled={placingBet || !selectedOption || !betAmount || parseFloat(betAmount) <= 0}
                              className="w-full h-12 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {placingBet ? 'Placing Bet...' : `Place Bet on ${selectedOption === 'player1' ? activeGame.options?.player1?.name : activeGame.options?.player2?.name}`}
                            </button>

                            {/* Potential Win Display */}
                            {betAmount && selectedOption && (
                              <div className="mt-4 p-3 bg-[#0dccf2]/10 rounded-lg border border-[#0dccf2]/30">
                                <div className="flex justify-between text-sm">
                                  <span className="text-white/60">Potential Win:</span>
                                  <span className="text-[#0dccf2] font-bold">
                                    ₺{(parseFloat(betAmount) * (activeGame.payoutMultiplier || 2.0)).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Game Result (if completed) */}
                        {activeGame.status === 'completed' && activeGame.selectedWinner && (
                          <div className="mt-6 p-6 bg-gradient-to-br from-green-500/20 to-[#1b2527] rounded-xl border-2 border-green-500/50 shadow-lg">
                            <div className="flex items-center justify-center gap-4 mb-4">
                              <span className="material-symbols-outlined text-green-400 text-4xl">emoji_events</span>
                              <div>
                                <p className="text-white/60 text-sm mb-1">Game Result</p>
                                <p className="text-white font-black text-2xl">
                                  Winner: {activeGame.selectedWinner === 'player1' ? activeGame.options?.player1?.name : activeGame.options?.player2?.name}
                                </p>
                              </div>
                            </div>
                            {activeGame.diceResult && (
                              <div className="flex items-center justify-center gap-3">
                                <DiceAnimation value={activeGame.diceResult} isRolling={false} size="medium" />
                                <span className="text-[#0dccf2] font-bold text-xl">Dice: {activeGame.diceResult}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                    {success && (
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                        <p className="text-green-400 text-sm">{success}</p>
                      </div>
                    )}

                    {/* PvP Matches Section */}
                    {pvpGames.length > 0 && (
                      <div className="bg-[#111718] rounded-xl border border-[#3b5054] overflow-hidden">
                        <div className="bg-[#1b2527] px-6 py-4 border-b border-[#3b5054]">
                          <h3 className="text-white text-xl font-bold">🎮 Active PvP Matches</h3>
                          <p className="text-white/60 text-sm mt-1">Bet on live player vs player matches</p>
                        </div>
                        <div className="p-6 space-y-4">
                          {pvpGames.map((pvpGame) => (
                            <div key={pvpGame._id} className="bg-[#1b2527] rounded-lg border border-[#3b5054] p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="text-white font-bold">Game #{pvpGame.gameNumber}</h4>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(pvpGame.status)}`}>
                                    {pvpGame.status === 'in-progress' ? 'In Progress' : 'Waiting for Admin'}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-3 bg-[#0dccf2]/10 rounded-lg border border-[#0dccf2]/30">
                                  <p className="text-white/60 text-xs mb-1">Player 1</p>
                                  <p className="text-white font-bold">{pvpGame.players.player1.username}</p>
                                  {pvpGame.players.player1.diceRoll && (
                                    <p className="text-[#0dccf2] text-sm mt-1">Roll: {pvpGame.players.player1.diceRoll}</p>
                                  )}
                                  <p className="text-white/60 text-xs mt-2">
                                    {pvpGame.betStats?.player1Bets || 0} bets • ₺{(pvpGame.betStats?.player1Total || 0).toFixed(2)}
                                  </p>
                                </div>
                                <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                                  <p className="text-white/60 text-xs mb-1">Player 2</p>
                                  <p className="text-white font-bold">{pvpGame.players.player2.username}</p>
                                  {pvpGame.players.player2.diceRoll && (
                                    <p className="text-purple-400 text-sm mt-1">Roll: {pvpGame.players.player2.diceRoll}</p>
                                  )}
                                  <p className="text-white/60 text-xs mt-2">
                                    {pvpGame.betStats?.player2Bets || 0} bets • ₺{(pvpGame.betStats?.player2Total || 0).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              {pvpGame.status === 'in-progress' && (
                                <button
                                  onClick={() => {
                                    // Set this as active game for betting
                                    setActiveGame({
                                      ...pvpGame,
                                      gameType: 'player-vs-player',
                                      payoutMultiplier: 2.0
                                    })
                                    setSelectedOption(null)
                                    setBetAmount('')
                                  }}
                                  className="w-full px-4 py-2 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors"
                                >
                                  Bet on This Match
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Live Match View - Right Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {activeGame && (
                  <>
                    {/* Live Match Status */}
                    <div className="bg-[#111718] rounded-xl border border-[#3b5054] overflow-hidden">
                      <div className="bg-[#1b2527] px-4 py-3 border-b border-[#3b5054]">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                          <h3 className="text-white font-bold text-lg">LIVE MATCH</h3>
                        </div>
                        <p className="text-white/60 text-xs mt-1">Game #{activeGame.gameNumber}</p>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center flex-1">
                            <p className="text-white/60 text-xs mb-1">Player 1</p>
                            <p className="text-white font-bold text-lg">{activeGame.options?.player1?.name || 'Player 1'}</p>
                            <p className="text-[#0dccf2] text-sm mt-1">
                              {activeGame.betStats?.player1Bets || 0} bets • ₺{(activeGame.betStats?.player1Total || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="px-4 text-white/40">VS</div>
                          <div className="text-center flex-1">
                            <p className="text-white/60 text-xs mb-1">Player 2</p>
                            <p className="text-white font-bold text-lg">{activeGame.options?.player2?.name || 'Player 2'}</p>
                            <p className="text-[#0dccf2] text-sm mt-1">
                              {activeGame.betStats?.player2Bets || 0} bets • ₺{(activeGame.betStats?.player2Total || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#1b2527] rounded-lg p-3 mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/60">Total Bets:</span>
                            <span className="text-white font-bold">{activeGame.totalBets || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Total Amount:</span>
                            <span className="text-white font-bold">₺{(activeGame.totalBetAmount || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Players */}
                    <div className="bg-[#111718] rounded-xl border border-[#3b5054] overflow-hidden">
                      <div className="bg-[#1b2527] px-4 py-3 border-b border-[#3b5054]">
                        <h3 className="text-white font-bold">🎮 Live Players</h3>
                        <p className="text-white/60 text-xs mt-1">{livePlayers.length} players betting</p>
                      </div>

                      <div className="p-4 max-h-[300px] overflow-y-auto">
                        {livePlayers.length === 0 ? (
                          <p className="text-white/60 text-sm text-center py-4">No players yet</p>
                        ) : (
                          <div className="space-y-2">
                            {livePlayers.map((player, idx) => (
                              <div key={idx} className="bg-[#1b2527] rounded-lg p-3 border border-[#3b5054]">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                    <span className="text-white font-semibold text-sm">{player.username}</span>
                                  </div>
                                  <span className="text-white/60 text-xs">₺{player.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex gap-2 text-xs">
                                  {player.player1Bets > 0 && (
                                    <span className="bg-[#0dccf2]/20 text-[#0dccf2] px-2 py-1 rounded">
                                      P1: {player.player1Bets}
                                    </span>
                                  )}
                                  {player.player2Bets > 0 && (
                                    <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                      P2: {player.player2Bets}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Live Bet Feed */}
                    <div className="bg-[#111718] rounded-xl border border-[#3b5054] overflow-hidden">
                      <div className="bg-[#1b2527] px-4 py-3 border-b border-[#3b5054]">
                        <h3 className="text-white font-bold">⚡ Live Bet Feed</h3>
                        <p className="text-white/60 text-xs mt-1">Recent bets in real-time</p>
                      </div>

                      <div className="p-4 max-h-[300px] overflow-y-auto">
                        {liveBets.length === 0 ? (
                          <p className="text-white/60 text-sm text-center py-4">No bets yet</p>
                        ) : (
                          <div className="space-y-2">
                            {liveBets.map((bet) => (
                              <div
                                key={bet.id}
                                className="bg-[#1b2527] rounded-lg p-3 border border-[#3b5054]"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#0dccf2] text-sm">
                                      {bet.option === 'player1' ? 'person' : 'person_outline'}
                                    </span>
                                    <span className="text-white font-semibold text-sm">{bet.username}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${bet.option === 'player1'
                                      ? 'bg-[#0dccf2]/20 text-[#0dccf2]'
                                      : 'bg-purple-500/20 text-purple-400'
                                      }`}>
                                      {bet.option === 'player1' ? 'P1' : 'P2'}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-white font-bold text-sm">₺{bet.amount.toFixed(2)}</span>
                                    <p className="text-white/40 text-xs">
                                      {bet.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Recent Games History */}
                {gameHistory.length > 0 && (
                  <div className="bg-[#111718] rounded-xl border border-[#3b5054] overflow-hidden">
                    <div className="bg-[#1b2527] px-4 py-3 border-b border-[#3b5054]">
                      <h3 className="text-white font-bold">📜 Recent Games</h3>
                    </div>
                    <div className="p-4 max-h-[300px] overflow-y-auto">
                      <div className="space-y-2">
                        {gameHistory.slice(0, 5).map((game) => (
                          <div key={game._id} className="bg-[#1b2527] rounded-lg p-3 border border-[#3b5054]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-semibold text-sm">Game #{game.gameNumber}</span>
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(game.status)}`}>
                                {game.status}
                              </span>
                            </div>
                            {game.winner && (
                              <p className="text-white/60 text-xs">
                                Winner: {game.winner === 'player1' ? 'Player 1' : 'Player 2'}
                                {game.winningRoll && ` (${game.winningRoll})`}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* My Bets */}
                <div className="bg-[#111718] rounded-xl border border-[#3b5054] overflow-hidden">
                  <div className="bg-[#1b2527] px-4 py-3 border-b border-[#3b5054]">
                    <h3 className="text-white font-bold">💰 My Bets</h3>
                  </div>
                  <div className="p-4 max-h-[300px] overflow-y-auto">
                    {myBets.length === 0 ? (
                      <p className="text-white/60 text-sm text-center py-4">No bets yet</p>
                    ) : (
                      <div className="space-y-2">
                        {myBets.map(bet => (
                          <div key={bet._id} className="bg-[#1b2527] rounded-lg p-3 border border-[#3b5054]">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-white font-semibold text-sm">Game #{bet.gameNumber}</span>
                              <span className={`px-2 py-1 rounded text-xs ${bet.status === 'won' ? 'bg-green-500/20 text-green-400' :
                                bet.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {bet.status}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-white/60 text-xs">
                                Bet: ₺{bet.betAmount.toFixed(2)} on {bet.selectedOption === 'player1' ? 'Player 1' : 'Player 2'}
                              </p>
                              {bet.winAmount > 0 && (
                                <p className="text-green-400 text-xs font-semibold">
                                  Win: ₺{bet.winAmount.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Play Mode Component
function PlayModeComponent({ balance, matchmakingStatus, setMatchmakingStatus, setMyGame, setError, setSuccess, fetchUserData, setGameMode }) {
  const [betAmount, setBetAmount] = useState('')
  const [joining, setJoining] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)

  const checkMatchmakingStatus = async () => {
    if (checkingStatus) return
    setCheckingStatus(true)
    try {
      const response = await diceRollGameAPI.getMatchmakingStatus()
      const data = response.data?.data || response.data

      if (data.matched && data.game) {
        setMyGame(data.game)
        if (setGameMode) {
          setGameMode('play')
        }
        await fetchUserData()
        if (setMatchmakingStatus) {
          setMatchmakingStatus(null)
        }
      } else if (data.inQueue) {
        if (setMatchmakingStatus) {
          setMatchmakingStatus(data)
        }
      } else {
        if (setMatchmakingStatus) {
          setMatchmakingStatus(null)
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking matchmaking status:', err)
      }
    } finally {
      setCheckingStatus(false)
    }
  }

  useEffect(() => {
    if (matchmakingStatus?.inQueue) {
      const interval = setInterval(async () => {
        await checkMatchmakingStatus()
      }, 2000) // Check every 2 seconds
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchmakingStatus])

  const joinQueue = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      setError('Please enter a valid bet amount')
      return
    }
    if (parseFloat(betAmount) > balance) {
      setError('Insufficient balance')
      return
    }

    setJoining(true)
    setError('')
    try {
      // First check if already in queue
      const statusResponse = await diceRollGameAPI.getMatchmakingStatus()
      const statusData = statusResponse.data?.data || statusResponse.data

      if (statusData.inQueue) {
        setMatchmakingStatus(statusData)
        setSuccess('Already in queue, searching for opponent...')
        setJoining(false)
        return
      }

      const response = await diceRollGameAPI.joinQueue({ betAmount: parseFloat(betAmount) })
      const data = response.data?.data || response.data

      if (data.matched && data.game) {
        setMyGame(data.game)
        if (setGameMode) {
          setGameMode('play')
        }
        setSuccess('Match found!')
        await fetchUserData()
      } else if (data.queue) {
        if (setMatchmakingStatus) {
          setMatchmakingStatus({ inQueue: true, queue: data.queue })
        }
        setSuccess('Searching for opponent...')
      } else {
        if (setMatchmakingStatus) {
          setMatchmakingStatus({ inQueue: true })
        }
        setSuccess('Searching for opponent...')
      }
    } catch (err) {
      // Handle 409 conflict - user already in queue
      if (err.response?.status === 409) {
        // Try to get current status
        try {
          const statusResponse = await diceRollGameAPI.getMatchmakingStatus()
          const statusData = statusResponse.data?.data || statusResponse.data
          if (statusData.inQueue) {
            setMatchmakingStatus(statusData)
            setSuccess('Already in queue, searching for opponent...')
          } else {
            setError('Please try again')
          }
        } catch {
          setError('Already in queue. Please wait...')
        }
      } else {
        setError(err.response?.data?.message || 'Failed to join queue')
      }
    } finally {
      setJoining(false)
    }
  }

  const leaveQueue = async () => {
    try {
      await diceRollGameAPI.leaveQueue()
      setMatchmakingStatus(null)
      setSuccess('Left queue')
      await fetchUserData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave queue')
    }
  }

  return (
    <div className="bg-[#111718] rounded-xl border border-[#3b5054] p-6">
      <h2 className="text-white text-2xl font-bold mb-4">🎮 Play Mode</h2>

      {!matchmakingStatus?.inQueue ? (
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Bet Amount</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter bet amount"
              className="w-full h-12 px-4 bg-[#283639] text-white rounded-lg border-none focus:ring-2 focus:ring-[#0dccf2]"
              min="1"
              step="0.01"
            />
            <p className="text-white/50 text-xs mt-1">You&apos;ll be matched with a player with a similar bet amount</p>
          </div>
          <button
            onClick={joinQueue}
            disabled={joining || !betAmount || parseFloat(betAmount) <= 0}
            className="w-full h-12 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50"
          >
            {joining ? 'Joining...' : 'Find Opponent'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="size-16 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-bold mb-2">Searching for opponent...</p>
          <p className="text-white/60 text-sm mb-4">Bet Amount: ₺{matchmakingStatus.queue?.betAmount?.toFixed(2)}</p>
          <button
            onClick={leaveQueue}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Cancel Search
          </button>
        </div>
      )}
    </div>
  )
}

// Player vs Player Game Component
function PlayerVsPlayerGame({ game, user, setMyGame, setError, setSuccess, fetchUserData, setGameMode, setMatchmakingStatus, authAPI, diceRollGameAPI }) {
  const [rolling, setRolling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showRollAnimation, setShowRollAnimation] = useState(false)

  // Reset animation state when game changes
  useEffect(() => {
    if (!game || game.status === 'completed') {
      setShowRollAnimation(false)
      setRolling(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?._id, game?.status])

  const refreshGame = async () => {
    if (refreshing) return // Prevent multiple simultaneous refreshes
    setRefreshing(true)
    try {
      const response = await diceRollGameAPI.getGame(game._id)
      const data = response.data?.data || response.data
      const updatedGame = data.game || data
      setMyGame(updatedGame)

      // If game is completed, stop animation and refresh user data for balance
      if (updatedGame.status === 'completed') {
        setShowRollAnimation(false)
        // Refresh user data to get updated balance
        await fetchUserData()
        // Update localStorage with new balance
        try {
          if (authAPI) {
            const { updateUserData } = await import('@/utils/auth')
            const userResponse = await authAPI.me()
            if (userResponse?.data) {
              updateUserData(userResponse.data)
            }
          }
        } catch (err) {
          // Silently fail - balance will update on next refresh
          if (process.env.NODE_ENV === 'development') {
            console.error('Error updating balance in refreshGame:', err)
          }
        }
      }
    } catch (err) {
      // Ignore errors silently in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error refreshing game:', err)
      }
    } finally {
      setRefreshing(false)
    }
  }

  // Reset animation state when game changes or is cleared
  useEffect(() => {
    if (!game || game.status === 'completed') {
      setShowRollAnimation(false)
      setRolling(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?._id, game?.status])

  useEffect(() => {
    if (game.status === 'in-progress') {
      const interval = setInterval(() => {
        refreshGame()
      }, 2000) // Refresh every 2 seconds for better real-time updates
      return () => clearInterval(interval)
    } else if (game.status === 'completed') {
      // Refresh once when completed to get final balance
      refreshGame()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.status, game._id]) // Include game._id to reset when game changes

  const rollDice = async () => {
    if (rolling || showRollAnimation) return // Prevent double clicks

    setRolling(true)
    setShowRollAnimation(true)
    setError('')
    setSuccess('')

    try {
      // Show animation for 2 seconds before making API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await diceRollGameAPI.rollDice(game._id)
      const data = response?.data?.data || response?.data
      const updatedGame = data?.game || data

      if (!updatedGame) {
        throw new Error('Invalid game data received')
      }

      setMyGame(updatedGame)
      setShowRollAnimation(false)

      if (data?.isDraw) {
        setSuccess('Draw! Both players rolled the same number. Please roll again!')
        // Refresh game to reset state
        await refreshGame()
      } else if (data?.isComplete || data?.bothRolled || updatedGame.status === 'completed') {
        // Game is completed (winner auto-selected)
        if (updatedGame.status === 'completed' && updatedGame.selectedWinner) {
          const isWinner = (updatedGame.selectedWinner === 'player1' && isPlayer1) ||
            (updatedGame.selectedWinner === 'player2' && isPlayer2)
          setSuccess(isWinner ? '🎉 You won! Balance updated.' : 'Game completed. You lost.')

          // Update balance immediately
          await fetchUserData()
          try {
            if (authAPI) {
              const userResponse = await authAPI.me()
              if (userResponse?.data) {
                const { updateUserData } = await import('@/utils/auth')
                updateUserData(userResponse.data)
              }
            }
          } catch (err) {
            // Silently fail
            if (process.env.NODE_ENV === 'development') {
              console.error('Error updating balance:', err)
            }
          }
        } else {
          setSuccess('Both players have rolled! Winner will be determined automatically...')
        }
        // Refresh game to show final state and update balance
        await refreshGame()
      } else {
        setSuccess('Dice rolled! Waiting for opponent...')
        // Refresh game to see opponent's roll if they rolled
        await refreshGame()
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to roll dice'
      setError(errorMessage)
      setShowRollAnimation(false)
      if (process.env.NODE_ENV === 'development') {
        console.error('Roll dice error:', err)
      }
    } finally {
      setRolling(false)
    }
  }

  const isPlayer1 = game.players?.player1?.user?.toString() === user?._id?.toString()
  const isPlayer2 = game.players?.player2?.user?.toString() === user?._id?.toString()
  const myRoll = isPlayer1 ? game.players?.player1?.diceRoll : game.players?.player2?.diceRoll
  const opponentRoll = isPlayer1 ? game.players?.player2?.diceRoll : game.players?.player1?.diceRoll
  const opponentUsername = isPlayer1 ? game.players?.player2?.username : game.players?.player1?.username
  const canRoll = (isPlayer1 && !game.players?.player1?.diceRoll) || (isPlayer2 && !game.players?.player2?.diceRoll)
  const bothRolled = game.players?.player1?.diceRoll && game.players?.player2?.diceRoll
  const isDraw = bothRolled && myRoll === opponentRoll && game.status === 'in-progress'

  return (
    <div className="bg-[#111718] rounded-xl border border-[#3b5054] p-6 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-white text-3xl font-black mb-2">Game #{game.gameNumber}</h2>
        <div className="inline-block px-4 py-1 bg-[#0dccf2]/20 text-[#0dccf2] rounded-full text-sm font-semibold">
          Player vs Player
        </div>
      </div>

      {/* Center Dice Display */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {showRollAnimation ? (
            <DiceAnimation value={null} isRolling={true} size="xlarge" />
          ) : bothRolled ? (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">You</p>
                <DiceAnimation value={myRoll || 0} isRolling={false} size="large" />
                <p className="text-[#0dccf2] font-black text-2xl mt-2">{myRoll || 0}</p>
              </div>
              <div className="text-white/40 text-4xl font-black">VS</div>
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Opponent</p>
                <DiceAnimation value={opponentRoll || 0} isRolling={false} size="large" />
                <p className="text-purple-400 font-black text-2xl mt-2">{opponentRoll || 0}</p>
              </div>
            </div>
          ) : myRoll ? (
            <div className="text-center">
              <p className="text-white/60 text-sm mb-2">Your Roll</p>
              <DiceAnimation value={myRoll} isRolling={false} size="xlarge" />
              <p className="text-[#0dccf2] font-black text-3xl mt-4">{myRoll}</p>
            </div>
          ) : opponentRoll ? (
            <div className="text-center">
              <p className="text-white/60 text-sm mb-2">Opponent Rolled</p>
              <DiceAnimation value={opponentRoll} isRolling={false} size="xlarge" />
              <p className="text-purple-400 font-black text-3xl mt-4">{opponentRoll}</p>
            </div>
          ) : (
            <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border-4 border-gray-600 flex items-center justify-center">
              <span className="text-white/40 text-sm">Waiting for rolls...</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-br from-[#1b2527] to-[#0dccf2]/10 rounded-xl p-5 border-2 border-[#0dccf2]/30 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#0dccf2]">person</span>
            <p className="text-white/60 text-sm">You</p>
          </div>
          <p className="text-white font-bold text-xl mb-3">{isPlayer1 ? game.players?.player1?.username : game.players?.player2?.username}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-[#0dccf2]/10 rounded-lg p-2">
              <span className="text-white/60 text-xs">Bet:</span>
              <span className="text-[#0dccf2] font-bold">₺{(isPlayer1 ? game.players?.player1?.betAmount : game.players?.player2?.betAmount)?.toFixed(2)}</span>
            </div>
            {myRoll && (
              <div className="mt-4 p-3 bg-[#0dccf2]/20 rounded-lg border border-[#0dccf2]/50">
                <p className="text-white/60 text-xs mb-1">Your Roll:</p>
                <div className="flex justify-center">
                  <DiceAnimation value={myRoll} isRolling={false} size="medium" />
                </div>
                <p className="text-[#0dccf2] text-2xl font-black text-center mt-2">{myRoll}</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1b2527] to-purple-500/10 rounded-xl p-5 border-2 border-purple-500/30 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-purple-400">person_outline</span>
            <p className="text-white/60 text-sm">Opponent</p>
          </div>
          <p className="text-white font-bold text-xl mb-3">{opponentUsername}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-purple-500/10 rounded-lg p-2">
              <span className="text-white/60 text-xs">Bet:</span>
              <span className="text-purple-400 font-bold">₺{(isPlayer1 ? game.players?.player2?.betAmount : game.players?.player1?.betAmount)?.toFixed(2)}</span>
            </div>
            {opponentRoll && (
              <div className="mt-4 p-3 bg-purple-500/20 rounded-lg border border-purple-500/50">
                <p className="text-white/60 text-xs mb-1">Opponent Roll:</p>
                <div className="flex justify-center">
                  <DiceAnimation value={opponentRoll} isRolling={false} size="medium" />
                </div>
                <p className="text-purple-400 text-2xl font-black text-center mt-2">{opponentRoll}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {game.status === 'completed' && game.selectedWinner && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
          <p className="text-green-400 font-bold text-lg text-center">
            Winner: {game.selectedWinner === 'player1' ? game.players?.player1?.username : game.players?.player2?.username}
          </p>
          {(isPlayer1 && game.selectedWinner === 'player1') || (isPlayer2 && game.selectedWinner === 'player2') ? (
            <p className="text-green-400 text-center mt-2">🎉 You won!</p>
          ) : (
            <p className="text-red-400 text-center mt-2">You lost</p>
          )}
        </div>
      )}

      {game.status === 'in-progress' && canRoll && (
        <button
          onClick={rollDice}
          disabled={rolling || showRollAnimation}
          className="w-full h-14 bg-gradient-to-r from-[#0dccf2] to-[#0bb5d9] text-black rounded-xl font-black text-lg hover:from-[#0bb5d9] hover:to-[#0dccf2] transition-all transform hover:scale-105 shadow-lg shadow-[#0dccf2]/50 disabled:opacity-50 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {rolling || showRollAnimation ? (
            <>
              <DiceAnimation value={null} isRolling={true} size="small" />
              <span>Rolling Dice...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">casino</span>
              <span>Roll Dice</span>
            </>
          )}
        </button>
      )}

      {isDraw && (
        <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-[#1b2527] rounded-xl border-2 border-yellow-500/50 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-symbols-outlined text-yellow-400 text-2xl">refresh</span>
            <p className="text-white font-bold text-lg">Draw!</p>
          </div>
          <p className="text-white/70 text-sm mb-4">Both players rolled {myRoll}. Please roll again!</p>
        </div>
      )}

      {game.status === 'in-progress' && !canRoll && !bothRolled && !isDraw && (
        <div className="text-center p-6 bg-[#1b2527] rounded-xl border border-[#3b5054]">
          <div className="size-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-white font-semibold mb-1">
            {opponentRoll ? 'Opponent has rolled! Waiting for results...' : 'Waiting for opponent to roll...'}
          </p>
          <p className="text-white/60 text-sm">
            {myRoll ? `Your roll: ${myRoll}` : 'Your turn will come next!'}
          </p>
        </div>
      )}

      {(game.status === 'waiting-for-admin' || game.status === 'completed') && bothRolled && (
        <div className="space-y-4">
          <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-[#1b2527] rounded-xl border-2 border-green-500/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="material-symbols-outlined text-green-400 text-2xl">check_circle</span>
              <p className="text-white font-bold text-lg">
                {game.status === 'completed' ? 'Game Completed!' : 'Both players have rolled!'}
              </p>
            </div>
            {game.status === 'completed' && game.selectedWinner && (
              <>
                <p className="text-green-400 text-sm mb-2">
                  Winner: {game.selectedWinner === 'player1' ? game.players?.player1?.username : game.players?.player2?.username}
                </p>
                {((isPlayer1 && game.selectedWinner === 'player1') || (isPlayer2 && game.selectedWinner === 'player2')) && (
                  <p className="text-yellow-400 text-sm mb-2">🎉 You won! Your balance has been updated.</p>
                )}
              </>
            )}
            <p className="text-white/60 text-sm mb-4">
              {game.status === 'completed'
                ? 'You can now play again or place bets!'
                : 'Winner will be automatically determined based on dice rolls'}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={async () => {
                  if (refreshing) return // Prevent double clicks

                  setError('')
                  setSuccess('')

                  try {
                    const response = await diceRollGameAPI.endGameSession(game._id)

                    if (response?.data?.success || response?.data?.data) {
                      const message = response.data?.message || response.data?.data?.message || 'Game session ended. You can now play again or place bets!'
                      setSuccess(message)

                      // Update balance in localStorage
                      try {
                        if (authAPI) {
                          const userResponse = await authAPI.me()
                          if (userResponse?.data) {
                            const { updateUserData } = await import('@/utils/auth')
                            updateUserData(userResponse.data)
                          }
                        }
                      } catch (err) {
                        // Silently fail - balance will update on next refresh
                        if (process.env.NODE_ENV === 'development') {
                          console.error('Error updating user data:', err)
                        }
                      }

                      // Clear the game state immediately to hide previous results
                      setMyGame(null)
                      if (setGameMode) {
                        setGameMode(null)
                      }

                      // Set flag to prevent auto-restore of this game
                      setGameSessionEnded(true)

                      // Refresh user data after clearing game
                      await fetchUserData()

                      // Reset the flag after a delay to allow new games
                      setTimeout(() => {
                        setGameSessionEnded(false)
                      }, 5000)
                    } else {
                      throw new Error('Invalid response from server')
                    }
                  } catch (err) {
                    const errorMessage = err.response?.data?.message || err.message || 'Failed to end game session'
                    setError(errorMessage)
                    if (process.env.NODE_ENV === 'development') {
                      console.error('End game session error:', err)
                    }
                  }
                }}
                className="px-6 py-3 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={refreshing}
              >
                {refreshing ? 'Processing...' : 'End Game Session'}
              </button>
              {game.status === 'completed' && (
                <button
                  onClick={async () => {
                    setError('')
                    setSuccess('')

                    // Clear the previous game state immediately to hide old results
                    setMyGame(null)
                    setShowRollAnimation(false)
                    setRolling(false)

                    // Set flag to prevent auto-restore of old game
                    setGameSessionEnded(true)

                    try {
                      // Join queue again for a new game
                      const betAmount = game.players?.player1?.betAmount || game.players?.player2?.betAmount || 100
                      const response = await diceRollGameAPI.joinQueue({ betAmount })

                      if (response?.data?.data?.matched && response?.data?.data?.game) {
                        setSuccess('New match found! Starting new game...')
                        // Reset flag to allow new game
                        setGameSessionEnded(false)
                        // Set the new game after a brief moment to ensure UI updates
                        setTimeout(() => {
                          setMyGame(response.data.data.game)
                          if (setGameMode) {
                            setGameMode('play')
                          }
                        }, 100)
                        await fetchUserData()
                      } else if (response?.data?.data) {
                        setSuccess('Searching for opponent...')
                        // Reset flag to allow new game when matched
                        setGameSessionEnded(false)
                        if (setMatchmakingStatus) {
                          setMatchmakingStatus(response.data.data)
                        }
                        if (setGameMode) {
                          setGameMode('play')
                        }
                      } else {
                        throw new Error('Invalid response from server')
                      }
                    } catch (err) {
                      const errorMessage = err.response?.data?.message || err.message || 'Failed to start new game'
                      setError(errorMessage)
                      // Reset flag on error so user can try again
                      setGameSessionEnded(false)
                      if (process.env.NODE_ENV === 'development') {
                        console.error('Play again error:', err)
                      }
                    }
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
                >
                  Play Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// export default DiceRollPage

