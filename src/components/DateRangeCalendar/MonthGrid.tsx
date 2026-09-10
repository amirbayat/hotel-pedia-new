import { useMemo } from 'react'
import {
  buildMonthMatrix,
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEKDAY_LABELS,
  toPersianDigits,
} from '../../lib/date/jalali'
import { getPreviewRange, isInRange, isLastStayNight, isOutOfBounds, isRangeEnd, isRangeStart, isStayNight } from './rangeUtils'
import type { DateRange, PricesByDate } from './types'
import styles from './DateRangeCalendar.module.scss'

const FRIDAY_WEEKDAY = 6

const TIER_CLASS_NAME = {
  cheap: styles.tierCheap,
  medium: styles.tierMedium,
  expensive: styles.tierExpensive,
} as const

export interface MonthGridProps {
  jalaliYear: number
  jalaliMonth: number
  todayIso: string
  /** The committed selection — only these two dates get the solid "selected" pill. */
  value: DateRange
  /** Day currently under the pointer, used to preview the range before `to` is picked. */
  hoverIso: string | null
  pricesByDate?: PricesByDate
  minDate?: string
  maxDate?: string
  /** Dates known to be unbookable (e.g. sold out) — disabled just like out-of-bounds days. */
  unavailableDates?: Set<string>
  /** Formatted per-night price shown under the day number, e.g. "۴۵,۵۰۰". */
  priceLabelByDate?: Partial<Record<string, string>>
  onDayClick: (iso: string) => void
  onDayHover: (iso: string | null) => void
  /** Hide the month/year heading — used when the parent renders a shared two-month header. */
  hideTitle?: boolean
  /**
   * When true, highlight billed nights [from, to) and treat `to` as checkout.
   * Used by the priced room calendar so a 1-night stay does not select checkout.
   */
  nightsOnly?: boolean
}

export function MonthGrid({
  jalaliYear,
  jalaliMonth,
  todayIso,
  value,
  hoverIso,
  pricesByDate,
  minDate,
  maxDate,
  unavailableDates,
  priceLabelByDate,
  onDayClick,
  onDayHover,
  hideTitle = false,
  nightsOnly = false,
}: MonthGridProps) {
  const weeks = useMemo(() => buildMonthMatrix(jalaliYear, jalaliMonth), [jalaliYear, jalaliMonth])
  const previewRange = getPreviewRange(value, hoverIso)

  return (
    <div className={styles.month}>
      {!hideTitle && (
        <p className={styles.monthTitle}>
          {PERSIAN_MONTH_NAMES[jalaliMonth - 1]} {toPersianDigits(jalaliYear)}
        </p>
      )}

      <div className={styles.weekdays}>
        {PERSIAN_WEEKDAY_LABELS.map((label, index) => (
          <span key={label} className={[styles.weekday, index === FRIDAY_WEEKDAY && styles.friday].filter(Boolean).join(' ')}>
            {label}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            if (!day) return <span key={`${weekIndex}-${dayIndex}`} className={styles.emptyCell} />

            const tier = pricesByDate?.[day.iso]
            const priceLabel = priceLabelByDate?.[day.iso]
            const unavailableNight = unavailableDates?.has(day.iso) ?? false
            const completingRange = nightsOnly && Boolean(value.from && !value.to)
            const disabled =
              isOutOfBounds(day.iso, minDate, maxDate) || (unavailableNight && !completingRange)
            const selected = nightsOnly
              ? isRangeStart(day.iso, previewRange) || isLastStayNight(day.iso, previewRange)
              : isRangeStart(day.iso, value) || isRangeEnd(day.iso, value)
            const inRange = nightsOnly
              ? isStayNight(day.iso, previewRange) && !selected
              : isInRange(day.iso, previewRange)
            const isCheckout = nightsOnly && isRangeEnd(day.iso, previewRange)
            const isHoverPreviewEnd = !value.to && hoverIso === day.iso && day.iso !== value.from

            return (
              <button
                key={day.iso}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                className={[
                  styles.day,
                  priceLabel !== undefined && styles.dayWithPrice,
                  day.weekday === FRIDAY_WEEKDAY && styles.friday,
                  tier && TIER_CLASS_NAME[tier],
                  unavailableNight && styles.unavailable,
                  inRange && styles.inRange,
                  selected && styles.selected,
                  (nightsOnly ? isCheckout : isHoverPreviewEnd) && styles.previewEnd,
                  day.iso === todayIso && styles.today,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onDayClick(day.iso)}
                onMouseEnter={() => onDayHover(day.iso)}
                onMouseLeave={() => onDayHover(null)}
              >
                <span className={styles.dayNumber}>{toPersianDigits(day.jd)}</span>
                {priceLabel !== undefined && <span className={styles.dayPrice}>{priceLabel}</span>}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
