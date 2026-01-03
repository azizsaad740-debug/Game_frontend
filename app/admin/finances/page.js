'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { adminAPI } from '@/lib/api'
import { formatDate } from '@/utils/formatters'
import { log } from '@/utils/logger'
import { mockAdminDeposits, mockAdminWithdrawals, simulateApiDelay } from '@/lib/mockData'

function DepositsWithdrawals() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('withdrawals')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [withdrawals, setWithdrawals] = useState([])
  const [deposits, setDeposits] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [success, setSuccess] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDateRange, setShowDateRange] = useState(false)
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [showIbanModal, setShowIbanModal] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [ibanData, setIbanData] = useState({ iban: '', ibanHolderName: '', bankName: '' })
  const [balanceData, setBalanceData] = useState({ amount: '', type: 'add', description: '' })

const navItems = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard', href: '/admin' },
  { id: 'users', label: 'User Management', icon: 'group', href: '/admin/users' },
  { id: 'kyc', label: 'KYC Management', icon: 'badge', href: '/admin/kyc' },
  { id: 'games', label: 'Game Management', icon: 'gamepad', href: '/admin/games' },
  { id: 'betting', label: 'Betting Management', icon: 'sports_soccer', href: '/admin/betting' },
  { id: 'promotions', label: 'Promotions Management', icon: 'campaign', href: '/admin/promotions' },
  { id: 'deposits', label: 'Deposits', icon: 'arrow_downward', href: '/admin/deposits' },
  { id: 'withdrawals', label: 'Withdrawals', icon: 'arrow_upward', href: '/admin/withdrawals' },
  { id: 'tournaments', label: 'Tournaments', icon: 'emoji_events', href: '/admin/tournaments' },
  { id: 'content', label: 'Content Management', icon: 'wysiwyg', href: '/admin/content' },
]

  // Fetch data when tab or filters change
  useEffect(() => {
    fetchData()
  }, [activeTab, statusFilter, currentPage, startDate, endDate, paymentMethodFilter])

  const fetchData = async () => {
    const USE_MOCK_DATA = false
    
    setLoading(true)
    setError('')
    
    if (USE_MOCK_DATA) {
      await simulateApiDelay(600)
      if (activeTab === 'withdrawals') {
        let filtered = [...mockAdminWithdrawals]
        if (statusFilter && statusFilter !== 'Status: All' && statusFilter !== 'all') {
          filtered = filtered.filter(w => w.status === statusFilter)
        }
        setWithdrawals(filtered)
        setTotalPages(1)
        setTotal(filtered.length)
      } else {
        let filtered = [...mockAdminDeposits]
        if (statusFilter && statusFilter !== 'Status: All' && statusFilter !== 'all') {
          filtered = filtered.filter(d => d.status === statusFilter)
        }
        setDeposits(filtered)
        setTotalPages(1)
        setTotal(filtered.length)
      }
      setLoading(false)
      return
    }

    try {
      const params = {
        status: statusFilter === 'Status: All' ? undefined : statusFilter,
        page: currentPage,
        limit: 50,
      }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (paymentMethodFilter && paymentMethodFilter !== 'all') params.paymentMethod = paymentMethodFilter

      if (activeTab === 'withdrawals') {
        const response = await adminAPI.getWithdrawalPool(params)
        setWithdrawals(response.data.withdrawals || [])
        setTotalPages(response.data.totalPages || 1)
        setTotal(response.data.total || 0)
      } else {
        const response = await adminAPI.getDepositPool(params)
        setDeposits(response.data.deposits || [])
        setTotalPages(response.data.totalPages || 1)
        setTotal(response.data.total || 0)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Veri yüklenirken bir hata oluştu')
      // Fallback to mock data
      if (activeTab === 'withdrawals') {
        setWithdrawals(mockAdminWithdrawals)
        setTotalPages(1)
        setTotal(mockAdminWithdrawals.length)
      } else {
        setDeposits(mockAdminDeposits)
        setTotalPages(1)
        setTotal(mockAdminDeposits.length)
      }
      log.apiError('/admin/finances', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Beklemede'
      case 'approved':
        return 'Onaylandı'
      case 'paid':
        return 'Ödendi'
      case 'rejected':
        return 'Reddedildi'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return status
    }
  }

  const handleApprove = async (id) => {
    try {
      if (activeTab === 'withdrawals') {
        await adminAPI.approveWithdrawal(id, { adminNotes })
      } else {
        await adminAPI.approveDeposit(id, { adminNotes })
      }
      setShowModal(false)
      setAdminNotes('')
      setSelectedItem(null)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Onaylama işlemi başarısız')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Red nedeni:')
    if (!reason) return

    try {
      await adminAPI.rejectWithdrawal(id, { rejectionReason: reason, adminNotes })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Red işlemi başarısız')
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Bu talebi iptal etmek istediğinizden emin misiniz?')) return

    try {
      await adminAPI.cancelDeposit(id, { adminNotes })
      setSuccess('Deposit cancelled successfully')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'İptal işlemi başarısız')
    }
  }

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    const pendingItems = (activeTab === 'withdrawals' ? withdrawals : deposits)
      .filter(item => item.status === 'pending')
      .map(item => item._id)
    
    if (selectedItems.length === pendingItems.length && pendingItems.length > 0) {
      setSelectedItems([])
    } else {
      setSelectedItems(pendingItems)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return

    try {
      if (activeTab === 'withdrawals') {
        if (bulkAction === 'approve') {
          await adminAPI.bulkApproveWithdrawals({
            withdrawalIds: selectedItems,
            adminNotes,
          })
          setSuccess(`Successfully approved ${selectedItems.length} withdrawals`)
        } else if (bulkAction === 'reject') {
          if (!rejectionReason) {
            setError('Rejection reason is required')
            return
          }
          await adminAPI.bulkRejectWithdrawals({
            withdrawalIds: selectedItems,
            rejectionReason,
            adminNotes,
          })
          setSuccess(`Successfully rejected ${selectedItems.length} withdrawals`)
        }
      } else {
        if (bulkAction === 'approve') {
          await adminAPI.bulkApproveDeposits({
            depositIds: selectedItems,
            adminNotes,
          })
          setSuccess(`Successfully approved ${selectedItems.length} deposits`)
        } else if (bulkAction === 'cancel') {
          await adminAPI.bulkCancelDeposits({
            depositIds: selectedItems,
            adminNotes,
          })
          setSuccess(`Successfully cancelled ${selectedItems.length} deposits`)
        }
      }
      setSelectedItems([])
      setShowBulkModal(false)
      setBulkAction('')
      setRejectionReason('')
      setAdminNotes('')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk operation failed')
      log.apiError('/admin/bulk-action', err)
    }
  }

  const handleExport = async () => {
    try {
      const params = {}
      if (statusFilter && statusFilter !== 'Status: All') params.status = statusFilter
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (paymentMethodFilter && paymentMethodFilter !== 'all') params.paymentMethod = paymentMethodFilter

      const response = activeTab === 'withdrawals'
        ? await adminAPI.exportWithdrawals(params)
        : await adminAPI.exportDeposits(params)
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${activeTab}-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setSuccess(`${activeTab === 'withdrawals' ? 'Withdrawals' : 'Deposits'} exported successfully`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export')
      log.apiError('/admin/export', err)
    }
  }

  const filteredTransactions = (activeTab === 'withdrawals' ? withdrawals : deposits).filter((item) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      item.user?.username?.toLowerCase().includes(searchLower) ||
      item.user?.email?.toLowerCase().includes(searchLower) ||
      item._id?.toString().toLowerCase().includes(searchLower)
    )
  })

  const pendingTotal = (activeTab === 'withdrawals' ? withdrawals : deposits)
    .filter((item) => item.status === 'pending')
    .reduce((sum, item) => sum + (item.amount || 0), 0)

  return (
    <div className="flex min-h-screen w-full bg-background-dark">
      {/* SideNavBar */}
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

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark">
        <div className="layout-content-container flex flex-col w-full max-w-7xl mx-auto">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <p className="text-black dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
              {activeTab === 'withdrawals' ? 'Çekim Havuzu' : 'Yatırım Havuzu'}
            </p>
            <div className="flex items-center gap-2">
              {selectedItems.length > 0 && (
                <>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-yellow-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-yellow-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    <span className="truncate">Bulk Action ({selectedItems.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-gray-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-600 transition-colors"
                  >
                    <span className="truncate">Clear</span>
                  </button>
                </>
              )}
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-green-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="truncate">Export CSV</span>
              </button>
            </div>
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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white/5 border border-white/10">
              <p className="text-white/70 text-base font-medium leading-normal">
                {activeTab === 'withdrawals' ? 'Toplam Bekleyen Çekimler' : 'Toplam Bekleyen Yatırımlar'}
              </p>
              <p className="text-white tracking-light text-2xl font-bold leading-tight">
                ₺{pendingTotal.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white/5 border border-white/10">
              <p className="text-white/70 text-base font-medium leading-normal">Toplam Kayıt</p>
              <p className="text-white tracking-light text-2xl font-bold leading-tight">{total}</p>
            </div>
          </div>

          <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10">
            {/* Tabs */}
            <div className="pb-3">
              <div className="flex border-b border-white/10 px-4 gap-8">
                <button
                  onClick={() => {
                    setActiveTab('deposits')
                    setCurrentPage(1)
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                    activeTab === 'deposits'
                      ? 'border-b-[#0dccf2] text-[#0dccf2]'
                      : 'border-b-transparent text-white/50'
                  }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Yatırımlar</p>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('withdrawals')
                    setCurrentPage(1)
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                    activeTab === 'withdrawals'
                      ? 'border-b-[#0dccf2] text-[#0dccf2]'
                      : 'border-b-transparent text-white/50'
                  }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Çekimler</p>
                </button>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="p-4 flex flex-col lg:flex-row gap-4">
              {/* SearchBar */}
              <div className="flex-grow">
                <label className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-white/50 flex border-none bg-white/5 items-center justify-center pl-4 rounded-l-lg border-r-0">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#0dccf2]/50 border-none bg-white/5 h-full placeholder:text-white/50 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                      placeholder="Kullanıcı adı, email veya ID ile ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      type="text"
                    />
                  </div>
                </label>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative">
                  <select
                    className="appearance-none form-select h-12 w-full lg:w-40 rounded-lg bg-white/5 border-none text-white focus:ring-2 focus:ring-[#0dccf2]/50 pl-4 pr-10"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="Status: All" className="bg-[#1E1E2B] text-white">Durum: Tümü</option>
                    <option value="pending" className="bg-[#1E1E2B] text-white">Beklemede</option>
                    <option value="approved" className="bg-[#1E1E2B] text-white">Onaylandı</option>
                    <option value="rejected" className="bg-[#1E1E2B] text-white">Reddedildi</option>
                    <option value="cancelled" className="bg-[#1E1E2B] text-white">İptal Edildi</option>
                  </select>
                  <span className="material-symbols-outlined text-white/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    expand_more
                  </span>
                </div>
                <div className="relative">
                  <select
                    className="appearance-none form-select h-12 w-full lg:w-40 rounded-lg bg-white/5 border-none text-white focus:ring-2 focus:ring-[#0dccf2]/50 pl-4 pr-10"
                    value={paymentMethodFilter}
                    onChange={(e) => {
                      setPaymentMethodFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="all" className="bg-[#1E1E2B] text-white">Payment: All</option>
                    <option value="IBAN" className="bg-[#1E1E2B] text-white">IBAN</option>
                    <option value="Banka Havalesi" className="bg-[#1E1E2B] text-white">Banka Havalesi</option>
                    <option value="Papara" className="bg-[#1E1E2B] text-white">Papara</option>
                    <option value="Credit Card" className="bg-[#1E1E2B] text-white">Credit Card</option>
                  </select>
                  <span className="material-symbols-outlined text-white/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    expand_more
                  </span>
                </div>
                {showDateRange ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-12 rounded-lg bg-white/5 px-4 text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-12 rounded-lg bg-white/5 px-4 text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                      placeholder="End Date"
                    />
                    <button
                      onClick={() => {
                        setShowDateRange(false)
                        setStartDate('')
                        setEndDate('')
                      }}
                      className="h-12 w-12 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-white/50">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDateRange(true)}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-white/5 px-4 hover:bg-white/10 transition-colors text-white/80"
                  >
                    <span className="material-symbols-outlined">calendar_month</span>
                    <span className="text-sm">Date Range</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('Status: All')
                    setPaymentMethodFilter('all')
                    setStartDate('')
                    setEndDate('')
                    setShowDateRange(false)
                    setMinAmount('')
                    setMaxAmount('')
                  }}
                  className="flex h-12 items-center justify-center gap-2 rounded-lg bg-transparent px-4 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                  <span className="text-sm">Clear Filters</span>
                </button>
              </div>
            </div>

            {/* Data Table */}
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-white/50">Yükleniyor...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-white/80">
                  <thead className="text-xs text-white/50 uppercase bg-black/20">
                    <tr>
                      <th className="px-6 py-3" scope="col">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === (activeTab === 'withdrawals' ? withdrawals : deposits).filter(item => item.status === 'pending').length && (activeTab === 'withdrawals' ? withdrawals : deposits).filter(item => item.status === 'pending').length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-white/20 bg-transparent"
                        />
                      </th>
                      <th className="px-6 py-3" scope="col">ID</th>
                      <th className="px-6 py-3" scope="col">Kullanıcı</th>
                      <th className="px-6 py-3" scope="col">Tutar</th>
                      <th className="px-6 py-3" scope="col">Yöntem</th>
                      {activeTab === 'withdrawals' && <th className="px-6 py-3" scope="col">IBAN</th>}
                      <th className="px-6 py-3" scope="col">Tarih</th>
                      <th className="px-6 py-3" scope="col">Durum</th>
                      <th className="px-6 py-3 text-center" scope="col">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'withdrawals' ? 9 : 8} className="px-6 py-8 text-center text-white/50">
                          {activeTab === 'withdrawals' ? 'Bekleyen çekim talebi bulunmamaktadır.' : 'Bekleyen yatırım talebi bulunmamaktadır.'}
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((item) => (
                        <tr key={item._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            {item.status === 'pending' && (
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item._id)}
                                onChange={() => handleSelectItem(item._id)}
                                className="rounded border-white/20 bg-transparent"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-white/60">{item._id.toString().substring(0, 8)}...</td>
                          <td className="px-6 py-4 font-medium text-white">
                            {item.user?.username || item.user?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">₺{item.amount?.toFixed(2)}</td>
                          <td className="px-6 py-4">{item.paymentMethod || 'IBAN'}</td>
                          {activeTab === 'withdrawals' && (
                            <td className="px-6 py-4 text-sm text-white/60">{item.iban?.substring(0, 12)}...</td>
                          )}
                          <td className="px-6 py-4">{formatDate(item.createdAt)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {getStatusText(item.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.status === 'pending' ? (
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <button
                                  onClick={() => {
                                    setSelectedItem(item)
                                    setShowModal(true)
                                  }}
                                  className="px-3 py-1 text-xs font-bold text-black bg-green-400 rounded-md hover:bg-green-500 transition-colors"
                                >
                                  Onayla
                                </button>
                                {activeTab === 'withdrawals' ? (
                                  <button
                                    onClick={() => handleReject(item._id)}
                                    className="px-3 py-1 text-xs font-bold text-white bg-red-500/80 rounded-md hover:bg-red-500 transition-colors"
                                  >
                                    Reddet
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleCancel(item._id)}
                                    className="px-3 py-1 text-xs font-bold text-white bg-red-500/80 rounded-md hover:bg-red-500 transition-colors"
                                  >
                                    İptal
                                  </button>
                                )}
                                {activeTab === 'withdrawals' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedUser(item.user?._id || item.user)
                                        setIbanData({
                                          iban: item.iban || item.user?.iban || '',
                                          ibanHolderName: item.ibanHolderName || item.user?.ibanHolderName || '',
                                          bankName: item.bankName || item.user?.bankName || ''
                                        })
                                        setShowIbanModal(true)
                                      }}
                                      className="px-3 py-1 text-xs font-bold text-white bg-blue-500/80 rounded-md hover:bg-blue-500 transition-colors"
                                      title="Edit IBAN"
                                    >
                                      IBAN
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedUser(item.user?._id || item.user)
                                        setBalanceData({ amount: '', type: 'add', description: '' })
                                        setShowBalanceModal(true)
                                      }}
                                      className="px-3 py-1 text-xs font-bold text-white bg-purple-500/80 rounded-md hover:bg-purple-500 transition-colors"
                                      title="Update Balance"
                                    >
                                      Bakiye
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="text-center text-white/50 italic">Tamamlandı</div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-white/10">
                <span className="text-sm text-white/50">
                  Sayfa {currentPage} / {totalPages} (Toplam {total} kayıt)
                </span>
                <div className="inline-flex items-center -space-x-px text-sm">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-white/60 bg-white/5 border border-white/10 rounded-l-lg hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Önceki
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`flex items-center justify-center px-3 h-8 leading-tight border border-white/10 transition-colors ${
                          currentPage === page
                            ? 'text-white bg-[#0dccf2]/20 border-[#0dccf2]/50 hover:bg-[#0dccf2]/30'
                            : 'text-white/60 bg-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center px-3 h-8 leading-tight text-white/60 bg-white/5 border border-white/10 rounded-r-lg hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Approval Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-white text-xl font-bold mb-4">
              {activeTab === 'withdrawals' ? 'Çekim Onayla' : 'Yatırım Onayla'}
            </h3>
            <div className="mb-4">
              <p className="text-white/70 text-sm mb-2">Kullanıcı: {selectedItem.user?.username || selectedItem.user?.email}</p>
              <p className="text-white/70 text-sm mb-2">Tutar: ₺{selectedItem.amount?.toFixed(2)}</p>
              {activeTab === 'withdrawals' && (
                <p className="text-white/70 text-sm mb-2">IBAN: {selectedItem.iban}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">Admin Notu (Opsiyonel)</label>
              <textarea
                className="w-full h-24 rounded-lg bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Not ekleyin..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(selectedItem._id)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Onayla
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  setAdminNotes('')
                  setSelectedItem(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IBAN Edit Modal */}
      {showIbanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-white text-xl font-bold mb-4">Edit User IBAN</h3>
            <div className="mb-4">
              <p className="text-white/70 text-sm mb-2">
                User: {typeof selectedUser === 'object' ? (selectedUser.username || selectedUser.email) : 'N/A'}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">IBAN *</label>
              <input
                type="text"
                value={ibanData.iban}
                onChange={(e) => setIbanData({ ...ibanData, iban: e.target.value })}
                className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                placeholder="TR00 0000 0000 0000 0000 0000 00"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">IBAN Holder Name *</label>
              <input
                type="text"
                value={ibanData.ibanHolderName}
                onChange={(e) => setIbanData({ ...ibanData, ibanHolderName: e.target.value })}
                className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                placeholder="Account Holder Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">Bank Name (Optional)</label>
              <input
                type="text"
                value={ibanData.bankName}
                onChange={(e) => setIbanData({ ...ibanData, bankName: e.target.value })}
                className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                placeholder="Bank Name"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const userId = typeof selectedUser === 'object' ? selectedUser._id : selectedUser
                    await adminAPI.updateUserIban(userId, ibanData)
                    setSuccess('IBAN updated successfully')
                    setShowIbanModal(false)
                    setSelectedUser(null)
                    setIbanData({ iban: '', ibanHolderName: '', bankName: '' })
                    fetchData()
                    setTimeout(() => setSuccess(''), 3000)
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to update IBAN')
                  }
                }}
                disabled={!ibanData.iban || !ibanData.ibanHolderName}
                className="flex-1 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update IBAN
              </button>
              <button
                onClick={() => {
                  setShowIbanModal(false)
                  setSelectedUser(null)
                  setIbanData({ iban: '', ibanHolderName: '', bankName: '' })
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Update Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-white text-xl font-bold mb-4">Update User Balance</h3>
            <div className="mb-4">
              <p className="text-white/70 text-sm mb-2">
                User: {typeof selectedUser === 'object' ? (selectedUser.username || selectedUser.email) : 'N/A'}
              </p>
              {typeof selectedUser === 'object' && selectedUser.balance !== undefined && (
                <p className="text-white/70 text-sm mb-2">
                  Current Balance: ₺{selectedUser.balance?.toFixed(2) || '0.00'}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">Amount *</label>
              <input
                type="number"
                value={balanceData.amount}
                onChange={(e) => setBalanceData({ ...balanceData, amount: e.target.value })}
                className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">Type *</label>
              <select
                value={balanceData.type}
                onChange={(e) => setBalanceData({ ...balanceData, type: e.target.value })}
                className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              >
                <option value="add">Add (Credit)</option>
                <option value="subtract">Subtract (Debit)</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">Description (Optional)</label>
              <textarea
                value={balanceData.description}
                onChange={(e) => setBalanceData({ ...balanceData, description: e.target.value })}
                className="w-full h-24 rounded-lg bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                placeholder="Transaction description..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const userId = typeof selectedUser === 'object' ? selectedUser._id : selectedUser
                    await adminAPI.updateUserBalance(userId, balanceData)
                    setSuccess(`Balance ${balanceData.type === 'add' ? 'added' : 'subtracted'} successfully`)
                    setShowBalanceModal(false)
                    setSelectedUser(null)
                    setBalanceData({ amount: '', type: 'add', description: '' })
                    fetchData()
                    setTimeout(() => setSuccess(''), 3000)
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to update balance')
                  }
                }}
                disabled={!balanceData.amount || parseFloat(balanceData.amount) <= 0}
                className="flex-1 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Balance
              </button>
              <button
                onClick={() => {
                  setShowBalanceModal(false)
                  setSelectedUser(null)
                  setBalanceData({ amount: '', type: 'add', description: '' })
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-white text-xl font-bold mb-4">Bulk Action</h3>
            <div className="mb-4">
              <p className="text-white/70 text-sm mb-4">
                {activeTab === 'withdrawals' ? 'Withdrawals' : 'Deposits'}: <span className="font-bold text-white">{selectedItems.length}</span> selected
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">Action</label>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              >
                <option value="">Select Action</option>
                <option value="approve">Approve</option>
                {activeTab === 'withdrawals' ? (
                  <option value="reject">Reject</option>
                ) : (
                  <option value="cancel">Cancel</option>
                )}
              </select>
            </div>
            {bulkAction === 'reject' && (
              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-24 rounded-lg bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  placeholder="Enter rejection reason..."
                  required
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">Admin Notes (Optional)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full h-24 rounded-lg bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                placeholder="Add notes..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || (bulkAction === 'reject' && !rejectionReason)}
                className="flex-1 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkAction === 'approve' ? 'Approve' : bulkAction === 'reject' ? 'Reject' : 'Cancel'} {selectedItems.length} Items
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false)
                  setBulkAction('')
                  setRejectionReason('')
                  setAdminNotes('')
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DepositsWithdrawalsPage() {
  return (
    <AdminProtectedRoute>
      <DepositsWithdrawals />
    </AdminProtectedRoute>
  )
}
