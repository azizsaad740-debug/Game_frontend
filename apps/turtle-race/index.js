'use client'

import { useState, useEffect } from 'react'
import { authAPI, betRoundAPI } from '@/lib/api'

// Turtle SVGs extracted from the repo's Turtles.jsx
const TurtleSVG = ({ color, id }) => {
    const colors = {
        yellow: { body: '#FF976D', shell: '#0BCBBD', highlight: '#FFBE26' },
        red: { body: '#FF976D', shell: '#0BCBBD', highlight: '#FF0F74' },
        blue: { body: '#FF976D', shell: '#0BCBBD', highlight: '#49A4FF' }
    }
    const c = colors[color] || colors.yellow

    return (
        <svg viewBox="0 0 124 85" className="w-full h-full" id={id}>
            <g>
                {/* Body/Flippers */}
                <path d="M16.65 52.677s-1.076 10.545 9.393 13.77c0 0 33.008 8.016 35.418 1.507 0 0 2.932-8.194 2.864-8.748-.067-.554 1.437-4.353.823-5.758-.613-1.404-4.427-5.57-4.427-5.57s-42.093.53-44.071 4.799z" fill={c.body} stroke={c.body}></path>
                {/* Shell */}
                <path d="M47.632 67.91s-4.538 4.634-12.579 5.323c0 0-3.79-.792-2.295 4.198 0 0 1.832 6.837 11.178 6.778 0 0 13.936-.558 11.55-14.332 0 0 2.77-4.815-3.628-5.935 0-.016-4.206-.514-4.226 3.969v0z" fill={c.shell} stroke="#058B81"></path>
                {/* Highlight/Pattern */}
                <path d="M40.62 36.403c4.393.902 5.845.395 9.833-.677 2.125-.57 4.353-3.035 5.935-5.215a18.558 18.558 0 00-7.059-3.07" fill={c.highlight}></path>
                {/* Head */}
                <circle cx="100" cy="40" r="15" fill={c.body} />
                <circle cx="105" cy="35" r="3" fill="black" />
            </g>
        </svg>
    )
}

export default function TurtleRace({ isLauncher = false, gameInfo }) {
    const [balance, setBalance] = useState(0)
    const [betAmount, setBetAmount] = useState('10')
    const [selectedTurtle, setSelectedTurtle] = useState(0) // 0: Yellow, 1: Red, 2: Blue
    const [gameState, setGameState] = useState('idle') // idle, countdown, racing, finished
    const [countDown, setCountDown] = useState(5)
    const [positions, setPositions] = useState([0, 0, 0])
    const [winners, setWinners] = useState([])
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

    const startRace = async () => {
        const amount = parseFloat(betAmount)
        if (amount > balance) {
            setMessage('Insufficient funds')
            return
        }

        // Deduct balance
        const newBalance = balance - amount
        setBalance(newBalance)
        if (gameInfo?.updateBalance) gameInfo.updateBalance(newBalance)

        setMessage('')
        setGameState('countdown')
        let timer = 3
        const interval = setInterval(() => {
            timer -= 1
            setCountDown(timer)
            if (timer === 0) {
                clearInterval(interval)
                beginRacing()
            }
        }, 1000)
    }

    const beginRacing = () => {
        setGameState('racing')
        setPositions([0, 0, 0])

        const raceInterval = setInterval(() => {
            setPositions(prev => {
                const next = prev.map(p => p + Math.random() * 5)
                if (next.some(p => p >= 90)) {
                    clearInterval(raceInterval)
                    finalizeRace(next)
                    return next
                }
                return next
            })
        }, 50)
    }

    const finalizeRace = async (finalPositions) => {
        // Determine winners based on who crossed 90 first or by distance
        const ranking = [0, 1, 2].sort((a, b) => finalPositions[b] - finalPositions[a])
        setWinners(ranking)
        setGameState('finished')

        const isWinner = ranking[0] === selectedTurtle
        let winAmount = 0
        if (isWinner) {
            winAmount = parseFloat(betAmount) * 2.8 // 3 turtles, 2.8x multiplier
            setBalance(prev => prev + winAmount)
            setMessage('YOUR TURTLE WON!')
            if (gameInfo?.onWin) gameInfo.onWin(winAmount)
        } else {
            setMessage('BETTER LUCK NEXT TIME!')
            if (gameInfo?.onLoss) gameInfo.onLoss(parseFloat(betAmount))
        }

        if (gameInfo?.updateBalance) gameInfo.updateBalance(balance - parseFloat(betAmount) + winAmount)

        try {
            await betRoundAPI.placeBetRound({
                gameId: 'turtle-race',
                betAmount: parseFloat(betAmount),
                winAmount: winAmount,
                status: 'completed'
            })
        } catch (e) { console.error(e) }
    }

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-zinc-950 flex flex-col items-center justify-center p-4 text-white font-sans">
            <div className="w-full max-w-4xl bg-zinc-950 border border-white/5 rounded-[40px] p-8 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black italic text-zinc-400 tracking-tighter">TURTLE RACE</h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Inspired by External Repository</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase">Balance</p>
                        <p className="text-2xl font-mono text-white">{balance.toFixed(2)} TL</p>
                    </div>
                </div>

                {/* Track Area */}
                <div className="relative w-full bg-zinc-900/50 rounded-3xl p-6 border border-white/5 mb-8 h-[400px] flex flex-col justify-around">
                    {/* Finish Line */}
                    <div className="absolute right-12 top-0 bottom-0 w-2 border-r-4 border-dashed border-white/10 flex flex-col justify-around py-4">
                        <div className="text-xs font-black text-zinc-800 rotate-90">FINISH</div>
                        <div className="text-xs font-black text-zinc-800 rotate-90">FINISH</div>
                        <div className="text-xs font-black text-zinc-800 rotate-90">FINISH</div>
                    </div>

                    {['yellow', 'red', 'blue'].map((color, idx) => (
                        <div key={color} className="relative w-full h-24 border-b border-white/5 last:border-b-0 flex items-center">
                            <div
                                className="absolute transition-all duration-75"
                                style={{ left: `${positions[idx]}%`, width: '100px', height: '60px' }}
                            >
                                <TurtleSVG color={color} />
                                {gameState === 'finished' && winners[0] === idx && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">WINNER</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Overlay for Countdown/Result */}
                    {gameState === 'countdown' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm rounded-3xl">
                            <div className="text-center">
                                <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Race Starts In</p>
                                <p className="text-8xl font-black italic animate-bounce">{countDown}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Your Turtle</label>
                        <div className="flex gap-4">
                            {['yellow', 'red', 'blue'].map((color, idx) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedTurtle(idx)}
                                    disabled={gameState !== 'idle' && gameState !== 'finished'}
                                    className={`flex-1 h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${selectedTurtle === idx
                                            ? `bg-${color}-500/10 border-${color}-500 ring-4 ring-${color}-500/20`
                                            : 'bg-zinc-900 border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className={`w-3 h-3 rounded-full mb-1 ${color === 'yellow' ? 'bg-yellow-500' : color === 'red' ? 'bg-red-500' : 'bg-blue-500'
                                        }`} />
                                    <span className="text-[10px] font-black uppercase text-zinc-400">{color}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-zinc-900 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Bet Amount</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setBetAmount(prev => (Math.max(10, parseFloat(prev) / 2)).toString())} className="text-zinc-500 hover:text-white font-bold">1/2</button>
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(e.target.value)}
                                    className="bg-transparent text-xl font-bold text-center w-24 outline-none"
                                />
                                <button onClick={() => setBetAmount(prev => (parseFloat(prev) * 2).toString())} className="text-zinc-500 hover:text-white font-bold">2X</button>
                            </div>
                        </div>
                        <button
                            onClick={startRace}
                            disabled={gameState === 'racing' || gameState === 'countdown'}
                            className={`w-full h-16 rounded-2xl font-black italic tracking-tighter text-xl transition-all ${gameState === 'racing' || gameState === 'countdown'
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                    : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5'
                                }`}
                        >
                            {gameState === 'finished' ? 'REPLAY RACE' : 'PLACE BET & START'}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4">
                        <p className={`text-3xl font-black italic ${message.includes('WON') ? 'text-yellow-500' : 'text-zinc-500'}`}>{message}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
