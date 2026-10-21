import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { IconArrowDown, IconCheckCircle, IconEdit } from '../../components/icons'
import {
  GENDER_LABEL,
  digitsOnly,
  formatCardNumber,
  type Gender,
  type ProfileAccount,
} from '../../api/mockProfile'
import { useProfile } from './profileContextValue'
import styles from './profile.module.scss'

type CardId = 'contact' | 'identity' | 'bank'
type AccountField = 'email' | 'phone' | 'firstName' | 'lastName' | 'nationalId' | 'cardNumber' | 'accountNumber' | 'sheba'
type AccountErrors = Partial<Record<AccountField, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^09\d{9}$/

function requiredError(label: string, value: string): string | undefined {
  return value.trim() ? undefined : `${label} را وارد کنید.`
}

function nameError(label: string, value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return `${label} را وارد کنید.`
  if (trimmed.length < 2 || /\d/.test(trimmed)) return `${label} را به‌درستی وارد کنید.`
  return undefined
}

function isValidNationalId(code: string): boolean {
  if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) return false
  const check = Number(code[9])
  const sum = code
    .slice(0, 9)
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (10 - index), 0)
  const remainder = sum % 11
  return remainder < 2 ? check === remainder : check === 11 - remainder
}

function isValidCardNumber(digits: string): boolean {
  if (!/^\d{16}$/.test(digits)) return false
  let sum = 0
  let doubleDigit = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let current = Number(digits[index])
    if (doubleDigit) {
      current *= 2
      if (current > 9) current -= 9
    }
    sum += current
    doubleDigit = !doubleDigit
  }
  return sum % 10 === 0
}

function isValidSheba(digits: string): boolean {
  if (!/^\d{24}$/.test(digits)) return false
  const rearranged = `${digits.slice(2)}1827${digits.slice(0, 2)}`
  let remainder = 0
  for (const character of rearranged) {
    remainder = (remainder * 10 + Number(character)) % 97
  }
  return remainder === 1
}

function validateCard(card: CardId, account: ProfileAccount): AccountErrors {
  if (card === 'contact') {
    const email = account.email.trim()
    return {
      phone: !account.phone
        ? 'شماره همراه را وارد کنید.'
        : PHONE_RE.test(account.phone)
          ? undefined
          : 'شماره همراه را به‌درستی وارد کنید.',
      email: !email ? 'ایمیل را وارد کنید.' : EMAIL_RE.test(email) ? undefined : 'ایمیل را به‌درستی وارد کنید.',
    }
  }

  if (card === 'identity') {
    return {
      firstName: nameError('نام', account.firstName),
      lastName: nameError('نام خانوادگی', account.lastName),
      nationalId: !account.nationalId
        ? 'کد ملی را وارد کنید.'
        : isValidNationalId(account.nationalId)
          ? undefined
          : 'کد ملی را به‌درستی وارد کنید.',
    }
  }

  return {
    accountNumber: requiredError('شماره حساب', account.accountNumber) ?? (
      /^\d{8,24}$/.test(account.accountNumber) ? undefined : 'شماره حساب را به‌درستی وارد کنید.'
    ),
    cardNumber: !account.cardNumber
      ? 'شماره کارت را وارد کنید.'
      : isValidCardNumber(account.cardNumber)
        ? undefined
        : 'شماره کارت را به‌درستی وارد کنید.',
    sheba: !account.sheba
      ? 'شماره شبا را وارد کنید.'
      : isValidSheba(account.sheba)
        ? undefined
        : 'شماره شبا را به‌درستی وارد کنید.',
  }
}

function hasErrors(errors: AccountErrors): boolean {
  return Object.values(errors).some(Boolean)
}

export function ProfileAccount() {
  const { account, updateAccount } = useProfile()
  const [editing, setEditing] = useState<CardId | null>(null)
  const [draft, setDraft] = useState<ProfileAccount>(account)
  const [errors, setErrors] = useState<AccountErrors>({})

  function begin(card: CardId) {
    setDraft(account)
    setErrors({})
    setEditing(card)
  }

  function cancel() {
    setDraft(account)
    setErrors({})
    setEditing(null)
  }

  function confirm() {
    if (!editing) return
    const nextErrors = validateCard(editing, draft)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return
    updateAccount(draft)
    setErrors({})
    setEditing(null)
  }

  function patch(partial: Partial<ProfileAccount>) {
    setDraft((current) => ({ ...current, ...partial }))
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(partial) as AccountField[]) delete next[key]
      return next
    })
  }

  const contactEditing = editing === 'contact'
  const identityEditing = editing === 'identity'
  const bankEditing = editing === 'bank'
  const source = editing ? draft : account

  return (
    <>
      <SectionCard
        title="اطلاعات حساب کاربری"
        editing={contactEditing}
        onEdit={() => begin('contact')}
        onCancel={cancel}
        onConfirm={confirm}
      >
        <div className={styles.fields}>
          <div className={styles.row}>
            <Input
              label="شماره همراه"
              value={source.phone}
              readOnly={!contactEditing}
              muted={!contactEditing}
              inputMode="numeric"
              className={[styles.verified, styles.ltrField].join(' ')}
              trailingIcon={source.phoneVerified && source.phone === account.phone ? IconCheckCircle : undefined}
              error={contactEditing ? errors.phone : undefined}
              onChange={(event) => patch({ phone: digitsOnly(event.target.value, 11) })}
            />
            <Input
              label="ایمیل"
              value={source.email}
              readOnly={!contactEditing}
              muted={!contactEditing}
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              className={styles.ltrField}
              error={contactEditing ? errors.email : undefined}
              onChange={(event) => patch({ email: event.target.value })}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="مشخصات"
        editing={identityEditing}
        onEdit={() => begin('identity')}
        onCancel={cancel}
        onConfirm={confirm}
      >
        <div className={styles.fields}>
          <div className={styles.row}>
            <Input
              label="نام"
              value={source.firstName}
              readOnly={!identityEditing}
              muted={!identityEditing}
              error={identityEditing ? errors.firstName : undefined}
              onChange={(event) => patch({ firstName: event.target.value })}
            />
            <Input
              label="نام خانوادگی"
              value={source.lastName}
              readOnly={!identityEditing}
              muted={!identityEditing}
              error={identityEditing ? errors.lastName : undefined}
              onChange={(event) => patch({ lastName: event.target.value })}
            />
          </div>
          <div className={styles.row}>
            {identityEditing ? (
              <GenderSelect value={source.gender} onChange={(gender) => patch({ gender })} />
            ) : (
              <Input label="جنسیت" value={GENDER_LABEL[source.gender]} readOnly muted />
            )}
            <Input
              label="کد ملی"
              value={source.nationalId}
              readOnly={!identityEditing}
              muted={!identityEditing}
              inputMode="numeric"
              className={styles.ltrField}
              error={identityEditing ? errors.nationalId : undefined}
              onChange={(event) => patch({ nationalId: digitsOnly(event.target.value, 10) })}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="اطلاعات حساب"
        editing={bankEditing}
        onEdit={() => begin('bank')}
        onCancel={cancel}
        onConfirm={confirm}
      >
        <div className={styles.fields}>
          <div className={styles.row}>
            <Input
              label="شماره حساب"
              value={source.accountNumber}
              readOnly={!bankEditing}
              muted={!bankEditing}
              inputMode="numeric"
              className={styles.ltrField}
              error={bankEditing ? errors.accountNumber : undefined}
              onChange={(event) => patch({ accountNumber: digitsOnly(event.target.value, 24) })}
            />
            <Input
              label="شماره کارت"
              value={formatCardNumber(source.cardNumber)}
              readOnly={!bankEditing}
              muted={!bankEditing}
              inputMode="numeric"
              className={styles.ltrField}
              error={bankEditing ? errors.cardNumber : undefined}
              onChange={(event) => patch({ cardNumber: digitsOnly(event.target.value, 16) })}
            />
          </div>
          <div className={styles.row}>
            <ShebaField
              value={source.sheba}
              readOnly={!bankEditing}
              error={bankEditing ? errors.sheba : undefined}
              onChange={(sheba) => patch({ sheba })}
            />
          </div>
        </div>
      </SectionCard>
    </>
  )
}

function SectionCard({
  title,
  editing,
  onEdit,
  onCancel,
  onConfirm,
  children,
}: {
  title: string
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onConfirm: () => void
  children: ReactNode
}) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {!editing && (
          <button type="button" className={styles.chip} onClick={onEdit}>
            <IconEdit width={24} height={24} aria-hidden />
            ویرایش
          </button>
        )}
      </header>
      {children}
      {editing && (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel}>
            انصراف
          </Button>
          <Button className={styles.confirmButton} onClick={onConfirm}>
            تایید
          </Button>
        </div>
      )}
    </section>
  )
}

function GenderSelect({ value, onChange }: { value: Gender; onChange: (gender: Gender) => void }) {
  return (
    <div>
      <div className={styles.selectLabel}>جنسیت</div>
      <div className={styles.selectBox}>
        <select
          className={styles.select}
          value={value}
          aria-label="جنسیت"
          onChange={(event) => onChange(event.target.value as Gender)}
        >
          <option value="male">مرد</option>
          <option value="female">زن</option>
        </select>
        <IconArrowDown className={styles.selectIcon} width={24} height={24} aria-hidden />
      </div>
    </div>
  )
}

function ShebaField({
  value,
  readOnly,
  error,
  onChange,
}: {
  value: string
  readOnly: boolean
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <div className={styles.shebaLabel}>شماره شبا</div>
      <div
        className={[styles.shebaBox, readOnly && styles.shebaReadOnly, error && styles.shebaError]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          className={styles.shebaInput}
          value={value}
          readOnly={readOnly}
          inputMode="numeric"
          aria-label="شماره شبا"
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(digitsOnly(event.target.value, 24))}
        />
        <span className={styles.ir}>IR</span>
      </div>
      {error ? <p className={styles.fieldError}>{error}</p> : null}
    </div>
  )
}
