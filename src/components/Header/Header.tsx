import { useState } from 'react'
import { Button } from '../Button'
import { AuthModal } from '../AuthModal'
import { IconHelp, IconPerson } from '../icons'
import styles from './Header.module.scss'

/**
 * Site header — matches the Hotelpedia homepage screenshot (2026-07-28).
 * Desktop/tablet only, 1408px content width.
 */
export function Header() {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.actions}>
          <Button variant="secondary" icon={IconPerson} onClick={() => setAuthOpen(true)}>
            ورود - ثبت نام
          </Button>
          <Button variant="secondary" icon={IconHelp} aria-label="پشتیبانی" />
        </div>

        {/* TODO: swap for the real Hotelpedia logo SVG once provided */}
        <div className={styles.logo}>هتل‌پدیا</div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  )
}
