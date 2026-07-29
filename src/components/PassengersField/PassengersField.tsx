import { useEffect, useRef, useState } from 'react'
import { toPersianDigits } from '../../lib/date/jalali'
import { Input } from '../Input'
import { IconArrowDown, IconPerson, IconPlus } from '../icons'
import styles from './PassengersField.module.scss'

export interface PassengersValue {
  adults: number
  /** One age (0-17) per child, in display order. */
  childrenAges: number[]
  rooms: number
}

export interface PassengersFieldProps {
  className?: string
  value: PassengersValue
  onChange: (value: PassengersValue) => void
}

const MIN_ADULTS = 1
const MAX_ADULTS = 10
const MIN_CHILDREN = 0
const MAX_CHILDREN = 10
const MIN_ROOMS = 1
const MAX_ROOMS = 10
const DEFAULT_CHILD_AGE = 0
const AGE_OPTIONS = Array.from({ length: 18 }, (_, age) => age)

function formatSummary(value: PassengersValue): string {
  const parts = [`${toPersianDigits(value.adults)} بزرگسال`]
  if (value.childrenAges.length > 0) {
    parts.push(`${toPersianDigits(value.childrenAges.length)} کودک`)
  }
  parts.push(`${toPersianDigits(value.rooms)} اتاق`)
  return parts.join(' - ')
}

/** "مسافران" field — passenger counts (adults/children + per-child age) and room count. */
export function PassengersField({ className, value, onChange }: PassengersFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleOutsideClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  function setAdults(adults: number) {
    onChange({ ...value, adults })
  }

  function setRooms(rooms: number) {
    onChange({ ...value, rooms })
  }

  function setChildrenCount(count: number) {
    const childrenAges = value.childrenAges.slice(0, count)
    while (childrenAges.length < count) childrenAges.push(DEFAULT_CHILD_AGE)
    onChange({ ...value, childrenAges })
  }

  function setChildAge(index: number, age: number) {
    const childrenAges = value.childrenAges.map((existing, i) => (i === index ? age : existing))
    onChange({ ...value, childrenAges })
  }

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')} ref={wrapperRef}>
      <Input
        label="مسافران"
        placeholder="تعداد مسافران"
        leadingIcon={IconPerson}
        trailingIcon={IconArrowDown}
        value={formatSummary(value)}
        onFocus={() => setIsOpen(true)}
        readOnly
      />

      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.row}>
            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.stepperButton}
                onClick={() => setAdults(Math.max(MIN_ADULTS, value.adults - 1))}
                disabled={value.adults <= MIN_ADULTS}
                aria-label="کاهش تعداد بزرگسال"
              >
                −
              </button>
              <span className={styles.stepperValue}>{toPersianDigits(value.adults)}</span>
              <button
                type="button"
                className={styles.stepperButton}
                onClick={() => setAdults(Math.min(MAX_ADULTS, value.adults + 1))}
                disabled={value.adults >= MAX_ADULTS}
                aria-label="افزایش تعداد بزرگسال"
              >
                <IconPlus width={14} height={14} aria-hidden />
              </button>
            </div>
            <div className={styles.rowLabel}>
              <span className={styles.rowTitle}>بزرگسال</span>
              <span className={styles.rowHint}>(بالای ۱۸ سال)</span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.row}>
            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.stepperButton}
                onClick={() => setChildrenCount(Math.max(MIN_CHILDREN, value.childrenAges.length - 1))}
                disabled={value.childrenAges.length <= MIN_CHILDREN}
                aria-label="کاهش تعداد کودک"
              >
                −
              </button>
              <span className={styles.stepperValue}>{toPersianDigits(value.childrenAges.length)}</span>
              <button
                type="button"
                className={styles.stepperButton}
                onClick={() => setChildrenCount(Math.min(MAX_CHILDREN, value.childrenAges.length + 1))}
                disabled={value.childrenAges.length >= MAX_CHILDREN}
                aria-label="افزایش تعداد کودک"
              >
                <IconPlus width={14} height={14} aria-hidden />
              </button>
            </div>
            <div className={styles.rowLabel}>
              <span className={styles.rowTitle}>کودک</span>
              <span className={styles.rowHint}>(زیر ۱۸ سال)</span>
            </div>
          </div>

          {value.childrenAges.map((age, index) => (
            <div className={styles.row} key={index}>
              <div className={styles.ageSelectWrapper}>
                <IconArrowDown className={styles.ageSelectChevron} width={16} height={16} aria-hidden />
                <select
                  className={styles.ageSelect}
                  value={age}
                  onChange={(event) => setChildAge(index, Number(event.target.value))}
                  aria-label={`سن کودک ${index + 1}`}
                >
                  {AGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {toPersianDigits(option)}
                    </option>
                  ))}
                </select>
              </div>
              <span className={styles.rowTitle}>{`سن کودک ${toPersianDigits(index + 1)}`}</span>
            </div>
          ))}

          <div className={styles.divider} />

          <div className={styles.row}>
            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.stepperButton}
                onClick={() => setRooms(Math.max(MIN_ROOMS, value.rooms - 1))}
                disabled={value.rooms <= MIN_ROOMS}
                aria-label="کاهش تعداد اتاق"
              >
                −
              </button>
              <span className={styles.stepperValue}>{toPersianDigits(value.rooms)}</span>
              <button
                type="button"
                className={styles.stepperButton}
                onClick={() => setRooms(Math.min(MAX_ROOMS, value.rooms + 1))}
                disabled={value.rooms >= MAX_ROOMS}
                aria-label="افزایش تعداد اتاق"
              >
                <IconPlus width={14} height={14} aria-hidden />
              </button>
            </div>
            <span className={styles.rowTitle}>اتاق</span>
          </div>
        </div>
      )}
    </div>
  )
}
