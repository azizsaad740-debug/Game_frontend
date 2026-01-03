'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { transactionAPI } from '@/lib/api'
import { formatDate, formatDateTime, formatAmount } from '@/utils/formatters'
import UserSidebar from '@/components/UserSidebar'

function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, typeFilter, statusFilter])

  const fetchTransactions = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 50,
      }
      if (typeFilter !== 'all') params.type = typeFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await transactionAPI.getMyTransactions(params)
      const data = response.data?.transactions || response.data?.data || response.data || []

      setTransactions(Array.isArray(data) ? data : [])
      setTotalPages(response.data?.totalPages || 1)
      setTotal(response.data?.total || data.length)
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError(err.response?.data?.message || 'İşlem geçmişi yüklenemedi')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-500/20 text-green-400'
      case 'withdrawal':
        return 'bg-red-500/20 text-red-400'
      case 'win':
      case 'admin_credit':
        return 'bg-blue-500/20 text-blue-400'
      case 'bet':
      case 'admin_debit':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeText = (type) => {
    const typeMap = {
      deposit: 'Yatırım',
      withdrawal: 'Çekim',
      bet: 'Bahis',
      win: 'Kazanç',
      refund: 'İade',
      bet_round: 'Round Bahis',
      admin_credit: 'Admin Kredi',
      admin_debit: 'Admin Borç',
    }
    return typeMap[type] || type
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'failed':
      case 'rejected':
        return 'bg-red-500/20 text-red-400'
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Beklemede',
      completed: 'Tamamlandı',
      failed: 'Başarısız',
      cancelled: 'İptal Edildi',
      rejected: 'Reddedildi',
    }
    return statusMap[status] || status
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-[#EAEAEA]">
      <UserSidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <main className="flex-grow pt-8 sm:pt-12 pb-12">
              {/* Page Heading */}
              <div className="flex flex-wrap items-end justify-between gap-6 px-4 mb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-3xl">history</span>
                    </div>
                    <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight">{t('transactions.title')}</h1>
                  </div>
                  <p className="text-text-dark text-base font-medium max-w-lg">{t('transactions.subtitle')}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-end">
                    <p className="text-[10px] font-black text-text-dark uppercase tracking-widest mb-0.5">{t('transactions.totalTransactions')}</p>
                    <p className="text-white text-xl font-black tracking-tight">{total}</p>
                  </div>
                  <button
                    onClick={fetchTransactions}
                    className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-dark hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all active:scale-95"
                  >
                    <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
                  </button>
                </div>
              </div>

              {/* Filters & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 px-4">
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-dark group-focus-within:text-primary transition-colors">category</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/[0.03] border-2 border-white/5 text-white font-bold text-sm focus:border-primary/50 focus:bg-white/[0.06] outline-none transition-all appearance-none"
                  >
                    <option value="all">{t('transactions.allTransactions')}</option>
                    <option value="deposit">{t('transactions.deposits')}</option>
                    <option value="withdrawal">{t('transactions.withdrawals')}</option>
                    <option value="bet">{t('transactions.bets')}</option>
                    <option value="win">{t('transactions.wins')}</option>
                  </select>
                </div>

                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-dark group-focus-within:text-primary transition-colors">verified</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/[0.03] border-2 border-white/5 text-white font-bold text-sm focus:border-primary/50 focus:bg-white/[0.06] outline-none transition-all appearance-none"
                  >
                    <option value="all">{t('transactions.allStatuses')}</option>
                    <option value="completed">{t('transactions.completed')}</option>
                    <option value="pending">{t('transactions.pending')}</option>
                    <option value="failed">{t('transactions.failed')}</option>
                    <option value="cancelled">{t('transactions.cancelled')}</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    onClick={() => {
                      setTypeFilter('all')
                      setStatusFilter('all')
                      setCurrentPage(1)
                    }}
                    className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 text-text-dark font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95"
                  >
                    {t('transactions.clearFilters')}
                  </button>
                  <button className="px-6 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2 active:scale-95">
                    <span className="material-symbols-outlined text-sm">download</span>
                    PDF
                  </button>
                </div>
              </div>

              {/* Transactions Content */}
              <div className="px-4">
                <div className="p-[1px] rounded-[32px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl overflow-hidden">
                  <div className="relative bg-[#121212]/80 backdrop-blur-2xl rounded-[31px] overflow-hidden">
                    {loading && !transactions.length ? (
                      <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="size-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                        <p className="text-text-dark text-xs font-black uppercase tracking-[0.2em] animate-pulse">{t('transactions.loadingData')}</p>
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-32 space-y-4 grayscale opacity-40">
                        <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined text-5xl">folder_off</span>
                        </div>
                        <p className="text-text-dark text-lg font-bold">{t('transactions.noHistory')}</p>
                        <p className="text-text-dark/60 text-sm max-w-[280px] text-center">{t('transactions.noHistoryDetail')}</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-white/[0.02]">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-text-dark uppercase tracking-[0.2em] border-b border-white/5">{t('transactions.dateTime')}</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-text-dark uppercase tracking-[0.2em] border-b border-white/5">{t('transactions.type')}</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-text-dark uppercase tracking-[0.2em] border-b border-white/5">{t('transactions.amount')}</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-text-dark uppercase tracking-[0.2em] border-b border-white/5">{t('transactions.status')}</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-text-dark uppercase tracking-[0.2em] border-b border-white/5">{t('transactions.description')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {transactions.map((transaction) => (
                                <tr key={transaction._id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                  <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className="text-white text-sm font-bold tracking-tight">
                                        {new Date(transaction.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                      </span>
                                      <span className="text-text-dark text-[10px] font-bold">
                                        {new Date(transaction.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 whitespace-nowrap">
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getTypeColor(transaction.type).replace('bg-', 'bg-opacity-10 border-').replace('text-', 'text-')}`}>
                                      {getTypeText(transaction.type)}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-lg font-black tracking-tighter ${transaction.type === 'win' || transaction.type === 'deposit' ? 'text-green-400' :
                                        transaction.type === 'bet' || transaction.type === 'withdrawal' ? 'text-red-400' : 'text-white'
                                        }`}>
                                        {transaction.type === 'win' || transaction.type === 'deposit' ? '+' : '-'}
                                        ₺{transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <div className={`size-1.5 rounded-full ${transaction.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                                        transaction.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                                        }`}></div>
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${transaction.status === 'completed' ? 'text-green-400' :
                                        transaction.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {getStatusText(transaction.status)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5">
                                    <p className="text-text-dark text-sm font-medium line-clamp-1 group-hover:line-clamp-none transition-all">
                                      {transaction.description || '-'}
                                    </p>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between px-8 py-6 bg-white/[0.01] border-t border-white/5">
                            <p className="text-text-dark text-xs font-bold uppercase tracking-widest">
                              {t('transactions.totalCount', { count: total })}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="size-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center disabled:opacity-20 hover:bg-white/10 transition-all"
                              >
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                              </button>
                              <div className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-xs font-black text-primary">{currentPage}</span>
                                <span className="text-white/20 text-xs">/</span>
                                <span className="text-xs font-black text-text-dark">{totalPages}</span>
                              </div>
                              <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="size-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center disabled:opacity-20 hover:bg-white/10 transition-all"
                              >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TransactionsPageWrapper() {
  return (
    <ProtectedRoute>
      <TransactionsPage />
    </ProtectedRoute>
  )
}

