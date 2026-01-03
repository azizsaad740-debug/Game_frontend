'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { authAPI } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import { updateUserData } from '@/utils/auth'

export default function GameLauncher() {
    const { t } = useTranslation()
    const router = useRouter()
    const params = useParams()
    const gameId = params.id

    const [user, setUser] = useState(null)
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Game configuration (Mock/External or Internal)
    const gameConfig = {
        'aviator': { name: 'Aviator', provider: 'Spribe', type: 'internal', route: '/crash' },
        'sweet-bonanza': { name: 'Sweet Bonanza', provider: 'Pragmatic Play', type: 'internal', route: '/sweet-bonanza' },
        'gates-of-olympus': { name: 'Gates of Olympus', provider: 'Pragmatic Play', type: 'iframe', url: 'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate' },
        'crazy-time': { name: 'Crazy Time', provider: 'Evolution', type: 'iframe', url: 'https://games.evolution.com/promo/crazy-time' }, // Mock demo
        'starburst': { name: 'Starburst', provider: 'NetEnt', type: 'iframe', url: 'https://demo.netent.com/games/starburst' }
    }

    const activeGame = gameConfig[gameId] || { name: 'Unknown Game', type: 'error' }

    const fetchUserData = useCallback(async () => {
        try {
            const response = await authAPI.me()
            if (response.data) {
                setUser(response.data)
                setBalance(response.data.balance || 0)
                updateUserData(response.data)
            }
        } catch (err) {
            console.error('Launcher: Error fetching user data', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUserData()
        const interval = setInterval(fetchUserData, 5000)
        return () => clearInterval(interval)
    }, [fetchUserData])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                setIsFullscreen(false)
            }
        }
    }

    if (activeGame.type === 'error') {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#1a1832] text-white p-6">
                <h1 className="text-2xl font-bold mb-4">Oyun Bulunamadı</h1>
                <Link href="/" className="px-6 py-2 bg-[#10b981] rounded-lg font-bold">Anasayfaya Dön</Link>
            </div>
        )
    }

    return (
        <ProtectedRoute hideNavbar={true}>
            <div className="relative flex h-screen w-full flex-col bg-[#0f0e1d] overflow-hidden">
                {/* Launcher Header */}
                <div className="h-14 w-full bg-[#1a1832]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-bold leading-none">{activeGame.name}</span>
                            <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">{activeGame.provider}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">{t('common.balance')}</span>
                            <span className="text-sm font-black text-[#10b981]">₺{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={toggleFullscreen}
                                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                                title="Tam Ekran"
                            >
                                <span className="material-symbols-outlined">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
                            </button>
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Game Area */}
                <div className="flex-1 relative bg-black">
                    {activeGame.type === 'internal' ? (
                        <iframe
                            src={`${activeGame.route}?launcher=true`}
                            className="w-full h-full border-none"
                            title={activeGame.name}
                        />
                    ) : (
                        <iframe
                            src={activeGame.url}
                            className="w-full h-full border-none"
                            allow="autoplay; fullscreen"
                            title={activeGame.name}
                        />
                    )}
                </div>

                {/* Floating Sidebar (Right) */}
                {isSidebarOpen && (
                    <div className="absolute right-0 top-14 bottom-0 w-72 bg-[#1a1832] border-l border-white/5 shadow-2xl z-50 animate-slide-in-right p-6">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-white font-bold">Oyun Menüsü</h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="text-white/40 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <Link href="/deposit" className="flex items-center gap-4 p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 group hover:bg-[#10b981]/20 transition-all">
                                    <div className="w-10 h-10 rounded-lg bg-[#10b981] flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined">add_circle</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white text-sm font-bold">Hızlı Para Yatır</span>
                                        <span className="text-white/40 text-xs">Kesintisiz devam et</span>
                                    </div>
                                </Link>

                                <div className="h-[1px] bg-white/5 my-4"></div>

                                <Link href="/slots" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">casino</span>
                                    <span className="text-sm font-medium">Slot Oyunları</span>
                                </Link>
                                <Link href="/live-casino" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">style</span>
                                    <span className="text-sm font-medium">Canlı Casino</span>
                                </Link>
                                <Link href="/promotions" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">military_tech</span>
                                    <span className="text-sm font-medium">Bonuslar</span>
                                </Link>
                            </div>

                            <div className="mt-auto pt-8">
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full py-3 rounded-lg border border-red-500/30 text-red-500 font-bold hover:bg-red-500/10 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-base">logout</span>
                                    OYUNDAN ÇIK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
