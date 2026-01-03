'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import AdminSidebar from '@/components/AdminSidebar'
import { useTranslation } from '@/hooks/useTranslation'
import { diceRollGameAPI } from '@/lib/api'
import { log } from '@/utils/logger'
import { formatDate } from '@/utils/formatters'

function DiceGameManagement() {
  const { t } = useTranslation()
  const router = useRouter()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedGame, setSelectedGame] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [showChangeOutcomeModal, setShowChangeOutcomeModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Create game form
  const [createForm, setCreateForm] = useState({
    player1Name: 'Player 1',
    player2Name: 'Player 2',
    payoutMultiplier: '2.0'
  })

  // Select winner form
  const [winnerForm, setWinnerForm] = useState({
    winner: '',
    diceResult: '',
    adminSetResult: ''
  })

  // Change outcome form
  const [outcomeForm, setOutcomeForm] = useState({
    newWinner: '',
    newDiceResult: ''
  })

  useEffect(() => {
    fetchGames()
    // Refresh every 10 seconds
    const interval = setInterval(fetchGames, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchGames = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await diceRollGameAPI.getAllGames({ limit: 50 })
      // Handle response structure: { success: true, data: { games: [...] } }
      const responseData = response.data
      if (responseData?.success && responseData?.data) {
        setGames(responseData.data.games || [])
      } else if (responseData?.games) {
        setGames(responseData.games || [])
      } else {
        setGames([])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load games')
      log.apiError('/dice-roll-games', err)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const fetchGameDetails = async (gameId) => {
    try {
      const response = await diceRollGameAPI.getGame(gameId)
      return response.data?.data || response.data
    } catch (err) {
      log.apiError('/dice-roll-games/:id', err)
      return null
    }
  }

  const handleCreateGame = async () => {
    setSaving(true)
    setError('')
    try {
      await diceRollGameAPI.createGame({
        player1Name: createForm.player1Name,
        player2Name: createForm.player2Name,
        payoutMultiplier: parseFloat(createForm.payoutMultiplier)
      })
      setSuccess('Game created successfully')
      setShowCreateModal(false)
      setCreateForm({ player1Name: 'Player 1', player2Name: 'Player 2', payoutMultiplier: '2.0' })
      // Refresh games list
      setTimeout(() => {
        fetchGames()
      }, 500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create game')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseGame = async (gameId) => {
    if (!confirm('Close this game? No more bets will be accepted.')) return
    
    setSaving(true)
    setError('')
    try {
      await diceRollGameAPI.closeGame(gameId)
      setSuccess('Game closed successfully')
      fetchGames()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close game')
    } finally {
      setSaving(false)
    }
  }

  const handleSelectWinner = async () => {
    if (!selectedGame || !winnerForm.winner) {
      setError('Please select a winner')
      return
    }

    setSaving(true)
    setError('')
    try {
      await diceRollGameAPI.selectWinner(selectedGame._id, {
        winner: winnerForm.winner,
        diceResult: winnerForm.diceResult ? parseInt(winnerForm.diceResult) : undefined,
        adminSetResult: winnerForm.adminSetResult ? parseInt(winnerForm.adminSetResult) : undefined
      })
      setSuccess('Winner selected and payouts processed')
      setShowWinnerModal(false)
      setWinnerForm({ winner: '', diceResult: '', adminSetResult: '' })
      setSelectedGame(null)
      fetchGames()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to select winner')
    } finally {
      setSaving(false)
    }
  }

  const handleChangeOutcome = async () => {
    if (!selectedGame || !outcomeForm.newWinner) {
      setError('Please select a new winner')
      return
    }

    if (!confirm('Change the game outcome? This will reverse previous payouts and process new ones.')) return

    setSaving(true)
    setError('')
    try {
      await diceRollGameAPI.changeOutcome(selectedGame._id, {
        newWinner: outcomeForm.newWinner,
        newDiceResult: outcomeForm.newDiceResult ? parseInt(outcomeForm.newDiceResult) : undefined
      })
      setSuccess('Game outcome changed successfully')
      setShowChangeOutcomeModal(false)
      setOutcomeForm({ newWinner: '', newDiceResult: '' })
      setSelectedGame(null)
      fetchGames()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change outcome')
    } finally {
      setSaving(false)
    }
  }

  const openWinnerModal = async (game) => {
    const details = await fetchGameDetails(game._id)
    setSelectedGame(details?.game || game)
    setShowWinnerModal(true)
  }

  const openChangeOutcomeModal = async (game) => {
    const details = await fetchGameDetails(game._id)
    setSelectedGame(details?.game || game)
    setOutcomeForm({
      newWinner: game.selectedWinner === 'player1' ? 'player2' : 'player1',
      newDiceResult: ''
    })
    setShowChangeOutcomeModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepting-bets': return 'bg-green-500/20 text-green-400'
      case 'closed': return 'bg-yellow-500/20 text-yellow-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      case 'in-progress': return 'bg-purple-500/20 text-purple-400'
      case 'waiting-for-admin': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getGameStats = (game) => {
    const player1Total = game.options?.player1?.totalBetAmount || 0
    const player2Total = game.options?.player2?.totalBetAmount || 0
    const totalBets = player1Total + player2Total
    const multiplier = game.payoutMultiplier || 2.0

    const profitIfPlayer1Wins = totalBets - (player1Total * multiplier)
    const profitIfPlayer2Wins = totalBets - (player2Total * multiplier)

    return {
      player1Total,
      player2Total,
      totalBets,
      profitIfPlayer1Wins,
      profitIfPlayer2Wins,
      recommendedWinner: profitIfPlayer1Wins > profitIfPlayer2Wins ? 'player1' : 'player2'
    }
  }

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen w-full bg-[#151328]">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-10 ml-0 lg:ml-64 pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-white text-4xl font-black mb-2">🎲 Dice Roll Games</h1>
                <p className="text-white/60">Manage dice roll games and select winners</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors"
              >
                + Create Game
              </button>
            </div>

            {/* Messages */}
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

            {/* Games List */}
            {loading ? (
              <div className="bg-[#111718] rounded-xl border border-[#3b5054] p-10 text-center">
                <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent mx-auto"></div>
                <p className="text-white/60 mt-4">Loading games...</p>
              </div>
            ) : games.length === 0 ? (
              <div className="bg-[#111718] rounded-xl border border-[#3b5054] p-10 text-center">
                <p className="text-white/60">No games yet. Create your first game!</p>
              </div>
            ) : (
              <div className="bg-[#111718] rounded-xl border border-[#3b5054] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1b2527]">
                      <tr>
                        <th className="px-6 py-3 text-left text-white text-sm font-medium">Game #</th>
                        <th className="px-6 py-3 text-left text-white text-sm font-medium">Status</th>
                        <th className="px-6 py-3 text-left text-white text-sm font-medium">Player 1</th>
                        <th className="px-6 py-3 text-left text-white text-sm font-medium">Player 2</th>
                        <th className="px-6 py-3 text-left text-white text-sm font-medium">Total Bets</th>
                        <th className="px-6 py-3 text-left text-white text-sm font-medium">Winner</th>
                        <th className="px-6 py-3 text-left text-white text-sm font-medium">Profit</th>
                        <th className="px-6 py-3 text-left text-white text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.map(game => {
                        const stats = getGameStats(game)
                        return (
                          <tr key={game._id} className="border-t border-[#3b5054] hover:bg-[#1b2527]/50 transition-colors">
                            <td className="px-6 py-4 text-white font-bold">#{game.gameNumber}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(game.status)}`}>
                                {game.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white text-sm">
                                {game.gameType === 'player-vs-player' ? (
                                  <>
                                    <div>{game.players?.player1?.username || 'Player 1'}</div>
                                    <div className="text-white/60">Bet: ₺{(game.players?.player1?.betAmount || 0).toFixed(2)}</div>
                                    {game.players?.player1?.diceRoll && (
                                      <div className="text-[#0dccf2] text-xs">Roll: {game.players.player1.diceRoll}</div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <div>{game.options?.player1?.betCount || 0} bets</div>
                                    <div className="text-white/60">₺{stats.player1Total.toFixed(2)}</div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white text-sm">
                                {game.gameType === 'player-vs-player' ? (
                                  <>
                                    <div>{game.players?.player2?.username || 'Player 2'}</div>
                                    <div className="text-white/60">Bet: ₺{(game.players?.player2?.betAmount || 0).toFixed(2)}</div>
                                    {game.players?.player2?.diceRoll && (
                                      <div className="text-purple-400 text-xs">Roll: {game.players.player2.diceRoll}</div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <div>{game.options?.player2?.betCount || 0} bets</div>
                                    <div className="text-white/60">₺{stats.player2Total.toFixed(2)}</div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-white text-sm">
                              {game.totalBets || 0} bets<br />
                              <span className="text-white/60">₺{stats.totalBets.toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4">
                              {game.selectedWinner ? (
                                <span className="text-white font-semibold">
                                  {game.gameType === 'player-vs-player' 
                                    ? (game.selectedWinner === 'player1' ? game.players?.player1?.username : game.players?.player2?.username)
                                    : (game.selectedWinner === 'player1' ? game.options?.player1?.name : game.options?.player2?.name)
                                  }
                                </span>
                              ) : (
                                <span className="text-white/60 text-sm">Not selected</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {game.adminProfit !== undefined ? (
                                <span className={`font-semibold ${game.adminProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ₺{game.adminProfit.toFixed(2)}
                                </span>
                              ) : game.status === 'accepting-bets' || game.status === 'closed' ? (
                                <div className="text-xs">
                                  <div className="text-white/60">If P1: <span className={stats.profitIfPlayer1Wins >= 0 ? 'text-green-400' : 'text-red-400'}>₺{stats.profitIfPlayer1Wins.toFixed(2)}</span></div>
                                  <div className="text-white/60">If P2: <span className={stats.profitIfPlayer2Wins >= 0 ? 'text-green-400' : 'text-red-400'}>₺{stats.profitIfPlayer2Wins.toFixed(2)}</span></div>
                                  <div className="text-[#0dccf2] mt-1 font-semibold">→ {stats.recommendedWinner === 'player1' ? 'P1' : 'P2'}</div>
                                </div>
                              ) : (
                                <span className="text-white/60">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {game.status === 'accepting-bets' && (
                                  <button
                                    onClick={() => handleCloseGame(game._id)}
                                    className="px-3 py-1 text-yellow-400 hover:bg-[#283639] rounded text-sm transition-colors"
                                    disabled={saving}
                                  >
                                    Close
                                  </button>
                                )}
                                {((game.status === 'closed' || game.status === 'accepting-bets' || game.status === 'waiting-for-admin') && !game.selectedWinner) && (
                                  <button
                                    onClick={() => openWinnerModal(game)}
                                    className="px-3 py-1 text-green-400 hover:bg-[#283639] rounded text-sm transition-colors"
                                    disabled={saving}
                                  >
                                    Select Winner
                                  </button>
                                )}
                                {game.status === 'waiting-for-admin' && game.selectedWinner && (
                                  <span className="text-xs text-white/60">Auto-selected</span>
                                )}
                                {game.status === 'completed' && (
                                  <button
                                    onClick={() => openChangeOutcomeModal(game)}
                                    className="px-3 py-1 text-blue-400 hover:bg-[#283639] rounded text-sm transition-colors"
                                  >
                                    Change
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Create Game Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
              <h3 className="text-white text-xl font-bold mb-4">Create New Game</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Player 1 Name</label>
                  <input
                    type="text"
                    value={createForm.player1Name}
                    onChange={(e) => setCreateForm({...createForm, player1Name: e.target.value})}
                    className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Player 2 Name</label>
                  <input
                    type="text"
                    value={createForm.player2Name}
                    onChange={(e) => setCreateForm({...createForm, player2Name: e.target.value})}
                    className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Payout Multiplier</label>
                  <input
                    type="number"
                    value={createForm.payoutMultiplier}
                    onChange={(e) => setCreateForm({...createForm, payoutMultiplier: e.target.value})}
                    className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    min="1"
                    step="0.1"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateGame}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setCreateForm({ player1Name: 'Player 1', player2Name: 'Player 2', payoutMultiplier: '2.0' })
                    }}
                    className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Select Winner Modal */}
        {showWinnerModal && selectedGame && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
              <h3 className="text-white text-xl font-bold mb-4">Select Winner - Game #{selectedGame.gameNumber}</h3>
              
              {selectedGame.betStats && (
                <div className="mb-4 p-4 bg-white/5 rounded-lg">
                  <p className="text-white/70 text-sm mb-2">Bet Distribution:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Player 1:</span>
                      <span className="text-white">{selectedGame.betStats.player1Bets} bets - ₺{selectedGame.betStats.player1Total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Player 2:</span>
                      <span className="text-white">{selectedGame.betStats.player2Bets} bets - ₺{selectedGame.betStats.player2Total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Winner *</label>
                  <select
                    value={winnerForm.winner}
                    onChange={(e) => setWinnerForm({...winnerForm, winner: e.target.value})}
                    className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="">Select winner</option>
                    <option value="player1">
                      {selectedGame.gameType === 'player-vs-player' 
                        ? (selectedGame.players?.player1?.username || 'Player 1')
                        : (selectedGame.options?.player1?.name || 'Player 1')
                      }
                    </option>
                    <option value="player2">
                      {selectedGame.gameType === 'player-vs-player' 
                        ? (selectedGame.players?.player2?.username || 'Player 2')
                        : (selectedGame.options?.player2?.name || 'Player 2')
                      }
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Dice Result (1-6, optional)</label>
                  <input
                    type="number"
                    value={winnerForm.diceResult}
                    onChange={(e) => setWinnerForm({...winnerForm, diceResult: e.target.value})}
                    className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    min="1"
                    max="6"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Override Result (1-6, optional)</label>
                  <input
                    type="number"
                    value={winnerForm.adminSetResult}
                    onChange={(e) => setWinnerForm({...winnerForm, adminSetResult: e.target.value})}
                    className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    min="1"
                    max="6"
                  />
                  <p className="text-white/50 text-xs mt-1">This will override the dice result</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSelectWinner}
                    disabled={saving || !winnerForm.winner}
                    className="flex-1 px-4 py-2 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Processing...' : 'Select Winner'}
                  </button>
                  <button
                    onClick={() => {
                      setShowWinnerModal(false)
                      setWinnerForm({ winner: '', diceResult: '', adminSetResult: '' })
                      setSelectedGame(null)
                    }}
                    className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Outcome Modal */}
        {showChangeOutcomeModal && selectedGame && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
              <h3 className="text-white text-xl font-bold mb-4">Change Outcome - Game #{selectedGame.gameNumber}</h3>
              <p className="text-red-400 text-sm mb-4">⚠️ This will reverse previous payouts and process new ones!</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">New Winner *</label>
                  <select
                    value={outcomeForm.newWinner}
                    onChange={(e) => setOutcomeForm({...outcomeForm, newWinner: e.target.value})}
                    className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="">Select new winner</option>
                    <option value="player1">{selectedGame.options?.player1?.name || 'Player 1'}</option>
                    <option value="player2">{selectedGame.options?.player2?.name || 'Player 2'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">New Dice Result (1-6, optional)</label>
                  <input
                    type="number"
                    value={outcomeForm.newDiceResult}
                    onChange={(e) => setOutcomeForm({...outcomeForm, newDiceResult: e.target.value})}
                    className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    min="1"
                    max="6"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleChangeOutcome}
                    disabled={saving || !outcomeForm.newWinner}
                    className="flex-1 px-4 py-2 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Processing...' : 'Change Outcome'}
                  </button>
                  <button
                    onClick={() => {
                      setShowChangeOutcomeModal(false)
                      setOutcomeForm({ newWinner: '', newDiceResult: '' })
                      setSelectedGame(null)
                    }}
                    className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtectedRoute>
  )
}

export default function DiceGameManagementPage() {
  return (
    <AdminProtectedRoute>
      <DiceGameManagement />
    </AdminProtectedRoute>
  )
}

