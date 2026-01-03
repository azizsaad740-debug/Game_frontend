// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import AdminProtectedRoute from '@/components/AdminProtectedRoute'
// import { adminAPI } from '@/lib/api'
// import { formatDate, formatDateTime } from '@/utils/formatters'
// import { log } from '@/utils/logger'

// function TournamentManagement() {
//   const { t } = useTranslation()
//   const pathname = usePathname()
//   const [tournaments, setTournaments] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
  
//   // Filters
//   const [searchQuery, setSearchQuery] = useState('')
//   const [statusFilter, setStatusFilter] = useState('all')
//   const [gameTypeFilter, setGameTypeFilter] = useState('all')
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const [total, setTotal] = useState(0)
  
//   // Modals
//   const [showAddModal, setShowAddModal] = useState(false)
//   const [showEditModal, setShowEditModal] = useState(false)
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [selectedTournament, setSelectedTournament] = useState(null)
  
//   // Form data
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     gameType: 'slots',
//     status: 'upcoming',
//     startDate: '',
//     endDate: '',
//     registrationStartDate: '',
//     registrationEndDate: '',
//     prizePool: '',
//     entryFee: '0',
//     minPlayers: '1',
//     maxPlayers: '',
//     isFeatured: false,
//     priority: '0',
//     bannerImage: '',
//     termsAndConditions: '',
//   })


//   const gameTypes = [
//     { value: 'slots', label: 'Slots' },
//     { value: 'live_casino', label: 'Live Casino' },
//     { value: 'sports', label: 'Sports' },
//     { value: 'crash', label: 'Crash' },
//     { value: 'all', label: 'All Games' },
//   ]

//   const statusOptions = [
//     { value: 'upcoming', label: 'Upcoming' },
//     { value: 'active', label: 'Active' },
//     { value: 'finished', label: 'Finished' },
//     { value: 'cancelled', label: 'Cancelled' },
//   ]

//   useEffect(() => {
//     fetchTournaments()
//   }, [statusFilter, gameTypeFilter, searchQuery, currentPage])

//   const fetchTournaments = async () => {
//     setLoading(true)
//     setError('')
//     try {
//       const params = {
//         page: currentPage,
//         limit: 20,
//       }
      
//       if (searchQuery) params.search = searchQuery
//       if (statusFilter !== 'all') params.status = statusFilter
//       if (gameTypeFilter !== 'all') params.gameType = gameTypeFilter

//       const response = await adminAPI.getTournaments(params)
//       setTournaments(response.data.tournaments || [])
//       setTotalPages(response.data.totalPages || 1)
//       setTotal(response.data.total || 0)
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to load tournaments')
//       log.apiError('/admin/tournaments', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCreate = async () => {
//     setSaving(true)
//     setError('')
//     try {
//       const data = {
//         ...formData,
//         prizePool: parseFloat(formData.prizePool),
//         entryFee: parseFloat(formData.entryFee),
//         minPlayers: parseInt(formData.minPlayers),
//         maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : null,
//         priority: parseInt(formData.priority),
//       }
//       await adminAPI.createTournament(data)
//       setSuccess('Tournament created successfully')
//       setShowAddModal(false)
//       resetForm()
//       fetchTournaments()
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to create tournament')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleUpdate = async () => {
//     if (!selectedTournament) return
    
//     setSaving(true)
//     setError('')
//     try {
//       const data = {
//         ...formData,
//         prizePool: parseFloat(formData.prizePool),
//         entryFee: parseFloat(formData.entryFee),
//         minPlayers: parseInt(formData.minPlayers),
//         maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : null,
//         priority: parseInt(formData.priority),
//       }
//       await adminAPI.updateTournament(selectedTournament._id, data)
//       setSuccess('Tournament updated successfully')
//       setShowEditModal(false)
//       resetForm()
//       fetchTournaments()
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to update tournament')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleDelete = async () => {
//     if (!selectedTournament) return
    
//     setSaving(true)
//     setError('')
//     try {
//       await adminAPI.deleteTournament(selectedTournament._id)
//       setSuccess('Tournament deleted successfully')
//       setShowDeleteModal(false)
//       setSelectedTournament(null)
//       fetchTournaments()
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to delete tournament')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       description: '',
//       gameType: 'slots',
//       status: 'upcoming',
//       startDate: '',
//       endDate: '',
//       registrationStartDate: '',
//       registrationEndDate: '',
//       prizePool: '',
//       entryFee: '0',
//       minPlayers: '1',
//       maxPlayers: '',
//       isFeatured: false,
//       priority: '0',
//       bannerImage: '',
//       termsAndConditions: '',
//     })
//   }

//   const handleEdit = (tournament) => {
//     setSelectedTournament(tournament)
//     setFormData({
//       name: tournament.name || '',
//       description: tournament.description || '',
//       gameType: tournament.gameType || 'slots',
//       status: tournament.status || 'upcoming',
//       startDate: tournament.startDate ? new Date(tournament.startDate).toISOString().split('T')[0] : '',
//       endDate: tournament.endDate ? new Date(tournament.endDate).toISOString().split('T')[0] : '',
//       registrationStartDate: tournament.registrationStartDate ? new Date(tournament.registrationStartDate).toISOString().split('T')[0] : '',
//       registrationEndDate: tournament.registrationEndDate ? new Date(tournament.registrationEndDate).toISOString().split('T')[0] : '',
//       prizePool: tournament.prizePool?.toString() || '',
//       entryFee: tournament.entryFee?.toString() || '0',
//       minPlayers: tournament.minPlayers?.toString() || '1',
//       maxPlayers: tournament.maxPlayers?.toString() || '',
//       isFeatured: tournament.isFeatured || false,
//       priority: tournament.priority?.toString() || '0',
//       bannerImage: tournament.bannerImage || '',
//       termsAndConditions: tournament.termsAndConditions || '',
//     })
//     setShowEditModal(true)
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active':
//         return 'bg-green-500/20 text-green-400'
//       case 'upcoming':
//         return 'bg-blue-500/20 text-blue-400'
//       case 'finished':
//         return 'bg-gray-500/20 text-gray-400'
//       case 'cancelled':
//         return 'bg-red-500/20 text-red-400'
//       default:
//         return 'bg-gray-500/20 text-gray-400'
//     }
//   }

//   return (
//     <div className="flex min-h-screen w-full bg-background-dark">
//       {/* Sidebar */}
//       <AdminSidebar />

//       {/* Main Content */}
//       <main className="flex-1 p-6 lg:p-10 bg-background-light dark:bg-background-dark ml-64">
//         <div className="flex flex-col w-full max-w-7xl mx-auto">
//           {/* PageHeading */}
//           <div className="flex flex-wrap justify-between gap-4 items-start mb-6">
//             <div className="flex flex-col gap-2">
//               <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">{t('admin.tournamentManagement')}</p>
//                     <p className="text-[#9cb5ba] text-base font-normal leading-normal">
//                       Create and manage tournaments for your platform.
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       resetForm()
//                       setShowAddModal(true)
//                     }}
//                     className="flex items-center gap-2 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors"
//                   >
//                     <span className="material-symbols-outlined">add</span>
//                     {t('admin.createTournament')}
//                   </button>
//                 </div>

//                 {/* Error/Success Messages */}
//                 {error && (
//                   <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4">
//                     <p className="text-sm text-red-400">{error}</p>
//                   </div>
//                 )}
//                 {success && (
//                   <div className="rounded-lg bg-green-500/20 border border-green-500/50 p-4">
//                     <p className="text-sm text-green-400">{success}</p>
//                   </div>
//                 )}

//                 {/* ToolBar */}
//                 <div className="flex justify-between items-center gap-4 px-4 py-3 bg-[#111718] rounded-xl border border-[#3b5054]">
//                   <div className="flex gap-2">
//                     <div className="relative w-72">
//                       <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9cb5ba]">
//                         search
//                       </span>
//                       <input
//                         className="w-full h-10 pl-10 pr-4 bg-[#283639] text-white text-sm rounded-lg border-none focus:ring-2 focus:ring-[#0dccf2] placeholder:text-[#9cb5ba]"
//                         placeholder="Search tournaments..."
//                         type="text"
//                         value={searchQuery}
//                         onChange={(e) => {
//                           setSearchQuery(e.target.value)
//                           setCurrentPage(1)
//                         }}
//                       />
//                     </div>
//                     <div className="relative">
//                       <select
//                         className="appearance-none h-10 w-40 rounded-lg bg-[#283639] border-none text-white text-sm pl-4 pr-10 focus:ring-2 focus:ring-[#0dccf2]"
//                         value={statusFilter}
//                         onChange={(e) => {
//                           setStatusFilter(e.target.value)
//                           setCurrentPage(1)
//                         }}
//                       >
//                         <option value="all" className="bg-[#1E1E2B] text-white">Status: All</option>
//                         {statusOptions.map(opt => (
//                           <option key={opt.value} value={opt.value} className="bg-[#1E1E2B] text-white">{opt.label}</option>
//                         ))}
//                       </select>
//                       <span className="material-symbols-outlined text-[#9cb5ba] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
//                         expand_more
//                       </span>
//                     </div>
//                     <div className="relative">
//                       <select
//                         className="appearance-none h-10 w-40 rounded-lg bg-[#283639] border-none text-white text-sm pl-4 pr-10 focus:ring-2 focus:ring-[#0dccf2]"
//                         value={gameTypeFilter}
//                         onChange={(e) => {
//                           setGameTypeFilter(e.target.value)
//                           setCurrentPage(1)
//                         }}
//                       >
//                         <option value="all" className="bg-[#1E1E2B] text-white">Game: All</option>
//                         {gameTypes.map(type => (
//                           <option key={type.value} value={type.value} className="bg-[#1E1E2B] text-white">{type.label}</option>
//                         ))}
//                       </select>
//                       <span className="material-symbols-outlined text-[#9cb5ba] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
//                         expand_more
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Table */}
//                 <div className="bg-[#111718] rounded-xl border border-[#3b5054] overflow-hidden">
//                   {loading ? (
//                     <div className="p-8 text-center">
//                       <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent mx-auto"></div>
//                     </div>
//                   ) : tournaments.length === 0 ? (
//                     <div className="p-8 text-center text-[#9cb5ba]">No tournaments found</div>
//                   ) : (
//                     <table className="w-full">
//                       <thead className="bg-[#1b2527]">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-white text-sm font-medium">Name</th>
//                           <th className="px-6 py-3 text-left text-white text-sm font-medium">Game Type</th>
//                           <th className="px-6 py-3 text-left text-white text-sm font-medium">Prize Pool</th>
//                           <th className="px-6 py-3 text-left text-white text-sm font-medium">Entry Fee</th>
//                           <th className="px-6 py-3 text-left text-white text-sm font-medium">Status</th>
//                           <th className="px-6 py-3 text-left text-white text-sm font-medium">Start Date</th>
//                           <th className="px-6 py-3 text-left text-white text-sm font-medium">End Date</th>
//                           <th className="px-6 py-3 text-left text-white text-sm font-medium">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {tournaments.map((tournament) => (
//                           <tr key={tournament._id} className="border-t border-[#3b5054] hover:bg-[#1b2527]/50 transition-colors">
//                             <td className="px-6 py-4 text-white text-sm">{tournament.name}</td>
//                             <td className="px-6 py-4 text-[#9cb5ba] text-sm">{tournament.gameType}</td>
//                             <td className="px-6 py-4 text-white text-sm">₺{tournament.prizePool?.toFixed(2) || '0.00'}</td>
//                             <td className="px-6 py-4 text-white text-sm">₺{tournament.entryFee?.toFixed(2) || '0.00'}</td>
//                             <td className="px-6 py-4">
//                               <span className={`inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1 ${getStatusColor(tournament.status)}`}>
//                                 {tournament.status}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 text-[#9cb5ba] text-sm">{formatDate(tournament.startDate)}</td>
//                             <td className="px-6 py-4 text-[#9cb5ba] text-sm">{formatDate(tournament.endDate)}</td>
//                             <td className="px-6 py-4">
//                               <div className="flex items-center gap-2">
//                                 <button
//                                   onClick={() => handleEdit(tournament)}
//                                   className="p-2 text-blue-400 hover:text-blue-300 hover:bg-[#283639] rounded-md transition-colors"
//                                   title="Edit"
//                                 >
//                                   <span className="material-symbols-outlined text-xl">edit</span>
//                                 </button>
//                                 <button
//                                   onClick={() => {
//                                     setSelectedTournament(tournament)
//                                     setShowDeleteModal(true)
//                                   }}
//                                   className="p-2 text-red-400 hover:text-red-300 hover:bg-[#283639] rounded-md transition-colors"
//                                   title="Delete"
//                                 >
//                                   <span className="material-symbols-outlined text-xl">delete</span>
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}

//                   {/* Pagination */}
//                   {totalPages > 1 && (
//                     <div className="px-4 py-4 flex items-center justify-between border-t border-[#3b5054]">
//                       <p className="text-[#9cb5ba] text-sm">
//                         Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, total)} of {total} results
//                       </p>
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                           disabled={currentPage === 1}
//                           className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                         >
//                           Previous
//                         </button>
//                         <span className="text-white text-sm px-4">
//                           Page {currentPage} of {totalPages}
//                         </span>
//                         <button
//                           onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                           disabled={currentPage === totalPages}
//                           className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                         >
//                           Next
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
         
//         </main>
//       </div>

//       {/* Add/Edit Modal */}
//       {(showAddModal || showEditModal) && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-2xl w-full mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
//             <h3 className="text-white text-xl font-bold mb-4">
//               {showAddModal ? 'Create Tournament' : 'Edit Tournament'}
//             </h3>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-white/70 text-sm mb-2">Name *</label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-white/70 text-sm mb-2">Description</label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData({...formData, description: e.target.value})}
//                   className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                   rows={3}
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-white/70 text-sm mb-2">Game Type *</label>
//                   <select
//                     value={formData.gameType}
//                     onChange={(e) => setFormData({...formData, gameType: e.target.value})}
//                     className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                   >
//                     {gameTypes.filter(t => t.value !== 'all').map(type => (
//                       <option key={type.value} value={type.value} className="bg-[#1E1E2B] text-white">{type.label}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-white/70 text-sm mb-2">Status *</label>
//                   <select
//                     value={formData.status}
//                     onChange={(e) => setFormData({...formData, status: e.target.value})}
//                     className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                   >
//                     {statusOptions.map(opt => (
//                       <option key={opt.value} value={opt.value} className="bg-[#1E1E2B] text-white">{opt.label}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-white/70 text-sm mb-2">Start Date *</label>
//                   <input
//                     type="datetime-local"
//                     value={formData.startDate}
//                     onChange={(e) => setFormData({...formData, startDate: e.target.value})}
//                     className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-white/70 text-sm mb-2">End Date *</label>
//                   <input
//                     type="datetime-local"
//                     value={formData.endDate}
//                     onChange={(e) => setFormData({...formData, endDate: e.target.value})}
//                     className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-white/70 text-sm mb-2">Prize Pool *</label>
//                   <input
//                     type="number"
//                     value={formData.prizePool}
//                     onChange={(e) => setFormData({...formData, prizePool: e.target.value})}
//                     className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                     required
//                     min="0"
//                     step="0.01"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-white/70 text-sm mb-2">Entry Fee</label>
//                   <input
//                     type="number"
//                     value={formData.entryFee}
//                     onChange={(e) => setFormData({...formData, entryFee: e.target.value})}
//                     className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                     min="0"
//                     step="0.01"
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-white/70 text-sm mb-2">Min Players</label>
//                   <input
//                     type="number"
//                     value={formData.minPlayers}
//                     onChange={(e) => setFormData({...formData, minPlayers: e.target.value})}
//                     className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                     min="1"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-white/70 text-sm mb-2">Max Players</label>
//                   <input
//                     type="number"
//                     value={formData.maxPlayers}
//                     onChange={(e) => setFormData({...formData, maxPlayers: e.target.value})}
//                     className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                     min="1"
//                   />
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={formData.isFeatured}
//                   onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
//                   className="rounded border-white/20 bg-transparent"
//                 />
//                 <label className="text-white/70 text-sm">Featured Tournament</label>
//               </div>
//               <div>
//                 <label className="block text-white/70 text-sm mb-2">Priority</label>
//                 <input
//                   type="number"
//                   value={formData.priority}
//                   onChange={(e) => setFormData({...formData, priority: e.target.value})}
//                   className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                   min="0"
//                 />
//               </div>
//               <div>
//                 <label className="block text-white/70 text-sm mb-2">Banner Image URL</label>
//                 <input
//                   type="url"
//                   value={formData.bannerImage}
//                   onChange={(e) => setFormData({...formData, bannerImage: e.target.value})}
//                   className="w-full h-12 rounded-lg bg-white/5 border border-white/10 text-white px-4 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                 />
//               </div>
//               <div>
//                 <label className="block text-white/70 text-sm mb-2">Terms and Conditions</label>
//                 <textarea
//                   value={formData.termsAndConditions}
//                   onChange={(e) => setFormData({...formData, termsAndConditions: e.target.value})}
//                   className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50"
//                   rows={4}
//                 />
//               </div>
//               <div className="flex gap-3">
//                 <button
//                   onClick={showAddModal ? handleCreate : handleUpdate}
//                   disabled={saving}
//                   className="flex-1 px-4 py-2 bg-[#0dccf2] text-white rounded-lg hover:bg-[#0dccf2]/90 transition-colors disabled:opacity-50"
//                 >
//                   {saving ? 'Saving...' : (showAddModal ? 'Create' : 'Update')}
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowAddModal(false)
//                     setShowEditModal(false)
//                     resetForm()
//                     setSelectedTournament(null)
//                   }}
//                   className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal */}
//       {showDeleteModal && selectedTournament && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-[#1E1E2B] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
//             <h3 className="text-white text-xl font-bold mb-4">Delete Tournament</h3>
//             <p className="text-white/70 text-sm mb-4">
//               Are you sure you want to delete "{selectedTournament.name}"? This action cannot be undone.
//             </p>
//             <div className="flex gap-3">
//               <button
//                 onClick={handleDelete}
//                 disabled={saving}
//                 className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
//               >
//                 {saving ? 'Deleting...' : 'Delete'}
//               </button>
//               <button
//                 onClick={() => {
//                   setShowDeleteModal(false)
//                   setSelectedTournament(null)
//                 }}
//                 className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default function TournamentManagementPage() {
//   return (
//     <AdminProtectedRoute>
//       <TournamentManagement />
//     </AdminProtectedRoute>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// import { useTranslation } from 'react-i18next'
import { useTranslation } from '@/hooks/useTranslation'

import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import AdminSidebar from '@/components/AdminSidebar'

import { adminAPI } from '@/lib/api'
import { formatDate } from '@/utils/formatters'
import { log } from '@/utils/logger'

const toDateTimeLocal = (date) =>
  new Date(date).toISOString().slice(0, 16)

function TournamentManagement() {
  const { t } = useTranslation()
  const pathname = usePathname()

  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [gameTypeFilter, setGameTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState(null)

  // Form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gameType: 'slots',
    status: 'upcoming',
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    prizePool: '',
    entryFee: '0',
    minPlayers: '1',
    maxPlayers: '',
    isFeatured: false,
    priority: '0',
    bannerImage: '',
    termsAndConditions: '',
  })

  const gameTypes = [
    { value: 'slots', label: 'Slots' },
    { value: 'live_casino', label: 'Live Casino' },
    { value: 'sports', label: 'Sports' },
    { value: 'crash', label: 'Crash' },
    { value: 'all', label: 'All Games' },
  ]

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'active', label: 'Active' },
    { value: 'finished', label: 'Finished' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  useEffect(() => {
    fetchTournaments()
  }, [statusFilter, gameTypeFilter, searchQuery, currentPage])

  const fetchTournaments = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(gameTypeFilter !== 'all' && { gameType: gameTypeFilter }),
      }

      const res = await adminAPI.getTournaments(params)
      setTournaments(res.data.tournaments || [])
      setTotalPages(res.data.totalPages || 1)
      setTotal(res.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tournaments')
      log.apiError('/admin/tournaments', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      gameType: 'slots',
      status: 'upcoming',
      startDate: '',
      endDate: '',
      registrationStartDate: '',
      registrationEndDate: '',
      prizePool: '',
      entryFee: '0',
      minPlayers: '1',
      maxPlayers: '',
      isFeatured: false,
      priority: '0',
      bannerImage: '',
      termsAndConditions: '',
    })
  }

  const handleEdit = (t) => {
    setSelectedTournament(t)
    setFormData({
      name: t.name || '',
      description: t.description || '',
      gameType: t.gameType || 'slots',
      status: t.status || 'upcoming',
      startDate: t.startDate ? toDateTimeLocal(t.startDate) : '',
      endDate: t.endDate ? toDateTimeLocal(t.endDate) : '',
      registrationStartDate: t.registrationStartDate ? toDateTimeLocal(t.registrationStartDate) : '',
      registrationEndDate: t.registrationEndDate ? toDateTimeLocal(t.registrationEndDate) : '',
      prizePool: String(t.prizePool ?? ''),
      entryFee: String(t.entryFee ?? '0'),
      minPlayers: String(t.minPlayers ?? '1'),
      maxPlayers: t.maxPlayers ? String(t.maxPlayers) : '',
      isFeatured: Boolean(t.isFeatured),
      priority: String(t.priority ?? '0'),
      bannerImage: t.bannerImage || '',
      termsAndConditions: t.termsAndConditions || '',
    })
    setShowEditModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'upcoming': return 'bg-blue-500/20 text-blue-400'
      case 'finished': return 'bg-gray-500/20 text-gray-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background-dark">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 ml-0 lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-white text-4xl font-black">
                {t('admin.tournamentManagement')}
              </h1>
              <p className="text-white/60">
                Create and manage tournaments
              </p>
            </div>

            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="px-4 py-2 bg-cyan-500 text-black rounded-lg font-bold"
            >
              + Create Tournament
            </button>
          </div>

          <div className="bg-[#111718] rounded-xl border border-[#3b5054] overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-white">Loading...</div>
            ) : tournaments.length === 0 ? (
              <div className="p-10 text-center text-white/60">No tournaments</div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#1b2527]">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Game</th>
                    <th className="px-6 py-3 text-left">Prize</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Start</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map(t => (
                    <tr key={t._id} className="border-t border-[#3b5054]">
                      <td className="px-6 py-4">{t.name}</td>
                      <td className="px-6 py-4">{t.gameType}</td>
                      <td className="px-6 py-4">₺{t.prizePool}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded ${getStatusColor(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatDate(t.startDate)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-blue-400"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function TournamentManagementPage() {
  return (
    <AdminProtectedRoute>
      <TournamentManagement />
    </AdminProtectedRoute>
  )
}
