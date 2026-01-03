'use client'

import { useState, useEffect } from 'react'

export default function DiceAnimation({ value, isRolling = false, size = 'large' }) {
  const [displayValue, setDisplayValue] = useState(value || 1)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isRolling) {
      setIsAnimating(true)
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1)
      }, 100)
      
      return () => {
        clearInterval(interval)
        setIsAnimating(false)
      }
    } else if (value) {
      setIsAnimating(false)
      setDisplayValue(value)
    }
  }, [isRolling, value])

  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-24 h-24 text-4xl',
    large: 'w-32 h-32 text-5xl',
    xlarge: 'w-40 h-40 text-6xl'
  }

  const dotPositions = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
  }

  const dots = dotPositions[displayValue] || []

  return (
    <div className={`relative ${sizeClasses[size]} ${isAnimating ? 'animate-bounce' : ''}`}>
      <div className={`w-full h-full rounded-xl bg-gradient-to-br from-white to-gray-200 shadow-2xl border-4 border-gray-400 flex items-center justify-center relative overflow-hidden ${
        isAnimating ? 'animate-spin' : ''
      }`}>
        {/* Dice face */}
        <div className="absolute inset-2 rounded-lg bg-white">
          {/* Dots */}
          <div className="relative w-full h-full">
            {dots.map((position, idx) => {
              const positionClasses = {
                'top-left': 'top-2 left-2',
                'top-right': 'top-2 right-2',
                'middle-left': 'top-1/2 left-2 -translate-y-1/2',
                'middle-right': 'top-1/2 right-2 -translate-y-1/2',
                'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                'bottom-left': 'bottom-2 left-2',
                'bottom-right': 'bottom-2 right-2'
              }
              
              const dotSize = size === 'xlarge' ? 'w-6 h-6' : size === 'large' ? 'w-5 h-5' : size === 'medium' ? 'w-4 h-4' : 'w-3 h-3'
              
              return (
                <div
                  key={idx}
                  className={`absolute ${positionClasses[position]} ${dotSize} bg-black rounded-full`}
                />
              )
            })}
          </div>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl pointer-events-none" />
      </div>
      
      {/* Glow effect when rolling */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-xl bg-[#0dccf2] opacity-50 blur-xl animate-pulse" />
      )}
    </div>
  )
}

