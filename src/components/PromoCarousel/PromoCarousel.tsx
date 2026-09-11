import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import styles from './PromoCarousel.module.scss'

export interface PromoSlide {
  id: string | number
  title?: string
  imageSrc?: string
  /** In-app path (`/hotels?city=...` or `/hotels/:slug`) or absolute URL. */
  link?: string
}

export interface PromoCarouselProps {
  /** Slide data — intended to come from the API. */
  slides: PromoSlide[]
  /** Auto-advance interval in ms. Set to 0 to disable auto-advance. */
  intervalMs?: number
}

const DRAG_CLICK_THRESHOLD_PX = 8

/** Prefer in-app paths so city/hotel carousel links stay inside the SPA. */
function resolveSlideLink(link: string): { kind: 'internal' | 'external'; to: string } {
  if (link.startsWith('/')) {
    return { kind: 'internal', to: link }
  }

  try {
    const url = new URL(link)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'localhost' || host.endsWith('hotelpedia.ir')) {
      return { kind: 'internal', to: `${url.pathname}${url.search}${url.hash}` }
    }
  } catch {
    // Fall through to external.
  }

  return { kind: 'external', to: link }
}

/** Full-width promo banner with RTL drag/swipe and clickable slide links. */
export function PromoCarousel({ slides, intervalMs = 5000 }: PromoCarouselProps) {
  const [index, setIndex] = useState(0)
  const [width, setWidth] = useState(0)
  const [dragPx, setDragPx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const viewportRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const startXRef = useRef(0)
  const didDragRef = useRef(false)
  const dragPxRef = useRef(0)
  const captureArmedRef = useRef(false)

  const safeIndex = slides.length === 0 ? 0 : Math.min(index, slides.length - 1)

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const updateWidth = () => setWidth(el.clientWidth)
    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(el)
    return () => observer.disconnect()
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1 || intervalMs <= 0 || isDragging) return
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs)
    return () => clearInterval(id)
  }, [slides.length, intervalMs, isDragging])

  useEffect(() => {
    if (index > slides.length - 1) setIndex(0)
  }, [index, slides.length])

  if (slides.length === 0) return null

  const goTo = (next: number) => {
    if (slides.length <= 1) return
    setIndex((next + slides.length) % slides.length)
  }

  const finishDrag = () => {
    const threshold = Math.max(40, width * 0.2)
    const dx = dragPxRef.current

    if (didDragRef.current) {
      // RTL dots: first is rightmost, so dragging right advances (active moves left).
      if (dx > threshold) goTo(safeIndex + 1)
      else if (dx < -threshold) goTo(safeIndex - 1)
    }

    dragPxRef.current = 0
    setDragPx(0)
    setIsDragging(false)
    pointerIdRef.current = null
    captureArmedRef.current = false
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (slides.length <= 1 || event.button !== 0) return

    pointerIdRef.current = event.pointerId
    startXRef.current = event.clientX
    didDragRef.current = false
    captureArmedRef.current = false
    dragPxRef.current = 0
    setDragPx(0)
    // Do not capture yet — capturing immediately steals the click from slide links.
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return

    const dx = event.clientX - startXRef.current
    if (Math.abs(dx) <= DRAG_CLICK_THRESHOLD_PX) return

    if (!captureArmedRef.current) {
      captureArmedRef.current = true
      didDragRef.current = true
      setIsDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    dragPxRef.current = dx
    setDragPx(dx)
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    finishDrag()
  }

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragPxRef.current = 0
    setDragPx(0)
    setIsDragging(false)
    pointerIdRef.current = null
    captureArmedRef.current = false
  }

  const suppressClickIfDragged = (event: MouseEvent) => {
    if (!didDragRef.current) return
    event.preventDefault()
    event.stopPropagation()
    didDragRef.current = false
  }

  // Track is row-reversed: next slide sits to the left. Dragging right follows
  // the finger and reveals it. Dots stay RTL (first right, last left).
  const offsetX = safeIndex * width + dragPx

  return (
    <div className={styles.wrapper}>
      <div
        ref={viewportRef}
        className={`${styles.viewport}${isDragging ? ` ${styles.viewportDragging}` : ''}`}
        dir="ltr"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div
          className={`${styles.track}${isDragging ? ` ${styles.trackDragging}` : ''}`}
          style={{ transform: `translateX(${offsetX}px)` }}
        >
          {slides.map((slide) => {
            const resolved = slide.link ? resolveSlideLink(slide.link) : null
            const content = (
              <>
                {slide.imageSrc ? (
                  <img src={slide.imageSrc} alt="" className={styles.image} draggable={false} />
                ) : (
                  <div className={styles.placeholder} />
                )}
                <div className={styles.overlay} />
                {slide.title && <p className={styles.title}>{slide.title}</p>}
              </>
            )

            if (!resolved) {
              return (
                <div key={slide.id} className={styles.slide}>
                  {content}
                </div>
              )
            }

            if (resolved.kind === 'internal') {
              return (
                <Link
                  key={slide.id}
                  to={resolved.to}
                  className={styles.slideLink}
                  onClick={suppressClickIfDragged}
                  draggable={false}
                >
                  {content}
                </Link>
              )
            }

            return (
              <a
                key={slide.id}
                href={resolved.to}
                className={styles.slideLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={suppressClickIfDragged}
                draggable={false}
              >
                {content}
              </a>
            )
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <div className={styles.dots}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={i === safeIndex ? styles.dotActive : styles.dot}
              aria-label={`اسلاید ${i + 1}`}
              aria-current={i === safeIndex ? 'true' : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
