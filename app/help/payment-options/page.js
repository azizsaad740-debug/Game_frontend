'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PaymentOptionsPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA] navbar-spacing">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-white text-4xl font-bold mb-2">Payment Options</h1>
            <p className="text-white/60 mb-8">Available payment methods for deposits and withdrawals</p>

            <div className="space-y-6">
              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <h3 className="text-white text-xl font-semibold mb-4">Bank Transfer / EFT</h3>
                <ul className="space-y-2 text-white/70">
                  <li>• Minimum deposit: ₺100</li>
                  <li>• Maximum deposit: ₺50,000</li>
                  <li>• Processing time: 1-3 business days</li>
                </ul>
              </div>

              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <h3 className="text-white text-xl font-semibold mb-4">Credit Card</h3>
                <ul className="space-y-2 text-white/70">
                  <li>• Minimum deposit: ₺75</li>
                  <li>• Maximum deposit: ₺10,000</li>
                  <li>• Processing time: Instant</li>
                </ul>
              </div>

              <div className="bg-component-dark rounded-lg p-6 border border-white/10">
                <h3 className="text-white text-xl font-semibold mb-4">Papara</h3>
                <ul className="space-y-2 text-white/70">
                  <li>• Minimum deposit: ₺50</li>
                  <li>• Maximum deposit: ₺25,000</li>
                  <li>• Processing time: Instant</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/deposit" className="inline-block bg-primary text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                Make a Deposit
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

