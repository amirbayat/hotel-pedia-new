import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BookingSteps } from '../../components/BookingSteps'
import { Button } from '../../components/Button'
import { Footer } from '../../components/Footer'
import { HotelDetailHeader } from '../../components/HotelDetailHeader'
import { IconCancel, IconCheckCircle, IconCopy, IconDownload } from '../../components/icons'
import styles from './BookingResult.module.scss'

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

  const success = searchParams.get('status') !== 'failed'
  const trackingId = searchParams.get('tracking_id') ?? searchParams.get('order_id') ?? ''

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
            <IconCopy width={24} height={24} onClick={() => navigator.clipboard?.writeText(trackingId)} className={styles.copyIcon} />
            <span>{trackingId}</span>
            <span className={styles.trackingLabel}>{success ? 'شناسه پیگیری سفارش:' : 'شناسه پیگیری پرداخت:'}</span>
          </div>
        )}

        <div className={styles.actions}>
          {success ? (
            <Button variant="primary" icon={IconDownload}>
              دریافت واچر
            </Button>
          ) : (
            // No GET-by-order-id endpoint exists yet to rebuild the confirm
            // page's state after a cross-site redirect, so this can only send
            // the user back to start the reservation over — see the doc's open questions.
            <Button variant="primary" onClick={() => navigate(`/hotels/${slug}`)}>
              پرداخت مجدد
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/')}>
            بازگشت به خانه
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
