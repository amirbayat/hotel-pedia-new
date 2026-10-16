import { useState } from 'react'
import type { ReactNode } from 'react'
import { MOCK_PROFILE, type ProfileAccount } from '../../api/mockProfile'
import { ProfileContext } from './profileContextValue'

/** In-memory profile. Refreshing the page restores the mock persona. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<ProfileAccount>(MOCK_PROFILE)

  const updateAccount = (patch: Partial<ProfileAccount>) => {
    setAccount((current) => ({ ...current, ...patch }))
  }

  return <ProfileContext.Provider value={{ account, updateAccount }}>{children}</ProfileContext.Provider>
}
