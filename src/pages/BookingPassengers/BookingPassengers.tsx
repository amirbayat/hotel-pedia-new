import { useEffect, useState } from 'react'
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
import { toEnglishDigits } from '../../lib/digits'
import styles from './BookingPassengers.module.scss'

function formatPrice(value: number) {
  return value.toLocaleString('en-US')
}

const EMPTY_PASSENGER: BookingPassenger = { firstName: '', lastName: '', phone: '' }
const PHONE_RE = /^09\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ReservedByErrors = Partial<Record<keyof BookingReservedBy, string>>
type PassengerErrors = Partial<Record<keyof BookingPassenger, string>>

function requiredError(label: string, value: string): string | undefined {
  return value.trim() ? undefined : `${label} را وارد کنید.`
}

function phoneError(value: string): string | undefined {
  const digits = toEnglishDigits(value).trim()
  if (!digits) return 'شماره همراه را وارد کنید.'
  if (!PHONE_RE.test(digits)) return 'شماره همراه را به‌درستی وارد کنید.'
  return undefined
}

function emailError(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (!EMAIL_RE.test(trimmed)) return 'ایمیل را به‌درستی وارد کنید.'
  return undefined
}

function validateReservedBy(reservedBy: BookingReservedBy): ReservedByErrors {
  return {
    firstName: requiredError('نام', reservedBy.firstName),
    lastName: requiredError('نام خانوادگی', reservedBy.lastName),
    phone: phoneError(reservedBy.phone),
    email: emailError(reservedBy.email),
  }
}

function validatePassenger(passenger: BookingPassenger): PassengerErrors {
  return {
    firstName: requiredError('نام', passenger.firstName),
    lastName: requiredError('نام خانوادگی', passenger.lastName),
    phone: phoneError(passenger.phone),
  }
}

function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean)
}

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
  const [reservedByErrors, setReservedByErrors] = useState<ReservedByErrors>({})
  const [passengerErrors, setPassengerErrors] = useState<PassengerErrors[]>(() => passengers.map(() => ({})))

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (!state) {
    // Landed here directly (refresh, bookmark, ...) without going through "رزرو اتاق" first.
    navigate(`/hotels/${slug}`, { replace: true })
    return null
  }

  function updateReservedBy<K extends keyof BookingReservedBy>(key: K, value: BookingReservedBy[K]) {
    setReservedBy((current) => ({ ...current, [key]: value }))
    setReservedByErrors((current) => ({ ...current, [key]: undefined }))
  }

  function updatePassenger(index: number, patch: Partial<BookingPassenger>) {
    setPassengers((current) => current.map((passenger, i) => (i === index ? { ...passenger, ...patch } : passenger)))
    setPassengerErrors((current) =>
      current.map((errors, i) =>
        i === index ? { ...errors, ...Object.fromEntries(Object.keys(patch).map((key) => [key, undefined])) } : errors,
      ),
    )
  }

  function toggleUseReservedBy(index: number) {
    const next = !usingReservedBy[index]
    setUsingReservedBy((current) => current.map((value, i) => (i === index ? next : value)))
    updatePassenger(
      index,
      next
        ? { firstName: reservedBy.firstName, lastName: reservedBy.lastName, phone: reservedBy.phone }
        : { ...EMPTY_PASSENGER },
    )
  }

  function handleContinue() {
    const nextReservedByErrors = validateReservedBy(reservedBy)
    const nextPassengerErrors = passengers.map(validatePassenger)
    setReservedByErrors(nextReservedByErrors)
    setPassengerErrors(nextPassengerErrors)

    if (hasErrors(nextReservedByErrors) || nextPassengerErrors.some(hasErrors)) return

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
          onSecondary={() => {
            const params = new URLSearchParams({
              check_in: state.startDate,
              check_out: state.endDate,
              rooms: String(state.room.roomCount),
            })
            navigate(`/hotels/${slug}?${params.toString()}#rooms`)
          }}
        >
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>{state.room.roomKind}:</span>
            <span className={styles.priceValue}>
              {formatPrice(state.room.feePerRoom)} <span>تومان</span>
            </span>
          </div>
          <div className={styles.priceRowTotal}>
            <span className={styles.priceLabel}>مبلغ برای اقامت:</span>
            <span className={styles.priceValueTotal}>
              {formatPrice(stayPrice)} <span>تومان</span>
            </span>
          </div>
        </BookingHotelCard>

        <form
          className={styles.forms}
          autoComplete="off"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            handleContinue()
          }}
        >
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>اطلاعات رزرو کننده</h2>
            <div className={styles.grid2}>
              <Input
                label="نام"
                name="reserved-by-first-name"
                autoComplete="given-name"
                value={reservedBy.firstName}
                error={reservedByErrors.firstName}
                onChange={(e) => updateReservedBy('firstName', e.target.value)}
              />
              <Input
                label="نام خانوادگی"
                name="reserved-by-last-name"
                autoComplete="family-name"
                value={reservedBy.lastName}
                error={reservedByErrors.lastName}
                onChange={(e) => updateReservedBy('lastName', e.target.value)}
              />
              <Input
                label="شماره همراه"
                name="reserved-by-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={11}
                value={reservedBy.phone}
                error={reservedByErrors.phone}
                onChange={(e) => updateReservedBy('phone', toEnglishDigits(e.target.value))}
              />
              <Input
                label="ایمیل"
                name="reserved-by-email"
                type="email"
                autoComplete="email"
                value={reservedBy.email}
                error={reservedByErrors.email}
                onChange={(e) => updateReservedBy('email', e.target.value)}
              />
            </div>
            <div className={styles.infoBanner}>
              <IconInformation width={24} height={24} />
              <span>اطلاعات رزرو و اطلاع‌رسانی از تمام تغییرات را به این شماره می‌فرستیم.</span>
            </div>
          </section>

          {passengers.map((passenger, index) => (
            <section className={styles.card} key={index}>
              <div className={styles.roomBlockHeader}>
                <h2 className={styles.cardTitle}>{`اتاق شماره ${toPersianDigits(index + 1)}: ${state.room.roomKind}`}</h2>
              </div>
              <div className={styles.roomBlockHeader}>
                <span className={styles.roomBlockTitle}>{`مسافر بزرگسال ${toPersianDigits(index + 1)}`}</span>
                <Chip active={usingReservedBy[index]} onClick={() => toggleUseReservedBy(index)}>
                  استفاده از اطلاعات رزرو کننده
                </Chip>
              </div>

              <div className={styles.grid2}>
                <Input
                  label="نام"
                  name={`passenger-${index}-first-name`}
                  autoComplete="off"
                  placeholder="نام مسافر را وارد کنید"
                  value={passenger.firstName}
                  error={passengerErrors[index]?.firstName}
                  onChange={(e) => updatePassenger(index, { firstName: e.target.value })}
                />
                <Input
                  label="نام خانوادگی"
                  name={`passenger-${index}-last-name`}
                  autoComplete="off"
                  placeholder="نام خانوادگی مسافر را وارد کنید"
                  value={passenger.lastName}
                  error={passengerErrors[index]?.lastName}
                  onChange={(e) => updatePassenger(index, { lastName: e.target.value })}
                />
                <Input
                  label="شماره همراه"
                  name={`passenger-${index}-phone`}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={11}
                  placeholder="شماره همراه مسافر را وارد کنید"
                  value={passenger.phone}
                  error={passengerErrors[index]?.phone}
                  onChange={(e) => updatePassenger(index, { phone: toEnglishDigits(e.target.value) })}
                />
              </div>

              <div className={styles.infoBanner}>
                <IconInformation width={24} height={24} />
                <span>برای هر اتاق صرفا وارد کردن اطلاعات سرپرست کافی است و نیاز به ثبت سایر مسافران نیست.</span>
              </div>
            </section>
          ))}
        </form>
      </div>

      <Footer />
    </div>
  )
}
