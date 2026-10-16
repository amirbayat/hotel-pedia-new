import { useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { IconArrowDown, IconSearch } from '../../components/icons'
import { formatJalaliDisplay } from '../../lib/date/jalali'
import {
  MOCK_RESERVATIONS,
  RESERVATION_STATUS_LABEL,
  type ReservationStatus,
} from '../../api/mockProfile'
import styles from './profile.module.scss'

const STATUS_OPTIONS: ReservationStatus[] = ['awaitingPayment', 'paid', 'expired', 'refunded']

export function ProfileReservations() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ReservationStatus | ''>('')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MOCK_RESERVATIONS.filter((reservation) => {
      const matchesQuery = !needle || reservation.orderNumber.toLowerCase().includes(needle)
      const matchesStatus = !status || reservation.status === status
      return matchesQuery && matchesStatus
    })
  }, [query, status])

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>رزروهای من</h2>
      </header>

      <div className={styles.filters}>
        <Input
          value={query}
          placeholder="شماره سفارش را جستجو کنید"
          leadingIcon={IconSearch}
          className={styles.ltrField}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="جستجوی شماره سفارش"
        />
        <div className={styles.selectBox}>
          <select
            className={[styles.select, !status && styles.placeholder].filter(Boolean).join(' ')}
            value={status}
            aria-label="وضعیت"
            onChange={(event) => setStatus(event.target.value as ReservationStatus | '')}
          >
            <option value="">انتخاب وضعیت</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {RESERVATION_STATUS_LABEL[option]}
              </option>
            ))}
          </select>
          <IconArrowDown className={styles.selectIcon} width={24} height={24} aria-hidden />
        </div>
      </div>

      <div className={styles.table}>
        <div className={[styles.tableHead, styles.reservationsGrid].join(' ')}>
          <span>شماره سفارش</span>
          <span>نام هتل</span>
          <span>تاریخ ورود</span>
          <span>تعداد اتاق</span>
          <span>وضعیت</span>
        </div>
        {rows.length === 0 ? (
          <p className={styles.empty}>موردی یافت نشد</p>
        ) : (
          rows.map((reservation) => (
            <div key={reservation.id} className={[styles.tableRow, styles.reservationsGrid].join(' ')}>
              <span>{reservation.orderNumber}</span>
              <span>{reservation.hotelName}</span>
              <span>{formatJalaliDisplay(reservation.checkIn)}</span>
              <span>{reservation.roomCount}</span>
              <StatusCell status={reservation.status} />
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function StatusCell({ status }: { status: ReservationStatus }) {
  if (status === 'awaitingPayment') {
    return (
      <div className={styles.statusCell}>
        <span className={[styles.statusLabel, styles.awaiting].join(' ')}>
          {RESERVATION_STATUS_LABEL.awaitingPayment}
        </span>
        <Button className={styles.statusButton}>پرداخت</Button>
      </div>
    )
  }

  if (status === 'paid') {
    return (
      <div className={styles.statusCell}>
        <span className={[styles.statusLabel, styles.paid].join(' ')}>{RESERVATION_STATUS_LABEL.paid}</span>
        <Button variant="secondary" className={styles.statusButton}>
          دریافت واچر
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.statusCell}>
      <span className={[styles.statusLabel, status === 'expired' ? styles.expired : styles.refunded].join(' ')}>
        {RESERVATION_STATUS_LABEL[status]}
      </span>
    </div>
  )
}
