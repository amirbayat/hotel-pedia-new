import styles from './AdvantageBoxes.module.scss'

export interface AdvantageBoxItem {
  id: string | number
  title: string
  description: string
}

export interface AdvantageBoxesProps {
  items: AdvantageBoxItem[]
}

/** Stack of bordered info boxes (title + centered paragraph) — matches the homepage PDF export. */
export function AdvantageBoxes({ items }: AdvantageBoxesProps) {
  return (
    <section className={styles.section}>
      {items.map((item) => (
        <div key={item.id} className={styles.box}>
          <h2 className={styles.title}>{item.title}</h2>
          <p className={styles.description}>{item.description}</p>
        </div>
      ))}
    </section>
  )
}
