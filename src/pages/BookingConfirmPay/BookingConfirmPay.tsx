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
import { IconInformation } from '../../components/icons'
import { toPersianDigits } from '../../lib/date/jalali'
import samanLogo from '../../assets/payment-gateways/saman.svg'
import upLogo from '../../assets/payment-gateways/up.svg'
import mellatLogo from '../../assets/payment-gateways/melat.svg'
import styles from './BookingConfirmPay.module.scss'

function formatPrice(value: number) {
  return value.toLocaleString('en-US')
}

/** Figma shows Saman / UP / Mellat; API only accepts zarinpal | behpardakht. */
type GatewayOption = {
  id: 'saman' | 'up' | 'mellat'
  label: string
  logo: string
  apiValue: BankGateway
}

const GATEWAYS: GatewayOption[] = [
  { id: 'saman', label: 'درگاه پرداخت سامان', logo: samanLogo, apiValue: 'zarinpal' },
  { id: 'up', label: 'درگاه پرداخت آپ', logo: upLogo, apiValue: 'zarinpal' },
  { id: 'mellat', label: 'درگاه پرداخت ملت', logo: mellatLogo, apiValue: 'behpardakht' },
]

/** "تایید اطلاعات / پرداخت" — matches Figma nodes 703:16885 / 717:9729 / 789:25118 (docs/hotel-booking-plan.md §3). */
export function BookingConfirmPay() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as BookingLocationState | null
  const { user } = useAuth()

  const [selectedGateway, setSelectedGateway] = useState<GatewayOption['id']>('saman')
  const bankGateway = GATEWAYS.find((gateway) => gateway.id === selectedGateway)?.apiValue ?? 'zarinpal'
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
            <span className={styles.priceLabel}>{`مبلغ ${toPersianDigits(room.roomCount)} اتاق برای ${toPersianDigits(room.nights)} شب:`}</span>
            <span className={styles.priceValue}>
              {formatPrice(stayTotal)} <span>تومان</span>
            </span>
          </div>
          {walletActive && (
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>استفاده از کیف پول:</span>
              <span className={styles.priceValue}>
                -{formatPrice(walletDeduction)} <span>تومان</span>
              </span>
            </div>
          )}
          <div className={styles.priceRowTotal}>
            <span className={styles.priceLabel}>مبلغ برای پرداخت:</span>
            <span className={styles.priceValueTotal}>
              {formatPrice(amountDue)} <span>تومان</span>
            </span>
          </div>
        </BookingHotelCard>

        <div className={styles.forms}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>انتخاب درگاه پرداخت</h2>
            <div className={styles.gatewayList}>
              {GATEWAYS.map(({ id, label, logo }) => (
                <div
                  className={styles.gatewayRow}
                  key={id}
                  onClick={() => setSelectedGateway(id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedGateway(id)
                    }
                  }}
                  role="presentation"
                >
                  <span className={styles.gatewayLogo}>
                    <img src={logo} alt="" width={40} height={40} />
                  </span>
                  <span className={styles.gatewayLabel}>{label}</span>
                  <RadioButton
                    checked={selectedGateway === id}
                    onChange={() => setSelectedGateway(id)}
                    aria-label={label}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.switchRow}>
              <h2 className={styles.cardTitle}>استفاده از موجودی کیف پول</h2>
              {walletBalance > 0 && <span className={styles.walletBalance}>{formatPrice(walletBalance)} تومان</span>}
              <Switch checked={walletActive} onChange={setWalletActive} disabled={walletBalance <= 0} aria-label="استفاده از موجودی کیف پول" />
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.switchRow}>
              <h2 className={styles.cardTitle}>استفاده از کد تخفیف</h2>
              <Switch checked={discountActive} onChange={setDiscountActive} aria-label="استفاده از کد تخفیف" />
            </div>
            {discountActive && (
              <>
                <p className={styles.discountHint}>اگر کد تخفیف دارید، آن را در بخش زیر وارد کنید و دکمه اعمال کد را بزنید.</p>
                <div className={styles.discountForm}>
                  <Input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="کد تخفیف را وارد کنید" />
                  <button type="button" className={styles.applyButton} disabled title="اعتبارسنجی کد تخفیف هنوز از سمت سرویس رزرو در دسترس نیست.">
                    اعمال کد
                  </button>
                </div>
                <p className={styles.discountHint}>اعتبارسنجی کد تخفیف هنوز آماده نیست — این کد فعلاً از مبلغ نهایی کسر نمی‌شود.</p>
              </>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>اطلاعات اتاق و مسافران</h2>
            <div className={styles.recapBlock}>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>رزرو کننده:</span>
                <span className={styles.recapValue}>{`${reservedBy.firstName} ${reservedBy.lastName}`}</span>
              </div>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>شماره همراه:</span>
                <span className={styles.recapValue}>{reservedBy.phone}</span>
              </div>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>آدرس ایمیل:</span>
                <span className={styles.recapValue}>{reservedBy.email}</span>
              </div>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>تعداد شب رزرو شده:</span>
                <span className={styles.recapValue}>{`${toPersianDigits(room.nights)} شب`}</span>
              </div>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>تعداد اتاق رزرو شده:</span>
                <span className={styles.recapValue}>{`${toPersianDigits(room.roomCount)} اتاق`}</span>
              </div>
            </div>

            <div className={styles.divider} />

            {passengers.map((passenger, index) => (
              <div key={index} className={styles.recapBlock}>
                <h3 className={styles.recapRoomTitle}>{`اتاق شماره ${toPersianDigits(index + 1)}: ${room.roomKind}`}</h3>
                <div className={styles.recapRow}>
                  <span className={styles.recapLabel}>نام مسافر:</span>
                  <span className={styles.recapValue}>{`${passenger.firstName} ${passenger.lastName}`}</span>
                </div>
                <div className={styles.recapRow}>
                  <span className={styles.recapLabel}>شماره همراه:</span>
                  <span className={styles.recapValue}>{passenger.phone}</span>
                </div>
                {index < passengers.length - 1 && <div className={styles.divider} />}
              </div>
            ))}
          </section>

          {error && (
            <div className={styles.errorBanner}>
              <IconInformation width={24} height={24} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
