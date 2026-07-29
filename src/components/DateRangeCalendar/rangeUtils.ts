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

export function isOutOfBounds(iso: string, minDate?: string, maxDate?: string): boolean {
  if (minDate && iso < minDate) return true
  if (maxDate && iso > maxDate) return true
  return false
}

/**
 * Applies one day-click to the current range: first click sets `from`; a
 * second click completes the range, swapping the two dates (and committing
 * immediately, no third click) if it landed before `from`.
 */
export function pickDate(range: DateRange, iso: string): DateRange {
  if (!range.from || range.to) return { from: iso, to: null }
  if (iso === range.from) return range
  return iso < range.from ? { from: iso, to: range.from } : { from: range.from, to: iso }
}
