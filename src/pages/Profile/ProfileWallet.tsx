import { useEffect, useMemo, useRef, useState } from 'react'
import { DateRangeCalendar } from '../../components/DateRangeCalendar'
import type { DateRange } from '../../components/DateRangeCalendar'
import { IconArrowDown, IconCalendar, IconDownload } from '../../components/icons'
import { formatJalaliDisplay, type JalaliCursor } from '../../lib/date/jalali'
import {
  MOCK_TRANSACTIONS,
  MOCK_WALLET_BALANCE,
  TRANSACTION_TYPE_LABEL,
  type TransactionType,
  type WalletTransaction,
} from '../../api/mockProfile'
import styles from './profile.module.scss'

const TYPE_OPTIONS: TransactionType[] = ['deposit', 'withdraw']

function formatAmount(value: number) {
  return value.toLocaleString('en-US')
}

function inRange(date: string, range: DateRange) {
  if (!range.from) return true
  if (date < range.from) return false
  if (range.to && date > range.to) return false
  return true
}

function formatRangeLabel(range: DateRange) {
  if (!range.from) return ''
  const from = formatJalaliDisplay(range.from)
  if (!range.to || range.to === range.from) return from
  return `${from} - ${formatJalaliDisplay(range.to)}`
}

export function ProfileWallet() {
  const [type, setType] = useState<TransactionType | ''>('')
  const [range, setRange] = useState<DateRange>({ from: null, to: null })
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [cursor, setCursor] = useState<JalaliCursor>({ jy: 1405, jm: 4 })
  const dateFieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!calendarOpen) return
    function handlePointerDown(event: MouseEvent) {
      if (dateFieldRef.current && !dateFieldRef.current.contains(event.target as Node)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [calendarOpen])

  const rows = useMemo(
    () => MOCK_TRANSACTIONS.filter((transaction) => (!type || transaction.type === type) && inRange(transaction.date, range)),
    [type, range],
  )

  const rangeLabel = formatRangeLabel(range)

  return (
    <>
      <section className={styles.balance}>
        <h2 className={styles.cardTitle}>موجودی کیف پول</h2>
        <p className={styles.balanceAmount}>
          {formatAmount(MOCK_WALLET_BALANCE)}
          <span className={styles.balanceUnit}>تومان</span>
        </p>
      </section>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>تاریخچه تراکنش‌ها</h2>
          <button type="button" className={styles.chip} onClick={() => downloadTransactions(rows)}>
            <IconDownload width={24} height={24} aria-hidden />
            خروجی اکسل
          </button>
        </header>

        <div className={styles.filters}>
          <div className={styles.selectBox}>
            <select
              className={[styles.select, !type && styles.placeholder].filter(Boolean).join(' ')}
              value={type}
              aria-label="نوع تراکنش"
              onChange={(event) => setType(event.target.value as TransactionType | '')}
            >
              <option value="">نوع تراکنش را انتخاب کنید</option>
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {TRANSACTION_TYPE_LABEL[option]}
                </option>
              ))}
            </select>
            <IconArrowDown className={styles.selectIcon} width={24} height={24} aria-hidden />
          </div>
          <div className={styles.dateField} ref={dateFieldRef}>
            <button
              type="button"
              className={styles.dateButton}
              aria-expanded={calendarOpen}
              onClick={() => setCalendarOpen((open) => !open)}
            >
              <span className={rangeLabel ? styles.dateValue : styles.datePlaceholder}>
                {rangeLabel || 'بازه زمانی را انتخاب کنید'}
              </span>
              <IconCalendar className={styles.dateIcon} width={24} height={24} aria-hidden />
            </button>
            {calendarOpen && (
              <div className={styles.popover}>
                <DateRangeCalendar
                  value={range}
                  onChange={setRange}
                  minDate="2024-01-01"
                  cursor={cursor}
                  onCursorChange={setCursor}
                  onConfirm={() => setCalendarOpen(false)}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.table}>
          <div className={[styles.tableHead, styles.walletGrid].join(' ')}>
            <span>تاریخ</span>
            <span>ساعت</span>
            <span>نوع</span>
            <span>مبلغ (تومان)</span>
            <span>توضیحات</span>
          </div>
          {rows.length === 0 ? (
            <p className={styles.empty}>موردی یافت نشد</p>
          ) : (
            rows.map((transaction) => (
              <div key={transaction.id} className={[styles.tableRow, styles.walletGrid].join(' ')}>
                <span>{formatJalaliDisplay(transaction.date)}</span>
                <span>{transaction.time}</span>
                <span className={transaction.type === 'deposit' ? styles.deposit : undefined}>
                  {TRANSACTION_TYPE_LABEL[transaction.type]}
                </span>
                <span>{formatAmount(transaction.amount)}</span>
                <span>{transaction.description}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}

function downloadTransactions(rows: WalletTransaction[]) {
  const header = ['تاریخ', 'ساعت', 'نوع', 'مبلغ (تومان)', 'توضیحات']
  const lines = rows.map((row) =>
    [formatJalaliDisplay(row.date), row.time, TRANSACTION_TYPE_LABEL[row.type], String(row.amount), row.description].join(','),
  )
  const csv = `\uFEFF${[header.join(','), ...lines].join('\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'wallet-transactions.csv'
  link.click()
  URL.revokeObjectURL(url)
}
