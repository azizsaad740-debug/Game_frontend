'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useTranslation } from '@/hooks/useTranslation'
import { bonusAPI } from '@/lib/api'
import { mockBonuses, simulateApiDelay } from '@/lib/mockData'

function BonusesPage() {
  const { t } = useTranslation()
  const [bonuses, setBonuses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch bonuses from API
    const fetchBonuses = async () => {
      const USE_MOCK_DATA = false
      
      if (USE_MOCK_DATA) {
        await simulateApiDelay(600)
        setBonuses(mockBonuses)
        setLoading(false)
        return
      }

      try {
        const response = await bonusAPI.getMyBonuses()
        if (response.data) {
          setBonuses(response.data.bonuses || [])
        }
      } catch (error) {
        // Fallback to mock data
        setBonuses(mockBonuses)
      } finally {
        setLoading(false)
      }
    }

    fetchBonuses()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'unlocked':
        return 'bg-blue-500/20 text-blue-400'
      case 'expired':
        return 'bg-gray-500/20 text-gray-400'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeLabel = (type) => {
    return type === 'deposit' ? 'Deposit Bonus' : 'Loss Bonus'
  }

  const calculateProgress = (current, required) => {
    if (!required || required === 0) return 0
    return Math.min((current / required) * 100, 100)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-text-light">
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-16 xl:px-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            {/* Page Heading */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                  {t('common.bonusesButton')}
                </h1>
                <p className="text-text-dark text-base font-normal leading-normal">
                  View and manage your active bonuses
                </p>
              </div>
            </div>

            {/* Bonuses List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading bonuses...</div>
              </div>
            ) : bonuses.length === 0 ? (
              <div className="rounded-lg bg-surface p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">emoji_events</span>
                <h3 className="text-white text-xl font-bold mb-2">No Active Bonuses</h3>
                <p className="text-gray-400 mb-6">You don&apos;t have any active bonuses at the moment.</p>
                <Link
                  href="/promotions"
                  className="inline-flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-background-dark text-sm font-bold hover:bg-yellow-400 transition-colors"
                >
                  View Promotions
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bonuses.map((bonus) => (
                  <div key={bonus._id} className="rounded-lg bg-surface p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white text-xl font-bold mb-1">
                          {getTypeLabel(bonus.type)}
                        </h3>
                        <p className="text-primary text-2xl font-bold">
                          ₺{bonus.amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(bonus.status)}`}>
                        {bonus.status}
                      </span>
                    </div>

                    {bonus.status === 'active' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>Progress</span>
                          <span>
                            ₺{bonus.currentTurnover?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} / ₺{bonus.requiredTurnover?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-[#3e3e47] rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full transition-all"
                            style={{
                              width: `${calculateProgress(bonus.currentTurnover || 0, bonus.requiredTurnover || 0)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white font-medium">{getTypeLabel(bonus.type)}</span>
                      </div>
                      {bonus.requiredTurnover && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Required Turnover:</span>
                          <span className="text-white font-medium">
                            ₺{bonus.requiredTurnover.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      {bonus.activatedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Activated:</span>
                          <span className="text-white font-medium">
                            {new Date(bonus.activatedAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                      {bonus.expiresAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expires:</span>
                          <span className="text-white font-medium">
                            {new Date(bonus.expiresAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Promotions Link */}
            <div className="rounded-lg bg-surface p-6 text-center">
              <h3 className="text-white text-xl font-bold mb-2">Looking for more bonuses?</h3>
              <p className="text-gray-400 mb-4">Check out our latest promotions and offers</p>
              <Link
                href="/promotions"
                className="inline-flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-background-dark text-sm font-bold hover:bg-yellow-400 transition-colors"
              >
                View All Promotions
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function BonusesPageWrapper() {
  return (
    <ProtectedRoute>
      <BonusesPage />
    </ProtectedRoute>
  )
}

