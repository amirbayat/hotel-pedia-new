import { useEffect, useRef, useState } from 'react'
import type { IconComponent } from '../icons/types'
import { IconFavorits, IconLogout, IconPeople, IconPerson, IconReceipt, IconSettingsAccount, IconWallet } from '../icons'
import styles from './AccountMenu.module.scss'

export interface AccountMenuUser {
  name: string
  phone: string
  walletBalance: number
}

export interface AccountMenuItem {
  id: string
  label: string
  icon: IconComponent
}

const DEFAULT_ITEMS: AccountMenuItem[] = [
  { id: 'account', label: 'حساب کاربری', icon: IconSettingsAccount },
  { id: 'wallet', label: 'کیف پول', icon: IconWallet },
  { id: 'vouchers', label: 'واچرهای من', icon: IconReceipt },
  { id: 'travelers', label: 'لیست مسافران', icon: IconPeople },
  { id: 'favorites', label: 'لیست علاقه‌مندی‌ها', icon: IconFavorits },
]

export interface AccountMenuProps {
  user: AccountMenuUser
  items?: AccountMenuItem[]
  activeItemId?: string
  onSelectItem?: (id: string) => void
  onLogout?: () => void
  className?: string
}

function formatToman(value: number) {
  return `${value.toLocaleString('en-US')} تومان`
}

/** Header account/profile dropdown — matches the "Profile menu" screenshot. */
export function AccountMenu({ user, items = DEFAULT_ITEMS, activeItemId, onSelectItem, onLogout, className }: AccountMenuProps) {
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

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((open) => !open)}
        aria-label="حساب کاربری"
        aria-expanded={isOpen}
      >
        <IconPerson width={24} height={24} />
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userPhone}>{user.phone}</span>
          </div>

          <div className={styles.walletBalance}>{formatToman(user.walletBalance)}</div>

          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={[styles.item, item.id === activeItemId && styles.itemActive].filter(Boolean).join(' ')}
                  onClick={() => {
                    onSelectItem?.(item.id)
                    setIsOpen(false)
                  }}
                >
                  <item.icon width={24} height={24} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className={styles.item}
                onClick={() => {
                  onLogout?.()
                  setIsOpen(false)
                }}
              >
                <IconLogout width={24} height={24} />
                <span>خروج</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
