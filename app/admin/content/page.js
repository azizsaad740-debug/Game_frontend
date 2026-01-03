'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import AdminSidebar from '@/components/AdminSidebar'
import { adminAPI } from '@/lib/api'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { log } from '@/utils/logger'

function ContentManagement() {
  const pathname = usePathname()
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Filters
  const [activeTab, setActiveTab] = useState('banners')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image: '',
    link: '',
    author: '',
    featuredImage: '',
    category: '',
    order: 0,
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
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

  const tabs = [
    { id: 'banners', label: 'Banners', type: 'banner' },
    { id: 'news', label: 'News', type: 'news' },
    { id: 'faqs', label: 'FAQs', type: 'faq' },
    { id: 'static-pages', label: 'Static Pages', type: 'static_page' },
  ]

  useEffect(() => {
    fetchContent()
  }, [activeTab, statusFilter, searchQuery, currentPage])

  const getContentType = () => {
    const tab = tabs.find(t => t.id === activeTab)
    return tab ? tab.type : 'banner'
  }

  const fetchContent = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        type: getContentType(),
        page: currentPage,
        limit: 20,
      }
      
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await adminAPI.getContent(params)
      setContent(response.data.content || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load content')
      log.apiError('/admin/content', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    setSaving(true)
    setError('')
    try {
      const contentType = getContentType()
      await adminAPI.createContent({
        ...formData,
        type: contentType,
      })
      setSuccess('Content created successfully!')
      setShowAddModal(false)
      resetForm()
      fetchContent()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create content')
      log.apiError('/admin/content', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedContent) return
    
    setSaving(true)
    setError('')
    try {
      await adminAPI.updateContent(selectedContent._id, formData)
      setSuccess('Content updated successfully!')
      setShowEditModal(false)
      setSelectedContent(null)
      resetForm()
      fetchContent()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update content')
      log.apiError(`/admin/content/${selectedContent._id}`, err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedContent) return
    
    setSaving(true)
    setError('')
    try {
      await adminAPI.deleteContent(selectedContent._id)
      setSuccess('Content deleted successfully!')
      setShowDeleteModal(false)
      setSelectedContent(null)
      fetchContent()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete content')
      log.apiError(`/admin/content/${selectedContent._id}`, err)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image: '',
      link: '',
      author: '',
      featuredImage: '',
      category: '',
      order: 0,
      status: 'draft',
      metaTitle: '',
      metaDescription: '',
    })
  }

  const openEditModal = (item) => {
    setSelectedContent(item)
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      content: item.content || '',
      excerpt: item.excerpt || '',
      image: item.image || '',
      link: item.link || '',
      author: item.author || '',
      featuredImage: item.featuredImage || '',
      category: item.category || '',
      order: item.order || 0,
      status: item.status || 'draft',
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
    })
    setShowEditModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-400'
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'archived':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getCreateButtonLabel = () => {
    const tab = tabs.find(t => t.id === activeTab)
    return `Create New ${tab?.label || 'Content'}`
  }

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen w-full bg-background-dark">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark ml-0 lg:ml-64">
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
            {/* PageHeading */}
            <div className="flex flex-wrap justify-between gap-4 items-start">
              <div className="flex flex-col gap-2">
                <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Content Management</p>
                <p className="text-[#9cb5ba] text-base font-normal leading-normal">
                  Manage promotional banners, news, FAQs, and static pages.
                </p>
              </div>
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

            {/* Tabs */}
            <div className="pb-3">
              <div className="flex border-b border-[#3b5054] gap-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setCurrentPage(1)
                    }}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-[#0dccf2]'
                        : 'border-b-transparent text-[#9cb5ba] hover:text-white'
                    }`}
                  >
                    <p
                      className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                        activeTab === tab.id ? 'text-[#0dccf2]' : ''
                      }`}
                    >
                      {tab.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ToolBar */}
            <div className="flex justify-between items-center gap-4 px-4 py-3 bg-[#111718] rounded-xl border border-[#3b5054]">
              <div className="flex gap-2">
                <div className="relative w-72">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9cb5ba]">
                    search
                  </span>
                  <input
                    className="w-full h-10 pl-10 pr-4 bg-[#283639] text-white text-sm rounded-lg border-none focus:ring-2 focus:ring-[#0dccf2] placeholder:text-[#9cb5ba]"
                    placeholder="Search by title..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
                <div className="relative">
                  <select
                    className="appearance-none w-40 h-10 pl-4 pr-10 bg-[#283639] text-white text-sm rounded-lg border-none focus:ring-2 focus:ring-[#0dccf2]"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="all" className="bg-[#283639] text-white">All Statuses</option>
                    <option value="published" className="bg-[#283639] text-white">Published</option>
                    <option value="draft" className="bg-[#283639] text-white">Draft</option>
                    <option value="archived" className="bg-[#283639] text-white">Archived</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#9cb5ba] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm()
                  setShowAddModal(true)
                }}
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#0dccf2] text-[#111718] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-[#0dccf2]/90 transition-colors"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  add
                </span>
                <span className="truncate">{getCreateButtonLabel()}</span>
              </button>
            </div>

            {/* Table */}
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-xl border border-[#3b5054] bg-[#111718]">
                {loading ? (
                  <div className="flex items-center justify-center w-full py-12">
                    <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent"></div>
                  </div>
                ) : content.length === 0 ? (
                  <div className="text-center w-full py-12">
                    <p className="text-gray-400">No content found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#1b2527]">
                        <th className="px-4 py-3 text-left text-white text-sm font-medium w-2/5">Title</th>
                        <th className="px-4 py-3 text-left text-white text-sm font-medium w-1/5">Status</th>
                        <th className="px-4 py-3 text-left text-white text-sm font-medium w-1/5">Last Updated</th>
                        <th className="px-4 py-3 text-left text-white text-sm font-medium w-1/5">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.map((item) => (
                        <tr key={item._id} className="border-t border-t-[#3b5054] hover:bg-[#1b2527]/50 transition-colors">
                          <td className="h-[72px] px-4 py-2 text-white text-sm font-normal">{item.title}</td>
                          <td className="h-[72px] px-4 py-2">
                            <span
                              className={`inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1 ${getStatusColor(item.status)}`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#9cb5ba] text-sm font-normal">{formatDate(item.updatedAt)}</td>
                          <td className="h-[72px] px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-2 text-white/70 hover:text-white hover:bg-[#283639] rounded-md transition-colors"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedContent(item)
                                  setShowDeleteModal(true)
                                }}
                                className="p-2 text-white/70 hover:text-red-400 hover:bg-[#283639] rounded-md transition-colors"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                              {item.status === 'published' && (
                                <button
                                  onClick={() => {
                                    // Open content in new tab or show preview modal
                                    if (item.slug) {
                                      window.open(`/content/${item.slug}`, '_blank')
                                    } else {
                                      if (process.env.NODE_ENV === 'development') {
                                        console.log('View content:', item._id)
                                      }
                                    }
                                  }}
                                  className="p-2 text-white/70 hover:text-white hover:bg-[#283639] rounded-md transition-colors"
                                  title="View"
                                >
                                  <span className="material-symbols-outlined text-xl">visibility</span>
                                </button>
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
              <div className="flex items-center justify-between text-sm text-[#9cb5ba] px-4">
                <p>
                  Showing <span className="font-medium text-white">{((currentPage - 1) * 20) + 1}</span> to{' '}
                  <span className="font-medium text-white">{Math.min(currentPage * 20, total)}</span> of{' '}
                  <span className="font-medium text-white">{total}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-[#283639] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1b2527] transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-white px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-[#283639] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1b2527] transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-xl font-semibold mb-4">
              {showAddModal ? getCreateButtonLabel() : 'Edit Content'}
            </h3>
            
            <div className="space-y-4">
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
                <label className="block text-white text-sm mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  placeholder="Auto-generated from title if empty"
                />
              </div>

              {(activeTab === 'banners' || activeTab === 'news') && (
                <div>
                  <label className="block text-white text-sm mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.image || formData.featuredImage}
                    onChange={(e) => {
                      if (activeTab === 'banners') {
                        setFormData({...formData, image: e.target.value})
                      } else {
                        setFormData({...formData, featuredImage: e.target.value})
                      }
                    }}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
              )}

              {activeTab === 'banners' && (
                <div>
                  <label className="block text-white text-sm mb-2">Link URL</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
              )}

              {activeTab === 'news' && (
                <div>
                  <label className="block text-white text-sm mb-2">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
              )}

              {activeTab === 'faqs' && (
                <div>
                  <label className="block text-white text-sm mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-white text-sm mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows={2}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={6}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  >
                    <option value="draft" className="bg-[#1E1E2B]">Draft</option>
                    <option value="published" className="bg-[#1E1E2B]">Published</option>
                    <option value="archived" className="bg-[#1E1E2B]">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={showAddModal ? handleAdd : handleEdit}
                  disabled={saving || !formData.title}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0dccf2] text-white font-medium hover:bg-[#0bb5d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : (showAddModal ? 'Create' : 'Update')}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedContent(null)
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
      {showDeleteModal && selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E2B] rounded-xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-white text-xl font-semibold mb-4">Delete Content</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete &quot;{selectedContent.title}&quot;? This action cannot be undone.
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
                  setSelectedContent(null)
                }}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminProtectedRoute>
  )
}

export default ContentManagement
