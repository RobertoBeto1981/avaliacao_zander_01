import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(value: string) {
  if (!value) return ''
  let cleaned = value.replace(/\D/g, '')

  if (cleaned.startsWith('55')) {
    cleaned = cleaned.substring(2)
  }

  if (cleaned.length === 0) return ''

  let formatted = '+55 '
  if (cleaned.length > 0) formatted += '(' + cleaned.substring(0, 2)
  if (cleaned.length >= 3) formatted += ') ' + cleaned.substring(2, 7)
  if (cleaned.length >= 8) formatted += '-' + cleaned.substring(7, 11)

  return formatted
}
