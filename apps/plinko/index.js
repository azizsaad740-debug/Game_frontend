'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { authAPI, betRoundAPI } from '@/lib/api'
import PlinkoEngine from './engine'
import { RiskLevel, rowCountOptions, binPayouts, getBinColors } from './constants'
import { useTranslation } from '@/hooks/useTranslation'

export default function PlinkoGameV2({ isLauncher = false, gameInfo }) {
    const { t } = useTranslation()
    const [balance, setBalance] = useState(0)
    const [betAmount, setBetAmount] = useState('10')
    const [rowCount, setRowCount] = useState(16)
    const [risk, setRisk] = useState(RiskLevel.MEDIUM)
    const [lastWins, setLastWins] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [autoBet, setAutoBet] = useState(false)
    const [engineReady, setEngineReady] = useState(false)
    const [winEffects, setWinEffects] = useState([])

    const canvasRef = useRef(null)
    const engineRef = useRef(null)
    const autoBetInterval = useRef(null)

    // Colors for bins
    const colors = useMemo(() => getBinColors(rowCount), [rowCount])

    // Data fetching
    useEffect(() => {
        fetchUserData()
    }, [])

    // Initialize Engine
    useEffect(() => {
        if (!canvasRef.current) return;

        if (!engineRef.current) {
            engineRef.current = new PlinkoEngine(canvasRef.current, {
                rowCount,
                riskLevel: risk,
                betAmount: parseFloat(betAmount),
                onWin: handleWin
            })
            engineRef.current.start()
            setEngineReady(true)
        }

        return () => {
            if (engineRef.current) {
                engineRef.current.stop()
                engineRef.current = null
            }
            if (autoBetInterval.current) clearInterval(autoBetInterval.current)
        }
    }, [loading]) // Run when loading completes and canvas becomes available

    // Update Options
    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.updateOptions({
                rowCount,
                riskLevel: risk,
                betAmount: parseFloat(betAmount)
            })
        }
    }, [rowCount, risk, betAmount])

    // Auto Bet Logic
    useEffect(() => {
        if (autoBet) {
            autoBetInterval.current = setInterval(dropBall, 300)
        } else {
            if (autoBetInterval.current) clearInterval(autoBetInterval.current)
        }
        return () => { if (autoBetInterval.current) clearInterval(autoBetInterval.current) }
    }, [autoBet, balance, betAmount])

    async function fetchUserData() {
        try {
            const res = await authAPI.me()
            setBalance(res.data.balance || 0)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleWin = async (win) => {
        setBalance(prev => prev + win.payout)
        setLastWins(prev => [win, ...prev].slice(0, 5))

        // Trigger win effect
        const effect = {
            id: win.id,
            binIndex: win.binIndex,
            payout: win.payout,
            multiplier: win.multiplier,
            isHigh: win.multiplier >= 2
        }
        setWinEffects(prev => [...prev, effect])
        setTimeout(() => {
            setWinEffects(prev => prev.filter(e => e.id !== effect.id))
        }, 2000)

        if (gameInfo?.onWin && win.payout > 0) gameInfo.onWin(win.payout)
        if (gameInfo?.updateBalance) gameInfo.updateBalance(balance + win.payout)

        try {
            await betRoundAPI.placeBetRound({
                gameId: 'plinko',
                betAmount: win.betAmount,
                winAmount: win.payout,
                status: 'completed',
                details: {
                    multiplier: win.multiplier,
                    rowCount: win.rowCount,
                    risk: risk
                }
            })
        } catch (e) { console.error(e) }
    }

    const dropBall = () => {
        const amount = parseFloat(betAmount)
        if (isNaN(amount) || amount <= 0) return
        if (amount > balance) {
            setMessage('Insufficient balance')
            setTimeout(() => setMessage(''), 3000)
            setAutoBet(false)
            return
        }

        const newBalance = balance - amount
        setBalance(newBalance)
        if (gameInfo?.updateBalance) gameInfo.updateBalance(newBalance)

        if (engineRef.current) {
            engineRef.current.dropBall(amount)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[600px]">
            <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
    )

    return (
        <div className="w-full min-h-screen bg-[#0B0E14] flex flex-col items-center p-4 text-[#EAEAEA] font-display navbar-spacing">
            <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-6 mt-4">
                {/* Side Controls */}
                <div className="w-full lg:w-80 flex flex-col gap-4">
                    <div className="bg-surface/40 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Bet Mode</span>
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                <button
                                    onClick={() => setAutoBet(false)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${!autoBet ? 'bg-primary text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                                >Manual</button>
                                <button
                                    onClick={() => setAutoBet(true)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${autoBet ? 'bg-primary text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                                >Auto</button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="text-[10px] font-bold text-white/30 uppercase mb-2.5 block tracking-[0.2em]">Bet Amount</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl h-14 px-4 font-mono font-bold text-primary outline-none focus:border-primary/50 focus:bg-black/60 transition-all text-lg"
                                    />
                                    <div className="absolute right-2 top-2.5 flex gap-1">
                                        <button onClick={() => setBetAmount(prev => String((parseFloat(prev) / 2).toFixed(2)))} className="px-3 py-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-[10px] font-bold transition-all border border-white/5">1/2</button>
                                        <button onClick={() => setBetAmount(prev => String((parseFloat(prev) * 2).toFixed(2)))} className="px-3 py-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-[10px] font-bold transition-all border border-white/5">x2</button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/30 uppercase block tracking-[0.2em]">Risk</label>
                                    <select
                                        value={risk}
                                        onChange={(e) => setRisk(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl h-12 px-3 text-sm font-bold outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-black/60 shadow-inner"
                                    >
                                        <option value={RiskLevel.LOW}>Low</option>
                                        <option value={RiskLevel.MEDIUM}>Medium</option>
                                        <option value={RiskLevel.HIGH}>High</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/30 uppercase block tracking-[0.2em]">Rows</label>
                                    <select
                                        value={rowCount}
                                        onChange={(e) => setRowCount(Number(e.target.value))}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl h-12 px-3 text-sm font-bold outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-black/60 shadow-inner"
                                    >
                                        {rowCountOptions.map(r => (
                                            <option key={r} value={r}>{r} Rows</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={dropBall}
                            disabled={autoBet}
                            className={`w-full mt-6 h-14 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-all duration-200 ${autoBet ? 'bg-white/5 text-white/20' : 'bg-primary text-black hover:bg-primary/90 hover:shadow-primary/20 transform hover:-translate-y-0.5'}`}
                        >
                            {autoBet ? 'AUTO RUNNING' : 'BET'}
                        </button>
                        {message && <p className="mt-4 text-center text-xs font-bold text-red-500 animate-pulse">{message}</p>}
                    </div>

                    <div className="bg-surface/30 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Current Balance</span>
                        </div>
                        <div className="text-2xl font-mono font-black text-white flex items-center gap-2 group cursor-default">
                            <span className="text-primary group-hover:scale-110 transition-transform">₺</span>
                            <span className="tabular-nums">
                                {balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col gap-2 mt-2">
                        <span className="text-[10px] font-bold text-white/20 uppercase px-2 tracking-widest">Recent Wins</span>
                        <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                            {lastWins.map((win, i) => (
                                <div key={win.id} className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 flex justify-between items-center animate-slide-in group hover:bg-white/10 transition-colors">
                                    <span className="text-xs font-bold text-white/60">{win.multiplier}x</span>
                                    <span className="text-xs font-black text-primary">+₺{win.payout.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Game Board */}
                <div className="flex-1 bg-[#12161D] rounded-[32px] border border-white/5 p-4 md:p-8 relative flex flex-col items-center justify-center min-h-[500px]">
                    <div className="relative w-full max-w-[760px] aspect-[760/570] flex items-center justify-center">
                        <canvas
                            ref={canvasRef}
                            width={760}
                            height={570}
                            className="w-full h-full block z-10"
                        />

                        {/* Bins Overlays */}
                        <div
                            className="absolute bottom-[28px] left-1/2 -translate-x-1/2 flex gap-[2px] z-20"
                            style={{
                                width: engineReady && engineRef.current ? `${engineRef.current.binsWidthPercentage * 100}%` : '80%',
                                height: '28px'
                            }}
                        >
                            {binPayouts[rowCount][risk].map((payout, i) => (
                                <div
                                    key={i}
                                    className="flex-1 rounded-sm flex items-center justify-center text-[8px] md:text-[10px] font-black shadow-lg shadow-black/40 transition-transform duration-100"
                                    style={{
                                        backgroundColor: colors.background[i],
                                        color: 'rgba(0,0,0,0.7)',
                                        borderBottom: `3px solid ${colors.shadow[i]}`
                                    }}
                                >
                                    {payout}x
                                </div>
                            ))}

                            {/* Floating Win Effects */}
                            {winEffects.map(effect => (
                                <div
                                    key={effect.id}
                                    className="absolute bottom-full flex flex-col items-center pointer-events-none animate-win-float z-50"
                                    style={{
                                        left: `${(effect.binIndex + 0.5) * (100 / binPayouts[rowCount][risk].length)}%`,
                                        transform: 'translateX(-50%)'
                                    }}
                                >
                                    <div className={`
                                        flex flex-col items-center gap-0.5 whitespace-nowrap px-3 py-1.5 rounded-full backdrop-blur-md border 
                                        ${effect.isHigh
                                            ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_rgba(249,212,6,0.5)]'
                                            : 'bg-white/10 border-white/20 text-white/90'
                                        }
                                    `}>
                                        <span className="text-xs font-black tracking-tighter">
                                            {effect.payout > 0 ? `+₺${effect.payout.toFixed(2)}` : `${effect.multiplier}x`}
                                        </span>
                                        {effect.isHigh && (
                                            <div className="flex gap-1">
                                                <span className="material-symbols-outlined text-[10px] animate-sparkle">star</span>
                                                <span className="material-symbols-outlined text-[10px] animate-sparkle" style={{ animationDelay: '0.2s' }}>star</span>
                                                <span className="material-symbols-outlined text-[10px] animate-sparkle" style={{ animationDelay: '0.4s' }}>star</span>
                                            </div>
                                        )}
                                    </div>
                                    {effect.isHigh && (
                                        <div className="w-0.5 h-16 bg-gradient-to-t from-transparent via-primary/30 to-primary/60 blur-[1px] -mt-1 scale-y-150 origin-bottom"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes win-float {
                    0% { transform: translateY(-10px); opacity: 0; scale: 0.5; }
                    20% { transform: translateY(-40px); opacity: 1; scale: 1.1; }
                    80% { transform: translateY(-80px); opacity: 1; scale: 1; }
                    100% { transform: translateY(-120px); opacity: 0; scale: 0.8; }
                }
                .animate-win-float {
                    animation: win-float 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                @keyframes sparkle {
                    0%, 100% { transform: scale(0); opacity: 0; rotate: 0deg; }
                    50% { transform: scale(1.2); opacity: 1; rotate: 180deg; }
                }
                .animate-sparkle {
                    animation: sparkle 0.8s ease-in-out infinite;
                }
                @keyframes slide-in {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    )
}
