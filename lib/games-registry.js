/**
 * Games Registry
 * 
 * This file contains all game configurations for the platform.
 * To add a new game:
 * 1. Create a folder in /apps/[game-name]
 * 2. Add the game component in /apps/[game-name]/index.js
 * 3. Add game metadata here
 * 4. The game will automatically be available on the platform
 */

export const gamesRegistry = [
    {
        id: 'sweet-bonanza-1000',
        name: 'Sweet Bonanza',
        slug: 'sweet-bonanza-premium',
        category: 'slots',
        provider: 'Pragmatic Play Style',
        thumbnail: '/assets/game-thumbnails/sweet-bonanza-premium.png',
        banner: '/games/sweet-bonanza-1000/background.png',
        description: {
            en: 'A sugary world of multipliers and tumbling symbols. Pay anywhere and win big in this 6x5 slot!',
            tr: 'Çarpanlar ve takla atan sembollerle dolu şekerli bir dünya. Bu 6x5 slot oyununda her yerde ödeme al ve büyük kazan!'
        },
        featured: true,
        popular: true,
        new: true,
        minBet: 2,
        maxBet: 1000,
        rtp: 96.53,
        tags: ['slots', 'cascading', 'multipliers', 'sweet-bonanza'],
        componentPath: 'sweet-bonanza-1000',
        requiresAuth: true,
        active: true,
        meta: {
            title: 'Sweet Bonanza 1000 - Premium Slot Game',
            description: 'Play Sweet Bonanza 1000 with multipliers up to 1000x',
            keywords: 'sweet bonanza 1000, slot, multipliers, casino'
        }
    }
]

/**
 * Get all games
 */
export const getAllGames = () => {
    return gamesRegistry.filter(game => game.active)
}

/**
 * Get game by slug
 */
export const getGameBySlug = (slug) => {
    return gamesRegistry.find(game => game.slug === slug && game.active)
}

/**
 * Get game by ID
 */
export const getGameById = (id) => {
    return gamesRegistry.find(game => game.id === id && game.active)
}

/**
 * Get games by category
 */
export const getGamesByCategory = (category) => {
    return gamesRegistry.filter(game => game.category === category && game.active)
}

/**
 * Get featured games
 */
export const getFeaturedGames = () => {
    return gamesRegistry.filter(game => game.featured && game.active)
}

/**
 * Get popular games
 */
export const getPopularGames = () => {
    return gamesRegistry.filter(game => game.popular && game.active)
}

/**
 * Get new games
 */
export const getNewGames = () => {
    return gamesRegistry.filter(game => game.new && game.active)
}

/**
 * Get games by provider
 */
export const getGamesByProvider = (provider) => {
    return gamesRegistry.filter(game => game.provider === provider && game.active)
}

/**
 * Search games by name
 */
export const searchGames = (query) => {
    const lowerQuery = query.toLowerCase()
    return gamesRegistry.filter(game =>
        game.active && (
            game.name.toLowerCase().includes(lowerQuery) ||
            game.description.en.toLowerCase().includes(lowerQuery) ||
            game.description.tr.toLowerCase().includes(lowerQuery) ||
            game.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        )
    )
}

/**
 * Get all categories
 */
export const getAllCategories = () => {
    const categories = [...new Set(gamesRegistry.map(game => game.category))]
    return categories
}

/**
 * Get all providers
 */
export const getAllProviders = () => {
    const providers = [...new Set(gamesRegistry.map(game => game.provider))]
    return providers
}
