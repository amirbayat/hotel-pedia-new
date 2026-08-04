import type { HotelRule } from '../../api/hotelDetail'
import styles from './HotelRules.module.scss'

export interface HotelRulesProps {
  checkIn: string
  checkOut: string
  generalRules: HotelRule[]
  cancellationRules: HotelRule[]
}

/** "قوانین و مقررات هتل" — matches Figma "Hotel detail" node 694:15070. */
export function HotelRules({ checkIn, checkOut, generalRules, cancellationRules }: HotelRulesProps) {
  return (
    <div className={styles.section}>
      <h3 className={styles.title}>قوانین و مقررات هتل</h3>

      <div className={styles.checkTimes}>
        <div className={styles.checkTime}>
          <span className={styles.checkLabel}>زمان ورود به هتل</span>
          <span className={styles.checkValue}>{checkIn}</span>
        </div>
        <div className={styles.checkTime}>
          <span className={styles.checkLabel}>زمان خروج از هتل</span>
          <span className={styles.checkValue}>{checkOut}</span>
        </div>
      </div>

      {generalRules.length > 0 && (
        <ul className={styles.ruleList}>
          {generalRules.map((rule) => (
            <li key={rule.id} className={styles.ruleItem}>
              <span className={styles.ruleTitle}>{rule.title}</span>
              <span>{rule.content}</span>
            </li>
          ))}
        </ul>
      )}

      {cancellationRules.length > 0 && (
        <ul className={styles.ruleList}>
          {cancellationRules.map((rule) => (
            <li key={rule.id} className={styles.ruleItem}>
              <span className={styles.ruleTitle}>{rule.title}</span>
              <span>{rule.content}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
