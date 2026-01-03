'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { mockStatistics, mockBets, simulateApiDelay } from '@/lib/mockData'
import { statsAPI } from '@/lib/api'

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      const USE_MOCK_DATA = false

      if (USE_MOCK_DATA) {
        await simulateApiDelay(600)
        setStats(mockStatistics)
        setLoading(false)
        return
      }

      try {
        const response = await statsAPI.getUserStatistics()
        const betting = response.data?.betting || {}

        const totalBets = betting.totalBets || 0
        const totalStake = betting.totalStake || 0
        const totalWinnings = betting.totalWinnings || 0
        const totalPotentialWin = betting.totalPotentialWin || 0

        const transformedStats = {
          totalBets,
          wonBets: betting.wonBets || 0,
          lostBets: betting.lostBets || 0,
          pendingBets: betting.pendingBets || 0,
          totalStake,
          totalWinnings,
          totalPotentialWin,
          winRate: betting.winRate || 0,
          profitLoss: betting.profitLoss || 0,
          avgStake: totalBets > 0 ? totalStake / totalBets : 0,
          avgOdds: totalStake > 0 ? totalPotentialWin / totalStake : 0,
        }

        setStats(transformedStats)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading statistics:', error)
        }
        // Fallback to mock data on error
        setStats(mockStatistics)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA] navbar-spacing">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA] navbar-spacing">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-white text-4xl font-bold mb-2">Statistics</h1>
            <p className="text-white/60 mb-8">View your betting statistics and analytics</p>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <p className="text-white/60 text-sm mb-2">Total Bets</p>
                <p className="text-white text-3xl font-bold">{stats?.totalBets || 0}</p>
              </div>
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <p className="text-white/60 text-sm mb-2">Win Rate</p>
                <p className="text-white text-3xl font-bold">{stats?.winRate || 0}%</p>
              </div>
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <p className="text-white/60 text-sm mb-2">Total Stake</p>
                <p className="text-white text-3xl font-bold">₺{stats?.totalStake?.toLocaleString('tr-TR') || '0'}</p>
              </div>
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <p className="text-white/60 text-sm mb-2">Total Winnings</p>
                <p className="text-green-400 text-3xl font-bold">₺{stats?.totalWinnings?.toLocaleString('tr-TR') || '0'}</p>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <h2 className="text-white text-xl font-bold mb-4">Betting Breakdown</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Won Bets</span>
                    <span className="text-green-400 font-bold">{stats?.wonBets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Lost Bets</span>
                    <span className="text-red-400 font-bold">{stats?.lostBets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Pending Bets</span>
                    <span className="text-yellow-400 font-bold">{stats?.pendingBets || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <h2 className="text-white text-xl font-bold mb-4">Financial Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Stake</span>
                    <span className="text-white font-bold">₺{stats?.totalStake?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Winnings</span>
                    <span className="text-green-400 font-bold">₺{stats?.totalWinnings?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white font-semibold">Net Result</span>
                    <span className={`font-bold text-xl ${(stats?.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(stats?.profitLoss || 0) >= 0 ? '+' : ''}₺{Math.abs(stats?.profitLoss || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-component-dark rounded-lg p-6 border border-white/10">
              <h2 className="text-white text-xl font-bold mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-white/60 text-sm mb-2">Average Odds</p>
                  <p className="text-white text-2xl font-bold">{stats?.avgOdds?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-2">Average Stake</p>
                  <p className="text-white text-2xl font-bold">₺{stats?.avgStake?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-2">Total Potential Win</p>
                  <p className="text-white text-2xl font-bold">₺{stats?.totalPotentialWin?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

