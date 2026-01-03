'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'

export default function MorePage() {
  const { t } = useTranslation()

  const sections = [
    {
      title: 'Virtual Sports',
      description: 'Bet on virtual football, horse racing, and more',
      icon: 'sports_soccer',
      link: '/sports',
      color: 'bg-blue-500/20 text-blue-400'
    },
    // COMMENTED OUT - Live Casino Disabled
    // {
    //   title: 'Poker',
    //   description: 'Play poker against other players',
    //   icon: 'casino',
    //   link: '/live-casino',
    //   color: 'bg-green-500/20 text-green-400'
    // },
    {
      title: 'Lottery',
      description: 'Try your luck with lottery draws',
      icon: 'confirmation_number',
      link: '/slots',
      color: 'bg-purple-500/20 text-purple-400'
    },
    {
      title: 'Virtual Games',
      description: 'Virtual games and simulations',
      icon: 'videogame_asset',
      link: '/tv-games',
      color: 'bg-orange-500/20 text-orange-400'
    },
    {
      title: 'Esports',
      description: 'Bet on esports tournaments and matches',
      icon: 'sports_esports',
      link: '/sports',
      color: 'bg-pink-500/20 text-pink-400'
    },
    {
      title: 'Financial Betting',
      description: 'Bet on financial markets',
      icon: 'trending_up',
      link: '/crash',
      color: 'bg-teal-500/20 text-teal-400'
    },
  ]

  const quickLinks = [
    { name: 'Responsible Gaming', link: '/about/responsible-gaming', icon: 'shield' },
    { name: 'Terms & Conditions', link: '/terms', icon: 'description' },
    { name: 'Privacy Policy', link: '/privacy', icon: 'lock' },
    { name: 'About Us', link: '/about/bonus-rules', icon: 'info' },
    { name: 'Contact', link: '/help/contact', icon: 'email' },
    { name: 'FAQ', link: '/help/faq', icon: 'help' },
  ]

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-dark navbar-spacing">
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-16 xl:px-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                {t('common.more')}
              </h1>
            </div>

            {/* More Games Section */}
            <div>
              <h2 className="text-white text-2xl font-bold mb-6">More Games & Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section, index) => (
                  <Link
                    key={index}
                    href={section.link}
                    className="group p-6 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${section.color}`}>
                        <span className="material-symbols-outlined text-2xl">{section.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-white/70 text-sm">{section.description}</p>
                      </div>
                      <span className="material-symbols-outlined text-white/50 group-hover:text-primary transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links Section */}
            <div>
              <h2 className="text-white text-2xl font-bold mb-6">Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.link}
                    className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-all group"
                  >
                    <span className="material-symbols-outlined text-white/70 group-hover:text-primary transition-colors">
                      {link.icon}
                    </span>
                    <span className="text-white font-medium group-hover:text-primary transition-colors">
                      {link.name}
                    </span>
                    <span className="material-symbols-outlined text-white/50 group-hover:text-primary transition-colors ml-auto">
                      chevron_right
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">security</span>
                  <h3 className="text-white text-lg font-bold">Secure & Safe</h3>
                </div>
                <p className="text-white/70 text-sm">
                  Your data and transactions are protected with industry-standard encryption and security measures.
                </p>
              </div>

              <div className="p-6 bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
                  <h3 className="text-white text-lg font-bold">24/7 Support</h3>
                </div>
                <p className="text-white/70 text-sm">
                  Our support team is available around the clock to assist you with any questions or issues.
                </p>
              </div>

              <div className="p-6 bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                  <h3 className="text-white text-lg font-bold">Fast Payments</h3>
                </div>
                <p className="text-white/70 text-sm">
                  Quick and secure deposit and withdrawal options with multiple payment methods available.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


