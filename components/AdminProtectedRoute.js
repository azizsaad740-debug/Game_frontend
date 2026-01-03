'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isAuthenticated, isAdmin } from '@/utils/auth'

export default function AdminProtectedRoute({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      // Not logged in: send to unified auth login page, preserving where we came from.
      if (!isAuthenticated()) {
        const next = encodeURIComponent(pathname || '/admin')
        router.push(`/auth/login?next=${next}`)
        return
      }

      // Logged in but not admin: send to user dashboard.
      if (!isAdmin()) {
        router.push('/dashboard')
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, pathname])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-4 border-[#0dccf2] border-t-transparent"></div>
          <p className="text-white/70 text-sm">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}


