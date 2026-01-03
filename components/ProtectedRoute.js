'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { isAuthenticated, getCurrentUser, getRedirectPath } from '@/utils/auth'
import Navbar from '@/components/Navbar'
import { Suspense } from 'react'

function ProtectedRouteContent({ children, requiredRole = null, allowedRoles = null, hideNavbar = false }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  const isLauncher = searchParams.get('launcher') === 'true'
  const isGamePage = pathname?.startsWith('/play/') || pathname?.startsWith('/crash')
  const shouldHideNavbar = hideNavbar || isLauncher || isGamePage

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push('/auth/login')
        return
      }

      const user = getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check role requirements
      if (requiredRole && user.role !== requiredRole) {
        router.push(getRedirectPath(user.role))
        return
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push(getRedirectPath(user.role))
        return
      }

      setIsAuthorized(true)
      setLoading(false)
    }

    checkAuth()
  }, [router, requiredRole, allowedRoles])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <div className={!shouldHideNavbar ? "navbar-spacing flex-1 flex flex-col min-h-screen" : "flex-1 flex flex-col min-h-screen"}>
        {children}
      </div>
    </>
  )
}

export default function ProtectedRoute(props) {
  return (
    <Suspense fallback={null}>
      <ProtectedRouteContent {...props} />
    </Suspense>
  )
}

