import { Link, useNavigate } from 'react-router-dom'
import { AccountMenu } from '../AccountMenu'
import { Button } from '../Button'
import { useAuth } from '../../context/authContextValue'
import { IconBack } from '../icons'
import logo from '../../assets/logo.svg'
import styles from './HotelDetailHeader.module.scss'

/** Compact top bar for the hotel-detail page — matches Figma "Hotel detail" node 610:10022. */
export function HotelDetailHeader() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.leftActions}>
          {user ? <AccountMenu user={user} onLogout={logout} /> : null}
        </div>

        <div className={styles.rightActions}>
          <Link to="/" aria-label="هتل‌پدیا">
            <img src={logo} alt="هتل‌پدیا" className={styles.logo} />
          </Link>
          <Button variant="secondary" icon={IconBack} aria-label="بازگشت" onClick={() => navigate(-1)} />
        </div>
      </div>
    </header>
  )
}
