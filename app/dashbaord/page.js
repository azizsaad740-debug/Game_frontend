'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashbaordRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to correct dashboard URL
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-dark">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-white">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
