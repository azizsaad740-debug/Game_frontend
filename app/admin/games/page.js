'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import AdminSidebar from '@/components/AdminSidebar'
import { adminAPI, diceRollGameAPI } from '@/lib/api'
import { formatDate } from '@/utils/formatters'
import { log } from '@/utils/logger'

function GameManagement() {
  const pathname = usePathname()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Tab state
  const [activeTab, setActiveTab] = useState('catalog') // 'catalog' or 'dice'
  
  // Dice games state
  const [diceGames, setDiceGames] = useState([])
  const [diceLoading, setDiceLoading] = useState(false)
  const [diceSaving, setDiceSaving] = useState(false)
  const [selectedDiceGame, setSelectedDiceGame] = useState(null)
  
  // Dice game forms
  const [diceCreateForm, setDiceCreateForm] = useState({
    player1Name: 'Player 1',
    player2Name: 'Player 2',
    payoutMultiplier: '2.0'
  })
  const [diceWinnerForm, setDiceWinnerForm] = useState({
    winner: '',
    diceResult: ''
  })
  const [diceOutcomeForm, setDiceOutcomeForm] = useState({
    newWinner: '',
    newDiceResult: ''
  })
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [gameTypeFilter, setGameTypeFilter] = useState('all')
  const [providerFilter, setProviderFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [providers, setProviders] = useState([])
  
  // Dice game modals
  const [showDiceCreateModal, setShowDiceCreateModal] = useState(false)
  const [showDiceWinnerModal, setShowDiceWinnerModal] = useState(false)
  const [showDiceOutcomeModal, setShowDiceOutcomeModal] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    gameType: 'slots',
    gameId: '',
    thumbnail: '',
    status: 'active',
    description: '',
    minBet: 0,
    maxBet: null,
    rtp: null,
    features: [],
    tags: [],
    isNew: false,
    isFeatured: false,
    isHot: false,
  })

const navItems = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard', href: '/admin' },
  { id: 'users', label: 'User Management', icon: 'group', href: '/admin/users' },
  { id: 'kyc', label: 'KYC Management', icon: 'badge', href: '/admin/kyc' }, // <-- Added KYC Management
  { id: 'games', label: 'Game Management', icon: 'gamepad', href: '/admin/games' },
  { id: 'betting', label: 'Betting Management', icon: 'sports_soccer', href: '/admin/betting' },
  { id: 'promotions', label: 'Promotions Management', icon: 'campaign', href: '/admin/promotions' },
  { id: 'deposits', label: 'Deposits', icon: 'arrow_downward', href: '/admin/deposits' },
  { id: 'withdrawals', label: 'Withdrawals', icon: 'arrow_upward', href: '/admin/withdrawals' },
  { id: 'tournaments', label: 'Tournaments', icon: 'emoji_events', href: '/admin/tournaments' },
  { id: 'content', label: 'Content Management', icon: 'wysiwyg', href: '/admin/content' },
]

  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchGames()
      fetchProviders()
    } else if (activeTab === 'dice') {
      fetchDiceGames()
    }
  }, [gameTypeFilter, providerFilter, statusFilter, searchQuery, currentPage, activeTab])

  // Fetch dice games
  const fetchDiceGames = async () => {
    setDiceLoading(true)
    setError('')
    try {
      const response = await diceRollGameAPI.getAllGames({ limit: 50 })
      const responseData = response.data
      if (responseData?.success && responseData?.data) {
        setDiceGames(responseData.data.games || [])
      } else if (responseData?.games) {
        setDiceGames(responseData.games || [])
      } else {
        setDiceGames([])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dice games')
      log.apiError('/dice-roll-games', err)
      setDiceGames([])
    } finally {
      setDiceLoading(false)
    }
  }

  // Refresh dice games every 10 seconds
  useEffect(() => {
    if (activeTab === 'dice') {
      const interval = setInterval(fetchDiceGames, 10000)
      return () => clearInterval(interval)
    }
  }, [activeTab])

  // Dice game handlers
  const handleDiceCreateGame = async () => {
    setDiceSaving(true)
    setError('')
    try {
      await diceRollGameAPI.createGame({
        player1Name: diceCreateForm.player1Name,
        player2Name: diceCreateForm.player2Name,
        payoutMultiplier: parseFloat(diceCreateForm.payoutMultiplier)
      })
      setSuccess('Dice game created successfully')
      setShowDiceCreateModal(false)
      setDiceCreateForm({ player1Name: 'Player 1', player2Name: 'Player 2', payoutMultiplier: '2.0' })
      setTimeout(() => {
        fetchDiceGames()
      }, 500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create dice game')
    } finally {
      setDiceSaving(false)
    }
  }

  const handleDiceCloseGame = async (gameId) => {
    if (!confirm('Close this game? No more bets will be accepted.')) return
    setDiceSaving(true)
    setError('')
    try {
      await diceRollGameAPI.closeGame(gameId)
      setSuccess('Game closed successfully')
      fetchDiceGames()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close game')
    } finally {
      setDiceSaving(false)
    }
  }

  const openDiceWinnerModal = async (game) => {
    const details = await fetchGameDetails(game._id)
    if (details) {
      setSelectedDiceGame(details.game || details)
      const stats = details.betStats || {}
      setDiceWinnerForm({
        winner: '',
        diceResult: '',
        adminSetResult: ''
      })
      setShowDiceWinnerModal(true)
    }
  }

  const handleDiceSelectWinner = async () => {
    if (!selectedDiceGame || !diceWinnerForm.winner || !diceWinnerForm.diceResult) {
      setError('Please select winner and dice result')
      return
    }
    setDiceSaving(true)
    setError('')
    try {
      await diceRollGameAPI.selectWinner(selectedDiceGame._id, {
        winner: diceWinnerForm.winner,
        winningRoll: parseInt(diceWinnerForm.diceResult)
      })
      setSuccess('Winner selected successfully')
      setShowDiceWinnerModal(false)
      setSelectedDiceGame(null)
      fetchDiceGames()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to select winner')
    } finally {
      setDiceSaving(false)
    }
  }

  const openDiceChangeModal = async (game) => {
    const details = await fetchGameDetails(game._id)
    if (details) {
      setSelectedDiceGame(details.game || details)
      setDiceOutcomeForm({
        newWinner: game.winner || '',
        newDiceResult: game.winningRoll?.toString() || ''
      })
      setShowDiceOutcomeModal(true)
    }
  }

  const handleDiceChangeOutcome = async () => {
    if (!selectedDiceGame || !diceOutcomeForm.newWinner || !diceOutcomeForm.newDiceResult) {
      setError('Please select new winner and dice result')
      return
    }
    setDiceSaving(true)
    setError('')
    try {
      await diceRollGameAPI.changeOutcome(selectedDiceGame._id, {
        newWinner: diceOutcomeForm.newWinner,
        newWinningRoll: parseInt(diceOutcomeForm.newDiceResult)
      })
      setSuccess('Outcome changed successfully')
      setShowDiceOutcomeModal(false)
      setSelectedDiceGame(null)
      fetchDiceGames()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change outcome')
    } finally {
      setDiceSaving(false)
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

  const getDiceStatusColor = (status) => {
    switch (status) {
      case 'accepting-bets': return 'bg-green-500/20 text-green-400'
      case 'closed': return 'bg-yellow-500/20 text-yellow-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const fetchGames = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 20,
      }
      
      if (searchQuery) params.search = searchQuery
      if (gameTypeFilter !== 'all') params.gameType = gameTypeFilter
      if (providerFilter !== 'all') params.provider = providerFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await adminAPI.getGames(params)
      setGames(response.data.games || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load games')
      log.apiError('/admin/games', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      const response = await adminAPI.getProviders()
      setProviders(response.data.providers || [])
    } catch (err) {
      log.apiError('/admin/games/providers', err)
    }
  }

  const handleAdd = async () => {
    setSaving(true)
    setError('')
    try {
      await adminAPI.createGame(formData)
      setSuccess('Game created successfully!')
      setShowAddModal(false)
      resetForm()
      fetchGames()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create game')
      log.apiError('/admin/games', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedGame) return
    
    setSaving(true)
    setError('')
    try {
      await adminAPI.updateGame(selectedGame._id, formData)
      setSuccess('Game updated successfully!')
      setShowEditModal(false)
      setSelectedGame(null)
      resetForm()
      fetchGames()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update game')
      log.apiError(`/admin/games/${selectedGame._id}`, err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedGame) return
    
    setSaving(true)
    setError('')
    try {
      await adminAPI.deleteGame(selectedGame._id)
      setSuccess('Game deleted successfully!')
      setShowDeleteModal(false)
      setSelectedGame(null)
      fetchGames()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete game')
      log.apiError(`/admin/games/${selectedGame._id}`, err)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      gameType: 'slots',
      gameId: '',
      thumbnail: '',
      status: 'active',
      description: '',
      minBet: 0,
      maxBet: null,
      rtp: null,
      features: [],
      tags: [],
      isNew: false,
      isFeatured: false,
      isHot: false,
    })
  }

  const openEditModal = (game) => {
    setSelectedGame(game)
    setFormData({
      name: game.name || '',
      provider: game.provider || '',
      gameType: game.gameType || 'slots',
      gameId: game.gameId || '',
      thumbnail: game.thumbnail || '',
      status: game.status || 'active',
      description: game.description || '',
      minBet: game.minBet || 0,
      maxBet: game.maxBet || null,
      rtp: game.rtp || null,
      features: game.features || [],
      tags: game.tags || [],
      isNew: game.isNew || false,
      isFeatured: game.isFeatured || false,
      isHot: game.isHot || false,
    })
    setShowEditModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400'
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getGameTypeLabel = (type) => {
    const labels = {
      slots: 'Slots',
      live_casino: 'Live Casino',
      crash: 'Crash',
      sports: 'Sports',
      live_betting: 'Live Betting'
    }
    return labels[type] || type
  }

  return (
    <div className="flex min-h-screen w-full bg-background-dark">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark overflow-y-auto ml-0 lg:ml-64 pt-16 lg:pt-0">
        <div className="layout-content-container flex flex-col w-full max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <p className="text-black dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Game Management
            </p>
            {activeTab === 'catalog' ? (
              <button
                onClick={() => {
                  resetForm()
                  setShowAddModal(true)
                }}
                className="px-4 py-2 rounded-lg bg-[#0dccf2] text-white font-medium hover:bg-[#0bb5d9] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Add Game
              </button>
            ) : (
              <button
                onClick={() => {
                  setDiceCreateForm({ player1Name: 'Player 1', player2Name: 'Player 2', payoutMultiplier: '2.0' })
                  setShowDiceCreateModal(true)
                }}
                className="px-4 py-2 rounded-lg bg-[#0dccf2] text-white font-medium hover:bg-[#0bb5d9] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Create Dice Game
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'text-[#0dccf2] border-b-2 border-[#0dccf2]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Game Catalog
            </button>
            <button
              onClick={() => setActiveTab('dice')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'dice'
                  ? 'text-[#0dccf2] border-b-2 border-[#0dccf2]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Dice Roll Games
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-500/20 border border-green-500/50 p-4">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="flex-1 min-w-[200px] h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              />
              
              <select
                value={gameTypeFilter}
                onChange={(e) => {
                  setGameTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              >
                <option value="all" className="bg-[#1E1E2B]">All Types</option>
                <option value="slots" className="bg-[#1E1E2B]">Slots</option>
                <option value="live_casino" className="bg-[#1E1E2B]">Live Casino</option>
                <option value="crash" className="bg-[#1E1E2B]">Crash</option>
                <option value="sports" className="bg-[#1E1E2B]">Sports</option>
                <option value="live_betting" className="bg-[#1E1E2B]">Live Betting</option>
              </select>

              <select
                value={providerFilter}
                onChange={(e) => {
                  setProviderFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              >
                <option value="all" className="bg-[#1E1E2B]">All Providers</option>
                {providers.map((provider) => (
                  <option key={provider} value={provider} className="bg-[#1E1E2B]">
                    {provider}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              >
                <option value="all" className="bg-[#1E1E2B]">All Status</option>
                <option value="active" className="bg-[#1E1E2B]">Active</option>
                <option value="inactive" className="bg-[#1E1E2B]">Inactive</option>
                <option value="maintenance" className="bg-[#1E1E2B]">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Games Table - Catalog */}
          {activeTab === 'catalog' && (
          <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent"></div>
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No games found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-medium">Game</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Provider</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Type</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Status</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Date Added</th>
                      <th className="px-6 py-4 text-right text-white font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {games.map((game) => (
                      <tr key={game._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            {game.thumbnail && (
                              <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10"
                                style={{ backgroundImage: `url("${game.thumbnail}")` }}
                              ></div>
                            )}
                            <span className="font-medium text-white">{game.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{game.provider}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{getGameTypeLabel(game.gameType)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                            {game.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatDate(game.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(game)}
                              className="text-gray-400 hover:text-[#0dccf2] transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedGame(game)
                                setShowDeleteModal(true)
                              }}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, total)} of {total} games
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-white px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Dice Games Table */}
          {activeTab === 'dice' && (
          <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 overflow-hidden">
            {diceLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent"></div>
              </div>
            ) : diceGames.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No dice games found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-medium">Game #</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Status</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Player 1</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Player 2</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Total Bets</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Winner</th>
                      <th className="px-6 py-4 text-left text-white font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {diceGames.map((game) => {
                      const player1Bets = game.player1TotalBets || 0
                      const player1Amount = game.player1TotalAmount || 0
                      const player2Bets = game.player2TotalBets || 0
                      const player2Amount = game.player2TotalAmount || 0
                      const totalAmount = game.totalBetAmount || 0
                      const profitIfP1 = totalAmount - (player1Amount * 2)
                      const profitIfP2 = totalAmount - (player2Amount * 2)
                      const recommended = profitIfP1 > profitIfP2 ? 'player1' : 'player2'
                      
                      return (
                        <tr key={game._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-white font-bold">#{game.gameNumber}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDiceStatusColor(game.status)}`}>
                              {game.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white text-sm">
                            <div>{player1Bets} bets</div>
                            <div className="text-white/60">₺{player1Amount.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 text-white text-sm">
                            <div>{player2Bets} bets</div>
                            <div className="text-white/60">₺{player2Amount.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 text-white text-sm">
                            {game.totalBets || 0} bets<br />
                            <span className="text-white/60">₺{totalAmount.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4">
                            {game.winner ? (
                              <span className="text-white font-semibold">
                                {game.winner === 'player1' ? 'Player 1' : 'Player 2'}
                                {game.winningRoll && ` (${game.winningRoll})`}
                              </span>
                            ) : (
                              <div className="text-xs">
                                <div className="text-white/60">P1: <span className={profitIfP1 >= 0 ? 'text-green-400' : 'text-red-400'}>₺{profitIfP1.toFixed(2)}</span></div>
                                <div className="text-white/60">P2: <span className={profitIfP2 >= 0 ? 'text-green-400' : 'text-red-400'}>₺{profitIfP2.toFixed(2)}</span></div>
                                <div className="text-[#0dccf2] mt-1 font-semibold">→ {recommended}</div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {game.status === 'accepting-bets' && (
                                <button
                                  onClick={() => handleDiceCloseGame(game._id)}
                                  className="px-3 py-1 text-yellow-400 hover:bg-white/10 rounded text-sm transition-colors"
                                  disabled={diceSaving}
                                >
                                  Close
                                </button>
                              )}
                              {(game.status === 'closed' || game.status === 'accepting-bets') && !game.winner && (
                                <button
                                  onClick={() => openDiceWinnerModal(game)}
                                  className="px-3 py-1 text-green-400 hover:bg-white/10 rounded text-sm transition-colors"
                                >
                                  Select Winner
                                </button>
                              )}
                              {game.status === 'completed' && (
                                <button
                                  onClick={() => openDiceChangeModal(game)}
                                  className="px-3 py-1 text-blue-400 hover:bg-white/10 rounded text-sm transition-colors"
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
            )}
          </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-xl font-semibold mb-4">
              {showAddModal ? 'Add New Game' : 'Edit Game'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Game Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Game ID *</label>
                  <input
                    type="text"
                    value={formData.gameId}
                    onChange={(e) => setFormData({...formData, gameId: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Provider *</label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({...formData, provider: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Game Type *</label>
                  <select
                    value={formData.gameType}
                    onChange={(e) => setFormData({...formData, gameType: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  >
                    <option value="slots" className="bg-[#1E1E2B]">Slots</option>
                    <option value="live_casino" className="bg-[#1E1E2B]">Live Casino</option>
                    <option value="crash" className="bg-[#1E1E2B]">Crash</option>
                    <option value="sports" className="bg-[#1E1E2B]">Sports</option>
                    <option value="live_betting" className="bg-[#1E1E2B]">Live Betting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                  className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="active" className="bg-[#1E1E2B]">Active</option>
                    <option value="inactive" className="bg-[#1E1E2B]">Inactive</option>
                    <option value="maintenance" className="bg-[#1E1E2B]">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Min Bet</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minBet}
                    onChange={(e) => setFormData({...formData, minBet: parseFloat(e.target.value) || 0})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Max Bet</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxBet || ''}
                    onChange={(e) => setFormData({...formData, maxBet: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                    className="size-5 rounded border-2 border-white/20 bg-white/5 text-[#0dccf2] focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                  <span className="text-white text-sm">New</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="size-5 rounded border-2 border-white/20 bg-white/5 text-[#0dccf2] focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                  <span className="text-white text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isHot}
                    onChange={(e) => setFormData({...formData, isHot: e.target.checked})}
                    className="size-5 rounded border-2 border-white/20 bg-white/5 text-[#0dccf2] focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                  <span className="text-white text-sm">Hot</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={showAddModal ? handleAdd : handleEdit}
                  disabled={saving || !formData.name || !formData.gameId || !formData.provider}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0dccf2] text-white font-medium hover:bg-[#0bb5d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : (showAddModal ? 'Create Game' : 'Update Game')}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedGame(null)
                    resetForm()
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-white text-xl font-semibold mb-4">Delete Game</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete &quot;{selectedGame.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedGame(null)
                }}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dice Game Create Modal */}
      {showDiceCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-white text-xl font-bold mb-4">Create New Dice Game</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Player 1 Name</label>
                <input
                  type="text"
                  value={diceCreateForm.player1Name}
                  onChange={(e) => setDiceCreateForm({...diceCreateForm, player1Name: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Player 2 Name</label>
                <input
                  type="text"
                  value={diceCreateForm.player2Name}
                  onChange={(e) => setDiceCreateForm({...diceCreateForm, player2Name: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Payout Multiplier</label>
                <input
                  type="number"
                  value={diceCreateForm.payoutMultiplier}
                  onChange={(e) => setDiceCreateForm({...diceCreateForm, payoutMultiplier: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  min="1"
                  step="0.1"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDiceCreateGame}
                  disabled={diceSaving}
                  className="flex-1 px-4 py-2 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50"
                >
                  {diceSaving ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowDiceCreateModal(false)
                    setDiceCreateForm({ player1Name: 'Player 1', player2Name: 'Player 2', payoutMultiplier: '2.0' })
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

      {/* Dice Game Select Winner Modal */}
      {showDiceWinnerModal && selectedDiceGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-xl font-bold mb-4">Select Winner - Game #{selectedDiceGame.gameNumber}</h3>
            
            {selectedDiceGame.betStats && (
              <div className="mb-4 p-4 bg-white/5 rounded-lg">
                <p className="text-white/70 text-sm mb-2">Bet Distribution:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Player 1:</span>
                    <span className="text-white">{selectedDiceGame.betStats.player1?.totalBets || 0} bets - ₺{(selectedDiceGame.betStats.player1?.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Player 2:</span>
                    <span className="text-white">{selectedDiceGame.betStats.player2?.totalBets || 0} bets - ₺{(selectedDiceGame.betStats.player2?.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Winner *</label>
                <select
                  value={diceWinnerForm.winner}
                  onChange={(e) => setDiceWinnerForm({...diceWinnerForm, winner: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                >
                  <option value="">Select winner</option>
                  <option value="player1">Player 1</option>
                  <option value="player2">Player 2</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Dice Result (1-6) *</label>
                <input
                  type="number"
                  value={diceWinnerForm.diceResult}
                  onChange={(e) => setDiceWinnerForm({...diceWinnerForm, diceResult: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  min="1"
                  max="6"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDiceSelectWinner}
                  disabled={diceSaving || !diceWinnerForm.winner || !diceWinnerForm.diceResult}
                  className="flex-1 px-4 py-2 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50"
                >
                  {diceSaving ? 'Processing...' : 'Select Winner'}
                </button>
                <button
                  onClick={() => {
                    setShowDiceWinnerModal(false)
                    setDiceWinnerForm({ winner: '', diceResult: '', adminSetResult: '' })
                    setSelectedDiceGame(null)
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

      {/* Dice Game Change Outcome Modal */}
      {showDiceOutcomeModal && selectedDiceGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-white text-xl font-bold mb-4">Change Outcome - Game #{selectedDiceGame.gameNumber}</h3>
            <p className="text-red-400 text-sm mb-4">⚠️ This will reverse previous payouts and process new ones!</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">New Winner *</label>
                <select
                  value={diceOutcomeForm.newWinner}
                  onChange={(e) => setDiceOutcomeForm({...diceOutcomeForm, newWinner: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                >
                  <option value="">Select new winner</option>
                  <option value="player1">Player 1</option>
                  <option value="player2">Player 2</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">New Dice Result (1-6) *</label>
                <input
                  type="number"
                  value={diceOutcomeForm.newDiceResult}
                  onChange={(e) => setDiceOutcomeForm({...diceOutcomeForm, newDiceResult: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  min="1"
                  max="6"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDiceChangeOutcome}
                  disabled={diceSaving || !diceOutcomeForm.newWinner || !diceOutcomeForm.newDiceResult}
                  className="flex-1 px-4 py-2 bg-[#0dccf2] text-black rounded-lg font-bold hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50"
                >
                  {diceSaving ? 'Processing...' : 'Change Outcome'}
                </button>
                <button
                  onClick={() => {
                    setShowDiceOutcomeModal(false)
                    setDiceOutcomeForm({ newWinner: '', newDiceResult: '' })
                    setSelectedDiceGame(null)
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
  )
}

export default function GameManagementPage() {
  return (
    <AdminProtectedRoute>
      <GameManagement />
    </AdminProtectedRoute>
  )
}
