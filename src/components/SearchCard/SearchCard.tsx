import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Destination } from '../../api/destinations'
import { formatJalaliDayMonthRange } from '../../lib/date/jalali'
import { Button } from '../Button'
import { DateRangeCalendar } from '../DateRangeCalendar'
import type { DateRange } from '../DateRangeCalendar'
import { DestinationSearchField } from '../DestinationSearchField'
import { Input } from '../Input'
import { PassengersField } from '../PassengersField'
import type { PassengersValue } from '../PassengersField'
import { IconArrowDown, IconDate } from '../icons'
import styles from './SearchCard.module.scss'

function buildDateError(range: DateRange): string {
  const errors: string[] = []
  if (!range.from) errors.push('تاریخ ورود را وارد کنید.')
  if (!range.to) errors.push('تاریخ خروج را وارد کنید.')
  return errors.join(' ')
}

/**
 * The floating search widget that straddles HomeHeader and the section below it.
 */
export function SearchCard() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [passengers, setPassengers] = useState<PassengersValue>({ adults: 2, childrenAges: [], rooms: 1 })
  const [destination, setDestination] = useState('')
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [destinationError, setDestinationError] = useState('')
  const [dateError, setDateError] = useState('')
  const dateFieldRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  function handleDestinationSelect(selected: Destination) {
    setSelectedDestination(selected)
    setDestinationError('')
  }

  function handleSearch() {
    const nextDestinationError = !destination.trim() ? 'مقصد یا هتل را وارد کنید.' : ''
    const nextDateError = buildDateError(range)

    setDestinationError(nextDestinationError)
    setDateError(nextDateError)

    if (nextDestinationError || nextDateError) return

    const params = new URLSearchParams({
      adults: String(passengers.adults),
      rooms: String(passengers.rooms),
    })
    if (range.from) params.set('check_in', range.from)
    if (range.to) params.set('check_out', range.to)
    if (passengers.childrenAges.length) params.set('children', passengers.childrenAges.join(','))

    if (selectedDestination?.type === 'hotel') {
      params.set('hotel_id', String(selectedDestination.id))
      navigate(`/hotels/${selectedDestination.slug}?${params}`)
      return
    }

    params.set('city', selectedDestination?.type === 'city' ? selectedDestination.slug : destination.trim())
    params.set('sort_by', 'default')
    navigate(`/hotels?${params}`)
  }

  function handleRangeChange(next: DateRange) {
    setRange(next)
    if (dateError) setDateError(buildDateError(next))
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
      <div className={styles.fields}>
        <Button variant="primary" className={styles.searchButton} onClick={handleSearch}>
          جستجو
        </Button>

        <PassengersField className={styles.field} value={passengers} onChange={setPassengers} reserveHintSpace />

        <div className={styles.dateField} ref={dateFieldRef} onClick={() => setIsCalendarOpen(true)}>
          <Input
            label="تاریخ ورود - تاریخ خروج"
            placeholder="بازه زمان ورود و خروج را وارد کنید"
            leadingIcon={IconDate}
            trailingIcon={IconArrowDown}
            reverseIcons
            value={formatJalaliDayMonthRange(range)}
            error={dateError || undefined}
            reserveHintSpace
            dir="rtl"
            onFocus={() => setIsCalendarOpen(true)}
            readOnly
          />

          {isCalendarOpen && (
            <DateRangeCalendar
              className={styles.calendarPopover}
              value={range}
              onChange={handleRangeChange}
              onConfirm={() => setIsCalendarOpen(false)}
            />
          )}
        </div>

        <DestinationSearchField
          className={styles.field}
          reverseIcons
          value={destination}
          onChange={(value) => {
            setDestination(value)
            setSelectedDestination(null)
            if (value.trim()) setDestinationError('')
          }}
          error={destinationError || undefined}
          reserveHintSpace
          showDefaultSuggestionsOnFocus
          onSelect={handleDestinationSelect}
        />
      </div>
    </div>
  )
}
