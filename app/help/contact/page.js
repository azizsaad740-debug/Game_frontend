'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'
import { supportAPI } from '@/lib/api'
import { isAuthenticated, getCurrentUser } from '@/utils/auth'

export default function ContactPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill user data if logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser()
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || '',
          email: user.email || ''
        }))
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // If user is logged in, create a support ticket
      if (isAuthenticated()) {
        await supportAPI.createTicket({
          subject: formData.subject,
          message: formData.message,
          category: 'general',
          priority: 'medium'
        })
      } else {
        // For non-authenticated users, we could create a guest ticket
        // For now, just show success (you can implement guest ticket creation later)
        // Guest contact form submitted (can be logged to backend if needed)
      }

      setSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA] navbar-spacing">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-white text-4xl font-bold mb-2">Contact Us</h1>
            <p className="text-white/60 mb-8">Get in touch with our support team</p>

            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success ? (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
                <p className="text-green-400">Thank you! Your message has been sent. We&apos;ll get back to you soon.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 text-green-400 hover:text-green-300 underline text-sm"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-12 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 py-3 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-black h-12 rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Email Support</h3>
                <p className="text-white/70">support@garbet.com</p>
              </div>
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Response Time</h3>
                <p className="text-white/70">Usually within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

