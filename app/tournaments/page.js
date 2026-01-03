'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'
import { tournamentAPI } from '@/lib/api/tournament.api'
import { log } from '@/utils/logger'

export default function TournamentsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Fetch tournaments from API
  useEffect(() => {
    fetchTournaments()
  }, [selectedFilter, currentPage])

  const fetchTournaments = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 12,
      }

      if (selectedFilter !== 'all') {
        params.status = selectedFilter
      }

      const response = await tournamentAPI.getTournaments(params)
      setTournaments(response.data.tournaments || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      console.error('Error fetching tournaments:', err)
      setError(err.response?.data?.message || 'Failed to load tournaments')
      log.apiError('/tournaments', err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTournament = async (tournamentId) => {
    setJoining(tournamentId)
    setError('')
    try {
      await tournamentAPI.joinTournament(tournamentId)
      // Refresh tournaments to update participation status
      await fetchTournaments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join tournament')
      log.apiError('/tournaments/join', err)
    } finally {
      setJoining(null)
    }
  }

  const filters = ['all', 'active', 'upcoming', 'finished']

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400'
      case 'finished':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'upcoming':
        return 'Upcoming'
      case 'finished':
        return 'Finished'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const getGameTypeLabel = (gameType) => {
    const gameTypeMap = {
      slots: 'Slots',
      live_casino: 'Live Casino',
      sports: 'Sports',
      crash: 'Crash',
      all: 'All Games'
    }
    return gameTypeMap[gameType] || gameType
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-dark navbar-spacing">
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-16 xl:px-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                {t('common.tournaments')}
              </h1>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setSelectedFilter(filter)
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFilter === filter
                      ? 'bg-primary text-background-dark'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}
                >
                  {filter === 'all' ? t('common.all') : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-white/70">Loading tournaments...</p>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-white/70">No tournaments available</p>
              </div>
            ) : (
              <>
                {/* Tournaments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="group relative overflow-hidden rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={tournament.bannerImage || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop'}
                          alt={tournament.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(tournament.status)}`}>
                            {getStatusText(tournament.status)}
                          </span>
                        </div>
                        {tournament.isFeatured && (
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/80 text-black backdrop-blur-sm">
                              FEATURED
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-white text-xl font-bold mb-2">{tournament.name}</h3>
                        {tournament.description && (
                          <p className="text-white/70 text-sm mb-3 line-clamp-2">{tournament.description}</p>
                        )}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">Game:</span>
                            <span className="text-white font-medium">{getGameTypeLabel(tournament.gameType)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">Prize Pool:</span>
                            <span className="text-primary font-bold text-lg">₺{tournament.prizePool.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">Players:</span>
                            <span className="text-white font-medium">
                              {tournament.totalParticipants.toLocaleString()} {tournament.maxPlayers ? `/ ${tournament.maxPlayers.toLocaleString()}` : ''}
                            </span>
                          </div>
                          {tournament.maxPlayers && (
                            <div className="w-full bg-zinc-700 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((tournament.totalParticipants / tournament.maxPlayers) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">Entry Fee:</span>
                            <span className="text-white font-medium">
                              {tournament.entryFee === 0 ? 'Free' : `₺${tournament.entryFee}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-white/60">
                            <span>Start: {new Date(tournament.startDate).toLocaleDateString()}</span>
                            <span>End: {new Date(tournament.endDate).toLocaleDateString()}</span>
                          </div>
                          {tournament.isRegistered && (
                            <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500/50 rounded text-xs text-blue-400">
                              You are registered for this tournament
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (tournament.canJoin && !tournament.isRegistered) {
                              handleJoinTournament(tournament._id)
                            } else if (tournament.isRegistered) {
                              router.push(`/tournaments/${tournament._id}`)
                            }
                          }}
                          disabled={tournament.status === 'finished' || tournament.status === 'cancelled' || joining === tournament._id || (!tournament.canJoin && !tournament.isRegistered)}
                          className={`w-full py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${tournament.isRegistered
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : tournament.status === 'active' && tournament.canJoin
                                ? 'bg-primary text-background-dark hover:bg-yellow-400'
                                : tournament.status === 'upcoming' && tournament.canJoin
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-600 text-white cursor-not-allowed'
                            }`}
                        >
                          {joining === tournament._id
                            ? 'Joining...'
                            : tournament.isRegistered
                              ? 'View Tournament'
                              : tournament.status === 'active'
                                ? 'Join Tournament'
                                : tournament.status === 'upcoming'
                                  ? 'Register'
                                  : 'Finished'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center pt-8">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex size-10 items-center justify-center rounded-lg text-white/60 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`text-sm leading-normal flex size-10 items-center justify-center rounded-lg transition-colors ${currentPage === pageNum
                                ? 'text-background-dark bg-primary font-bold'
                                : 'text-white/60 hover:bg-zinc-800 hover:text-white font-medium'
                              }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="text-sm font-medium leading-normal flex size-10 items-center justify-center text-white/60 rounded-lg">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="text-sm font-medium leading-normal flex size-10 items-center justify-center rounded-lg text-white/60 hover:bg-zinc-800 hover:text-white transition-colors"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="flex size-10 items-center justify-center rounded-lg text-white/60 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}

            {/* Info Section */}
            <div className="mt-8 p-6 bg-zinc-900 rounded-xl">
              <h2 className="text-white text-xl font-bold mb-4">About Tournaments</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Compete against other players in exciting tournaments across different game categories.
                Climb the leaderboard, win amazing prizes, and prove you&apos;re the best!
              </p>
              <ul className="list-disc list-inside text-white/70 text-sm space-y-2">
                <li>Free and paid entry tournaments available</li>
                <li>Real-time leaderboards</li>
                <li>Multiple prize tiers</li>
                <li>Regular tournaments throughout the week</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


