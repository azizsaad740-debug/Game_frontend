/**
 * Mock Data for Frontend Demo
 * This file contains dummy data for all features to showcase the platform
 */

// Mock User Data
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  username: 'demo_user',
  email: 'demo@garbet.com',
  firstName: 'Demo',
  lastName: 'User',
  phone: '+90 555 123 4567',
  balance: 12500.50,
  bonusBalance: 2500.00,
  totalDeposits: 50000,
  totalWithdrawals: 20000,
  totalWinnings: 15000,
  status: 'active',
  role: 'user',
  currency: 'TRY',
  kycStatus: 'verified',
  createdAt: '2024-01-15T10:30:00Z',
  lastLogin: '2024-12-20T14:25:00Z',
}

// Mock Transactions
export const mockTransactions = [
  {
    _id: '1',
    type: 'deposit',
    amount: 5000,
    status: 'completed',
    description: 'IBAN Deposit',
    createdAt: '2024-12-20T10:00:00Z',
    metadata: { iban: 'TR00 0000 0000 0000 0000 0000 00' }
  },
  {
    _id: '2',
    type: 'win',
    amount: 2500,
    status: 'completed',
    description: 'Bet Win - Match #12345',
    createdAt: '2024-12-19T15:30:00Z',
    metadata: { betId: 'bet123' }
  },
  {
    _id: '3',
    type: 'bet',
    amount: 500,
    status: 'completed',
    description: 'Sports Bet',
    createdAt: '2024-12-19T14:00:00Z',
    metadata: { betId: 'bet123' }
  },
  {
    _id: '4',
    type: 'withdrawal',
    amount: 2000,
    status: 'pending',
    description: 'IBAN Withdrawal',
    createdAt: '2024-12-18T09:00:00Z',
    metadata: { iban: 'TR00 0000 0000 0000 0000 0000 00' }
  },
  {
    _id: '5',
    type: 'deposit',
    amount: 3000,
    status: 'completed',
    description: 'IBAN Deposit',
    createdAt: '2024-12-17T11:00:00Z',
    metadata: { iban: 'TR00 0000 0000 0000 0000 0000 00' }
  },
  {
    _id: '6',
    type: 'bonus',
    amount: 1000,
    status: 'completed',
    description: 'Deposit Bonus',
    createdAt: '2024-12-17T11:05:00Z',
    metadata: { bonusId: 'bonus1' }
  },
  {
    _id: '7',
    type: 'bet',
    amount: 750,
    status: 'completed',
    description: 'Live Bet',
    createdAt: '2024-12-16T20:00:00Z',
    metadata: { betId: 'bet122' }
  },
  {
    _id: '8',
    type: 'win',
    amount: 1500,
    status: 'completed',
    description: 'Bet Win - Match #12344',
    createdAt: '2024-12-16T22:00:00Z',
    metadata: { betId: 'bet122' }
  },
]

// Mock Bonuses
export const mockBonuses = [
  {
    _id: 'bonus1',
    type: 'deposit_bonus',
    amount: 1000,
    status: 'active',
    rolloverRequirement: 5000,
    rolloverProgress: 2500,
    expiresAt: '2025-01-17T11:05:00Z',
    createdAt: '2024-12-17T11:05:00Z',
    description: '20% Deposit Bonus'
  },
  {
    _id: 'bonus2',
    type: 'loss_bonus',
    amount: 500,
    status: 'active',
    rolloverRequirement: 2500,
    rolloverProgress: 1000,
    expiresAt: '2025-01-20T10:00:00Z',
    createdAt: '2024-12-20T10:00:00Z',
    description: 'Loss Bonus'
  },
  {
    _id: 'bonus3',
    type: 'deposit_bonus',
    amount: 2000,
    status: 'used',
    rolloverRequirement: 10000,
    rolloverProgress: 10000,
    expiresAt: '2024-12-10T10:00:00Z',
    createdAt: '2024-11-10T10:00:00Z',
    description: '20% Deposit Bonus'
  },
]

// Mock Bets
export const mockBets = [
  {
    _id: 'bet1',
    match: {
      _id: 'match1',
      teamA: 'Galatasaray',
      teamB: 'Fenerbahçe',
      league: 'Süper Lig',
      category: 'football',
      matchDate: '2024-12-21T20:00:00Z',
      result: {
        teamAScore: 2,
        teamBScore: 1,
        winner: 'teamA',
        isSettled: true
      }
    },
    marketType: 'match_result',
    marketName: 'Match Result',
    selection: 'Galatasaray',
    odds: 2.50,
    stake: 500,
    potentialWin: 1250,
    winAmount: 1250,
    status: 'won',
    settledAt: '2024-12-21T22:00:00Z',
    createdAt: '2024-12-21T19:00:00Z'
  },
  {
    _id: 'bet2',
    match: {
      _id: 'match2',
      teamA: 'Beşiktaş',
      teamB: 'Trabzonspor',
      league: 'Süper Lig',
      category: 'football',
      matchDate: '2024-12-20T18:00:00Z',
      result: {
        teamAScore: 1,
        teamBScore: 2,
        winner: 'teamB',
        isSettled: true
      }
    },
    marketType: 'match_result',
    marketName: 'Match Result',
    selection: 'Beşiktaş',
    odds: 1.80,
    stake: 750,
    potentialWin: 1350,
    winAmount: 0,
    status: 'lost',
    settledAt: '2024-12-20T20:00:00Z',
    createdAt: '2024-12-20T17:00:00Z'
  },
  {
    _id: 'bet3',
    match: {
      _id: 'match3',
      teamA: 'Real Madrid',
      teamB: 'Barcelona',
      league: 'La Liga',
      category: 'football',
      matchDate: '2024-12-22T21:00:00Z',
      result: null
    },
    marketType: 'over_under',
    marketName: 'Over/Under 2.5 Goals',
    selection: 'Over 2.5',
    odds: 1.95,
    stake: 1000,
    potentialWin: 1950,
    winAmount: 0,
    status: 'pending',
    createdAt: '2024-12-22T20:00:00Z'
  },
  {
    _id: 'bet4',
    match: {
      _id: 'match4',
      teamA: 'Manchester United',
      teamB: 'Liverpool',
      league: 'Premier League',
      category: 'football',
      matchDate: '2024-12-19T17:00:00Z',
      result: {
        teamAScore: 3,
        teamBScore: 0,
        winner: 'teamA',
        isSettled: true
      }
    },
    marketType: 'both_teams_score',
    marketName: 'Both Teams to Score',
    selection: 'Yes',
    odds: 1.70,
    stake: 600,
    potentialWin: 1020,
    winAmount: 0,
    status: 'lost',
    settledAt: '2024-12-19T19:00:00Z',
    createdAt: '2024-12-19T16:00:00Z'
  },
  {
    _id: 'bet5',
    match: {
      _id: 'match5',
      teamA: 'Bayern Munich',
      teamB: 'Borussia Dortmund',
      league: 'Bundesliga',
      category: 'football',
      matchDate: '2024-12-18T19:30:00Z',
      result: {
        teamAScore: 2,
        teamBScore: 2,
        winner: 'draw',
        isSettled: true
      }
    },
    marketType: 'match_result',
    marketName: 'Match Result',
    selection: 'Draw',
    odds: 3.20,
    stake: 400,
    potentialWin: 1280,
    winAmount: 1280,
    status: 'won',
    settledAt: '2024-12-18T21:30:00Z',
    createdAt: '2024-12-18T18:30:00Z'
  },
]

// Mock Matches
export const mockMatches = [
  {
    _id: 'match1',
    teamA: 'Galatasaray',
    teamB: 'Fenerbahçe',
    league: 'Süper Lig',
    category: 'football',
    matchDate: '2024-12-21T20:00:00Z',
    status: 'finished',
    result: {
      teamAScore: 2,
      teamBScore: 1,
      winner: 'teamA',
      isSettled: true,
      settledAt: '2024-12-21T22:00:00Z'
    },
    odds: {
      teamA: 2.50,
      draw: 3.20,
      teamB: 2.80
    }
  },
  {
    _id: 'match2',
    teamA: 'Beşiktaş',
    teamB: 'Trabzonspor',
    league: 'Süper Lig',
    category: 'football',
    matchDate: '2024-12-20T18:00:00Z',
    status: 'finished',
    result: {
      teamAScore: 1,
      teamBScore: 2,
      winner: 'teamB',
      isSettled: true,
      settledAt: '2024-12-20T20:00:00Z'
    },
    odds: {
      teamA: 1.80,
      draw: 3.50,
      teamB: 4.20
    }
  },
  {
    _id: 'match3',
    teamA: 'Real Madrid',
    teamB: 'Barcelona',
    league: 'La Liga',
    category: 'football',
    matchDate: '2024-12-22T21:00:00Z',
    status: 'upcoming',
    result: null,
    odds: {
      teamA: 2.10,
      draw: 3.40,
      teamB: 3.20
    }
  },
  {
    _id: 'match4',
    teamA: 'Manchester United',
    teamB: 'Liverpool',
    league: 'Premier League',
    category: 'football',
    matchDate: '2024-12-19T17:00:00Z',
    status: 'finished',
    result: {
      teamAScore: 3,
      teamBScore: 0,
      winner: 'teamA',
      isSettled: true,
      settledAt: '2024-12-19T19:00:00Z'
    },
    odds: {
      teamA: 2.30,
      draw: 3.10,
      teamB: 3.00
    }
  },
  {
    _id: 'match5',
    teamA: 'Bayern Munich',
    teamB: 'Borussia Dortmund',
    league: 'Bundesliga',
    category: 'football',
    matchDate: '2024-12-18T19:30:00Z',
    status: 'finished',
    result: {
      teamAScore: 2,
      teamBScore: 2,
      winner: 'draw',
      isSettled: true,
      settledAt: '2024-12-18T21:30:00Z'
    },
    odds: {
      teamA: 1.90,
      draw: 3.20,
      teamB: 3.80
    }
  },
  {
    _id: 'match6',
    teamA: 'PSG',
    teamB: 'Marseille',
    league: 'Ligue 1',
    category: 'football',
    matchDate: '2024-12-23T20:00:00Z',
    status: 'upcoming',
    result: null,
    odds: {
      teamA: 1.70,
      draw: 3.60,
      teamB: 5.00
    }
  },
]

// Mock Messages
export const mockMessages = [
  {
    _id: 'msg1',
    sender: {
      _id: 'admin1',
      username: 'Support Team',
      email: 'support@garbet.com'
    },
    recipient: mockUser._id,
    subject: 'Welcome to Garbet!',
    content: 'Welcome to Garbet! We are excited to have you here. If you have any questions, feel free to contact our support team.',
    type: 'system',
    category: 'general',
    isRead: false,
    isImportant: true,
    createdAt: '2024-12-20T10:00:00Z'
  },
  {
    _id: 'msg2',
    sender: {
      _id: 'admin1',
      username: 'Support Team',
      email: 'support@garbet.com'
    },
    recipient: mockUser._id,
    subject: 'Deposit Bonus Available',
    content: 'You have received a 20% deposit bonus on your last deposit. Check your bonuses section for details.',
    type: 'system',
    category: 'promotion',
    isRead: false,
    isImportant: false,
    createdAt: '2024-12-17T11:05:00Z'
  },
  {
    _id: 'msg3',
    sender: {
      _id: 'admin1',
      username: 'Support Team',
      email: 'support@garbet.com'
    },
    recipient: mockUser._id,
    subject: 'Withdrawal Request Received',
    content: 'Your withdrawal request of ₺2,000 has been received and is being processed. You will receive a notification once it is approved.',
    type: 'system',
    category: 'transaction',
    isRead: true,
    isImportant: false,
    createdAt: '2024-12-18T09:00:00Z'
  },
]

// Mock Promotions
export const mockPromotions = [
  {
    _id: 'promo1',
    title: 'Welcome Bonus - 100% up to ₺5,000',
    description: 'New members get 100% bonus on their first deposit up to ₺5,000!',
    type: 'deposit_bonus',
    bonusAmount: 5000,
    bannerImage: '/images/promotions/welcome-bonus.jpg',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    status: 'active',
    isFeatured: true,
    priority: 1
  },
  {
    _id: 'promo2',
    title: 'Weekly Reload Bonus - 50% up to ₺2,000',
    description: 'Get 50% bonus on every deposit this week!',
    type: 'deposit_bonus',
    bonusAmount: 2000,
    bannerImage: '/images/promotions/reload-bonus.jpg',
    startDate: '2024-12-16T00:00:00Z',
    endDate: '2024-12-23T23:59:59Z',
    status: 'active',
    isFeatured: true,
    priority: 2
  },
  {
    _id: 'promo3',
    title: 'Loss Bonus - Get 20% Back',
    description: 'Lose a bet? Get 20% back as bonus!',
    type: 'loss_bonus',
    bonusAmount: 0,
    bannerImage: '/images/promotions/loss-bonus.jpg',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    status: 'active',
    isFeatured: false,
    priority: 3
  },
]

// Mock Tournaments
export const mockTournaments = [
  {
    _id: 'tournament1',
    name: 'Weekly Champions League',
    description: 'Compete in this week\'s Champions League tournament!',
    gameType: 'football',
    prizePool: 50000,
    entryFee: 100,
    startDate: '2024-12-23T00:00:00Z',
    endDate: '2024-12-30T23:59:59Z',
    status: 'upcoming',
    totalParticipants: 125,
    maxPlayers: 500,
    isFeatured: true,
    bannerImage: '/images/tournaments/champions-league.jpg'
  },
  {
    _id: 'tournament2',
    name: 'Daily Free Roll',
    description: 'Free entry tournament with ₺1,000 prize pool!',
    gameType: 'football',
    prizePool: 1000,
    entryFee: 0,
    startDate: '2024-12-20T00:00:00Z',
    endDate: '2024-12-20T23:59:59Z',
    status: 'active',
    totalParticipants: 250,
    maxPlayers: 1000,
    isFeatured: true,
    bannerImage: '/images/tournaments/free-roll.jpg'
  },
]

// Mock Statistics
export const mockStatistics = {
  totalBets: 45,
  wonBets: 18,
  lostBets: 22,
  pendingBets: 5,
  totalStake: 25000,
  totalWinnings: 18500,
  winRate: 45.0,
  profitLoss: -6500,
  avgOdds: 2.15,
  avgStake: 555.56
}

// Mock Dashboard Stats
export const mockDashboardStats = {
  balance: 12500.50,
  bonusBalance: 2500.00,
  totalBets: 45,
  activeBets: 5,
  wonBets: 18,
  lostBets: 22,
  totalStake: 25000,
  totalWinnings: 18500,
  winRate: 45.0,
  profitLoss: -6500,
  activeBonuses: 2,
  totalDeposits: 50000,
  totalWithdrawals: 20000,
  recentDeposits: 3,
  recentWithdrawals: 1
}

// Mock Admin Users
export const mockAdminUsers = [
  {
    _id: 'user1',
    username: 'john_doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    balance: 5000,
    status: 'active',
    role: 'user',
    totalDeposits: 20000,
    totalWithdrawals: 10000,
    createdAt: '2024-01-10T10:00:00Z',
    lastLogin: '2024-12-20T15:00:00Z'
  },
  {
    _id: 'user2',
    username: 'jane_smith',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    balance: 15000,
    status: 'active',
    role: 'user',
    totalDeposits: 50000,
    totalWithdrawals: 20000,
    createdAt: '2024-02-15T10:00:00Z',
    lastLogin: '2024-12-20T14:00:00Z'
  },
  {
    _id: 'user3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    balance: 2500,
    status: 'suspended',
    role: 'user',
    totalDeposits: 10000,
    totalWithdrawals: 5000,
    createdAt: '2024-03-20T10:00:00Z',
    lastLogin: '2024-12-19T10:00:00Z'
  },
]

// Mock Admin Deposits
export const mockAdminDeposits = [
  {
    _id: 'deposit1',
    user: {
      _id: 'user1',
      username: 'john_doe',
      email: 'john@example.com'
    },
    amount: 5000,
    status: 'pending',
    type: 'iban',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    createdAt: '2024-12-20T10:00:00Z'
  },
  {
    _id: 'deposit2',
    user: {
      _id: 'user2',
      username: 'jane_smith',
      email: 'jane@example.com'
    },
    amount: 3000,
    status: 'pending',
    type: 'iban',
    iban: 'TR11 1111 1111 1111 1111 1111 11',
    createdAt: '2024-12-20T09:00:00Z'
  },
]

// Mock Admin Withdrawals
export const mockAdminWithdrawals = [
  {
    _id: 'withdrawal1',
    user: {
      _id: 'user1',
      username: 'john_doe',
      email: 'john@example.com'
    },
    amount: 2000,
    status: 'pending',
    type: 'iban',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    createdAt: '2024-12-20T11:00:00Z'
  },
  {
    _id: 'withdrawal2',
    user: {
      _id: 'user2',
      username: 'jane_smith',
      email: 'jane@example.com'
    },
    amount: 5000,
    status: 'approved',
    type: 'iban',
    iban: 'TR11 1111 1111 1111 1111 1111 11',
    createdAt: '2024-12-19T10:00:00Z',
    approvedAt: '2024-12-19T11:00:00Z'
  },
]

// Helper function to simulate API delay
export const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock Admin Dashboard Stats
export const mockAdminStats = {
  totalUsers: { value: 1250, change: '+12.5%' },
  activeBets: { value: 342, change: '+8.2%' },
  pendingWithdrawals: { value: 15, change: '-5.3%' },
  newRegistrations24h: { value: 28, change: '+15.0%' },
  revenue: { value: 125000, change: '+22.1%' },
}

// Mock Admin Recent Transactions
export const mockAdminTransactions = [
  {
    _id: 'tx1',
    user: { username: 'john_doe', email: 'john@example.com' },
    type: 'deposit',
    amount: 5000,
    status: 'completed',
    createdAt: '2024-12-20T10:00:00Z'
  },
  {
    _id: 'tx2',
    user: { username: 'jane_smith', email: 'jane@example.com' },
    type: 'withdrawal',
    amount: 2000,
    status: 'pending',
    createdAt: '2024-12-20T09:30:00Z'
  },
  {
    _id: 'tx3',
    user: { username: 'bob_wilson', email: 'bob@example.com' },
    type: 'deposit',
    amount: 3000,
    status: 'completed',
    createdAt: '2024-12-20T09:00:00Z'
  },
]

// Mock Admin Chart Data (30 days)
export const mockAdminChartData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: date.toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 10000) + 5000,
    deposits: Math.floor(Math.random() * 8000) + 3000,
    withdrawals: Math.floor(Math.random() * 5000) + 1000,
  }
})

// Mock Game History
export const mockGameHistory = [
  {
    _id: 'game1',
    gameName: 'Gates of Olympus',
    provider: 'Pragmatic Play',
    type: 'slot',
    betAmount: 100,
    winAmount: 250,
    netResult: 150,
    rounds: 5,
    playedAt: '2024-12-20T15:30:00Z',
    status: 'completed'
  },
  {
    _id: 'game2',
    gameName: 'Lightning Roulette',
    provider: 'Evolution',
    type: 'live_casino',
    betAmount: 500,
    winAmount: 0,
    netResult: -500,
    rounds: 10,
    playedAt: '2024-12-20T14:00:00Z',
    status: 'completed'
  },
  {
    _id: 'game3',
    gameName: 'Sweet Bonanza',
    provider: 'Pragmatic Play',
    type: 'slot',
    betAmount: 200,
    winAmount: 800,
    netResult: 600,
    rounds: 3,
    playedAt: '2024-12-19T20:00:00Z',
    status: 'completed'
  },
  {
    _id: 'game4',
    gameName: 'Crazy Time',
    provider: 'Evolution',
    type: 'live_casino',
    betAmount: 300,
    winAmount: 150,
    netResult: -150,
    rounds: 8,
    playedAt: '2024-12-19T18:30:00Z',
    status: 'completed'
  },
  {
    _id: 'game5',
    gameName: 'Book of Dead',
    provider: "Play'n GO",
    type: 'slot',
    betAmount: 150,
    winAmount: 450,
    netResult: 300,
    rounds: 4,
    playedAt: '2024-12-18T16:00:00Z',
    status: 'completed'
  },
  {
    _id: 'game6',
    gameName: 'Mega Baccarat',
    provider: 'Ezugi',
    type: 'live_casino',
    betAmount: 1000,
    winAmount: 2000,
    netResult: 1000,
    rounds: 15,
    playedAt: '2024-12-18T12:00:00Z',
    status: 'completed'
  },
]

// Mock Recent Games (for quick access)
export const mockRecentGames = [
  {
    id: 1,
    name: 'Gates of Olympus',
    provider: 'Pragmatic Play',
    type: 'slot',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
    lastPlayed: '2024-12-20T15:30:00Z'
  },
  {
    id: 2,
    name: 'Lightning Roulette',
    provider: 'Evolution',
    type: 'live_casino',
    image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=300&h=400&fit=crop',
    lastPlayed: '2024-12-20T14:00:00Z'
  },
  {
    id: 3,
    name: 'Sweet Bonanza',
    provider: 'Pragmatic Play',
    type: 'slot',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop',
    lastPlayed: '2024-12-19T20:00:00Z'
  },
]

// Helper function to get mock data with delay
export const getMockData = async (data, delay = 500) => {
  await simulateApiDelay(delay)
  return { data }
}
