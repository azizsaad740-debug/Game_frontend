'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import trTranslations from '@/lib/translations/tr.json'
import enTranslations from '@/lib/translations/en.json'

const translations = {
  tr: trTranslations,
  en: enTranslations
}

export function useTranslation() {
  const { language } = useLanguage()

  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = translations[language]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to Turkish if key not found
        value = translations.tr
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if translation not found
          }
        }
        break
      }
    }

    // Replace parameters in the translation string
    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match
      })
    }

    return typeof value === 'string' ? value : key
  }

  return { t, language }
}

