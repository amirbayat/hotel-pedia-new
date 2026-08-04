import { getAmenityIcon } from '../../lib/amenityIcons'
import styles from './HotelAmenities.module.scss'

export interface HotelAmenitiesProps {
  hotelName: string
  /** Trusted HTML from the hotel-show API's `description` field (own backend, not user content). */
  description: string
  amenities: string[]
}

/** Intro + amenities grid — matches Figma "Hotel detail" node 654:11619. */
export function HotelAmenities({ hotelName, description, amenities }: HotelAmenitiesProps) {
  return (
    <div className={styles.section}>
      <div className={styles.intro}>
        <h2 className={styles.title}>معرفی هتل {hotelName}</h2>
        {/* eslint-disable-next-line react/no-danger */}
        <div className={styles.description} dangerouslySetInnerHTML={{ __html: description }} />
      </div>

      {amenities.length > 0 && (
        <div className={styles.amenitiesBlock}>
          <h3 className={styles.title}>امکانات هتل</h3>
          <div className={styles.grid}>
            {amenities.map((amenity) => {
              const Icon = getAmenityIcon(amenity)
              return (
                <div className={styles.cell} key={amenity}>
                  <span className={styles.cellLabel}>{amenity}</span>
                  <Icon width={24} height={24} className={styles.cellIcon} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
