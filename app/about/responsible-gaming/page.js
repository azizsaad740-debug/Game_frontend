'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ResponsibleGamingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-[#EAEAEA] navbar-spacing">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-white text-4xl font-bold mb-2">Responsible Gaming</h1>
            <p className="text-white/60 mb-8">We are committed to promoting responsible gaming</p>

            <div className="space-y-6 text-white/80">
              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Age Restrictions</h2>
                <p>You must be 18 years or older to use our platform. We verify age during registration and may request additional verification.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Self-Exclusion</h2>
                <p>If you feel you need to take a break from gaming, you can set self-exclusion limits or temporarily suspend your account through your profile settings.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Deposit Limits</h2>
                <p>Set daily, weekly, or monthly deposit limits to help manage your spending. These limits can be adjusted in your account settings.</p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-semibold mb-4">Getting Help</h2>
                <p>If you or someone you know has a gambling problem, please seek help from professional organizations:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Gamblers Anonymous</li>
                  <li>National Council on Problem Gambling</li>
                  <li>Local support services</li>
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

