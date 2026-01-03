'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function BonusRulesPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA] navbar-spacing">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-white text-4xl font-bold mb-2">General Bonus Rules</h1>
            <p className="text-white/60 mb-8">Terms and conditions for bonuses</p>

            <div className="space-y-6 text-white/80">
              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Deposit Bonuses</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Deposit bonuses are credited automatically upon qualifying deposits</li>
                  <li>Standard deposit bonus is 20% of the deposit amount</li>
                  <li>Bonus funds are subject to 5× rollover requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Rollover Requirements</h2>
                <p>All bonus funds must be wagered 5 times (5×) before they can be withdrawn. For example, a ₺100 bonus requires ₺500 in total wagers.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Loss Bonuses</h2>
                <p>Loss bonuses are calculated as 20% of net losses and are subject to the same rollover requirements.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Bonus Expiration</h2>
                <p>Bonuses must be used within 30 days of being credited, or they will expire.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

