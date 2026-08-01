import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Destination } from '../../api/destinations'
import { formatJalaliDisplay } from '../../lib/date/jalali'
import { Button } from '../Button'
import { DateRangeCalendar } from '../DateRangeCalendar'
import type { DateRange } from '../DateRangeCalendar'
import { DestinationSearchField } from '../DestinationSearchField'
import { Input } from '../Input'
import { PassengersField } from '../PassengersField'
import type { PassengersValue } from '../PassengersField'
import { IconArrowDown, IconDate, IconHotel } from '../icons'
import styles from './SearchCard.module.scss'

const DEFAULT_CITY_SLUG = 'تهران'

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
  const [citySlug, setCitySlug] = useState(DEFAULT_CITY_SLUG)
  const dateFieldRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  function handleDestinationSelect(destination: Destination) {
    setCitySlug(destination.type === 'city' ? destination.slug : destination.citySlug)
  }

  function handleSearch() {
    const params = new URLSearchParams({ city: citySlug, sort_by: 'default' })
    if (range.from) params.set('check_in', range.from)
    if (range.to) params.set('check_out', range.to)
    params.set('adults', String(passengers.adults))
    params.set('rooms', String(passengers.rooms))
    if (passengers.childrenAges.length) params.set('children', passengers.childrenAges.join(','))
    navigate(`/hotels?${params}`)
  }

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
            <IconHotel width={24} height={24} />
          </span>
          <span className={styles.tabLabel}>هتل</span>
        </button>
      </div>

      <div className={styles.fields}>
        <Button variant="primary" className={styles.searchButton} onClick={handleSearch}>
          جستجو
        </Button>

        <PassengersField className={styles.field} value={passengers} onChange={setPassengers} />

        <div className={styles.dateField} ref={dateFieldRef} onClick={() => setIsCalendarOpen(true)}>
          <Input
            label="تاریخ ورود - تاریخ خروج"
            placeholder="بازه زمان ورود و خروج را وارد کنید"
            leadingIcon={IconDate}
            trailingIcon={IconArrowDown}
            reverseIcons
            value={formatRangeLabel(range)}
            onFocus={() => setIsCalendarOpen(true)}
            readOnly
          />

          {isCalendarOpen && (
            <DateRangeCalendar className={styles.calendarPopover} value={range} onChange={setRange} />
          )}
        </div>

        <DestinationSearchField className={styles.field} reverseIcons onSelect={handleDestinationSelect} />
      </div>
    </div>
  )
}
