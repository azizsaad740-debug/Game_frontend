'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'
import { matchAPI } from '@/lib/api'
import { log } from '@/utils/logger'

export default function LiveBettingPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedBets, setSelectedBets] = useState([])
  const [stake, setStake] = useState('10.00')
  const [timeFilter, setTimeFilter] = useState(t('liveBetting.live'))
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [placingBet, setPlacingBet] = useState(false)

  // Fetch matches based on filter
  useEffect(() => {
    fetchMatches()
    // Refresh every 30 seconds for live matches
    const interval = setInterval(() => {
      if (timeFilter === t('liveBetting.live')) {
        fetchMatches()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [timeFilter])

  const fetchMatches = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: 1,
        limit: 50,
      }

      // Set status based on filter
      if (timeFilter === t('liveBetting.live')) {
        params.status = 'live'
      } else if (timeFilter === t('liveBetting.today')) {
        params.status = 'upcoming'
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        params.startDate = today.toISOString()
        params.endDate = tomorrow.toISOString()
      } else if (timeFilter === t('liveBetting.upcoming')) {
        params.status = 'upcoming'
      }

      const response = await matchAPI.getMatches(params)
      setMatches(response.data.matches || [])
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError(err.response?.data?.message || 'Failed to load matches')
      log.apiError('/matches', err)
    } finally {
      setLoading(false)
    }
  }

  // Group matches by league (filter out invalid matches)
  const validMatches = matches.filter(m => m && m._id && m.markets && Array.isArray(m.markets) && m.markets.length > 0)
  const groupedMatches = validMatches.reduce((acc, match) => {
    const league = match.league || 'Other'
    if (!acc[league]) {
      acc[league] = []
    }
    acc[league].push(match)
    return acc
  }, {})

  // Transform match for UI
  const transformMatchForUI = (match) => {
    const market1X2 = match.markets?.find(m => m.type === '1X2')
    const odds = {}
    if (market1X2) {
      market1X2.selections.forEach(sel => {
        if (sel.name === 'Team A Win') odds['1'] = sel.odds
        else if (sel.name === 'Draw') odds['X'] = sel.odds
        else if (sel.name === 'Team B Win') odds['2'] = sel.odds
      })
    }

    // Get score if available
    const score = match.result?.teamAScore !== null && match.result?.teamBScore !== null
      ? { a: match.result.teamAScore, b: match.result.teamBScore }
      : null

    // Format time (mocking elapsed time for live)
    let timeStr = match.status === 'live' ? '45\'' : match.matchTime || 'LIVE'

    return {
      id: match._id,
      _id: match._id,
      time: timeStr,
      teams: [
        { name: match.teamA, logo: match.teamALogo },
        { name: match.teamB, logo: match.teamBLogo }
      ],
      score,
      odds,
      matchName: match.matchName,
      league: match.league,
      leagueLogo: match.leagueLogo,
      status: match.status,
      rawMatch: match,
    }
  }

  const removeBet = (index) => {
    setSelectedBets(selectedBets.filter((_, i) => i !== index))
  }

  const handleSelectBet = (match, selection, odds) => {
    // Validate inputs
    if (!match || !match._id || !odds || isNaN(parseFloat(odds))) {
      console.error('Invalid bet selection:', { match, selection, odds })
      setError('Invalid bet selection. Please try again.')
      return
    }

    const bet = {
      matchId: match._id,
      matchName: match.matchName || `${match.teamA || 'Team A'} vs ${match.teamB || 'Team B'}`,
      match: match.matchName || `${match.teamA || 'Team A'} vs ${match.teamB || 'Team B'}`, // For display compatibility
      selection: selection === '1' ? 'Team A Win' : selection === 'X' ? 'Draw' : 'Team B Win',
      selectionShort: selection, // Keep short form for display
      odds: parseFloat(odds),
      marketType: '1X2',
      marketName: 'Match Winner',
      type: t('liveBetting.matchResult'),
    }

    const existingIndex = selectedBets.findIndex(b => b.matchId === match._id && b.selection === bet.selection)
    if (existingIndex >= 0) {
      setSelectedBets(selectedBets.filter((_, i) => i !== existingIndex))
    } else {
      setSelectedBets([...selectedBets, bet])
    }
  }

  const handlePlaceBet = async () => {
    if (selectedBets.length === 0 || !stake || parseFloat(stake) <= 0) {
      setError('Please select bets and enter a stake amount')
      return
    }

    setPlacingBet(true)
    setError('')

    try {
      // Place bets sequentially to handle errors properly
      const results = []
      for (const bet of selectedBets) {
        try {
          const response = await matchAPI.placeBet(bet.matchId, {
            marketType: bet.marketType,
            marketName: bet.marketName,
            selection: bet.selection,
            stake: parseFloat(stake),
            useBonusBalance: false,
          })
          results.push({ success: true, bet, response })
        } catch (betError) {
          results.push({ success: false, bet, error: betError })
          // Continue placing other bets even if one fails
        }
      }

      // Check if all bets were placed successfully
      const allSuccessful = results.every(r => r.success)
      if (allSuccessful) {
        setSelectedBets([])
        setStake('10.00')
        router.push('/dashboard')
      } else {
        // Show error for failed bets
        const failedBets = results.filter(r => !r.success)
        setError(`Failed to place ${failedBets.length} bet(s). Please try again.`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bet')
      log.apiError('/matches/bet', err)
    } finally {
      setPlacingBet(false)
    }
  }

  const totalOdds = selectedBets.length > 0
    ? selectedBets.reduce((acc, bet) => acc * bet.odds, 1).toFixed(2)
    : '0.00'
  const maxWinnings = selectedBets.length > 0 && stake
    ? (parseFloat(stake) * parseFloat(totalOdds)).toFixed(2)
    : '0.00'

  return (
    <div className="relative min-h-screen w-full bg-background-dark navbar-spacing">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 lg:flex-row lg:gap-8 lg:p-6">
        {/* Main Content */}
        <div className="w-full flex-1">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 rounded-xl bg-surface p-4 shadow-2xl shadow-black/40 ring-1 ring-white/5 sm:flex-row sm:items-center justify-between">
            {/* Chips / Sport Type */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'football', name: 'Futbol', icon: 'sports_soccer' },
                { id: 'basketball', name: 'Basketbol', icon: 'sports_basketball' },
                { id: 'tennis', name: 'Tenis', icon: 'sports_tennis' },
                { id: 'volleyball', name: 'Voleybol', icon: 'sports_volleyball' },
              ].map((sport) => (
                <button
                  key={sport.id}
                  className={`flex h-11 shrink-0 items-center justify-center gap-x-3 rounded-xl px-5 transition-all ${sport.id === 'football'
                    ? 'bg-primary text-background-dark font-bold shadow-lg shadow-primary/20'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <span className="material-symbols-outlined text-xl">{sport.icon}</span>
                  <span className="text-sm">{sport.name}</span>
                </button>
              ))}
            </div>

            {/* SegmentedButtons */}
            <div className="flex h-11 items-center bg-background-dark/50 rounded-xl p-1 gap-1 min-w-[300px]">
              {[
                { id: 'Live Now', label: 'Canlı' },
                { id: t('liveBetting.today'), label: t('liveBetting.today') },
                { id: t('liveBetting.upcoming'), label: t('liveBetting.upcoming') },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-bold transition-all ${timeFilter === option.id
                    ? 'bg-surface text-white shadow-xl'
                    : 'text-text-secondary hover:text-white'
                    }`}
                >
                  <span className="truncate">{option.label}</span>
                  <input
                    checked={timeFilter === option.id}
                    onChange={() => setTimeFilter(option.id)}
                    className="hidden"
                    name="time-filter"
                    type="radio"
                    value={option.id}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Match List */}
          <div className="mt-6 flex flex-col gap-4">
            {/* SectionHeader */}
            <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-primary-text px-2">{t('liveBetting.liveFootball')}</h2>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 mx-2">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-secondary-text">Loading matches...</p>
              </div>
            ) : (
              Object.entries(groupedMatches).map(([league, leagueMatches], leagueIndex) => (
                <div key={leagueIndex} className={`flex flex-col gap-3 ${leagueIndex > 0 ? 'mt-6' : ''}`}>
                  <div className="flex items-center gap-3 px-2 mb-1">
                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                    <h3 className="text-xs font-black uppercase tracking-tighter text-text-secondary">{league}</h3>
                  </div>

                  {leagueMatches.map((match) => {
                    const transformed = transformMatchForUI(match)
                    return (
                      <div key={match._id} className="flex flex-col gap-4 rounded-xl bg-surface p-5 shadow-2xl shadow-black/40 ring-1 ring-white/5 hover:ring-white/10 transition-all border-l-4 border-l-primary/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black text-primary animate-pulse">{transformed.time}</span>
                              <div className="flex items-center gap-1 mt-1 bg-red-500/20 px-1.5 py-0.5 rounded text-[8px] font-black text-red-500">
                                <span className="size-1 rounded-full bg-red-500 animate-ping"></span>
                                LIVE
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {transformed.teams.map((team, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="size-6 rounded-full bg-background-dark p-1 flex items-center justify-center">
                                    {team.logo ? (
                                      <img src={team.logo} className="w-full h-full object-contain" alt="" />
                                    ) : (
                                      <span className="material-symbols-outlined !text-xs text-text-secondary/30">shield</span>
                                    )}
                                  </div>
                                  <span className="text-sm font-bold text-text-primary">{team.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {transformed.score && (
                            <div className="flex flex-col items-center bg-background-dark/50 rounded-lg px-4 py-2 border border-white/5">
                              <div className="text-2xl font-black tracking-widest text-[#10b981]">
                                {transformed.score.a} - {transformed.score.b}
                              </div>
                              <span className="text-[9px] font-bold text-text-secondary uppercase mt-1">GÜNCEL SKOR</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                          {['1', 'X', '2'].map((option) => {
                            const oddsValue = transformed.odds?.[option]
                            const isSelected = selectedBets.some(
                              b => b.matchId === match._id &&
                                ((option === '1' && b.selection === 'Team A Win') ||
                                  (option === 'X' && b.selection === 'Draw') ||
                                  (option === '2' && b.selection === 'Team B Win'))
                            )
                            return (
                              <button
                                key={option}
                                onClick={() => {
                                  if (oddsValue && !isNaN(parseFloat(oddsValue))) {
                                    handleSelectBet(match, option, oddsValue)
                                  } else {
                                    setError('Invalid odds')
                                  }
                                }}
                                disabled={!oddsValue || isNaN(parseFloat(oddsValue))}
                                className={`group flex flex-col items-center justify-center rounded-xl py-3 px-4 transition-all ${isSelected
                                  ? 'bg-primary shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                  : oddsValue && !isNaN(parseFloat(oddsValue))
                                    ? 'bg-background-dark/80 hover:bg-white/5 border border-white/5 active:scale-95'
                                    : 'bg-background-dark/30 opacity-50 cursor-not-allowed border border-transparent'
                                  }`}
                              >
                                <span className={`text-[9px] font-black uppercase mb-1 ${isSelected ? 'text-background-dark/60' : 'text-text-secondary'}`}>
                                  {option === '1' ? 'W1' : option === 'X' ? 'Draw' : 'W2'}
                                </span>
                                <span className={`text-base font-black ${isSelected ? 'text-background-dark' : 'text-primary'}`}>
                                  {oddsValue ? parseFloat(oddsValue).toFixed(2) : '-'}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* BetSlip - Desktop */}
        <aside className="sticky top-24 hidden h-fit w-full max-w-xs flex-col gap-4 lg:flex z-30">
          <div className="rounded-lg bg-surface p-4 shadow-soft">
            <h3 className="mb-4 text-lg font-bold text-primary-text">{t('liveBetting.betSlip')}</h3>

            {selectedBets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <span className="material-symbols-outlined text-4xl text-secondary-text">receipt_long</span>
                <p className="mt-2 text-sm text-secondary-text">{t('liveBetting.yourSelections')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedBets.map((bet, index) => {
                  if (!bet || !bet.matchId) {
                    if (process.env.NODE_ENV === 'development') {
                      console.warn('Invalid bet in selectedBets:', bet)
                    }
                    return null
                  }
                  return (
                    <div key={`${bet.matchId}-${bet.selection}-${index}`} className="rounded-lg bg-background-dark p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary-text truncate">{bet.matchName || bet.match || 'Match'}</p>
                          <p className="text-xs text-secondary-text mt-1">{bet.type || bet.marketName || 'Match Winner'}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeBet(index)
                          }}
                          className="text-secondary-text hover:text-red-400 transition-colors shrink-0"
                          aria-label="Remove bet"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-bold text-primary">
                          {bet.selectionShort || bet.selection || 'N/A'}
                        </p>
                        <p className="text-sm font-bold text-primary-text">@{bet.odds ? parseFloat(bet.odds).toFixed(2) : 'N/A'}</p>
                      </div>
                    </div>
                  )
                })}

                {/* Total Odds and Stake */}
                <div className="mt-2 border-t border-background-dark pt-3">
                  <div className="flex justify-between text-sm font-medium text-secondary-text">
                    <span>{t('liveBetting.totalOdds')}</span>
                    <span className="text-primary-text">{totalOdds}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter" htmlFor="stake-desktop">{t('liveBetting.stake')}</label>
                      <span className="text-[10px] text-white/40">Min: ₺5.00</span>
                    </div>
                    <div className="relative">
                      <input
                        className="w-full rounded-xl border border-white/5 bg-background-dark py-3 pl-4 pr-12 text-sm font-bold text-white focus:ring-2 focus:ring-primary/50"
                        id="stake-desktop"
                        type="number"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">₺</span>
                    </div>

                    {/* Stake Presets */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[50, 100, 250, 500].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setStake(amount.toString())}
                          className="py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white/60 hover:bg-white/10 hover:text-white transition-all"
                        >
                          +₺{amount}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 flex justify-between items-end border-t border-white/5 pt-4">
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">{t('liveBetting.maxWinnings')}</span>
                    <span className="text-xl font-black text-primary">₺{maxWinnings}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handlePlaceBet}
                  disabled={selectedBets.length === 0 || !stake || parseFloat(stake) <= 0 || placingBet}
                  className={`mt-4 flex h-12 w-full items-center justify-center rounded-lg text-base font-bold shadow-soft transition-opacity ${selectedBets.length > 0 && stake && parseFloat(stake) > 0
                    ? 'bg-primary text-background-dark hover:opacity-90'
                    : 'bg-primary/30 text-primary/60 cursor-not-allowed'
                    }`}
                >
                  {placingBet ? 'Placing Bet...' : t('liveBetting.placeBet')}
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* BetSlip Trigger - Mobile */}
      {selectedBets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[50] block bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent px-4 pb-4 pt-8 lg:hidden shadow-lg border-t border-white/10">
          <button
            onClick={handlePlaceBet}
            disabled={!stake || parseFloat(stake) <= 0 || placingBet}
            className="flex h-14 w-full items-center justify-between rounded-lg bg-primary px-4 text-background-dark shadow-soft disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined font-semibold">receipt_long</span>
              <span className="text-base font-bold">Kuponu Görüntüle ({selectedBets.length})</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs">Toplam Oran</span>
              <span className="text-base font-bold">{totalOdds}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

