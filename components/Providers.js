'use client'

import { LanguageProvider } from '@/contexts/LanguageContext'
import LanguageWrapper from './LanguageWrapper'

export function Providers({ children }) {
  return (
    <LanguageProvider>
      <LanguageWrapper>
        {children}
      </LanguageWrapper>
    </LanguageProvider>
  )
}

