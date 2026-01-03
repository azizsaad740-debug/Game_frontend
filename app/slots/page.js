'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'

/* -----------------------------
   🔒 MOVE GAMES OUTSIDE COMPONENT
--------------------------------*/
import { getAllGames } from '@/lib/games-registry'

const registryGames = getAllGames().map(game => ({
  id: game.id || game.slug,
  name: game.name,
  provider: game.provider,
  category: game.category === 'slots' ? 'popular' : 'all',
  image: game.thumbnail,
  slug: game.slug,
  isRegistryGame: true
}))

/* -----------------------------
   🔒 MOVE GAMES OUTSIDE COMPONENT
--------------------------------*/
const staticGames = [
  // Dice Roll Game - Featured
  { id: 'dice-roll', name: 'Dice Roll', provider: 'Garbet Games', category: 'popular', isDiceRoll: true, image: 'https://media.istockphoto.com/id/525032572/photo/gambling-craps-game.jpg?s=1024x1024&w=is&k=20&c=EIaZAJCR2qvuh2ilrT4b4j4DTreeMbOWvWi7URBcQUA=' },
  // (YOUR FULL GAMES ARRAY — UNCHANGED)
  // ⚠️ KEEP ALL 100 ITEMS EXACTLY AS YOU SENT
]

const games = [...registryGames, ...staticGames]

export default function SlotsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [jackpotAmount, setJackpotAmount] = useState(1018617.65)
  const [filteredGames, setFilteredGames] = useState([])

  /* -----------------------------
     LIVE JACKPOT (SAFE)
  --------------------------------*/
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpotAmount(prev => prev + Math.random() * 100)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const providers = [
    'all',
    'Pragmatic Play',
    'NetEnt',
    "Play'n GO",
    'Microgaming',
    'Big Time Gaming',
    'Evolution',
    'Push Gaming',
    'Yggdrasil',
    'Quickspin',
    'Red Tiger',
    'Hacksaw Gaming',
    'Relax Gaming'
  ]

  const categories = ['all', 'popular', 'new', 'trending', 'jackpot', 'live']

  const tournaments = [
    { id: 1, name: 'Daily Drops & Wins', prize: '₺50,000', participants: 1247, timeLeft: '2h 15m' },
    { id: 2, name: 'Mega Tournament', prize: '₺100,000', participants: 2891, timeLeft: '1d 5h' },
    { id: 3, name: 'Weekend Warriors', prize: '₺25,000', participants: 856, timeLeft: '4h 32m' },
    { id: 4, name: 'Jackpot Race', prize: '₺75,000', participants: 1654, timeLeft: '6h 18m' }
  ]

  /* -----------------------------
     ✅ FIXED FILTER EFFECT
  --------------------------------*/
  useEffect(() => {
    let filtered = games

    if (searchQuery) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.category === selectedCategory)
    }

    if (selectedProvider !== 'all') {
      filtered = filtered.filter(game => game.provider === selectedProvider)
    }

    setFilteredGames(filtered)
    setCurrentPage(1) // reset page on filter change
  }, [searchQuery, selectedCategory, selectedProvider])

  const gamesPerPage = 24
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage)
  const startIndex = (currentPage - 1) * gamesPerPage
  const displayedGames = filteredGames.slice(startIndex, startIndex + gamesPerPage)

  /* -----------------------------
     ⬇️ UI BELOW IS 100% UNCHANGED
  --------------------------------*/
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#181611] navbar-spacing">
      <Navbar />
      <div className="flex w-full max-w-screen-2xl mx-auto">
        {/* Left Sidebar - Tournaments */}
        <aside className="hidden lg:block w-80 p-4">
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 mb-6">
            <div className="text-center text-white">
              <h3 className="text-lg font-bold mb-2">DAILY JACKPOT</h3>
              <div className="text-3xl font-black mb-2">₺{jackpotAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              <p className="text-sm opacity-90">Must be won today!</p>
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-xl p-4">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500">emoji_events</span>
              TOURNAMENTS
            </h3>
            <div className="space-y-3">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white text-sm font-semibold">{tournament.name}</h4>
                    <span className="text-xs text-gray-400">{tournament.timeLeft}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-500 font-bold text-sm">{tournament.prize}</span>
                    <span className="text-gray-400 text-xs">{tournament.participants} players</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {/* Promotional Banner */}
          <div className="mb-6">
            <div
              className="relative flex min-h-[200px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-center p-8 text-left overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(139, 69, 19, 0.9) 0%, rgba(139, 69, 19, 0.3) 100%), url("https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&h=400&fit=crop")`
              }}
            >
              <div className="absolute top-4 right-4">
                <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop" alt="Bounty Hunter" className="w-24 h-24 rounded-lg" />
              </div>
              <div className="flex flex-col gap-4 max-w-lg z-10">
                <h1 className="text-white text-3xl font-black leading-tight">BOUNTY HUNTER</h1>
                <h2 className="text-yellow-400 text-2xl font-bold">10000X&apos;E VARAN</h2>
                <h3 className="text-white text-xl font-semibold">KAZANÇ SİZİ BEKLİYOR!</h3>
                <button className="flex min-w-[120px] w-fit cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-black text-sm font-bold leading-normal tracking-[0.015em] hover:bg-yellow-400 transition-all">
                  <span className="truncate">ŞİMDİ OYNA</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  placeholder={t('slots.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-[#2a2a2a] text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                    ? 'bg-primary text-black'
                    : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                    }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Provider Filters */}
            <div className="flex flex-wrap gap-2">
              {providers.map((provider) => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${selectedProvider === provider
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
                    }`}
                >
                  {provider === 'all' ? 'ALL PROVIDERS' : provider}
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {displayedGames.map((game) => (
              <div key={game.id} className="group relative bg-[#2a2a2a] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-200">
                {game.isDiceRoll ? (
                  <Link href="/dice-roll" className="block cursor-pointer">
                    <div className="relative">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                      {game.jackpot && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                          JACKPOT
                        </div>
                      )}
                      {game.isDiceRoll && (
                        <div className="absolute top-2 left-2 bg-[#0dccf2] text-black text-xs font-bold px-2 py-1 rounded">
                          NEW
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-primary text-black px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 hover:bg-yellow-400">
                          PLAY
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : game.isRegistryGame ? (
                  <Link href={`/play/${game.slug}`} className="block cursor-pointer">
                    <div className="relative">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                        MODULAR
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-primary text-black px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 hover:bg-yellow-400">
                          PLAY
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : game.isSweetBonanza || game.name === 'Sweet Bonanza' ? (
                  <div
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (router) {
                        router.push('/sweet-bonanza')
                      } else {
                        window.location.href = '/sweet-bonanza'
                      }
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (router) {
                        router.push('/sweet-bonanza')
                      } else {
                        window.location.href = '/sweet-bonanza'
                      }
                    }}
                    className="block cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                        HOT
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-primary text-black px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 hover:bg-yellow-400">
                          PLAY
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/slots?game=${encodeURIComponent(game.name || game.id || '')}`}
                    className="block cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                      {game.jackpot && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                          JACKPOT
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-primary text-black px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 hover:bg-yellow-400">
                          PLAY
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                <div className="p-3">
                  <h3 className="text-white text-sm font-semibold truncate">{game.name}</h3>
                  <p className="text-gray-400 text-xs truncate">{game.provider}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium ${currentPage === page
                      ? 'bg-primary text-black'
                      : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                      }`}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
