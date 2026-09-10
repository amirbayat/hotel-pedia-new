import { addDaysIso, toIsoDate } from '../../lib/date/jalali'
import type { DateRange } from './types'

/**
 * The range actually rendered: the committed `value`, or — while only `from`
 * is picked — a live preview stretching to the hovered day. Kept separate
 * from selection state so hovering is a pure render concern.
 */
export function getPreviewRange(range: DateRange, hoverIso: string | null): DateRange {
  if (range.from && !range.to && hoverIso) {
    return hoverIso < range.from ? { from: hoverIso, to: range.from } : { from: range.from, to: hoverIso }
  }
  return range
}

export function isRangeStart(iso: string, range: DateRange): boolean {
  return range.from === iso
}

export function isRangeEnd(iso: string, range: DateRange): boolean {
  return range.to === iso
}

export function isInRange(iso: string, range: DateRange): boolean {
  return range.from !== null && range.to !== null && iso > range.from && iso < range.to
}

/** Billed nights are [from, to) — checkout is the departure day, not a night. */
export function isStayNight(iso: string, range: DateRange): boolean {
  return range.from !== null && range.to !== null && iso >= range.from && iso < range.to
}

export function isLastStayNight(iso: string, range: DateRange): boolean {
  return isStayNight(iso, range) && addDaysIso(iso, 1) === range.to
}

export function isOutOfBounds(iso: string, minDate?: string, maxDate?: string): boolean {
  if (minDate && iso < minDate) return true
  if (maxDate && iso > maxDate) return true
  return false
}

/** True if any billed night in [fromIso, toIso) fails `isDayBlocked`. Checkout is not a night. */
function hasBlockedStayNight(fromIso: string, toIso: string, isDayBlocked: (iso: string) => boolean): boolean {
  const [fy, fm, fd] = fromIso.split('-').map(Number)
  const [ty, tm, td] = toIso.split('-').map(Number)
  const cursor = new Date(fy, fm - 1, fd)
  const end = new Date(ty, tm - 1, td)

  while (cursor < end) {
    if (isDayBlocked(toIsoDate(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate()))) return true
    cursor.setDate(cursor.getDate() + 1)
  }
  return false
}

/**
 * Applies one day-click to the current range: first click sets `from`; a
 * second click completes the range, swapping the two dates (and committing
 * immediately, no third click) if it landed before `from`. Blocked days
 * (e.g. sold-out nights) cannot be check-in, and a range cannot include a
 * blocked stay night. Checkout is not a night, so a sold-out day can still
 * be picked as `to`.
 */
export function pickDate(range: DateRange, iso: string, isDayBlocked?: (iso: string) => boolean): DateRange {
  if (!range.from || range.to) {
    if (isDayBlocked?.(iso)) return range
    return { from: iso, to: null }
  }
  if (iso === range.from) return range

  const next = iso < range.from ? { from: iso, to: range.from } : { from: range.from, to: iso }
  if (isDayBlocked) {
    if (isDayBlocked(next.from)) return range
    if (hasBlockedStayNight(next.from, next.to, isDayBlocked)) {
      return { from: iso, to: null }
    }
  }
  return next
}
