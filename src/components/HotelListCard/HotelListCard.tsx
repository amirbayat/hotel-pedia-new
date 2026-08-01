import { useState } from 'react'
import { toPersianDigits } from '../../lib/date/jalali'
import { Button } from '../Button'
import { IconFavorits, IconLocationPin, IconStar } from '../icons'
import styles from './HotelListCard.module.scss'

export interface HotelListCardProps {
  imageSrc?: string
  name: string
  /** 1-5 */
  stars: number
  /** 0-10 aggregate score, e.g. 8.8. Omit when the API doesn't provide one (see hotelSearch.ts). */
  score?: number
  /** Text label next to the score badge, e.g. "عالی". Omit when unavailable. */
  ratingLabel?: string
  /** Omit when unavailable — the hotel-search API doesn't return a review count yet. */
  reviewCount?: number
  /** Feature badges, e.g. "لوکس"، "بهترین منطقه". */
  tags?: string[]
  address: string
  /** e.g. 2 → "۲ شب". Comes from the current search params, not the API response. */
  nights?: number
  /** e.g. "۲ بزرگسال - ۱ اتاق". Comes from the current search params, not the API response. */
  occupancySummary?: string
  isAvailable?: boolean
  price?: number
  /** Pre-discount price, shown struck through. Omit to hide the discount row. */
  originalPrice?: number
  discountPercent?: number
  currency?: string
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onReserve?: () => void
  onViewDetails?: () => void
}

function formatPrice(value: number) {
  return value.toLocaleString('en-US')
}

/** Horizontal hotel card for the listing page — see docs/hotel-listing-plan.md §3.2. */
export function HotelListCard({
  imageSrc,
  name,
  stars,
  score,
  ratingLabel,
  reviewCount,
  tags = [],
  address,
  nights,
  occupancySummary,
  isAvailable = true,
  price,
  originalPrice,
  discountPercent,
  currency = 'تومان',
  isFavorite,
  onToggleFavorite,
  onReserve,
  onViewDetails,
}: HotelListCardProps) {
  const [favorite, setFavorite] = useState(isFavorite ?? false)

  function handleToggleFavorite() {
    setFavorite((current) => !current)
    onToggleFavorite?.()
  }

  return (
    // DOM order matches the Figma visual (non-RTL-flex) layout, like
    // DateRangeCalendar: actions column, divider, info column, image —
    // left to right, since this container doesn't set direction: rtl.
    <div className={styles.card}>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.favoriteButton}
          onClick={handleToggleFavorite}
          aria-pressed={favorite}
          aria-label="علاقه‌مندی"
        >
          <IconFavorits width={24} height={24} className={favorite ? styles.favoriteActive : undefined} />
        </button>

        {(nights != null || occupancySummary) && (
          <div className={styles.stayInfo}>
            {nights != null && <span>{toPersianDigits(nights)} شب</span>}
            {occupancySummary && <span>{occupancySummary}</span>}
          </div>
        )}

        {isAvailable ? (
          <>
            {price != null && (
              <div className={styles.priceBlock}>
                {discountPercent ? <span className={styles.discountBadge}>٪{discountPercent}</span> : null}
                <div className={styles.priceStack}>
                  {originalPrice && (
                    <span className={styles.originalPrice}>
                      {formatPrice(originalPrice)} {currency}
                    </span>
                  )}
                  <span className={styles.priceValue}>
                    {formatPrice(price)} {currency}
                  </span>
                </div>
              </div>
            )}

            <Button variant="brand" className={styles.reserveButton} onClick={onReserve}>
              مشاهده و رزرو
            </Button>
          </>
        ) : (
          <>
            <span className={styles.soldOut}>تکمیل ظرفیت</span>
            <Button variant="secondary" className={styles.reserveButton} onClick={onViewDetails}>
              مشاهده جزئیات
            </Button>
          </>
        )}
      </div>

      <div className={styles.divider} />

      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>

        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {Array.from({ length: stars }, (_, i) => (
              <IconStar key={i} width={16} height={16} className={styles.starFilled} />
            ))}
          </div>
          <span className={styles.starsLabel}>ستاره</span>
          <span className={styles.starsValue}>{stars}</span>
        </div>

        {(score != null || reviewCount != null) && (
          <div className={styles.userRate}>
            {score != null && <span className={styles.scoreBadge}>{score.toFixed(1)}</span>}
            {(ratingLabel || reviewCount != null) && (
              <div className={styles.userRateText}>
                {ratingLabel && <span className={styles.ratingLabel}>{ratingLabel}</span>}
                {reviewCount != null && <span className={styles.reviewCount}>{formatPrice(reviewCount)} نفر</span>}
              </div>
            )}
          </div>
        )}

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className={styles.address}>
          <IconLocationPin width={16} height={16} className={styles.addressIcon} />
          <span>{address}</span>
        </div>
      </div>

      <div className={styles.imageWrapper}>
        {imageSrc ? <img src={imageSrc} alt="" className={styles.image} /> : <div className={styles.imagePlaceholder} />}
      </div>
    </div>
  )
}
