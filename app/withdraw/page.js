'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { paymentAPI, authAPI } from '@/lib/api'
import { formatAmount } from '@/utils/formatters'
import UserSidebar from '@/components/UserSidebar'
import { useTranslation } from '@/hooks/useTranslation'
import { getErrorMessage } from '@/utils/errorHandler'

function WithdrawPage() {
  const { t, language } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [withdrawals, setWithdrawals] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    fetchUser()
    fetchWithdrawals()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe()
      setUser(response.data)
    } catch (err) {
      if (err.response?.status === 401) {
        router.push('/auth/login')
      }
    }
  }

  const fetchWithdrawals = async () => {
    setLoadingHistory(true)
    try {
      const response = await paymentAPI.getWithdrawalRequests({})
      // Backend returns { withdrawalRequests, totalPages, currentPage, total }
      const withdrawalsData = response.data?.withdrawalRequests || response.data?.withdrawals
      // Ensure it's always an array
      if (Array.isArray(withdrawalsData)) {
        setWithdrawals(withdrawalsData)
      } else if (Array.isArray(response.data)) {
        setWithdrawals(response.data)
      } else {
        setWithdrawals([])
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err)
      setWithdrawals([]) // Set empty array on error
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      setError(t('errors.invalidAmount'))
      return
    }

    if (!user?.iban || !user?.ibanHolderName) {
      setError(t('errors.ibanRequired'))
      router.push('/profile')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await paymentAPI.createWithdrawal({
        amount: parseFloat(amount),
        description: description || t('common.withdrawTitle')
      })

      setSuccess(t('common.withdrawTitle') + ' ' + t('common.completed'))
      setAmount('')
      setDescription('')

      // Refresh user data and withdrawal history
      await fetchUser()
      await fetchWithdrawals()
    } catch (err) {
      setError(getErrorMessage(err) || t('errors.withdrawalFailed'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'rejected':
        return 'bg-red-500/20 text-red-400'
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    return t(`withdraw.status.${status}`) || status
  }

  const quickAmounts = [100, 250, 500, 1000, 2500, 5000]

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-[#EAEAEA]">
      <UserSidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <main className="flex-grow pt-8 sm:pt-12 pb-12">
              {/* Page Heading */}
              <div className="flex flex-wrap items-end justify-between gap-6 px-4 mb-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                    </div>
                    <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight">{t('withdraw.title')}</h1>
                  </div>
                  <p className="text-text-dark text-base font-medium max-w-lg">{t('withdraw.subtitle')}</p>
                </div>

                {user && (
                  <div className="relative group p-[1px] rounded-2xl bg-gradient-to-br from-white/20 to-transparent shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors"></div>
                    <div className="relative bg-[#1A1A1A] rounded-[15px] px-6 py-4 flex flex-col items-end">
                      <p className="text-text-dark text-[10px] font-black uppercase tracking-widest mb-1">{t('withdraw.currentBalance')}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-primary text-sm font-black">₺</span>
                        <p className="text-white text-3xl font-black tracking-tighter">{(user.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error/Success Messages */}
              <div className="px-4 mt-6">
                {error && (
                  <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <span className="material-symbols-outlined text-red-400">error</span>
                    <p className="text-sm text-red-200 font-medium">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                    <p className="text-sm text-green-200 font-medium">{success}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6 p-4">
                {/* Left Column: Withdrawal Form */}
                <div className="lg:col-span-2">
                  <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-2xl overflow-hidden">
                    <div className="relative bg-[#121212] rounded-[23px] p-8 backdrop-blur-2xl">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-white text-xl font-black tracking-tight">{t('withdraw.withdrawalForm')}</h2>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                          <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-[10px] font-black text-text-dark uppercase tracking-widest">Instant Processing</span>
                        </div>
                      </div>

                      {!user?.iban || !user?.ibanHolderName ? (
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
                          <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-3xl">account_circle</span>
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <p className="text-white font-bold text-lg mb-1">{t('withdraw.ibanInfoMissing')}</p>
                            <p className="text-text-dark text-sm mb-4">You need to set up your IBAN and account holder name in your profile before you can withdraw.</p>
                            <button
                              onClick={() => router.push('/profile')}
                              className="px-6 py-2.5 bg-primary text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                              {t('withdraw.goToProfile')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-6xl">account_balance</span>
                          </div>
                          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1">
                              <p className="text-primary text-[10px] font-black uppercase tracking-widest">{t('withdraw.ibanInfo')}</p>
                              <p className="text-white text-lg font-black tracking-tight">{user.iban}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-text-dark text-sm font-bold">{user.ibanHolderName}</span>
                                {user.bankName && (
                                  <>
                                    <span className="text-white/20">•</span>
                                    <span className="text-text-dark text-sm font-bold">{user.bankName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => router.push('/profile')}
                              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              {t('common.edit') || 'Edit'}
                            </button>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleWithdraw} className="space-y-8">
                        <div>
                          <div className="flex justify-between items-end mb-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-dark">
                              {t('withdraw.amount')}
                            </label>
                            <p className="text-[10px] font-bold text-text-dark">
                              Min: <span className="text-white">₺100</span> | Max: <span className="text-white">{formatAmount(user?.balance || 0)}</span>
                            </p>
                          </div>
                          <div className="relative group/input">
                            <input
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              min="100"
                              max={user?.balance || 0}
                              step="0.1"
                              className="w-full h-16 rounded-2xl bg-white/[0.03] border-2 border-white/5 text-white px-8 text-2xl font-black focus:border-primary/50 focus:bg-white/[0.06] outline-none transition-all placeholder:text-white/10"
                              required
                              disabled={loading || !user?.iban || !user?.ibanHolderName}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-black text-xl select-none group-focus-within/input:scale-110 transition-transform">₺</div>
                          </div>

                          {/* Quick Select Buttons */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            {quickAmounts.map((q) => (
                              <button
                                key={q}
                                type="button"
                                onClick={() => {
                                  if (q <= (user?.balance || 0)) setAmount(q.toString())
                                }}
                                disabled={q > (user?.balance || 0) || loading || !user?.iban || !user?.ibanHolderName}
                                className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${amount === q.toString()
                                    ? 'bg-primary border-primary text-black'
                                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:grayscale'
                                  }`}
                              >
                                ₺{q}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-text-dark mb-3">
                            {t('withdraw.description')}
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('withdraw.descriptionPlaceholder')}
                            rows="3"
                            className="w-full rounded-2xl bg-white/[0.03] border-2 border-white/5 text-white px-6 py-4 focus:border-primary/50 focus:bg-white/[0.06] outline-none transition-all resize-none font-medium placeholder:text-white/10"
                            disabled={loading || !user?.iban || !user?.ibanHolderName}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading || !user?.iban || !user?.ibanHolderName || !amount || parseFloat(amount) <= 0}
                          className={`w-full h-16 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-500 overflow-hidden relative group/btn ${loading || !user?.iban || !user?.ibanHolderName || !amount ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-primary text-black hover:shadow-[0_0_30px_rgba(255,183,0,0.3)] hover:-translate-y-1'
                            }`}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? (
                              <>
                                <div className="size-4 rounded-full border-2 border-black/30 border-t-black animate-spin"></div>
                                {t('withdraw.processing')}
                              </>
                            ) : (
                              <>
                                {t('withdraw.createRequest')}
                                <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">send</span>
                              </>
                            )}
                          </span>
                          {!loading && amount && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]"></div>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Right Column: Withdrawal History */}
                <div className="lg:col-span-1">
                  <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-xl overflow-hidden h-fit">
                    <div className="relative bg-[#121212] rounded-[23px] p-6 backdrop-blur-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-white text-lg font-black tracking-tight">{t('withdraw.withdrawalHistory')}</h2>
                        <button onClick={fetchWithdrawals} className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                          <span className={`material-symbols-outlined text-sm ${loadingHistory ? 'animate-spin text-primary' : 'text-text-dark'}`}>refresh</span>
                        </button>
                      </div>

                      {loadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                          <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                          <p className="text-text-dark text-[10px] font-black uppercase tracking-widest">Fetching History...</p>
                        </div>
                      ) : withdrawals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3 grayscale opacity-40 text-center">
                          <span className="material-symbols-outlined text-5xl">history</span>
                          <p className="text-text-dark text-xs font-bold leading-relaxed px-6">
                            {t('withdraw.noWithdrawals')}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {withdrawals.map((withdrawal) => (
                            <div
                              key={withdrawal._id}
                              className="group p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/20 transition-all"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="space-y-0.5">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-white text-lg font-black">{withdrawal.amount.toLocaleString()}</span>
                                    <span className="text-primary text-[10px] font-black">TRY</span>
                                  </div>
                                  <p className="text-text-dark text-[10px] font-bold">
                                    {new Date(withdrawal.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${getStatusColor(withdrawal.status)}`}>
                                  {getStatusText(withdrawal.status)}
                                </span>
                              </div>

                              {(withdrawal.rejectionReason || withdrawal.adminNotes) && (
                                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                                  {withdrawal.rejectionReason && (
                                    <div className="flex gap-2">
                                      <span className="material-symbols-outlined text-red-400 text-xs">warning</span>
                                      <p className="text-red-400 text-[10px] font-bold">
                                        {t('withdraw.rejectionReason')}: {withdrawal.rejectionReason}
                                      </p>
                                    </div>
                                  )}
                                  {withdrawal.adminNotes && (
                                    <div className="flex gap-2">
                                      <span className="material-symbols-outlined text-text-dark text-xs">notes</span>
                                      <p className="text-text-dark text-[10px] font-bold italic">
                                        {t('withdraw.note')}: {withdrawal.adminNotes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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

export default function WithdrawPageWrapper() {
  return (
    <ProtectedRoute>
      <WithdrawPage />
    </ProtectedRoute>
  )
}
