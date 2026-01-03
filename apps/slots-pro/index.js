'use client'

import { useState, useEffect, useRef } from 'react'
import { authAPI, betRoundAPI } from '@/lib/api'

const SYMBOLS = [
    { id: 'cherry', icon: '🍒', mult: 2 },
    { id: 'lemon', icon: '🍋', mult: 3 },
    { id: 'grape', icon: '🍇', mult: 5 },
    { id: 'bell', icon: '🔔', mult: 10 },
    { id: 'diamond', icon: '💎', mult: 20 },
    { id: 'seven', icon: '7️⃣', mult: 50 },
    { id: 'crown', icon: '👑', mult: 100 },
    { id: 'wild', icon: '🃏', mult: 0 }, // Special
    { id: 'scatter', icon: '⭐', mult: 0 } // Special
]

const PAYLINES = [
    [1, 1, 1], // Middle Row
    [0, 0, 0], // Top Row
    [2, 2, 2], // Bottom Row
    [0, 1, 2], // Diagonal Down
    [2, 1, 0], // Diagonal Up
    [0, 1, 0], // Peak Up
    [2, 1, 2], // Peak Down
    [1, 0, 1], // V Up
    [1, 2, 1]  // V Down
]

export default function SlotsPro({ isLauncher = false, gameInfo }) {
    const [balance, setBalance] = useState(0)
    const [betAmount, setBetAmount] = useState('10')
    const [lines, setLines] = useState(9)
    const [isSpinning, setIsSpinning] = useState(false)
    const [reels, setReels] = useState([
        ['🍒', '🍒', '🍒'],
        ['🍒', '🍒', '🍒'],
        ['🍒', '🍒', '🍒']
    ])
    const [winAmount, setWinAmount] = useState(0)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            const res = await authAPI.me()
            setBalance(res.data.balance || 0)
        } catch (e) { console.error(e) }
    }

    const getRandomSymbol = () => {
        const r = Math.random()
        if (r < 0.01) return '👑'
        if (r < 0.03) return '7️⃣'
        if (r < 0.06) return '💎'
        if (r < 0.1) return '🔔'
        if (r < 0.2) return '🍇'
        if (r < 0.35) return '🍋'
        return '🍒'
    }

    const handleSpin = async () => {
        const totalBet = parseFloat(betAmount) * lines
        if (totalBet > balance) {
            setMessage('Insufficient funds')
            return
        }

        setIsSpinning(true)
        setWinAmount(0)
        setMessage('')

        // Deduct
        setBalance(prev => prev - totalBet)
        if (gameInfo?.updateBalance) gameInfo.updateBalance(balance - totalBet)

        // Spin animation simulation
        let spinCount = 0
        const interval = setInterval(() => {
            setReels([
                [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
                [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
                [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
            ])
            spinCount++
            if (spinCount > 20) {
                clearInterval(interval)
                finalizeSpin()
            }
        }, 80)
    }

    const finalizeSpin = async () => {
        const finalReels = [
            [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
            [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
            [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
        ]
        setReels(finalReels)

        let totalWin = 0
        const activeLines = PAYLINES.slice(0, lines)

        activeLines.forEach(line => {
            const s1 = finalReels[0][line[0]]
            const s2 = finalReels[1][line[1]]
            const s3 = finalReels[2][line[2]]

            if (s1 === s2 && s2 === s3) {
                const sym = SYMBOLS.find(s => s.icon === s1)
                if (sym) totalWin += parseFloat(betAmount) * sym.mult
            }
        })

        setWinAmount(totalWin)
        setBalance(prev => prev + totalWin)
        setIsSpinning(false)

        if (totalWin > 0) {
            setMessage(`JACKPOT: ${totalWin.toFixed(2)} TL`)
            if (gameInfo?.onWin) gameInfo.onWin(totalWin)
        } else {
            if (gameInfo?.onLoss) gameInfo.onLoss(parseFloat(betAmount) * lines)
        }

        if (gameInfo?.updateBalance) gameInfo.updateBalance(balance - (parseFloat(betAmount) * lines) + totalWin)

        try {
            await betRoundAPI.placeBetRound({
                gameId: 'slots-pro',
                betAmount: parseFloat(betAmount) * lines,
                winAmount: totalWin,
                status: 'completed'
            })
        } catch (e) { console.error(e) }
    }

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-[#1a0b2e] flex flex-col items-center justify-center p-4 text-white font-sans">
            <div className="w-full max-w-2xl bg-zinc-950/80 border border-purple-500/20 rounded-[40px] p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black italic text-purple-400 tracking-tighter">SLOTS PRO</h1>
                        <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest leading-none">9 Active Paylines</p>
                    </div>
                    <div className="bg-purple-500/10 px-6 py-3 rounded-2xl border border-purple-500/20 text-right">
                        <p className="text-[10px] text-purple-400 font-bold uppercase">Balance</p>
                        <p className="text-2xl font-mono text-white">{balance.toFixed(2)} TL</p>
                    </div>
                </div>

                {/* Reels Area */}
                <div className="bg-black/50 rounded-3xl p-6 border border-purple-500/10 mb-8 grid grid-cols-3 gap-4 shadow-inner">
                    {[0, 1, 2].map(reelIdx => (
                        <div key={reelIdx} className="bg-zinc-900/50 rounded-2xl border border-white/5 h-64 flex flex-col justify-around items-center overflow-hidden">
                            {reels[reelIdx].map((symbol, sIdx) => (
                                <div key={sIdx} className={`text-5xl transition-all duration-300 ${isSpinning ? 'blur-sm scale-90 opacity-50' : 'scale-100 opacity-100'}`}>
                                    {symbol}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase px-2">Line Bet</label>
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-xl font-black outline-none focus:border-purple-500/50"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase px-2">Lines</label>
                                <select
                                    value={lines}
                                    onChange={(e) => setLines(parseInt(e.target.value))}
                                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-xl font-black outline-none appearance-none"
                                >
                                    {[1, 3, 5, 9].map(n => <option key={n} value={n}>{n} Lines</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="px-2 text-xs font-bold text-zinc-600">
                            Total Bet: <span className="text-purple-400">{(parseFloat(betAmount) * lines).toFixed(2)} TL</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSpin}
                        disabled={isSpinning}
                        className={`w-full h-20 rounded-2xl font-black italic tracking-tighter text-2xl transition-all ${isSpinning
                                ? 'bg-zinc-800 text-zinc-600 cursor-wait'
                                : 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                    >
                        {isSpinning ? 'SPINNING...' : 'SPIN'}
                    </button>
                </div>

                {message && (
                    <div className="mt-8 text-center animate-in fade-in zoom-in">
                        <p className="text-3xl font-black italic animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{message}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
