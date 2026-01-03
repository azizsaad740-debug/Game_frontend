'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { authAPI } from '@/lib/api'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    setMessage('')

    try {
      const response = await authAPI.forgotPassword(email)
      setSuccess(true)
      setMessage(response.data.message || 'If an account with that email exists, a password reset link has been sent.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background-dark text-[#F5F5F5]">
      <div className="w-full max-w-md">
        <header className="mb-8 flex flex-col items-center gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_319)">
                  <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
                </g>
              </svg>
            </div>
            <Link href="/">
              <h1 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Garbet</h1>
            </Link>
          </div>
        </header>

        <main className="w-full rounded-xl bg-[#1E1E1E] p-6 sm:p-8 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-400">Enter your email to receive a password reset link</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success ? (
            <div className="rounded-lg bg-green-500/20 border border-green-500/50 p-4 mb-4">
              <p className="text-sm text-green-400">{message || 'Password reset link has been sent to your email!'}</p>
            </div>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-sm font-normal leading-normal text-white placeholder:text-gray-500 transition-all focus:border-primary focus:bg-[#2f2f2f] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-center text-sm font-bold text-black transition-all hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1E1E1E] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Remember your password?{' '}
              <Link className="font-medium text-[#4D96FF] hover:text-primary hover:underline transition-colors" href="/auth/login">
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

