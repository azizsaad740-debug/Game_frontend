'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { ibanAPI } from '@/lib/api'
import { log } from '@/utils/logger'
import { formatDate } from '@/utils/formatters'

function IbansPage() {
  const router = useRouter()
  const [ibans, setIbans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isActiveFilter, setIsActiveFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingIban, setEditingIban] = useState(null)
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolder: '',
    ibanNumber: '',
    isActive: true,
  })

  useEffect(() => {
    fetchIbans()
  }, [page, isActiveFilter])

  const fetchIbans = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page,
        limit: 20,
      }
      if (isActiveFilter !== 'all') {
        params.isActive = isActiveFilter === 'active'
      }

      const response = await ibanAPI.getIbans(params)
      setIbans(response.data.ibans || [])
      setTotalPages(response.data.pagination?.totalPages || 1)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load IBANs')
      log.apiError('/ibans', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingIban(null)
    setFormData({
      bankName: '',
      accountHolder: '',
      ibanNumber: '',
      isActive: true,
    })
    setShowModal(true)
  }

  const handleEdit = (iban) => {
    setEditingIban(iban)
    setFormData({
      bankName: iban.bankName,
      accountHolder: iban.accountHolder,
      ibanNumber: iban.ibanNumber,
      isActive: iban.isActive,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingIban) {
        await ibanAPI.updateIban(editingIban.id, formData)
        setSuccess('IBAN updated successfully')
      } else {
        await ibanAPI.createIban(formData)
        setSuccess('IBAN created successfully')
      }
      setShowModal(false)
      fetchIbans()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save IBAN')
      log.apiError(editingIban ? '/ibans/update' : '/ibans/create', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this IBAN?')) return

    try {
      await ibanAPI.deleteIban(id)
      setSuccess('IBAN deleted successfully')
      fetchIbans()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete IBAN')
      log.apiError('/ibans/delete', err)
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await ibanAPI.toggleIbanStatus(id)
      setSuccess('IBAN status updated')
      fetchIbans()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle IBAN status')
      log.apiError('/ibans/toggle', err)
    }
  }

  const pathname = '/admin/ibans'
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/admin' },
    { id: 'users', label: 'Users', icon: 'group', href: '/admin/users' },
    { id: 'games', label: 'Games', icon: 'casino', href: '/admin/games' },
    { id: 'deposits', label: 'Deposits', icon: 'arrow_downward', href: '/admin/deposits' },
    { id: 'withdrawals', label: 'Withdrawals', icon: 'arrow_upward', href: '/admin/withdrawals' },
    { id: 'tournaments', label: 'Tournaments', icon: 'emoji_events', href: '/admin/tournaments' },
    { id: 'ibans', label: 'IBAN Management', icon: 'account_balance', href: '/admin/ibans' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/admin/settings' },
  ]

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display">
      {/* SideNavBar */}
      <aside className="flex w-64 flex-col bg-background-dark border-r border-surface p-4">
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
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === item.href
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-surface bg-background-dark/80 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
          <div className="flex items-center gap-8">
            <h1 className="text-white text-xl font-bold">IBAN Management</h1>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Messages */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-teal-500/20 border border-teal-500/50 p-4">
              <p className="text-sm text-teal-400">{success}</p>
            </div>
          )}

          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-white text-2xl font-bold">IBANs</h2>
              <p className="text-gray-400 text-sm">Manage bank account IBANs</p>
            </div>
            <div className="flex gap-4">
              <select
                value={isActiveFilter}
                onChange={(e) => {
                  setIsActiveFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg bg-surface border border-surface px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All IBANs</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 rounded-lg bg-primary text-background-dark px-4 py-2 font-bold hover:bg-yellow-400 transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
                Add IBAN
              </button>
            </div>
          </div>

          {/* IBANs Table */}
          <div className="bg-surface rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background-dark border-b border-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Bank Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Account Holder</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">IBAN Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Added By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : ibans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        No IBANs found
                      </td>
                    </tr>
                  ) : (
                    ibans.map((iban) => (
                      <tr key={iban.id} className="hover:bg-background-dark/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{iban.bankName}</td>
                        <td className="px-6 py-4 text-white">{iban.accountHolder}</td>
                        <td className="px-6 py-4 text-white font-mono">{iban.ibanNumber}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              iban.isActive
                                ? 'bg-teal-500/20 text-teal-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {iban.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {iban.addedBy?.name || iban.addedBy?.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {formatDate(iban.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(iban.id)}
                              className="p-2 rounded-lg hover:bg-background-dark transition-colors"
                              title={iban.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <span className="material-symbols-outlined text-lg text-gray-400 hover:text-white">
                                {iban.isActive ? 'toggle_on' : 'toggle_off'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleEdit(iban)}
                              className="p-2 rounded-lg hover:bg-background-dark transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-lg text-gray-400 hover:text-blue-400">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(iban.id)}
                              className="p-2 rounded-lg hover:bg-background-dark transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-lg text-gray-400 hover:text-red-400">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-surface flex items-center justify-between">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-background-dark text-white hover:bg-background-dark/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-background-dark text-white hover:bg-background-dark/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-bold mb-4">
              {editingIban ? 'Edit IBAN' : 'Create IBAN'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bank Name</label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full rounded-lg bg-background-dark border border-surface px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Account Holder</label>
                <input
                  type="text"
                  required
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="w-full rounded-lg bg-background-dark border border-surface px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">IBAN Number</label>
                <input
                  type="text"
                  required
                  value={formData.ibanNumber}
                  onChange={(e) => setFormData({ ...formData, ibanNumber: e.target.value })}
                  className="w-full rounded-lg bg-background-dark border border-surface px-4 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-background-dark border-surface text-primary focus:ring-primary/50"
                />
                <label htmlFor="isActive" className="text-sm text-gray-400">
                  Active
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg bg-gray-600 hover:bg-gray-700 px-4 py-2 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary text-background-dark px-4 py-2 font-bold hover:bg-yellow-400 transition-colors"
                >
                  {editingIban ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function IbansPageWrapper() {
  return (
    <AdminProtectedRoute>
      <IbansPage />
    </AdminProtectedRoute>
  )
}

