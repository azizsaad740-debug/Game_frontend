'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import AdminSidebar from '@/components/AdminSidebar'
import { adminAPI } from '@/lib/api'
import { formatDate } from '@/utils/formatters'
import { log } from '@/utils/logger'

function PromotionsManagement() {
  const pathname = usePathname()
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState(null)
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    type: 'welcome',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active',
    minDeposit: 0,
    maxDeposit: null,
    bonusPercent: 0,
    bonusAmount: 0,
    maxBonus: null,
    rolloverMultiplier: 5,
    maxUses: null,
    maxUsesPerUser: 1,
    bannerImage: '',
    termsAndConditions: '',
    isFeatured: false,
    priority: 0,
  })

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

  useEffect(() => {
    fetchPromotions()
  }, [statusFilter, typeFilter, searchQuery, currentPage])

  const fetchPromotions = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 20,
      }
      
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.type = typeFilter

      const response = await adminAPI.getPromotions(params)
      setPromotions(response.data.promotions || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load promotions')
      log.apiError('/admin/promotions', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    setSaving(true)
    setError('')
    try {
      // Validate dates
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        setError('End date must be after start date')
        setSaving(false)
        return
      }

      await adminAPI.createPromotion(formData)
      setSuccess('Promotion created successfully!')
      setShowAddModal(false)
      resetForm()
      fetchPromotions()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create promotion')
      log.apiError('/admin/promotions', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedPromotion) return
    
    setSaving(true)
    setError('')
    try {
      // Validate dates
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        setError('End date must be after start date')
        setSaving(false)
        return
      }

      await adminAPI.updatePromotion(selectedPromotion._id, formData)
      setSuccess('Promotion updated successfully!')
      setShowEditModal(false)
      setSelectedPromotion(null)
      resetForm()
      fetchPromotions()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update promotion')
      log.apiError(`/admin/promotions/${selectedPromotion._id}`, err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPromotion) return
    
    setSaving(true)
    setError('')
    try {
      await adminAPI.deletePromotion(selectedPromotion._id)
      setSuccess('Promotion deleted successfully!')
      setShowDeleteModal(false)
      setSelectedPromotion(null)
      fetchPromotions()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete promotion')
      log.apiError(`/admin/promotions/${selectedPromotion._id}`, err)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'welcome',
      description: '',
      startDate: '',
      endDate: '',
      status: 'active',
      minDeposit: 0,
      maxDeposit: null,
      bonusPercent: 0,
      bonusAmount: 0,
      maxBonus: null,
      rolloverMultiplier: 5,
      maxUses: null,
      maxUsesPerUser: 1,
      bannerImage: '',
      termsAndConditions: '',
      isFeatured: false,
      priority: 0,
    })
  }

  const openEditModal = (promotion) => {
    setSelectedPromotion(promotion)
    setFormData({
      title: promotion.title || '',
      type: promotion.type || 'welcome',
      description: promotion.description || '',
      startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
      endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
      status: promotion.status || 'active',
      minDeposit: promotion.minDeposit || 0,
      maxDeposit: promotion.maxDeposit || null,
      bonusPercent: promotion.bonusPercent || 0,
      bonusAmount: promotion.bonusAmount || 0,
      maxBonus: promotion.maxBonus || null,
      rolloverMultiplier: promotion.rolloverMultiplier || 5,
      maxUses: promotion.maxUses || null,
      maxUsesPerUser: promotion.maxUsesPerUser || 1,
      bannerImage: promotion.bannerImage || '',
      termsAndConditions: promotion.termsAndConditions || '',
      isFeatured: promotion.isFeatured || false,
      priority: promotion.priority || 0,
    })
    setShowEditModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400'
      case 'expired':
        return 'bg-red-500/20 text-red-400'
      case 'scheduled':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      welcome: 'Welcome',
      deposit: 'Deposit',
      cashback: 'Cashback',
      reload: 'Reload',
      free_spins: 'Free Spins',
      tournament: 'Tournament',
      other: 'Other'
    }
    return labels[type] || type
  }

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen w-full bg-background-dark">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark ml-0 lg:ml-64">
          <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Promotions Management</p>
              <p className="text-[#9cb5ba] text-base font-normal leading-normal">Create, view, edit, and delete promotions and bonuses.</p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 px-6 bg-[#0dccf2] text-[#111718] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#0dccf2]/90 transition-colors"
            >
              <span className="material-symbols-outlined">add_circle</span>
              <span className="truncate">Create New Promotion</span>
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-500/20 border border-green-500/50 p-4">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* SearchBar */}
            <div className="flex-1">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-[#9cb5ba] flex border-none bg-[#1b2527] items-center justify-center pl-4 rounded-l-lg">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#0dccf2] focus:ring-inset border-none bg-[#1b2527] h-full placeholder:text-[#9cb5ba] px-4 text-base font-normal leading-normal"
                    placeholder="Search by promotion title..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    type="text"
                  />
                </div>
              </label>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-12 rounded-lg bg-[#1b2527] border border-[#3b5054] text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]"
              >
                <option value="all" className="bg-[#1b2527]">All Status</option>
                <option value="active" className="bg-[#1b2527]">Active</option>
                <option value="inactive" className="bg-[#1b2527]">Inactive</option>
                <option value="expired" className="bg-[#1b2527]">Expired</option>
                <option value="scheduled" className="bg-[#1b2527]">Scheduled</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-12 rounded-lg bg-[#1b2527] border border-[#3b5054] text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]"
              >
                <option value="all" className="bg-[#1b2527]">All Types</option>
                <option value="welcome" className="bg-[#1b2527]">Welcome</option>
                <option value="deposit" className="bg-[#1b2527]">Deposit</option>
                <option value="cashback" className="bg-[#1b2527]">Cashback</option>
                <option value="reload" className="bg-[#1b2527]">Reload</option>
                <option value="free_spins" className="bg-[#1b2527]">Free Spins</option>
                <option value="tournament" className="bg-[#1b2527]">Tournament</option>
                <option value="other" className="bg-[#1b2527]">Other</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="@container">
            <div className="overflow-hidden rounded-lg border border-[#3b5054] bg-[#111718]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent"></div>
                </div>
              ) : promotions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No promotions found</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-[#1b2527]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-2/6">
                        Promotion Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3b5054]">
                    {promotions.map((promo) => (
                      <tr key={promo._id} className="hover:bg-[#1b2527]/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-white text-sm font-medium">{promo.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#9cb5ba] text-sm">{getTypeLabel(promo.type)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#9cb5ba] text-sm">{formatDate(promo.startDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#9cb5ba] text-sm">{formatDate(promo.endDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(promo.status)}`}>
                            {promo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(promo)}
                              className="text-[#9cb5ba] hover:text-[#0dccf2] transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPromotion(promo)
                                setShowDeleteModal(true)
                              }}
                              className="text-[#9cb5ba] hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-[#9cb5ba]">
              <p>
                Showing <span className="font-medium text-white">{((currentPage - 1) * 20) + 1}</span> to{' '}
                <span className="font-medium text-white">{Math.min(currentPage * 20, total)}</span> of{' '}
                <span className="font-medium text-white">{total}</span> results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-[#1b2527] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-white px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-[#1b2527] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
        </main>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-xl font-semibold mb-4">
              {showAddModal ? 'Create New Promotion' : 'Edit Promotion'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  >
                    <option value="welcome" className="bg-[#1E1E2B] text-white">Welcome</option>
                    <option value="deposit" className="bg-[#1E1E2B] text-white">Deposit</option>
                    <option value="cashback" className="bg-[#1E1E2B] text-white">Cashback</option>
                    <option value="reload" className="bg-[#1E1E2B] text-white">Reload</option>
                    <option value="free_spins" className="bg-[#1E1E2B] text-white">Free Spins</option>
                    <option value="tournament" className="bg-[#1E1E2B] text-white">Tournament</option>
                    <option value="other" className="bg-[#1E1E2B] text-white">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="active" className="bg-[#1E1E2B]">Active</option>
                    <option value="inactive" className="bg-[#1E1E2B]">Inactive</option>
                    <option value="scheduled" className="bg-[#1E1E2B]">Scheduled</option>
                    <option value="expired" className="bg-[#1E1E2B]">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Priority</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Bonus %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.bonusPercent}
                    onChange={(e) => setFormData({...formData, bonusPercent: parseFloat(e.target.value) || 0})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Bonus Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bonusAmount}
                    onChange={(e) => setFormData({...formData, bonusAmount: parseFloat(e.target.value) || 0})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Max Bonus</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxBonus || ''}
                    onChange={(e) => setFormData({...formData, maxBonus: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="size-5 rounded border-2 border-white/20 bg-white/5 text-[#0dccf2] focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                  <span className="text-white text-sm">Featured</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={showAddModal ? handleAdd : handleEdit}
                  disabled={saving || !formData.title || !formData.startDate || !formData.endDate}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0dccf2] text-white font-medium hover:bg-[#0bb5d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : (showAddModal ? 'Create Promotion' : 'Update Promotion')}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedPromotion(null)
                    resetForm()
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-white text-xl font-semibold mb-4">Delete Promotion</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete &quot;{selectedPromotion.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedPromotion(null)
                }}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminProtectedRoute>
  )
}

export default PromotionsManagement
