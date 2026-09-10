import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BookingSteps } from '../../components/BookingSteps'
import { Button } from '../../components/Button'
import { Footer } from '../../components/Footer'
import { HotelDetailHeader } from '../../components/HotelDetailHeader'
import { IconCancel, IconCheckCircle, IconCopy, IconDownload, IconTick } from '../../components/icons'
import styles from './BookingResult.module.scss'

const COPY_FEEDBACK_MS = 1500

/**
 * "صدور واچر" (success/failure) — matches Figma nodes 718:10139 / 720:10551
 * (docs/hotel-booking-plan.md §4).
 *
 * ⚠️ Read from URL query params (`status`, `order_id`, `tracking_id`) rather
 * than router `state`, since this page is meant to be landed on via an actual
 * browser redirect *back from the bank gateway* — a real cross-site
 * navigation loses any client-side `state`. The exact param names the bank
 * redirect will actually use are still unconfirmed with the backend (see the
 * doc's open questions) — these are a reasonable placeholder, not a spec.
 */
export function BookingResult() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const success = searchParams.get('status') !== 'failed'
  const orderId = searchParams.get('order_id') ?? ''
  const amount = searchParams.get('amount') ?? '0'
  const trackingId = searchParams.get('tracking_id') ?? orderId

  function handleRetryPayment() {
    const params = new URLSearchParams({
      order_id: orderId,
      amount,
      return_url: `/hotels/${slug}/book/result`,
    })
    navigate(`/payment/gateway?${params.toString()}`)
  }

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  async function handleCopyTrackingId() {
    if (!trackingId) return
    try {
      await navigator.clipboard.writeText(trackingId)
    } catch {
      return
    }
    setCopied(true)
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    copyTimeoutRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
  }

  return (
    <div className={styles.page}>
      <HotelDetailHeader />
      <BookingSteps currentStep="voucher" failed={!success} />

      <div className={styles.content}>
        <span className={[styles.illustration, success ? styles.illustrationSuccess : styles.illustrationFailed].join(' ')}>
          {success ? <IconCheckCircle width={96} height={96} /> : <IconCancel width={96} height={96} />}
        </span>

        <h1 className={[styles.title, success ? styles.titleSuccess : styles.titleFailed].join(' ')}>
          {success ? 'اقامتگاه با موفقیت برای شما رزرو شد.' : 'متاسفانه پرداخت انجام نشد!'}
        </h1>

        <p className={styles.description}>
          {success
            ? 'کاربر گرامی، شما می‌توانید با زدن دکمه دریافت واچر و یا مراجعه به منو خریدهای من، واچر اتاق و هتل خریداری شده خود را دریافت کنید.'
            : 'کاربر گرامی، در صورت کسر شدن مبلغ از حساب شما این مبلغ حداکثر ظرف مدت ۷۲ ساعت به حساب شما باز خواهد گشت.'}
        </p>

        {trackingId && (
          <div className={styles.trackingRow}>
            <span className={styles.trackingLabel}>{success ? 'شناسه پیگیری سفارش:' : 'شناسه پیگیری پرداخت:'}</span>
            <span className={styles.trackingId}>{trackingId}</span>
            <button
              type="button"
              className={[styles.copyButton, copied && styles.copyButtonDone].filter(Boolean).join(' ')}
              onClick={handleCopyTrackingId}
              aria-label={copied ? 'کپی شد' : 'کپی شناسه پیگیری'}
            >
              {copied ? <IconTick width={24} height={24} /> : <IconCopy width={24} height={24} />}
            </button>
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate('/')}>
            بازگشت به خانه
          </Button>
          {success ? (
            <Button variant="primary" icon={IconDownload}>
              دریافت واچر
            </Button>
          ) : (
            <Button variant="primary" onClick={handleRetryPayment}>
              پرداخت مجدد
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
