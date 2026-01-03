'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { adminAPI } from '@/lib/api'
import { log } from '@/utils/logger'

function SettingsPage() {
  const pathname = usePathname()
  const [settings, setSettings] = useState({
    minDeposit: 100,
    maxDeposit: 50000,
    minWithdrawal: 100,
    maxWithdrawal: 50000,
    depositBonusPercent: 20,
    lossBonusPercent: 20,
    rolloverMultiplier: 5,
    bonusEnabled: true,
    siteName: 'Garbet',
    currency: 'TRY',
    maintenanceMode: false,
    maintenanceMessage: '',
    companyIban: '',
    companyBankName: '',
    companyAccountHolder: '',
    companyBranchCode: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await adminAPI.getSettings()
      // Handle different response formats
      const data = response?.data || response
      
      if (data && typeof data === 'object') {
        setSettings({
          minDeposit: data.minDeposit ?? 100,
          maxDeposit: data.maxDeposit ?? 50000,
          minWithdrawal: data.minWithdrawal ?? 100,
          maxWithdrawal: data.maxWithdrawal ?? 50000,
          depositBonusPercent: data.depositBonusPercent ?? 20,
          lossBonusPercent: data.lossBonusPercent ?? 20,
          rolloverMultiplier: data.rolloverMultiplier ?? 5,
          bonusEnabled: data.bonusEnabled ?? true,
          siteName: data.siteName || 'Garbet',
          currency: data.currency || 'TRY',
          maintenanceMode: data.maintenanceMode ?? false,
          maintenanceMessage: data.maintenanceMessage || '',
          companyIban: data.companyIban || '',
          companyBankName: data.companyBankName || '',
          companyAccountHolder: data.companyAccountHolder || '',
          companyBranchCode: data.companyBranchCode || '',
        })
      } else {
        console.warn('Settings data format unexpected:', data)
        setError('Settings data format is invalid')
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load settings'
      setError(errorMsg)
      log.apiError('/settings', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      // Validate settings
      if (settings.minDeposit < 0 || settings.maxDeposit < settings.minDeposit) {
        setError('Invalid deposit limits')
        setSaving(false)
        return
      }
      if (settings.minWithdrawal < 0 || settings.maxWithdrawal < settings.minWithdrawal) {
        setError('Invalid withdrawal limits')
        setSaving(false)
        return
      }
      if (settings.depositBonusPercent < 0 || settings.depositBonusPercent > 100) {
        setError('Deposit bonus percent must be between 0 and 100')
        setSaving(false)
        return
      }
      if (settings.lossBonusPercent < 0 || settings.lossBonusPercent > 100) {
        setError('Loss bonus percent must be between 0 and 100')
        setSaving(false)
        return
      }
      if (settings.rolloverMultiplier < 1) {
        setError('Rollover multiplier must be at least 1')
        setSaving(false)
        return
      }

      const response = await adminAPI.updateSettings(settings)
      // Handle different response formats
      const responseData = response?.data || response
      const successMessage = responseData?.message || responseData?.settings?.message || 'Settings saved successfully!'
      setSuccess(successMessage)
      log.info('Settings updated successfully')
      
      // Refresh settings to get updated values
      await fetchSettings()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving settings:', err)
      }
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save settings'
      setError(errorMsg)
      log.apiError('/settings', err)
    } finally {
      setSaving(false)
    }
  }

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
  <main className="ml-0 lg:ml-64 flex-1 min-h-screen pt-16 lg:pt-0">
    {/* Your existing topbar */}
    {/* Your existing dashboard content */}
  </main>
</div>

  {/* MAIN CONTENT */}
  <main className="ml-0 lg:ml-64 flex-1 min-h-screen pt-16 lg:pt-0">
    {/* Your existing topbar */}
    {/* Your existing dashboard content */}
  </main>
</div>

      <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark">
        <div className="layout-content-container flex flex-col w-full max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <p className="text-black dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Settings
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 rounded-lg bg-green-500/20 border border-green-500/50 p-4">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Deposit & Withdrawal Limits */}
              <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-6">
                <h2 className="text-white text-xl font-semibold mb-6">Deposit & Withdrawal Limits</h2>
                
                <div className="space-y-6">
              <div>
                <label className="block text-white mb-2">Minimum Deposit (₺)</label>
                <input
                  type="number"
                  value={settings.minDeposit}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setSettings({...settings, minDeposit: value})
                  }}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Maximum Deposit (₺)</label>
                <input
                  type="number"
                  value={settings.maxDeposit}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setSettings({...settings, maxDeposit: value})
                  }}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Minimum Withdrawal (₺)</label>
                <input
                  type="number"
                  value={settings.minWithdrawal}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setSettings({...settings, minWithdrawal: value})
                  }}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Maximum Withdrawal (₺)</label>
                <input
                  type="number"
                  value={settings.maxWithdrawal}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setSettings({...settings, maxWithdrawal: value})
                  }}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Deposit Bonus Percent (%)</label>
                <input
                  type="number"
                  value={settings.depositBonusPercent}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setSettings({...settings, depositBonusPercent: value})
                  }}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Loss Bonus Percent (%)</label>
                <input
                  type="number"
                  value={settings.lossBonusPercent}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setSettings({...settings, lossBonusPercent: value})
                  }}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

                </div>
              </div>

              {/* Bonus Settings */}
              <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-6">
                <h2 className="text-white text-xl font-semibold mb-6">Bonus Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={settings.bonusEnabled}
                        onChange={(e) => setSettings({...settings, bonusEnabled: e.target.checked})}
                        className="size-5 rounded border-2 border-white/20 bg-white/5 text-[#0dccf2] focus:ring-2 focus:ring-[#0dccf2]/50"
                      />
                      <span className="text-white">Enable Bonus System</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-white mb-2">Deposit Bonus Percent (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.depositBonusPercent}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0
                        setSettings({...settings, depositBonusPercent: value})
                      }}
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Loss Bonus Percent (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.lossBonusPercent}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0
                        setSettings({...settings, lossBonusPercent: value})
                      }}
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Rollover Multiplier</label>
                    <input
                      type="number"
                      min="1"
                      value={settings.rolloverMultiplier}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1
                        setSettings({...settings, rolloverMultiplier: value})
                      }}
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    />
                    <p className="text-gray-400 text-sm mt-1">Multiplier for bonus rollover requirement</p>
                  </div>
                </div>
              </div>

              {/* Site Settings */}
              <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-6">
                <h2 className="text-white text-xl font-semibold mb-6">Site Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white mb-2">Site Name</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Default Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    >
                      <option value="TRY" className="bg-[#1E1E2B] text-white">TRY (₺)</option>
                      <option value="USD" className="bg-[#1E1E2B] text-white">USD ($)</option>
                      <option value="EUR" className="bg-[#1E1E2B] text-white">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                        className="size-5 rounded border-2 border-white/20 bg-white/5 text-[#0dccf2] focus:ring-2 focus:ring-[#0dccf2]/50"
                      />
                      <span className="text-white">Maintenance Mode</span>
                    </label>
                  </div>

                  {settings.maintenanceMode && (
                    <div>
                      <label className="block text-white mb-2">Maintenance Message</label>
                      <textarea
                        value={settings.maintenanceMessage}
                        onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                        rows={3}
                        className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                        placeholder="Enter maintenance message..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Company Banking Info */}
              <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-6">
                <h2 className="text-white text-xl font-semibold mb-6">Company Banking Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white mb-2">Company IBAN</label>
                    <input
                      type="text"
                      value={settings.companyIban}
                      onChange={(e) => setSettings({...settings, companyIban: e.target.value})}
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={settings.companyBankName}
                      onChange={(e) => setSettings({...settings, companyBankName: e.target.value})}
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      value={settings.companyAccountHolder}
                      onChange={(e) => setSettings({...settings, companyAccountHolder: e.target.value})}
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Branch Code</label>
                    <input
                      type="text"
                      value={settings.companyBranchCode}
                      onChange={(e) => setSettings({...settings, companyBranchCode: e.target.value})}
                      className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#0dccf2] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0bb5d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">save</span>
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function SettingsPageWrapper() {
  return (
    <AdminProtectedRoute>
      <SettingsPage />
    </AdminProtectedRoute>
  )
}

