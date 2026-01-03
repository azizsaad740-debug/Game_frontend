'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { authAPI } from '@/lib/api'

export default function UserSidebar() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getMe()
        setUser(response.data)
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
    }
    fetchUser()
  }, [])

  const menuItems = [
    { id: 'overview', label: t('dashboard.menuOverview'), icon: 'dashboard', href: '/dashboard' },
    { id: 'deposit', label: t('dashboard.menuDeposit'), icon: 'account_balance_wallet', href: '/deposit' },
    { id: 'withdraw', label: t('dashboard.menuWithdraw'), icon: 'payments', href: '/withdraw' },
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long', href: '/transactions' },
    { id: 'bet-history', label: t('dashboard.menuBetHistory'), icon: 'sports_soccer', href: '/sports' },
    { id: 'game-history', label: t('dashboard.menuGameHistory'), icon: 'casino', href: '/slots' },
    { id: 'bonuses', label: t('dashboard.menuBonuses'), icon: 'emoji_events', href: '/bonuses' },
    { id: 'settings', label: t('dashboard.menuSettings'), icon: 'settings', href: '/profile' }
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex-col bg-background-dark border-r border-surface hidden lg:flex z-40">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-surface">
        <div className="size-8 text-primary">
          <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_6_319)">
              <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"></path>
            </g>
            <defs><clipPath id="clip0_6_319"><rect fill="white" height="48" width="48"></rect></clipPath></defs>
          </svg>
        </div>
        <Link href="/">
          <h2 className="text-white text-xl font-bold">Garbet</h2>
        </Link>
      </div>
      <div className="flex flex-col flex-1 p-4 overflow-y-auto">
        <div className="flex items-center gap-3 p-2 mb-4">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAuhux6dpQvPR-RdOeaTaRrgQkV5Eq0ycakfmhZ14nIjMP68y4K7cXqyORaLFyN0P3tEwtd0zZqPHn5rulfpLx7bkvQElTJmDbLf6Z44yXJAlanpWVQqtzFfVEkFtQzWBb5CBABwV-PJyT82HfkwXfNrquaMr92GzVOd2NyezQu1QoSzfn8PkY_ukvA5q1szlNZBBw1SZD83oQj2FTqIMaRH8Js3ufJIyWtGhy9ml7_96FcmxSt35SIW7FQ2v-822p0zaAR0bRc0S8")' }}></div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-medium leading-normal">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'User'}
            </h1>
            <p className="text-gray-400 text-sm font-normal leading-normal">{user?.email || 'user@email.com'}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard'))
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-surface text-primary'
                    : 'hover:bg-surface/50 text-white'
                }`}
              >
                <span
                  className={`material-symbols-outlined ${isActive ? 'text-blue' : 'text-white/70'}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <p className="text-white text-sm font-medium leading-normal">{item.label}</p>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

