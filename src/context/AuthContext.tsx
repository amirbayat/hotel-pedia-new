import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AccountMenuUser } from '../components/AccountMenu'
import { AuthContext } from './authContextValue'

const STORAGE_KEY = 'hotelpedia:auth-user'

function readStoredUser(): AccountMenuUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AccountMenuUser) : null
  } catch {
    return null
  }
}

/**
 * App-wide logged-in user — every header (Home, listing, ...) reads this to
 * decide whether to show "ورود - ثبت نام" or the account menu. `AuthModal`
 * calls `login()` once OTP verification succeeds.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountMenuUser | null>(readStoredUser)

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  return <AuthContext.Provider value={{ user, login: setUser, logout: () => setUser(null) }}>{children}</AuthContext.Provider>
}
