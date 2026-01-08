'use client'

import { useState, useEffect } from 'react'
import { adminAPI } from '@/lib/api'
import { log } from '@/utils/logger'

export default function GameControlMonitor() {
    const [pendingSpins, setPendingSpins] = useState([])
    const [loading, setLoading] = useState(false)
    const [processingId, setProcessingId] = useState(null)

    useEffect(() => {
        const fetchPendingSpins = async () => {
            let apiSpins = []
            try {
                const response = await adminAPI.getPendingSpins()
                apiSpins = response.data?.data || []
            } catch (err) {
                // Silently ignore errors during mock testing
                if (!localStorage.getItem('token')?.startsWith('mock')) {
                    log.error('Failed to fetch pending spins', err)
                }
            }

            // Always check for mock request regardless of API success
            let finalSpins = [...apiSpins]
            const mockReq = localStorage.getItem('mock-spin-request')
            if (mockReq) {
                try {
                    const parsed = JSON.parse(mockReq)
                    // Avoid duplicates
                    if (!finalSpins.some(s => s._id === parsed._id)) {
                        finalSpins = [parsed, ...finalSpins]
                    }
                } catch (e) {
                    console.error('Error parsing mock request:', e)
                }
            }

            setPendingSpins(finalSpins)
        }

        // Poll every 3 seconds for new spins
        const interval = setInterval(fetchPendingSpins, 3000)
        fetchPendingSpins()

        return () => clearInterval(interval)
    }, [])

    const handleDecision = async (id, decision) => {
        setProcessingId(id)

        // If it's a mock simulation spin, store decision in localStorage and remove it
        if (id.toString().startsWith('mock-spin-')) {
            localStorage.setItem('mock-game-decision', decision)
            localStorage.removeItem('mock-spin-request') // Clear the request so it doesn't reappear
            await new Promise(resolve => setTimeout(resolve, 800)) // Artificial delay for "feel"
            setPendingSpins(prev => prev.filter(spin => spin._id !== id))
            setProcessingId(null)
            return
        }

        try {
            await adminAPI.submitSpinDecision(id, decision)
            setPendingSpins(prev => prev.filter(spin => spin._id !== id))
        } catch (err) {
            log.error('Failed to submit decision', err)
            // If in mock mode, we still remove it to allow testing the UI flow
            if (localStorage.getItem('token')?.startsWith('mock')) {
                setPendingSpins(prev => prev.filter(spin => spin._id !== id))
            } else {
                alert('Error submitting decision: ' + (err.response?.data?.message || err.message))
            }
        } finally {
            setProcessingId(null)
        }
    }

    if (pendingSpins.length === 0) return null

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            {pendingSpins.map((spin) => (
                <div
                    key={spin._id}
                    className="bg-surface border border-primary/30 rounded-xl p-5 shadow-2xl backdrop-blur-md ring-1 ring-white/10"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-primary font-bold text-sm uppercase tracking-wider">New Spin Request</span>
                        </div>
                        {spin._id?.toString().startsWith('mock-spin-') && (
                            <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-black px-2 py-0.5 rounded border border-yellow-500/30">
                                TEST SIMULATION
                            </span>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="text-gray-500 text-xs">
                                {new Date(spin.createdAt).toLocaleTimeString()}
                            </span>
                            <button
                                onClick={() => setPendingSpins(prev => prev.filter(s => s._id !== spin._id))}
                                className="text-gray-500 hover:text-white transition-colors"
                                title="Dismiss"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">User:</span>
                            <span className="text-white font-semibold">{spin.username}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Bet Amount:</span>
                            <span className="text-yellow-400 font-bold">₺{spin.betAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Game:</span>
                            <span className="text-white capitalize">{spin.gameType.replace('-', ' ')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleDecision(spin._id, 'win')}
                            disabled={processingId === spin._id}
                            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 text-white font-bold py-2.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-teal-500/20"
                        >
                            {processingId === spin._id ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">trending_up</span>
                                    MAKE WIN
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => handleDecision(spin._id, 'loss')}
                            disabled={processingId === spin._id}
                            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-2.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-red-500/20"
                        >
                            {processingId === spin._id ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">trending_down</span>
                                    MAKE LOSS
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
