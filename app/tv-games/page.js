'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'

export default function TVGamesPage() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const tvGames = [
    {
      id: 1,
      name: 'Wheel of Fortune',
      category: 'wheel',
      image: 'https://www.nintendo.com/eu/media/images/10_share_images/games_15/nintendo_switch_download_software_1/H2x1_NSwitchDS_WheelOfFortune_image1600w.jpg',
      players: 1247,
      prize: 12500
    },
    {
      id: 2,
      name: 'Lucky Numbers',
      category: 'numbers',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2oC-DOHGP-qQBRAgdDsxXuxyOlrIG3P7Skw&s',
      players: 892,
      prize: 8500
    },
    {
      id: 3,
      name: 'Keno Live',
      category: 'keno',
      image: 'https://www.shutterstock.com/shutterstock/photos/1392120926/display_1500/stock-vector-keno-lottery-game-logo-template-isolated-on-white-template-isolated-on-white-1392120926.jpg',
      players: 2156,
      prize: 18900
    },
    {
      id: 4,
      name: 'Bingo Live',
      category: 'bingo',
      image: 'https://media.istockphoto.com/id/1147844177/vector/bingo-lottery-game-logo.jpg?s=612x612&w=0&k=20&c=L6kRUX4qrFGFuctbB7tJ6JkTryFfdNeXLxFCWio0K6Y=',
      players: 3456,
      prize: 25000
    },
    {
      id: 5,
      name: 'Lottery Draw',
      category: 'lottery',
      image: 'https://gametik-studio.com/cdn/shop/files/Player_Lottery_Logo.png?v=1738947627',
      players: 5678,
      prize: 50000
    },
    {
      id: 6,
      name: 'Spin the Wheel',
      category: 'wheel',
      image: 'https://play-lh.googleusercontent.com/JHiKVEovdXgrQyU0Nn0d94_LVv54JV5aYBjfikQBvjUjgYac8BAU-B-BHP5La9bxKnUzt5cK1FII4WaREJVKeA=w526-h296-rw',
      players: 2341,
      prize: 15000
    },
  ]

  const categories = ['all', 'wheel', 'numbers', 'keno', 'bingo', 'lottery']

  const filteredGames = selectedCategory === 'all'
    ? tvGames
    : tvGames.filter(game => game.category === selectedCategory)

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-dark navbar-spacing">
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-16 xl:px-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                {t('common.tvGames')}
              </h1>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                      ? 'bg-primary text-background-dark'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}
                >
                  {category === 'all' ? t('common.all') : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredGames.map((game) => (
                <Link
                  key={game.id}
                  href="/slots"
                  className="group relative overflow-hidden rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all"
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-sm mb-1">{game.name}</h3>
                      <div className="flex items-center justify-between text-xs text-white/80">
                        <span>{game.players} players</span>
                        <span className="text-primary font-bold">₺{game.prize.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">LIVE</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Info Section */}
            <div className="mt-8 p-6 bg-zinc-900 rounded-xl">
              <h2 className="text-white text-xl font-bold mb-4">About TV Games</h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Experience the thrill of live TV games with real-time draws and instant results.
                Join thousands of players competing for exciting prizes. Watch the action unfold
                live and place your bets for a chance to win big!
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


