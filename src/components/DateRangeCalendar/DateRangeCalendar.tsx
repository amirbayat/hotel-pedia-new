import { useState } from 'react'
import {
  addMonths,
  formatStaySummary,
  PERSIAN_MONTH_NAMES,
  todayCursor,
  todayIso,
  toPersianDigits,
} from '../../lib/date/jalali'
import type { JalaliCursor } from '../../lib/date/jalali'
import { IconArrowLeft, IconArrowRight } from '../icons'
import { Button } from '../Button'
import { MonthGrid } from './MonthGrid'
import { pickDate } from './rangeUtils'
import type { DateRange, PriceTier, PricesByDate } from './types'
import styles from './DateRangeCalendar.module.scss'

// DOM order left-to-right (this app doesn't set dir="rtl"; layout order is
// manually matched to the Figma visual instead) — "ارزان" reads rightmost in
// Persian reading order, which lands it leftmost here.
const LEGEND: { tier: PriceTier; label: string; className: string }[] = [
  { tier: 'cheap', label: 'ارزان قیمت', className: styles.tierCheap },
  { tier: 'medium', label: 'میانه قیمت', className: styles.tierMedium },
  { tier: 'expensive', label: 'گران قیمت', className: styles.tierExpensive },
]

export interface DateRangeCalendarProps {
  /** Committed check-in/check-out selection, as Gregorian ISO date strings. */
  value: DateRange
  onChange: (range: DateRange) => void
  /** Per-day price bucket (keyed by ISO date) driving each cell's color. Days without an entry use the default color. */
  pricesByDate?: PricesByDate
  /** Earliest selectable ISO date. Defaults to today — dates before today are disabled. Pass an earlier value to allow past dates. */
  minDate?: string
  /** Latest selectable ISO date. Days outside this bound are disabled. */
  maxDate?: string
  /** Dates known to be unbookable (e.g. sold out) — disabled, and a range can't be picked across one. */
  unavailableDates?: Set<string>
  /** Formatted per-night price shown under the day number, e.g. "۴۵,۵۰۰". */
  priceLabelByDate?: Partial<Record<string, string>>
  /**
   * `priced` is only for the room-details modal calendar tab (Figma 788:22528).
   * Search-card / listing / hotel-rooms calendars must stay `compact`.
   */
  variant?: 'compact' | 'priced'
  className?: string
  /** Controlled right-hand month cursor — omit to let the calendar manage its own navigation state. */
  cursor?: JalaliCursor
  /** Required alongside `cursor` — called with the next cursor when the user navigates months. */
  onCursorChange?: (cursor: JalaliCursor) => void
  /** When set, renders a footer summary + "تایید" button that calls this handler. */
  onConfirm?: () => void
}

/**
 * Two-month Jalali date-range picker. Compact layout matches the search-card
 * calendar; `variant="priced"` matches the room-details calendar (Figma
 * 788:22528). The right-hand month is the earlier one, following RTL reading
 * order; the left arrow moves forward in time, the right arrow moves back.
 */
export function DateRangeCalendar({
  value,
  onChange,
  pricesByDate,
  minDate,
  maxDate,
  unavailableDates,
  priceLabelByDate,
  variant = 'compact',
  className,
  cursor: controlledCursor,
  onCursorChange,
  onConfirm,
}: DateRangeCalendarProps) {
  const [internalCursor, setInternalCursor] = useState(todayCursor)
  const cursor = controlledCursor ?? internalCursor
  const setCursor = (updater: (current: JalaliCursor) => JalaliCursor) => {
    const next = updater(cursor)
    if (onCursorChange) onCursorChange(next)
    else setInternalCursor(next)
  }
  const [hoverIso, setHoverIso] = useState<string | null>(null)
  const secondCursor = addMonths(cursor, 1)
  const today = todayIso()
  const effectiveMinDate = minDate ?? today
  const isPriced = variant === 'priced'
  const hasLegend = isPriced && pricesByDate && Object.keys(pricesByDate).length > 0
  const canConfirm = Boolean(value.from && value.to)
  const summary = formatStaySummary(value)

  function handleDayClick(iso: string) {
    onChange(pickDate(value, iso, unavailableDates ? (day) => unavailableDates.has(day) : undefined))
  }

  const monthGridProps = {
    todayIso: today,
    value,
    hoverIso,
    pricesByDate,
    minDate: effectiveMinDate,
    maxDate,
    unavailableDates,
    priceLabelByDate,
    onDayClick: handleDayClick,
    onDayHover: setHoverIso,
    hideTitle: isPriced,
    nightsOnly: isPriced,
  }

  const nextButton = (
    <button
      type="button"
      className={styles.navButton}
      aria-label="ماه بعد"
      onClick={() => setCursor((c) => addMonths(c, 1))}
    >
      <IconArrowLeft width={isPriced ? 24 : 20} height={isPriced ? 24 : 20} />
    </button>
  )

  const prevButton = (
    <button
      type="button"
      className={styles.navButton}
      aria-label="ماه قبل"
      onClick={() => setCursor((c) => addMonths(c, -1))}
    >
      <IconArrowRight width={isPriced ? 24 : 20} height={isPriced ? 24 : 20} />
    </button>
  )

  return (
    <div
      className={[styles.calendar, isPriced && styles.calendarWithPrices, className].filter(Boolean).join(' ')}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {/*
        DOM order matches the visual (non-RTL-flex) layout used throughout
        this app: the later month renders on the left, the earlier one on
        the right, so the later month and its "next" button come first.
      */}
      {isPriced && (
        <div className={styles.header}>
          <div className={styles.headerMonth}>
            {nextButton}
            <p className={styles.monthTitle}>
              {PERSIAN_MONTH_NAMES[secondCursor.jm - 1]} {toPersianDigits(secondCursor.jy)}
            </p>
          </div>
          <div className={styles.headerMonth}>
            <p className={styles.monthTitle}>
              {PERSIAN_MONTH_NAMES[cursor.jm - 1]} {toPersianDigits(cursor.jy)}
            </p>
            {prevButton}
          </div>
        </div>
      )}

      <div className={styles.months}>
        {!isPriced && nextButton}

        <MonthGrid jalaliYear={secondCursor.jy} jalaliMonth={secondCursor.jm} {...monthGridProps} />

        <MonthGrid jalaliYear={cursor.jy} jalaliMonth={cursor.jm} {...monthGridProps} />

        {!isPriced && prevButton}
      </div>

      {hasLegend && (
        <div className={styles.legend}>
          {LEGEND.map(({ tier, label, className: swatchClassName }) => (
            <span key={tier} className={styles.legendItem}>
              <span className={[styles.legendSwatch, swatchClassName].join(' ')} />
              {label}
            </span>
          ))}
        </div>
      )}

      {onConfirm && (
        <div className={styles.footer} dir="rtl">
          <p className={styles.summary}>{summary || '\u00a0'}</p>
          <Button
            type="button"
            className={styles.confirmButton}
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            تایید
          </Button>
        </div>
      )}
    </div>
  )
}
