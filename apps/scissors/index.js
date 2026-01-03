'use client'

import { useState, useEffect } from 'react'
import { authAPI, betRoundAPI } from '@/lib/api'

const CHOICES = [
    { id: 'rock', icon: '✊', beats: 'scissors' },
    { id: 'paper', icon: '✋', beats: 'rock' },
    { id: 'scissors', icon: '✌️', beats: 'paper' }
]

export default function ScissorsGame({ isLauncher = false, gameInfo }) {
    const [balance, setBalance] = useState(0)
    const [betAmount, setBetAmount] = useState('10')
    const [gameState, setGameState] = useState('idle') // idle, playing, result
    const [playerChoice, setPlayerChoice] = useState(null)
    const [houseChoice, setHouseChoice] = useState(null)
    const [result, setResult] = useState(null) // win, loss, draw
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

    const handlePlay = async (choice) => {
        const amount = parseFloat(betAmount)
        if (amount > balance) {
            setMessage('Insufficient balance')
            return
        }

        setGameState('playing')
        setPlayerChoice(choice)
        setMessage('')

        // Deduct
        setBalance(prev => prev - amount)
        if (gameInfo?.updateBalance) gameInfo.updateBalance(balance - amount)

        // Shuffling animation
        let count = 0
        const interval = setInterval(() => {
            setHouseChoice(CHOICES[count % 3])
            count++
            if (count > 10) {
                clearInterval(interval)
                const house = CHOICES[Math.floor(Math.random() * 3)]
                finalizeGame(choice, house)
            }
        }, 100)
    }

    const finalizeGame = async (player, house) => {
        setHouseChoice(house)
        let gameResult = 'draw'
        let winAmount = 0

        if (player.beats === house.id) {
            gameResult = 'win'
            winAmount = parseFloat(betAmount) * 1.95
        } else if (house.beats === player.id) {
            gameResult = 'loss'
            winAmount = 0
        } else {
            gameResult = 'draw'
            winAmount = parseFloat(betAmount)
        }

        setResult(gameResult)
        setGameState('result')
        setBalance(prev => prev + winAmount)

        if (gameResult === 'win') {
            setMessage('YOU WIN!')
            if (gameInfo?.onWin) gameInfo.onWin(winAmount)
        } else if (gameResult === 'draw') {
            setMessage('DRAW! Bet returned.')
        } else {
            setMessage('HOUSE WINS!')
            if (gameInfo?.onLoss) gameInfo.onLoss(parseFloat(betAmount))
        }

        if (gameInfo?.updateBalance) gameInfo.updateBalance(balance - parseFloat(betAmount) + winAmount)

        try {
            await betRoundAPI.placeBetRound({
                gameId: 'scissors',
                betAmount: parseFloat(betAmount),
                winAmount: winAmount,
                status: 'completed'
            })
        } catch (e) { console.error(e) }
    }

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-zinc-950 flex flex-col items-center justify-center p-4 text-white">
            <div className="w-full max-w-2xl bg-zinc-900 border border-white/5 rounded-[40px] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-black italic text-zinc-400">ROCK PAPER SCISSORS</h1>
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase">Balance</p>
                        <p className="text-xl font-mono">{balance.toFixed(2)} TL</p>
                    </div>
                </div>

                <div className="flex justify-around items-center mb-16 relative h-48">
                    {/* Player Side */}
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-xs font-bold text-zinc-600 uppercase">You</p>
                        <div className={`w-32 h-32 rounded-3xl bg-zinc-800 flex items-center justify-center text-6xl shadow-inner border border-white/5 transition-all ${result === 'win' ? 'ring-4 ring-green-500 bg-green-500/10' : ''}`}>
                            {playerChoice ? playerChoice.icon : '❓'}
                        </div>
                    </div>

                    <div className="text-4xl font-black italic text-zinc-800">VS</div>

                    {/* House Side */}
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-xs font-bold text-zinc-600 uppercase">House</p>
                        <div className={`w-32 h-32 rounded-3xl bg-zinc-800 flex items-center justify-center text-6xl shadow-inner border border-white/5 transition-all ${result === 'loss' ? 'ring-4 ring-red-500 bg-red-500/10' : ''}`}>
                            {houseChoice ? houseChoice.icon : '❓'}
                        </div>
                    </div>
                </div>

                {gameState === 'idle' || gameState === 'result' ? (
                    <div className="flex flex-col gap-8">
                        <div className="flex gap-4 justify-center">
                            {CHOICES.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => handlePlay(c)}
                                    className="w-24 h-24 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition-all border border-white/10 text-4xl flex items-center justify-center hover:scale-110 active:scale-95"
                                >{c.icon}</button>
                            ))}
                        </div>
                        <div className="flex items-center justify-center bg-black/40 rounded-2xl p-4 gap-4">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Bet Amount</span>
                            <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)}
                                className="bg-transparent border-b border-zinc-700 w-24 text-center text-xl font-bold outline-none"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="animate-bounce text-4xl font-black text-zinc-600 italic">CHOOSING...</div>
                    </div>
                )}

                {message && (
                    <div className="mt-8 text-center animate-in fade-in zoom-in">
                        <p className={`text-4xl font-black italic ${result === 'win' ? 'text-green-500' : result === 'draw' ? 'text-yellow-500' : 'text-red-500'}`}>{message}</p>
                        <button onClick={() => { setGameState('idle'); setPlayerChoice(null); setHouseChoice(null); setResult(null); setMessage('') }} className="mt-4 text-xs font-bold text-zinc-500 hover:text-white underline uppercase">Play Again</button>
                    </div>
                )}
            </div>
        </div>
    )
}
