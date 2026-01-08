'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import GameControlMonitor from '@/components/GameControlMonitor'

export default function AdminSidebar() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: 'dashboard', href: '/admin' },
    { id: 'users', label: t('admin.users'), icon: 'group', href: '/admin/users' },
    { id: 'kyc', label: t('admin.kyc'), icon: 'badge', href: '/admin/kyc' },
    { id: 'games', label: t('admin.games'), icon: 'gamepad', href: '/admin/games' },
    { id: 'dice-games', label: 'Dice Games', icon: 'sports_esports', href: '/admin/dice-games' },
    { id: 'betting', label: t('admin.betting'), icon: 'sports_soccer', href: '/admin/betting' },
    { id: 'promotions', label: t('admin.promotions'), icon: 'campaign', href: '/admin/promotions' },
    { id: 'deposits', label: t('admin.deposits'), icon: 'arrow_downward', href: '/admin/deposits' },
    { id: 'withdrawals', label: t('admin.withdrawals'), icon: 'arrow_upward', href: '/admin/withdrawals' },
    { id: 'tournaments', label: t('admin.tournaments'), icon: 'emoji_events', href: '/admin/tournaments' },
    { id: 'content', label: t('admin.content'), icon: 'wysiwyg', href: '/admin/content' },
  ]

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isMobileOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = ''
      }
    }
  }, [isMobileOpen])

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[100] p-2 bg-background-dark border border-surface rounded-lg text-white hover:bg-white/10 transition-colors shadow-lg"
        aria-label="Toggle sidebar"
        aria-expanded={isMobileOpen}
      >
        <span className="material-symbols-outlined">{isMobileOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 flex flex-col bg-background-dark border-r border-surface p-4 z-[95] transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="flex items-center justify-between mb-8 px-2 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary flex-shrink-0">
              <span className="material-symbols-outlined text-black">casino</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="text-base font-bold text-white truncate">{t('admin.title')}</h1>
              <p className="text-sm text-gray-400 truncate">{t('admin.management')}</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map(item => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-w-0 ${pathname === item.href || (item.id === 'dashboard' && pathname === '/admin') || pathname.startsWith(item.href + '/')
                ? 'bg-primary/20 text-primary'
                : 'text-gray-300 hover:bg-white/10'
                }`}
            >
              <span className="material-symbols-outlined flex-shrink-0 text-xl">{item.icon}</span>
              <p className="truncate whitespace-nowrap flex-1 min-w-0">{item.label}</p>
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <Link
            href="/admin/settings"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors min-w-0"
          >
            <span className="material-symbols-outlined flex-shrink-0 text-xl">settings</span>
            <p className="text-sm font-medium truncate whitespace-nowrap flex-1 min-w-0">{t('admin.settings')}</p>
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.removeItem('isAdmin')
              localStorage.removeItem('adminEmail')
              window.location.href = '/auth/login'
            }}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors min-w-0"
          >
            <span className="material-symbols-outlined flex-shrink-0 text-xl">logout</span>
            <p className="text-sm font-medium truncate whitespace-nowrap flex-1 min-w-0">{t('admin.logout')}</p>
          </button>
        </div>
      </aside>

      <GameControlMonitor />
    </>
  )
}
