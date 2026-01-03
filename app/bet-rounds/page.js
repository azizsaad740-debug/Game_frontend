'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { betRoundAPI } from '@/lib/api'
import { log } from '@/utils/logger'
import { formatDate } from '@/utils/formatters'

function BetRoundsHistoryPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [betRounds, setBetRounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    resultType: 'all',
    startDate: '',
    endDate: '',
  })
  const [statistics, setStatistics] = useState(null)

  useEffect(() => {
    fetchBetRounds()
    fetchStatistics()
  }, [page, filters])

  const fetchBetRounds = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }

      if (filters.resultType !== 'all') {
        params.resultType = filters.resultType
      }
      if (filters.startDate) {
        params.startDate = filters.startDate
      }
      if (filters.endDate) {
        params.endDate = filters.endDate
      }

      const response = await betRoundAPI.getBetRoundHistory(params)
      setBetRounds(response.data.betRounds || [])
      setTotalPages(response.data.pagination?.totalPages || 1)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load betting history')
      log.apiError('/bet-rounds/history', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const params = {}
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate

      const response = await betRoundAPI.getBetRoundStatistics(params)
      setStatistics(response.data)
    } catch (err) {
      log.apiError('/bet-rounds/statistics', err)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filters change
  }

  const formatMultiplier = (percentage) => {
    if (percentage > 0) {
      return `${(1 + percentage / 100).toFixed(2)}x`
    } else if (percentage < 0) {
      return 'Crashed'
    }
    return '1.00x'
  }

  const getResultTypeColor = (resultType) => {
    switch (resultType) {
      case 'win':
        return 'bg-teal-500/20 text-teal-400'
      case 'loss':
        return 'bg-red-500/20 text-red-400'
      case 'neutral':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden navbar-spacing">
      <Navbar />

      <main className="flex-grow p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-white text-3xl md:text-4xl font-black tracking-tight mb-2">
            Betting Rounds History
          </h1>
          <p className="text-gray-400 text-base">
            View your betting round history and statistics
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Rounds</p>
              <p className="text-2xl font-bold text-white">
                {statistics.overview?.totalRounds || 0}
              </p>
            </div>
            <div className="bg-surface rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-teal-400">
                {statistics.overview?.winRate || 0}%
              </p>
            </div>
            <div className="bg-surface rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Bet Amount</p>
              <p className="text-2xl font-bold text-white">
                {statistics.financial?.totalBetAmount?.toFixed(2) || '0.00'} TL
              </p>
            </div>
            <div className="bg-surface rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Profit/Loss</p>
              <p className={`text-2xl font-bold ${(statistics.financial?.profitLoss || 0) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                {(statistics.financial?.profitLoss || 0) >= 0 ? '+' : ''}
                {statistics.financial?.profitLoss?.toFixed(2) || '0.00'} TL
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-surface rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Result Type</label>
              <select
                value={filters.resultType}
                onChange={(e) => handleFilterChange('resultType', e.target.value)}
                className="w-full rounded-lg bg-background-dark border border-surface px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full rounded-lg bg-background-dark border border-surface px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full rounded-lg bg-background-dark border border-surface px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ resultType: 'all', startDate: '', endDate: '' })
                  setPage(1)
                }}
                className="w-full rounded-lg bg-gray-600 hover:bg-gray-700 px-4 py-2 text-white text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Betting Rounds Table */}
        <div className="bg-surface rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background-dark border-b border-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Round #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Bet Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Balance After</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : betRounds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No betting rounds found
                    </td>
                  </tr>
                ) : (
                  betRounds.map((round) => (
                    <tr key={round.id} className="hover:bg-background-dark/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        #{round.roundNumber}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {round.betAmount.toFixed(2)} TL
                      </td>
                      <td className="px-6 py-4 text-white">
                        {round.percentage > 0 ? '+' : ''}{round.percentage}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getResultTypeColor(round.resultType)}`}>
                          {round.resultType.charAt(0).toUpperCase() + round.resultType.slice(1)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-medium ${round.amountChange >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                        {round.amountChange >= 0 ? '+' : ''}{round.amountChange.toFixed(2)} TL
                      </td>
                      <td className="px-6 py-4 text-white">
                        {round.balanceAfter.toFixed(2)} TL
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(round.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-surface flex items-center justify-between">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-background-dark text-white hover:bg-background-dark/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-background-dark text-white hover:bg-background-dark/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function BetRoundsHistoryPageWrapper() {
  return (
    <ProtectedRoute>
      <BetRoundsHistoryPage />
    </ProtectedRoute>
  )
}

