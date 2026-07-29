import { useState } from 'react'
import { IconArrowDown, IconArrowUp, IconHelp } from '../icons'
import styles from './Faq.module.scss'

export interface FaqItem {
  id: string | number
  question: string
  answer: string
}

export interface FaqProps {
  title?: string
  items: FaqItem[]
  /** id of the item open by default. */
  defaultOpenId?: FaqItem['id']
}

/** "پاسخ به برخی سوالات" — single-open accordion, matches the homepage PDF export. */
export function Faq({ title = 'پاسخ به برخی سوالات', items, defaultOpenId }: FaqProps) {
  const [openId, setOpenId] = useState<FaqItem['id'] | null>(defaultOpenId ?? null)

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.list}>
        {items.map((item) => {
          const isOpen = item.id === openId
          return (
            <div key={item.id} className={styles.item}>
              <button
                type="button"
                className={styles.row}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
              >
                {isOpen ? <IconArrowUp width={20} height={20} /> : <IconArrowDown width={20} height={20} />}
                <span className={styles.questionGroup}>
                  <span className={styles.iconBox}>
                    <IconHelp width={16} height={16} />
                  </span>
                  <span className={styles.question}>{item.question}</span>
                </span>
              </button>
              {isOpen && <p className={styles.answer}>{item.answer}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
