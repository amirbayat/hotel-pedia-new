import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { BookingLocationState, BookingPassenger, BookingReservedBy } from '../Booking/bookingTypes'
import { BookingHotelCard } from '../../components/BookingHotelCard'
import { BookingSteps } from '../../components/BookingSteps'
import { Chip } from '../../components/Chip'
import { Footer } from '../../components/Footer'
import { HotelDetailHeader } from '../../components/HotelDetailHeader'
import { Input } from '../../components/Input'
import { IconInformation } from '../../components/icons'
import { toPersianDigits } from '../../lib/date/jalali'
import { NATIONALITIES } from '../../lib/nationalities'
import styles from './BookingPassengers.module.scss'

function formatPrice(value: number) {
  return value.toLocaleString('en-US')
}

const EMPTY_PASSENGER: BookingPassenger = { firstName: '', lastName: '', nationality: '', phone: '' }

/** "مشخصات مسافران" — matches Figma node 683:12399 (docs/hotel-booking-plan.md §2). */
export function BookingPassengers() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as BookingLocationState | null

  const [reservedBy, setReservedBy] = useState<BookingReservedBy>(
    state?.reservedBy ?? { firstName: '', lastName: '', phone: '', email: '' },
  )
  const [passengers, setPassengers] = useState<BookingPassenger[]>(
    state?.passengers ?? Array.from({ length: state?.room.roomCount ?? 1 }, () => ({ ...EMPTY_PASSENGER })),
  )
  const [usingReservedBy, setUsingReservedBy] = useState<boolean[]>(passengers.map(() => false))
  const [error, setError] = useState('')

  if (!state) {
    // Landed here directly (refresh, bookmark, ...) without going through "رزرو اتاق" first.
    navigate(`/hotels/${slug}`, { replace: true })
    return null
  }

  function updatePassenger(index: number, patch: Partial<BookingPassenger>) {
    setPassengers((current) => current.map((passenger, i) => (i === index ? { ...passenger, ...patch } : passenger)))
  }

  function toggleUseReservedBy(index: number) {
    const next = !usingReservedBy[index]
    setUsingReservedBy((current) => current.map((value, i) => (i === index ? next : value)))
    updatePassenger(index, next ? { firstName: reservedBy.firstName, lastName: reservedBy.lastName, phone: reservedBy.phone } : { ...EMPTY_PASSENGER })
  }

  function handleContinue() {
    if (!reservedBy.firstName || !reservedBy.lastName || !reservedBy.phone || !reservedBy.email) {
      setError('لطفا اطلاعات رزرو‌کننده را کامل وارد کنید.')
      return
    }
    setError('')
    navigate(`/hotels/${slug}/book/confirm`, { state: { ...state, reservedBy, passengers } })
  }

  const stayPrice = state.room.feePerRoom * state.room.roomCount

  return (
    <div className={styles.page}>
      <HotelDetailHeader />
      <BookingSteps currentStep="passengers" />

      <div className={styles.content}>
        <BookingHotelCard
          hotel={state.hotel}
          startDate={state.startDate}
          endDate={state.endDate}
          primaryLabel="تایید و ادامه"
          onPrimary={handleContinue}
          secondaryLabel="ویرایش اتاق‌ها"
          onSecondary={() => navigate(`/hotels/${slug}`)}
        >
          <div className={styles.priceRow}>
            <span className={styles.priceValue}>
              {formatPrice(state.room.feePerRoom)} <span>تومان</span>
            </span>
            <span className={styles.priceLabel}>{state.room.roomKind}:</span>
          </div>
          <div className={styles.priceRowTotal}>
            <span className={styles.priceValueTotal}>
              {formatPrice(stayPrice)} <span>تومان</span>
            </span>
            <span className={styles.priceLabel}>مبلغ برای اقامت:</span>
          </div>
        </BookingHotelCard>

        <div className={styles.forms}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>اطلاعات رزرو کننده</h2>
            <div className={styles.grid2}>
              <Input
                label="نام خانوادگی"
                value={reservedBy.lastName}
                onChange={(e) => setReservedBy({ ...reservedBy, lastName: e.target.value })}
              />
              <Input label="نام" value={reservedBy.firstName} onChange={(e) => setReservedBy({ ...reservedBy, firstName: e.target.value })} />
              <Input
                label="ایمیل"
                type="email"
                value={reservedBy.email}
                onChange={(e) => setReservedBy({ ...reservedBy, email: e.target.value })}
              />
              <Input
                label="شماره همراه"
                inputMode="tel"
                value={reservedBy.phone}
                onChange={(e) => setReservedBy({ ...reservedBy, phone: e.target.value })}
              />
            </div>
            {error && <p className={styles.formError}>{error}</p>}
            <div className={styles.infoBanner}>
              <span>اطلاعات رزرو و اطلاع‌رسانی از تمام تغییرات را به این شماره می‌فرستیم.</span>
              <IconInformation width={24} height={24} />
            </div>
          </section>

          {passengers.map((passenger, index) => (
            <section className={styles.card} key={index}>
              <div className={styles.roomBlockHeader}>
                <h2 className={styles.cardTitle}>{`اتاق شماره ${toPersianDigits(index + 1)}: ${state.room.roomKind}`}</h2>
              </div>
              <div className={styles.roomBlockHeader}>
                <Chip active={usingReservedBy[index]} onClick={() => toggleUseReservedBy(index)}>
                  استفاده از اطلاعات رزرو کننده
                </Chip>
                <span className={styles.roomBlockTitle}>{`مسافر بزرگسال ${toPersianDigits(index + 1)}`}</span>
              </div>

              <div className={styles.grid2}>
                <Input
                  label="نام خانوادگی"
                  placeholder="نام خانوادگی مسافر را وارد کنید"
                  value={passenger.lastName}
                  onChange={(e) => updatePassenger(index, { lastName: e.target.value })}
                />
                <Input
                  label="نام"
                  placeholder="نام مسافر را وارد کنید"
                  value={passenger.firstName}
                  onChange={(e) => updatePassenger(index, { firstName: e.target.value })}
                />
              </div>
              <div className={styles.grid2}>
                <label className={styles.selectWrapper}>
                  <span className={styles.selectLabel}>ملیت</span>
                  <select
                    className={styles.select}
                    value={passenger.nationality}
                    onChange={(e) => updatePassenger(index, { nationality: e.target.value })}
                  >
                    <option value="">ملیت مسافر را انتخاب کنید</option>
                    {NATIONALITIES.map((nationality) => (
                      <option key={nationality} value={nationality}>
                        {nationality}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  label="شماره همراه"
                  inputMode="tel"
                  placeholder="شماره همراه مسافر را وارد کنید"
                  value={passenger.phone}
                  onChange={(e) => updatePassenger(index, { phone: e.target.value })}
                />
              </div>

              <div className={styles.infoBanner}>
                <span>برای هر اتاق صرفا وارد کردن اطلاعات سرپرست کافی است و نیاز به ثبت سایر مسافران نیست.</span>
                <IconInformation width={24} height={24} />
              </div>
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
