'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function SportsBettingRulesPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA] navbar-spacing">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-white text-4xl font-bold mb-2">Sports Betting Rules</h1>
            <p className="text-white/60 mb-8">Rules and regulations for sports betting</p>

            <div className="space-y-6 text-white/80">
              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Bet Settlement</h2>
                <p>All bets are settled based on official results from the relevant sports governing bodies. Results are considered final once officially confirmed.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Bet Cancellation</h2>
                <p>Bets may be cancelled if a match is postponed, abandoned, or if there are significant rule changes. Cancelled bets will be refunded.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Minimum and Maximum Bets</h2>
                <p>Minimum bet amounts vary by sport and market. Maximum bet limits may apply and can be adjusted based on account status.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Odds Changes</h2>
                <p>Odds are subject to change until a bet is confirmed. Once placed, your bet is locked at the odds you accepted.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

