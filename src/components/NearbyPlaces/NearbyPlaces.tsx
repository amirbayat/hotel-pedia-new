import type { IconComponent } from '../icons/types'
import styles from './NearbyPlaces.module.scss'

export interface NearbyPlaceItem {
  name: string
  /** Pre-formatted distance label, e.g. "۴۰۷ متر" or "۲.۵ کیلومتر". */
  distance: string
  icon: IconComponent
}

export interface NearbyPlacesGroup {
  title: string
  places: NearbyPlaceItem[]
}

export interface NearbyPlacesProps {
  groups: NearbyPlacesGroup[]
}

/**
 * "اطراف هتل" / "مکان‌های مهم شهر" boxes — matches Figma "Hotel detail" node 668:8798.
 *
 * ⚠️ The hotel-show API response has no field for nearby places at all — see
 * docs/hotel-detail-plan.md. The page currently passes placeholder data; wire
 * this up to a real field/endpoint once one exists.
 */
export function NearbyPlaces({ groups }: NearbyPlacesProps) {
  return (
    <>
      {groups.map((group) => (
        <div className={styles.section} key={group.title}>
          <h3 className={styles.title}>{group.title}</h3>
          <div className={styles.grid}>
            {group.places.map((place, index) => (
              <div className={styles.item} key={place.name + index}>
                <div className={styles.itemText}>
                  <span className={styles.name}>{place.name}</span>
                  <span className={styles.distance}>{place.distance}</span>
                </div>
                <span className={styles.iconBox}>
                  <place.icon width={24} height={24} />
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
