'use client'

import React, { useEffect, useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    games: 0,
    bets: 0,
    revenue: 0,
  })

  useEffect(() => {
    // Example fetch – replace with real API later
    setStats({
      users: 1240,
      games: 38,
      bets: 9120,
      revenue: 45800,
    })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminEmail')
    window.location.href = '/auth/login'
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display">

      {/* ✅ Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* ✅ Main Content */}
      <main className="flex-1 overflow-y-auto p-6">

        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Dashboard Overview
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl bg-surface p-5 shadow">
            <p className="text-sm text-gray-400">Total Users</p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {stats.users}
            </h2>
          </div>

          <div className="rounded-2xl bg-surface p-5 shadow">
            <p className="text-sm text-gray-400">Games</p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {stats.games}
            </h2>
          </div>

          <div className="rounded-2xl bg-surface p-5 shadow">
            <p className="text-sm text-gray-400">Total Bets</p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {stats.bets}
            </h2>
          </div>

          <div className="rounded-2xl bg-surface p-5 shadow">
            <p className="text-sm text-gray-400">Revenue</p>
            <h2 className="mt-2 text-2xl font-bold text-primary">
              ${stats.revenue}
            </h2>
          </div>

        </div>

        {/* Recent Activity / Placeholder */}
        <div className="mt-8 rounded-2xl bg-surface p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Recent Activity
          </h3>
          <p className="text-sm text-gray-400">
            Latest bets, user registrations, and transactions will appear here.
          </p>
        </div>

      </main>
    </div>
  )
}
