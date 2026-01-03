'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'

function DocumentationPage() {
  const pathname = usePathname()

const navItems = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard', href: '/admin' },
  { id: 'users', label: 'User Management', icon: 'group', href: '/admin/users' },
  { id: 'kyc', label: 'KYC Management', icon: 'badge', href: '/admin/kyc' }, // <-- Added KYC Management
  { id: 'games', label: 'Game Management', icon: 'gamepad', href: '/admin/games' },
  { id: 'betting', label: 'Betting Management', icon: 'sports_soccer', href: '/admin/betting' },
  { id: 'promotions', label: 'Promotions Management', icon: 'campaign', href: '/admin/promotions' },
  { id: 'deposits', label: 'Deposits', icon: 'arrow_downward', href: '/admin/deposits' },
  { id: 'withdrawals', label: 'Withdrawals', icon: 'arrow_upward', href: '/admin/withdrawals' },
  { id: 'tournaments', label: 'Tournaments', icon: 'emoji_events', href: '/admin/tournaments' },
  { id: 'content', label: 'Content Management', icon: 'wysiwyg', href: '/admin/content' },
]

  return (
    <div className="flex min-h-screen w-full bg-background-dark">
   <div className="flex bg-background-dark min-h-screen">
  {/* FIXED SIDEBAR */}
 <div className="flex bg-background-dark min-h-screen">
  {/* FIXED SIDEBAR */}
<div className="flex bg-background-dark min-h-screen">
  {/* FIXED SIDEBAR */}
  <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-background-dark border-r border-surface p-4 z-50">
    <div className="flex items-center gap-3 mb-8 px-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
        <span className="material-symbols-outlined text-black">casino</span>
      </div>
      <div className="flex flex-col">
        <h1 className="text-base font-bold text-white">Casino Admin</h1>
        <p className="text-sm text-gray-400">Management</p>
      </div>
    </div>

    <nav className="flex flex-col gap-2">
      {navItems.map(item => (
        <Link
          key={item.id}
          href={item.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === item.href || (item.id === 'dashboard' && pathname === '/admin')
              ? 'bg-primary/20 text-primary'
              : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <p>{item.label}</p>
        </Link>
      ))}
    </nav>

    <div className="mt-auto">
      <Link
        href="/admin/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined">settings</span>
        <p className="text-sm font-medium">Settings</p>
      </Link>

      <button
        onClick={() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('isAdmin')
          localStorage.removeItem('adminEmail')
          window.location.href = '/auth/login'
        }}
        className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
      >
        <span className="material-symbols-outlined">logout</span>
        <p className="text-sm font-medium">Logout</p>
      </button>

      <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAeBaCCsTptl1trq-7t7S9yHg2U-j1m_3eQJ6dpRP-IZjxZIDKL6U_iFBKUwWt18HwxovSG8ldqiQCa7NbmEcelTnHQGSwTeQORHSMYn7gGZDs-U982dOqo8QbAOQy7uCWkHjlHxe0m_eXtY2xDHYQYW3KAKuLgW2ZrQlV3yrUSs8tMyu4QaShzTzhohnzpDGQllaTrkdAQoFvcjS9zzhmKAnFrldqCRC16_VfbZD7OYbVjNJOiQ4Gz2-oKSG6XZ4azP4qWoBeSO74")'
          }}
        />
        <div className="flex flex-col">
          <h2 className="text-sm font-medium text-white">
            {typeof window !== 'undefined'
              ? (() => {
                  try {
                    const userStr = localStorage.getItem('user')
                    if (userStr) {
                      const user = JSON.parse(userStr)
                      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User'
                    }
                  } catch {}
                  return 'Admin User'
                })()
              : 'Admin User'}
          </h2>
          <p className="text-xs text-gray-400">
            {typeof window !== 'undefined'
              ? (() => {
                  try {
                    const userStr = localStorage.getItem('user')
                    if (userStr) {
                      const user = JSON.parse(userStr)
                      return user.email || 'admin@casino.com'
                    }
                  } catch {}
                  return localStorage.getItem('adminEmail') || 'admin@casino.com'
                })()
              : 'admin@casino.com'}
          </p>
        </div>
      </div>
    </div>
  </aside>

  {/* MAIN CONTENT */}
  <main className="ml-64 flex-1 min-h-screen">
    {/* Your existing topbar */}
    {/* Your existing dashboard content */}
  </main>
</div>


  {/* MAIN CONTENT */}
  <main className="ml-64 flex-1 min-h-screen">
    {/* Your existing topbar */}
    {/* Your existing dashboard content */}
  </main>
</div>


  {/* MAIN CONTENT */}
  <main className="ml-64 flex-1 min-h-screen">
    {/* Your existing topbar */}
    {/* Your existing dashboard content */}
  </main>
</div>

      <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark">
        <div className="layout-content-container flex flex-col w-full max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <p className="text-black dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Documentation
            </p>
          </div>

          <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-6 space-y-6">
            <section>
              <h2 className="text-white text-2xl font-semibold mb-4">Admin Panel Guide</h2>
              <div className="text-white/70 space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">User Management</h3>
                  <p>Manage user accounts, view user details, and handle user-related operations from the Users page.</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Financial Operations</h3>
                  <p>Approve or reject deposit and withdrawal requests from the Finances page. All transactions are logged for audit purposes.</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Game Management</h3>
                  <p>Add, edit, or remove games from the platform. Configure game settings and availability.</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">System Settings</h3>
                  <p>Configure platform-wide settings including deposit/withdrawal limits, bonus percentages, and rollover requirements.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white text-2xl font-semibold mb-4">API Documentation</h2>
              <p className="text-white/70">API documentation is available at /api/docs (when implemented).</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DocumentationPageWrapper() {
  return (
    <AdminProtectedRoute>
      <DocumentationPage />
    </AdminProtectedRoute>
  )
}

