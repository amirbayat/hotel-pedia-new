import defaultHeroImage from '../../assets/homeHeader.png'
import styles from './HomeHeader.module.scss'

export interface HomeHeaderProps {
  title?: string
  subtitle?: string
  /** Hero image shown on the left. */
  imageSrc?: string
}

/**
 * Homepage hero section — n-900 background, title/subtitle on the right,
 * hero image on the left. `SearchCard` overlaps the bottom half of this
 * section (see Home.tsx).
 */
export function HomeHeader({
  title = 'از میان هزاران هتل و اقامتگاه اتاق  مورد نظرت رو انتخاب کن.',
  subtitle = 'مقصد و تاریخ سفرت را انتخاب کن، قیمت‌ها را مقایسه کن و اتاق مناسب را در چند دقیقه رزرو کن.',
  imageSrc = defaultHeroImage,
}: HomeHeaderProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.imageWrapper}>
          <img src={imageSrc} alt="" className={styles.image} />
        </div>

        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
    </section>
  )
}
