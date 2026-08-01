import { createContext, useContext } from 'react'
import type { AccountMenuUser } from '../components/AccountMenu'

export interface AuthContextValue {
  user: AccountMenuUser | null
  login: (user: AccountMenuUser) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
