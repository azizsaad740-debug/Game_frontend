'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'
import { promotionAPI } from '@/lib/api/promotion.api'
import { log } from '@/utils/logger'

export default function PromotionDetailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const promotionId = params?.id
  const [promotion, setPromotion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (promotionId) {
      fetchPromotion()
    }
  }, [promotionId])

  const fetchPromotion = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await promotionAPI.getPromotionById(promotionId)
      setPromotion(response.data.promotion || response.data)
    } catch (err) {
      console.error('Error fetching promotion:', err)
      setError(err.response?.data?.message || 'Failed to load promotion')
      log.apiError(`/promotions/${promotionId}`, err)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!promotion?._id) return

    setClaiming(true)
    setError('')
    try {
      await promotionAPI.claimPromotion(promotion._id)
      // Refresh promotion to update claim status
      await fetchPromotion()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim promotion')
      log.apiError('/promotions/claim', err)
    } finally {
      setClaiming(false)
    }
  }

  const getCategoryColor = (type) => {
    const colors = {
      welcome: 'bg-blue-500/80',
      deposit: 'bg-purple-500/80',
      cashback: 'bg-teal-500/80',
      reload: 'bg-purple-500/80',
      free_spins: 'bg-green-500/80',
      tournament: 'bg-red-500/80',
    }
    return colors[type] || 'bg-gray-500/80'
  }

  const getCategoryName = (type) => {
    const names = {
      welcome: 'Welcome',
      deposit: 'Deposit',
      cashback: 'Cashback',
      reload: 'Reload',
      free_spins: 'Spins',
      tournament: 'Tournament',
    }
    return names[type] || 'Other'
  }

  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-background-dark navbar-spacing">
        <Navbar />
        <main className="mx-auto flex max-w-4xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="text-white/70">Loading promotion...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error && !promotion) {
    return (
      <div className="relative min-h-screen w-full bg-background-dark navbar-spacing">
        <Navbar />
        <main className="mx-auto flex max-w-4xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
          <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-6">
            <p className="text-red-400 mb-4">{error}</p>
            <Link href="/promotions" className="text-primary hover:underline">
              ← Back to Promotions
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (!promotion) {
    return (
      <div className="relative min-h-screen w-full bg-background-dark navbar-spacing">
        <Navbar />
        <main className="mx-auto flex max-w-4xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
          <div className="text-center py-20">
            <p className="text-white/70 mb-4">Promotion not found</p>
            <Link href="/promotions" className="text-primary hover:underline">
              ← Back to Promotions
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const canClaim = promotion.canClaim && !promotion.hasClaimed
  const categoryColor = getCategoryColor(promotion.type)
  const categoryName = getCategoryName(promotion.type)

  return (
    <div className="relative min-h-screen w-full bg-background-dark navbar-spacing">
      <Navbar />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <Link href="/promotions" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit">
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back to Promotions</span>
        </Link>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Promotion Card */}
        <div className="flex flex-col gap-6 overflow-hidden rounded-xl bg-[#1A1A1A] p-6 shadow-lg">
          {/* Category Badge */}
          <div className="flex items-center justify-between">
            <span className={`rounded-md ${categoryColor} px-3 py-1 text-xs font-bold uppercase text-white`}>
              {categoryName}
            </span>
            {promotion.hasClaimed && (
              <span className="rounded-md bg-green-500/20 text-green-400 px-3 py-1 text-xs font-bold">
                Claimed
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-white text-3xl md:text-4xl font-black leading-tight">{promotion.title}</h1>

          {/* Image */}
          {promotion.bannerImage && (
            <div className="relative w-full aspect-video overflow-hidden rounded-lg">
              <img
                src={promotion.bannerImage}
                alt={promotion.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://static.vecteezy.com/system/resources/previews/005/525/145/non_2x/online-casino-welcome-bonus-banner-for-website-with-button-slot-machine-casino-roulette-poker-chips-playing-cards-on-podium-with-round-neon-frame-vector.jpg'
                }}
              />
            </div>
          )}

          {/* Description */}
          <div className="prose prose-invert max-w-none">
            <p className="text-white/80 text-base leading-relaxed whitespace-pre-line">
              {promotion.description || promotion.details || 'No description available.'}
            </p>
          </div>

          {/* Terms and Conditions */}
          {promotion.terms && (
            <div className="rounded-lg bg-background-dark/50 p-4">
              <h3 className="text-white font-bold mb-2">Terms & Conditions</h3>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{promotion.terms}</p>
            </div>
          )}

          {/* Promotion Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotion.amount && (
              <div className="rounded-lg bg-background-dark/50 p-4">
                <p className="text-white/70 text-sm mb-1">Bonus Amount</p>
                <p className="text-white text-2xl font-bold">₺{promotion.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
            )}
            {promotion.startDate && (
              <div className="rounded-lg bg-background-dark/50 p-4">
                <p className="text-white/70 text-sm mb-1">Start Date</p>
                <p className="text-white font-medium">{new Date(promotion.startDate).toLocaleDateString('tr-TR')}</p>
              </div>
            )}
            {promotion.endDate && (
              <div className="rounded-lg bg-background-dark/50 p-4">
                <p className="text-white/70 text-sm mb-1">End Date</p>
                <p className="text-white font-medium">{new Date(promotion.endDate).toLocaleDateString('tr-TR')}</p>
              </div>
            )}
          </div>

          {/* Claim Button */}
          {canClaim ? (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-background-dark text-lg font-bold transition-all hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {claiming ? 'Claiming...' : t('promotions.claim')}
            </button>
          ) : promotion.hasClaimed ? (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/20 px-6 py-4 text-primary text-lg font-bold cursor-not-allowed"
            >
              {t('promotions.claimed')}
            </button>
          ) : (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/20 px-6 py-4 text-primary text-lg font-bold cursor-not-allowed"
            >
              {t('promotions.viewDetails')}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

