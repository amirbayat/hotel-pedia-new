import styles from './HomeHeader.module.scss'

export interface HomeHeaderProps {
  title?: string
  subtitle?: string
  /** Hero image shown on the left. Falls back to a placeholder until the real asset is provided. */
  imageSrc?: string
}

/**
 * Homepage hero section — n-900 background, title/subtitle on the right,
 * hero image on the left. `SearchCard` overlaps the bottom half of this
 * section (see Home.tsx).
 */
export function HomeHeader({
  title = 'از میان هزاران هتل و اقامتگاه اتاق  مورد نظرت رو انتخاب کن.',
  subtitle = 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ',
  imageSrc,
}: HomeHeaderProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.imageWrapper}>
          {/* TODO: swap for the real hero image once provided */}
          {imageSrc ? <img src={imageSrc} alt="" className={styles.image} /> : <div className={styles.imagePlaceholder} />}
        </div>

        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
    </section>
  )
}
