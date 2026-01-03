'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'

export default function AdminLogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      try {
        // Clear httpOnly cookies on the backend
        await authAPI.logout()
      } catch {
        // Even if backend is down, clear local state and proceed.
      }

      // Clear local auth state
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('adminEmail')

      router.push('/auth/login')
    }

    run()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-dark">
      <p className="text-white">Logging out...</p>
    </div>
  )
}

