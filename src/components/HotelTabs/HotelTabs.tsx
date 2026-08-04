import { useState } from 'react'
import styles from './HotelTabs.module.scss'

export interface HotelTab {
  id: string
  label: string
}

export interface HotelTabsProps {
  tabs: HotelTab[]
}

/** Section nav — matches Figma "Hotel detail" node 654:11557 (tabs render right-to-left). */
export function HotelTabs({ tabs }: HotelTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id)

  function handleClick(id: string) {
    setActiveId(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={[styles.tab, tab.id === activeId && styles.tabActive].filter(Boolean).join(' ')}
          onClick={() => handleClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
