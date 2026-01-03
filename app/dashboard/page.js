'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import ProtectedRoute from '@/components/ProtectedRoute'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { authAPI, transactionAPI, bonusAPI } from '@/lib/api'
import { log } from '@/utils/logger'
import {
  mockUser,
  mockTransactions,
  mockBonuses,
  mockGameHistory,
  mockRecentGames,
  getMockData,
  simulateApiDelay
} from '@/lib/mockData'

function DashboardPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const [activeMenu, setActiveMenu] = useState(t('dashboard.menuOverview'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [activeBonuses, setActiveBonuses] = useState([])
  const [recentGames, setRecentGames] = useState([])
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalWagered: 0,
    totalWon: 0,
    netResult: 0
  })

  const menuItems = [
    { id: 'overview', label: t('dashboard.menuOverview'), icon: 'dashboard', href: '/dashboard' },
    { id: 'deposit', label: t('dashboard.menuDeposit'), icon: 'account_balance_wallet', href: '/deposit' },
    { id: 'withdraw', label: t('dashboard.menuWithdraw'), icon: 'payments', href: '/withdraw' },
    { id: 'bet-history', label: t('dashboard.menuBetHistory'), icon: 'receipt_long', href: '/sports' },
    { id: 'game-history', label: t('dashboard.menuGameHistory'), icon: 'casino', href: '/slots' },
    { id: 'bonuses', label: t('dashboard.menuBonuses'), icon: 'emoji_events', href: '/bonuses' },
    { id: 'settings', label: t('dashboard.menuSettings'), icon: 'settings', href: '/profile' }
  ]

  // Fetch user data and transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use mock data flag (default false - use real API)
        const USE_MOCK_DATA = false

        if (USE_MOCK_DATA) {
          await simulateApiDelay(800)
          setUser(mockUser || {})
          setRecentTransactions((mockTransactions || []).slice(0, 5))
          setActiveBonuses((mockBonuses || []).filter(b => b && b.status === 'active'))

          // Set recent games
          setRecentGames(mockRecentGames || [])

          // Calculate game stats
          const totalWagered = (mockGameHistory || []).reduce((sum, game) => sum + (game?.betAmount || 0), 0)
          const totalWon = (mockGameHistory || []).reduce((sum, game) => sum + (game?.winAmount || 0), 0)
          const netResult = totalWon - totalWagered
          setGameStats({
            totalGames: (mockGameHistory || []).length,
            totalWagered,
            totalWon,
            netResult
          })

          setLoading(false)
          return
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading dashboard data:', error)
        }
        // Set defaults on error
        setUser({ balance: 0, bonusBalance: 0 })
        setRecentTransactions([])
        setActiveBonuses([])
        setRecentGames([])
        setGameStats({ totalGames: 0, totalWagered: 0, totalWon: 0, netResult: 0 })
        setLoading(false)
        return
      }

      try {
        const userResponse = await authAPI.getMe()
        setUser(userResponse.data)

        // Fetch recent transactions
        try {
          const transactionsResponse = await transactionAPI.getMyTransactions({ limit: 5 })
          setRecentTransactions(transactionsResponse.data.transactions || [])
        } catch (err) {
          log.apiError('/transactions', err)
          // Fallback to mock data
          setRecentTransactions((mockTransactions || []).slice(0, 5))
        }

        // Fetch active bonuses
        try {
          const bonusesResponse = await bonusAPI.getMyBonuses()
          const allBonuses = bonusesResponse.data?.bonuses || []
          // Filter only active bonuses
          const active = allBonuses.filter(b => b && b.status === 'active')
          setActiveBonuses(active)
        } catch (err) {
          log.apiError('/bonus/my-bonuses', err)
          // Fallback to mock data
          setActiveBonuses((mockBonuses || []).filter(b => b && b.status === 'active'))
        }
      } catch (err) {
        log.apiError('/auth/me', err)
        // Fallback to mock data
        setUser(mockUser || {})
        setRecentTransactions((mockTransactions || []).slice(0, 5))
        setActiveBonuses((mockBonuses || []).filter(b => b && b.status === 'active'))
        // dont redirect if using mock data
        // if (err.response?.status === 401) {
        //   router.push('/auth/login')
        // }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Format transaction for display
  const formatTransaction = (transaction) => {
    const isPositive = transaction.type === 'deposit' || transaction.type === 'win' || transaction.status === 'approved'
    const amount = Math.abs(transaction.amount || 0)

    let icon = 'receipt'
    let iconBg = 'bg-gray-500/10'
    let iconColor = 'text-gray-400'
    let title = transaction.type || 'Transaction'

    if (transaction.type === 'deposit') {
      icon = 'paid'
      iconBg = 'bg-teal/10'
      iconColor = 'text-teal'
      title = t('dashboard.activityDeposit')
    } else if (transaction.type === 'withdrawal') {
      icon = 'account_balance_wallet'
      iconBg = 'bg-blue-500/10'
      iconColor = 'text-blue-400'
      title = t('dashboard.activityWithdraw')
    } else if (transaction.type === 'bet') {
      icon = 'sports_soccer'
      iconBg = 'bg-red-500/10'
      iconColor = 'text-red-400'
      title = t('dashboard.activityBet')
    } else if (transaction.type === 'win') {
      icon = 'toll'
      iconBg = 'bg-green-500/10'
      iconColor = 'text-green-400'
      title = t('dashboard.activityWin')
    }

    const date = new Date(transaction.createdAt || Date.now())
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    let dateStr = ''
    if (diffDays === 0) {
      dateStr = `${t('dashboard.today')}, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      dateStr = `${t('dashboard.yesterday')}, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      dateStr = `${diffDays} ${t('dashboard.daysAgo')}`
    }

    return {
      id: transaction._id || transaction.id,
      title,
      description: transaction.description || transaction.metadata?.description || '',
      amount: `${isPositive ? '+' : '-'} ₺${amount.toFixed(2)}`,
      amountColor: isPositive ? 'text-green-400' : 'text-red-400',
      icon,
      iconBg,
      iconColor,
      date: dateStr
    }
  }

  // Active Bonuses Component
  function ActiveBonusesCard({ user, t }) {
    const [bonuses, setBonuses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchBonuses = async () => {
        const USE_MOCK_DATA = false

        if (USE_MOCK_DATA) {
          await simulateApiDelay(500)
          const active = mockBonuses.filter(b => b.status === 'active')
          setBonuses(active)
          setLoading(false)
          return
        }

        try {
          const response = await bonusAPI.getMyBonuses()
          const allBonuses = response.data?.bonuses || []
          const active = allBonuses.filter(b => b.status === 'active')
          setBonuses(active)
        } catch (err) {
          log.apiError('/bonus/my-bonuses', err)
          // Fallback to mock data
          setBonuses(mockBonuses.filter(b => b.status === 'active'))
        } finally {
          setLoading(false)
        }
      }
      fetchBonuses()
    }, [])

    const calculateProgress = (current, required) => {
      if (!required || required === 0) return 0
      return Math.min((current / required) * 100, 100)
    }

    if (loading) {
      return (
        <div className="rounded-lg bg-surface p-6 shadow-lg">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-2 bg-gray-700 rounded"></div>
          </div>
        </div>
      )
    }

    if (bonuses.length === 0) {
      return (
        <div className="rounded-lg bg-surface p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">{t('dashboard.activeBonuses')}</h3>
          <div className="flex flex-col items-center justify-center py-8">
            <span className="material-symbols-outlined text-4xl text-gray-500 mb-2">emoji_events</span>
            <p className="text-gray-400 text-sm text-center">No active bonuses</p>
            <Link
              href="/bonuses"
              className="mt-4 w-full flex items-center justify-center rounded-lg h-11 px-5 bg-[#3e3e47] text-white text-sm font-bold hover:bg-[#4a4a55] transition-colors"
            >
              <span className="truncate">{t('dashboard.seeAllBonuses')}</span>
            </Link>
          </div>
        </div>
      )
    }

    // Show first active bonus
    const firstBonus = bonuses[0]
    const progress = calculateProgress(
      firstBonus.rolloverProgress || firstBonus.currentTurnover || 0,
      firstBonus.rolloverRequirement || firstBonus.requiredTurnover || 0
    )

    return (
      <div className="rounded-lg bg-surface p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">{t('dashboard.activeBonuses')}</h3>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-base font-semibold text-primary">
              {firstBonus.type === 'deposit_bonus' ? 'Deposit Bonus' : firstBonus.type === 'loss_bonus' ? 'Loss Bonus' : 'Bonus'}
            </p>
            <p className="text-2xl font-bold text-primary mb-1">
              ₺{firstBonus.amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-sm text-gray-300">
              {firstBonus.description || (firstBonus.type === 'deposit_bonus' ? '20% deposit bonus' : '20% loss bonus')}
            </p>
          </div>
          {(firstBonus.rolloverRequirement || firstBonus.requiredTurnover) && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{t('dashboard.progress')}</span>
                <span>
                  ₺{(firstBonus.rolloverProgress || firstBonus.currentTurnover || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} / ₺{(firstBonus.rolloverRequirement || firstBonus.requiredTurnover).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full bg-[#3e3e47] rounded-full h-2.5">
                <div
                  className="bg-blue h-2.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          <Link
            href="/bonuses"
            className="w-full mt-2 flex items-center justify-center rounded-lg h-11 px-5 bg-[#3e3e47] text-white text-sm font-bold hover:bg-[#4a4a55] transition-colors"
          >
            <span className="truncate">{t('dashboard.seeAllBonuses')}</span>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-[#EAEAEA]">
      {/* SideNavBar - Fixed */}
      <aside className="fixed left-0 top-0 h-screen w-72 flex-col bg-background-dark border-r border-white/5 hidden lg:flex z-40 shadow-2xl">
        <div className="flex items-center gap-4 px-8 py-8">
          <div className="size-10 text-primary drop-shadow-[0_0_15px_rgba(255,184,0,0.3)]">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.57 8.57C5.52 11.62 3.45 15.51 2.6 19.74C1.76 23.97 2.19 28.36 3.85 32.34C5.5 36.33 8.29 39.73 11.88 42.13C15.46 44.53 19.68 45.8 24 45.8C28.31 45.8 32.53 44.53 36.11 42.13C39.7 39.73 42.49 36.33 44.14 32.34C45.8 28.36 46.23 23.97 45.39 19.74C44.54 15.51 42.47 11.62 39.42 8.57L24 24L8.57 8.57Z"></path>
            </svg>
          </div>
          <Link href="/">
            <h2 className="text-white text-2xl font-black tracking-tighter hover:text-primary transition-colors italic">GARBET</h2>
          </Link>
        </div>

        <div className="flex flex-col flex-1 px-4">
          <div className="flex items-center gap-4 p-4 mb-6 rounded-3xl bg-surface/30 border border-white/5 backdrop-blur-md">
            <div className="size-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">person</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-white text-sm font-black truncate">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'Gamer'}</h1>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{t('dashboard.online') || 'ONLINE'}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/dashboard' && activeMenu === item.label)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveMenu(item.label)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                    ? 'bg-primary text-background-dark shadow-[0_10px_20px_rgba(255,184,0,0.2)]'
                    : 'hover:bg-white/5 text-text-secondary hover:text-white'
                    }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl transition-transform duration-300 group-hover:scale-110 ${isActive ? 'font-black' : ''}`}
                  >
                    {item.icon}
                  </span>
                  <p className="text-sm font-black uppercase tracking-widest leading-none">{item.label}</p>
                  {isActive && (
                    <div className="ml-auto size-1.5 rounded-full bg-background-dark/40"></div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          <button className="w-full h-12 rounded-2xl flex items-center justify-center gap-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20 font-black text-xs tracking-widest uppercase">
            <span className="material-symbols-outlined text-xl">logout</span>
            {t('common.logout') || 'Çıkış Yap'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-72">
        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-7xl flex flex-col gap-10">
            {/* PageHeading */}
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-5xl font-black tracking-tighter uppercase italic">{t('dashboard.title')}</h1>
              <div className="flex items-center gap-3 text-text-secondary font-bold">
                <span className="material-symbols-outlined text-primary">waving_hand</span>
                <p>{t('dashboard.welcomeBack')}, <span className="text-white">{user?.username}</span></p>
              </div>
            </div>

            {/* Grid for cards */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left column */}
              <div className="xl:col-span-2 flex flex-col gap-8">
                {/* Wallet Card - Premium Version */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-surface to-[#151515] p-10 border border-white/5 shadow-2xl group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined !text-[120px]">account_balance_wallet</span>
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
                        <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('dashboard.myWallet')}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-secondary text-sm font-bold uppercase tracking-tight">{t('dashboard.totalBalance')}</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-white text-6xl font-black tracking-tighter">₺{user?.balance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                          <span className="text-primary text-xl font-black italic">TRY</span>
                        </div>
                      </div>
                      <div className="flex gap-6 mt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-secondary font-black uppercase tracking-widest mb-1">{t('dashboard.cashBalance')}</span>
                          <span className="text-white text-lg font-black tracking-tight">₺{((user?.balance || 0) - (user?.bonusBalance || 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-px h-10 bg-white/5"></div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-1">{t('dashboard.bonusBalance')}</span>
                          <span className="text-primary text-lg font-black tracking-tight">₺{user?.bonusBalance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                      <Link href="/deposit" className="flex-1 md:flex-none h-14 min-w-[160px] flex items-center justify-center gap-3 rounded-2xl bg-primary text-background-dark text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-xl font-black">add_circle</span>
                        {t('common.deposit')}
                      </Link>
                      <Link href="/withdraw" className="flex-1 md:flex-none h-14 min-w-[160px] flex items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-xl">payments</span>
                        {t('common.withdraw')}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-[2.5rem] bg-surface/40 backdrop-blur-md p-8 border border-white/5 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-white text-2xl font-black tracking-tighter uppercase italic">{t('dashboard.recentActivities')}</h3>
                    <div className="h-0.5 flex-1 mx-6 bg-gradient-to-r from-white/10 to-transparent"></div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => {
                        const activity = formatTransaction(transaction)
                        return (
                          <div key={activity.id} className="group flex items-center gap-6 p-4 rounded-3xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5">
                            <div className={`flex items-center justify-center size-14 rounded-2xl ${activity.iconBg} border border-white/5 transition-transform group-hover:scale-110`}>
                              <span className={`material-symbols-outlined text-2xl ${activity.iconColor}`}>{activity.icon}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-black uppercase text-xs tracking-widest">{activity.title}</p>
                              <p className="text-text-secondary text-sm font-medium mt-1">{activity.description || 'İşlem detayları mevcut değil'}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-black tracking-tight ${activity.amountColor}`}>{activity.amount}</p>
                              <p className="text-[10px] text-text-secondary font-black tracking-widest uppercase">{activity.date}</p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 opacity-30">
                        <span className="material-symbols-outlined text-5xl mb-2">history</span>
                        <p className="text-xs font-black uppercase tracking-widest">{t('dashboard.noActivities') || 'İşlem geçmişi bulunamadı'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Games */}
                <div className="rounded-[2.5rem] bg-surface/40 backdrop-blur-md p-8 border border-white/5 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-white text-2xl font-black tracking-tighter uppercase italic">Son Oynananlar</h3>
                    <Link href="/slots" className="text-xs text-primary font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
                      Tümünü Gör
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentGames && recentGames.length > 0 ? (
                      recentGames.map((game) => {
                        const gameHistory = mockGameHistory?.find(g => g.gameName === game.name)
                        return (
                          <div key={game.id || game._id} className="group flex items-center gap-4 p-4 rounded-3xl bg-background-dark/50 border border-white/5 hover:border-primary/30 transition-all">
                            <div className="relative size-16 rounded-2xl overflow-hidden shadow-lg border border-white/10 shrink-0">
                              {game.image ? (
                                <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                              ) : (
                                <div className="w-full h-full bg-surface flex items-center justify-center">
                                  <span className="material-symbols-outlined text-white/20">casino</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-black text-sm truncate uppercase tracking-tight">{game.name || 'Bilinmeyen Oyun'}</p>
                              <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1">{game.provider || 'Pragmatic'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              {gameHistory ? (
                                <p className={`text-sm font-black italic tracking-tighter ${gameHistory.netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {gameHistory.netResult >= 0 ? '+' : ''}₺{Math.abs(gameHistory.netResult || 0).toFixed(2)}
                                </p>
                              ) : (
                                <span className="text-[10px] text-primary font-black uppercase tracking-widest">Oyna</span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="col-span-full text-center text-text-secondary text-xs font-black uppercase tracking-widest py-8 opacity-30">Henüz oyun oynanmadı</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="xl:col-span-1 flex flex-col gap-6">
                {/* Active Bonuses Card */}
                <ActiveBonusesCard user={user} t={t} />

                {/* Game Statistics Card - Premium */}
                <div className="rounded-[2.5rem] bg-gradient-to-b from-surface/60 to-surface/20 backdrop-blur-xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 size-32 bg-primary/5 blur-3xl rounded-full"></div>

                  <h3 className="text-white text-2xl font-black tracking-tighter uppercase italic mb-8">İstatistikler</h3>

                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary mb-1">sports_esports</span>
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Toplam Oyun</p>
                      </div>
                      <p className="text-white text-xl font-black italic">{gameStats.totalGames}</p>
                    </div>

                    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-center">
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Ciro (Turnover)</p>
                        <p className="text-white text-lg font-black tracking-tighter">₺{gameStats.totalWagered.toLocaleString('tr-TR')}</p>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/50 w-[75%] rounded-full"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">Kazanç</span>
                        <p className="text-emerald-500 text-lg font-black tracking-tighter">₺{gameStats.totalWon.toLocaleString('tr-TR')}</p>
                      </div>
                      <div className="flex flex-col gap-1 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                        <span className="text-red-500 text-[9px] font-black uppercase tracking-widest">Kayıp</span>
                        <p className="text-red-500 text-lg font-black tracking-tighter">₺{Math.abs(gameStats.totalWon - gameStats.totalWagered).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>

                    <div className="mt-2 pt-6 border-t border-white/5 flex flex-col items-center">
                      <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-1">Net Sonuç</p>
                      <p className={`text-4xl font-black tracking-tighter italic ${gameStats.netResult >= 0 ? 'text-emerald-500' : 'text-red-500'} drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]`}>
                        {gameStats.netResult >= 0 ? '+' : ''}₺{gameStats.netResult.toLocaleString('tr-TR')}
                      </p>
                    </div>

                    <Link
                      href="/slots"
                      className="w-full mt-4 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                    >
                      Geçmişi Görüntüle
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardPageWrapper() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  )
}
