'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import AdminSidebar from '@/components/AdminSidebar'
import { kycAPI } from '@/lib/api'
import { formatDate } from '@/utils/formatters'
import { log } from '@/utils/logger'

function KYCManagement() {
  const pathname = usePathname()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedKYC, setSelectedKYC] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

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

  useEffect(() => {
    loadKYC()
  }, [currentPage, searchQuery, statusFilter])

  const loadKYC = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await kycAPI.getAllKYC()
      
      let kycData = []
      if (response.data?.success && response.data?.data) {
        kycData = Array.isArray(response.data.data) ? response.data.data : []
      } else if (Array.isArray(response.data)) {
        kycData = response.data
      }

      // Apply filters
      let filtered = kycData
      if (searchQuery) {
        filtered = filtered.filter(item => 
          item.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      if (statusFilter !== 'All') {
        filtered = filtered.filter(item => 
          (item.status || 'pending').toLowerCase() === statusFilter.toLowerCase()
        )
      }

      // Pagination
      const itemsPerPage = 50
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginated = filtered.slice(startIndex, endIndex)
      
      setData(paginated)
      setTotal(filtered.length)
      setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    } catch (err) {
       if (process.env.NODE_ENV === 'development') {
         console.error("KYC load error:", err)
       }
      setError(err.response?.data?.message || 'Failed to load KYC data')
      setData([])
      log.apiError('/admin/kyc', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedKYC || !newStatus) return

    try {
      setError('')
      await kycAPI.updateKYCStatus(selectedKYC._id, newStatus)
      setSuccess('KYC status updated successfully')
      setShowStatusModal(false)
      setSelectedKYC(null)
      setNewStatus('')
      loadKYC()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update KYC status')
      log.apiError(`/admin/kyc/${selectedKYC._id}`, err)
    }
  }

  const openStatusModal = (kyc) => {
    setSelectedKYC(kyc)
    setNewStatus(kyc.status || 'pending')
    setShowStatusModal(true)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
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
    if (!status) return 'Pending'
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  const resultsPerPage = 50
  const startResult = (currentPage - 1) * resultsPerPage + 1
  const endResult = Math.min(currentPage * resultsPerPage, total)

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen w-full bg-background-dark">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark ml-0 lg:ml-64">
          <div className="flex-1 p-8">
            <div className="w-full max-w-7xl mx-auto">
              {/* Page Heading */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">KYC Management</p>
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

              {/* Controls: SearchBar and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                      <div className="text-[#9cb5ba] flex border-none bg-[#111718] items-center justify-center pl-4 rounded-l-xl border-r-0">
                        <span className="material-symbols-outlined">search</span>
                      </div>
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-white focus:outline-0 focus:ring-2 focus:ring-[#0dccf2]/50 border-none bg-[#111718] h-full placeholder:text-[#9cb5ba] px-4 text-base font-normal leading-normal"
                        placeholder="Search by Username, Email..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            loadKYC()
                          }
                        }}
                        type="text"
                      />
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#111718] px-4 text-white text-sm font-medium hover:bg-[#1b2527] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="All">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('All')
                    }}
                    className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-transparent px-4 text-[#9cb5ba] hover:bg-[#111718] hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                    <p className="text-sm font-medium leading-normal">Clear Filters</p>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="w-full @container">
                <div className="flex overflow-hidden rounded-xl border border-[#3b5054] bg-[#111718]">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#1b2527]">
                        <th className="px-6 py-4 text-left text-white text-xs font-medium uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-white text-xs font-medium uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-white text-xs font-medium uppercase tracking-wider">
                          Submitted Date
                        </th>
                        <th className="px-6 py-4 text-left text-white text-xs font-medium uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-white text-xs font-medium uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3b5054]">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-[#9cb5ba]">
                            <div className="flex items-center justify-center">
                              <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent"></div>
                            </div>
                          </td>
                        </tr>
                      ) : data.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-[#9cb5ba]">
                            No KYC submissions found
                          </td>
                        </tr>
                      ) : (
                        data.map((item) => (
                          <tr key={item._id} className="hover:bg-[#1b2527] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-white text-sm font-medium">
                              {item.user?.username || 'Unknown User'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#9cb5ba] text-sm">
                              {item.user?.email || 'No email'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#9cb5ba] text-sm">
                              {item.createdAt ? formatDate(item.createdAt) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {getStatusText(item.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openStatusModal(item)}
                                  className="text-[#0dccf2] hover:text-[#0dccf2]/80 transition-colors"
                                  title="Update Status"
                                >
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-[#9cb5ba]">
                    Showing <span className="font-medium text-white">{startResult}</span> to{' '}
                    <span className="font-medium text-white">{endResult}</span> of{' '}
                    <span className="font-medium text-white">{total}</span> results
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#111718] text-white hover:bg-[#0dccf2]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-xl">chevron_left</span>
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-[#0dccf2] text-[#111718]'
                              : 'bg-[#111718] text-white hover:bg-[#0dccf2]/20'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    {totalPages > 5 && <span className="text-white">...</span>}
                    {totalPages > 5 && (
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'bg-[#0dccf2] text-[#111718]'
                            : 'bg-[#111718] text-white hover:bg-[#0dccf2]/20'
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#111718] text-white hover:bg-[#0dccf2]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-xl">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status Update Modal */}
              {showStatusModal && selectedKYC && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-[#111718] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
                    <h3 className="text-white text-xl font-bold mb-4">Update KYC Status</h3>
                    <div className="mb-4">
                      <p className="text-white/70 text-sm mb-2">
                        User: {selectedKYC.user?.username || selectedKYC.user?.email || 'Unknown'}
                      </p>
                      <p className="text-white/70 text-sm mb-4">
                        Current Status: <span className="text-white">{getStatusText(selectedKYC.status)}</span>
                      </p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-white/70 text-sm mb-2">New Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleStatusUpdate}
                        className="flex-1 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => {
                          setShowStatusModal(false)
                          setSelectedKYC(null)
                          setNewStatus('')
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
           </div>
         </main>
       </div>
     </AdminProtectedRoute>
   )
 }
 
 export default KYCManagement
