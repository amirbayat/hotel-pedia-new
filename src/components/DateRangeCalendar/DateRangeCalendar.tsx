import { useState } from 'react'
import { addMonths, todayCursor, todayIso } from '../../lib/date/jalali'
import { IconArrowLeft, IconArrowRight } from '../icons'
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
  className?: string
}

/**
 * Two-month Jalali date-range picker (matches the Hotelpedia search-card
 * calendar). The right-hand month is the earlier one, following RTL reading
 * order; the left arrow moves forward in time, the right arrow moves back.
 */
export function DateRangeCalendar({ value, onChange, pricesByDate, minDate, maxDate, className }: DateRangeCalendarProps) {
  const [cursor, setCursor] = useState(todayCursor)
  const [hoverIso, setHoverIso] = useState<string | null>(null)
  const secondCursor = addMonths(cursor, 1)
  const today = todayIso()
  const effectiveMinDate = minDate ?? today
  const hasLegend = pricesByDate && Object.keys(pricesByDate).length > 0

  function handleDayClick(iso: string) {
    onChange(pickDate(value, iso))
  }

  return (
    <div className={[styles.calendar, className].filter(Boolean).join(' ')}>
      {/*
        DOM order matches the visual (non-RTL-flex) layout used throughout
        this app: the later month renders on the left, the earlier one on
        the right, so the later month and its "next" button come first.
      */}
      <div className={styles.months}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="ماه بعد"
          onClick={() => setCursor((c) => addMonths(c, 1))}
        >
          <IconArrowLeft width={20} height={20} />
        </button>

        <MonthGrid
          jalaliYear={secondCursor.jy}
          jalaliMonth={secondCursor.jm}
          todayIso={today}
          value={value}
          hoverIso={hoverIso}
          pricesByDate={pricesByDate}
          minDate={effectiveMinDate}
          maxDate={maxDate}
          onDayClick={handleDayClick}
          onDayHover={setHoverIso}
        />

        <MonthGrid
          jalaliYear={cursor.jy}
          jalaliMonth={cursor.jm}
          todayIso={today}
          value={value}
          hoverIso={hoverIso}
          pricesByDate={pricesByDate}
          minDate={effectiveMinDate}
          maxDate={maxDate}
          onDayClick={handleDayClick}
          onDayHover={setHoverIso}
        />

        <button
          type="button"
          className={styles.navButton}
          aria-label="ماه قبل"
          onClick={() => setCursor((c) => addMonths(c, -1))}
        >
          <IconArrowRight width={20} height={20} />
        </button>
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
    </div>
  )
}
