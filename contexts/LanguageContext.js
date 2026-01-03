'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('tr')

  useEffect(() => {
    // Load language from localStorage or default to Turkish
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language')
      if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
        setLanguage(savedLanguage)
      }
    }
  }, [])

  const changeLanguage = (lang) => {
    if (lang === 'tr' || lang === 'en') {
      setLanguage(lang)
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lang)
      }
    }
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

