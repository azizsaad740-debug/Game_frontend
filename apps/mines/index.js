'use client'

import { useState, useEffect } from 'react'
import { authAPI, betRoundAPI } from '@/lib/api'

export default function Mines({ isLauncher = false, gameInfo }) {
    const [balance, setBalance] = useState(0)
    const [betAmount, setBetAmount] = useState('10')
    const [minesCount, setMinesCount] = useState(3)
    const [gameState, setGameState] = useState('idle') // idle, playing, finished
    const [grid, setGrid] = useState(Array(25).fill('hidden')) // hidden, diamond, mine
    const [mineLocations, setMineLocations] = useState([])
    const [revealedCount, setRevealedCount] = useState(0)
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

    const calculateMultiplier = (revealed) => {
        if (revealed === 0) return 1
        let multiplier = 1
        for (let i = 0; i < revealed; i++) {
            multiplier *= (25 - i) / (25 - i - minesCount)
        }
        return multiplier * 0.98 // 2% house edge
    }

    const startGame = async () => {
        const amount = parseFloat(betAmount)
        if (amount > balance) {
            setMessage('Insufficient funds')
            return
        }

        // Deduct
        setBalance(prev => prev - amount)
        if (gameInfo?.updateBalance) gameInfo.updateBalance(balance - amount)

        const locations = []
        while (locations.length < minesCount) {
            const r = Math.floor(Math.random() * 25)
            if (!locations.includes(r)) locations.push(r)
        }

        setMineLocations(locations)
        setGrid(Array(25).fill('hidden'))
        setRevealedCount(0)
        setGameState('playing')
        setMessage('')
    }

    const handleCellClick = async (index) => {
        if (gameState !== 'playing' || grid[index] !== 'hidden') return

        if (mineLocations.includes(index)) {
            // Hit a mine
            const newGrid = [...grid]
            mineLocations.forEach(loc => newGrid[loc] = 'mine')
            setGrid(newGrid)
            setGameState('finished')
            setMessage('GAME OVER!')
            if (gameInfo?.onLoss) gameInfo.onLoss(parseFloat(betAmount))

            await betRoundAPI.placeBetRound({
                gameId: 'mines',
                betAmount: parseFloat(betAmount),
                winAmount: 0,
                status: 'completed'
            })
        } else {
            // Hit a diamond
            const newGrid = [...grid]
            newGrid[index] = 'diamond'
            setGrid(newGrid)
            setRevealedCount(prev => prev + 1)

            if (revealedCount + 1 === 25 - minesCount) {
                handleCashout()
            }
        }
    }

    const handleCashout = async () => {
        if (gameState !== 'playing' || revealedCount === 0) return

        const mult = calculateMultiplier(revealedCount)
        const payout = parseFloat(betAmount) * mult

        setBalance(prev => prev + payout)
        setGameState('finished')
        setMessage(`WIN: ${payout.toFixed(2)} TL`)
        if (gameInfo?.onWin) gameInfo.onWin(payout)
        if (gameInfo?.updateBalance) gameInfo.updateBalance(balance + payout)

        await betRoundAPI.placeBetRound({
            gameId: 'mines',
            betAmount: parseFloat(betAmount),
            winAmount: payout,
            status: 'completed'
        })
    }

    const handleRandomPick = () => {
        const hiddenIndices = grid.map((s, i) => s === 'hidden' ? i : null).filter(i => i !== null)
        if (hiddenIndices.length > 0) {
            const randomIdx = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)]
            handleCellClick(randomIdx)
        }
    }

    const currentMultiplier = calculateMultiplier(revealedCount)
    const nextMultiplier = calculateMultiplier(revealedCount + 1)

    return (
        <div className="w-full min-h-screen bg-zinc-950 flex flex-col items-center justify-start pt-[140px] md:pt-[160px] p-2 md:p-4 text-white font-sans">
            <div className="w-[98%] md:w-[90%] max-w-4xl min-h-[500px] bg-zinc-900 border border-white/5 rounded-[24px] md:rounded-[40px] p-4 md:p-8 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6 px-2">
                    <div>
                        <h1 className="text-xl md:text-3xl font-black italic text-white tracking-tighter">MINES PRO</h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hidden md:block">Repo Version Logic</p>
                    </div>
                    <div className="bg-black/40 px-4 py-2 rounded-2xl border border-white/5 text-right">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase">Balance</p>
                        <p className="text-base md:text-2xl font-mono text-green-400">{balance.toFixed(2)} TL</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Game Side */}
                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-5 gap-[8px] mb-6">
                            {grid.map((status, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleCellClick(i)}
                                    disabled={gameState !== 'playing'}
                                    className={`w-full aspect-square rounded-md lg:rounded-xl border transition-all duration-300 flex items-center justify-center text-[5vw] lg:text-3xl shadow-lg ${status === 'hidden'
                                        ? 'bg-zinc-800 border-white/10 hover:bg-zinc-700 active:scale-95'
                                        : status === 'diamond'
                                            ? 'bg-green-500/20 border-green-500 shadow-green-500/20 scale-105 animate-in zoom-in'
                                            : 'bg-red-500/20 border-red-500 animate-pulse'
                                        }`}
                                >
                                    {status === 'diamond' ? '💎' : status === 'mine' ? '💣' : ''}
                                </button>
                            ))}
                        </div>

                        {gameState === 'playing' && (
                            <button
                                onClick={handleRandomPick}
                                className="w-full py-3 rounded-2xl bg-zinc-800 border border-white/5 text-[10px] font-black italic hover:bg-zinc-700 transition-colors tracking-widest text-zinc-400"
                            >
                                PICK RANDOM CELL
                            </button>
                        )}
                    </div>

                    {/* Controls Side */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-black/50 rounded-2xl p-4 border border-white/5 flex lg:flex-col justify-between lg:justify-start gap-4">
                            <div className="flex lg:grid lg:grid-cols-2 gap-4 flex-1">
                                <div className="flex items-center gap-2 bg-zinc-800/30 p-2 rounded-xl border border-white/5">
                                    <span className="text-xl">💣</span>
                                    <div className="leading-none">
                                        <p className="text-[8px] text-zinc-500 uppercase font-black">Mines</p>
                                        <span className="text-sm font-black">{minesCount}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-zinc-800/30 p-2 rounded-xl border border-white/5">
                                    <span className="text-xl">💎</span>
                                    <div className="leading-none">
                                        <p className="text-[8px] text-zinc-500 uppercase font-black">Left</p>
                                        <span className="text-sm font-black">{25 - minesCount - revealedCount}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right lg:text-left pt-2 border-t border-white/5 lg:border-none">
                                <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Next Multiplier</p>
                                <p className="text-2xl font-black text-purple-400 italic">x{nextMultiplier.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-zinc-800/50 rounded-2xl p-3 border border-white/5">
                                <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Bet Amount</p>
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(e.target.value)}
                                    disabled={gameState === 'playing'}
                                    className="bg-transparent w-full font-black text-xl outline-none"
                                />
                            </div>
                            <div className="bg-zinc-800/50 rounded-2xl p-3 border border-white/5">
                                <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Mines Count</p>
                                <select
                                    value={minesCount}
                                    onChange={(e) => setMinesCount(parseInt(e.target.value))}
                                    disabled={gameState === 'playing'}
                                    className="bg-transparent w-full font-black text-xl outline-none cursor-pointer"
                                >
                                    {[1, 3, 5, 10, 24].map(n => (
                                        <option key={n} value={n} className="bg-zinc-900">{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {gameState === 'playing' ? (
                            <button
                                onClick={handleCashout}
                                className="w-full py-5 rounded-2xl bg-green-500 text-black font-black italic text-xl shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                CASHOUT {(parseFloat(betAmount) * currentMultiplier).toFixed(2)} TL
                            </button>
                        ) : (
                            <button
                                onClick={startGame}
                                className="w-full py-5 rounded-2xl bg-white text-black font-black italic text-xl shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {gameState === 'finished' ? 'REPLAY' : 'START GAME'}
                            </button>
                        )}

                        {message && (
                            <div className="mt-4 text-center animate-in fade-in slide-in-from-bottom-2">
                                <p className={`text-xl font-black italic ${message.includes('WIN') ? 'text-green-400' : 'text-zinc-500'}`}>{message}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
