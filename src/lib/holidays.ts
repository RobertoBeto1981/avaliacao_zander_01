import { addDays, getDay, parseISO } from 'date-fns'

function getEasterDate(year: number): Date {
  const f = Math.floor
  const G = year % 19
  const C = f(year / 100)
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11))
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7
  const L = I - J
  const month = 3 + f((L + 40) / 44)
  const day = L + 28 - 31 * f(month / 4)
  return new Date(year, month - 1, day)
}

function getSecondMondayOfMay(year: number): Date {
  let date = new Date(year, 4, 1)
  while (date.getDay() !== 1) {
    date = addDays(date, 1)
  }
  return addDays(date, 7)
}

export function isHoliday(date: Date): boolean {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // National Fixed Holidays + Maringá Fixed (05-22 Santa Rita de Cássia)
  const fixed = ['01-01', '04-21', '05-01', '05-22', '09-07', '10-12', '11-02', '11-15', '12-25']
  if (fixed.includes(dateStr)) return true

  const easter = getEasterDate(year)

  // Corpus Christi (Easter + 60)
  const corpusChristi = addDays(easter, 60)
  if (month === corpusChristi.getMonth() + 1 && day === corpusChristi.getDate()) return true

  // Maringá Anniversary (2nd Monday of May)
  const secondMonday = getSecondMondayOfMay(year)
  if (month === secondMonday.getMonth() + 1 && day === secondMonday.getDate()) return true

  // Good Friday (Easter - 2)
  const goodFriday = addDays(easter, -2)
  if (month === goodFriday.getMonth() + 1 && day === goodFriday.getDate()) return true

  // Carnival (Easter - 47)
  const carnival = addDays(easter, -47)
  if (month === carnival.getMonth() + 1 && day === carnival.getDate()) return true

  return false
}

export function calculateDeadline(startDateStr: string, businessDays: number): Date {
  let currentDate = new Date(startDateStr + 'T00:00:00') // Force local midnight
  let added = 0

  while (added < businessDays) {
    currentDate = addDays(currentDate, 1)
    const day = getDay(currentDate)
    if (day !== 0 && day !== 6 && !isHoliday(currentDate)) {
      added++
    }
  }
  return currentDate
}
