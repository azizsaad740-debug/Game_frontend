'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect, useRef } from 'react'

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ]

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-1.5 text-white text-xs font-medium hover:text-primary transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="truncate">{currentLanguage.code.toUpperCase()}</span>
        <span className={`material-symbols-outlined text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg bg-[#1f1d37] border border-white/10 shadow-xl z-[60] animate-fade-in overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={(e) => {
                e.stopPropagation()
                changeLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                language === lang.code
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

