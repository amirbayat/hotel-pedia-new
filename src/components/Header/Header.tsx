import { useState } from 'react'
import { AccountMenu } from '../AccountMenu'
import { Button } from '../Button'
import { AuthModal } from '../AuthModal'
import { useAuth } from '../../context/authContextValue'
import { IconLogin } from '../icons'
import logo from '../../assets/logo.svg'
import styles from './Header.module.scss'

/**
 * Site header — matches the Hotelpedia homepage screenshot (2026-07-28).
 * Desktop/tablet only, 1408px content width.
 */
export function Header() {
  const { user, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.actions}>
          {user ? (
            <AccountMenu user={user} onLogout={logout} />
          ) : (
            <Button
              variant="secondary"
              icon={IconLogin}
              className={styles.loginButton}
              onClick={() => setAuthOpen(true)}
            >
              ورود - ثبت نام
            </Button>
          )}
        </div>

        <img src={logo} alt="هتل‌پدیا" className={styles.logo} />
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  )
}
