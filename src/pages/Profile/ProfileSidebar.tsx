import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContextValue'
import {
  IconArrowLeft,
  IconLogout,
  IconPerson,
  IconShoppingBag,
  IconWallet,
} from '../../components/icons'
import type { IconComponent } from '../../components/icons/types'
import { useProfile } from './profileContextValue'
import styles from './ProfileLayout.module.scss'

interface NavItem {
  id: string
  label: string
  icon: IconComponent
  to?: string
  end?: boolean
}

const ITEMS: NavItem[] = [
  { id: 'account', label: 'حساب کاربری', icon: IconPerson, to: '/profile', end: true },
  { id: 'wallet', label: 'کیف پول', icon: IconWallet, to: '/profile/wallet' },
  { id: 'reservations', label: 'رزروهای من', icon: IconShoppingBag, to: '/profile/reservations' },
]

export function ProfileSidebar() {
  const { account } = useProfile()
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.identity}>
        <p className={styles.name}>
          {account.firstName} {account.lastName}
        </p>
        <span className={styles.phone}>{account.phone}</span>
      </div>

      <ul className={styles.menu}>
        {ITEMS.map((item) => (
          <li key={item.id}>
            {item.to ? (
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [styles.item, isActive && styles.itemActive].filter(Boolean).join(' ')
                }
              >
                <item.icon width={24} height={24} aria-hidden />
                <span className={styles.itemLabel}>{item.label}</span>
                <IconArrowLeft className={styles.chevron} width={24} height={24} aria-hidden />
              </NavLink>
            ) : (
              <button type="button" className={styles.item}>
                <item.icon width={24} height={24} aria-hidden />
                <span className={styles.itemLabel}>{item.label}</span>
                <IconArrowLeft className={styles.chevron} width={24} height={24} aria-hidden />
              </button>
            )}
          </li>
        ))}
        <li>
          <button
            type="button"
            className={[styles.item, styles.logout].join(' ')}
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            <IconLogout width={24} height={24} aria-hidden />
            <span className={styles.itemLabel}>خروج از حساب کاربری</span>
            <IconArrowLeft className={styles.chevron} width={24} height={24} aria-hidden />
          </button>
        </li>
      </ul>
    </aside>
  )
}
