import { useState } from 'react'
import { IconArrowDown, IconArrowUp, IconQuestionMark } from '../icons'
import styles from './HotelFaq.module.scss'

export interface HotelFaqItem {
  id: number
  question: string
  answer: string
}

export interface HotelFaqProps {
  faqs: HotelFaqItem[]
}

/**
 * "پاسخ به برخی سوالات" accordion — matches Figma "Hotel detail" node 694:15078.
 *
 * ⚠️ The hotel-show API response has no FAQ field — see docs/hotel-detail-plan.md.
 * The page currently passes placeholder data; wire this up to a real field/endpoint
 * once one exists (home.ts's site-wide `faqs` aren't hotel-specific).
 */
export function HotelFaq({ faqs }: HotelFaqProps) {
  const [openId, setOpenId] = useState<number | null>(null)

  if (faqs.length === 0) return null

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>پاسخ به برخی سوالات</h3>

      <div className={styles.list}>
        {faqs.map((faq) => {
          const isOpen = faq.id === openId
          return (
            <div className={styles.item} key={faq.id}>
              <button
                type="button"
                className={styles.question}
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                aria-expanded={isOpen}
              >
                <span className={styles.chevron}>{isOpen ? <IconArrowUp width={24} height={24} /> : <IconArrowDown width={24} height={24} />}</span>
                <span className={styles.questionText}>{faq.question}</span>
                <span className={styles.questionIcon}>
                  <IconQuestionMark width={24} height={24} />
                </span>
              </button>
              {isOpen && <p className={styles.answer}>{faq.answer}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
