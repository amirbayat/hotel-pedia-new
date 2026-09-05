import { Link } from 'react-router-dom'
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
  /** Listing URL for "نمایش همه". Preferred over `onShowAll` when the destination is a route. */
  showAllHref?: string
  /** Overrides the default "محبوب ترین هتل های {city}" heading, e.g. for a "هتل‌های مشابه" section. */
  title?: string
}

function ShowAllControl({ href, onClick }: { href?: string; onClick?: () => void }) {
  const inner = (
    <>
      <IconArrowLeft width={16} height={16} />
      <span>نمایش همه</span>
    </>
  )

  if (href) {
    return (
      <Link to={href} className={styles.showAll}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" className={styles.showAll} onClick={onClick}>
      {inner}
    </button>
  )
}

/** "محبوب ترین هتل های شهر X" — title + "نمایش همه" + horizontally scrollable hotel cards. */
export function HotelListSection({ city, hotels, onShowAll, showAllHref, title }: HotelListSectionProps) {
  const showAll = Boolean(showAllHref || onShowAll)

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        {showAll && <ShowAllControl href={showAllHref} onClick={onShowAll} />}
        <h2 className={styles.title}>{title ?? `محبوب ترین هتل های ${city}`}</h2>
      </div>

      <div className={styles.list}>
        {hotels.map(({ id, ...hotel }) => (
          <HotelCard key={id} {...hotel} />
        ))}
      </div>
    </section>
  )
}
