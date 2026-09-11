import { getAmenityIcon } from '../../lib/amenityIcons'
import { IconLocationPin, IconShare, IconStar } from '../icons'
import styles from './HotelSummary.module.scss'

export interface HotelSummaryProps {
  name: string
  /** 1-5 */
  stars: number
  /** 0-10 aggregate score. Omit when the API doesn't provide one. */
  score?: number
  reviewCount?: number
  address: string
  amenities?: string[]
  tags?: string[]
  /** Trusted HTML from the hotel-show API's `description` field. */
  description?: string
}

/** Best-effort label from a 0-10 score — the API doesn't provide one (same gap as hotelSearch.ts). */
function ratingLabel(score: number): string {
  if (score >= 9) return 'عالی'
  if (score >= 7) return 'خیلی خوب'
  if (score >= 5) return 'خوب'
  return 'متوسط'
}

/** Title, rating, amenities, and address — map preview removed from this block. */
export function HotelSummary({
  name,
  stars,
  score,
  reviewCount,
  address,
  amenities = [],
  tags = [],
  description,
}: HotelSummaryProps) {
  async function handleShare() {
    const shareData = { title: name, url: window.location.href }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // user cancelled the share sheet — nothing to do
      }
      return
    }
    await navigator.clipboard.writeText(shareData.url)
  }

  return (
    <div className={styles.summary}>
      <div className={styles.details}>
        <div className={styles.topRow}>
          <h1 className={styles.name}>{name}</h1>
          <button type="button" className={styles.iconButton} onClick={handleShare} aria-label="اشتراک‌گذاری">
            <IconShare width={24} height={24} />
          </button>
        </div>

        {description ? (
          // eslint-disable-next-line react/no-danger
          <div className={styles.description} dangerouslySetInnerHTML={{ __html: description }} />
        ) : null}

        {amenities.length > 0 && (
          <ul className={styles.amenities}>
            {amenities.map((amenity) => {
              const Icon = getAmenityIcon(amenity)
              return (
                <li key={amenity} className={styles.amenity}>
                  <Icon width={18} height={18} className={styles.amenityIcon} />
                  <span>{amenity}</span>
                </li>
              )
            })}
          </ul>
        )}

        <div className={styles.ratingRow}>
          <span className={styles.starsValue}>{stars}</span>
          <span className={styles.starsLabel}>ستاره</span>
          <div className={styles.stars}>
            {Array.from({ length: stars }, (_, i) => (
              <IconStar key={i} width={24} height={24} className={styles.starFilled} />
            ))}
          </div>
        </div>

        {(score != null || reviewCount != null) && (
          <div className={styles.userRate}>
            {score != null && <span className={styles.scoreBadge}>{score.toFixed(1)}</span>}
            <div className={styles.userRateText}>
              {score != null && <span className={styles.ratingLabel}>{ratingLabel(score)}</span>}
              {reviewCount != null && <span className={styles.reviewCount}>{reviewCount.toLocaleString('en-US')} نفر</span>}
            </div>
          </div>
        )}

        <div className={styles.bottom}>
          <div className={styles.address}>
            <IconLocationPin width={24} height={24} className={styles.addressIcon} />
            <span>{address}</span>
          </div>

          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
