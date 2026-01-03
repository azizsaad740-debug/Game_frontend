'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPolicyPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA] navbar-spacing">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-white text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-white/60 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6 text-white/80">
              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Information We Collect</h2>
                <p className="mb-4">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Personal identification information (name, email, phone number)</li>
                  <li>Payment information for transactions</li>
                  <li>Account credentials and preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">How We Use Your Information</h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Process transactions and manage your account</li>
                  <li>Send you important updates and notifications</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Data Security</h2>
                <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at privacy@garbet.com</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

