import { Navigate, Outlet } from 'react-router-dom'
import { Header } from '../../components/Header'
import { useAuth } from '../../context/authContextValue'
import { ProfileProvider } from './ProfileContext'
import { ProfileSidebar } from './ProfileSidebar'
import styles from './ProfileLayout.module.scss'

export function ProfileLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />

  return (
    <ProfileProvider>
      <div className={styles.page}>
        <Header />
        <div className={styles.shell}>
          <ProfileSidebar />
          <div className={styles.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </ProfileProvider>
  )
}
