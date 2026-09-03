import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { IconBank, IconCreditCard, IconInformation } from '../../components/icons'
import { toPersianDigits } from '../../lib/date/jalali'
import styles from './PaymentGateway.module.scss'

function formatPrice(value: number) {
  return value.toLocaleString('en-US')
}

function randomTrackingId() {
  return `TRK-${Date.now().toString(36).toUpperCase()}`
}

/**
 * Sandbox stand-in for a real bank gateway (docs/hotel-mock-flow-plan.md) — there's
 * no real bank to redirect to yet, so `payHotelOrder` (src/api/hotelOrders.ts)
 * points here instead of an external `pay_action` URL. Reads `order_id`/`amount`/
 * `return_url` from the query string (built by `payHotelOrder`) and "redirects"
 * back to `return_url` with `status`/`order_id`/`tracking_id` — the exact contract
 * `BookingResult` already expects from a real bank callback.
 */
export function PaymentGateway() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const orderId = searchParams.get('order_id') ?? ''
  const amount = Number(searchParams.get('amount') ?? '0')
  const returnUrl = searchParams.get('return_url') ?? '/'

  function finish(status: 'success' | 'failed') {
    const params = new URLSearchParams({ status, order_id: orderId })
    if (status === 'success') params.set('tracking_id', randomTrackingId())
    navigate(`${returnUrl}?${params.toString()}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <IconBank width={40} height={40} />
          <h1 className={styles.title}>درگاه پرداخت</h1>
        </div>

        <div className={styles.noticeBanner}>
          <span>این یک درگاه پرداخت آزمایشی (شبیه‌سازی‌شده) است — پرداخت واقعی انجام نمی‌شود.</span>
          <IconInformation width={24} height={24} />
        </div>

        <div className={styles.row}>
          <span className={styles.value}>{toPersianDigits(orderId)}</span>
          <span className={styles.label}>شماره سفارش:</span>
        </div>
        <div className={styles.rowTotal}>
          <span className={styles.valueTotal}>
            {formatPrice(amount)} <span>تومان</span>
          </span>
          <span className={styles.label}>مبلغ قابل پرداخت:</span>
        </div>

        <div className={styles.cardNumberRow}>
          <IconCreditCard width={24} height={24} />
          <span>•••• •••• •••• ••••</span>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" onClick={() => finish('success')}>
            پرداخت موفق
          </Button>
          <Button variant="secondary" onClick={() => finish('failed')}>
            پرداخت ناموفق / انصراف
          </Button>
        </div>
      </div>
    </div>
  )
}
