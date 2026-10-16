import { createContext, useContext } from 'react'
import type { ProfileAccount } from '../../api/mockProfile'

export interface ProfileContextValue {
  account: ProfileAccount
  updateAccount: (patch: Partial<ProfileAccount>) => void
}

export const ProfileContext = createContext<ProfileContextValue | null>(null)

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile must be used within a ProfileProvider')
  return context
}
