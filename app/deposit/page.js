
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { paymentAPI, authAPI, publicAPI } from '@/lib/api'
import UserSidebar from '@/components/UserSidebar'

function DepositPage() {
  const { t } = useTranslation()
  const router = useRouter()

  // UI state
  const [selectedMethod, setSelectedMethod] = useState('')
  const [amount, setAmount] = useState('')
  const quickAmounts = ['100₺', '250₺', '500₺']

  // data
  const [paymentMethods, setPaymentMethods] = useState([])
  const [bankInfo, setBankInfo] = useState(null)
  const [ibans, setIbans] = useState([])
  const selectedMethodData = useMemo(
    () => paymentMethods.find((m) => m.name === selectedMethod || m.id === selectedMethod) || null,
    [paymentMethods, selectedMethod]
  )

  // user + status
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // fetch methods, iban info, and active ibans in parallel
    const fetchData = async () => {
      try {
        const [methodsRes, ibanRes, ibansRes] = await Promise.allSettled([
          paymentAPI.getDepositMethods(),
          paymentAPI.getIbanInfo(),
          publicAPI.getActiveIbans(),
        ])

        if (methodsRes.status === 'fulfilled') {
          // support both { methods } and direct array
          const m = methodsRes.value.data?.methods ?? methodsRes.value.data ?? []
          const methodsArray = Array.isArray(m) ? m : []
          setPaymentMethods(methodsArray)
          // set default selected method if not present
          if (methodsArray.length > 0 && !selectedMethod) {
            const defaultName = methodsArray[0].name || methodsArray[0].id
            setSelectedMethod(defaultName)
          }
        }

        if (ibanRes.status === 'fulfilled') {
          // response shape may be { ibanInfo: { ... } } or direct object
          const info = ibanRes.value.data?.ibanInfo ?? ibanRes.value.data ?? null
          setBankInfo(info)
        }

        if (ibansRes.status === 'fulfilled') {
          // Get active IBANs from public API
          const ibansData = ibansRes.value.data?.ibans ?? []
          setIbans(Array.isArray(ibansData) ? ibansData : [])
        }
      } catch (err) {
        console.error('Failed to fetch payment metadata', err)
      }
    }

    // fetch user separately (auth)
    const fetchUser = async () => {
      try {
        const res = await authAPI.getMe()
        setUser(res.data)
      } catch (err) {
        if (err?.response?.status === 401) {
          router.push('/auth/login')
        } else {
          console.error('Failed to load user', err)
        }
      }
    }

    fetchData()
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper: detect if a method should use IBAN flow
  const isIbanMethod = (method) => {
    if (!method) return false
    const id = (method.id || '').toString().toLowerCase()
    const name = (method.name || '').toString().toLowerCase()
    if (id === 'iban') return true
    if (/iban|havale|eft|bank|bank-transfer|bank transfer/.test(name)) return true
    return false
  }

  const handleAmountClick = (quickAmount) => {
    const numericAmount = quickAmount.replace('₺', '').replace(',', '').trim()
    setAmount(numericAmount)
  }

  const handleDeposit = async (e) => {
    if (e) e.preventDefault()

    if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setError('Lütfen geçerli bir tutar girin')
      return
    }

    if (!selectedMethodData || !selectedMethod) {
      setError('Lütfen bir ödeme yöntemi seçin')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let response

      if (isIbanMethod(selectedMethodData)) {
        // IBAN/bank transfer flow
        response = await paymentAPI.createIbanDeposit({
          amount: parseFloat(amount),
          // you can send more fields if backend expects, e.g. senderIban, senderName
          description: `${selectedMethodData.name} ile yatırım`,
          // include optional fields only if available
          ...(user ? { userId: user._id } : {}),
        })
      } else {
        // other payment providers flow
        response = await paymentAPI.createDeposit({
          amount: parseFloat(amount),
          method: selectedMethodData.id || selectedMethodData.name,
          description: `${selectedMethodData.name} ile yatırım`,
        })
      }

      setSuccess(response.data?.message || 'Yatırım talebi başarıyla oluşturuldu!')
      setAmount('0.00')

      // Refresh user data
      try {
        const userResponse = await authAPI.getMe()
        setUser(userResponse.data)
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Deposit error:', err)
      setError(err.response?.data?.message || 'Yatırım talebi oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-[#EAEAEA]">
      <UserSidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <main className="flex-grow pt-8 sm:pt-12 pb-12">
              {/* PageHeading */}
              <div className="flex flex-wrap justify-between gap-4 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">{t('common.depositTitle')}</p>
                  <p className="text-text-dark text-base font-normal leading-normal">{t('common.depositInstructions')}</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 p-4">
                {/* Left Column: Payment Methods */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight">{t('common.paymentMethods')}</h2>
                    <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                      {paymentMethods.length} {t('common.available') || 'Available'}
                    </span>
                  </div>

                  {paymentMethods.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <div className="size-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4"></div>
                      <p className="text-text-dark font-medium">{t('common.loadingMethods')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id || method.name}
                          onClick={() => setSelectedMethod(method.name || method.id)}
                          className={`group relative flex flex-col gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${(selectedMethod === method.name || selectedMethod === method.id)
                            ? 'bg-primary/10 border-2 border-primary shadow-[0_0_20px_rgba(255,183,0,0.15)]'
                            : 'bg-white/[0.03] border-2 border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                            }`}
                        >
                          {/* Selected Indicator */}
                          {(selectedMethod === method.name || selectedMethod === method.id) && (
                            <div className="absolute top-2 right-2 size-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                              <span className="material-symbols-outlined text-black text-sm font-bold">check</span>
                            </div>
                          )}

                          <div className="relative z-10">
                            {method.image ? (
                              <div className="w-full aspect-[16/10] rounded-xl bg-white p-3 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                                <img
                                  alt={method.name || 'Payment method'}
                                  className="w-full h-full object-contain filter drop-shadow-sm"
                                  src={method.image}
                                  onError={(e) => { e.target.style.display = 'none' }}
                                />
                              </div>
                            ) : (
                              <div className="w-full aspect-[16/10] rounded-xl bg-white/5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white/20 text-4xl">payments</span>
                              </div>
                            )}

                            <div className="mt-4">
                              <p className="text-white text-base font-bold leading-tight group-hover:text-primary transition-colors">{method.name || method.id}</p>
                              <div className="mt-2 flex items-center gap-1.5 overflow-hidden">
                                <span className="text-[10px] uppercase font-bold text-text-dark tracking-wider">Limits:</span>
                                <p className="text-text-dark text-xs font-semibold truncate">
                                  {method.min ? `₺${method.min}` : 'N/A'} - {method.max ? `₺${method.max}` : '∞'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Hover Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Deposit Form (Checkout Style) */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/20 to-transparent shadow-2xl overflow-hidden relative group">
                      {/* Glow Effect */}
                      <div className="absolute -inset-1 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>

                      <div className="relative bg-[#121212] rounded-[23px] p-6 backdrop-blur-2xl">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                          </div>
                          <h2 className="text-white text-xl font-black tracking-tight">{t('common.depositDetails')}</h2>
                        </div>

                        {/* Selected Method Summary */}
                        <div className="mb-6">
                          {selectedMethodData ? (
                            <div className="relative p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4 transition-all overflow-hidden">
                              {selectedMethodData.image && (
                                <div className="bg-white p-1 rounded-lg size-12 flex items-center justify-center shrink-0 shadow-lg">
                                  <img alt={selectedMethodData.name} className="w-full h-full object-contain" src={selectedMethodData.image} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate">{selectedMethodData.name || selectedMethod}</p>
                                <p className="text-primary text-[10px] font-black uppercase tracking-widest">{t('common.selectedMethod') || 'Selected Method'}</p>
                              </div>
                              <button
                                onClick={() => setSelectedMethod('')}
                                type="button"
                                className="size-8 rounded-full bg-white/5 flex items-center justify-center text-text-dark hover:text-white hover:bg-white/10 transition-all"
                              >
                                <span className="material-symbols-outlined text-lg">close</span>
                              </button>
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 py-8 text-center">
                              <span className="material-symbols-outlined text-white/20 text-3xl">touch_app</span>
                              <p className="text-text-dark text-xs font-medium px-4">{t('common.selectMethod')}</p>
                            </div>
                          )}
                        </div>

                        {error && (
                          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                            <p className="text-xs text-red-200 font-medium">{error}</p>
                          </div>
                        )}

                        {success && (
                          <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
                            <p className="text-xs text-green-200 font-medium">{success}</p>
                          </div>
                        )}

                        <form onSubmit={handleDeposit} className="space-y-6">
                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <label className="text-xs font-black uppercase tracking-widest text-text-dark" htmlFor="amount">{t('common.amount')}</label>
                              <span className="text-[10px] font-bold text-primary">TRY (₺)</span>
                            </div>
                            <div className="relative group/input">
                              <input
                                className="w-full h-14 rounded-2xl border-2 border-white/5 bg-white/[0.03] text-white px-6 text-xl font-black placeholder:text-white/10 transition-all focus:border-primary/50 focus:bg-white/[0.06] outline-none"
                                id="amount"
                                name="amount"
                                placeholder="0.00"
                                type="number"
                                min="0"
                                step="0.1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/5 px-2 py-1 rounded text-[10px] font-black text-text-dark group-focus-within/input:text-primary transition-colors">
                                MIN: ₺{selectedMethodData?.min || '---'}
                              </div>
                            </div>

                            {/* Quick Amount Selection */}
                            <div className="grid grid-cols-3 gap-2 mt-4">
                              {quickAmounts.map((q) => (
                                <button
                                  key={q}
                                  onClick={() => handleAmountClick(q)}
                                  type="button"
                                  className="py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-200 active:scale-95"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* IBAN Info Section */}
                          {isIbanMethod(selectedMethodData) && (
                            <div className="space-y-3 pt-2 border-t border-white/5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-text-dark">{t('common.transferDetails') || 'Transfer Details'}</p>
                              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {ibans.map((iban, index) => (
                                  <div key={index} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 relative group/iban hover:bg-white/[0.04] transition-all">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-primary">{iban.bankName}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(iban.ibanNumber)
                                            setSuccess(t('common.copySuccess'))
                                            setTimeout(() => setSuccess(''), 2000)
                                          }}
                                          className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover/iban:opacity-100 transition-opacity"
                                        >
                                          <span className="material-symbols-outlined text-sm">content_copy</span>
                                        </button>
                                      </div>
                                      <p className="text-xs font-black text-white">{iban.accountHolder}</p>
                                      <p className="text-[10px] font-mono text-text-dark break-all">{iban.ibanNumber}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={loading || !selectedMethod || !selectedMethodData}
                            className={`w-full group/btn relative overflow-hidden h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-500 ${loading || !selectedMethod ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-primary text-black hover:shadow-[0_0_30px_rgba(255,183,0,0.3)] hover:-translate-y-1'
                              }`}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {loading ? (
                                <>
                                  <div className="size-4 rounded-full border-2 border-black/30 border-t-black animate-spin"></div>
                                  {t('common.processing')}
                                </>
                              ) : (
                                <>
                                  {t('common.completeDeposit')}
                                  <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                </>
                              )}
                            </span>
                            {!loading && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]"></div>
                            )}
                          </button>
                        </form>

                        <div className="mt-6 flex items-center gap-2 justify-center py-2 px-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="material-symbols-outlined text-green-400 text-sm italic">lock</span>
                          <p className="text-[10px] font-bold text-text-dark uppercase tracking-wider">Secure 256-bit Encrypted Transaction</p>
                        </div>
                      </div>
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

export default function DepositPageWrapper() {
  return (
    <ProtectedRoute>
      <DepositPage />
    </ProtectedRoute>
  )
}
