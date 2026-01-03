'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { adminAPI } from '@/lib/api'
import { formatDate, formatAmount } from '@/utils/formatters'
import { log } from '@/utils/logger'

function RoundManagement() {
  const pathname = usePathname()
  const [rounds, setRounds] = useState([])
  const [currentRound, setCurrentRound] = useState(null)
  const [currentStats, setCurrentStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCrashModal, setShowCrashModal] = useState(false)
  const [crashMultiplier, setCrashMultiplier] = useState('')
  const [selectedRound, setSelectedRound] = useState(null)
  const [showRoundDetails, setShowRoundDetails] = useState(false)
  const [roundBets, setRoundBets] = useState([])
  const [roundStatistics, setRoundStatistics] = useState(null)

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
    fetchCurrentRound()
    fetchRounds()
    
    // Poll for current round updates every 5 seconds
    const interval = setInterval(() => {
      if (!actionLoading) {
        fetchCurrentRound()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [currentPage, statusFilter])

  const fetchCurrentRound = async () => {
    try {
      const response = await adminAPI.getCurrentRound()
      setCurrentRound(response.data.round)
      setCurrentStats(response.data.statistics || null)
    } catch (err) {
      // No active round is not an error
      if (err.response?.status !== 404) {
        log.apiError('/admin/game-rounds/current', err)
      }
      setCurrentRound(null)
      setCurrentStats(null)
    }
  }

  const fetchRounds = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 20,
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await adminAPI.getGameRounds(params)
      setRounds(response.data.rounds || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Rounds yüklenirken bir hata oluştu')
      log.apiError('/admin/game-rounds', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartRound = async () => {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const response = await adminAPI.startRound()
      setSuccess(response.data.message)
      await fetchCurrentRound()
      await fetchRounds()
    } catch (err) {
      setError(err.response?.data?.message || 'Round başlatılırken bir hata oluştu')
      log.apiError('/admin/game-rounds/start', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCrashRound = async () => {
    if (!currentRound) return

    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const data = crashMultiplier ? { multiplier: parseFloat(crashMultiplier) } : {}
      const response = await adminAPI.crashRound(data)
      setSuccess(response.data.message)
      setShowCrashModal(false)
      setCrashMultiplier('')
      await fetchCurrentRound()
      await fetchRounds()
    } catch (err) {
      setError(err.response?.data?.message || 'Round crash edilirken bir hata oluştu')
      log.apiError('/admin/game-rounds/crash', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleViewRoundDetails = async (roundId) => {
    try {
      const response = await adminAPI.getRoundDetails(roundId)
      setSelectedRound(response.data.round)
      setRoundBets(response.data.bets || [])
      setRoundStatistics(response.data.statistics || null)
      setShowRoundDetails(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Round detayları yüklenirken bir hata oluştu')
      log.apiError('/admin/game-rounds/:id', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress':
        return 'bg-green-500/20 text-green-400'
      case 'crashed':
        return 'bg-red-500/20 text-red-400'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400'
      case 'waiting':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress'
      case 'crashed':
        return 'Crashed'
      case 'completed':
        return 'Completed'
      case 'waiting':
        return 'Waiting'
      default:
        return status
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background-dark">
      {/* SideNavBar */}
      <div className="flex bg-background-dark min-h-screen">
  {/* FIXED SIDEBAR */}
  <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-background-dark border-r border-surface p-4 z-50">
    <div className="flex items-center gap-3 mb-8 px-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
        <span className="material-symbols-outlined text-black">casino</span>
      </div>
      <div className="flex flex-col">
        <h1 className="text-base font-bold text-white">Casino Admin</h1>
        <p className="text-sm text-gray-400">Management</p>
      </div>
    </div>

    <nav className="flex flex-col gap-2">
      {navItems.map(item => (
        <Link
          key={item.id}
          href={item.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === item.href || (item.id === 'dashboard' && pathname === '/admin')
              ? 'bg-primary/20 text-primary'
              : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <p>{item.label}</p>
        </Link>
      ))}
    </nav>

    <div className="mt-auto">
      <Link
        href="/admin/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined">settings</span>
        <p className="text-sm font-medium">Settings</p>
      </Link>

      <button
        onClick={() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('isAdmin')
          localStorage.removeItem('adminEmail')
          window.location.href = '/auth/login'
        }}
        className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
      >
        <span className="material-symbols-outlined">logout</span>
        <p className="text-sm font-medium">Logout</p>
      </button>

      <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAeBaCCsTptl1trq-7t7S9yHg2U-j1m_3eQJ6dpRP-IZjxZIDKL6U_iFBKUwWt18HwxovSG8ldqiQCa7NbmEcelTnHQGSwTeQORHSMYn7gGZDs-U982dOqo8QbAOQy7uCWkHjlHxe0m_eXtY2xDHYQYW3KAKuLgW2ZrQlV3yrUSs8tMyu4QaShzTzhohnzpDGQllaTrkdAQoFvcjS9zzhmKAnFrldqCRC16_VfbZD7OYbVjNJOiQ4Gz2-oKSG6XZ4azP4qWoBeSO74")'
          }}
        />
        <div className="flex flex-col">
          <h2 className="text-sm font-medium text-white">
            {typeof window !== 'undefined'
              ? (() => {
                  try {
                    const userStr = localStorage.getItem('user')
                    if (userStr) {
                      const user = JSON.parse(userStr)
                      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User'
                    }
                  } catch {}
                  return 'Admin User'
                })()
              : 'Admin User'}
          </h2>
          <p className="text-xs text-gray-400">
            {typeof window !== 'undefined'
              ? (() => {
                  try {
                    const userStr = localStorage.getItem('user')
                    if (userStr) {
                      const user = JSON.parse(userStr)
                      return user.email || 'admin@casino.com'
                    }
                  } catch {}
                  return localStorage.getItem('adminEmail') || 'admin@casino.com'
                })()
              : 'admin@casino.com'}
          </p>
        </div>
      </div>
    </div>
  </aside>

  {/* MAIN CONTENT */}
  <main className="ml-64 flex-1 min-h-screen">
    {/* Your existing topbar */}
    {/* Your existing dashboard content */}
  </main>
</div>


      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h1 className="text-zinc-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Round Management
            </h1>
            <div className="flex items-center gap-2">
              {currentRound ? (
                <button
                  onClick={() => setShowCrashModal(true)}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-red-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">warning</span>
                  <span className="truncate">Crash Round</span>
                </button>
              ) : (
                <button
                  onClick={handleStartRound}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-green-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                  <span className="truncate">Start New Round</span>
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 rounded-lg bg-green-500/20 border border-green-500/50 p-4">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Current Round Card */}
          {currentRound && (
            <div className="bg-white dark:bg-[#111718] p-6 rounded-xl shadow-sm mb-6 border border-zinc-200 dark:border-[#3b5054]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Current Round #{currentRound.roundNumber}
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentRound.status)}`}>
                  {getStatusText(currentRound.status)}
                </span>
              </div>
              
              {currentStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-4">
                    <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Multiplier</p>
                    <p className="text-zinc-900 dark:text-white text-2xl font-bold">{currentRound.multiplier.toFixed(2)}x</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-4">
                    <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Total Bets</p>
                    <p className="text-zinc-900 dark:text-white text-2xl font-bold">{currentStats.totalBets || 0}</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-4">
                    <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Total Amount</p>
                    <p className="text-zinc-900 dark:text-white text-2xl font-bold">{formatAmount(currentStats.totalBetAmount || 0)}</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-4">
                    <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Players</p>
                    <p className="text-zinc-900 dark:text-white text-2xl font-bold">{currentStats.totalPlayers || 0}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-sm text-zinc-600 dark:text-[#9cb5ba]">
                Started: {formatDate(currentRound.startedAt)}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-[#111718] p-4 rounded-xl shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="flex h-12 w-48 items-center justify-between gap-x-2 rounded-lg bg-zinc-100 dark:bg-[#283639] px-4 hover:bg-zinc-200 dark:hover:bg-[#1b2527] transition-colors text-zinc-900 dark:text-white text-sm font-medium leading-normal focus:outline-none focus:ring-2 focus:ring-[#0dccf2]"
              >
                <option value="all">All Status</option>
                <option value="waiting">Waiting</option>
                <option value="in-progress">In Progress</option>
                <option value="crashed">Crashed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Rounds Table */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-[#3b5054] bg-white dark:bg-[#111718] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-[#1b2527]">
                  <tr>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Round #</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Multiplier</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Total Bets</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Total Amount</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Players</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Started</th>
                    <th className="px-6 py-4 text-right text-zinc-600 dark:text-[#9cb5ba] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-t-[#3b5054]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-zinc-600 dark:text-[#9cb5ba]">Yükleniyor...</td>
                    </tr>
                  ) : rounds.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-zinc-600 dark:text-[#9cb5ba]">Henüz round bulunmamaktadır.</td>
                    </tr>
                  ) : (
                    rounds.map((round) => (
                      <tr key={round._id} className="hover:bg-zinc-50 dark:hover:bg-[#1b2527]/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-zinc-900 dark:text-white">
                          #{round.roundNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(round.status)}`}>
                            {getStatusText(round.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-900 dark:text-white font-medium">
                          {round.multiplier.toFixed(2)}x
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-900 dark:text-white">
                          {round.totalBets || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-900 dark:text-white font-medium">
                          {formatAmount(round.totalBetAmount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-900 dark:text-white">
                          {round.totalPlayers || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-[#9cb5ba]">
                          {formatDate(round.startedAt || round.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewRoundDetails(round._id)}
                            className="text-[#0dccf2] hover:text-[#0dccf2]/80 transition-colors"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-zinc-600 dark:text-[#9cb5ba]">
                Showing page {currentPage} of {totalPages} (Total: {total} rounds)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center h-9 w-9 rounded-lg bg-zinc-100 dark:bg-[#111718] text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-[#0dccf2]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[#0dccf2] text-white'
                          : 'bg-zinc-100 dark:bg-[#111718] text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-[#0dccf2]/20'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                {totalPages > 5 && <span className="text-zinc-600 dark:text-white">...</span>}
                {totalPages > 5 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-[#0dccf2] text-white'
                        : 'bg-zinc-100 dark:bg-[#111718] text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-[#0dccf2]/20'
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center h-9 w-9 rounded-lg bg-zinc-100 dark:bg-[#111718] text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-[#0dccf2]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>
          )}

          {/* Crash Round Modal */}
          {showCrashModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#111718] rounded-xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-white/10">
                <h3 className="text-zinc-900 dark:text-white text-xl font-bold mb-4">Crash Round</h3>
                <div className="mb-4">
                  <p className="text-zinc-600 dark:text-white/70 text-sm mb-4">
                    Are you sure you want to crash Round #{currentRound?.roundNumber}? All active players will lose their bets.
                  </p>
                  <label className="block text-zinc-600 dark:text-white/70 text-sm mb-2">Multiplier at Crash (Optional)</label>
                  <input
                    type="number"
                    value={crashMultiplier}
                    onChange={(e) => setCrashMultiplier(e.target.value)}
                    min="1"
                    step="0.01"
                    className="w-full h-12 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    placeholder="Leave empty to use current multiplier"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCrashRound}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Crashing...' : 'Crash Round'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCrashModal(false)
                      setCrashMultiplier('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Round Details Modal */}
          {showRoundDetails && selectedRound && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
              <div className="bg-white dark:bg-[#111718] rounded-xl p-6 max-w-4xl w-full mx-4 my-8 border border-zinc-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-zinc-900 dark:text-white text-xl font-bold">
                    Round #{selectedRound.roundNumber} Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowRoundDetails(false)
                      setSelectedRound(null)
                      setRoundBets([])
                      setRoundStatistics(null)
                    }}
                    className="text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {roundStatistics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-4">
                      <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Wins</p>
                      <p className="text-zinc-900 dark:text-white text-2xl font-bold">{roundStatistics.wins || 0}</p>
                    </div>
                    <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-4">
                      <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Losses</p>
                      <p className="text-zinc-900 dark:text-white text-2xl font-bold">{roundStatistics.losses || 0}</p>
                    </div>
                    <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-4">
                      <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Total Win Amount</p>
                      <p className="text-zinc-900 dark:text-white text-lg font-bold">{formatAmount(roundStatistics.totalWinAmount || 0)}</p>
                    </div>
                    <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-4">
                      <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Total Loss Amount</p>
                      <p className="text-zinc-900 dark:text-white text-lg font-bold">{formatAmount(roundStatistics.totalLossAmount || 0)}</p>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 dark:bg-[#1b2527]">
                      <tr>
                        <th className="px-4 py-3 text-left text-zinc-600 dark:text-white font-medium">User</th>
                        <th className="px-4 py-3 text-left text-zinc-600 dark:text-white font-medium">Bet Amount</th>
                        <th className="px-4 py-3 text-left text-zinc-600 dark:text-white font-medium">Percentage</th>
                        <th className="px-4 py-3 text-left text-zinc-600 dark:text-white font-medium">Result</th>
                        <th className="px-4 py-3 text-left text-zinc-600 dark:text-white font-medium">Amount Change</th>
                        <th className="px-4 py-3 text-left text-zinc-600 dark:text-white font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-t-[#3b5054]">
                      {roundBets.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-zinc-600 dark:text-[#9cb5ba]">
                            No bets found for this round
                          </td>
                        </tr>
                      ) : (
                        roundBets.map((bet) => (
                          <tr key={bet._id} className="hover:bg-zinc-50 dark:hover:bg-[#1b2527]/50">
                            <td className="px-4 py-3 whitespace-nowrap text-zinc-900 dark:text-white">
                              {bet.user?.username || bet.user?.email || 'N/A'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-zinc-900 dark:text-white font-medium">
                              {formatAmount(bet.betAmount)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-zinc-900 dark:text-white">
                              {bet.percentage > 0 ? '+' : ''}{bet.percentage}%
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                bet.resultType === 'win' ? 'bg-green-500/20 text-green-400' :
                                bet.resultType === 'loss' ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {bet.resultType}
                              </span>
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap font-medium ${
                              bet.amountChange >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {bet.amountChange >= 0 ? '+' : ''}{formatAmount(bet.amountChange)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-[#9cb5ba]">
                              {formatDate(bet.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function RoundManagementPage() {
  return (
    <AdminProtectedRoute>
      <RoundManagement />
    </AdminProtectedRoute>
  )
}


