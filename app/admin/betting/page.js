'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import AdminSidebar from '@/components/AdminSidebar'
import { adminAPI } from '@/lib/api'
import { formatDate, formatAmount } from '@/utils/formatters'
import { log } from '@/utils/logger'

function BettingManagement() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Status')
  const [dateRangeFilter, setDateRangeFilter] = useState('Date Range')
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedBets, setSelectedBets] = useState([])
  const [showSettleModal, setShowSettleModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [settleStatus, setSettleStatus] = useState('')
  const [winAmount, setWinAmount] = useState('')
  const [selectedBet, setSelectedBet] = useState(null)
  const [success, setSuccess] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDateRange, setShowDateRange] = useState(false)

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
    fetchBets()
  }, [currentPage, statusFilter, startDate, endDate])

  const fetchBets = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 50,
      }

      if (searchQuery) {
        params.search = searchQuery
      }

      if (statusFilter && statusFilter !== 'Status') {
        params.status = statusFilter.toLowerCase()
      }

      if (startDate) {
        params.startDate = startDate
      }
      if (endDate) {
        params.endDate = endDate
      }

      const response = await adminAPI.getBets(params)
      setBets(response.data.bets || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Bahisler yüklenirken bir hata oluştu')
      log.apiError('/admin/bets', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'won':
        return 'bg-green-500/20 text-green-400'
      case 'lost':
        return 'bg-red-500/20 text-red-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'cancelled':
      case 'refunded':
        return 'bg-blue-500/20 text-blue-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'won':
        return 'Won'
      case 'lost':
        return 'Lost'
      case 'pending':
        return 'Pending'
      case 'cancelled':
        return 'Cancelled'
      case 'refunded':
        return 'Refunded'
      default:
        return status
    }
  }

  const getGameMatchName = (bet) => {
    if (bet.match) {
      return `${bet.match.teamA || bet.match.homeTeam || ''} vs ${bet.match.teamB || bet.match.awayTeam || ''}`
    }
    return bet.marketName || bet.match?.matchName || 'N/A'
  }

  const handleSelectBet = (betId) => {
    setSelectedBets(prev =>
      prev.includes(betId)
        ? prev.filter(id => id !== betId)
        : [...prev, betId]
    )
  }

  const handleSelectAll = () => {
    if (selectedBets.length === bets.length && bets.length > 0) {
      setSelectedBets([])
    } else {
      setSelectedBets(bets.filter(b => b.status === 'pending').map(b => b._id))
    }
  }

  const openSettleModal = (bet) => {
    setSelectedBet(bet)
    setSettleStatus('')
    setWinAmount(bet.potentialWin || '')
    setShowSettleModal(true)
  }

  const handleSettleBet = async () => {
    if (!settleStatus || !selectedBet) return

    try {
      const data = { status: settleStatus }
      if (settleStatus === 'won' && winAmount) {
        data.winAmount = parseFloat(winAmount)
      }

      await adminAPI.settleBet(selectedBet._id, data)
      setSuccess('Bet settled successfully')
      setShowSettleModal(false)
      setSelectedBet(null)
      setSettleStatus('')
      setWinAmount('')
      fetchBets()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to settle bet')
      log.apiError('/admin/bets/settle', err)
    }
  }

  const handleBulkSettle = async () => {
    if (!settleStatus || selectedBets.length === 0) return

    try {
      await adminAPI.bulkSettleBets({
        betIds: selectedBets,
        status: settleStatus,
      })
      setSuccess(`Successfully settled ${selectedBets.length} bets`)
      setSelectedBets([])
      setShowBulkModal(false)
      setSettleStatus('')
      fetchBets()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to settle bets')
      log.apiError('/admin/bets/bulk-settle', err)
    }
  }

  const handleExport = async () => {
    try {
      const params = {}
      if (searchQuery) params.search = searchQuery
      if (statusFilter && statusFilter !== 'Status') params.status = statusFilter.toLowerCase()
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await adminAPI.exportBets(params)
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `bets-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setSuccess('Bets exported successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export bets')
      log.apiError('/admin/bets/export', err)
    }
  }

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen w-full bg-background-dark">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h1 className="text-zinc-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Betting Management
            </h1>
            <div className="flex items-center gap-2">
              {selectedBets.length > 0 && (
                <>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-yellow-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-yellow-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">gavel</span>
                    <span className="truncate">Bulk Settle ({selectedBets.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedBets([])}
                    className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-gray-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-600 transition-colors"
                  >
                    <span className="truncate">Clear Selection</span>
                  </button>
                </>
              )}
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-green-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="truncate">Export CSV</span>
              </button>
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

          {/* Search and Filters */}
          <div className="bg-white dark:bg-[#111718] p-4 rounded-xl shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-[#9cb5ba] flex border-none bg-zinc-100 dark:bg-[#283639] items-center justify-center pl-4 rounded-l-lg border-r-0">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-zinc-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#0dccf2] border-none bg-zinc-100 dark:bg-[#283639] h-full placeholder:text-[#9cb5ba] px-4 pl-2 text-base font-normal leading-normal"
                      placeholder="Search by Bet ID, User..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          fetchBets()
                        }
                      }}
                      type="text"
                    />
                  </div>
                </label>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="flex h-12 w-full items-center justify-between gap-x-2 rounded-lg bg-zinc-100 dark:bg-[#283639] px-4 hover:bg-zinc-200 dark:hover:bg-[#1b2527] transition-colors text-zinc-900 dark:text-white text-sm font-medium leading-normal focus:outline-none focus:ring-2 focus:ring-[#0dccf2]"
                >
                  <option value="Status">Status: All</option>
                  <option value="pending">Pending</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              {showDateRange ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 rounded-lg bg-zinc-100 dark:bg-[#283639] px-4 text-zinc-900 dark:text-white text-sm border border-zinc-200 dark:border-[#3b5054] focus:outline-none focus:ring-2 focus:ring-[#0dccf2]"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 rounded-lg bg-zinc-100 dark:bg-[#283639] px-4 text-zinc-900 dark:text-white text-sm border border-zinc-200 dark:border-[#3b5054] focus:outline-none focus:ring-2 focus:ring-[#0dccf2]"
                    placeholder="End Date"
                  />
                  <button
                    onClick={() => {
                      setShowDateRange(false)
                      setStartDate('')
                      setEndDate('')
                    }}
                    className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-[#283639] hover:bg-zinc-200 dark:hover:bg-[#1b2527] flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-zinc-500 dark:text-white">close</span>
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowDateRange(true)}
                    className="flex h-12 w-full items-center justify-between gap-x-2 rounded-lg bg-zinc-100 dark:bg-[#283639] px-4 hover:bg-zinc-200 dark:hover:bg-[#1b2527] transition-colors"
                  >
                    <p className="text-zinc-900 dark:text-white text-sm font-medium leading-normal">Date Range</p>
                    <span className="material-symbols-outlined text-zinc-500 dark:text-white">expand_more</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-[#3b5054] bg-white dark:bg-[#111718] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-[#1b2527]">
                  <tr>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">
                      <input
                        type="checkbox"
                        checked={selectedBets.length === bets.filter(b => b.status === 'pending').length && bets.filter(b => b.status === 'pending').length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-zinc-300 dark:border-white/20 bg-transparent"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Bet ID</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">User</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Match</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Selection</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Odds</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Stake</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Potential Win</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-zinc-600 dark:text-white font-medium">Date/Time</th>
                    <th className="px-6 py-4 text-right text-zinc-600 dark:text-[#9cb5ba] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-t-[#3b5054]">
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-8 text-center text-zinc-600 dark:text-[#9cb5ba]">Yükleniyor...</td>
                    </tr>
                  ) : bets.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-8 text-center text-zinc-600 dark:text-[#9cb5ba]">Bahis bulunamadı.</td>
                    </tr>
                  ) : (
                    bets.map((bet) => (
                      <tr key={bet._id} className="hover:bg-zinc-50 dark:hover:bg-[#1b2527]/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {bet.status === 'pending' && (
                            <input
                              type="checkbox"
                              checked={selectedBets.includes(bet._id)}
                              onChange={() => handleSelectBet(bet._id)}
                              className="rounded border-zinc-300 dark:border-white/20 bg-transparent"
                            />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-zinc-600 dark:text-[#9cb5ba]">
                          {bet._id.toString().substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/admin/users?search=${bet.user?.username || bet.user?.email || ''}`}
                            className="font-medium text-zinc-900 dark:text-white hover:text-[#0dccf2] dark:hover:text-[#0dccf2] transition-colors"
                          >
                            {bet.user?.username || bet.user?.email || 'N/A'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-[#9cb5ba]">
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-900 dark:text-white">{getGameMatchName(bet)}</span>
                            <span className="text-xs text-zinc-500 dark:text-[#9cb5ba]">{bet.marketName || bet.marketType || ''}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-900 dark:text-white">
                          <div className="flex flex-col">
                            <span className="font-medium">{bet.selection || 'N/A'}</span>
                            <span className="text-xs text-zinc-500 dark:text-[#9cb5ba]">{bet.marketType || ''}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-900 dark:text-white font-medium">
                          {bet.odds ? `@${bet.odds.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-900 dark:text-white font-medium">
                          {formatAmount(bet.stake)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-900 dark:text-white font-medium">
                          {bet.status === 'won' 
                            ? formatAmount(bet.winAmount || bet.potentialWin) 
                            : formatAmount(bet.potentialWin || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bet.status)}`}>
                            {getStatusText(bet.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-[#9cb5ba]">
                          {formatDate(bet.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {bet.status === 'pending' && (
                              <button
                                onClick={() => openSettleModal(bet)}
                                className="text-yellow-500 hover:text-yellow-600 transition-colors"
                                title="Settle Bet"
                              >
                                <span className="material-symbols-outlined">gavel</span>
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                // Open bet actions menu (view details, edit, etc.)
                                if (process.env.NODE_ENV === 'development') {
                                  console.log('Bet actions menu:', bet._id)
                                }
                                // TODO: Implement dropdown menu or modal
                              }}
                              className="text-zinc-500 dark:text-[#9cb5ba] hover:text-[#0dccf2] dark:hover:text-[#0dccf2] transition-colors"
                              title="More Actions"
                            >
                              <span className="material-symbols-outlined">more_vert</span>
                            </button>
                          </div>
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
                Showing page {currentPage} of {totalPages} (Total: {total} bets)
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

          {/* Settle Bet Modal */}
          {showSettleModal && selectedBet && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#111718] rounded-xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-white/10">
                <h3 className="text-zinc-900 dark:text-white text-xl font-bold mb-4">Settle Bet</h3>
                <div className="mb-4 space-y-2">
                  <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-3">
                    <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Bet ID</p>
                    <p className="text-zinc-900 dark:text-white font-mono text-sm">{selectedBet._id.toString().substring(0, 12)}...</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-3">
                    <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">User</p>
                    <p className="text-zinc-900 dark:text-white text-sm font-medium">{selectedBet.user?.username || selectedBet.user?.email || 'N/A'}</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-3">
                    <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Match</p>
                    <p className="text-zinc-900 dark:text-white text-sm">{getGameMatchName(selectedBet)}</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-3">
                    <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Selection</p>
                    <p className="text-zinc-900 dark:text-white text-sm font-medium">{selectedBet.selection || 'N/A'}</p>
                    <p className="text-zinc-500 dark:text-white/50 text-xs mt-1">Odds: @{selectedBet.odds?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-3">
                      <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Stake</p>
                      <p className="text-zinc-900 dark:text-white text-sm font-bold">{formatAmount(selectedBet.stake)}</p>
                    </div>
                    <div className="bg-zinc-100 dark:bg-[#1b2527] rounded-lg p-3">
                      <p className="text-zinc-600 dark:text-white/70 text-xs mb-1">Potential Win</p>
                      <p className="text-zinc-900 dark:text-white text-sm font-bold">{formatAmount(selectedBet.potentialWin)}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-zinc-600 dark:text-white/70 text-sm mb-2 font-medium">Settlement Status *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSettleStatus('won')
                        setWinAmount(selectedBet.potentialWin || '')
                      }}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        settleStatus === 'won'
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white hover:border-green-500/50'
                      }`}
                    >
                      ✓ Won
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettleStatus('lost')}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        settleStatus === 'lost'
                          ? 'border-red-500 bg-red-500/20 text-red-400'
                          : 'border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white hover:border-red-500/50'
                      }`}
                    >
                      ✗ Lost
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettleStatus('cancelled')}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        settleStatus === 'cancelled'
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                          : 'border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white hover:border-yellow-500/50'
                      }`}
                    >
                      ⊘ Cancelled
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettleStatus('refunded')}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        settleStatus === 'refunded'
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                          : 'border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white hover:border-blue-500/50'
                      }`}
                    >
                      ↻ Refunded
                    </button>
                  </div>
                </div>
                {settleStatus === 'won' && (
                  <div className="mb-4">
                    <label className="block text-zinc-600 dark:text-white/70 text-sm mb-2">Win Amount</label>
                    <input
                      type="number"
                      value={winAmount}
                      onChange={(e) => setWinAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full h-12 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                      placeholder="Enter win amount"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleSettleBet}
                    disabled={!settleStatus}
                    className="flex-1 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Settle Bet
                  </button>
                  <button
                    onClick={() => {
                      setShowSettleModal(false)
                      setSelectedBet(null)
                      setSettleStatus('')
                      setWinAmount('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Settle Modal */}
          {showBulkModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#111718] rounded-xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-white/10">
                <h3 className="text-zinc-900 dark:text-white text-xl font-bold mb-4">Bulk Settle Bets</h3>
                <div className="mb-4">
                  <p className="text-zinc-600 dark:text-white/70 text-sm mb-4">
                    Settle <span className="font-bold text-zinc-900 dark:text-white">{selectedBets.length}</span> selected bet(s)
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-zinc-600 dark:text-white/70 text-sm mb-2">Settlement Status</label>
                  <select
                    value={settleStatus}
                    onChange={(e) => setSettleStatus(e.target.value)}
                    className="w-full h-12 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="">Select Status</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBulkSettle}
                    disabled={!settleStatus}
                    className="flex-1 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Settle {selectedBets.length} Bets
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkModal(false)
                      setSettleStatus('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </AdminProtectedRoute>
  )
}

export default BettingManagement

