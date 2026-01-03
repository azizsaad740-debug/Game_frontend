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
        id: 'blackjack',
        name: 'Blackjack Pro',
        slug: 'blackjack',
        category: 'table',
        provider: 'Garbet Tables',
        thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Needs a real img
        banner: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&auto=format&fit=crop&q=60',
        description: {
            en: 'Classic Blackjack. Beat the dealer to win big.',
            tr: 'Klasik Blackjack. Krupiyeyi yen ve büyük kazan.'
        },
        featured: true,
        popular: true,
        new: true,
        minBet: 10,
        maxBet: 5000,
        rtp: 99.5,
        tags: ['table', 'cards', 'blackjack', 'strategy'],
        componentPath: 'blackjack',
        requiresAuth: true,
        active: true,
        meta: {
            title: 'Blackjack Pro - Online Casino',
            description: 'Play high stakes Blackjack online.',
            keywords: 'blackjack, cards, casino, table games'
        }
    },
    {
        id: 'burning-hot',
        name: 'Burning Hot',
        slug: 'burning-hot',
        category: 'slots',
        provider: 'EGT',
        thumbnail: 'file:///C:/Users/Saada/.gemini/antigravity/brain/ad04e003-6d62-4c02-a2f0-87046db32a06/burning_hot_thumbnail_1767204638573.png',
        banner: 'file:///C:/Users/Saada/.gemini/antigravity/brain/ad04e003-6d62-4c02-a2f0-87046db32a06/burning_hot_banner_1767204662246.png',
        description: {
            en: 'Classic fruit slot with expanding wilds and fiery wins!',
            tr: 'Genişleyen wild sembolleri ve ateşli kazançlarla klasik meyve slotu!'
        },
        featured: true,
        popular: true,
        new: true,
        metadata: {
            rules: {
                en: [
                    'Match 3 or more symbols on a payline to win',
                    'Clover symbol is Wild and expands to cover the entire reel',
                    'Seven (7) is the highest paying symbol',
                    'Scatter symbols (Star, $) pay in any position'
                ],
                tr: [
                    'Kazanmak için bir ödeme çizgisinde 3 veya daha fazla sembolü eşleştirin',
                    'Yonca sembolü Wild\'dır ve tüm makarayı kaplayacak şekilde genişler',
                    'Yedi (7) en yüksek ödeme yapan semboldür',
                    'Scatter sembolleri (Yıldız, $) herhangi bir pozisyonda ödeme yapar'
                ]
            },
            features: ['Expanding Wilds', 'Scatter Pays', 'Gamble Feature', 'Jackpot Cards']
        },
        minBet: 10,
        maxBet: 5000,
        rtp: 96.45,
        tags: ['slots', 'classic', 'fruit', 'egt', 'jackpot'],
        componentPath: 'burning-hot',
        requiresAuth: true,
        active: true,
        meta: {
            title: 'Burning Hot - Classic EGT Slot',
            description: 'Play Burning Hot online slot. Classic fruit machine with modern features.',
            keywords: 'burning hot, slot, egt, casino, fruit slot'
        }
    },
    {
        id: 'crash',
        name: 'Crash',
        slug: 'crash',
        category: 'crash-games',
        provider: 'In-House',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8qmSEpnangbZPsEjVrL4-T_QPnQkwNw-hEeOmBbriCBPZ0rAdek9_QXP3OxhpJ4TT1Vv-sFc9RtkrNVz9okC-aMPyaeFOghAFXTt0ggedS8eftCzprVzWRuleHIcF8813i6rAJ1Ef8s0yzVx3TbeeaVLXcLBvLkt-jpxGRC4e7fSDs-pKcyTVXvmCSqAqkKGxFsznPC_WtVn-pl4HY-lYn6vFERfeOA4G3uX_-npkmhkZ8b242jMomzQMvGI35c1jqJFlNcMCqCY',
        banner: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        description: {
            en: 'Watch the multiplier rise and cash out before it crashes!',
            tr: 'Çarpanın yükselmesini izleyin ve çökmeden önce nakde çevirin!'
        },
        featured: true,
        popular: true,
        new: false,
        minBet: 10,
        maxBet: 10000,
        rtp: 97.5,
        tags: ['multiplier', 'instant', 'high-risk'],
        // Path to the game component (relative to /apps folder)
        componentPath: 'crash',
        // Whether the game requires authentication
        requiresAuth: true,
        // Whether the game is currently active
        active: true,
        // SEO metadata
        meta: {
            title: 'Crash Game - High Multiplier Betting',
            description: 'Experience the thrill of Crash game with multipliers up to 1000x',
            keywords: 'crash game, multiplier, betting, casino'
        }
    },
    {
        id: 'dice-roll',
        name: 'Dice Roll',
        slug: 'dice-roll',
        category: 'dice-games',
        provider: 'In-House',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxL1mseMlK2-RLOjovS4IIJ0pwn3Nvdm_yIiJltXUeUrWycM84O2-syNPpKZ4QoyXyLmqRmsdts_-Crvliv3zi5_DabbcAGW5_i1oZTRAFUKy0FJDHiNsM_XDdwAiCKz-VTEVjK6IL4_eHbK1Uavg71T2aS7BRPUiKr6ylEEvKe4jpgb3TauZzHWPFju1QBLhy49KoC5l67zEAZdYC3GMcDvMatAW3YSX79vAwNP6NgkW-l-NOj4a4xZZvm7eCwS7W4kF42-dDTA',
        banner: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        description: {
            en: 'Classic dice game with customizable odds',
            tr: 'Özelleştirilebilir oranlarla klasik zar oyunu'
        },
        featured: false,
        popular: true,
        new: false,
        minBet: 5,
        maxBet: 5000,
        rtp: 98.0,
        tags: ['dice', 'classic', 'provably-fair'],
        componentPath: 'dice-roll',
        requiresAuth: true,
        active: true,
        meta: {
            title: 'Dice Roll - Provably Fair Dice Game',
            description: 'Play classic dice game with provably fair results',
            keywords: 'dice, dice game, provably fair, casino'
        }
    },
    {
        id: 'dice-roll-pvp',
        name: 'Dice Roll PvP',
        slug: 'dice-roll-pvp',
        category: 'dice-games',
        provider: 'In-House',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxL1mseMlK2-RLOjovS4IIJ0pwn3Nvdm_yIiJltXUeUrWycM84O2-syNPpKZ4QoyXyLmqRmsdts_-Crvliv3zi5_DabbcAGW5_i1oZTRAFUKy0FJDHiNsM_XDdwAiCKz-VTEVjK6IL4_eHbK1Uavg71T2aS7BRPUiKr6ylEEvKe4jpgb3TauZzHWPFju1QBLhy49KoC5l67zEAZdYC3GMcDvMatAW3YSX79vAwNP6NgkW-l-NOj4a4xZZvm7eCwS7W4kF42-dDTA',
        banner: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        description: {
            en: 'Battle against other players in real-time dice duels!',
            tr: 'Gerçek zamanlı zar düellolarında diğer oyunculara karşı savaşın!'
        },
        featured: true,
        popular: true,
        new: true,
        minBet: 10,
        maxBet: 10000,
        rtp: 97.0,
        tags: ['dice', 'pvp', 'betting', 'real-time'],
        componentPath: 'dice-roll-pvp',
        requiresAuth: true,
        active: true,
        meta: {
            title: 'Dice Roll PvP - Battle & Bet',
            description: 'Experience real-time dice betting and PvP action',
            keywords: 'dice, pvp, betting, multiplayer'
        }
    },
    {
        id: 'mines',
        name: 'Mines',
        slug: 'mines',
        category: 'table',
        provider: 'Garbet Tables',
        thumbnail: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?w=800&auto=format&fit=crop&q=60',
        banner: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?w=1200&auto=format&fit=crop&q=60',
        description: {
            en: 'Find the diamonds while avoiding hidden mines for massive multipliers!',
            tr: 'Büyük çarpanlar için gizli mayınlardan kaçınırken elmasları bulun!'
        },
        featured: true,
        popular: true,
        new: true,
        minBet: 10,
        maxBet: 5000,
        rtp: 98.5,
        tags: ['table', 'mines', 'instant'],
        componentPath: 'mines',
        requiresAuth: true,
        active: true,
        meta: {
            title: 'Mines Pro - Online Casino',
            description: 'Play high stakes Mines online.',
            keywords: 'mines, casino, table games'
        }
    },
    {
        id: 'plinko',
        name: 'Plinko',
        slug: 'plinko',
        category: 'others',
        provider: 'Garbet Tables',
        thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=60',
        banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=60',
        description: {
            en: 'Drop the ball and watch it hit huge multipliers at the bottom!',
            tr: 'Topu bırakın ve alttaki devasa çarpanlara çarpmasını izleyin!'
        },
        featured: true,
        popular: true,
        new: true,
        minBet: 10,
        maxBet: 5000,
        rtp: 98.0,
        tags: ['others', 'plinko', 'instant'],
        componentPath: 'plinko',
        requiresAuth: true,
        active: true,
        meta: {
            title: 'Plinko - Classic Multiplier Game',
            description: 'Experience the thrill of Plinko.',
            keywords: 'plinko, casino, multipliers'
        }
    },
    {
        id: 'scissors',
        name: 'Rock Paper Scissors',
        slug: 'scissors',
        category: 'others',
        provider: 'Garbet Tables',
        thumbnail: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800&auto=format&fit=crop&q=60',
        banner: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1200&auto=format&fit=crop&q=60',
        description: {
            en: 'Classic Rock Paper Scissors with real stakes!',
            tr: 'Gerçek bahislerle klasik Taş Kağıt Makas!'
        },
        featured: false,
        popular: true,
        new: true,
        minBet: 1,
        maxBet: 1000,
        rtp: 98.0,
        tags: ['others', 'classic', 'instant'],
        componentPath: 'scissors',
        requiresAuth: true,
        active: true,
        meta: {
            title: 'Rock Paper Scissors - Play Now',
            description: 'Win big with Rock Paper Scissors.',
            keywords: 'scissors, rock, paper, casino'
        }
    },
    {
        id: 'sweet-bonanza',
        name: 'Sweet Bonanza',
        slug: 'sweet-bonanza',
        category: 'slots',
        provider: 'Pragmatic Play',
        thumbnail: '/assets/game-thumbnails/sweet-bonanza.png',
        banner: '/games/sweet-bonanza-1000/background.png',
        description: {
            en: 'Colorful slot game with cascading wins and free spins',
            tr: 'Kademeli kazançlar ve ücretsiz dönüşlerle renkli slot oyunu'
        },
        featured: false,
        popular: false,
        new: false,
        minBet: 20,
        maxBet: 1000,
        rtp: 96.5,
        tags: ['slots', 'cascading', 'free-spins'],
        componentPath: 'sweet-bonanza',
        requiresAuth: true,
        active: false,
        meta: {
            title: 'Sweet Bonanza - Pragmatic Play Slot',
            description: 'Play Sweet Bonanza slot with cascading wins and multipliers',
            keywords: 'sweet bonanza, slot, pragmatic play, casino'
        }
    },
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
    },
    {
        id: 'turtle-race',
        name: 'Turtle Race',
        slug: 'turtle-race',
        category: 'table',
        provider: 'Garbet Tables',
        thumbnail: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&auto=format&fit=crop&q=60',
        banner: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=1200&auto=format&fit=crop&q=60',
        description: {
            en: 'Bet on the fastest turtle and win!',
            tr: 'En hızlı kaplumbağaya bahis yap ve kazan!'
        },
        featured: true,
        popular: true,
        new: true,
        minBet: 10,
        maxBet: 5000,
        rtp: 97,
        tags: ['table', 'racing', 'turtle'],
        componentPath: 'turtle-race',
        requiresAuth: true,
        active: true,
        meta: {
            title: 'Turtle Race - Garbet',
            description: 'Experience the thrill of turtle racing.',
            keywords: 'turtle race, racing, casino'
        }
    },
    {
        id: 'slots-pro',
        name: 'Slots Pro',
        slug: 'slots-pro',
        category: 'slots',
        provider: 'Garbet Games',
        thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&auto=format&fit=crop&q=60',
        banner: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&auto=format&fit=crop&q=60',
        description: {
            en: 'High stakes slot machine with 9 paylines.',
            tr: '9 ödeme hattına sahip yüksek bahisli slot makinesi.'
        },
        featured: true,
        popular: true,
        new: true,
        minBet: 1,
        maxBet: 10000,
        rtp: 96,
        tags: ['slots', 'luck'],
        componentPath: 'slots-pro',
        requiresAuth: true,
        active: true,
        meta: {
            title: 'Slots Pro - Garbet',
            description: 'Spin to win on professional slot machines.',
            keywords: 'slots, casino, jackpot'
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
