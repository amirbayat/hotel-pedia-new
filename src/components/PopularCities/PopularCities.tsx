import styles from './PopularCities.module.scss'

export interface CityCard {
  id: string | number
  name: string
  imageSrc?: string
  /** Tall cards span both grid rows (used for 2 of the 6 cities in the design). */
  tall?: boolean
}

export interface PopularCitiesProps {
  title?: string
  /** City data — intended to come from the API. */
  cities: CityCard[]
}

/** "محبوب‌ترین شهرها" — 4-column grid, two tall cards spanning both rows. */
export function PopularCities({ title = 'محبوب ترین شهرها', cities }: PopularCitiesProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>
        {cities.map((city) => (
          <div key={city.id} className={city.tall ? styles.cardTall : styles.card}>
            {city.imageSrc ? (
              <img src={city.imageSrc} alt="" className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder} />
            )}
            <div className={styles.overlay} />
            <span className={styles.name}>{city.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
