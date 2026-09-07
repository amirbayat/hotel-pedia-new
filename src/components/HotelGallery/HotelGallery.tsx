import { useEffect, useState } from 'react'
import { IconArrowLeft, IconArrowRight, IconClose, IconPhoto } from '../icons'
import styles from './HotelGallery.module.scss'

export interface HotelGalleryProps {
  images: string[]
  hotelName: string
}

/** Thumbnail grid + full lightbox — matches Figma "Hotel detail" node 612:10719. */
export function HotelGallery({ images, hotelName }: HotelGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (lightboxIndex === null) return

    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxIndex(null)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setLightboxIndex((current) =>
          current === null ? null : (current - 1 + images.length) % images.length,
        )
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setLightboxIndex((current) => (current === null ? null : (current + 1) % images.length))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxIndex, images.length])

  if (images.length === 0) {
    return <div className={styles.emptyState} />
  }

  const gridImages = images.slice(0, 6)
  const heroImage = images[6] ?? images[0]

  function showPrev() {
    setLightboxIndex((current) => (current === null ? null : (current - 1 + images.length) % images.length))
  }

  function showNext() {
    setLightboxIndex((current) => (current === null ? null : (current + 1) % images.length))
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.grid}>
        {gridImages.map((src, index) => (
          <button type="button" key={src + index} className={styles.cell} onClick={() => setLightboxIndex(index)}>
            <img src={src} alt="" className={styles.cellImage} />
            {index === 3 && (
              <span className={styles.showAllOverlay}>
                <IconPhoto width={20} height={20} />
                نمایش همه
              </span>
            )}
          </button>
        ))}
      </div>

      <button type="button" className={styles.hero} onClick={() => setLightboxIndex(6 < images.length ? 6 : 0)}>
        <img src={heroImage} alt="" className={styles.heroImage} />
      </button>

      {lightboxIndex !== null && (
        <div className={styles.lightboxScrim} onClick={() => setLightboxIndex(null)}>
          <div className={styles.lightbox} onClick={(event) => event.stopPropagation()}>
            <button type="button" className={styles.closeButton} onClick={() => setLightboxIndex(null)} aria-label="بستن">
              <IconClose width={24} height={24} />
            </button>

            <div className={styles.lightboxMain}>
              <button type="button" className={styles.navButton} onClick={showPrev} aria-label="قبلی">
                <IconArrowLeft width={24} height={24} />
              </button>
              <img src={images[lightboxIndex]} alt={hotelName} className={styles.lightboxImage} />
              <button type="button" className={styles.navButton} onClick={showNext} aria-label="بعدی">
                <IconArrowRight width={24} height={24} />
              </button>
            </div>

            <div className={styles.thumbStrip}>
              {images.map((src, index) => (
                <button
                  type="button"
                  key={src + index}
                  className={[styles.thumb, index === lightboxIndex && styles.thumbActive].filter(Boolean).join(' ')}
                  onClick={() => setLightboxIndex(index)}
                >
                  <img src={src} alt="" className={styles.thumbImage} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
