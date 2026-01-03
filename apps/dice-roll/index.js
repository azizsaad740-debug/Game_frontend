'use client'

import { useState, useEffect } from 'react'
import { authAPI, betRoundAPI } from '@/lib/api'

export default function DiceGame({ isLauncher = false, gameInfo }) {
    const [balance, setBalance] = useState(0)
    const [betAmount, setBetAmount] = useState('10')
    const [target, setTarget] = useState(50)
    const [rollType, setRollType] = useState('over') // over, under
    const [lastRoll, setLastRoll] = useState(null)
    const [isRolling, setIsRolling] = useState(false)
    const [gameState, setGameState] = useState('idle')
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

    const winChance = rollType === 'over' ? 100 - target : target
    const multiplier = (99 / winChance).toFixed(4)

    const handleRoll = async () => {
        const amount = parseFloat(betAmount)
        if (amount > balance) {
            setMessage('Insufficient balance')
            return
        }

        setIsRolling(true)
        setMessage('')

        // Deduct
        setBalance(prev => prev - amount)
        if (gameInfo?.updateBalance) gameInfo.updateBalance(balance - amount)

        // Animate roll
        let rolls = 0
        const interval = setInterval(() => {
            setLastRoll(Math.floor(Math.random() * 100))
            rolls++
            if (rolls > 15) {
                clearInterval(interval)
                const finalRoll = Math.floor(Math.random() * 100) + Math.random()
                finalizeRoll(finalRoll)
            }
        }, 80)
    }

    const finalizeRoll = async (roll) => {
        setLastRoll(roll)
        const isWin = rollType === 'over' ? roll > target : roll < target
        const winAmount = isWin ? parseFloat(betAmount) * parseFloat(multiplier) : 0

        if (isWin) {
            setGameState('won')
            setMessage(`WINNER! You rolled ${roll.toFixed(2)}`)
            setBalance(prev => prev + winAmount)
            if (gameInfo?.onWin) gameInfo.onWin(winAmount)
        } else {
            setGameState('lost')
            setMessage(`Lost! You rolled ${roll.toFixed(2)}`)
            if (gameInfo?.onLoss) gameInfo.onLoss(parseFloat(betAmount))
        }

        setIsRolling(false)
        if (gameInfo?.updateBalance) gameInfo.updateBalance(balance - parseFloat(betAmount) + winAmount)

        try {
            await betRoundAPI.placeBetRound({
                gameId: 'dice',
                betAmount: parseFloat(betAmount),
                winAmount: winAmount,
                status: 'completed'
            })
        } catch (e) { console.error(e) }
    }

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
            <div className="w-full max-w-4xl bg-slate-900/50 rounded-[40px] border border-white/10 p-8 shadow-2xl flex flex-col lg:flex-row gap-8">
                {/* Panel */}
                <div className="w-full lg:w-80 flex flex-col gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Bet Amount</label>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl h-12 px-4 font-mono font-bold outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setRollType('over')}
                            className={`flex-1 h-12 rounded-xl font-bold border-2 transition-all ${rollType === 'over' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-transparent text-slate-400'}`}
                        >ROLL OVER</button>
                        <button
                            onClick={() => setRollType('under')}
                            className={`flex-1 h-12 rounded-xl font-bold border-2 transition-all ${rollType === 'under' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-transparent text-slate-400'}`}
                        >ROLL UNDER</button>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Multiplier</label>
                        <div className="h-12 bg-slate-800 rounded-xl flex items-center justify-center font-mono font-black text-xl text-indigo-400">
                            {multiplier}x
                        </div>
                    </div>

                    <button
                        onClick={handleRoll}
                        disabled={isRolling}
                        className="w-full h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl font-black text-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        {isRolling ? 'ROLLING...' : 'ROLL'}
                    </button>
                </div>

                {/* Slider and Result */}
                <div className="flex-1 flex flex-col items-center justify-center gap-12">
                    <div className="w-full relative h-16 bg-slate-800 rounded-full border border-white/5 flex items-center px-4">
                        <div
                            className={`absolute h-full rounded-full transition-all duration-300 ${rollType === 'over' ? 'right-0 bg-green-500/20' : 'left-0 bg-red-500/20'}`}
                            style={{ width: `${rollType === 'over' ? 100 - target : target}%` }}
                        ></div>
                        <input
                            type="range"
                            min="2"
                            max="98"
                            value={target}
                            onChange={(e) => setTarget(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 relative z-10"
                        />
                        <div
                            className="absolute top-[-30px] font-black text-indigo-400 transition-all duration-100"
                            style={{ left: `${target}%`, transform: 'translateX(-50%)' }}
                        >{target}</div>
                    </div>

                    <div className="relative">
                        <div className={`text-[120px] font-black font-mono leading-none tracking-tighter transition-all duration-300 ${isRolling ? 'blur-sm opacity-50 scale-90' : 'blur-0 opacity-100 scale-100'}`}>
                            {lastRoll !== null ? lastRoll.toFixed(2) : '00.00'}
                        </div>
                        {gameState !== 'idle' && !isRolling && (
                            <div className={`mt-4 text-center font-black uppercase text-2xl animate-bounce ${gameState === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                                {gameState === 'won' ? 'BIG WIN!' : 'TRY AGAIN'}
                            </div>
                        )}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-xs text-slate-500 font-bold uppercase">Win Chance</p>
                            <p className="text-2xl font-mono font-black">{winChance.toFixed(2)}%</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-xs text-slate-500 font-bold uppercase">Balance</p>
                            <p className="text-2xl font-mono font-black text-indigo-400">{balance.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
