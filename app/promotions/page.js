'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'
import { promotionAPI } from '@/lib/api/promotion.api'
import { log } from '@/utils/logger'

export default function PromotionsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState(t('promotions.all'))
  const [currentPage, setCurrentPage] = useState(1)
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [claiming, setClaiming] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null) // Now stores object with image, title, description, category

  // Fetch promotions from API
  useEffect(() => {
    fetchPromotions()
  }, [selectedFilter, currentPage])

  // Add keyboard handler for ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedImage])

  const fetchPromotions = async () => {
    setLoading(true)
    setError('')
    try {
      // Map filter to API type parameter
      let type = null
      if (selectedFilter === t('promotions.casino')) {
        type = 'deposit' // Casino promotions are typically deposit-based
      } else if (selectedFilter === t('promotions.sports')) {
        type = 'welcome' // Sports promotions
      } else if (selectedFilter === t('promotions.welcomeBonus')) {
        type = 'welcome'
      } else if (selectedFilter === t('promotions.cashback')) {
        type = 'cashback'
      } else if (selectedFilter === t('promotions.reload')) {
        type = 'reload'
      }

      const params = {
        page: currentPage,
        limit: 12,
      }
      if (type && selectedFilter !== t('promotions.all')) {
        params.type = type
      }

      const response = await promotionAPI.getActivePromotions(params)
      const fetchedPromotions = response.data.promotions || []

      // Ensure all promotions have images - assign default images if missing
      const promotionsWithImages = fetchedPromotions.map((promo, index) => {
        if (!promo.bannerImage) {
          // Assign default images based on promotion type or index
          const defaultImages = [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop&q=80',
          ]
          promo.bannerImage = defaultImages[index % defaultImages.length]
        }
        return promo
      })

      setPromotions(promotionsWithImages)
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      console.error('Error fetching promotions:', err)
      setError(err.response?.data?.message || 'Failed to load promotions')
      log.apiError('/promotions', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (promotionId) => {
    setClaiming(promotionId)
    setError('')
    try {
      await promotionAPI.claimPromotion(promotionId)
      // Refresh promotions to update claim status
      await fetchPromotions()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim promotion')
      log.apiError('/promotions/claim', err)
    } finally {
      setClaiming(null)
    }
  }

  // Transform promotion data for UI
  const transformPromotion = (promo) => {
    // Map backend type to display category
    const categoryMap = {
      welcome: 'Welcome',
      deposit: 'Deposit',
      cashback: 'Cashback',
      reload: 'Reload',
      free_spins: 'Spins',
      tournament: 'Tournament',
      other: 'Other'
    }

    const category = categoryMap[promo.type] || 'Other'
    const categoryColors = {
      Welcome: 'bg-blue-500/80',
      Deposit: 'bg-purple-500/80',
      Cashback: 'bg-teal-500/80',
      Reload: 'bg-purple-500/80',
      Spins: 'bg-green-500/80',
      Tournament: 'bg-red-500/80',
      Other: 'bg-gray-500/80'
    }

    const canClaim = promo.canClaim && !promo.hasClaimed
    const buttonText = canClaim
      ? t('promotions.claim')
      : promo.hasClaimed
        ? t('promotions.claimed')
        : t('promotions.viewDetails')
    const buttonStyle = canClaim
      ? 'bg-primary text-background-dark hover:bg-yellow-400'
      : 'bg-primary/20 text-primary hover:bg-primary/30'

    return {
      ...promo,
      id: promo._id,
      category,
      categoryColor: categoryColors[category] || 'bg-gray-500/80',
      buttonText,
      buttonStyle,
      image: (() => {
        // Always ensure an image is assigned
        if (promo.bannerImage && promo.bannerImage.trim() !== '') {
          return promo.bannerImage
        }
        // Use reliable default images for promotions - casino themed
        const defaultImages = [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
          'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop&q=80',
        ]
        // Use index based on promotion ID for consistent image assignment
        const imageIndex = promo._id ? (promo._id.toString().charCodeAt(0) % defaultImages.length) : Math.floor(Math.random() * defaultImages.length)
        return defaultImages[imageIndex]
      })(),
    }
  }

  const transformedPromotions = promotions.map(transformPromotion)

  const filters = [t('promotions.all'), t('promotions.casino'), t('promotions.sports'), t('promotions.welcomeBonus'), t('promotions.cashback'), t('promotions.reload')]

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden navbar-spacing">
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">

        <main className="flex-1 px-4 py-8 md:px-8 lg:px-16 xl:px-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 md:pt-6 relative z-0">
              <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] relative z-0">Promotions</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`flex h-10 cursor-pointer shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors ${selectedFilter === filter
                    ? 'bg-primary text-background-dark'
                    : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white/80 hover:text-white'
                    }`}
                >
                  <p className={`text-sm leading-normal ${selectedFilter === filter ? 'font-bold' : 'font-medium'}`}>
                    {filter}
                  </p>
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-4">
                  <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-white/50 font-medium animate-pulse">Kampanyalar hazırlanıyor...</p>
                </div>
              </div>
            ) : transformedPromotions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-surface/30 rounded-3xl border border-white/5 backdrop-blur-sm">
                <span className="material-symbols-outlined text-6xl text-white/10 mb-4">Celebration</span>
                <p className="text-white/50 font-medium">Şu an aktif bir kampanya bulunamadı.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {transformedPromotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-surface/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/10 hover:border-white/20"
                  >
                    {/* Image Section */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden">
                      <img
                        src={promo.image}
                        alt={promo.title || 'Promotion'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <div className={`px-4 py-1.5 rounded-full ${promo.categoryColor} backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-white shadow-lg`}>
                          {promo.category}
                        </div>
                      </div>

                      {/* Hover Play Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                        <div className="size-16 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_30px_rgba(255,184,0,0.5)] cursor-pointer" onClick={() => setSelectedImage({
                          image: promo.image,
                          title: promo.title,
                          description: promo.description,
                          category: promo.category,
                          categoryColor: promo.categoryColor
                        })}>
                          <span className="material-symbols-outlined text-background-dark text-3xl font-black">visibility</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex flex-col gap-2 mb-6">
                        <h3 className="text-white text-2xl font-black leading-tight tracking-tight group-hover:text-primary transition-colors">
                          {promo.title}
                        </h3>
                        <p className="text-text-secondary text-sm font-medium leading-relaxed line-clamp-2 italic">
                          {promo.description}
                        </p>
                      </div>

                      {/* Action Row */}
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (promo.canClaim) {
                              handleClaim(promo._id)
                            } else {
                              router.push(`/promotions/${promo._id}`)
                            }
                          }}
                          disabled={claiming === promo._id}
                          className={`flex-1 h-12 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${promo.buttonStyle.includes('bg-primary')
                            ? 'bg-primary text-background-dark hover:shadow-[0_0_20px_rgba(255,184,0,0.4)]'
                            : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
                            } disabled:opacity-50 active:scale-95`}
                        >
                          {claiming === promo._id ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="size-4 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                              <span>Katılınıyor...</span>
                            </div>
                          ) : promo.buttonText}
                        </button>

                        <button
                          onClick={() => setSelectedImage({
                            image: promo.image,
                            title: promo.title,
                            description: promo.description,
                            category: promo.category,
                            categoryColor: promo.categoryColor
                          })}
                          className="size-12 shrink-0 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                          title="Detaylar"
                        >
                          <span className="material-symbols-outlined !text-xl">info</span>
                        </button>
                      </div>
                    </div>

                    {/* Decorative Corner Light */}
                    <div className="absolute -bottom-10 -right-10 size-24 bg-primary/10 blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-all"></div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center pt-8">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex size-10 items-center justify-center rounded-lg text-white/60 hover:bg-[#2a2a2a] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`text-sm leading-normal flex size-10 items-center justify-center rounded-lg transition-colors ${currentPage === pageNum
                          ? 'text-background-dark bg-primary font-bold'
                          : 'text-white/60 hover:bg-[#2a2a2a] hover:text-white font-medium'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-sm font-medium leading-normal flex size-10 items-center justify-center text-white/60 rounded-lg">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="text-sm font-medium leading-normal flex size-10 items-center justify-center rounded-lg text-white/60 hover:bg-[#2a2a2a] hover:text-white transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex size-10 items-center justify-center rounded-lg text-white/60 hover:bg-[#2a2a2a] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Enhanced Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex flex-col items-center justify-center gap-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center size-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm hover:scale-110 shadow-lg"
              aria-label="Close image"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            {/* Promotion Info Card */}
            <div className="absolute top-4 left-4 right-20 z-10 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10 animate-slide-in-left">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {selectedImage.category && (
                      <span className={`rounded-md ${selectedImage.categoryColor || 'bg-blue-500/80'} px-3 py-1 text-xs font-bold uppercase text-white`}>
                        {selectedImage.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-2">{selectedImage.title || 'Promotion'}</h2>
                  {selectedImage.description && (
                    <p className="text-white/80 text-sm leading-relaxed line-clamp-3">{selectedImage.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
              <img
                src={selectedImage.image || selectedImage}
                alt={selectedImage.title || 'Promotion'}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  e.target.src = 'https://static.vecteezy.com/system/resources/previews/005/525/145/non_2x/online-casino-welcome-bonus-banner-for-website-with-button-slot-machine-casino-roulette-poker-chips-playing-cards-on-podium-with-round-neon-frame-vector.jpg'
                }}
              />
            </div>

            {/* Navigation Hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-full px-6 py-3 text-white text-sm font-medium shadow-lg border border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">info</span>
                <span>Click outside or press ESC to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

