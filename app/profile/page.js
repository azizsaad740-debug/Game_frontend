'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authAPI, paymentAPI, kycAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import UserSidebar from '@/components/UserSidebar'
import { useTranslation } from '@/hooks/useTranslation'

function ProfilePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    iban: '',
    ibanHolderName: '',
    bankName: ''
  })
  const [kycStatus, setKycStatus] = useState('not_submitted')
  const [kycDocuments, setKycDocuments] = useState({
    idFront: null,
    idBack: null,
    addressProof: null,
  })
  const [kycUploading, setKycUploading] = useState(false)
  const [showKYCSection, setShowKYCSection] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setError('')
        setLoading(true)

        // Try to get user from localStorage first as fallback
        let userData = null
        try {
          const userStr = localStorage.getItem('user')
          if (userStr) {
            userData = JSON.parse(userStr)
          }
        } catch (e) {
          // Ignore localStorage errors
        }

        // Fetch user data and KYC data in parallel
        const [userResponse, kycResponse] = await Promise.all([
          authAPI.getMe().catch((err) => {
            // If API fails but we have localStorage data, use it
            if (userData) {
              return { data: userData }
            }
            throw err
          }),
          kycAPI.getKYC().catch((err) => {
            // If KYC endpoint fails, return default values
            if (process.env.NODE_ENV === 'development') {
              console.warn('KYC fetch failed:', err)
            }
            return { data: { kycStatus: 'not_submitted', documents: {} } }
          }),
        ])

        const fetchedUserData = userResponse.data || userData
        if (!fetchedUserData) {
          throw new Error('No user data available')
        }

        // Update localStorage with fresh data
        try {
          localStorage.setItem('user', JSON.stringify(fetchedUserData))
        } catch (e) {
          // Ignore localStorage errors
        }

        setUser(fetchedUserData)
        setFormData({
          firstName: fetchedUserData.firstName || '',
          lastName: fetchedUserData.lastName || '',
          phone: fetchedUserData.phone || '',
          iban: fetchedUserData.iban || '',
          ibanHolderName: fetchedUserData.ibanHolderName || '',
          bankName: fetchedUserData.bankName || ''
        })

        // Set KYC data if available
        if (kycResponse?.data) {
          setKycStatus(kycResponse.data.kycStatus || 'not_submitted')
          setKycDocuments(kycResponse.data.documents || {})
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
        if (err.response?.status === 401) {
          window.location.href = '/auth/login'
          return
        }
        // dont show error if we have fallback data
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const fallbackUser = JSON.parse(userStr)
            setUser(fallbackUser)
            setFormData({
              firstName: fallbackUser.firstName || '',
              lastName: fallbackUser.lastName || '',
              phone: fallbackUser.phone || '',
              iban: fallbackUser.iban || '',
              ibanHolderName: fallbackUser.ibanHolderName || '',
              bankName: fallbackUser.bankName || ''
            })
            setError('') // Clear error if we have fallback data
          } catch (e) {
            setError('Failed to load profile. Please refresh the page.')
          }
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load profile. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await paymentAPI.updateProfile(formData)
      setSuccess('Profile updated successfully!')
      const response = await authAPI.getMe()
      setUser(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  /* ===========================================
     ✅ FIXED KYC UPLOAD (LOGIC ONLY)
  =========================================== */
  const handleKYCUpload = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setKycUploading(true)

    try {
      const form = e.currentTarget
      const data = new FormData()

      const idFrontFile = form.elements.namedItem('idFront')?.files[0]
      const idBackFile = form.elements.namedItem('idBack')?.files[0]
      const addressProofFile = form.elements.namedItem('addressProof')?.files[0]

      if (idFrontFile) data.append('idFront', idFrontFile)
      if (idBackFile) data.append('idBack', idBackFile)
      if (addressProofFile) data.append('addressProof', addressProofFile)

      if (!idFrontFile && !idBackFile && !addressProofFile) {
        setError('Please select at least one document to upload')
        return
      }

      const response = await kycAPI.uploadKYCDocuments(data)

      setSuccess('KYC documents uploaded successfully! Status: Pending Review')
      setKycStatus('pending')
      setKycDocuments(response.data.documents || {})
      form.reset()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload KYC documents')
    } finally {
      setKycUploading(false)
    }
  }

  const getKYCStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'rejected':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getKYCStatusText = (status) => {
    return t(`profile.kycStatus.${status}`) || t('profile.kycStatus.not_submitted')
  }

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] font-display text-[#EAEAEA]">
      <UserSidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-5xl">

              {/* Profile Heading */}
              <div className="flex flex-col gap-2 mb-10 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="size-16 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 mx-auto lg:mx-0 shadow-[0_0_20px_rgba(255,183,0,0.1)]">
                    <span className="material-symbols-outlined text-primary text-4xl">person</span>
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-white text-4xl lg:text-5xl font-black tracking-tight uppercase italic">{t('profile.title')}</h1>
                    <p className="text-text-dark text-lg font-medium">{t('profile.subtitle')}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-8 rounded-2xl bg-red-500/10 border-2 border-red-500/20 p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                  <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                  <p className="text-sm text-red-400 font-bold">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-8 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                  <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
                  <p className="text-sm text-emerald-400 font-bold">{success}</p>
                </div>
              )}

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { label: t('profile.balance'), value: `₺${user?.balance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: 'account_balance_wallet', color: 'primary' },
                  { label: t('profile.bonusBalance'), value: `₺${user?.bonusBalance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: 'emoji_events', color: 'blue' },
                  { label: t('profile.status'), value: user?.status || 'Active', icon: 'verified_user', color: 'emerald' }
                ].map((stat, i) => (
                  <div key={i} className="relative group p-[1px] rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-[#121212] rounded-[31px] p-6 flex flex-col items-center text-center">
                      <div className={`size-14 rounded-2xl bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/10 border border-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/20 flex items-center justify-center mb-4`}>
                        <span className={`material-symbols-outlined text-${stat.color === 'primary' ? 'primary' : stat.color + '-500'} text-3xl`}>{stat.icon}</span>
                      </div>
                      <p className="text-text-dark text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-white text-3xl font-black tracking-tighter capitalize">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Form */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="p-[1px] rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent shadow-2xl">
                    <div className="bg-[#121212] rounded-[39px] p-8 lg:p-10 backdrop-blur-3xl">
                      <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Personal Information */}
                        <section>
                          <div className="flex items-center gap-4 mb-8">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary">badge</span>
                            </div>
                            <h2 className="text-white text-xl font-black uppercase tracking-tight italic">{t('profile.personalInfo')}</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4"></div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                              { label: t('profile.firstName'), name: 'firstName', value: formData.firstName, type: 'text' },
                              { label: t('profile.lastName'), name: 'lastName', value: formData.lastName, type: 'text' },
                              { label: t('profile.phone'), name: 'phone', value: formData.phone, type: 'tel' },
                              { label: t('profile.email'), name: 'email', value: user?.email || '', type: 'email', disabled: true }
                            ].map((field) => (
                              <div key={field.name} className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark pl-2">{field.label}</label>
                                <div className="relative group/input">
                                  <input
                                    type={field.type}
                                    value={field.value}
                                    onChange={(e) => !field.disabled && setFormData({ ...formData, [field.name]: e.target.value })}
                                    disabled={field.disabled}
                                    className={`w-full h-16 rounded-[1.25rem] border-2 border-white/5 bg-white/[0.03] px-6 text-white font-bold transition-all outline-none ${field.disabled ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary/50 focus:bg-white/[0.06]'}`}
                                    required={!field.disabled}
                                  />
                                  {!field.disabled && (
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors">
                                      <span className="material-symbols-outlined text-xl">edit</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Banking Information */}
                        <section>
                          <div className="flex items-center gap-4 mb-8">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary">account_balance</span>
                            </div>
                            <h2 className="text-white text-xl font-black uppercase tracking-tight italic">{t('profile.bankingInfo')}</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4"></div>
                          </div>

                          <div className="space-y-8">
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-text-dark pl-2">IBAN</label>
                              <div className="relative group/input">
                                <input
                                  type="text"
                                  value={formData.iban}
                                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                  placeholder="TR330006100519786457841326"
                                  className="w-full h-16 rounded-[1.25rem] border-2 border-white/5 bg-white/[0.03] px-6 text-white font-bold tracking-wider placeholder:text-white/10 transition-all focus:border-primary/50 focus:bg-white/[0.06] outline-none"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors">
                                  <span className="material-symbols-outlined text-2xl font-black">payments</span>
                                </div>
                              </div>
                              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest pl-2">Para çekimi için gereklidir</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark pl-2">{t('profile.bankingInfo')} Sahibi</label>
                                <input
                                  type="text"
                                  value={formData.ibanHolderName}
                                  onChange={(e) => setFormData({ ...formData, ibanHolderName: e.target.value })}
                                  className="w-full h-16 rounded-[1.25rem] border-2 border-white/5 bg-white/[0.03] px-6 text-white font-bold focus:border-primary/50 focus:bg-white/[0.06] transition-all outline-none"
                                />
                              </div>
                              <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark pl-2">{t('profile.bankName')}</label>
                                <input
                                  type="text"
                                  value={formData.bankName}
                                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                  className="w-full h-16 rounded-[1.25rem] border-2 border-white/5 bg-white/[0.03] px-6 text-white font-bold focus:border-primary/50 focus:bg-white/[0.06] transition-all outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </section>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full h-16 rounded-2xl bg-primary text-background-dark font-black uppercase tracking-widest text-base shadow-[0_10px_30px_rgba(255,183,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="size-6 rounded-full border-4 border-background-dark/30 border-t-background-dark animate-spin"></div>
                              <span>{t('profile.saving')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <span className="material-symbols-outlined font-black">save</span>
                              <span>{t('profile.saveChanges')}</span>
                            </div>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Sidebar Column: KYC & Navigation */}
                <div className="space-y-8">
                  {/* KYC Card */}
                  <div className="p-[1px] rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent shadow-2xl relative group h-fit overflow-hidden">
                    <div className="bg-[#121212] rounded-[39px] p-8">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined !text-8xl">verified</span>
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-white text-xl font-black uppercase tracking-tight italic">{t('profile.kycVerification')}</h2>
                        </div>

                        <div className={`mb-8 px-4 py-3 rounded-2xl flex items-center gap-3 border ${getKYCStatusColor(kycStatus)}`}>
                          <span className="material-symbols-outlined">
                            {kycStatus === 'approved' ? 'verified' : kycStatus === 'pending' ? 'schedule' : kycStatus === 'rejected' ? 'gpp_bad' : 'help_center'}
                          </span>
                          <span className="text-xs font-black uppercase tracking-widest">{getKYCStatusText(kycStatus)}</span>
                        </div>

                        <p className="text-text-dark text-[11px] font-bold leading-relaxed mb-8">{t('profile.kycSubtitle')}</p>

                        <form onSubmit={handleKYCUpload} className="space-y-6">
                          {[
                            { id: 'idFront', label: t('profile.idFront'), uploaded: kycDocuments.idFront },
                            { id: 'idBack', label: t('profile.idBack'), uploaded: kycDocuments.idBack },
                            { id: 'addressProof', label: t('profile.addressProof'), uploaded: kycDocuments.addressProof }
                          ].map((doc) => (
                            <div key={doc.id} className="space-y-2.5">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-dark pl-2">
                                <span>{doc.label}</span>
                                {doc.uploaded && <span className="text-emerald-500 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">check</span>
                                  {t('common.available')}
                                </span>}
                              </div>
                              <label className={`block relative group/file cursor-pointer`}>
                                <div className={`w-full h-14 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${doc.uploaded ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'}`}>
                                  <span className={`material-symbols-outlined text-xl ${doc.uploaded ? 'text-emerald-500' : 'text-white/30'}`}>
                                    {doc.uploaded ? 'task_alt' : 'cloud_upload'}
                                  </span>
                                  <span className="text-[11px] font-black uppercase tracking-widest text-white/50">{doc.uploaded ? 'Dosya Güncelle' : 'Dosya Seç'}</span>
                                </div>
                                <input
                                  type="file"
                                  name={doc.id}
                                  accept="image/*,.pdf"
                                  className="hidden"
                                />
                              </label>
                            </div>
                          ))}

                          <button
                            type="submit"
                            disabled={kycUploading}
                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-background-dark hover:border-primary active:scale-95 transition-all disabled:opacity-50"
                          >
                            {kycUploading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                <span>{t('profile.saving')}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">upload</span>
                                <span>{t('profile.uploadKYC')}</span>
                              </div>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex flex-col gap-4">
                    <Link href="/dashboard" className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      <span className="material-symbols-outlined">dashboard</span>
                      {t('profile.backToDashboard')}
                    </Link>
                    <Link href="/withdraw" className="w-full h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center gap-3 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-background-dark transition-all">
                      <span className="material-symbols-outlined">payments</span>
                      {t('profile.withdrawFunds')}
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

export default function ProfilePageWrapper() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}