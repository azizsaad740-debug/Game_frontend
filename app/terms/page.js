'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function TermsPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA] navbar-spacing">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-white text-4xl font-bold mb-2">Terms and Conditions</h1>
            <p className="text-white/60 mb-8">Select a category to view terms</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/terms/general" className="bg-component-dark rounded-lg p-6 border border-white/10 hover:border-primary transition-colors">
                <h3 className="text-white text-xl font-semibold mb-2">General Terms</h3>
                <p className="text-white/70 text-sm">View general terms and conditions</p>
              </Link>
              <Link href="/terms/sports-betting" className="bg-component-dark rounded-lg p-6 border border-white/10 hover:border-primary transition-colors">
                <h3 className="text-white text-xl font-semibold mb-2">Sports Betting Rules</h3>
                <p className="text-white/70 text-sm">View sports betting specific rules</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

