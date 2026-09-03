import { useEffect, useRef, useState } from 'react'
import type { HotelRoom } from '../../api/hotelDetail'
import { getRoomPriceForStay } from '../../api/hotelDetail'
import { formatJalaliDisplay, toPersianDigits } from '../../lib/date/jalali'
import { Button } from '../Button'
import { DateRangeCalendar } from '../DateRangeCalendar'
import type { DateRange } from '../DateRangeCalendar'
import { Input } from '../Input'
import { PassengersField } from '../PassengersField'
import type { PassengersValue } from '../PassengersField'
import { IconArrowDown, IconBed, IconDate, IconInformation, IconLocalCafe, IconPeople, IconPlus } from '../icons'
import styles from './HotelRooms.module.scss'

export interface HotelRoomsProps {
  rooms: HotelRoom[]
  startDate: string
  endDate: string
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  passengers: PassengersValue
  onPassengersChange: (value: PassengersValue) => void
  /** No per-room image in the API — falls back to the hotel's own primary photo. */
  fallbackImageUrl?: string
  onSearchAgain?: () => void
  onViewDetails?: (roomId: number) => void
  onReserve?: (roomId: number, roomCount: number) => void
}

function formatRangeLabel(range: DateRange): string {
  if (!range.from) return ''
  if (!range.to) return formatJalaliDisplay(range.from)
  return `${formatJalaliDisplay(range.to)} - ${formatJalaliDisplay(range.from)}`
}

function formatPrice(value: number) {
  return value.toLocaleString('en-US')
}

function RoomCard({
  room,
  startDate,
  endDate,
  fallbackImageUrl,
  onViewDetails,
  onReserve,
}: {
  room: HotelRoom
  startDate: string
  endDate: string
  fallbackImageUrl?: string
  onViewDetails?: (roomId: number) => void
  onReserve?: (roomId: number, roomCount: number) => void
}) {
  const [roomCount, setRoomCount] = useState(1)
  const stayPrice = getRoomPriceForStay(room, startDate, endDate)
  const maxRoomCount = Math.max(1, room.availableCount)

  return (
    <div className={styles.card}>
      <div className={styles.priceColumn}>
        <div className={styles.stepperRow}>
          <span>تعداد اتاق:</span>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => setRoomCount((count) => Math.max(1, count - 1))}
              disabled={roomCount <= 1}
              aria-label="کاهش تعداد اتاق"
            >
              −
            </button>
            <span className={styles.stepperValue}>{toPersianDigits(roomCount)}</span>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => setRoomCount((count) => Math.min(maxRoomCount, count + 1))}
              disabled={roomCount >= maxRoomCount}
              aria-label="افزایش تعداد اتاق"
            >
              <IconPlus width={14} height={14} />
            </button>
          </div>
        </div>

        {stayPrice ? (
          <>
            <span className={styles.priceLabel}>{`قیمت برای ${toPersianDigits(stayPrice.nights)} شب`}</span>
            <span className={styles.price}>
              {formatPrice(stayPrice.fee * roomCount)} <span>تومان</span>
            </span>
            {stayPrice.boardPrice > stayPrice.fee && (
              <span className={styles.boardPrice}>
                با صبحانه: {formatPrice(stayPrice.boardPrice * roomCount)} تومان
              </span>
            )}
          </>
        ) : (
          <span className={styles.priceUnavailable}>قیمت برای این تاریخ در دسترس نیست</span>
        )}

        <Button variant="brand" className={styles.reserveButton} onClick={() => onReserve?.(room.id, roomCount)}>
          رزرو اتاق
        </Button>
      </div>

      <div className={styles.divider} />

      <div className={styles.body}>
        <h4 className={styles.name}>{room.roomKind}</h4>

        <div className={styles.row}>
          <span>
            {toPersianDigits(room.personCount)} بزرگسال
            {room.extraPersonCount > 0 ? ` + ${toPersianDigits(room.extraPersonCount)} نفر اضافه` : ''}
          </span>
          <IconPeople width={24} height={24} />
        </div>
        <div className={styles.row}>
          <span>{toPersianDigits(room.availableCount)} اتاق موجود</span>
          <IconBed width={24} height={24} />
        </div>
        {room.foodServices.length > 0 && (
          <div className={styles.row}>
            <span>{room.foodServices.join('، ')}</span>
            <IconLocalCafe width={24} height={24} />
          </div>
        )}
        <button type="button" className={styles.detailsRow} onClick={() => onViewDetails?.(room.id)}>
          <span>جزئیات و قوانین</span>
          <IconInformation width={24} height={24} />
        </button>
      </div>

      <div className={styles.imageWrapper}>
        {fallbackImageUrl ? <img src={fallbackImageUrl} alt="" className={styles.image} /> : <div className={styles.imagePlaceholder} />}
      </div>
    </div>
  )
}

/** Room list — matches Figma "Hotel detail" node 668:8413; shape confirmed against a live hotel-show response (docs/hotel-detail-plan.md). */
export function HotelRooms({
  rooms,
  startDate,
  endDate,
  dateRange,
  onDateRangeChange,
  passengers,
  onPassengersChange,
  fallbackImageUrl,
  onSearchAgain,
  onViewDetails,
  onReserve,
}: HotelRoomsProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
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
    <div className={styles.section}>
      <div className={styles.searchBar}>
        <Button variant="primary" className={styles.searchButton} onClick={onSearchAgain}>
          جستجوی مجدد
        </Button>

        <PassengersField className={styles.field} value={passengers} onChange={onPassengersChange} showLabel={false} />

        <div className={styles.dateField} ref={dateFieldRef} onClick={() => setIsCalendarOpen(true)}>
          <Input
            placeholder="بازه زمان ورود و خروج را وارد کنید"
            leadingIcon={IconDate}
            trailingIcon={IconArrowDown}
            reverseIcons
            value={formatRangeLabel(dateRange)}
            onFocus={() => setIsCalendarOpen(true)}
            readOnly
          />

          {isCalendarOpen && (
            <DateRangeCalendar
              className={styles.calendarPopover}
              value={dateRange}
              onChange={(range) => {
                onDateRangeChange(range)
                if (range.from && range.to) setIsCalendarOpen(false)
              }}
            />
          )}
        </div>
      </div>

      {rooms.length === 0 ? (
        <p className={styles.emptyState}>اطلاعات اتاق‌ها برای این بازه در دسترس نیست.</p>
      ) : (
        <div className={styles.list}>
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              startDate={startDate}
              endDate={endDate}
              fallbackImageUrl={fallbackImageUrl}
              onViewDetails={onViewDetails}
              onReserve={onReserve}
            />
          ))}
        </div>
      )}
    </div>
  )
}
