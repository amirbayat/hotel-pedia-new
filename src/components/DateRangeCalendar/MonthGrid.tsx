import { useMemo } from 'react'
import {
  buildMonthMatrix,
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEKDAY_LABELS,
  toPersianDigits,
} from '../../lib/date/jalali'
import { getPreviewRange, isInRange, isOutOfBounds, isRangeEnd, isRangeStart } from './rangeUtils'
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
  onDayClick: (iso: string) => void
  onDayHover: (iso: string | null) => void
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
  onDayClick,
  onDayHover,
}: MonthGridProps) {
  const weeks = useMemo(() => buildMonthMatrix(jalaliYear, jalaliMonth), [jalaliYear, jalaliMonth])
  const previewRange = getPreviewRange(value, hoverIso)

  return (
    <div className={styles.month}>
      <p className={styles.monthTitle}>
        {PERSIAN_MONTH_NAMES[jalaliMonth - 1]} {toPersianDigits(jalaliYear)}
      </p>

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
            const disabled = isOutOfBounds(day.iso, minDate, maxDate)
            const selected = isRangeStart(day.iso, value) || isRangeEnd(day.iso, value)
            const isHoverPreviewEnd = !value.to && hoverIso === day.iso && day.iso !== value.from

            return (
              <button
                key={day.iso}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                className={[
                  styles.day,
                  day.weekday === FRIDAY_WEEKDAY && styles.friday,
                  tier && TIER_CLASS_NAME[tier],
                  isInRange(day.iso, previewRange) && styles.inRange,
                  selected && styles.selected,
                  isHoverPreviewEnd && styles.previewEnd,
                  day.iso === todayIso && styles.today,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onDayClick(day.iso)}
                onMouseEnter={() => onDayHover(day.iso)}
                onMouseLeave={() => onDayHover(null)}
              >
                {toPersianDigits(day.jd)}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
