'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { adminAPI } from '@/lib/api'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { log } from '@/utils/logger'

function SupportPage() {
  const pathname = usePathname()
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stats, setStats] = useState(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Response modal
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [closeResolution, setCloseResolution] = useState('')

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
    fetchTickets()
    fetchStatistics()
  }, [statusFilter, categoryFilter, priorityFilter, searchQuery, currentPage])

  const fetchTickets = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 20,
      }
      
      if (statusFilter !== 'all') params.status = statusFilter
      if (categoryFilter !== 'all') params.category = categoryFilter
      if (priorityFilter !== 'all') params.priority = priorityFilter
      if (searchQuery) params.search = searchQuery

      const response = await adminAPI.getAllTickets(params)
      setTickets(response.data.tickets || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets')
      log.apiError('/support/tickets', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await adminAPI.getTicketStatistics()
      setStats(response.data)
    } catch (err) {
      log.apiError('/support/statistics', err)
    }
  }

  const fetchTicketDetails = async (id) => {
    try {
      const response = await adminAPI.getTicketById(id)
      setSelectedTicket(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details')
      log.apiError(`/support/tickets/${id}`, err)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedTicket) return
    
    setSaving(true)
    setError('')
    try {
      await adminAPI.updateTicketStatus(selectedTicket._id, { status: newStatus })
      setSuccess('Ticket status updated successfully!')
      setShowStatusModal(false)
      fetchTickets()
      if (selectedTicket) {
        fetchTicketDetails(selectedTicket._id)
      }
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
      log.apiError(`/support/tickets/${selectedTicket._id}/status`, err)
    } finally {
      setSaving(false)
    }
  }

  const handleRespond = async () => {
    if (!selectedTicket || !responseMessage.trim()) return
    
    setSaving(true)
    setError('')
    try {
      await adminAPI.respondToTicket(selectedTicket._id, { message: responseMessage })
      setSuccess('Response added successfully!')
      setShowResponseModal(false)
      setResponseMessage('')
      fetchTickets()
      fetchTicketDetails(selectedTicket._id)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add response')
      log.apiError(`/support/tickets/${selectedTicket._id}/respond`, err)
    } finally {
      setSaving(false)
    }
  }

  const handleCloseTicket = async () => {
    if (!selectedTicket) return
    
    setSaving(true)
    setError('')
    try {
      await adminAPI.closeTicket(selectedTicket._id, { resolution: closeResolution })
      setSuccess('Ticket closed successfully!')
      setShowCloseModal(false)
      setCloseResolution('')
      fetchTickets()
      fetchTicketDetails(selectedTicket._id)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close ticket')
      log.apiError(`/support/tickets/${selectedTicket._id}/close`, err)
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-400'
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'closed':
        return 'bg-gray-500/20 text-gray-400'
      case 'resolved':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400'
      case 'high':
        return 'bg-orange-500/20 text-orange-400'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'low':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      general: 'General',
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      betting: 'Betting',
      technical: 'Technical',
      account: 'Account',
      other: 'Other'
    }
    return labels[category] || category
  }

  return (
    <div className="flex min-h-screen w-full bg-background-dark">
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

      <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark overflow-y-auto">
        <div className="layout-content-container flex flex-col w-full max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <p className="text-black dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Support Tickets
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-4">
                <p className="text-gray-400 text-sm mb-1">Total</p>
                <p className="text-white text-2xl font-bold">{stats.total || 0}</p>
              </div>
              <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-4">
                <p className="text-gray-400 text-sm mb-1">Open</p>
                <p className="text-blue-400 text-2xl font-bold">{stats.open || 0}</p>
              </div>
              <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-4">
                <p className="text-gray-400 text-sm mb-1">In Progress</p>
                <p className="text-yellow-400 text-2xl font-bold">{stats.inProgress || 0}</p>
              </div>
              <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-4">
                <p className="text-gray-400 text-sm mb-1">Closed</p>
                <p className="text-gray-400 text-2xl font-bold">{stats.closed || 0}</p>
              </div>
              <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-4">
                <p className="text-gray-400 text-sm mb-1">Resolved</p>
                <p className="text-green-400 text-2xl font-bold">{stats.resolved || 0}</p>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-500/20 border border-green-500/50 p-4">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-2">
              <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="flex-1 min-w-[200px] h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                  
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="all" className="bg-[#1E1E2B]">All Status</option>
                    <option value="open" className="bg-[#1E1E2B]">Open</option>
                    <option value="in_progress" className="bg-[#1E1E2B]">In Progress</option>
                    <option value="closed" className="bg-[#1E1E2B]">Closed</option>
                    <option value="resolved" className="bg-[#1E1E2B]">Resolved</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="all" className="bg-[#1E1E2B]">All Categories</option>
                    <option value="general" className="bg-[#1E1E2B]">General</option>
                    <option value="deposit" className="bg-[#1E1E2B]">Deposit</option>
                    <option value="withdrawal" className="bg-[#1E1E2B]">Withdrawal</option>
                    <option value="betting" className="bg-[#1E1E2B]">Betting</option>
                    <option value="technical" className="bg-[#1E1E2B]">Technical</option>
                    <option value="account" className="bg-[#1E1E2B]">Account</option>
                    <option value="other" className="bg-[#1E1E2B]">Other</option>
                  </select>

                  {/* Priority Filter */}
                  <select
                    value={priorityFilter}
                    onChange={(e) => {
                      setPriorityFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="all" className="bg-[#1E1E2B]">All Priorities</option>
                    <option value="urgent" className="bg-[#1E1E2B]">Urgent</option>
                    <option value="high" className="bg-[#1E1E2B]">High</option>
                    <option value="medium" className="bg-[#1E1E2B]">Medium</option>
                    <option value="low" className="bg-[#1E1E2B]">Low</option>
                  </select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent"></div>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No tickets found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        onClick={() => {
                          setSelectedTicket(ticket)
                          fetchTicketDetails(ticket._id)
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedTicket?._id === ticket._id
                            ? 'bg-[#0dccf2]/20 border-[#0dccf2]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-white font-medium">{ticket.subject}</p>
                            <p className="text-gray-400 text-sm">
                              {ticket.user?.username || ticket.user?.email || 'Unknown User'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{getCategoryLabel(ticket.category)}</span>
                          <span>{formatDate(ticket.createdAt)}</span>
                          {ticket.assignedTo && (
                            <span>Assigned to: {ticket.assignedTo.username}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                    <p className="text-gray-400 text-sm">
                      Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, total)} of {total} tickets
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-white px-4">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Details */}
            <div className="lg:col-span-1">
              {selectedTicket ? (
                <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-white text-lg font-semibold">Ticket Details</h3>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Subject</p>
                      <p className="text-white">{selectedTicket.subject}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">User</p>
                      <p className="text-white">
                        {selectedTicket.user?.firstName} {selectedTicket.user?.lastName}
                      </p>
                      <p className="text-gray-400 text-sm">{selectedTicket.user?.email}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">Priority</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">Category</p>
                      <p className="text-white">{getCategoryLabel(selectedTicket.category)}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">Created</p>
                      <p className="text-white">{formatDateTime(selectedTicket.createdAt)}</p>
                    </div>

                    {selectedTicket.assignedTo && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Assigned To</p>
                        <p className="text-white">{selectedTicket.assignedTo.username}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-gray-400 text-sm mb-2">Initial Message</p>
                      <p className="text-white text-sm bg-white/5 p-3 rounded-lg">
                        {selectedTicket.message}
                      </p>
                    </div>

                    {/* Responses */}
                    {selectedTicket.responses && selectedTicket.responses.length > 1 && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-gray-400 text-sm mb-2">Conversation</p>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {selectedTicket.responses.slice(1).map((response, idx) => (
                            <div key={idx} className="bg-white/5 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white text-sm font-medium">
                                  {response.user?.username || 'User'}
                                  {response.isAdmin && (
                                    <span className="ml-2 text-[#0dccf2] text-xs">(Admin)</span>
                                  )}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {formatDateTime(response.createdAt)}
                                </p>
                              </div>
                              <p className="text-gray-300 text-sm">{response.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                        <>
                          <button
                            onClick={() => {
                              setShowResponseModal(true)
                              setResponseMessage('')
                            }}
                            className="w-full px-4 py-2 rounded-lg bg-[#0dccf2] text-white font-medium hover:bg-[#0bb5d9] transition-colors"
                          >
                            Respond
                          </button>
                          <button
                            onClick={() => {
                              setShowStatusModal(true)
                              setNewStatus(selectedTicket.status)
                            }}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                          >
                            Change Status
                          </button>
                          <button
                            onClick={() => {
                              setShowCloseModal(true)
                              setCloseResolution('')
                            }}
                            className="w-full px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-medium hover:bg-red-500/30 transition-colors"
                          >
                            Close Ticket
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1E1E2B]/50 dark:bg-black/20 rounded-xl border border-white/10 p-6">
                  <p className="text-gray-400 text-center">Select a ticket to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-white text-xl font-semibold mb-4">Respond to Ticket</h3>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={6}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              placeholder="Enter your response..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleRespond}
                disabled={saving || !responseMessage.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-[#0dccf2] text-white font-medium hover:bg-[#0bb5d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Sending...' : 'Send Response'}
              </button>
              <button
                onClick={() => {
                  setShowResponseModal(false)
                  setResponseMessage('')
                }}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-white text-xl font-semibold mb-4">Change Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
            >
              <option value="open" className="bg-[#1E1E2B]">Open</option>
              <option value="in_progress" className="bg-[#1E1E2B]">In Progress</option>
              <option value="resolved" className="bg-[#1E1E2B]">Resolved</option>
              <option value="closed" className="bg-[#1E1E2B]">Closed</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleStatusChange}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-[#0dccf2] text-white font-medium hover:bg-[#0bb5d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Updating...' : 'Update Status'}
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setNewStatus('')
                }}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-white text-xl font-semibold mb-4">Close Ticket</h3>
            <textarea
              value={closeResolution}
              onChange={(e) => setCloseResolution(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
              placeholder="Resolution notes (optional)..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleCloseTicket}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Closing...' : 'Close Ticket'}
              </button>
              <button
                onClick={() => {
                  setShowCloseModal(false)
                  setCloseResolution('')
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
  )
}

export default function SupportPageWrapper() {
  return (
    <AdminProtectedRoute>
      <SupportPage />
    </AdminProtectedRoute>
  )
}
