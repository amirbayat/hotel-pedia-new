import { useState } from 'react'
import { NeshanMap } from '../NeshanMap'
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
  lat: number
  lng: number
  tags?: string[]
}

/** Best-effort label from a 0-10 score — the API doesn't provide one (same gap as hotelSearch.ts). */
function ratingLabel(score: number): string {
  if (score >= 9) return 'عالی'
  if (score >= 7) return 'خیلی خوب'
  if (score >= 5) return 'خوب'
  return 'متوسط'
}

/** Title/rating/address block + map preview — matches Figma "Hotel detail" node 620:11104. */
export function HotelSummary({ name, stars, score, reviewCount, address, lat, lng, tags = [] }: HotelSummaryProps) {
  const [mapModalOpen, setMapModalOpen] = useState(false)

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
      <div className={styles.mapWrapper}>
        <NeshanMap lat={lat} lng={lng} interactive={false} className={styles.map} />
        <button type="button" className={styles.showMapButton} onClick={() => setMapModalOpen(true)}>
          نمایش روی نقشه
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.details}>
          <div className={styles.topRow}>
            <h1 className={styles.name}>{name}</h1>
            <button type="button" className={styles.iconButton} onClick={handleShare} aria-label="اشتراک‌گذاری">
              <IconShare width={24} height={24} />
            </button>
          </div>

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
              <span>{address}</span>
              <IconLocationPin width={24} height={24} className={styles.addressIcon} />
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

      {mapModalOpen && (
        <div className={styles.mapModalScrim} onClick={() => setMapModalOpen(false)}>
          <div className={styles.mapModal} onClick={(event) => event.stopPropagation()}>
            <NeshanMap lat={lat} lng={lng} className={styles.modalMap} />
          </div>
        </div>
      )}
    </div>
  )
}
