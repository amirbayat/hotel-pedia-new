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

export function ProfileAccount() {
  const { account, updateAccount } = useProfile()
  const [editing, setEditing] = useState<CardId | null>(null)
  const [draft, setDraft] = useState<ProfileAccount>(account)

  function begin(card: CardId) {
    setDraft(account)
    setEditing(card)
  }

  function cancel() {
    setDraft(account)
    setEditing(null)
  }

  function confirm() {
    updateAccount(draft)
    setEditing(null)
  }

  function patch(partial: Partial<ProfileAccount>) {
    setDraft((current) => ({ ...current, ...partial }))
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
              trailingIcon={source.phoneVerified ? IconCheckCircle : undefined}
              onChange={(event) => patch({ phone: digitsOnly(event.target.value, 11) })}
            />
            <Input
              label="ایمیل"
              value={source.email}
              readOnly={!contactEditing}
              muted={!contactEditing}
              dir="ltr"
              className={styles.ltrField}
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
              onChange={(event) => patch({ firstName: event.target.value })}
            />
            <Input
              label="نام خانوادگی"
              value={source.lastName}
              readOnly={!identityEditing}
              muted={!identityEditing}
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
              onChange={(event) => patch({ accountNumber: digitsOnly(event.target.value, 24) })}
            />
            <Input
              label="شماره کارت"
              value={formatCardNumber(source.cardNumber)}
              readOnly={!bankEditing}
              muted={!bankEditing}
              inputMode="numeric"
              className={styles.ltrField}
              onChange={(event) => patch({ cardNumber: digitsOnly(event.target.value, 16) })}
            />
          </div>
          <div className={styles.row}>
            <ShebaField
              value={source.sheba}
              readOnly={!bankEditing}
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
  onChange,
}: {
  value: string
  readOnly: boolean
  onChange: (value: string) => void
}) {
  return (
    <div>
      <div className={styles.shebaLabel}>شماره شبا</div>
      <div className={[styles.shebaBox, readOnly && styles.shebaReadOnly].filter(Boolean).join(' ')}>
        <input
          className={styles.shebaInput}
          value={value}
          readOnly={readOnly}
          inputMode="numeric"
          aria-label="شماره شبا"
          onChange={(event) => onChange(digitsOnly(event.target.value, 24))}
        />
        <span className={styles.ir}>IR</span>
      </div>
    </div>
  )
}
