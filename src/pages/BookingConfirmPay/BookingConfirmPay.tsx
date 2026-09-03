import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { BankGateway } from '../../api/hotelOrders'
import type { BookingLocationState } from '../Booking/bookingTypes'
import { useAuth } from '../../context/authContextValue'
import { usePayHotelOrder } from '../../hooks/useHotelOrder'
import { BookingHotelCard } from '../../components/BookingHotelCard'
import { BookingSteps } from '../../components/BookingSteps'
import { Footer } from '../../components/Footer'
import { HotelDetailHeader } from '../../components/HotelDetailHeader'
import { Input } from '../../components/Input'
import { RadioButton } from '../../components/RadioButton'
import { Switch } from '../../components/Switch'
import { IconBank, IconInformation } from '../../components/icons'
import { toPersianDigits } from '../../lib/date/jalali'
import styles from './BookingConfirmPay.module.scss'

function formatPrice(value: number) {
  return value.toLocaleString('en-US')
}

const GATEWAYS: { value: BankGateway; label: string; icon: typeof IconBank }[] = [
  { value: 'zarinpal', label: 'درگاه پرداخت زرین‌پال', icon: IconBank },
  { value: 'behpardakht', label: 'درگاه پرداخت به‌پرداخت ملت', icon: IconBank },
]

/** "تایید اطلاعات / پرداخت" — matches Figma nodes 703:16885 / 717:9729 / 789:25118 (docs/hotel-booking-plan.md §3). */
export function BookingConfirmPay() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as BookingLocationState | null
  const { user } = useAuth()

  const [bankGateway, setBankGateway] = useState<BankGateway>('zarinpal')
  const [walletActive, setWalletActive] = useState(false)
  const [discountActive, setDiscountActive] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [error, setError] = useState('')

  const payMutation = usePayHotelOrder()

  if (!state || !state.reservedBy || !state.passengers) {
    navigate(`/hotels/${slug}`, { replace: true })
    return null
  }

  const { hotel, room, startDate, endDate, orderId, reservedBy, passengers } = state
  const walletBalance = user?.walletBalance ?? 0
  const stayTotal = room.feePerRoom * room.roomCount
  const walletDeduction = walletActive ? Math.min(walletBalance, stayTotal) : 0
  const amountDue = Math.max(0, stayTotal - walletDeduction)

  async function handlePay() {
    setError('')
    try {
      const result = await payMutation.mutateAsync({
        orderId,
        isWalletActive: walletActive,
        bankGateway,
        startDate,
        endDate,
        reservedBy: { firstName: reservedBy.firstName, lastName: reservedBy.lastName, phone: reservedBy.phone, email: reservedBy.email },
        roomPassengers: [
          {
            roomId: room.roomId,
            roomCount: room.roomCount,
            passengers: passengers.map((passenger) => ({ firstName: passenger.firstName, lastName: passenger.lastName, phone: passenger.phone })),
          },
        ],
        slug,
        amountDue,
      })
      // Mock gateway lives inside this same app (docs/hotel-mock-flow-plan.md) —
      // a plain client-side navigate is enough, no need for the hidden-form
      // cross-origin technique `redirectToPaymentGateway` uses for a real bank.
      navigate(`${result.payAction}?${new URLSearchParams(result.inputs).toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ثبت پرداخت با خطا مواجه شد.')
    }
  }

  return (
    <div className={styles.page}>
      <HotelDetailHeader />
      <BookingSteps currentStep="confirm" />

      <div className={styles.content}>
        <BookingHotelCard
          hotel={hotel}
          startDate={startDate}
          endDate={endDate}
          primaryLabel="تایید و پرداخت"
          onPrimary={handlePay}
          primaryLoading={payMutation.isPending}
          secondaryLabel="ویرایش مسافران"
          onSecondary={() => navigate(`/hotels/${slug}/book/passengers`, { state })}
        >
          <div className={styles.priceRow}>
            <span className={styles.priceValue}>
              {formatPrice(stayTotal)} <span>تومان</span>
            </span>
            <span className={styles.priceLabel}>{`مبلغ ${toPersianDigits(room.roomCount)} اتاق برای ${toPersianDigits(room.nights)} شب:`}</span>
          </div>
          {walletActive && (
            <div className={styles.priceRow}>
              <span className={styles.priceValue}>
                -{formatPrice(walletDeduction)} <span>تومان</span>
              </span>
              <span className={styles.priceLabel}>استفاده از کیف پول:</span>
            </div>
          )}
          <div className={styles.priceRowTotal}>
            <span className={styles.priceValueTotal}>
              {formatPrice(amountDue)} <span>تومان</span>
            </span>
            <span className={styles.priceLabel}>مبلغ برای پرداخت:</span>
          </div>
        </BookingHotelCard>

        <div className={styles.forms}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>انتخاب درگاه پرداخت</h2>
            <div className={styles.gatewayList}>
              {GATEWAYS.map(({ value, label, icon: Icon }) => (
                <div className={styles.gatewayRow} key={value}>
                  <Icon width={24} height={24} />
                  <span className={styles.gatewayLabel}>{label}</span>
                  <RadioButton checked={bankGateway === value} onChange={() => setBankGateway(value)} aria-label={label} />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.switchRow}>
              <Switch checked={walletActive} onChange={setWalletActive} disabled={walletBalance <= 0} aria-label="استفاده از موجودی کیف پول" />
              {walletBalance > 0 && <span className={styles.walletBalance}>{formatPrice(walletBalance)} تومان</span>}
              <h2 className={styles.cardTitle}>استفاده از موجودی کیف پول</h2>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.switchRow}>
              <Switch checked={discountActive} onChange={setDiscountActive} aria-label="استفاده از کد تخفیف" />
              <h2 className={styles.cardTitle}>استفاده از کد تخفیف</h2>
            </div>
            {discountActive && (
              <>
                <p className={styles.discountHint}>اگر کد تخفیف دارید، آن را در بخش زیر وارد کنید و دکمه اعمال کد را بزنید.</p>
                <div className={styles.discountForm}>
                  <button type="button" className={styles.applyButton} disabled title="اعتبارسنجی کد تخفیف هنوز از سمت سرویس رزرو در دسترس نیست.">
                    اعمال کد
                  </button>
                  <Input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="کد تخفیف را وارد کنید" />
                </div>
                <p className={styles.discountHint}>اعتبارسنجی کد تخفیف هنوز آماده نیست — این کد فعلاً از مبلغ نهایی کسر نمی‌شود.</p>
              </>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>اطلاعات اتاق و مسافران</h2>
            <div className={styles.recapRow}>
              <span>{`${reservedBy.firstName} ${reservedBy.lastName}`}</span>
              <span className={styles.recapLabel}>رزرو کننده:</span>
            </div>
            <div className={styles.recapRow}>
              <span>{reservedBy.phone}</span>
              <span className={styles.recapLabel}>شماره همراه:</span>
            </div>
            <div className={styles.recapRow}>
              <span>{reservedBy.email}</span>
              <span className={styles.recapLabel}>آدرس ایمیل:</span>
            </div>
            <div className={styles.recapRow}>
              <span>{`${toPersianDigits(room.nights)} شب`}</span>
              <span className={styles.recapLabel}>تعداد شب رزرو شده:</span>
            </div>
            <div className={styles.recapRow}>
              <span>{`${toPersianDigits(room.roomCount)} اتاق`}</span>
              <span className={styles.recapLabel}>تعداد اتاق رزرو شده:</span>
            </div>

            <div className={styles.divider} />

            {passengers.map((passenger, index) => (
              <div key={index}>
                <h3 className={styles.recapRoomTitle}>{`اتاق شماره ${toPersianDigits(index + 1)}: ${room.roomKind}`}</h3>
                <div className={styles.recapRow}>
                  <span>{`${passenger.firstName} ${passenger.lastName}`}</span>
                  <span className={styles.recapLabel}>نام مسافر:</span>
                </div>
                <div className={styles.recapRow}>
                  <span>{passenger.phone}</span>
                  <span className={styles.recapLabel}>شماره همراه:</span>
                </div>
                {index < passengers.length - 1 && <div className={styles.divider} />}
              </div>
            ))}
          </section>

          {error && (
            <div className={styles.errorBanner}>
              <span>{error}</span>
              <IconInformation width={24} height={24} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
