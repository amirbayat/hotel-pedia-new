import { useEffect, useRef, useState } from 'react'
import { formatJalaliDisplay } from '../../lib/date/jalali'
import { Button } from '../Button'
import { DateRangeCalendar } from '../DateRangeCalendar'
import type { DateRange } from '../DateRangeCalendar'
import { DestinationSearchField } from '../DestinationSearchField'
import { Input } from '../Input'
import { PassengersField } from '../PassengersField'
import type { PassengersValue } from '../PassengersField'
import { IconBed, IconCalendar, IconSearch } from '../icons'
import styles from './SearchCard.module.scss'

function formatRangeLabel(range: DateRange): string {
  if (!range.from) return ''
  if (!range.to) return formatJalaliDisplay(range.from)
  return `${formatJalaliDisplay(range.to)} - ${formatJalaliDisplay(range.from)}`
}

/**
 * The floating search widget that straddles HomeHeader and the section below
 * it. Only the "هتل" tab is wired up for now — the other travel-type tabs
 * (پرواز/اتوبوس/تور/ویلا) will be added once their icons/behavior are defined.
 */
export function SearchCard() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [passengers, setPassengers] = useState<PassengersValue>({ adults: 2, childrenAges: [], rooms: 1 })
  const dateFieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isCalendarOpen) return

    function handleOutsideClick(event: MouseEvent) {
      if (dateFieldRef.current && !dateFieldRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isCalendarOpen])

  return (
    <div className={styles.card}>
      <div className={styles.tabs}>
        <button type="button" className={styles.tabActive}>
          <span className={styles.tabIcon}>
            <IconBed width={24} height={24} />
          </span>
          <span className={styles.tabLabel}>هتل</span>
        </button>
      </div>

      <div className={styles.fields}>
        <Button variant="primary" icon={IconSearch} className={styles.searchButton}>
          جستجو
        </Button>

        <PassengersField className={styles.field} value={passengers} onChange={setPassengers} />

        <div className={styles.dateField} ref={dateFieldRef}>
          <Input
            label="تاریخ ورود - تاریخ خروج"
            placeholder="بازه زمان ورود و خروج را وارد کنید"
            leadingIcon={IconCalendar}
            value={formatRangeLabel(range)}
            onFocus={() => setIsCalendarOpen(true)}
            readOnly
          />

          {isCalendarOpen && (
            <DateRangeCalendar className={styles.calendarPopover} value={range} onChange={setRange} />
          )}
        </div>

        <DestinationSearchField className={styles.field} />
      </div>
    </div>
  )
}
