import type { ReactNode } from 'react'
import { formatJalaliDisplay } from '../../lib/date/jalali'
import { Button } from '../Button'
import { IconDate, IconStar } from '../icons'
import styles from './BookingHotelCard.module.scss'

export interface BookingHotelCardHotel {
  name: string
  stars: number
  imageUrl?: string
}

export interface BookingHotelCardProps {
  hotel: BookingHotelCardHotel
  startDate: string
  endDate: string
  /** Price breakdown rows — differs per booking-flow page, so it's a slot rather than fixed props. */
  children: ReactNode
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  primaryLoading?: boolean
  secondaryLabel: string
  onSecondary: () => void
}

/** Sticky hotel-summary sidebar shared by every booking-flow page — matches Figma node 692:13988 family. */
export function BookingHotelCard({
  hotel,
  startDate,
  endDate,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryLoading,
  secondaryLabel,
  onSecondary,
}: BookingHotelCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {hotel.imageUrl ? <img src={hotel.imageUrl} alt="" className={styles.image} /> : <div className={styles.imagePlaceholder} />}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{hotel.name}</h3>
        <div className={styles.rating}>
          {Array.from({ length: hotel.stars }, (_, index) => (
            <IconStar key={index} width={20} height={20} className={styles.star} />
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.dateRow}>
          <span className={styles.dateValue}>{formatJalaliDisplay(startDate)}</span>
          <span className={styles.dateLabel}>
            تاریخ ورود: <IconDate width={20} height={20} />
          </span>
        </div>
        <div className={styles.dateRow}>
          <span className={styles.dateValue}>{formatJalaliDisplay(endDate)}</span>
          <span className={styles.dateLabel}>
            تاریخ خروج: <IconDate width={20} height={20} />
          </span>
        </div>

        <div className={styles.divider} />

        {children}

        <Button variant="primary" className={styles.primaryButton} onClick={onPrimary} disabled={primaryDisabled || primaryLoading}>
          {primaryLoading ? 'در حال پردازش...' : primaryLabel}
        </Button>
        <Button variant="secondary" className={styles.secondaryButton} onClick={onSecondary}>
          {secondaryLabel}
        </Button>
      </div>
    </div>
  )
}
