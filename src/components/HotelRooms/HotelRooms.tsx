import type { HotelRoom } from '../../api/hotelDetail'
import { getRoomPriceForStay } from '../../api/hotelDetail'
import { toPersianDigits } from '../../lib/date/jalali'
import { Button } from '../Button'
import { IconBed, IconLocalCafe, IconPeople } from '../icons'
import styles from './HotelRooms.module.scss'

export interface HotelRoomsProps {
  rooms: HotelRoom[]
  startDate: string
  endDate: string
  /** Display-only summary of the current search — e.g. "۲ بزرگسال - ۱ اتاق". */
  occupancySummary: string
  dateRangeLabel: string
  /** No per-room image in the API — falls back to the hotel's own primary photo. */
  fallbackImageUrl?: string
  onSearchAgain?: () => void
  onViewDetails?: (roomId: number) => void
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
}: {
  room: HotelRoom
  startDate: string
  endDate: string
  fallbackImageUrl?: string
  onViewDetails?: (roomId: number) => void
}) {
  const stayPrice = getRoomPriceForStay(room, startDate, endDate)

  return (
    <div className={styles.card}>
      <div className={styles.priceColumn}>
        {stayPrice ? (
          <>
            <span className={styles.price}>
              {formatPrice(stayPrice.fee)} <span>تومان</span>
            </span>
            {stayPrice.boardPrice > stayPrice.fee && (
              <span className={styles.boardPrice}>
                با صبحانه: {formatPrice(stayPrice.boardPrice)} تومان
              </span>
            )}
          </>
        ) : (
          <span className={styles.priceUnavailable}>قیمت برای این تاریخ در دسترس نیست</span>
        )}
        <Button variant="secondary" className={styles.detailsButton} onClick={() => onViewDetails?.(room.id)}>
          مشاهده جزئیات
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
  occupancySummary,
  dateRangeLabel,
  fallbackImageUrl,
  onSearchAgain,
  onViewDetails,
}: HotelRoomsProps) {
  return (
    <div className={styles.section}>
      <div className={styles.searchBar}>
        <Button variant="primary" onClick={onSearchAgain}>
          جستجوی مجدد
        </Button>
        <div className={styles.searchField}>{dateRangeLabel}</div>
        <div className={styles.searchField}>{occupancySummary}</div>
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
