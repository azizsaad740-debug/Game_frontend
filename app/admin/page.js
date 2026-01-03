'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { adminAPI } from '@/lib/api'
import { formatDate, formatAmount, formatChange } from '@/utils/formatters'
import { log } from '@/utils/logger'
import NotificationDropdown from '@/components/NotificationDropdown'
import { useTranslation } from '@/hooks/useTranslation'
import AdminSidebar from '@/components/AdminSidebar'
import { 
  mockAdminStats, 
  mockAdminTransactions, 
  mockAdminChartData,
  simulateApiDelay 
} from '@/lib/mockData'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

function AdminDashboard() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [stats, setStats] = useState({
    totalUsers: { value: 0, change: '0' },
    activeBets: { value: 0, change: '0' },
    pendingWithdrawals: { value: 0, change: '0' },
    newRegistrations24h: { value: 0, change: '0' },
    revenue: { value: 0, change: '0' },
  })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [popularGames, setPopularGames] = useState([])
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')



  useEffect(() => {
    fetchDashboardData()
    fetchChartData()
  }, [])

  const fetchDashboardData = async () => {
    const USE_MOCK_DATA = false
    
    setLoading(true)
    setError('')
    
    if (USE_MOCK_DATA) {
      await simulateApiDelay(800)
      setStats(mockAdminStats)
      setRecentTransactions(mockAdminTransactions)
      setPopularGames([
        { name: 'Book of Dead', plays: 1250, revenue: 12500 },
        { name: 'Starburst', plays: 980, revenue: 9800 },
        { name: 'Gonzo\'s Quest', plays: 750, revenue: 7500 },
      ])
      setLoading(false)
      return
    }

    try {
      const [statsResponse, transactionsResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentTransactions({ limit: 10 }),
      ])

      setStats(statsResponse.data.stats)
      setRecentTransactions(transactionsResponse.data.transactions || [])
      
      // Fetch popular games data
      if (statsResponse.data.popularGames) {
        setPopularGames(statsResponse.data.popularGames)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Veri yüklenirken bir hata oluştu')
      // Fallback to mock data
      setStats(mockAdminStats)
      setRecentTransactions(mockAdminTransactions)
      log.apiError('/admin/dashboard/stats', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async () => {
    const USE_MOCK_DATA = false
    
    setChartLoading(true)
    
    if (USE_MOCK_DATA) {
      await simulateApiDelay(600)
      setChartData(mockAdminChartData)
      setChartLoading(false)
      return
    }

    try {
      const response = await adminAPI.getRevenueChartData({ days: 30 })
      setChartData(response.data.chartData || [])
    } catch (err) {
      log.apiError('/admin/dashboard/revenue-chart', err)
      // Fallback to mock data
      setChartData(mockAdminChartData)
    } finally {
      setChartLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    // Navigate to appropriate page based on search
    // For now, redirect to users page with search query
    window.location.href = `/admin/users?search=${encodeURIComponent(searchQuery)}`
  }

  const handleExportData = async () => {
    try {
      // Create CSV data
      const csvRows = []
      
      // Add stats
      csvRows.push('Dashboard Statistics')
      csvRows.push('Metric,Value,Change')
      csvRows.push(`Total Users,${stats.totalUsers.value},${stats.totalUsers.change}%`)
      csvRows.push(`Active Bets,${stats.activeBets.value},${stats.activeBets.change}%`)
      csvRows.push(`Pending Withdrawals,${formatAmount(stats.pendingWithdrawals.value)},${stats.pendingWithdrawals.change}%`)
      csvRows.push(`New Registrations (24h),${stats.newRegistrations24h.value},${stats.newRegistrations24h.change}%`)
      csvRows.push(`Revenue,${formatAmount(stats.revenue.value)},${stats.revenue.change}%`)
      csvRows.push('')
      
      // Add transactions
      csvRows.push('Recent Transactions')
      csvRows.push('ID,User,Date,Amount,Type,Status')
      recentTransactions.forEach(tx => {
        csvRows.push([
          tx._id || tx.id,
          tx.user?.username || tx.user?.email || 'N/A',
          formatDate(tx.createdAt || tx.date),
          tx.amount,
          tx.type,
          tx.status
        ].join(','))
      })
      
      // Create blob and download
      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      log.error('Export failed:', err)
      setError('Export failed. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-teal-500/20 text-teal-400'
      case 'pending':
        return 'bg-blue-500/20 text-blue-400'
      case 'rejected':
      case 'cancelled':
      case 'failed':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'In Progress'
      case 'rejected':
      case 'cancelled':
        return 'Cancelled'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }


  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark ml-0 lg:ml-64">
        {/* TopNavBar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-surface bg-background-dark/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-8">
            <form onSubmit={handleSearch} className="flex flex-col min-w-40 !h-10 w-80 max-w-sm">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-gray-400 flex border-none bg-background-dark items-center justify-center pl-3 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-background-dark focus:border-none h-full placeholder:text-gray-500 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal"
                  placeholder="Search users, bets, games..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4">
            {typeof window !== 'undefined' && (() => {
              try {
                const userStr = localStorage.getItem('user')
                if (userStr) {
                  const user = JSON.parse(userStr)
                  return <NotificationDropdown userId={user._id || user.id} />
                }
              } catch (e) {}
              return null
            })()}
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBDHfcBht9qAey4KEYFav73ajdsQuGm1qJyja_Ihg-3JoO_Vo-XPo_fsRoXdWafHYwgUHmiHGE7IUOkOReak_4vvzQtss7vlLyE1bgqyEP3CTHb4AUAWX7_gXBLRadD6bV6EllnQiCgbwHYpH0mxo5D5Z_C4helVgAruTkL2ojnhcWSS5W9HjZBVcIoF50lslCFTmu8Wv8MY_M216NV8LmzLsw2geGDZLJvV9YR3CJXW8aH6jGSLBH-sinH5BzVZjO1uNbTDKLPAu0")'
              }}
            ></div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* PageHeading */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex min-w-72 flex-col gap-1">
              <p className="text-white text-3xl md:text-4xl font-black tracking-tight">Dashboard Overview</p>
              <p className="text-gray-400 text-base font-normal">Welcome back, Admin! Here&apos;s what&apos;s happening today.</p>
            </div>
            <button 
              onClick={handleExportData}
              disabled={loading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-dark text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xl">download</span>
              <span className="truncate">Export Data</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2 rounded-lg bg-surface p-5 shadow-lg animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-8 bg-gray-700 rounded w-32"></div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="flex flex-col gap-2 rounded-lg bg-surface p-5 shadow-lg">
                <p className="text-sm font-medium text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers.value.toLocaleString()}</p>
                <p className={`text-sm font-medium ${parseFloat(stats.totalUsers.change) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  {formatChange(stats.totalUsers.change)}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg bg-surface p-5 shadow-lg">
                <p className="text-sm font-medium text-gray-400">Active Bets</p>
                <p className="text-3xl font-bold text-white">{stats.activeBets.value.toLocaleString()}</p>
                <p className={`text-sm font-medium ${parseFloat(stats.activeBets.change) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  {formatChange(stats.activeBets.change)}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg bg-surface p-5 shadow-lg">
                <p className="text-sm font-medium text-gray-400">Pending Withdrawals</p>
                <p className="text-3xl font-bold text-white">{formatAmount(stats.pendingWithdrawals.value)}</p>
                <p className={`text-sm font-medium ${parseFloat(stats.pendingWithdrawals.change) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  {formatChange(stats.pendingWithdrawals.change)}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg bg-surface p-5 shadow-lg">
                <p className="text-sm font-medium text-gray-400">New Registrations (24h)</p>
                <p className="text-3xl font-bold text-white">{stats.newRegistrations24h.value}</p>
                <p className={`text-sm font-medium ${parseFloat(stats.newRegistrations24h.change) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  {formatChange(stats.newRegistrations24h.change)}
                </p>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
            <div className="flex flex-col gap-2 rounded-lg bg-surface p-6 shadow-lg lg:col-span-2">
              <p className="text-lg font-medium text-white">Revenue Over Time</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-white">{formatAmount(stats.revenue.value)}</p>
                <p className={`text-sm font-medium ${parseFloat(stats.revenue.change) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  {formatChange(stats.revenue.change)}
                </p>
              </div>
              <p className="text-sm text-gray-400">Last 30 Days</p>
              <div className="mt-4 flex min-h-[250px] flex-1 flex-col">
                {chartLoading ? (
                  <div className="flex flex-col items-center justify-center gap-2 h-full">
                    <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-gray-400">Loading chart data...</p>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-400">No chart data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FCD34D" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F87171" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3e3e47" />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#9ca3af' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={(value) => {
                          if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
                          return `$${value}`
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        formatter={(value, name) => {
                          const formattedValue = formatAmount(value)
                          const labels = {
                            revenue: 'Revenue',
                            deposits: 'Deposits',
                            withdrawals: 'Withdrawals'
                          }
                          return [formattedValue, labels[name] || name]
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                        formatter={(value) => {
                          const labels = {
                            revenue: 'Revenue',
                            deposits: 'Deposits',
                            withdrawals: 'Withdrawals'
                          }
                          return labels[value] || value
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="deposits"
                        stroke="#22D3EE"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDeposits)"
                        name="deposits"
                      />
                      <Area
                        type="monotone"
                        dataKey="withdrawals"
                        stroke="#F87171"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorWithdrawals)"
                        name="withdrawals"
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#FCD34D"
                        strokeWidth={3}
                        dot={{ fill: '#FCD34D', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-bold text-white">{formatAmount(stats.revenue.value)}</p>
                <p className={`text-sm font-medium ${parseFloat(stats.revenue.change) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  {formatChange(stats.revenue.change)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-surface p-6 shadow-lg">
              <p className="text-lg font-medium text-white">Most Popular Games</p>
              <p className="text-sm text-gray-400">This Month</p>
              <div className="mt-4 grid flex-1 auto-rows-fr gap-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : popularGames.length > 0 ? (
                  popularGames.map((game, index) => {
                    const colors = ['bg-primary', 'bg-cyan-400', 'bg-blue-500', 'bg-fuchsia-500', 'bg-gray-500']
                    const color = game.color || colors[index % colors.length]
                    return (
                      <div key={game.name || game._id || index}>
                        <div className="flex justify-between text-sm">
                          <p className="font-medium text-gray-300">{game.name || 'Unknown'}</p>
                          <p className="text-gray-400">{game.percentage?.toFixed(1) || 0}%</p>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-[#3e3e47]">
                          <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(game.percentage || 0, 100)}%` }}></div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-gray-400">No game data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="flex flex-col rounded-lg bg-surface shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-white">Recent Transactions</h3>
              <p className="text-sm text-gray-400">Latest deposits and withdrawals.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-surface text-left text-xs uppercase text-gray-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Transaction ID</th>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Yükleniyor...</td>
                    </tr>
                  ) : recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Henüz işlem bulunmamaktadır.</td>
                    </tr>
                  ) : (
                    recentTransactions.map((transaction) => {
                      const txId = transaction.id || transaction._id || 'N/A'
                      const txIdStr = typeof txId === 'string' ? txId : txId.toString()
                      return (
                        <tr key={txId}>
                          <td className="whitespace-nowrap px-6 py-4 font-mono text-gray-400">
                            {txIdStr.length > 8 ? `${txIdStr.substring(0, 8)}...` : txIdStr}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                            {transaction.user?.username || transaction.user?.email || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-300">{formatDate(transaction.date || transaction.createdAt)}</td>
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-white">{formatAmount(transaction.amount)}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-300 capitalize">{transaction.type}</td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {getStatusText(transaction.status)}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  )
}

