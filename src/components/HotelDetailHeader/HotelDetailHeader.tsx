import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccountMenu } from '../AccountMenu'
import { AuthModal } from '../AuthModal'
import { Button } from '../Button'
import { useAuth } from '../../context/authContextValue'
import { IconBack, IconCallCenter, IconDehaze } from '../icons'
import logo from '../../assets/logo.svg'
import styles from './HotelDetailHeader.module.scss'

/** Compact top bar for the hotel-detail page — matches Figma "Hotel detail" node 610:10022. */
export function HotelDetailHeader() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.leftActions}>
          <Button variant="secondary" icon={IconBack} aria-label="بازگشت" onClick={() => navigate(-1)} />
          <Button variant="secondary" icon={IconCallCenter} aria-label="پشتیبانی" />
        </div>

        <div className={styles.rightActions}>
          <img src={logo} alt="هتل‌پدیا" className={styles.logo} />

          {user ? (
            <AccountMenu user={user} onLogout={logout} />
          ) : (
            <button type="button" className={styles.menuButton} onClick={() => setAuthOpen(true)} aria-label="منو">
              <IconDehaze width={24} height={24} />
            </button>
          )}
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  )
}
