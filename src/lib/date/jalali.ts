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

export function todayIso(): string {
  const now = new Date()
  return toIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function todayCursor(): JalaliCursor {
  const { jy, jm } = isoDateToJalali(todayIso())
  return { jy, jm }
}

export function addMonths(cursor: JalaliCursor, delta: number): JalaliCursor {
  const total = cursor.jy * 12 + (cursor.jm - 1) + delta
  return { jy: Math.floor(total / 12), jm: (((total % 12) + 12) % 12) + 1 }
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
