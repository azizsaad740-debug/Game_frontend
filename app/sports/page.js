'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'
import { matchAPI } from '@/lib/api'
import { log } from '@/utils/logger'

export default function SportsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [dateFilter, setDateFilter] = useState(t('sports.today'))
  const [selectedBets, setSelectedBets] = useState([])
  const [sortBy, setSortBy] = useState(t('sports.time'))
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stake, setStake] = useState('')
  const [placingBet, setPlacingBet] = useState(false)

  // Fetch matches from API
  useEffect(() => {
    fetchMatches()
  }, [dateFilter])

  const fetchMatches = async () => {
    setLoading(true)
    setError('')
    try {
      // Build query params based on date filter
      const params = {
        status: 'upcoming',
        page: 1,
        limit: 50,
      }

      // Add date filter
      if (dateFilter === t('sports.today')) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        params.startDate = today.toISOString()
        params.endDate = tomorrow.toISOString()
      } else if (dateFilter === t('sports.tomorrow')) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        const dayAfter = new Date(tomorrow)
        dayAfter.setDate(dayAfter.getDate() + 1)
        params.startDate = tomorrow.toISOString()
        params.endDate = dayAfter.toISOString()
      } else if (dateFilter === t('sports.threeDays')) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const threeDaysLater = new Date(today)
        threeDaysLater.setDate(threeDaysLater.getDate() + 3)
        params.startDate = today.toISOString()
        params.endDate = threeDaysLater.toISOString()
      }
      // 'all' doesn't need date filter

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

  // Transform match data for UI
  const transformMatchForUI = (match) => {
    // Find 1X2 market
    const market1X2 = match.markets?.find(m => m.type === '1X2')
    const odds = {}
    if (market1X2) {
      market1X2.selections.forEach(sel => {
        if (sel.name === 'Team A Win') odds['1'] = sel.odds
        else if (sel.name === 'Draw') odds['X'] = sel.odds
        else if (sel.name === 'Team B Win') odds['2'] = sel.odds
      })
    }

    // Format date
    const matchDate = new Date(match.matchDate)
    const isToday = matchDate.toDateString() === new Date().toDateString()
    const isTomorrow = matchDate.toDateString() === new Date(Date.now() + 86400000).toDateString()

    let dateStr = matchDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    if (isToday) dateStr = 'Today'
    else if (isTomorrow) dateStr = 'Tomorrow'

    const timeStr = match.matchTime || matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

    return {
      id: match._id,
      _id: match._id,
      date: `${dateStr}, ${timeStr}`,
      teams: [
        { name: match.teamA, logo: match.teamALogo },
        { name: match.teamB, logo: match.teamBLogo }
      ],
      odds,
      matchName: match.matchName,
      league: match.league,
      leagueLogo: match.leagueLogo,
      country: match.country,
      status: match.status,
      moreOptions: match.markets?.length || 0,
      rawMatch: match,
    }
  }

  const transformedMatches = matches.map(transformMatchForUI).filter(m => m && (m._id || m.id) && m.odds && Object.keys(m.odds).length > 0) // Filter out invalid matches

  const handleSelectBet = (match, selection, odds) => {
    // Handle both transformed and raw match objects
    const rawMatch = match.rawMatch || match
    const matchId = rawMatch._id || match._id || match.id

    // Validate inputs
    if (!matchId || !odds || isNaN(parseFloat(odds))) {
      console.error('Invalid bet selection:', { match, selection, odds })
      setError('Invalid bet selection. Please try again.')
      return
    }

    const bet = {
      matchId: matchId,
      matchName: match.matchName || rawMatch.matchName || `${rawMatch.teamA || 'Team A'} vs ${rawMatch.teamB || 'Team B'}`,
      selection: selection === '1' ? 'Team A Win' : selection === 'X' ? 'Draw' : 'Team B Win',
      selectionShort: selection, // Keep short form for display
      odds: parseFloat(odds),
      marketType: '1X2',
      marketName: 'Match Winner',
    }

    // Check if already selected
    const existingIndex = selectedBets.findIndex(b => b.matchId === matchId && b.selection === bet.selection)
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
      // For now, place single bets (can be extended to multi-bet later)
      for (const bet of selectedBets) {
        await matchAPI.placeBet(bet.matchId, {
          marketType: bet.marketType,
          marketName: bet.marketName,
          selection: bet.selection,
          stake: parseFloat(stake),
          useBonusBalance: false,
        })
      }

      // Success - clear bets and redirect
      setSelectedBets([])
      setStake('')
      router.push('/dashboard')
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

  const totalStake = stake || '0.00'
  const potentialWinnings = selectedBets.length > 0 && stake
    ? (parseFloat(stake) * parseFloat(totalOdds)).toFixed(2)
    : '0.00'

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark navbar-spacing">
      <Navbar />

      {/* Main Content Layout */}
      <div className="mx-auto w-full max-w-screen-2xl p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="col-span-12 hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 flex flex-col gap-6 rounded-lg bg-surface p-4">
              {/* Search Bar */}
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-text-secondary flex border-none bg-background-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-background-dark h-full placeholder:text-text-secondary px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                    placeholder={t('sports.searchPlaceholder')}
                    type="text"
                  />
                </div>
              </label>

              {/* Segmented Buttons */}
              <div className="flex">
                <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-background-dark p-1">
                  {[t('sports.today'), t('sports.tomorrow'), t('sports.threeDays'), t('sports.all')].map((option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 text-text-secondary text-sm font-medium leading-normal ${dateFilter === option
                        ? 'bg-accent-teal shadow-lg shadow-accent-teal/10 text-background-dark'
                        : ''
                        }`}
                    >
                      <span className="truncate">{option}</span>
                      <input
                        checked={dateFilter === option}
                        onChange={() => setDateFilter(option)}
                        className="invisible w-0"
                        name="date-filter"
                        type="radio"
                        value={option}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Accordions */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-2 py-3 bg-accent-blue/10 rounded-lg border border-accent-blue/20 mb-2">
                  <span className="material-symbols-outlined text-accent-blue">stars</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Top Leagues</span>
                </div>

                {[
                  {
                    name: t('sports.football'), icon: 'sports_soccer', countries: [
                      { name: 'Turkey', leagues: ['Super Lig', '1. Lig'] },
                      { name: 'England', leagues: ['Premier League', 'Championship'] },
                      { name: 'Spain', leagues: ['La Liga', 'Segunda Division'] },
                    ]
                  },
                  {
                    name: t('sports.basketball'), icon: 'sports_basketball', countries: [
                      { name: 'USA', leagues: ['NBA', 'NCAA'] },
                      { name: 'Turkey', leagues: ['BSL', 'TBL'] },
                    ]
                  },
                  {
                    name: t('sports.tennis'), icon: 'sports_tennis', countries: [
                      { name: 'World', leagues: ['ATP Tour', 'WTA Tour'] },
                    ]
                  },
                ].map((sport) => (
                  <details key={sport.name} className="flex flex-col py-1 group">
                    <summary className="flex cursor-pointer items-center justify-between gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-text-secondary group-hover:text-white transition-colors">{sport.icon}</span>
                        <p className="text-sm font-medium leading-normal text-text-primary group-hover:text-white">{sport.name}</p>
                      </div>
                      <span className="material-symbols-outlined text-text-secondary group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="flex flex-col gap-1 pl-9 mt-1">
                      {sport.countries.map((country) => (
                        <details key={country.name} className="group/country">
                          <summary className="flex cursor-pointer items-center justify-between py-2 text-xs text-text-secondary hover:text-white">
                            <span>{country.name}</span>
                            <span className="material-symbols-outlined !text-sm group-open/country:rotate-180 transition-transform">expand_more</span>
                          </summary>
                          <div className="flex flex-col gap-1 pl-4 pb-2 border-l border-white/5">
                            {country.leagues.map((league) => (
                              <Link
                                key={league}
                                className="text-[11px] py-1 text-text-secondary/60 hover:text-accent-blue hover:underline transition-all"
                                href={`/sports?sport=${sport.name.toLowerCase()}&country=${country.name.toLowerCase()}&league=${league.toLowerCase()}`}
                              >
                                {league}
                              </Link>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            {/* Breadcrumbs & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs text-text-secondary">{t('sports.breadcrumbSports')} &gt; {t('sports.breadcrumbFootball')} &gt; <span className="text-text-primary">{t('sports.turkey')} &gt; {t('sports.superLig')}</span></p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-secondary">{t('sports.sortBy')}</span>
                <button
                  onClick={() => setSortBy(t('sports.time'))}
                  className={`rounded-md px-3 py-1 ${sortBy === t('sports.time') ? 'bg-surface text-text-primary' : 'text-text-secondary'}`}
                >
                  {t('sports.time')}
                </button>
                <button
                  onClick={() => setSortBy(t('sports.league'))}
                  className={`rounded-md px-3 py-1 ${sortBy === t('sports.league') ? 'bg-surface text-text-primary' : 'text-text-secondary'}`}
                >
                  {t('sports.league')}
                </button>
              </div>
            </div>

            {/* League Section */}
            <div className="flex flex-col gap-4">
              <h3 className="font-heading text-lg font-semibold text-white">{t('sports.turkey')} - {t('sports.superLig')}</h3>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-text-secondary">Loading matches...</p>
                </div>
              ) : transformedMatches.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-text-secondary">No matches found</p>
                </div>
              ) : (
                transformedMatches.map((match) => (
                  <div key={match.id} className="flex flex-col gap-3 rounded-xl bg-surface p-5 shadow-2xl shadow-black/40 ring-1 ring-white/5 hover:ring-white/10 transition-all">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary uppercase font-black tracking-widest">
                      <div className="flex items-center gap-2">
                        {match.leagueLogo && <img src={match.leagueLogo} className="w-4 h-4 object-contain" alt="" />}
                        <span>{match.league}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{match.date}</span>
                        <Link className="flex items-center gap-1 text-accent-blue hover:brightness-125 transition-all" href={`/sports/${match.id}`}>
                          <span className="bg-accent-blue/10 px-2 py-0.5 rounded">+{match.moreOptions}</span>
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center mt-2">
                      <div className="col-span-12 md:col-span-5 flex flex-col gap-3">
                        {match.teams.map((team, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-background-dark shadow-inner p-1">
                              {team.logo ? (
                                <img src={team.logo} className="w-full h-full object-contain" alt={team.name} />
                              ) : (
                                <span className="material-symbols-outlined !text-lg text-text-secondary/30">shield</span>
                              )}
                            </div>
                            <span className="text-sm font-bold text-text-primary">{team.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="col-span-12 md:col-span-7 grid grid-cols-3 gap-3">
                        {['1', 'X', '2'].map((option) => {
                          const oddsValue = match.odds?.[option]
                          const matchId = match._id || match.id || (match.rawMatch && match.rawMatch._id)
                          const isSelected = selectedBets.some(
                            b => b.matchId === matchId &&
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
                              className={`group relative flex flex-col items-center justify-center rounded-xl p-3 transition-all ${isSelected
                                ? 'bg-primary shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                : oddsValue && !isNaN(parseFloat(oddsValue))
                                  ? 'bg-background-dark hover:bg-white/5 border border-white/5 active:scale-95'
                                  : 'bg-background-dark/30 opacity-50 cursor-not-allowed border border-transparent'
                                }`}
                            >
                              <span className={`text-[9px] font-black uppercase mb-1 ${isSelected ? 'text-background-dark/60' : 'text-text-secondary'}`}>
                                {option === '1' ? 'W1' : option === 'X' ? 'Draw' : 'W2'}
                              </span>
                              <span className={`text-sm font-black ${isSelected ? 'text-background-dark' : 'text-primary'}`}>
                                {oddsValue ? parseFloat(oddsValue).toFixed(2) : '-'}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )))}
            </div>
          </main>

          {/* Right Sidebar (Bet Slip) */}
          <aside className="col-span-12 hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 flex flex-col gap-4 rounded-lg bg-surface p-4 z-30">
              <h3 className="font-heading text-lg font-semibold text-white">{t('sports.betSlip')}</h3>

              {selectedBets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-color p-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-text-secondary">receipt_long</span>
                  <p className="mt-2 text-sm text-text-secondary">{t('sports.selectOutcome')}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Selected Bets List */}
                  <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
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
                              <p className="text-sm font-medium text-white truncate">{bet.matchName || 'Match'}</p>
                              <p className="text-xs text-text-secondary mt-1">{bet.marketName || 'Match Winner'}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedBets(selectedBets.filter((_, i) => i !== index))
                              }}
                              className="text-text-secondary hover:text-red-400 transition-colors shrink-0"
                              aria-label="Remove bet"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm font-bold text-primary">{bet.selection || 'N/A'}</p>
                            <p className="text-sm font-bold text-white">@{bet.odds ? parseFloat(bet.odds).toFixed(2) : 'N/A'}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Total Odds and Stake */}
                  <div className="border-t border-background-dark pt-4">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-text-secondary">{t('sports.totalOdds')}</span>
                      <span className="font-bold text-white">{totalOdds}</span>
                    </div>
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">{t('sports.totalStake')}</label>
                        <span className="text-[10px] text-white/40">Min: ₺5.00</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={stake}
                          onChange={(e) => setStake(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full rounded-xl bg-background-dark px-4 py-3 text-white border border-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">₺</span>
                      </div>

                      {/* Stake Presets */}
                      <div className="grid grid-cols-4 gap-2 mt-1">
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
                    <div className="flex items-center justify-between text-lg mb-4">
                      <span className="text-text-secondary">{t('sports.potentialWinnings')}</span>
                      <span className="font-bold text-primary">₺{potentialWinnings}</span>
                    </div>
                    <button
                      onClick={handlePlaceBet}
                      disabled={selectedBets.length === 0 || !stake || parseFloat(stake) <= 0 || placingBet}
                      className={`w-full rounded-lg py-3 text-sm font-bold transition-all ${selectedBets.length > 0 && stake && parseFloat(stake) > 0
                        ? 'bg-primary text-background-dark cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-primary/30 text-primary/60 cursor-not-allowed'
                        }`}
                    >
                      {placingBet ? 'Placing Bet...' : t('sports.placeBet')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Bet Slip Button */}
      {selectedBets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[50] lg:hidden p-4 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent shadow-lg border-t border-white/10">
          <button
            onClick={handlePlaceBet}
            disabled={!stake || parseFloat(stake) <= 0 || placingBet}
            className="w-full flex justify-between items-center rounded-lg bg-primary py-3 px-4 text-background-dark font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <span>{t('sports.betSlip')} ({selectedBets.length}) - {placingBet ? 'Placing...' : `₺${potentialWinnings}`}</span>
            <span className="material-symbols-outlined">expand_less</span>
          </button>
        </div>
      )}
    </div>
  )
}

