import type { HotelCardProps } from '../HotelCard'
import { HotelCard } from '../HotelCard'
import { IconArrowLeft } from '../icons'
import styles from './HotelListSection.module.scss'

export interface HotelListItem extends HotelCardProps {
  id: string | number
}

export interface HotelListSectionProps {
  /** City name, e.g. "تهران" — rendered as "محبوب ترین هتل های {city}" unless `title` overrides it. */
  city: string
  hotels: HotelListItem[]
  onShowAll?: () => void
  /** Overrides the default "محبوب ترین هتل های {city}" heading, e.g. for a "هتل‌های مشابه" section. */
  title?: string
}

/** "محبوب ترین هتل های شهر X" — title + "نمایش همه" + horizontally scrollable hotel cards. */
export function HotelListSection({ city, hotels, onShowAll, title }: HotelListSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <button type="button" className={styles.showAll} onClick={onShowAll}>
          <IconArrowLeft width={16} height={16} />
          <span>نمایش همه</span>
        </button>
        <h2 className={styles.title}>{title ?? `محبوب ترین هتل های ${city}`}</h2>
      </div>

      <div className={styles.list}>
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} {...hotel} />
        ))}
      </div>
    </section>
  )
}
