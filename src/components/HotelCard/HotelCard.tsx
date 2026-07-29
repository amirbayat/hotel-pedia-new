import { IconLocationPin, IconStar } from '../icons'
import styles from './HotelCard.module.scss'

export interface HotelCardProps {
  imageSrc?: string
  name: string
  /** 0-5 */
  rating?: number
  /** Exactly 3 in the design, but any number works. */
  badges?: string[]
  address: string
  pricePerNight: number
  /** Pre-discount price, shown struck through next to the discount badge. */
  originalPricePerNight?: number
  /** e.g. 20 for "٪۲۰ تخفیف". Omit to hide the discount badge entirely. */
  discountPercent?: number
  currency?: string
}

function formatPrice(value: number) {
  return value.toLocaleString('en-US')
}

/** Vertical hotel card — image, name, rating, feature badges, address, price + discount. */
export function HotelCard({
  imageSrc,
  name,
  rating = 5,
  badges = [],
  address,
  pricePerNight,
  originalPricePerNight,
  discountPercent,
  currency = 'تومان',
}: HotelCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageSrc ? <img src={imageSrc} alt="" className={styles.image} /> : <div className={styles.imagePlaceholder} />}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>

        <div className={styles.rating}>
          {Array.from({ length: 5 }, (_, i) => (
            <IconStar
              key={i}
              width={16}
              height={16}
              className={i < rating ? styles.starFilled : styles.starEmpty}
            />
          ))}
        </div>

        {badges.length > 0 && (
          <div className={styles.badges}>
            {badges.map((badge) => (
              <span key={badge} className={styles.badge}>
                {badge}
              </span>
            ))}
          </div>
        )}

        <div className={styles.address}>
          <IconLocationPin width={16} height={16} className={styles.addressIcon} />
          <span>{address}</span>
        </div>

        <div className={styles.priceRow}>
          {discountPercent && (
            <div className={styles.discount}>
              <span className={styles.discountBadge}>٪{discountPercent} تخفیف</span>
              {originalPricePerNight && (
                <span className={styles.originalPrice}>
                  {formatPrice(originalPricePerNight)} {currency}
                </span>
              )}
            </div>
          )}

          <div className={styles.price}>
            <span className={styles.priceLabel}>قیمت از شبی</span>
            <span className={styles.priceValue}>
              {formatPrice(pricePerNight)} {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
