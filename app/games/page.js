'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import {
    getAllGames,
    getAllCategories,
    getAllProviders,
    getGamesByCategory,
    getGamesByProvider,
    searchGames
} from '@/lib/games-registry'

export default function GamesPage() {
    const { t } = useTranslation()
    const [games, setGames] = useState([])
    const [filteredGames, setFilteredGames] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedProvider, setSelectedProvider] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [categories, setCategories] = useState([])
    const [providers, setProviders] = useState([])

    useEffect(() => {
        const allGames = getAllGames()
        setGames(allGames)
        setFilteredGames(allGames)
        setCategories(getAllCategories())
        setProviders(getAllProviders())
    }, [])

    useEffect(() => {
        let result = games

        // Filter by search query
        if (searchQuery) {
            result = searchGames(searchQuery)
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            result = result.filter(game => game.category === selectedCategory)
        }

        // Filter by provider
        if (selectedProvider !== 'all') {
            result = result.filter(game => game.provider === selectedProvider)
        }

        setFilteredGames(result)
    }, [searchQuery, selectedCategory, selectedProvider, games])

    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
    }

    const handleProviderChange = (provider) => {
        setSelectedProvider(provider)
    }

    return (
        <div className="min-h-screen bg-background-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-white text-4xl font-black mb-2">All Games</h1>
                    <p className="text-text-secondary">Browse our collection of {games.length} games</p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface/50 text-white rounded-lg px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                            search
                        </span>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleCategoryChange('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === 'all'
                                    ? 'bg-primary text-background-dark'
                                    : 'bg-surface/50 text-text-secondary hover:bg-surface'
                                }`}
                        >
                            All Categories
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryChange(category)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${selectedCategory === category
                                        ? 'bg-primary text-background-dark'
                                        : 'bg-surface/50 text-text-secondary hover:bg-surface'
                                    }`}
                            >
                                {category.replace('-', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Provider Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-sm font-medium">Provider:</span>
                        <select
                            value={selectedProvider}
                            onChange={(e) => handleProviderChange(e.target.value)}
                            className="bg-surface/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10"
                        >
                            <option value="all">All Providers</option>
                            {providers.map((provider) => (
                                <option key={provider} value={provider}>
                                    {provider}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Games Grid */}
                {filteredGames.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredGames.map((game) => (
                            <Link
                                key={game.id}
                                href={`/play/${game.slug}`}
                                className="group relative overflow-hidden rounded-lg border border-white/10 bg-surface/30 hover:bg-surface/50 transition-all duration-300 hover:scale-105"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={game.thumbnail}
                                        alt={game.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        {game.new && (
                                            <span className="bg-primary text-background-dark text-xs font-black px-2 py-1 rounded">
                                                NEW
                                            </span>
                                        )}
                                        {game.featured && (
                                            <span className="bg-accent-teal text-white text-xs font-black px-2 py-1 rounded">
                                                FEATURED
                                            </span>
                                        )}
                                        {game.popular && (
                                            <span className="bg-accent-blue text-white text-xs font-black px-2 py-1 rounded">
                                                POPULAR
                                            </span>
                                        )}
                                    </div>

                                    {/* Play overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-5xl">
                                            play_circle
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <h3 className="text-white font-bold text-sm mb-1 truncate group-hover:text-primary transition-colors">
                                        {game.name}
                                    </h3>
                                    <p className="text-text-secondary text-xs truncate">{game.provider}</p>
                                    <div className="flex items-center justify-between mt-2 text-xs">
                                        <span className="text-text-secondary">RTP: {game.rtp}%</span>
                                        <span className="text-primary font-bold">{game.minBet}₺ - {game.maxBet}₺</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-text-secondary text-6xl mb-4">
                            search_off
                        </span>
                        <p className="text-text-secondary text-lg">No games found</p>
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setSelectedCategory('all')
                                setSelectedProvider('all')
                            }}
                            className="mt-4 px-6 py-2 bg-primary text-background-dark font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
