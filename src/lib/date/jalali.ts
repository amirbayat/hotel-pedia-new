// -----------------------------------------------------------------------------
// Jalali (Persian) date helpers.
//
// Thin adapter around `jalaali-js` (the actual Gregorian<->Jalaali math) — kept
// in one place so callers never import `jalaali-js` directly. Every date that
// crosses a component boundary is a Gregorian ISO string ("YYYY-MM-DD"): it's
// what a backend would send/receive, it sorts and compares as a plain string,
// and it keeps the Jalaali calendar as a pure display concern.
// -----------------------------------------------------------------------------

import { jalaaliMonthLength, toGregorian, toJalaali } from 'jalaali-js'

export interface JalaliCursor {
  jy: number
  jm: number // 1-12
}

export interface MonthDay {
  /** Gregorian ISO date, e.g. "2026-06-05" — the value used for comparisons and as a map key. */
  iso: string
  jd: number
  /** 0 = Saturday ... 6 = Friday. */
  weekday: number
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

/** Weekday header labels, Saturday-first (matches the Jalaali week). */
export const PERSIAN_WEEKDAY_LABELS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

export function toPersianDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)])
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export function toIsoDate(gy: number, gm: number, gd: number): string {
  return `${gy}-${pad(gm)}-${pad(gd)}`
}

export function isoDateToJalali(iso: string): { jy: number; jm: number; jd: number } {
  const [gy, gm, gd] = iso.split('-').map(Number)
  return toJalaali(gy, gm, gd)
}

/** "۱۴۰۵/۳/۲۱" — the `year/month/day` format used for displaying a single date. */
export function formatJalaliDisplay(iso: string): string {
  const { jy, jm, jd } = isoDateToJalali(iso)
  return toPersianDigits(`${jy}/${jm}/${jd}`)
}

/** "۱۳ شهریور" — day + Persian month name. */
export function formatJalaliDayMonth(iso: string): string {
  const { jm, jd } = isoDateToJalali(iso)
  return `${toPersianDigits(jd)} ${PERSIAN_MONTH_NAMES[jm - 1]}`
}

/** "۲۷ شهریور - ۲۹ شهریور" — check-in through check-out, for RTL display. */
export function formatJalaliDayMonthRange(range: {
  from: string | null
  to: string | null
}): string {
  if (!range.from) return ''
  if (!range.to) return formatJalaliDayMonth(range.from)
  return `${formatJalaliDayMonth(range.from)} - ${formatJalaliDayMonth(range.to)}`
}

/** Strips a datetime down to a Gregorian ISO date ("YYYY-MM-DD"). */
export function isoDateOnly(value: string): string {
  return value.slice(0, 10)
}

/**
 * Number of hotel nights between check-in and check-out.
 * Checkout is not a night: 10 Sep → 11 Sep is 1 night, not 2 days.
 */
export function nightsBetween(from: string, to: string): number {
  const start = isoDateOnly(from)
  const end = isoDateOnly(to)
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const ms = new Date(ey, em - 1, ed).getTime() - new Date(sy, sm - 1, sd).getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

/** True for billed stay nights [startDate, endDate) — checkout is excluded. */
export function isStayNightDate(date: string, startDate: string, endDate: string): boolean {
  const day = isoDateOnly(date)
  return day >= isoDateOnly(startDate) && day < isoDateOnly(endDate)
}

/** "ورود ۱۶ شهریور - خروج ۱۹ شهریور  ۳ شب" — calendar footer summary. */
export function formatStaySummary(range: { from: string | null; to: string | null }): string {
  if (!range.from) return ''
  if (!range.to) return `ورود ${formatJalaliDayMonth(range.from)}`
  const nights = nightsBetween(range.from, range.to)
  return `ورود ${formatJalaliDayMonth(range.from)} - خروج ${formatJalaliDayMonth(range.to)}  ${toPersianDigits(nights)} شب`
}

export function todayIso(): string {
  const now = new Date()
  return toIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function addDaysIso(iso: string, days: number): string {
  const [gy, gm, gd] = iso.split('-').map(Number)
  const date = new Date(gy, gm - 1, gd + days)
  return toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function todayCursor(): JalaliCursor {
  const { jy, jm } = isoDateToJalali(todayIso())
  return { jy, jm }
}

export function addMonths(cursor: JalaliCursor, delta: number): JalaliCursor {
  const total = cursor.jy * 12 + (cursor.jm - 1) + delta
  return { jy: Math.floor(total / 12), jm: (((total % 12) + 12) % 12) + 1 }
}

/** First/last Gregorian ISO date of a Jalaali month — handy for fetching a month's worth of per-day data. */
export function jalaliMonthRangeIso(cursor: JalaliCursor): { start: string; end: string } {
  const { gy: startGy, gm: startGm, gd: startGd } = toGregorian(cursor.jy, cursor.jm, 1)
  const length = jalaaliMonthLength(cursor.jy, cursor.jm)
  const { gy: endGy, gm: endGm, gd: endGd } = toGregorian(cursor.jy, cursor.jm, length)
  return { start: toIsoDate(startGy, startGm, startGd), end: toIsoDate(endGy, endGm, endGd) }
}

/** 0 = Saturday ... 6 = Friday, derived from the Gregorian weekday of the given date. */
function persianWeekday(gy: number, gm: number, gd: number): number {
  const jsWeekday = new Date(gy, gm - 1, gd).getDay() // 0 = Sunday ... 6 = Saturday
  return (jsWeekday + 1) % 7
}

/**
 * Builds a full-week grid (7 columns, Saturday-first) for a Jalaali month.
 * Leading/trailing cells outside the month are `null`.
 */
export function buildMonthMatrix(jy: number, jm: number): (MonthDay | null)[][] {
  const length = jalaaliMonthLength(jy, jm)
  const days: MonthDay[] = []

  for (let jd = 1; jd <= length; jd++) {
    const { gy, gm: gMonth, gd } = toGregorian(jy, jm, jd)
    days.push({ iso: toIsoDate(gy, gMonth, gd), jd, weekday: persianWeekday(gy, gMonth, gd) })
  }

  const weeks: (MonthDay | null)[][] = []
  let week: (MonthDay | null)[] = new Array(days[0].weekday).fill(null)

  for (const day of days) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  return weeks
}
