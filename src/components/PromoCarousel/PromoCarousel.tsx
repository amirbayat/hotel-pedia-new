import { useEffect, useState } from 'react'
import styles from './PromoCarousel.module.scss'

export interface PromoSlide {
  id: string | number
  title: string
  imageSrc?: string
}

export interface PromoCarouselProps {
  /** Slide data — intended to come from the API. */
  slides: PromoSlide[]
  /** Auto-advance interval in ms. Set to 0 to disable auto-advance. */
  intervalMs?: number
}

/** Full-width promo banner with dot pagination — matches the homepage hero carousel. */
export function PromoCarousel({ slides, intervalMs = 5000 }: PromoCarouselProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1 || intervalMs <= 0) return
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs)
    return () => clearInterval(id)
  }, [slides.length, intervalMs])

  if (slides.length === 0) return null

  const slide = slides[Math.min(index, slides.length - 1)]

  return (
    <div className={styles.wrapper}>
      <div className={styles.slide}>
        {slide.imageSrc ? (
          <img src={slide.imageSrc} alt="" className={styles.image} />
        ) : (
          <div className={styles.placeholder} />
        )}
        <div className={styles.overlay} />
        <p className={styles.title}>{slide.title}</p>
      </div>

      {slides.length > 1 && (
        <div className={styles.dots}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={i === index ? styles.dotActive : styles.dot}
              aria-label={`اسلاید ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
