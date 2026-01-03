'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/hooks/useTranslation'
import { setTranslationFunction } from '@/utils/errorHandler'

export default function LanguageWrapper({ children }) {
  const { language } = useLanguage()
  const { t } = useTranslation()

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    // Initialize translation function in error handler globally
    setTranslationFunction(t)
  }, [t, language])

  return <>{children}</>
}

