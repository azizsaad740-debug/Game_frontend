/**
 * Utility functions for formatting data
 */

/**
 * Format date to Turkish locale
 * @param {string|Date} dateString - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options,
    }
    
    return date.toLocaleDateString('tr-TR', defaultOptions)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'N/A'
  }
}

/**
 * Format date and time to Turkish locale
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Error formatting date time:', error)
    return 'N/A'
  }
}

/**
 * Format currency amount
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: 'TRY')
 * @param {string} locale - Locale (default: 'tr-TR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'TRY', locale = 'tr-TR') => {
  if (amount === null || amount === undefined) return formatCurrency(0, currency, locale)
  
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return formatCurrency(0, currency, locale)
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount)
  } catch (error) {
    console.error('Error formatting currency:', error)
    return `${amount} ${currency}`
  }
}

/**
 * Format amount with Turkish Lira symbol
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted amount with ₺ symbol
 */
export const formatAmount = (amount) => {
  return formatCurrency(amount, 'TRY', 'tr-TR')
}

/**
 * Format percentage change
 * @param {number|string} change - Percentage change value
 * @returns {string} Formatted percentage with + or - sign
 */
export const formatChange = (change) => {
  if (change === null || change === undefined) return '0%'
  
  try {
    const numChange = typeof change === 'string' ? parseFloat(change) : change
    if (isNaN(numChange)) return '0%'
    
    if (numChange > 0) return `+${numChange.toFixed(1)}%`
    if (numChange < 0) return `${numChange.toFixed(1)}%`
    return '0%'
  } catch (error) {
    console.error('Error formatting change:', error)
    return '0%'
  }
}

/**
 * Format phone number
 * @param {string} phone - Phone number string
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Format Turkish phone numbers
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
  }
  
  return phone
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

