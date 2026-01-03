'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function GeneralTermsPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA] navbar-spacing">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-white text-4xl font-bold mb-2">General Terms and Conditions</h1>
            <p className="text-white/60 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6 text-white/80">
              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p>By accessing and using this platform, you accept and agree to be bound by these Terms and Conditions.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">2. Account Registration</h2>
                <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">3. Eligibility</h2>
                <p>You must be 18 years or older and legally permitted to use our services in your jurisdiction.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">4. Deposits and Withdrawals</h2>
                <p>All deposits and withdrawals are subject to verification and may take 1-3 business days to process.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">5. Prohibited Activities</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Creating multiple accounts</li>
                  <li>Using fraudulent payment methods</li>
                  <li>Engaging in any form of cheating or manipulation</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

