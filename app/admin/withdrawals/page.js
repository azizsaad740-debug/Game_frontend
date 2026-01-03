'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { adminAPI } from '@/lib/api'
import { formatDate } from '@/utils/formatters'
import { log } from '@/utils/logger'
import { useTranslation } from '@/hooks/useTranslation'
import AdminSidebar from '@/components/AdminSidebar'

function WithdrawalsPage() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [withdrawals, setWithdrawals] = useState([])
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
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [showIbanModal, setShowIbanModal] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [ibanData, setIbanData] = useState({ iban: '', ibanHolderName: '', bankName: '' })
  const [balanceData, setBalanceData] = useState({ amount: '', type: 'add', description: '' })


  useEffect(() => {
    fetchData()
  }, [statusFilter, currentPage, startDate, endDate, paymentMethodFilter])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = {
        status: statusFilter === 'Status: All' ? undefined : statusFilter,
        page: currentPage,
        limit: 50,
      }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (paymentMethodFilter && paymentMethodFilter !== 'all') params.paymentMethod = paymentMethodFilter

      const response = await adminAPI.getWithdrawalPool(params)
      setWithdrawals(response.data.withdrawals || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load withdrawals')
      log.apiError('/admin/withdrawals', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'rejected':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Beklemede',
      approved: 'Onaylandı',
      rejected: 'Reddedildi'
    }
    return statusMap[status] || status
  }

  const handleApprove = async (withdrawalId) => {
    try {
      await adminAPI.approveWithdrawal(withdrawalId, { adminNotes })
      setSuccess('Withdrawal approved successfully')
      setShowModal(false)
      setAdminNotes('')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve withdrawal')
    }
  }

  const handleReject = async (withdrawalId) => {
    try {
      await adminAPI.rejectWithdrawal(withdrawalId, { reason: rejectionReason })
      setSuccess('Withdrawal rejected successfully')
      setShowModal(false)
      setRejectionReason('')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject withdrawal')
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return
    
    try {
      if (bulkAction === 'approve') {
        await adminAPI.bulkApproveWithdrawals({ withdrawalIds: selectedItems })
        setSuccess(`Successfully approved ${selectedItems.length} withdrawals`)
      } else if (bulkAction === 'reject') {
        await adminAPI.bulkRejectWithdrawals({ withdrawalIds: selectedItems, reason: rejectionReason })
        setSuccess(`Successfully rejected ${selectedItems.length} withdrawals`)
      }
      setShowBulkModal(false)
      setSelectedItems([])
      setBulkAction('')
      setRejectionReason('')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to perform bulk action')
    }
  }

  const handleUpdateIban = async () => {
    if (!selectedUser || !ibanData.iban) return
    
    try {
      await adminAPI.updateUserIban(selectedUser, ibanData)
      setSuccess('IBAN updated successfully')
      setShowIbanModal(false)
      setIbanData({ iban: '', ibanHolderName: '', bankName: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update IBAN')
    }
  }

  const handleUpdateBalance = async () => {
    if (!selectedUser || !balanceData.amount) return
    
    try {
      await adminAPI.updateUserBalance(selectedUser, {
        amount: parseFloat(balanceData.amount),
        type: balanceData.type,
        description: balanceData.description
      })
      setSuccess('Balance updated successfully')
      setShowBalanceModal(false)
      setBalanceData({ amount: '', type: 'add', description: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update balance')
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['ID', 'User', 'Amount', 'IBAN', 'Status', 'Date'].join(','),
      ...withdrawals.map(w => [
        w._id || w.id,
        w.user?.username || w.user?.email || 'N/A',
        w.amount,
        w.iban || 'N/A',
        w.status,
        formatDate(w.createdAt)
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `withdrawals_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const pendingTotal = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0)

  const filteredWithdrawals = withdrawals.filter(w => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const username = w.user?.username?.toLowerCase() || ''
      const email = w.user?.email?.toLowerCase() || ''
      const id = (w._id || w.id || '').toString().toLowerCase()
      return username.includes(query) || email.includes(query) || id.includes(query)
    }
    return true
  })

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen w-full bg-background-dark">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark ml-0 lg:ml-64">
        <div className="flex flex-col w-full max-w-7xl mx-auto">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <p className="text-black dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
              {t('admin.withdrawalManagement')}
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
              <p className="text-white/70 text-base font-medium leading-normal">Total Pending Withdrawals</p>
              <p className="text-white tracking-light text-2xl font-bold leading-tight">₺{pendingTotal.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white/5 border border-white/10">
              <p className="text-white/70 text-base font-medium leading-normal">Total Records</p>
              <p className="text-white tracking-light text-2xl font-bold leading-tight">{total}</p>
            </div>
          </div>

          <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10">
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
                      placeholder="Search by username, email, or ID..."
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
                    <option value="Status: All" className="bg-[#1E1E2B] text-white">Status: All</option>
                    <option value="pending" className="bg-[#1E1E2B] text-white">Pending</option>
                    <option value="approved" className="bg-[#1E1E2B] text-white">Approved</option>
                    <option value="rejected" className="bg-[#1E1E2B] text-white">Rejected</option>
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
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-12 rounded-lg bg-white/5 px-4 text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
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
                    className="h-12 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined">calendar_today</span>
                    Date Range
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-xl border border-[#3b5054] bg-[#111718]">
                {loading ? (
                  <div className="flex items-center justify-center w-full py-12">
                    <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent"></div>
                  </div>
                ) : filteredWithdrawals.length === 0 ? (
                  <div className="text-center w-full py-12">
                    <p className="text-gray-400">No withdrawals found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#1b2527]">
                        <th className="px-4 py-3 text-left text-white text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={selectedItems.length === filteredWithdrawals.filter(w => w.status === 'pending').length && filteredWithdrawals.filter(w => w.status === 'pending').length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(filteredWithdrawals.filter(w => w.status === 'pending').map(w => w._id || w.id))
                              } else {
                                setSelectedItems([])
                              }
                            }}
                            className="rounded border-white/20 bg-transparent"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-white text-sm font-medium">User</th>
                        <th className="px-4 py-3 text-left text-white text-sm font-medium">Amount</th>
                        <th className="px-4 py-3 text-left text-white text-sm font-medium">IBAN</th>
                        <th className="px-4 py-3 text-left text-white text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-white text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-white text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWithdrawals.map((withdrawal) => (
                        <tr key={withdrawal._id || withdrawal.id} className="border-t border-t-[#3b5054] hover:bg-[#1b2527]/50 transition-colors">
                          <td className="h-[72px] px-4 py-2">
                            {withdrawal.status === 'pending' && (
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(withdrawal._id || withdrawal.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, withdrawal._id || withdrawal.id])
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== (withdrawal._id || withdrawal.id)))
                                  }
                                }}
                                className="rounded border-white/20 bg-transparent"
                              />
                            )}
                          </td>
                          <td className="h-[72px] px-4 py-2 text-white text-sm font-normal">
                            {withdrawal.user?.username || withdrawal.user?.email || 'N/A'}
                          </td>
                          <td className="h-[72px] px-4 py-2 text-white text-sm font-normal">₺{parseFloat(withdrawal.amount || 0).toFixed(2)}</td>
                          <td className="h-[72px] px-4 py-2 text-white text-sm font-normal">{withdrawal.iban ? `${withdrawal.iban.substring(0, 12)}...` : 'N/A'}</td>
                          <td className="h-[72px] px-4 py-2">
                            <span className={`inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1 ${getStatusColor(withdrawal.status)}`}>
                              {getStatusText(withdrawal.status)}
                            </span>
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#9cb5ba] text-sm font-normal">{formatDate(withdrawal.createdAt)}</td>
                          <td className="h-[72px] px-4 py-2">
                            <div className="flex items-center gap-2">
                              {withdrawal.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedItem(withdrawal)
                                      setShowModal(true)
                                    }}
                                    className="p-2 text-green-400 hover:text-green-300 hover:bg-[#283639] rounded-md transition-colors"
                                    title="Approve"
                                  >
                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedItem(withdrawal)
                                      setShowModal(true)
                                    }}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-[#283639] rounded-md transition-colors"
                                    title="Reject"
                                  >
                                    <span className="material-symbols-outlined text-xl">cancel</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(withdrawal.user?._id || withdrawal.user)
                                      setIbanData({
                                        iban: withdrawal.iban || withdrawal.user?.iban || '',
                                        ibanHolderName: withdrawal.ibanHolderName || withdrawal.user?.ibanHolderName || '',
                                        bankName: withdrawal.bankName || withdrawal.user?.bankName || ''
                                      })
                                      setShowIbanModal(true)
                                    }}
                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-[#283639] rounded-md transition-colors"
                                    title="Edit IBAN"
                                  >
                                    <span className="material-symbols-outlined text-xl">account_balance</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(withdrawal.user?._id || withdrawal.user)
                                      setBalanceData({ amount: '', type: 'add', description: '' })
                                      setShowBalanceModal(true)
                                    }}
                                    className="p-2 text-purple-400 hover:text-purple-300 hover:bg-[#283639] rounded-md transition-colors"
                                    title="Update Balance"
                                  >
                                    <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                                  </button>
                                </>
                              )}
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
              <div className="px-4 py-4 flex items-center justify-between border-t border-[#3b5054]">
                <p className="text-[#9cb5ba] text-sm">
                  Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, total)} of {total} results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-white text-sm px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Action Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-white text-xl font-bold mb-4">Approve or Reject Withdrawal</h3>
            <div className="space-y-4">
              <div>
                <p className="text-white/70 text-sm mb-1">User: {selectedItem.user?.username || selectedItem.user?.email}</p>
                <p className="text-white/70 text-sm mb-1">Amount: ₺{parseFloat(selectedItem.amount || 0).toFixed(2)}</p>
                <p className="text-white/70 text-sm mb-4">IBAN: {selectedItem.iban || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Admin Notes (optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Rejection Reason (if rejecting)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedItem._id || selectedItem.id)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedItem._id || selectedItem.id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedItem(null)
                    setAdminNotes('')
                    setRejectionReason('')
                  }}
                  className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IBAN Modal */}
      {showIbanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-white text-xl font-bold mb-4">Update User IBAN</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">IBAN *</label>
                <input
                  type="text"
                  value={ibanData.iban}
                  onChange={(e) => setIbanData({...ibanData, iban: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">IBAN Holder Name</label>
                <input
                  type="text"
                  value={ibanData.ibanHolderName}
                  onChange={(e) => setIbanData({...ibanData, ibanHolderName: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Bank Name</label>
                <input
                  type="text"
                  value={ibanData.bankName}
                  onChange={(e) => setIbanData({...ibanData, bankName: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateIban}
                  className="flex-1 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowIbanModal(false)
                    setIbanData({ iban: '', ibanHolderName: '', bankName: '' })
                  }}
                  className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-white text-xl font-bold mb-4">Update User Balance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Amount *</label>
                <input
                  type="number"
                  value={balanceData.amount}
                  onChange={(e) => setBalanceData({...balanceData, amount: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Type *</label>
                <select
                  value={balanceData.type}
                  onChange={(e) => setBalanceData({...balanceData, type: e.target.value})}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                >
                  <option value="add" className="bg-[#1E1E2B] text-white">Add (Credit)</option>
                  <option value="subtract" className="bg-[#1E1E2B] text-white">Subtract (Debit)</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Description</label>
                <textarea
                  value={balanceData.description}
                  onChange={(e) => setBalanceData({...balanceData, description: e.target.value})}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateBalance}
                  className="flex-1 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowBalanceModal(false)
                    setBalanceData({ amount: '', type: 'add', description: '' })
                  }}
                  className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-white text-xl font-bold mb-4">
              Bulk Action for <span className="font-bold text-white">{selectedItems.length}</span> selected withdrawal(s)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Action</label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                >
                  <option value="" className="bg-[#1E1E2B] text-white">Select Action</option>
                  <option value="approve" className="bg-[#1E1E2B] text-white">Approve All</option>
                  <option value="reject" className="bg-[#1E1E2B] text-white">Reject All</option>
                </select>
              </div>
              {bulkAction === 'reject' && (
                <div>
                  <label className="block text-white/70 text-sm mb-2">Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                    rows={3}
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="flex-1 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50"
                >
                  Execute
                </button>
                <button
                  onClick={() => {
                    setShowBulkModal(false)
                    setBulkAction('')
                    setRejectionReason('')
                  }}
                  className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminProtectedRoute>
  )
}

export default WithdrawalsPage

