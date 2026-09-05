import { useEffect, useMemo, useState } from 'react'
import type { HotelRoom, HotelRule } from '../../api/hotelDetail'
import { getRoomPriceForStay } from '../../api/hotelDetail'
import { useHotelCalendars } from '../../hooks/useHotelCalendars'
import { getAmenityIcon } from '../../lib/amenityIcons'
import { addMonths, jalaliMonthRangeIso, todayCursor, todayIso, toPersianDigits } from '../../lib/date/jalali'
import type { JalaliCursor } from '../../lib/date/jalali'
import { computePriceTiers } from '../../lib/priceTiers'
import { Button } from '../Button'
import { DateRangeCalendar } from '../DateRangeCalendar'
import type { DateRange } from '../DateRangeCalendar'
import { IconArrowLeft, IconCalendar, IconClose, IconInformation, IconPicture, IconPlus, IconRules } from '../icons'
import type { IconComponent } from '../icons/types'
import styles from './RoomDetailsModal.module.scss'

type ModalTab = 'gallery' | 'amenities' | 'calendar' | 'cancellation'

const TABS: { id: ModalTab; label: string; icon: IconComponent }[] = [
  { id: 'gallery', label: 'گالری تصاویر', icon: IconPicture },
  { id: 'amenities', label: 'امکانات اتاق', icon: IconInformation },
  { id: 'calendar', label: 'تقویم اتاق', icon: IconCalendar },
  { id: 'cancellation', label: 'قوانین کنسلی', icon: IconRules },
]

export interface RoomDetailsModalProps {
  open: boolean
  onClose: () => void
  /** Undefined when the page has no numeric hotel id (see HotelDetail type) — the calendar tab just renders without price-tier colors. */
  hotelId: number | undefined
  room: HotelRoom | null
  /** No per-room images in the hotel-show API — falls back to the hotel's own gallery photos. */
  galleryImages: string[]
  /** Currently searched stay — used as the default selection before the user picks a range in the calendar tab. */
  startDate?: string
  endDate?: string
  cancellationRules: HotelRule[]
  /** Forwarded to the calendars API so prices come back with the wallet's discount applied. */
  walletId?: number
  onBook?: (roomId: number, roomCount: number) => void
}

function formatPrice(value: number) {
  return value.toLocaleString('en-US')
}

/** "جزئیات و قوانین" room modal — matches Figma nodes 759:18013 / 788:16681 / 788:20918 / 788:22962. */
export function RoomDetailsModal({
  open,
  onClose,
  hotelId,
  room,
  galleryImages,
  startDate,
  endDate,
  cancellationRules,
  walletId,
  onBook,
}: RoomDetailsModalProps) {
  const [tab, setTab] = useState<ModalTab>('gallery')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [roomCount, setRoomCount] = useState(1)
  const [range, setRange] = useState<DateRange>({ from: startDate ?? null, to: endDate ?? null })
  const [cursor, setCursor] = useState<JalaliCursor>(todayCursor())

  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  // Reset to a clean state whenever the modal is (re-)opened for a room.
  useEffect(() => {
    if (!open || !room) return
    setTab('gallery')
    setActiveImageIndex(0)
    setRoomCount(1)
    setRange({ from: startDate ?? null, to: endDate ?? null })
    setCursor(todayCursor())
  }, [open, room, startDate, endDate])

  const secondCursor = addMonths(cursor, 1)
  const visibleRange = useMemo(() => {
    const { start } = jalaliMonthRangeIso(cursor)
    const { end } = jalaliMonthRangeIso(secondCursor)
    return { startDate: start, endDate: end }
  }, [cursor, secondCursor])

  const { data: calendarDays } = useHotelCalendars(
    room && hotelId ? { hotelId, startDate: visibleRange.startDate, endDate: visibleRange.endDate, walletId } : undefined,
  )

  const roomCalendarDays = useMemo(() => {
    if (!room || !calendarDays) return []
    return calendarDays.filter((day) => day.roomId === room.id)
  }, [calendarDays, room])

  const nightlyPrices = useMemo(() => {
    if (roomCalendarDays.length > 0) {
      return Object.fromEntries(roomCalendarDays.map((day) => [day.date.slice(0, 10), day.sellPrice]))
    }
    if (!room) return {}
    return Object.fromEntries(room.calendar.map((day) => [day.date.slice(0, 10), day.fee]))
  }, [roomCalendarDays, room])

  const pricesByDate = useMemo(() => computePriceTiers(nightlyPrices), [nightlyPrices])

  // "Sold out" nights (remained_count <= 0) are disabled outright, and picking
  // a range can't stretch over one — see rangeUtils.pickDate's isDayBlocked.
  const unavailableDates = useMemo(
    () => new Set(roomCalendarDays.filter((day) => day.remainedCount <= 0).map((day) => day.date.slice(0, 10))),
    [roomCalendarDays],
  )

  const priceLabelByDate = useMemo(() => {
    const map: Record<string, string> = {}
    for (const [date, price] of Object.entries(nightlyPrices)) {
      map[date] = toPersianDigits(formatPrice(price))
    }
    return map
  }, [nightlyPrices])

  if (!open || !room) return null

  const effectiveStart = range.from ?? startDate
  const effectiveEnd = range.to ?? endDate
  const stayPrice =
    effectiveStart && effectiveEnd ? getRoomPriceForStay(room, effectiveStart, effectiveEnd) : null
  const maxRoomCount = Math.max(1, room.availableCount)
  const roomAmenities = [...room.amenities, ...room.foodServices]

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.dialog} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="بستن">
            <IconClose width={20} height={20} />
          </button>
          <h2 className={styles.title}>جزئیات و قوانین {room.roomKind}</h2>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>
            {tab === 'gallery' &&
              (galleryImages.length === 0 ? (
                <div className={styles.emptyState}>تصویری برای این اتاق در دسترس نیست.</div>
              ) : (
                <div className={styles.gallery}>
                  <div className={styles.galleryMain}>
                    <img src={galleryImages[activeImageIndex]} alt="" className={styles.galleryMainImage} />
                  </div>
                  <div className={styles.thumbStrip}>
                    {galleryImages.map((src, index) => (
                      <button
                        type="button"
                        key={src + index}
                        className={[styles.thumb, index === activeImageIndex && styles.thumbActive].filter(Boolean).join(' ')}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img src={src} alt="" className={styles.thumbImage} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            {tab === 'amenities' &&
              (roomAmenities.length === 0 ? (
                <div className={styles.emptyState}>امکاناتی برای این اتاق ثبت نشده است.</div>
              ) : (
                <div className={styles.amenitiesGrid}>
                  {roomAmenities.map((amenity, index) => {
                    const Icon = getAmenityIcon(amenity)
                    return (
                      <div className={styles.amenityCell} key={amenity + index}>
                        <Icon width={24} height={24} className={styles.amenityIcon} />
                        <span>{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              ))}

            {tab === 'calendar' && (
              <DateRangeCalendar
                className={styles.embeddedCalendar}
                variant="priced"
                value={range}
                onChange={setRange}
                pricesByDate={pricesByDate}
                unavailableDates={unavailableDates}
                priceLabelByDate={priceLabelByDate}
                cursor={cursor}
                onCursorChange={setCursor}
                minDate={todayIso()}
              />
            )}

            {tab === 'cancellation' &&
              (cancellationRules.length === 0 ? (
                <div className={styles.emptyState}>قوانین کنسلی برای این هتل ثبت نشده است.</div>
              ) : (
                <ul className={styles.ruleList}>
                  {cancellationRules.map((rule) => (
                    <li key={rule.id} className={styles.ruleItem}>
                      <span className={styles.ruleTitle}>{rule.title}</span>
                      <span>{rule.content}</span>
                    </li>
                  ))}
                </ul>
              ))}
          </div>

          <div className={styles.sidebar}>
            <nav className={styles.tabs}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={[styles.tab, tab === id && styles.tabActive].filter(Boolean).join(' ')}
                  onClick={() => setTab(id)}
                >
                  <IconArrowLeft width={16} height={16} className={styles.tabChevron} />
                  <span className={styles.tabLabel}>{label}</span>
                  <Icon width={24} height={24} className={styles.tabIcon} />
                </button>
              ))}
            </nav>

            <div className={styles.booking}>
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
                  <span className={styles.priceValue}>{toPersianDigits(formatPrice(stayPrice.fee * roomCount))} تومان</span>
                </>
              ) : (
                <span className={styles.priceUnavailable}>
                  {effectiveStart && effectiveEnd
                    ? 'قیمت برای این تاریخ در دسترس نیست'
                    : 'برای مشاهده قیمت، تاریخ را انتخاب کنید'}
                </span>
              )}

              <Button
                variant="brand"
                className={styles.bookButton}
                onClick={() => onBook?.(room.id, roomCount)}
                disabled={!stayPrice}
              >
                رزرو اتاق
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
