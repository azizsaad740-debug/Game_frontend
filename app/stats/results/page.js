'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { mockMatches, simulateApiDelay } from '@/lib/mockData'
import { statsAPI } from '@/lib/api'

export default function ResultsPage() {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])

  useEffect(() => {
    const fetchResults = async () => {
      const USE_MOCK_DATA = false

      if (USE_MOCK_DATA) {
        await simulateApiDelay(600)
        // Filter only finished matches
        const finishedMatches = mockMatches.filter(m => m.status === 'finished')
        setResults(finishedMatches)
        setLoading(false)
        return
      }

      try {
        const response = await statsAPI.getMatchResults()
        const apiResults = response.data?.results || []
        // Map API results to match the structure expected by the UI
        const normalized = apiResults.map((match) => ({
          ...match,
          _id: match.id || match._id,
        }))
        setResults(normalized)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading match results:', error)
        }
        // Fallback to mock data on error
        const finishedMatches = mockMatches.filter(m => m.status === 'finished')
        setResults(finishedMatches)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
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
            <h1 className="text-white text-4xl font-bold mb-2">Match Results</h1>
            <p className="text-white/60 mb-8">View recent match results and statistics</p>

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((match) => (
                  <div key={match._id} className="bg-component-dark rounded-lg p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white/60 text-sm mb-1">{match.league}</p>
                        <p className="text-white/40 text-xs">{new Date(match.matchDate).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                        Finished
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex-1 text-right">
                            <p className="text-white font-semibold text-lg">{match.teamA}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white text-2xl font-bold">
                              {match.result.teamAScore}
                            </span>
                            <span className="text-white/40">-</span>
                            <span className="text-white text-2xl font-bold">
                              {match.result.teamBScore}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-lg">{match.teamB}</p>
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <p className="text-white/60 text-sm">
                            Winner: <span className="text-white font-medium">
                              {match.result.winner === 'teamA' ? match.teamA :
                                match.result.winner === 'teamB' ? match.teamB : 'Draw'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <p className="text-white/70 text-center">No match results available yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

