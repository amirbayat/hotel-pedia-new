import styles from './HotelAmenities.module.scss'

export interface HotelAmenitiesProps {
  hotelName: string
  /** Trusted HTML from the hotel-show API's `description` field (own backend, not user content). */
  description: string
}

/** Hotel intro copy — amenities now live under the title in HotelSummary. */
export function HotelAmenities({ hotelName, description }: HotelAmenitiesProps) {
  return (
    <div className={styles.section}>
      <div className={styles.intro}>
        <h2 className={styles.title}>معرفی هتل {hotelName}</h2>
        {/* eslint-disable-next-line react/no-danger */}
        <div className={styles.description} dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    </div>
  )
}
