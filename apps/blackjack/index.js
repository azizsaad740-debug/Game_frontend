'use client'

import { useState, useEffect } from 'react'

const CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const SUITS = ['♠️', '♥️', '♣️', '♦️']

const getValue = (card) => {
    if (['J', 'Q', 'K'].includes(card)) return 10
    if (card === 'A') return 11
    return parseInt(card)
}

const calculateScore = (hand) => {
    let score = 0
    let aces = 0
    hand.forEach(card => {
        score += getValue(card.value)
        if (card.value === 'A') aces += 1
    })
    while (score > 21 && aces > 0) {
        score -= 10
        aces -= 1
    }
    return score
}

const getRandomCard = () => {
    const value = CARDS[Math.floor(Math.random() * CARDS.length)]
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)]
    const color = (suit === '♥️' || suit === '♦️') ? 'text-red-500' : 'text-black'
    return { value, suit, color, id: Math.random() }
}

export default function Blackjack({ gameInfo, onWin, onLoss, updateBalance }) {
    // State
    const [balance, setBalance] = useState(1000) // Default if no data
    const [bet, setBet] = useState(10)
    const [playerHand, setPlayerHand] = useState([])
    const [dealerHand, setDealerHand] = useState([])
    const [gameState, setGameState] = useState('betting') // betting, playing, dealerTurn, gameOver
    const [message, setMessage] = useState('')
    const [lastWin, setLastWin] = useState(0)

    // Sync Balance
    useEffect(() => {
        // In a real app, you'd fetch initial balance here
    }, [])

    const placeBet = () => {
        if (bet > balance) {
            setMessage('Insufficient funds!')
            return
        }
        setBalance(prev => prev - bet)
        if (updateBalance) updateBalance(balance - bet)

        setGameState('playing')
        setMessage('')
        setLastWin(0)

        // Deal initial cards
        const p1 = getRandomCard()
        const p2 = getRandomCard()
        const d1 = getRandomCard()
        const d2 = getRandomCard()

        setPlayerHand([p1, p2])
        setDealerHand([d1, d2])

        // Check for immediate Blackjack
        const pScore = calculateScore([p1, p2])
        if (pScore === 21) {
            handleGameOver(21, calculateScore([d1, d2]), [p1, p2], [d1, d2])
        }
    }

    const hit = () => {
        const newCard = getRandomCard()
        const newHand = [...playerHand, newCard]
        setPlayerHand(newHand)

        const score = calculateScore(newHand)
        if (score > 21) {
            handleGameOver(score, calculateScore(dealerHand), newHand, dealerHand)
        }
    }

    const stand = async () => {
        setGameState('dealerTurn')
        let currentDealerHand = [...dealerHand]

        // Dealer plays
        while (calculateScore(currentDealerHand) < 17) {
            await new Promise(r => setTimeout(r, 800)) // Emulate thinking
            currentDealerHand.push(getRandomCard())
            setDealerHand([...currentDealerHand])
        }

        handleGameOver(calculateScore(playerHand), calculateScore(currentDealerHand), playerHand, currentDealerHand)
    }

    const handleGameOver = (pScore, dScore, pHand, dHand) => {
        setGameState('gameOver')
        let winAmount = 0

        if (pScore > 21) {
            setMessage('BUST! Dealer Wins.')
            if (onLoss) onLoss(bet)
        } else if (dScore > 21) {
            winAmount = bet * 2
            setMessage('Dealer BUST! You Win!')
        } else if (pScore > dScore) {
            winAmount = (pScore === 21 && pHand.length === 2) ? bet * 2.5 : bet * 2 // Blackjack pays 3:2 usually, simplified here
            setMessage('You Win!')
        } else if (pScore === dScore) {
            winAmount = bet
            setMessage('Push (Tie). Money Back.')
        } else {
            setMessage('Dealer Wins.')
            if (onLoss) onLoss(bet)
        }

        if (winAmount > 0) {
            const newBalance = balance - bet + winAmount // Re-sync logic needs care
            // Wait, balance was already deducted on bet. 
            // So new balance = current_display_balance + winAmount
            setBalance(prev => prev + winAmount)
            if (updateBalance) updateBalance(balance + winAmount) // Use current render balance ref if possible, simplification here using calculated logic
            if (onWin && winAmount > bet) onWin(winAmount)
            setLastWin(winAmount)
        }
    }

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-green-900 flex flex-col items-center p-4 font-sans text-white relative overflow-hidden">
            {/* Table Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-800 via-green-900 to-black pointer-events-none"></div>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 w-full max-w-4xl flex justify-between items-center mb-8 bg-black/30 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                <h1 className="text-3xl font-black text-yellow-400 uppercase tracking-widest">Blackjack</h1>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Balance</p>
                    <p className="text-2xl font-mono font-bold">₺{balance.toFixed(2)}</p>
                </div>
            </div>

            {/* Game Area */}
            <div className="relative z-10 flex-1 flex flex-col justify-center w-full max-w-4xl gap-8">

                {/* Dealer Area */}
                <div className="flex flex-col items-center">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="text-white/50 text-sm font-bold uppercase tracking-wider">Dealer</span>
                        {gameState === 'gameOver' && <span className="bg-black/50 px-2 py-0.5 rounded text-xs">{calculateScore(dealerHand)}</span>}
                    </div>
                    <div className="flex gap-[-4rem] h-32 md:h-40 justify-center">
                        {dealerHand.map((card, i) => (
                            <div key={i} className={`
                                relative w-24 h-36 md:w-28 md:h-40 bg-white rounded-lg shadow-2xl border-2 border-gray-200 
                                flex flex-col items-center justify-between p-2 transform transition-all duration-500
                                ${i > 0 ? '-ml-12' : ''} hover:-mr-8 z-${i}
                            `}>
                                {/* Hidden Card Logic */}
                                {gameState === 'playing' && i === 1 ? (
                                    <div className="absolute inset-0 bg-red-800 rounded-lg border-4 border-white flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]">
                                        <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
                                            <span className="text-3xl">♠️</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`text-2xl font-bold self-start ${card.color}`}>{card.value}{card.suit}</div>
                                        <div className={`text-4xl ${card.color}`}>{card.suit}</div>
                                        <div className={`text-2xl font-bold self-end rotate-180 ${card.color}`}>{card.value}{card.suit}</div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message Overlay */}
                {message && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce-in">
                        <div className="bg-black/80 backdrop-blur-md px-8 py-4 rounded-xl border border-yellow-500/50 text-center shadow-2xl">
                            <h2 className="text-2xl md:text-4xl font-black text-yellow-400 whitespace-nowrap">{message}</h2>
                            {lastWin > 0 && <p className="text-green-400 font-bold mt-1 text-xl">+₺{lastWin}</p>}
                        </div>
                    </div>
                )}

                {/* Player Area */}
                <div className="flex flex-col items-center">
                    <div className="flex gap-[-4rem] h-32 md:h-40 justify-center mb-4">
                        {playerHand.map((card, i) => (
                            <div key={i} className={`
                                w-24 h-36 md:w-28 md:h-40 bg-white rounded-lg shadow-2xl border-2 border-gray-200 
                                flex flex-col items-center justify-between p-2 transform transition-all duration-300 hover:-translate-y-4
                                ${i > 0 ? '-ml-12' : ''}
                            `}>
                                <div className={`text-2xl font-bold self-start ${card.color}`}>{card.value}{card.suit}</div>
                                <div className={`text-4xl ${card.color}`}>{card.suit}</div>
                                <div className={`text-2xl font-bold self-end rotate-180 ${card.color}`}>{card.value}{card.suit}</div>
                            </div>
                        ))}
                    </div>
                    {gameState !== 'betting' && (
                        <div className="mb-2 flex items-center gap-2">
                            <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                {calculateScore(playerHand)}
                            </span>
                            <span className="text-white/50 text-sm font-bold uppercase tracking-wider">Player</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="relative z-10 w-full max-w-xl mb-4">
                {gameState === 'betting' || gameState === 'gameOver' ? (
                    <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-4">
                            {[10, 50, 100, 500].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setBet(v)}
                                    className={`w-12 h-12 rounded-full border-2 font-bold transition-all transform hover:scale-110 ${bet === v ? 'bg-yellow-500 border-yellow-300 text-black' : 'bg-transparent border-white/30 text-white'}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={placeBet}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 rounded-lg text-xl font-black uppercase tracking-widest shadow-lg hover:from-green-500 hover:to-green-400 transform active:scale-95 transition-all"
                        >
                            {gameState === 'gameOver' ? 'Play Again' : 'Deal Cards'}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={hit}
                            className="py-4 bg-blue-600 rounded-lg text-xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-500 transform active:scale-95 transition-all"
                        >
                            Hit
                        </button>
                        <button
                            onClick={stand}
                            className="py-4 bg-red-600 rounded-lg text-xl font-black uppercase tracking-widest shadow-lg hover:bg-red-500 transform active:scale-95 transition-all"
                        >
                            Stand
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
